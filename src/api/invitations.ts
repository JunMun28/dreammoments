import { createServerFn } from "@tanstack/react-start";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { getDbOrNull, schema } from "@/db/index";
import { summarizeInvitationContent } from "@/lib/canvas/document";
import { convertTemplateToCanvasDocument } from "@/lib/canvas/template-converter";
import { requireAuth } from "@/lib/server-auth";
import { slugify } from "@/lib/slug";
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
		if (!db) throw new Error("Database connection required");

		const rows = await db
			.select({ id: schema.invitations.id })
			.from(schema.invitations)
			.where(eq(schema.invitations.slug, data.slug));

		const taken = rows.some((r) => r.id !== data.invitationId);
		return { available: !taken };
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
		if (!db) throw new Error("Database connection required");

		const rows = await db
			.select()
			.from(schema.invitations)
			.where(eq(schema.invitations.userId, userId))
			.orderBy(desc(schema.invitations.updatedAt));
		return rows;
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
		if (!db) throw new Error("Database connection required");

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
		if (!db) throw new Error("Database connection required");

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
			template.sections.map((section) => [section.id, section.defaultVisible]),
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
		if (!db) throw new Error("Database connection required");

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

		if (data.content !== undefined) {
			const current = await db
				.select({ content: schema.invitations.content })
				.from(schema.invitations)
				.where(eq(schema.invitations.id, data.invitationId));

			if (current[0]) {
				await db.insert(schema.invitationSnapshots).values({
					invitationId: data.invitationId,
					content: current[0].content as Record<string, unknown>,
					reason: "auto-save",
				});
			}
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
		if (!db) throw new Error("Database connection required");

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
		if (!db) throw new Error("Database connection required");

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
		const requestedBaseSlug = data.slug ? slugify(data.slug) : summary.slugBase;
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
		if (!db) throw new Error("Database connection required");

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
	});

// ── Patch invitation content (partial update) ────────────────────────

const patchContentSchema = z.object({
	invitationId: z.string().min(1, "invitationId is required"),
	token: z.string().min(1, "Token is required"),
	path: z
		.string()
		.min(1, "path is required")
		.refine((path) => isSafePath(path), "Invalid path"),
	value: z.unknown(),
});

export const patchInvitationContentFn = createServerFn({
	method: "POST",
})
	.inputValidator(
		(data: {
			invitationId: string;
			token: string;
			path: string;
			value: unknown;
		}) => parseInput(patchContentSchema, data),
	)
	// @ts-expect-error ServerFn inference expects stricter JSON type than Record<string, unknown>
	.handler(async ({ data }) => {
		const { userId } = await requireAuth(data.token);

		const db = getDbOrNull();
		if (!db) throw new Error("Database connection required");

		const rows = await db
			.select()
			.from(schema.invitations)
			.where(eq(schema.invitations.id, data.invitationId));

		if (rows.length === 0) {
			return { error: "Invitation not found" };
		}
		if (rows[0].userId !== userId) {
			return { error: "Access denied" };
		}

		await db.insert(schema.invitationSnapshots).values({
			invitationId: data.invitationId,
			content: rows[0].content as Record<string, unknown>,
			reason: "patch-content",
		});

		const content = structuredClone(rows[0].content as Record<string, unknown>);
		setNestedValue(content, getPathSegments(data.path), data.value);

		const updated = await db
			.update(schema.invitations)
			.set({ content, updatedAt: new Date() })
			.where(eq(schema.invitations.id, data.invitationId))
			.returning();

		return updated[0];
	});

function setNestedValue(
	obj: Record<string, unknown>,
	keys: string[],
	value: unknown,
) {
	let current: Record<string, unknown> = obj;

	if (keys.length === 0) {
		throw new Error("Invalid path");
	}

	if (keys.some((key) => FORBIDDEN_PATH_SEGMENTS.has(key))) {
		throw new Error("Invalid path");
	}

	for (let i = 0; i < keys.length - 1; i++) {
		const key = keys[i];
		const existing = Object.hasOwn(current, key) ? current[key] : undefined;
		if (!isRecord(existing)) {
			current[key] = {};
		}
		current = current[key] as Record<string, unknown>;
	}

	current[keys[keys.length - 1]] = value;
}

const FORBIDDEN_PATH_SEGMENTS = new Set([
	"__proto__",
	"prototype",
	"constructor",
]);

function getPathSegments(path: string) {
	return path
		.split(".")
		.map((segment) => segment.trim())
		.filter((segment) => segment.length > 0);
}

function isSafePath(path: string) {
	const keys = getPathSegments(path);
	return (
		keys.length > 0 && keys.every((key) => !FORBIDDEN_PATH_SEGMENTS.has(key))
	);
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return !!value && typeof value === "object" && !Array.isArray(value);
}
