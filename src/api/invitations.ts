import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { getDbOrNull, schema } from "@/db/index";
import { summarizeInvitationContent } from "@/lib/canvas/document";
import { convertTemplateToCanvasDocument } from "@/lib/canvas/template-converter";
import {
	createInvitation as localCreateInvitation,
	deleteInvitation as localDeleteInvitation,
	getInvitationById as localGetInvitationById,
	listInvitationsByUser as localListInvitationsByUser,
	publishInvitation as localPublishInvitation,
	unpublishInvitation as localUnpublishInvitation,
	updateInvitation as localUpdateInvitation,
} from "@/lib/data";
import { requireAuth } from "@/lib/server-auth";
import { slugify } from "@/lib/slug";
import type { Invitation } from "@/lib/types";
import {
	createInvitationSchema,
	deleteInvitationSchema,
	publishInvitationSchema,
	unpublishInvitationSchema,
	updateInvitationSchema,
} from "@/lib/validation";
import { parseInput } from "./validate";

async function slugExists(
	db: NonNullable<ReturnType<typeof getDbOrNull>>,
	slug: string,
	excludeInvitationId?: string,
) {
	const rows = await db
		.select({ id: schema.invitations.id })
		.from(schema.invitations)
		.where(eq(schema.invitations.slug, slug));
	if (!excludeInvitationId) return rows.length > 0;
	return rows.some((row) => row.id !== excludeInvitationId);
}

async function generateUniqueDbSlug(
	db: NonNullable<ReturnType<typeof getDbOrNull>>,
	baseInput: string,
	excludeInvitationId?: string,
) {
	const base = slugify(baseInput) || "dreammoments";
	let candidate = base;
	for (let attempt = 0; attempt < 20; attempt++) {
		if (!(await slugExists(db, candidate, excludeInvitationId))) {
			return candidate;
		}
		candidate = `${base}-${Math.random().toString(36).slice(2, 6)}`;
	}
	return `${base}-${Date.now().toString(36).slice(-4)}`;
}

// ── Check slug availability ─────────────────────────────────────────

const checkSlugSchema = z.object({
	token: z.string().min(1, "Token is required"),
	slug: z.string().min(1, "Slug is required"),
	invitationId: z.string().optional(),
});

export const checkSlugAvailabilityFn = createServerFn({
	method: "GET",
})
	.inputValidator(
		(data: { token: string; slug: string; invitationId?: string }) =>
			parseInput(checkSlugSchema, data),
	)
	.handler(async ({ data }) => {
		await requireAuth(data.token);

		const db = getDbOrNull();

		if (db) {
			const rows = await db
				.select({ id: schema.invitations.id })
				.from(schema.invitations)
				.where(eq(schema.invitations.slug, data.slug));

			const taken = rows.some((r) => r.id !== data.invitationId);
			return { available: !taken };
		}

		return { available: true };
	});

// ── List user invitations ───────────────────────────────────────────

const getInvitationsSchema = z.object({
	token: z.string().min(1, "Token is required"),
});

export const getInvitations = createServerFn({
	method: "GET",
})
	.inputValidator((data: { token: string }) =>
		parseInput(getInvitationsSchema, data),
	)
	// @ts-expect-error ServerFn inference expects stricter JSON type than Record<string, unknown>
	.handler(async ({ data }) => {
		const { userId } = await requireAuth(data.token);

		const db = getDbOrNull();

		if (db) {
			const rows = await db
				.select()
				.from(schema.invitations)
				.where(eq(schema.invitations.userId, userId))
				.orderBy(desc(schema.invitations.updatedAt));
			return rows;
		}

		return localListInvitationsByUser(userId);
	});

// ── Get single invitation ──────────────────────────────────────────

const getInvitationSchema = z.object({
	invitationId: z.string().min(1, "invitationId is required"),
	token: z.string().min(1, "Token is required"),
});

export const getInvitation = createServerFn({
	method: "GET",
})
	.inputValidator((data: { invitationId: string; token: string }) =>
		parseInput(getInvitationSchema, data),
	)
	// @ts-expect-error ServerFn inference expects stricter JSON type than Record<string, unknown>
	.handler(async ({ data }) => {
		const { userId } = await requireAuth(data.token);

		const db = getDbOrNull();

		if (db) {
			const rows = await db
				.select()
				.from(schema.invitations)
				.where(
					and(
						eq(schema.invitations.id, data.invitationId),
						eq(schema.invitations.userId, userId),
					),
				);

			if (rows.length === 0) {
				return { error: "Invitation not found or access denied" };
			}

			return rows[0];
		}

		const invitation = localGetInvitationById(data.invitationId);
		if (!invitation) {
			return { error: "Invitation not found" };
		}
		if (invitation.userId !== userId) {
			return { error: "Access denied" };
		}
		return invitation;
	});

// ── Create invitation ──────────────────────────────────────────────

export const createInvitationFn = createServerFn({
	method: "POST",
})
	.inputValidator((data: { token: string; templateId: string }) => {
		parseInput(createInvitationSchema, {
			userId: "placeholder",
			templateId: data.templateId,
		});
		return data;
	})
	// @ts-expect-error ServerFn inference expects stricter JSON type than Record<string, unknown>
	.handler(async ({ data }) => {
		const { userId } = await requireAuth(data.token);

		const db = getDbOrNull();

		if (db) {
			const { buildSampleContent } = await import("@/data/sample-invitation");
			const { templates } = await import("@/templates/index");

			const template =
				templates.find((t) => t.id === data.templateId) ?? templates[0];
			const legacyContent = buildSampleContent(template.id);
			const canvasContent = convertTemplateToCanvasDocument(
				template.id,
				legacyContent,
			);
			const summary = summarizeInvitationContent(canvasContent);
			const baseSlug = summary.slugBase;

			const slug = await generateUniqueDbSlug(db, baseSlug);

			const title = summary.title;
			const sectionVisibility = Object.fromEntries(
				template.sections.map((section) => [
					section.id,
					section.defaultVisible,
				]),
			);

			const rows = await db
				.insert(schema.invitations)
				.values({
					userId,
					slug,
					title,
					templateId: template.id,
					templateVersion: template.version,
					content: canvasContent as unknown as Record<string, unknown>,
					sectionVisibility,
					designOverrides: {},
					status: "draft",
					aiGenerationsUsed: 0,
					invitedCount: 0,
				})
				.returning();

			return rows[0];
		}

		return localCreateInvitation(userId, data.templateId);
	});

// ── Update invitation ──────────────────────────────────────────────

export const updateInvitationFn = createServerFn({
	method: "POST",
})
	.inputValidator(
		(data: {
			invitationId: string;
			token: string;
			title?: string;
			content?: Record<string, unknown>;
			sectionVisibility?: Record<string, boolean>;
			designOverrides?: Record<string, unknown>;
			status?: "draft" | "published" | "archived";
		}) => {
			parseInput(updateInvitationSchema, {
				...data,
				userId: "placeholder",
			});
			return data;
		},
	)
	// @ts-expect-error ServerFn inference expects stricter JSON type than Record<string, unknown>
	.handler(async ({ data }) => {
		const { userId } = await requireAuth(data.token);

		const db = getDbOrNull();

		if (db) {
			// Verify ownership
			const existing = await db
				.select({ userId: schema.invitations.userId })
				.from(schema.invitations)
				.where(eq(schema.invitations.id, data.invitationId));

			if (existing.length === 0) {
				return { error: "Invitation not found" };
			}
			if (existing[0].userId !== userId) {
				return { error: "Access denied" };
			}

			// Build update fields
			const updateFields: Record<string, unknown> = {
				updatedAt: new Date(),
			};
			if (data.title !== undefined) updateFields.title = data.title;
			if (data.content !== undefined) updateFields.content = data.content;
			if (data.sectionVisibility !== undefined)
				updateFields.sectionVisibility = data.sectionVisibility;
			if (data.designOverrides !== undefined)
				updateFields.designOverrides = data.designOverrides;
			if (data.status !== undefined) updateFields.status = data.status;

			const rows = await db
				.update(schema.invitations)
				.set(updateFields)
				.where(eq(schema.invitations.id, data.invitationId))
				.returning();

			return rows[0];
		}

		// localStorage fallback
		const invitation = localGetInvitationById(data.invitationId);
		if (!invitation) {
			return { error: "Invitation not found" };
		}
		if (invitation.userId !== userId) {
			return { error: "Access denied" };
		}

		const patch: Partial<Invitation> = {};
		if (data.title !== undefined) patch.title = data.title;
		if (data.content !== undefined)
			patch.content = data.content as unknown as Invitation["content"];
		if (data.sectionVisibility !== undefined)
			patch.sectionVisibility = data.sectionVisibility;
		if (data.designOverrides !== undefined)
			patch.designOverrides = data.designOverrides;
		if (data.status !== undefined) patch.status = data.status;

		const updated = localUpdateInvitation(data.invitationId, patch);
		return updated ?? { error: "Update failed" };
	});

// ── Delete invitation ──────────────────────────────────────────────

export const deleteInvitationFn = createServerFn({
	method: "POST",
})
	.inputValidator((data: { invitationId: string; token: string }) => {
		parseInput(deleteInvitationSchema, {
			invitationId: data.invitationId,
			userId: "placeholder",
		});
		return data;
	})
	.handler(async ({ data }) => {
		const { userId } = await requireAuth(data.token);

		const db = getDbOrNull();

		if (db) {
			// Verify ownership
			const existing = await db
				.select({ userId: schema.invitations.userId })
				.from(schema.invitations)
				.where(eq(schema.invitations.id, data.invitationId));

			if (existing.length === 0) {
				return { error: "Invitation not found" };
			}
			if (existing[0].userId !== userId) {
				return { error: "Access denied" };
			}

			await db
				.delete(schema.invitations)
				.where(eq(schema.invitations.id, data.invitationId));

			return { success: true };
		}

		// localStorage fallback
		const invitation = localGetInvitationById(data.invitationId);
		if (!invitation) {
			return { error: "Invitation not found" };
		}
		if (invitation.userId !== userId) {
			return { error: "Access denied" };
		}

		localDeleteInvitation(data.invitationId);
		return { success: true };
	});

// ── Publish invitation ─────────────────────────────────────────────

export const publishInvitationFn = createServerFn({
	method: "POST",
})
	.inputValidator(
		(data: {
			invitationId: string;
			token: string;
			slug?: string;
			randomize?: boolean;
		}) => {
			parseInput(publishInvitationSchema, {
				invitationId: data.invitationId,
				userId: "placeholder",
				slug: data.slug,
				randomize: data.randomize,
			});
			return data;
		},
	)
	// @ts-expect-error ServerFn inference expects stricter JSON type than Record<string, unknown>
	.handler(async ({ data }) => {
		const { userId } = await requireAuth(data.token);

		const db = getDbOrNull();

		if (db) {
			// Get invitation and verify ownership
			const rows = await db
				.select()
				.from(schema.invitations)
				.where(eq(schema.invitations.id, data.invitationId));

			if (rows.length === 0) {
				return { error: "Invitation not found" };
			}

			const invitation = rows[0];
			if (invitation.userId !== userId) {
				return { error: "Access denied" };
			}

			// Get template snapshot
			const { templates } = await import("@/templates/index");
			const template =
				templates.find((t) => t.id === invitation.templateId) ?? templates[0];

			const content = invitation.content as Record<string, unknown>;
			const summary = summarizeInvitationContent(content);
			const requestedBaseSlug = data.slug
				? slugify(data.slug)
				: summary.slugBase;
			const baseSlug = data.randomize
				? `${requestedBaseSlug}-${Math.random().toString(36).slice(2, 6)}`
				: requestedBaseSlug;
			const slug = await generateUniqueDbSlug(db, baseSlug, invitation.id);

			const updated = await db
				.update(schema.invitations)
				.set({
					slug,
					status: "published",
					publishedAt: new Date(),
					templateVersion: template.version,
					templateSnapshot: template as unknown as Record<string, unknown>,
					updatedAt: new Date(),
				})
				.where(eq(schema.invitations.id, data.invitationId))
				.returning();

			return updated[0];
		}

		// localStorage fallback
		const invitation = localGetInvitationById(data.invitationId);
		if (!invitation) {
			return { error: "Invitation not found" };
		}
		if (invitation.userId !== userId) {
			return { error: "Access denied" };
		}

		const published = localPublishInvitation(data.invitationId, {
			slug: data.slug,
			randomize: data.randomize,
		});
		return published ?? { error: "Publish failed" };
	});

// ── Unpublish invitation ───────────────────────────────────────────

export const unpublishInvitationFn = createServerFn({
	method: "POST",
})
	.inputValidator((data: { invitationId: string; token: string }) => {
		parseInput(unpublishInvitationSchema, {
			invitationId: data.invitationId,
			userId: "placeholder",
		});
		return data;
	})
	// @ts-expect-error ServerFn inference expects stricter JSON type than Record<string, unknown>
	.handler(async ({ data }) => {
		const { userId } = await requireAuth(data.token);

		const db = getDbOrNull();

		if (db) {
			// Verify ownership
			const existing = await db
				.select({ userId: schema.invitations.userId })
				.from(schema.invitations)
				.where(eq(schema.invitations.id, data.invitationId));

			if (existing.length === 0) {
				return { error: "Invitation not found" };
			}
			if (existing[0].userId !== userId) {
				return { error: "Access denied" };
			}

			const rows = await db
				.update(schema.invitations)
				.set({
					status: "draft",
					publishedAt: null,
					updatedAt: new Date(),
				})
				.where(eq(schema.invitations.id, data.invitationId))
				.returning();

			return rows[0];
		}

		// localStorage fallback
		const invitation = localGetInvitationById(data.invitationId);
		if (!invitation) {
			return { error: "Invitation not found" };
		}
		if (invitation.userId !== userId) {
			return { error: "Access denied" };
		}

		const unpublished = localUnpublishInvitation(data.invitationId);
		return unpublished ?? { error: "Unpublish failed" };
	});
