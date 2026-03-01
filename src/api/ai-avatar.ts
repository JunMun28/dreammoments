import { fal } from "@fal-ai/client";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDbOrNull, schema } from "@/db/index";
import { SECTION_HERO_AVATAR } from "@/lib/hero-content";
import { requireAuth } from "@/lib/server-auth";
import {
	assertAllowedUrl,
	checkLivingPortraitQuota,
	claimGenerationSlot,
	completeGenerationSlot,
	ensureFalConfigured,
	failGenerationSlot,
	fetchImageWithSizeLimit,
	parseHeroContent,
	verifyInvitationOwnership,
} from "./ai-shared";
import { ApiError } from "./errors";
import { contentHash, deleteFromR2, extractR2Key, uploadToR2 } from "./r2";
import { parseInput } from "./validate";

// ── Constants ────────────────────────────────────────────────────────

const STYLE_PROMPTS: Record<"pixar" | "ghibli", string> = {
	pixar:
		"Transform this couple photo into a cute Pixar 3D animated portrait. " +
		"CRITICAL: Preserve the person's exact facial features, face shape, skin tone, hairstyle, hair color, and expression. " +
		"The character must be clearly recognizable as the same person. " +
		"Soft romantic lighting, warm tones, wedding-appropriate setting. High quality, detailed, elegant.",
	ghibli:
		"Transform this couple photo into a beautiful Studio Ghibli anime style animated portrait. " +
		"CRITICAL: Preserve the person's exact facial features, face shape, skin tone, hairstyle, hair color, and expression. " +
		"The character must be clearly recognizable as the same person. " +
		"Soft romantic lighting, warm tones, wedding-appropriate setting. High quality, detailed, elegant.",
};

// ── Input schemas ───────────────────────────────────────────────────

const generateAvatarSchema = z.object({
	invitationId: z.string().uuid(),
	style: z.enum(["pixar", "ghibli"]),
	token: z.string().min(1, "Token is required"),
});

const removeAvatarSchema = z.object({
	invitationId: z.string().uuid(),
	token: z.string().min(1, "Token is required"),
});

// ── Generate Avatar ─────────────────────────────────────────────────

export const generateAvatarFn = createServerFn({
	method: "POST",
})
	.inputValidator(
		(data: { invitationId: string; style: string; token: string }) =>
			parseInput(generateAvatarSchema, data),
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

		if (!hero.heroImageUrl) {
			throw ApiError.badRequest(
				"Upload a hero photo first before generating an avatar",
			);
		}

		// Validate the hero image URL against allowlist
		assertAllowedUrl(hero.heroImageUrl, "Hero image");

		// Claim a rate-limit slot atomically (TOCTOU-safe)
		const slotId = await claimGenerationSlot(
			db,
			data.invitationId,
			SECTION_HERO_AVATAR,
			STYLE_PROMPTS[data.style],
		);

		try {
			// Generate avatar via fal.ai FLUX image-to-image
			ensureFalConfigured();

			const result = await fal.subscribe("fal-ai/flux/dev/image-to-image", {
				input: {
					image_url: hero.heroImageUrl,
					prompt: STYLE_PROMPTS[data.style],
					strength: 0.6,
					num_inference_steps: 40,
				},
				pollInterval: 1000,
			});

			const images = (result as { images?: Array<{ url: string }> }).images;
			if (!images?.[0]?.url) {
				throw ApiError.unavailable(
					"This photo could not be processed. Please try a different photo with a clear, front-facing view.",
				);
			}

			// Download with size limit
			const imageBuffer = await fetchImageWithSizeLimit(
				images[0].url,
				"generated avatar",
			);
			const hash = contentHash(imageBuffer);
			const key = `avatars/${data.invitationId}/${hash}.webp`;

			// Delete previous avatar + video from R2 in parallel
			const r2Deletes: Promise<void>[] = [];
			if (hero.avatarImageUrl) {
				const previousKey = extractR2Key(hero.avatarImageUrl);
				if (previousKey) {
					r2Deletes.push(deleteFromR2(previousKey).catch(() => {}));
				}
			}
			if (hero.animatedVideoUrl) {
				const previousVideoKey = extractR2Key(hero.animatedVideoUrl);
				if (previousVideoKey) {
					r2Deletes.push(deleteFromR2(previousVideoKey).catch(() => {}));
				}
			}
			await Promise.all(r2Deletes);

			// Upload to R2
			const avatarImageUrl = await uploadToR2(key, imageBuffer, "image/webp");

			// Complete the claimed slot
			await completeGenerationSlot(db, slotId, {
				generatedContent: { style: data.style, url: avatarImageUrl },
				resultUrl: avatarImageUrl,
			});

			// Count remaining using the correct quota check
			const { remaining } = await checkLivingPortraitQuota(
				db,
				data.invitationId,
			).catch(() => ({ remaining: 0 }));

			return { avatarImageUrl, remaining };
		} catch (err) {
			// Release the slot on failure
			await failGenerationSlot(db, slotId).catch(() => {});
			throw err;
		}
	});

// ── Remove Avatar ───────────────────────────────────────────────────

export const removeAvatarFn = createServerFn({
	method: "POST",
})
	.inputValidator((data: { invitationId: string; token: string }) =>
		parseInput(removeAvatarSchema, data),
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

		// Delete avatar + dependent video from R2 in parallel
		const r2Deletes: Promise<void>[] = [];
		if (hero.avatarImageUrl) {
			const avatarKey = extractR2Key(hero.avatarImageUrl);
			if (avatarKey) {
				r2Deletes.push(deleteFromR2(avatarKey).catch(() => {}));
			}
		}
		if (hero.animatedVideoUrl) {
			const videoKey = extractR2Key(hero.animatedVideoUrl);
			if (videoKey) {
				r2Deletes.push(deleteFromR2(videoKey).catch(() => {}));
			}
		}
		await Promise.all(r2Deletes);

		// Patch invitation content: clear avatar and video fields
		const updatedHero = {
			...((content.hero as Record<string, unknown>) ?? {}),
		};
		delete updatedHero.avatarImageUrl;
		delete updatedHero.avatarStyle;
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
