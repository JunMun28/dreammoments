import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";

import { getDbOrNull, schema } from "@/db/index";
import {
	detectDeviceType,
	getInvitationBySlug as localGetInvitationBySlug,
	trackInvitationView as localTrackInvitationView,
} from "@/lib/data";
import { getPublicInvitationSchema, trackViewSchema } from "@/lib/validation";

// ── Get public invitation by slug ───────────────────────────────────

export const getPublicInvitation = createServerFn({
	method: "GET",
})
	.inputValidator((data: { slug: string }) => {
		const result = getPublicInvitationSchema.safeParse(data);
		if (!result.success) {
			throw new Error(result.error.issues[0].message);
		}
		return result.data;
	})
	// @ts-expect-error ServerFn inference expects stricter JSON type than Record<string, unknown>
	.handler(async ({ data }) => {
		const db = getDbOrNull();

		if (db) {
			const rows = await db
				.select()
				.from(schema.invitations)
				.where(eq(schema.invitations.slug, data.slug));

			if (rows.length === 0) {
				return { error: "Invitation not found" };
			}

			const invitation = rows[0];
			if (invitation.status !== "published") {
				return { error: "Invitation is not published" };
			}

			// Return only public-safe fields (exclude userId, internal settings)
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
		}

		// localStorage fallback
		const invitation = localGetInvitationBySlug(data.slug);
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
		(data: { invitationId: string; userAgent?: string; referrer?: string }) => {
			const result = trackViewSchema.safeParse(data);
			if (!result.success) {
				throw new Error(result.error.issues[0].message);
			}
			return result.data;
		},
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

		// localStorage fallback
		const view = localTrackInvitationView(data.invitationId, ua, data.referrer);
		return view;
	});
