import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";

import { getDbOrNull, schema } from "@/db/index";
import {
	exportGuestsCsv as localExportGuestsCsv,
	getInvitationById as localGetInvitationById,
	importGuests as localImportGuests,
	listGuests as localListGuests,
	submitRsvp as localSubmitRsvp,
	updateGuest as localUpdateGuest,
} from "@/lib/data";
import { rsvpRateLimit } from "@/lib/rate-limit";
import { requireAuth } from "@/lib/server-auth";
import type { AttendanceStatus } from "@/lib/types";
import {
	exportGuestsSchema,
	guestImportSchema,
	listGuestsSchema,
	submitRsvpSchema,
	updateGuestSchema,
} from "@/lib/validation";

// ── List guests for an invitation ───────────────────────────────────

export const listGuestsFn = createServerFn({
	method: "GET",
})
	.inputValidator(
		(data: {
			invitationId: string;
			token: string;
			filter?: "attending" | "not_attending" | "undecided" | "pending";
		}) => {
			const result = listGuestsSchema.safeParse({
				invitationId: data.invitationId,
				userId: "placeholder",
				filter: data.filter,
			});
			if (!result.success) {
				throw new Error(result.error.issues[0].message);
			}
			return data;
		},
	)
	.handler(async ({ data }) => {
		const { userId } = await requireAuth(data.token);

		const db = getDbOrNull();

		if (db) {
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

			// For "pending" filter, get guests without attendance set
			if (data.filter === "pending") {
				return rows.filter((g) => !g.attendance);
			}

			return rows;
		}

		// localStorage fallback - verify ownership
		const invitation = localGetInvitationById(data.invitationId);
		if (!invitation) {
			return { error: "Invitation not found" };
		}
		if (invitation.userId !== userId) {
			return { error: "Access denied" };
		}

		return localListGuests(
			data.invitationId,
			data.filter as AttendanceStatus | "pending" | undefined,
		);
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
		}) => {
			const result = submitRsvpSchema.safeParse(data);
			if (!result.success) {
				throw new Error(result.error.issues[0].message);
			}
			return result.data;
		},
	)
	.handler(async ({ data }) => {
		// Rate limit by visitorKey (10 per hour)
		const limit = rsvpRateLimit(data.visitorKey);
		if (!limit.allowed) {
			return { error: "Too many submissions. Please try again later." };
		}

		const db = getDbOrNull();

		if (db) {
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
			const rsvp = content.rsvp as {
				allowPlusOnes: boolean;
				maxPlusOnes: number;
			};
			if (rsvp) {
				const maxAllowed = rsvp.allowPlusOnes ? 1 + rsvp.maxPlusOnes : 1;
				if ((data.guestCount ?? 1) > maxAllowed) {
					return { error: "Guest count exceeds limit" };
				}
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
		}

		// localStorage fallback
		try {
			const guest = localSubmitRsvp(
				data.invitationId,
				{
					name: data.name,
					email: data.email,
					phone: data.phone,
					relationship: data.relationship,
					attendance: data.attendance,
					guestCount: data.guestCount ?? 1,
					dietaryRequirements: data.dietaryRequirements,
					message: data.message,
				},
				data.visitorKey,
			);
			return guest;
		} catch (err) {
			return {
				error: err instanceof Error ? err.message : "RSVP failed",
			};
		}
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
			const result = updateGuestSchema.safeParse({
				...data,
				userId: "placeholder",
			});
			if (!result.success) {
				throw new Error(result.error.issues[0].message);
			}
			return data;
		},
	)
	.handler(async ({ data }) => {
		const { userId } = await requireAuth(data.token);

		const db = getDbOrNull();

		if (db) {
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
		}

		// localStorage fallback - verify ownership
		const invitation = localGetInvitationById(data.invitationId);
		if (!invitation) {
			return { error: "Invitation not found" };
		}
		if (invitation.userId !== userId) {
			return { error: "Access denied" };
		}

		const {
			guestId,
			token: _token,
			invitationId: _invitationId,
			...patch
		} = data;
		localUpdateGuest(guestId, patch);
		return { success: true };
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
			const result = guestImportSchema.safeParse({
				invitationId: data.invitationId,
				userId: "placeholder",
				guests: data.guests,
			});
			if (!result.success) {
				throw new Error(result.error.issues[0].message);
			}
			return data;
		},
	)
	.handler(async ({ data }) => {
		const { userId } = await requireAuth(data.token);

		const db = getDbOrNull();

		if (db) {
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
		}

		// localStorage fallback - verify ownership
		const invitation = localGetInvitationById(data.invitationId);
		if (!invitation) {
			return { error: "Invitation not found" };
		}
		if (invitation.userId !== userId) {
			return { error: "Access denied" };
		}

		return localImportGuests(data.invitationId, data.guests);
	});

// ── Export guests as CSV ────────────────────────────────────────────

export const exportGuestsCsvFn = createServerFn({
	method: "GET",
})
	.inputValidator((data: { invitationId: string; token: string }) => {
		const result = exportGuestsSchema.safeParse({
			invitationId: data.invitationId,
			userId: "placeholder",
		});
		if (!result.success) {
			throw new Error(result.error.issues[0].message);
		}
		return data;
	})
	.handler(async ({ data }) => {
		const { userId } = await requireAuth(data.token);

		const db = getDbOrNull();

		if (db) {
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

			const header = [
				"name",
				"attendance",
				"guest_count",
				"dietary",
				"message",
			];
			const rows = guests.map((guest) => [
				guest.name,
				guest.attendance ?? "pending",
				(guest.guestCount ?? 1).toString(),
				guest.dietaryRequirements ?? "",
				guest.message ?? "",
			]);

			const csv = [header, ...rows]
				.map((row) =>
					row
						.map((value) => `"${String(value).replace(/"/g, '""')}"`)
						.join(","),
				)
				.join("\n");

			return { csv };
		}

		// localStorage fallback - verify ownership
		const invitation = localGetInvitationById(data.invitationId);
		if (!invitation) {
			return { error: "Invitation not found" };
		}
		if (invitation.userId !== userId) {
			return { error: "Access denied" };
		}

		return { csv: localExportGuestsCsv(data.invitationId) };
	});
