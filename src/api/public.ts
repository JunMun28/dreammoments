import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";

import { getDbOrNull, schema } from "@/db/index";
import { detectDeviceType } from "@/lib/constants";
import { getPublicInvitationSchema, trackViewSchema } from "@/lib/validation";
import { parseInput } from "./validate";

// ── Get public invitation by slug ───────────────────────────────────

export const getPublicInvitation = createServerFn({
	method: "GET",
})
	.inputValidator((data: { slug: string }) =>
		parseInput(getPublicInvitationSchema, data),
	)
	// @ts-expect-error ServerFn inference expects stricter JSON type than Record<string, unknown>
	.handler(async ({ data }) => {
		const db = getDbOrNull();
		if (!db) throw new Error("Database connection required");

		const invitation = (
			await db
				.select()
				.from(schema.invitations)
				.where(eq(schema.invitations.slug, data.slug))
		)[0];

		if (!invitation) {
			return { error: "Invitation not found" };
		}
		if (invitation.status !== "published") {
			return { error: "Invitation is not published" };
		}

		return {
			id: invitation.id,
			slug: invitation.slug,
			title: invitation.title,
			templateId: invitation.templateId,
			templateVersion: invitation.templateVersion,
			templateSnapshot: invitation.templateSnapshot,
			content: invitation.content,
			sectionVisibility: invitation.sectionVisibility,
			designOverrides: invitation.designOverrides,
			status: invitation.status,
			publishedAt: invitation.publishedAt,
		};
	});

// ── Track invitation view ───────────────────────────────────────────

export const trackViewFn = createServerFn({
	method: "POST",
})
	.inputValidator(
		(data: {
			invitationId: string;
			userAgent?: string;
			referrer?: string;
			visitorKey?: string;
		}) => parseInput(trackViewSchema, data),
	)
	.handler(async ({ data }) => {
		const db = getDbOrNull();
		if (!db) throw new Error("Database connection required");

		const ua = data.userAgent ?? "";

		// Verify invitation exists
		const invRows = await db
			.select({ id: schema.invitations.id })
			.from(schema.invitations)
			.where(eq(schema.invitations.id, data.invitationId));

		if (invRows.length === 0) {
			return { error: "Invitation not found" };
		}

		// Stable visitor hash used for unique-visitor analytics.
		const stableSource = [
			data.invitationId,
			data.visitorKey ?? "",
			ua,
			data.referrer ?? "",
		].join("|");
		const digestBuffer = await crypto.subtle.digest(
			"SHA-256",
			new TextEncoder().encode(stableSource),
		);
		const visitorHash = Array.from(new Uint8Array(digestBuffer))
			.map((byte) => byte.toString(16).padStart(2, "0"))
			.join("")
			.slice(0, 16);

		const deviceType = detectDeviceType(ua);

		const rows = await db
			.insert(schema.invitationViews)
			.values({
				invitationId: data.invitationId,
				userAgent: ua,
				referrer: data.referrer,
				visitorHash,
				deviceType,
			})
			.returning();

		return rows[0];
	});
