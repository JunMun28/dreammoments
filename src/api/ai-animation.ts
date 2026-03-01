import { fal } from "@fal-ai/client";
import { createServerFn } from "@tanstack/react-start";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { getDbOrNull, schema } from "@/db/index";
import { requireAuth } from "@/lib/server-auth";
import { ApiError } from "./errors";
import { contentHash, uploadToR2 } from "./r2";
import { parseInput } from "./validate";

// ── Constants ────────────────────────────────────────────────────────

const MAX_LIVING_PORTRAIT_GENERATIONS = 8;

const ANIMATION_PROMPT =
	"Gentle, subtle animation. Soft breeze through hair, very slight natural breathing movement. " +
	"Elegant, dreamlike quality. Keep the scene mostly still with only minimal, graceful motion.";

const VIDEO_MODEL = "fal-ai/kling-video/v2.6/pro/image-to-video";

// ── Input schemas ────────────────────────────────────────────────────

const submitAnimationSchema = z.object({
	invitationId: z.string().uuid(),
	token: z.string().min(1, "Token is required"),
});

const animationStatusSchema = z.object({
	jobId: z.string().uuid(),
	token: z.string().min(1, "Token is required"),
});

// ── Configure fal.ai ─────────────────────────────────────────────────

function configureFal() {
	const key = process.env.FAL_KEY;
	if (!key) throw ApiError.unavailable("AI video service not configured");
	fal.config({ credentials: key });
}

// ── Submit animation job ─────────────────────────────────────────────

export const submitAnimationFn = createServerFn({
	method: "POST",
})
	.inputValidator(
		(data: { invitationId: string; token: string }) =>
			parseInput(submitAnimationSchema, data),
	)
	.handler(async ({ data }) => {
		const { userId } = await requireAuth(data.token);

		const db = getDbOrNull();
		if (!db) throw ApiError.unavailable("Database not available");

		// Verify ownership
		const rows = await db
			.select({ content: schema.invitations.content })
			.from(schema.invitations)
			.where(
				and(
					eq(schema.invitations.id, data.invitationId),
					eq(schema.invitations.userId, userId),
				),
			);

		if (rows.length === 0) {
			throw ApiError.forbidden("Invitation not found or access denied");
		}

		const content = rows[0].content as Record<string, unknown>;
		const hero = content?.hero as Record<string, unknown> | undefined;
		const avatarImageUrl = hero?.avatarImageUrl as string | undefined;

		if (!avatarImageUrl) {
			throw ApiError.badRequest(
				"Generate an avatar first before animating",
			);
		}

		// Rate limit check
		const countResult = await db
			.select({ count: sql<number>`count(*)::int` })
			.from(schema.aiGenerations)
			.where(
				and(
					eq(schema.aiGenerations.invitationId, data.invitationId),
					sql`${schema.aiGenerations.sectionId} IN ('hero-avatar', 'hero-animation')`,
					eq(schema.aiGenerations.accepted, true),
				),
			);

		const usedGenerations = countResult[0]?.count ?? 0;
		if (usedGenerations >= MAX_LIVING_PORTRAIT_GENERATIONS) {
			throw ApiError.rateLimit(
				`Living portrait generation limit reached (${MAX_LIVING_PORTRAIT_GENERATIONS} max).`,
			);
		}

		// Submit video generation job to fal.ai
		configureFal();

		const { request_id } = await fal.queue.submit(VIDEO_MODEL, {
			input: {
				image_url: avatarImageUrl,
				prompt: ANIMATION_PROMPT,
			},
		});

		// Record job in aiGenerations table
		const inserted = await db
			.insert(schema.aiGenerations)
			.values({
				invitationId: data.invitationId,
				sectionId: "hero-animation",
				prompt: ANIMATION_PROMPT,
				generatedContent: { requestId: request_id },
				accepted: false,
				status: "processing",
				externalJobId: request_id,
			})
			.returning({ id: schema.aiGenerations.id });

		return {
			jobId: inserted[0].id,
			status: "processing" as const,
			remaining: MAX_LIVING_PORTRAIT_GENERATIONS - usedGenerations - 1,
		};
	});

// ── Poll animation status ────────────────────────────────────────────

export const getAnimationStatusFn = createServerFn({
	method: "GET",
})
	.inputValidator(
		(data: { jobId: string; token: string }) =>
			parseInput(animationStatusSchema, data),
	)
	.handler(async ({ data }) => {
		const { userId } = await requireAuth(data.token);

		const db = getDbOrNull();
		if (!db) throw ApiError.unavailable("Database not available");

		// Get the generation record
		const rows = await db
			.select()
			.from(schema.aiGenerations)
			.where(eq(schema.aiGenerations.id, data.jobId));

		if (rows.length === 0) {
			throw ApiError.notFound("Animation job not found");
		}

		const job = rows[0];

		// Verify ownership via the invitation
		const invRows = await db
			.select({ userId: schema.invitations.userId })
			.from(schema.invitations)
			.where(eq(schema.invitations.id, job.invitationId));

		if (invRows.length === 0 || invRows[0].userId !== userId) {
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
			configureFal();

			try {
				const status = await fal.queue.status(VIDEO_MODEL, {
					requestId: job.externalJobId,
					logs: false,
				});

				if (
					status.status === "COMPLETED" ||
					status.status === "completed"
				) {
					// Fetch the result
					const result = await fal.queue.result(VIDEO_MODEL, {
						requestId: job.externalJobId,
					});

					const video = (result as { video?: { url: string } })
						.video;
					if (!video?.url) {
						await db
							.update(schema.aiGenerations)
							.set({ status: "failed" })
							.where(eq(schema.aiGenerations.id, data.jobId));
						return { status: "failed" as const };
					}

					// Download video from fal.ai temporary URL and upload to R2
					const videoResponse = await fetch(video.url);
					if (!videoResponse.ok) {
						await db
							.update(schema.aiGenerations)
							.set({ status: "failed" })
							.where(eq(schema.aiGenerations.id, data.jobId));
						return { status: "failed" as const };
					}

					const videoBuffer = Buffer.from(
						await videoResponse.arrayBuffer(),
					);
					const hash = contentHash(videoBuffer);
					const key = `animations/${job.invitationId}/${hash}.mp4`;
					const animatedVideoUrl = await uploadToR2(
						key,
						videoBuffer,
						"video/mp4",
					);

					// Update the generation record
					await db
						.update(schema.aiGenerations)
						.set({
							status: "completed",
							accepted: true,
							resultUrl: animatedVideoUrl,
						})
						.where(eq(schema.aiGenerations.id, data.jobId));

					return {
						status: "completed" as const,
						animatedVideoUrl,
					};
				}

				if (
					status.status === "FAILED" ||
					status.status === "failed"
				) {
					await db
						.update(schema.aiGenerations)
						.set({ status: "failed" })
						.where(eq(schema.aiGenerations.id, data.jobId));
					return { status: "failed" as const };
				}

				// Still processing
				return { status: "processing" as const };
			} catch {
				// If polling fails, still return processing to allow retry
				return { status: "processing" as const };
			}
		}

		return { status: job.status as "processing" | "completed" | "failed" };
	});
