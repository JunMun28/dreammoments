import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { and, eq } from "drizzle-orm";

import { getDbOrNull, schema } from "@/db/index";
import { isCanvasDocument } from "@/lib/canvas/document";
import { createDbRateLimiter } from "@/lib/rate-limit";
import { requireAuth } from "@/lib/server-auth";
import {
	bulkUpdateGuestsSchema,
	deleteGuestSchema,
	exportGuestsSchema,
	guestImportSchema,
	listGuestsSchema,
	submitRsvpSchema,
	updateGuestSchema,
} from "@/lib/validation";
import { parseInput } from "./validate";

const rsvpRateLimit = createDbRateLimiter("rsvp", {
	maxAttempts: 10,
	windowMs: 60 * 60 * 1000,
});

function getRequestHeaderSafe(name: string): string | undefined {
	try {
		return getRequestHeader(name);
	} catch {
		return undefined;
	}
}

function getRateLimitKey(invitationId: string, visitorKey: string): string {
	const forwarded = getRequestHeaderSafe("x-forwarded-for");
	const realIp = getRequestHeaderSafe("x-real-ip");
	const firstForwarded = forwarded?.split(",")[0]?.trim();
	const ip = firstForwarded || realIp || "unknown";
	return `${invitationId}:${visitorKey}:${ip}`;
}

type GuestFilterable = {
	name?: string | null;
	email?: string | null;
	relationship?: string | null;
	attendance?: string | null;
};

function applyGuestFilters<T extends GuestFilterable>(
	guests: T[],
	options: {
		filter?: "attending" | "not_attending" | "undecided" | "pending";
		search?: string;
		relationship?: string;
	},
) {
	let filtered = guests;

	if (options.filter === "pending") {
		filtered = filtered.filter((guest) => !guest.attendance);
	}

	if (options.search) {
		const term = options.search.toLowerCase();
		filtered = filtered.filter(
			(guest) =>
				guest.name?.toLowerCase().includes(term) ||
				guest.email?.toLowerCase().includes(term),
		);
	}

	if (options.relationship) {
		filtered = filtered.filter(
			(guest) => guest.relationship === options.relationship,
		);
	}

	return filtered;
}

// ── List guests for an invitation ───────────────────────────────────

export const listGuestsFn = createServerFn({
	method: "GET",
})
	.inputValidator(
		(data: {
			invitationId: string;
			token: string;
			filter?: "attending" | "not_attending" | "undecided" | "pending";
			search?: string;
			relationship?: string;
		}) => {
			parseInput(listGuestsSchema, {
				invitationId: data.invitationId,
				userId: "placeholder",
				filter: data.filter,
				search: data.search,
				relationship: data.relationship,
			});
			return data;
		},
	)
	.handler(async ({ data }) => {
		const { userId } = await requireAuth(data.token);

		const db = getDbOrNull();
		if (!db) throw new Error("Database connection required");

		// Verify invitation ownership
		const invitation = await db
			.select({ userId: schema.invitations.userId })
			.from(schema.invitations)
			.where(eq(schema.invitations.id, data.invitationId));

		if (invitation.length === 0) {
			return { error: "Invitation not found" };
		}
		if (invitation[0].userId !== userId) {
			return { error: "Access denied" };
		}

		let query = db
			.select()
			.from(schema.guests)
			.where(eq(schema.guests.invitationId, data.invitationId));

		if (data.filter && data.filter !== "pending") {
			query = db
				.select()
				.from(schema.guests)
				.where(
					and(
						eq(schema.guests.invitationId, data.invitationId),
						eq(schema.guests.attendance, data.filter),
					),
				);
		}

		const rows = await query;

		return applyGuestFilters(rows, {
			filter: data.filter,
			search: data.search,
			relationship: data.relationship,
		});
	});

// ── Submit RSVP (public, no auth required) ──────────────────────────

export const submitRsvpFn = createServerFn({
	method: "POST",
})
	.inputValidator(
		(data: {
			invitationId: string;
			name: string;
			email?: string;
			phone?: string;
			relationship?: string;
			attendance?: "attending" | "not_attending" | "undecided";
			guestCount?: number;
			dietaryRequirements?: string;
			message?: string;
			visitorKey: string;
		}) => parseInput(submitRsvpSchema, data),
	)
	.handler(async ({ data }) => {
		// Rate limit by invitation + visitor + client IP (multi-instance safe).
		const limit = await rsvpRateLimit(
			getRateLimitKey(data.invitationId, data.visitorKey),
		);
		if (!limit.allowed) {
			return { error: "Too many submissions. Please try again later." };
		}

		const db = getDbOrNull();
		if (!db) throw new Error("Database connection required");

		// Verify invitation exists and is published
		const invRows = await db
			.select()
			.from(schema.invitations)
			.where(eq(schema.invitations.id, data.invitationId));

		if (invRows.length === 0) {
			return { error: "Invitation not found" };
		}

		const invitation = invRows[0];
		if (invitation.status !== "published") {
			return { error: "Invitation is not published" };
		}

		// Check guest count limits
		const content = invitation.content as Record<string, unknown>;
		let allowPlusOnes = false;
		let maxPlusOnes = 0;
		if (isCanvasDocument(content)) {
			const formBlock = content.blockOrder
				.map((id) => content.blocksById[id])
				.find(
					(block) => block?.type === "form" || block?.semantic === "rsvp-form",
				);
			if (typeof formBlock?.content.allowPlusOnes === "boolean") {
				allowPlusOnes = formBlock.content.allowPlusOnes;
			}
			if (typeof formBlock?.content.maxPlusOnes === "number") {
				maxPlusOnes = formBlock.content.maxPlusOnes;
			}
		} else {
			const rsvp = content.rsvp as
				| {
						allowPlusOnes?: boolean;
						maxPlusOnes?: number;
				  }
				| undefined;
			allowPlusOnes = !!rsvp?.allowPlusOnes;
			maxPlusOnes = rsvp?.maxPlusOnes ?? 0;
		}
		const maxAllowed = allowPlusOnes ? 1 + maxPlusOnes : 1;
		if ((data.guestCount ?? 1) > maxAllowed) {
			return { error: "Guest count exceeds limit" };
		}

		const rows = await db
			.insert(schema.guests)
			.values({
				invitationId: data.invitationId,
				name: data.name,
				email: data.email,
				phone: data.phone,
				relationship: data.relationship,
				attendance: data.attendance,
				guestCount: data.guestCount ?? 1,
				dietaryRequirements: data.dietaryRequirements,
				message: data.message,
				rsvpSubmittedAt: new Date(),
			})
			.returning();

		return rows[0];
	});

// ── Update guest (auth required) ────────────────────────────────────

export const updateGuestFn = createServerFn({
	method: "POST",
})
	.inputValidator(
		(data: {
			guestId: string;
			token: string;
			invitationId: string;
			name?: string;
			email?: string;
			phone?: string;
			relationship?: string;
			attendance?: "attending" | "not_attending" | "undecided";
			guestCount?: number;
			dietaryRequirements?: string;
			message?: string;
		}) => {
			parseInput(updateGuestSchema, { ...data, userId: "placeholder" });
			return data;
		},
	)
	.handler(async ({ data }) => {
		const { userId } = await requireAuth(data.token);

		const db = getDbOrNull();
		if (!db) throw new Error("Database connection required");

		// Verify invitation ownership
		const invitation = await db
			.select({ userId: schema.invitations.userId })
			.from(schema.invitations)
			.where(eq(schema.invitations.id, data.invitationId));

		if (invitation.length === 0) {
			return { error: "Invitation not found" };
		}
		if (invitation[0].userId !== userId) {
			return { error: "Access denied" };
		}

		// Build update fields
		const updateFields: Record<string, unknown> = {
			updatedAt: new Date(),
		};
		if (data.name !== undefined) updateFields.name = data.name;
		if (data.email !== undefined) updateFields.email = data.email;
		if (data.phone !== undefined) updateFields.phone = data.phone;
		if (data.relationship !== undefined)
			updateFields.relationship = data.relationship;
		if (data.attendance !== undefined)
			updateFields.attendance = data.attendance;
		if (data.guestCount !== undefined)
			updateFields.guestCount = data.guestCount;
		if (data.dietaryRequirements !== undefined)
			updateFields.dietaryRequirements = data.dietaryRequirements;
		if (data.message !== undefined) updateFields.message = data.message;

		const rows = await db
			.update(schema.guests)
			.set(updateFields)
			.where(
				and(
					eq(schema.guests.id, data.guestId),
					eq(schema.guests.invitationId, data.invitationId),
				),
			)
			.returning();

		if (rows.length === 0) {
			return { error: "Guest not found" };
		}

		return rows[0];
	});

// ── Import guests (bulk) ────────────────────────────────────────────

export const importGuestsFn = createServerFn({
	method: "POST",
})
	.inputValidator(
		(data: {
			invitationId: string;
			token: string;
			guests: Array<{
				name: string;
				email?: string;
				phone?: string;
				relationship?: string;
			}>;
		}) => {
			parseInput(guestImportSchema, {
				invitationId: data.invitationId,
				userId: "placeholder",
				guests: data.guests,
			});
			return data;
		},
	)
	.handler(async ({ data }) => {
		const { userId } = await requireAuth(data.token);

		const db = getDbOrNull();
		if (!db) throw new Error("Database connection required");

		// Verify invitation ownership
		const invitation = await db
			.select({ userId: schema.invitations.userId })
			.from(schema.invitations)
			.where(eq(schema.invitations.id, data.invitationId));

		if (invitation.length === 0) {
			return { error: "Invitation not found" };
		}
		if (invitation[0].userId !== userId) {
			return { error: "Access denied" };
		}

		const values = data.guests.map((guest) => ({
			invitationId: data.invitationId,
			name: guest.name,
			email: guest.email,
			phone: guest.phone,
			relationship: guest.relationship,
			guestCount: 1,
		}));

		const rows = await db.insert(schema.guests).values(values).returning();

		return rows;
	});

// ── Export guests as CSV ────────────────────────────────────────────

export const exportGuestsCsvFn = createServerFn({
	method: "GET",
})
	.inputValidator((data: { invitationId: string; token: string }) => {
		parseInput(exportGuestsSchema, {
			invitationId: data.invitationId,
			userId: "placeholder",
		});
		return data;
	})
	.handler(async ({ data }) => {
		const { userId } = await requireAuth(data.token);

		const db = getDbOrNull();
		if (!db) throw new Error("Database connection required");

		// Verify invitation ownership
		const invitation = await db
			.select({ userId: schema.invitations.userId })
			.from(schema.invitations)
			.where(eq(schema.invitations.id, data.invitationId));

		if (invitation.length === 0) {
			return { error: "Invitation not found" };
		}
		if (invitation[0].userId !== userId) {
			return { error: "Access denied" };
		}

		const guests = await db
			.select()
			.from(schema.guests)
			.where(eq(schema.guests.invitationId, data.invitationId));

		const header = ["name", "attendance", "guest_count", "dietary", "message"];
		const rows = guests.map((guest) => [
			guest.name,
			guest.attendance ?? "pending",
			(guest.guestCount ?? 1).toString(),
			guest.dietaryRequirements ?? "",
			guest.message ?? "",
		]);

		const csv = [header, ...rows]
			.map((row) =>
				row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
			)
			.join("\n");

		return { csv };
	});

// ── Delete guest ─────────────────────────────────────────────────────

export const deleteGuestFn = createServerFn({
	method: "POST",
})
	.inputValidator(
		(data: { guestId: string; token: string; invitationId: string }) => {
			parseInput(deleteGuestSchema, {
				...data,
				userId: "placeholder",
			});
			return data;
		},
	)
	.handler(async ({ data }) => {
		const { userId } = await requireAuth(data.token);

		const db = getDbOrNull();
		if (!db) throw new Error("Database connection required");

		const invitation = await db
			.select({ userId: schema.invitations.userId })
			.from(schema.invitations)
			.where(eq(schema.invitations.id, data.invitationId));

		if (invitation.length === 0) {
			return { error: "Invitation not found" };
		}
		if (invitation[0].userId !== userId) {
			return { error: "Access denied" };
		}

		await db
			.delete(schema.guests)
			.where(
				and(
					eq(schema.guests.id, data.guestId),
					eq(schema.guests.invitationId, data.invitationId),
				),
			);

		return { success: true };
	});

// ── Bulk update guests ──────────────────────────────────────────────

export const bulkUpdateGuestsFn = createServerFn({
	method: "POST",
})
	.inputValidator(
		(data: {
			invitationId: string;
			token: string;
			updates: Array<{
				guestId: string;
				name?: string;
				attendance?: "attending" | "not_attending" | "undecided";
				guestCount?: number;
				dietaryRequirements?: string;
			}>;
		}) => {
			parseInput(bulkUpdateGuestsSchema, {
				...data,
				userId: "placeholder",
			});
			return data;
		},
	)
	.handler(async ({ data }) => {
		const { userId } = await requireAuth(data.token);

		const db = getDbOrNull();
		if (!db) throw new Error("Database connection required");

		const invitation = await db
			.select({ userId: schema.invitations.userId })
			.from(schema.invitations)
			.where(eq(schema.invitations.id, data.invitationId));

		if (invitation.length === 0) {
			return { error: "Invitation not found" };
		}
		if (invitation[0].userId !== userId) {
			return { error: "Access denied" };
		}

		let updated = 0;

		for (const update of data.updates) {
			const { guestId, ...fields } = update;
			const updateFields: Record<string, unknown> = {
				updatedAt: new Date(),
			};

			for (const [key, value] of Object.entries(fields)) {
				if (value !== undefined) {
					updateFields[key] = value;
				}
			}

			const rows = await db
				.update(schema.guests)
				.set(updateFields)
				.where(
					and(
						eq(schema.guests.id, guestId),
						eq(schema.guests.invitationId, data.invitationId),
					),
				)
				.returning();

			if (rows.length > 0) {
				updated++;
			}
		}

		return { updated };
	});
