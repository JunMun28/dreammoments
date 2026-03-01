import { fal } from "@fal-ai/client";
import { and, eq, sql } from "drizzle-orm";

import type { getDbOrNull } from "@/db/index";
import { schema } from "@/db/index";
import {
	SECTION_HERO_ANIMATION,
	SECTION_HERO_AVATAR,
} from "@/lib/hero-content";
import { ApiError } from "./errors";

// Re-export shared types so existing consumers don't break
export type { HeroContent } from "@/lib/hero-content";
export { getStringProp, parseHeroContent } from "@/lib/hero-content";

// ── Constants ────────────────────────────────────────────────────────

export const MAX_LIVING_PORTRAIT_GENERATIONS = 8;

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB

const ALLOWED_IMAGE_HOSTS = new Set([
	"fal.media",
	"v3.fal.media",
	"storage.googleapis.com",
	"images.unsplash.com",
]);

// ── fal.ai Singleton ────────────────────────────────────────────────

let falConfigured = false;

export function ensureFalConfigured(): void {
	if (falConfigured) return;
	const key = process.env.FAL_KEY;
	if (!key) throw ApiError.unavailable("AI service not configured");
	fal.config({ credentials: key });
	falConfigured = true;
}

// ── Ownership Verification ──────────────────────────────────────────

type Db = NonNullable<ReturnType<typeof getDbOrNull>>;

export async function verifyInvitationOwnership(
	db: Db,
	invitationId: string,
	userId: string,
): Promise<Record<string, unknown>> {
	const rows = await db
		.select({ content: schema.invitations.content })
		.from(schema.invitations)
		.where(
			and(
				eq(schema.invitations.id, invitationId),
				eq(schema.invitations.userId, userId),
			),
		);

	if (rows.length === 0) {
		throw ApiError.forbidden("Invitation not found or access denied");
	}

	return rows[0].content as Record<string, unknown>;
}

// ── Rate Limiting (Quota Check) ─────────────────────────────────────

export async function checkLivingPortraitQuota(
	db: Db,
	invitationId: string,
): Promise<{ used: number; remaining: number }> {
	const countResult = await db
		.select({ count: sql<number>`count(*)::int` })
		.from(schema.aiGenerations)
		.where(
			and(
				eq(schema.aiGenerations.invitationId, invitationId),
				sql`${schema.aiGenerations.sectionId} IN (${SECTION_HERO_AVATAR}, ${SECTION_HERO_ANIMATION})`,
				eq(schema.aiGenerations.accepted, true),
			),
		);

	const used = countResult[0]?.count ?? 0;
	if (used >= MAX_LIVING_PORTRAIT_GENERATIONS) {
		throw ApiError.rateLimit(
			`Living portrait generation limit reached (${MAX_LIVING_PORTRAIT_GENERATIONS} max). Contact support for more.`,
		);
	}

	return { used, remaining: MAX_LIVING_PORTRAIT_GENERATIONS - used };
}

// ── TOCTOU-safe Rate Limit Slot Claim ───────────────────────────────

export async function claimGenerationSlot(
	db: Db,
	invitationId: string,
	sectionId: string,
	prompt: string,
): Promise<string> {
	const result = await db.execute(sql`
		INSERT INTO ai_generations (id, invitation_id, section_id, prompt, accepted, status, created_at)
		SELECT gen_random_uuid(), ${invitationId}, ${sectionId}, ${prompt}, false, 'processing', now()
		WHERE (
			SELECT count(*) FROM ai_generations
			WHERE invitation_id = ${invitationId}
				AND section_id IN (${SECTION_HERO_AVATAR}, ${SECTION_HERO_ANIMATION})
				AND accepted = true
		) < ${MAX_LIVING_PORTRAIT_GENERATIONS}
		RETURNING id
	`);

	const rows = result.rows as Array<{ id: string }>;
	if (rows.length === 0) {
		throw ApiError.rateLimit(
			`Living portrait generation limit reached (${MAX_LIVING_PORTRAIT_GENERATIONS} max). Contact support for more.`,
		);
	}

	return rows[0].id;
}

export async function completeGenerationSlot(
	db: Db,
	slotId: string,
	data: {
		generatedContent: Record<string, unknown>;
		resultUrl: string;
	},
): Promise<void> {
	await db
		.update(schema.aiGenerations)
		.set({
			status: "completed",
			accepted: true,
			generatedContent: data.generatedContent,
			resultUrl: data.resultUrl,
		})
		.where(eq(schema.aiGenerations.id, slotId));
}

export async function failGenerationSlot(
	db: Db,
	slotId: string,
): Promise<void> {
	await db
		.delete(schema.aiGenerations)
		.where(eq(schema.aiGenerations.id, slotId));
}

// ── URL Allowlist Validation (SSRF Protection) ──────────────────────

export function isAllowedImageUrl(url: string): boolean {
	try {
		const parsed = new URL(url);
		if (parsed.protocol !== "https:") return false;

		// Allow R2 public URL domain
		const r2PublicUrl = process.env.R2_PUBLIC_URL;
		if (r2PublicUrl) {
			const r2Host = new URL(r2PublicUrl).hostname;
			if (parsed.hostname === r2Host) return true;
		}

		// Allow known hosts
		if (ALLOWED_IMAGE_HOSTS.has(parsed.hostname)) return true;

		// Allow *.fal.media subdomains
		if (parsed.hostname.endsWith(".fal.media")) return true;

		// Allow *.r2.dev subdomains (Cloudflare R2 public buckets)
		if (parsed.hostname.endsWith(".r2.dev")) return true;

		return false;
	} catch {
		return false;
	}
}

export function assertAllowedUrl(url: string, label: string): void {
	if (!isAllowedImageUrl(url)) {
		throw ApiError.badRequest(`${label} URL is not from an allowed source`);
	}
}

// ── File Size Guard (Memory DoS Protection) ─────────────────────────

export async function fetchWithSizeLimit(
	url: string,
	maxBytes: number,
	label: string,
): Promise<Buffer> {
	const response = await fetch(url);
	if (!response.ok) {
		throw ApiError.unavailable(`Failed to download ${label}`);
	}

	// Check Content-Length header first (fast path)
	const contentLength = response.headers.get("content-length");
	if (contentLength && Number.parseInt(contentLength, 10) > maxBytes) {
		// Abort the response body to free resources
		await response.body?.cancel();
		throw ApiError.badRequest(
			`${label} exceeds maximum size of ${Math.round(maxBytes / 1024 / 1024)} MB`,
		);
	}

	const buffer = Buffer.from(await response.arrayBuffer());
	if (buffer.length > maxBytes) {
		throw ApiError.badRequest(
			`${label} exceeds maximum size of ${Math.round(maxBytes / 1024 / 1024)} MB`,
		);
	}

	return buffer;
}

export function fetchImageWithSizeLimit(
	url: string,
	label: string,
): Promise<Buffer> {
	return fetchWithSizeLimit(url, MAX_IMAGE_BYTES, label);
}

export function fetchVideoWithSizeLimit(
	url: string,
	label: string,
): Promise<Buffer> {
	return fetchWithSizeLimit(url, MAX_VIDEO_BYTES, label);
}
