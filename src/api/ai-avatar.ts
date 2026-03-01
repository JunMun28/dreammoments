import { fal } from "@fal-ai/client";
import { createServerFn } from "@tanstack/react-start";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { getDbOrNull, schema } from "@/db/index";
import { requireAuth } from "@/lib/server-auth";
import { ApiError } from "./errors";
import { contentHash, deleteFromR2, extractR2Key, uploadToR2 } from "./r2";
import { parseInput } from "./validate";

// ── Constants ────────────────────────────────────────────────────────

const MAX_LIVING_PORTRAIT_GENERATIONS = 8;

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

// ── Input schema ─────────────────────────────────────────────────────

const generateAvatarSchema = z.object({
	invitationId: z.string().uuid(),
	style: z.enum(["pixar", "ghibli"]),
	token: z.string().min(1, "Token is required"),
});

// ── Configure fal.ai ─────────────────────────────────────────────────

function configureFal() {
	const key = process.env.FAL_KEY;
	if (!key) throw ApiError.unavailable("AI image service not configured");
	fal.config({ credentials: key });
}

// ── Server function ──────────────────────────────────────────────────

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

		// Verify ownership with combined query (security: prevents cross-invitation mutation)
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
		const heroImageUrl = hero?.heroImageUrl as string | undefined;

		if (!heroImageUrl) {
			throw ApiError.badRequest(
				"Upload a hero photo first before generating an avatar",
			);
		}

		// Rate limit check: count successful living portrait generations
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
				`Living portrait generation limit reached (${MAX_LIVING_PORTRAIT_GENERATIONS} max). Contact support for more.`,
			);
		}

		// Generate avatar via fal.ai FLUX image-to-image
		configureFal();

		const result = await fal.subscribe("fal-ai/flux/dev/image-to-image", {
			input: {
				image_url: heroImageUrl,
				prompt: STYLE_PROMPTS[data.style],
				strength: 0.6,
				image_size: "square",
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

		// Download the generated image from fal.ai temporary URL
		const imageResponse = await fetch(images[0].url);
		if (!imageResponse.ok) {
			throw ApiError.unavailable("Failed to download generated avatar");
		}

		const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
		const hash = contentHash(imageBuffer);
		const key = `avatars/${data.invitationId}/${hash}.webp`;

		// Delete previous avatar from R2 if exists
		const previousAvatarUrl = hero?.avatarImageUrl as string | undefined;
		if (previousAvatarUrl) {
			const previousKey = extractR2Key(previousAvatarUrl);
			if (previousKey) {
				await deleteFromR2(previousKey).catch(() => {});
			}
		}

		// Upload to R2
		const avatarImageUrl = await uploadToR2(key, imageBuffer, "image/webp");

		// Record generation in aiGenerations table
		await db.insert(schema.aiGenerations).values({
			invitationId: data.invitationId,
			sectionId: "hero-avatar",
			prompt: STYLE_PROMPTS[data.style],
			generatedContent: { style: data.style, url: avatarImageUrl },
			accepted: true,
			status: "completed",
			resultUrl: avatarImageUrl,
		});

		return {
			avatarImageUrl,
			remaining: MAX_LIVING_PORTRAIT_GENERATIONS - usedGenerations - 1,
		};
	});
