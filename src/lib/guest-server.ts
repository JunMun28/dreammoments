import crypto from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import { guestGroups, guests } from "@/db/schema";

/**
 * Generate a secure random token for RSVP links.
 * Returns a 32-character hex string (16 bytes).
 */
export function generateRsvpToken(): string {
	return crypto.randomBytes(16).toString("hex");
}

// ============================================================================
// GUEST GROUP OPERATIONS
// ============================================================================

export interface CreateGuestGroupInput {
	invitationId: string;
	name: string;
}

/**
 * Internal function to create a guest group.
 * Extracted for testability.
 */
export async function createGuestGroupInternal(input: CreateGuestGroupInput) {
	const { invitationId, name } = input;

	if (!invitationId) {
		throw new Error("invitationId is required");
	}
	if (!name.trim()) {
		throw new Error("name is required");
	}

	const rsvpToken = generateRsvpToken();

	const [group] = await db
		.insert(guestGroups)
		.values({
			invitationId,
			name: name.trim(),
			rsvpToken,
		})
		.returning({ id: guestGroups.id });

	return { id: group.id };
}

/**
 * Server function to create a guest group.
 */
export const createGuestGroup = createServerFn({ method: "POST" })
	.inputValidator((input: CreateGuestGroupInput) => input)
	.handler(async ({ data }) => {
		return createGuestGroupInternal(data);
	});

export interface UpdateGuestGroupInput {
	id: string;
	name?: string;
}

/**
 * Internal function to update a guest group.
 */
export async function updateGuestGroupInternal(input: UpdateGuestGroupInput) {
	const { id, name } = input;

	if (!id) {
		throw new Error("id is required");
	}

	const updateData: Record<string, unknown> = {
		updatedAt: new Date(),
	};

	if (name !== undefined) {
		updateData.name = name.trim();
	}

	const [group] = await db
		.update(guestGroups)
		.set(updateData)
		.where(eq(guestGroups.id, id))
		.returning({ id: guestGroups.id });

	if (!group) {
		throw new Error("Guest group not found");
	}

	return { id: group.id };
}

/**
 * Server function to update a guest group.
 */
export const updateGuestGroup = createServerFn({ method: "POST" })
	.inputValidator((input: UpdateGuestGroupInput) => input)
	.handler(async ({ data }) => {
		return updateGuestGroupInternal(data);
	});

/**
 * Internal function to delete a guest group.
 * Guests are cascade deleted via FK constraint.
 */
export async function deleteGuestGroupInternal(id: string) {
	if (!id) {
		throw new Error("id is required");
	}

	await db.delete(guestGroups).where(eq(guestGroups.id, id));

	return { success: true };
}

/**
 * Server function to delete a guest group.
 */
export const deleteGuestGroup = createServerFn({ method: "POST" })
	.inputValidator((input: { id: string }) => input)
	.handler(async ({ data }) => {
		return deleteGuestGroupInternal(data.id);
	});

// ============================================================================
// GUEST OPERATIONS
// ============================================================================

export interface CreateGuestInput {
	groupId: string;
	name: string;
	email?: string;
	phone?: string;
}

/**
 * Internal function to create a guest.
 */
export async function createGuestInternal(input: CreateGuestInput) {
	const { groupId, name, email, phone } = input;

	if (!groupId) {
		throw new Error("groupId is required");
	}
	if (!name.trim()) {
		throw new Error("name is required");
	}

	const [guest] = await db
		.insert(guests)
		.values({
			groupId,
			name: name.trim(),
			email: email?.trim() || null,
			phone: phone?.trim() || null,
		})
		.returning({ id: guests.id });

	return { id: guest.id };
}

/**
 * Server function to create a guest.
 */
export const createGuest = createServerFn({ method: "POST" })
	.inputValidator((input: CreateGuestInput) => input)
	.handler(async ({ data }) => {
		return createGuestInternal(data);
	});

export interface UpdateGuestInput {
	id: string;
	name?: string;
	email?: string;
	phone?: string;
	groupId?: string;
}

/**
 * Internal function to update a guest.
 */
export async function updateGuestInternal(input: UpdateGuestInput) {
	const { id, name, email, phone, groupId } = input;

	if (!id) {
		throw new Error("id is required");
	}

	const updateData: Record<string, unknown> = {
		updatedAt: new Date(),
	};

	if (name !== undefined) {
		updateData.name = name.trim();
	}
	if (email !== undefined) {
		updateData.email = email.trim() || null;
	}
	if (phone !== undefined) {
		updateData.phone = phone.trim() || null;
	}
	if (groupId !== undefined) {
		updateData.groupId = groupId;
	}

	const [guest] = await db
		.update(guests)
		.set(updateData)
		.where(eq(guests.id, id))
		.returning({ id: guests.id });

	if (!guest) {
		throw new Error("Guest not found");
	}

	return { id: guest.id };
}

/**
 * Server function to update a guest.
 */
export const updateGuest = createServerFn({ method: "POST" })
	.inputValidator((input: UpdateGuestInput) => input)
	.handler(async ({ data }) => {
		return updateGuestInternal(data);
	});

/**
 * Internal function to delete a guest.
 */
export async function deleteGuestInternal(id: string) {
	if (!id) {
		throw new Error("id is required");
	}

	await db.delete(guests).where(eq(guests.id, id));

	return { success: true };
}

/**
 * Server function to delete a guest.
 */
export const deleteGuest = createServerFn({ method: "POST" })
	.inputValidator((input: { id: string }) => input)
	.handler(async ({ data }) => {
		return deleteGuestInternal(data.id);
	});

// ============================================================================
// BULK IMPORT FROM CSV
// ============================================================================

export interface CsvGuestRow {
	name: string;
	group: string;
	email?: string;
	phone?: string;
}

export interface ImportGuestsFromCsvInput {
	invitationId: string;
	rows: CsvGuestRow[];
}

/**
 * Internal function to import guests from CSV data.
 * Creates groups as needed, then creates guests in each group.
 */
export async function importGuestsFromCsvInternal(
	input: ImportGuestsFromCsvInput,
) {
	const { invitationId, rows } = input;

	if (!invitationId) {
		throw new Error("invitationId is required");
	}

	if (rows.length === 0) {
		return { groupsCreated: 0, guestsCreated: 0 };
	}

	// Group rows by group name
	const groupedRows = new Map<string, CsvGuestRow[]>();
	for (const row of rows) {
		const groupName = row.group || "Ungrouped";
		const existing = groupedRows.get(groupName) || [];
		existing.push(row);
		groupedRows.set(groupName, existing);
	}

	let groupsCreated = 0;
	let guestsCreated = 0;

	// Create each group and its guests
	for (const [groupName, groupRows] of groupedRows) {
		// Create the group
		const { id: groupId } = await createGuestGroupInternal({
			invitationId,
			name: groupName,
		});
		groupsCreated++;

		// Create guests in the group
		for (const row of groupRows) {
			await createGuestInternal({
				groupId,
				name: row.name,
				email: row.email,
				phone: row.phone,
			});
			guestsCreated++;
		}
	}

	return { groupsCreated, guestsCreated };
}

/**
 * Server function to import guests from CSV data.
 */
export const importGuestsFromCsv = createServerFn({ method: "POST" })
	.inputValidator((input: ImportGuestsFromCsvInput) => input)
	.handler(async ({ data }) => {
		return importGuestsFromCsvInternal(data);
	});

// ============================================================================
// QUERY OPERATIONS
// ============================================================================

export interface GuestGroupWithGuests {
	id: string;
	name: string;
	rsvpToken: string;
	guests: {
		id: string;
		name: string;
		email: string | null;
		phone: string | null;
	}[];
}

/**
 * Internal function to get all guest groups with their guests.
 */
export async function getGuestGroupsWithGuestsInternal(
	invitationId: string,
): Promise<GuestGroupWithGuests[]> {
	if (!invitationId) {
		throw new Error("invitationId is required");
	}

	// Get all groups for this invitation
	const groups = await db
		.select()
		.from(guestGroups)
		.where(eq(guestGroups.invitationId, invitationId));

	if (groups.length === 0) {
		return [];
	}

	// Get guests for each group
	const result: GuestGroupWithGuests[] = [];

	for (const group of groups) {
		const groupGuests = await db
			.select()
			.from(guests)
			.where(eq(guests.groupId, group.id));

		result.push({
			id: group.id,
			name: group.name,
			rsvpToken: group.rsvpToken,
			guests: groupGuests.map((g) => ({
				id: g.id,
				name: g.name,
				email: g.email,
				phone: g.phone,
			})),
		});
	}

	return result;
}

/**
 * Server function to get guest groups with their guests.
 */
export const getGuestGroupsWithGuests = createServerFn({ method: "GET" })
	.inputValidator((input: { invitationId: string }) => input)
	.handler(async ({ data }) => {
		return getGuestGroupsWithGuestsInternal(data.invitationId);
	});
