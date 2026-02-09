import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";

import { getDbOrNull, schema } from "@/db/index";
import {
	detectDeviceType,
	getInvitationBySlug as localGetInvitationBySlug,
	trackInvitationView as localTrackInvitationView,
} from "@/lib/data";
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

		const invitation = db
			? (
					await db
						.select()
						.from(schema.invitations)
						.where(eq(schema.invitations.slug, data.slug))
				)[0]
			: localGetInvitationBySlug(data.slug);

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
		(data: { invitationId: string; userAgent?: string; referrer?: string }) =>
			parseInput(trackViewSchema, data),
	)
	.handler(async ({ data }) => {
		const db = getDbOrNull();
		const ua = data.userAgent ?? "";

		if (db) {
			// Verify invitation exists
			const invRows = await db
				.select({ id: schema.invitations.id })
				.from(schema.invitations)
				.where(eq(schema.invitations.id, data.invitationId));

			if (invRows.length === 0) {
				return { error: "Invitation not found" };
			}

			// Generate visitor hash
			const hashInput = `${ua}-${Date.now().toString(36)}`;
			const visitorHash =
				typeof btoa !== "undefined"
					? btoa(hashInput).slice(0, 12)
					: Buffer.from(hashInput).toString("base64").slice(0, 12);

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
		}

		return localTrackInvitationView(data.invitationId, ua, data.referrer);
	});
