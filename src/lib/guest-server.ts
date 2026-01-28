import crypto from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { eq, inArray } from "drizzle-orm";
import { getDb } from "@/db/index";
import { guestGroups, guests } from "@/db/schema";
import {
	verifyGuestGroupOwnership,
	verifyGuestOwnership,
	verifyInvitationOwnership,
} from "./auth-helpers";
import {
	createGuestGroupSchema,
	createGuestSchema,
	deleteGuestGroupSchema,
	deleteGuestSchema,
	getGuestGroupByTokenSchema,
	getGuestGroupsWithGuestsSchema,
	importGuestsFromCsvSchema,
	updateGuestGroupSchema,
	updateGuestSchema,
} from "./schemas";

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

	const db = await getDb();
	const [group] = await db
		.insert(guestGroups)
		.values({
			invitationId,
			name: name.trim(),
			rsvpToken,
		})
		.returning({ id: guestGroups.id });

	return { id: group.id, rsvpToken };
}

/**
 * Server function to create a guest group.
 * Requires authentication and ownership verification.
 */
export const createGuestGroup = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) => createGuestGroupSchema.parse(input))
	.handler(async ({ data }) => {
		// Verify user owns the invitation
		await verifyInvitationOwnership(data.invitationId);
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

	const db = await getDb();
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
 * Requires authentication and ownership verification.
 */
export const updateGuestGroup = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) => updateGuestGroupSchema.parse(input))
	.handler(async ({ data }) => {
		// Verify user owns the group (via invitation)
		await verifyGuestGroupOwnership(data.id);
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

	const db = await getDb();
	await db.delete(guestGroups).where(eq(guestGroups.id, id));

	return { success: true };
}

/**
 * Server function to delete a guest group.
 * Requires authentication and ownership verification.
 */
export const deleteGuestGroup = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) => deleteGuestGroupSchema.parse(input))
	.handler(async ({ data }) => {
		// Verify user owns the group (via invitation)
		await verifyGuestGroupOwnership(data.id);
		return deleteGuestGroupInternal(data.id);
	});

// ============================================================================
// GUEST OPERATIONS
// ============================================================================

export interface CreateGuestInput {
	groupId: string;
	name: string;
	email?: string | null;
	phone?: string | null;
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

	const db = await getDb();
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
 * Requires authentication and ownership verification.
 */
export const createGuest = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) => createGuestSchema.parse(input))
	.handler(async ({ data }) => {
		// Verify user owns the group (via invitation)
		await verifyGuestGroupOwnership(data.groupId);
		return createGuestInternal(data);
	});

export interface UpdateGuestInput {
	id: string;
	name?: string;
	email?: string | null;
	phone?: string | null;
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
		updateData.email = email?.trim() || null;
	}
	if (phone !== undefined) {
		updateData.phone = phone?.trim() || null;
	}
	if (groupId !== undefined) {
		updateData.groupId = groupId;
	}

	const db = await getDb();
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
 * Requires authentication and ownership verification.
 */
export const updateGuest = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) => updateGuestSchema.parse(input))
	.handler(async ({ data }) => {
		// Verify user owns the guest (via group → invitation)
		await verifyGuestOwnership(data.id);
		// If moving to a new group, verify ownership of that group too
		if (data.groupId) {
			await verifyGuestGroupOwnership(data.groupId);
		}
		return updateGuestInternal(data);
	});

/**
 * Internal function to delete a guest.
 */
export async function deleteGuestInternal(id: string) {
	if (!id) {
		throw new Error("id is required");
	}

	const db = await getDb();
	await db.delete(guests).where(eq(guests.id, id));

	return { success: true };
}

/**
 * Server function to delete a guest.
 * Requires authentication and ownership verification.
 */
export const deleteGuest = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) => deleteGuestSchema.parse(input))
	.handler(async ({ data }) => {
		// Verify user owns the guest (via group → invitation)
		await verifyGuestOwnership(data.id);
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
 * Requires authentication and ownership verification.
 */
export const importGuestsFromCsv = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) => importGuestsFromCsvSchema.parse(input))
	.handler(async ({ data }) => {
		// Verify user owns the invitation
		await verifyInvitationOwnership(data.invitationId);
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
 * Uses a single batch query to avoid N+1 performance issues.
 */
export async function getGuestGroupsWithGuestsInternal(
	invitationId: string,
): Promise<GuestGroupWithGuests[]> {
	if (!invitationId) {
		throw new Error("invitationId is required");
	}

	const db = await getDb();

	// Get all groups for this invitation
	const groups = await db
		.select()
		.from(guestGroups)
		.where(eq(guestGroups.invitationId, invitationId));

	if (groups.length === 0) {
		return [];
	}

	// Batch load all guests for these groups in a single query (fixes N+1)
	const groupIds = groups.map((g) => g.id);
	const allGuests = await db
		.select()
		.from(guests)
		.where(inArray(guests.groupId, groupIds));

	// Group guests by their groupId
	const guestsByGroupId = new Map<
		string,
		Array<{
			id: string;
			name: string;
			email: string | null;
			phone: string | null;
		}>
	>();
	for (const guest of allGuests) {
		const groupGuests = guestsByGroupId.get(guest.groupId) || [];
		groupGuests.push({
			id: guest.id,
			name: guest.name,
			email: guest.email,
			phone: guest.phone,
		});
		guestsByGroupId.set(guest.groupId, groupGuests);
	}

	// Assemble the result
	return groups.map((group) => ({
		id: group.id,
		name: group.name,
		rsvpToken: group.rsvpToken,
		guests: guestsByGroupId.get(group.id) || [],
	}));
}

/**
 * Server function to get guest groups with their guests.
 * Requires authentication and ownership verification.
 */
export const getGuestGroupsWithGuests = createServerFn({ method: "GET" })
	.inputValidator((input: unknown) =>
		getGuestGroupsWithGuestsSchema.parse(input),
	)
	.handler(async ({ data }) => {
		// Verify user owns the invitation
		await verifyInvitationOwnership(data.invitationId);
		return getGuestGroupsWithGuestsInternal(data.invitationId);
	});

// ============================================================================
// RSVP TOKEN LOOKUP
// ============================================================================

export interface GuestGroupByToken {
	id: string;
	name: string;
	rsvpToken: string;
	invitationId: string;
	guests: {
		id: string;
		name: string;
		email: string | null;
		phone: string | null;
	}[];
}

/**
 * Internal function to look up a guest group by its RSVP token.
 * Returns the group with its guests, or null if not found.
 */
export async function getGuestGroupByTokenInternal(
	token: string,
): Promise<GuestGroupByToken | null> {
	if (!token) {
		throw new Error("token is required");
	}

	// Find the group by token
	const db = await getDb();
	const groupResults = await db
		.select()
		.from(guestGroups)
		.where(eq(guestGroups.rsvpToken, token))
		.limit(1);

	if (groupResults.length === 0) {
		return null;
	}

	const group = groupResults[0];

	// Get the guests in this group
	const groupGuests = await db
		.select()
		.from(guests)
		.where(eq(guests.groupId, group.id));

	return {
		id: group.id,
		name: group.name,
		rsvpToken: group.rsvpToken,
		invitationId: group.invitationId,
		guests: groupGuests.map((g) => ({
			id: g.id,
			name: g.name,
			email: g.email,
			phone: g.phone,
		})),
	};
}

/**
 * Server function to get a guest group by its RSVP token.
 * Used by the /rsvp page to look up the group from the URL token.
 * NOTE: This uses token-based auth (RSVP flow), not session auth.
 */
export const getGuestGroupByToken = createServerFn({ method: "GET" })
	.inputValidator((input: unknown) => getGuestGroupByTokenSchema.parse(input))
	.handler(async ({ data }) => {
		// No ownership check needed - token-based auth for RSVP flow
		return getGuestGroupByTokenInternal(data.token);
	});
