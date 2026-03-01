import { fal } from "@fal-ai/client";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDbOrNull, schema } from "@/db/index";
import { SECTION_HERO_ANIMATION } from "@/lib/hero-content";
import { requireAuth } from "@/lib/server-auth";
import {
	assertAllowedUrl,
	claimGenerationSlot,
	completeGenerationSlot,
	ensureFalConfigured,
	failGenerationSlot,
	fetchVideoWithSizeLimit,
	parseHeroContent,
	verifyInvitationOwnership,
} from "./ai-shared";
import { ApiError } from "./errors";
import { contentHash, deleteFromR2, extractR2Key, uploadToR2 } from "./r2";
import { parseInput } from "./validate";

// ── Constants ────────────────────────────────────────────────────────

const ANIMATION_PROMPT =
	"Gentle, subtle animation. Soft breeze through hair, very slight natural breathing movement. " +
	"Elegant, dreamlike quality. Keep the scene mostly still with only minimal, graceful motion.";

const VIDEO_MODEL = "fal-ai/kling-video/v2.1/pro/image-to-video";

// ── Input schemas ────────────────────────────────────────────────────

const submitAnimationSchema = z.object({
	invitationId: z.string().uuid(),
	token: z.string().min(1, "Token is required"),
});

const animationStatusSchema = z.object({
	jobId: z.string().uuid(),
	token: z.string().min(1, "Token is required"),
});

const removeAnimationSchema = z.object({
	invitationId: z.string().uuid(),
	token: z.string().min(1, "Token is required"),
});

// ── Submit animation job ─────────────────────────────────────────────

export const submitAnimationFn = createServerFn({
	method: "POST",
})
	.inputValidator((data: { invitationId: string; token: string }) =>
		parseInput(submitAnimationSchema, data),
	)
	.handler(async ({ data }) => {
		const { userId } = await requireAuth(data.token);

		const db = getDbOrNull();
		if (!db) throw ApiError.unavailable("Database not available");

		const content = await verifyInvitationOwnership(
			db,
			data.invitationId,
			userId,
		);
		const hero = parseHeroContent(content);

		if (!hero.avatarImageUrl) {
			throw ApiError.badRequest("Generate an avatar first before animating");
		}

		// Validate avatar URL against allowlist
		assertAllowedUrl(hero.avatarImageUrl, "Avatar image");

		// Claim a rate-limit slot atomically (TOCTOU-safe)
		const slotId = await claimGenerationSlot(
			db,
			data.invitationId,
			SECTION_HERO_ANIMATION,
			ANIMATION_PROMPT,
		);

		try {
			// Submit video generation job to fal.ai
			ensureFalConfigured();

			const { request_id } = await fal.queue.submit(VIDEO_MODEL, {
				input: {
					image_url: hero.avatarImageUrl,
					prompt: ANIMATION_PROMPT,
				},
			});

			// Update the claimed slot with the external job ID
			await db
				.update(schema.aiGenerations)
				.set({
					generatedContent: { requestId: request_id },
					externalJobId: request_id,
				})
				.where(eq(schema.aiGenerations.id, slotId));

			return {
				jobId: slotId,
				status: "processing" as const,
				remaining: 0, // Will be recalculated on next check
			};
		} catch (err) {
			await failGenerationSlot(db, slotId).catch(() => {});
			throw err;
		}
	});

// ── Poll animation status ────────────────────────────────────────────

export const getAnimationStatusFn = createServerFn({
	method: "GET",
})
	.inputValidator((data: { jobId: string; token: string }) =>
		parseInput(animationStatusSchema, data),
	)
	.handler(async ({ data }) => {
		const { userId } = await requireAuth(data.token);

		const db = getDbOrNull();
		if (!db) throw ApiError.unavailable("Database not available");

		// Single JOIN query instead of two sequential queries
		const rows = await db
			.select({
				id: schema.aiGenerations.id,
				invitationId: schema.aiGenerations.invitationId,
				status: schema.aiGenerations.status,
				externalJobId: schema.aiGenerations.externalJobId,
				resultUrl: schema.aiGenerations.resultUrl,
				invUserId: schema.invitations.userId,
			})
			.from(schema.aiGenerations)
			.innerJoin(
				schema.invitations,
				eq(schema.aiGenerations.invitationId, schema.invitations.id),
			)
			.where(eq(schema.aiGenerations.id, data.jobId));

		if (rows.length === 0) {
			throw ApiError.notFound("Animation job not found");
		}

		const job = rows[0];

		if (job.invUserId !== userId) {
			throw ApiError.forbidden("Access denied");
		}

		// If already completed or failed, return cached result
		if (job.status === "completed" && job.resultUrl) {
			return {
				status: "completed" as const,
				animatedVideoUrl: job.resultUrl,
			};
		}

		if (job.status === "failed") {
			return { status: "failed" as const };
		}

		// Poll fal.ai for current status
		if (job.status === "processing" && job.externalJobId) {
			ensureFalConfigured();

			try {
				const status = await fal.queue.status(VIDEO_MODEL, {
					requestId: job.externalJobId,
					logs: false,
				});

				if (status.status === "COMPLETED") {
					// Fetch the result
					const result = await fal.queue.result(VIDEO_MODEL, {
						requestId: job.externalJobId,
					});

					const video = (result as { video?: { url: string } }).video;
					if (!video?.url) {
						await db
							.update(schema.aiGenerations)
							.set({ status: "failed" })
							.where(eq(schema.aiGenerations.id, data.jobId));
						return { status: "failed" as const };
					}

					// Download video with size limit
					const videoBuffer = await fetchVideoWithSizeLimit(
						video.url,
						"generated video",
					);
					const hash = contentHash(videoBuffer);
					const key = `animations/${job.invitationId}/${hash}.mp4`;

					// Delete old video from R2 before uploading new one
					const invRows = await db
						.select({ content: schema.invitations.content })
						.from(schema.invitations)
						.where(eq(schema.invitations.id, job.invitationId));

					if (invRows[0]) {
						const heroContent = parseHeroContent(
							invRows[0].content as Record<string, unknown>,
						);
						if (heroContent.animatedVideoUrl) {
							const oldKey = extractR2Key(heroContent.animatedVideoUrl);
							if (oldKey) {
								await deleteFromR2(oldKey).catch(() => {});
							}
						}
					}

					const animatedVideoUrl = await uploadToR2(
						key,
						videoBuffer,
						"video/mp4",
					);

					// Update the generation record
					await completeGenerationSlot(db, data.jobId, {
						generatedContent: {
							requestId: job.externalJobId,
							url: animatedVideoUrl,
						},
						resultUrl: animatedVideoUrl,
					});

					return {
						status: "completed" as const,
						animatedVideoUrl,
					};
				}

				// Still in queue or in progress
				return { status: "processing" as const };
			} catch {
				// fal.ai throws on failures — mark as failed
				await db
					.update(schema.aiGenerations)
					.set({ status: "failed" })
					.where(eq(schema.aiGenerations.id, data.jobId));
				return { status: "failed" as const };
			}
		}

		return { status: job.status as "processing" | "completed" | "failed" };
	});

// ── Remove Animation ────────────────────────────────────────────────

export const removeAnimationFn = createServerFn({
	method: "POST",
})
	.inputValidator((data: { invitationId: string; token: string }) =>
		parseInput(removeAnimationSchema, data),
	)
	.handler(async ({ data }) => {
		const { userId } = await requireAuth(data.token);

		const db = getDbOrNull();
		if (!db) throw ApiError.unavailable("Database not available");

		const content = await verifyInvitationOwnership(
			db,
			data.invitationId,
			userId,
		);
		const hero = parseHeroContent(content);

		// Delete video from R2
		if (hero.animatedVideoUrl) {
			const videoKey = extractR2Key(hero.animatedVideoUrl);
			if (videoKey) {
				await deleteFromR2(videoKey).catch(() => {});
			}
		}

		// Patch invitation content: clear video field
		const updatedHero = {
			...((content.hero as Record<string, unknown>) ?? {}),
		};
		delete updatedHero.animatedVideoUrl;

		await db
			.update(schema.invitations)
			.set({
				content: { ...content, hero: updatedHero },
				updatedAt: new Date(),
			})
			.where(eq(schema.invitations.id, data.invitationId));

		return { success: true };
	});
