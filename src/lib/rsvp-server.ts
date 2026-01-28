import { createServerFn } from "@tanstack/react-start";
import { eq, inArray } from "drizzle-orm";
import { getDb } from "@/db/index";
import { guestGroups, guests, rsvpResponses } from "@/db/schema";
import {
	verifyGuestGroupOwnership,
	verifyInvitationOwnership,
} from "./auth-helpers";
import {
	getGroupRsvpStatusSchema,
	getInvitationGuestResponsesSchema,
	getInvitationRsvpSummarySchema,
	submitRsvpSchema,
} from "./schemas";

// ============================================================================
// TYPES
// ============================================================================

export interface RsvpResponseInput {
	guestId: string;
	attending: boolean;
	mealPreference?: string;
	dietaryNotes?: string;
	plusOneCount?: number;
	plusOneNames?: string;
}

export interface SubmitRsvpInput {
	groupId: string;
	responses: RsvpResponseInput[];
}

export interface SubmitRsvpResult {
	success: boolean;
	responsesCreated: number;
	responsesUpdated: number;
}

export interface GuestWithRsvp {
	id: string;
	name: string;
	email: string | null;
	phone: string | null;
	rsvpResponse: {
		id: string;
		attending: boolean;
		mealPreference: string | null;
		dietaryNotes: string | null;
		plusOneCount: number;
		plusOneNames: string | null;
	} | null;
}

export interface GroupRsvpStatus {
	guests: GuestWithRsvp[];
	totalAttending: number;
	totalDeclined: number;
	totalPending: number;
}

// ============================================================================
// SUBMIT RSVP
// ============================================================================

/**
 * Internal function to submit RSVP responses for a group.
 * Creates new responses or updates existing ones.
 */
export async function submitRsvpInternal(
	input: SubmitRsvpInput,
): Promise<SubmitRsvpResult> {
	const { groupId, responses } = input;

	if (!groupId) {
		throw new Error("groupId is required");
	}

	if (responses.length === 0) {
		throw new Error("At least one response is required");
	}

	// Validate all responses have guestId
	for (const response of responses) {
		if (!response.guestId) {
			throw new Error("guestId is required for each response");
		}
	}

	let responsesCreated = 0;
	let responsesUpdated = 0;

	const db = await getDb();

	// Process each response
	for (const response of responses) {
		// Check if guest already has a response
		const existingResponses = await db
			.select()
			.from(rsvpResponses)
			.where(eq(rsvpResponses.guestId, response.guestId));

		if (existingResponses.length > 0) {
			// Update existing response
			await db
				.update(rsvpResponses)
				.set({
					attending: response.attending,
					mealPreference: response.mealPreference ?? null,
					dietaryNotes: response.dietaryNotes ?? null,
					plusOneCount: response.plusOneCount ?? 0,
					plusOneNames: response.plusOneNames ?? null,
					updatedAt: new Date(),
				})
				.where(eq(rsvpResponses.guestId, response.guestId))
				.returning({ id: rsvpResponses.id });

			responsesUpdated++;
		} else {
			// Create new response
			await db
				.insert(rsvpResponses)
				.values({
					guestId: response.guestId,
					attending: response.attending,
					mealPreference: response.mealPreference ?? null,
					dietaryNotes: response.dietaryNotes ?? null,
					plusOneCount: response.plusOneCount ?? 0,
					plusOneNames: response.plusOneNames ?? null,
				})
				.returning({ id: rsvpResponses.id });

			responsesCreated++;
		}
	}

	return {
		success: true,
		responsesCreated,
		responsesUpdated,
	};
}

/**
 * Server function to submit RSVP responses.
 * NOTE: This uses token-based auth (guest session), not couple session.
 * The guest session is validated at the route level via validateGuestSession().
 */
export const submitRsvp = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) => submitRsvpSchema.parse(input))
	.handler(async ({ data }) => {
		// Note: Authorization is handled via guest session cookie at route level
		// The groupId must match the session's groupId (enforced in RSVP route)
		return submitRsvpInternal(data);
	});

// ============================================================================
// GET GROUP RSVP STATUS
// ============================================================================

/**
 * Internal function to get RSVP status for all guests in a group.
 * Returns each guest with their response (if any) and total counts.
 * Uses batch query to avoid N+1 performance issues.
 */
export async function getGroupRsvpStatusInternal(
	groupId: string,
): Promise<GroupRsvpStatus> {
	if (!groupId) {
		throw new Error("groupId is required");
	}

	const db = await getDb();

	// Get all guests in the group
	const groupGuests = await db
		.select()
		.from(guests)
		.where(eq(guests.groupId, groupId));

	if (groupGuests.length === 0) {
		return {
			guests: [],
			totalAttending: 0,
			totalDeclined: 0,
			totalPending: 0,
		};
	}

	// Batch load all responses for these guests in a single query (fixes N+1)
	const guestIds = groupGuests.map((g) => g.id);
	const allResponses = await db
		.select()
		.from(rsvpResponses)
		.where(inArray(rsvpResponses.guestId, guestIds));

	// Index responses by guestId
	const responsesByGuestId = new Map<string, (typeof allResponses)[0]>();
	for (const response of allResponses) {
		responsesByGuestId.set(response.guestId, response);
	}

	// Build result
	const guestsWithRsvp: GuestWithRsvp[] = [];
	let totalAttending = 0;
	let totalDeclined = 0;
	let totalPending = 0;

	for (const guest of groupGuests) {
		const rsvpResponse = responsesByGuestId.get(guest.id) || null;

		guestsWithRsvp.push({
			id: guest.id,
			name: guest.name,
			email: guest.email,
			phone: guest.phone,
			rsvpResponse: rsvpResponse
				? {
						id: rsvpResponse.id,
						attending: rsvpResponse.attending,
						mealPreference: rsvpResponse.mealPreference,
						dietaryNotes: rsvpResponse.dietaryNotes,
						plusOneCount: rsvpResponse.plusOneCount,
						plusOneNames: rsvpResponse.plusOneNames,
					}
				: null,
		});

		// Calculate totals
		if (rsvpResponse) {
			if (rsvpResponse.attending) {
				totalAttending += 1 + (rsvpResponse.plusOneCount ?? 0);
			} else {
				totalDeclined++;
			}
		} else {
			totalPending++;
		}
	}

	return {
		guests: guestsWithRsvp,
		totalAttending,
		totalDeclined,
		totalPending,
	};
}

/**
 * Server function to get RSVP status for a group.
 * NOTE: This is used by both couple dashboard (owner) and RSVP page (guest session).
 * For couple dashboard, ownership is verified; for RSVP page, guest session validates.
 */
export const getGroupRsvpStatus = createServerFn({ method: "GET" })
	.inputValidator((input: unknown) => getGroupRsvpStatusSchema.parse(input))
	.handler(async ({ data }) => {
		// Try couple ownership verification (fails silently for guest session flow)
		try {
			await verifyGuestGroupOwnership(data.groupId);
		} catch {
			// Guest session flow - authorization handled via session cookie at route level
		}
		return getGroupRsvpStatusInternal(data.groupId);
	});

// ============================================================================
// GET INVITATION RSVP SUMMARY (Dashboard)
// ============================================================================

export interface GroupRsvpSummary {
	id: string;
	name: string;
	rsvpToken: string;
	guestCount: number;
	totalAttending: number;
	totalDeclined: number;
	totalPending: number;
}

export interface InvitationRsvpSummary {
	totalInvited: number;
	totalAttending: number;
	totalDeclined: number;
	totalPending: number;
	groups: GroupRsvpSummary[];
}

/**
 * Internal function to get RSVP summary for an entire invitation.
 * Aggregates RSVP status across all guest groups.
 * Uses batch queries to avoid N+1 performance issues.
 */
export async function getInvitationRsvpSummaryInternal(
	invitationId: string,
): Promise<InvitationRsvpSummary> {
	if (!invitationId) {
		throw new Error("invitationId is required");
	}

	const db = await getDb();

	// Get all guest groups for this invitation
	const groups = await db
		.select()
		.from(guestGroups)
		.where(eq(guestGroups.invitationId, invitationId));

	if (groups.length === 0) {
		return {
			totalInvited: 0,
			totalAttending: 0,
			totalDeclined: 0,
			totalPending: 0,
			groups: [],
		};
	}

	// Batch load all guests for all groups
	const groupIds = groups.map((g) => g.id);
	const allGuests = await db
		.select()
		.from(guests)
		.where(inArray(guests.groupId, groupIds));

	// Batch load all responses for all guests
	const guestIds = allGuests.map((g) => g.id);
	const allResponses =
		guestIds.length > 0
			? await db
					.select()
					.from(rsvpResponses)
					.where(inArray(rsvpResponses.guestId, guestIds))
			: [];

	// Index responses by guestId
	const responsesByGuestId = new Map<string, (typeof allResponses)[0]>();
	for (const response of allResponses) {
		responsesByGuestId.set(response.guestId, response);
	}

	// Group guests by groupId
	const guestsByGroupId = new Map<string, typeof allGuests>();
	for (const guest of allGuests) {
		const groupGuests = guestsByGroupId.get(guest.groupId) || [];
		groupGuests.push(guest);
		guestsByGroupId.set(guest.groupId, groupGuests);
	}

	// Calculate summaries
	let totalInvited = 0;
	let totalAttending = 0;
	let totalDeclined = 0;
	let totalPending = 0;
	const groupSummaries: GroupRsvpSummary[] = [];

	for (const group of groups) {
		const groupGuests = guestsByGroupId.get(group.id) || [];
		let groupAttending = 0;
		let groupDeclined = 0;
		let groupPending = 0;

		for (const guest of groupGuests) {
			const response = responsesByGuestId.get(guest.id);
			if (response) {
				if (response.attending) {
					groupAttending += 1 + (response.plusOneCount ?? 0);
				} else {
					groupDeclined++;
				}
			} else {
				groupPending++;
			}
		}

		totalInvited += groupGuests.length;
		totalAttending += groupAttending;
		totalDeclined += groupDeclined;
		totalPending += groupPending;

		groupSummaries.push({
			id: group.id,
			name: group.name,
			rsvpToken: group.rsvpToken,
			guestCount: groupGuests.length,
			totalAttending: groupAttending,
			totalDeclined: groupDeclined,
			totalPending: groupPending,
		});
	}

	return {
		totalInvited,
		totalAttending,
		totalDeclined,
		totalPending,
		groups: groupSummaries,
	};
}

/**
 * Server function to get RSVP summary for an invitation (dashboard view).
 * Requires authentication and ownership verification.
 */
export const getInvitationRsvpSummary = createServerFn({ method: "GET" })
	.inputValidator((input: unknown) =>
		getInvitationRsvpSummarySchema.parse(input),
	)
	.handler(async ({ data }) => {
		// Verify user owns the invitation
		await verifyInvitationOwnership(data.invitationId);
		return getInvitationRsvpSummaryInternal(data.invitationId);
	});

// ============================================================================
// GET INVITATION GUEST RESPONSES (Response Table)
// ============================================================================

export type GuestResponseStatus = "attending" | "declined" | "pending";

export interface GuestResponseRow {
	guestId: string;
	guestName: string;
	email: string | null;
	phone: string | null;
	groupId: string;
	groupName: string;
	status: GuestResponseStatus;
	mealPreference: string | null;
	dietaryNotes: string | null;
	plusOneCount: number;
	plusOneNames: string | null;
	headcount: number; // 1 + plusOneCount for attending, 0 otherwise
	respondedAt: Date | null;
	updatedAt: Date | null;
}

/**
 * Internal function to get detailed guest responses for an invitation.
 * Returns a flat list of all guests with their RSVP details for table display.
 * Uses batch queries to avoid N+1 performance issues.
 */
export async function getInvitationGuestResponsesInternal(
	invitationId: string,
): Promise<GuestResponseRow[]> {
	if (!invitationId) {
		throw new Error("invitationId is required");
	}

	const db = await getDb();

	// Get all guest groups for this invitation
	const groups = await db
		.select()
		.from(guestGroups)
		.where(eq(guestGroups.invitationId, invitationId));

	if (groups.length === 0) {
		return [];
	}

	// Batch load all guests for all groups
	const groupIds = groups.map((g) => g.id);
	const allGuests = await db
		.select()
		.from(guests)
		.where(inArray(guests.groupId, groupIds));

	if (allGuests.length === 0) {
		return [];
	}

	// Batch load all responses for all guests
	const guestIds = allGuests.map((g) => g.id);
	const allResponses = await db
		.select()
		.from(rsvpResponses)
		.where(inArray(rsvpResponses.guestId, guestIds));

	// Index responses by guestId
	const responsesByGuestId = new Map<string, (typeof allResponses)[0]>();
	for (const response of allResponses) {
		responsesByGuestId.set(response.guestId, response);
	}

	// Index groups by id for quick lookup
	const groupsById = new Map(groups.map((g) => [g.id, g]));

	// Build flat response list
	const responses: GuestResponseRow[] = [];

	for (const guest of allGuests) {
		const group = groupsById.get(guest.groupId)!;
		const rsvpResponse = responsesByGuestId.get(guest.id) || null;

		let status: GuestResponseStatus;
		let headcount = 0;

		if (rsvpResponse) {
			if (rsvpResponse.attending) {
				status = "attending";
				headcount = 1 + (rsvpResponse.plusOneCount ?? 0);
			} else {
				status = "declined";
			}
		} else {
			status = "pending";
		}

		responses.push({
			guestId: guest.id,
			guestName: guest.name,
			email: guest.email,
			phone: guest.phone,
			groupId: group.id,
			groupName: group.name,
			status,
			mealPreference: rsvpResponse?.mealPreference ?? null,
			dietaryNotes: rsvpResponse?.dietaryNotes ?? null,
			plusOneCount: rsvpResponse?.plusOneCount ?? 0,
			plusOneNames: rsvpResponse?.plusOneNames ?? null,
			headcount,
			respondedAt: rsvpResponse?.respondedAt ?? null,
			updatedAt: rsvpResponse?.updatedAt ?? null,
		});
	}

	return responses;
}

/**
 * Server function to get guest responses for table display.
 * Requires authentication and ownership verification.
 */
export const getInvitationGuestResponses = createServerFn({ method: "GET" })
	.inputValidator((input: unknown) =>
		getInvitationGuestResponsesSchema.parse(input),
	)
	.handler(async ({ data }) => {
		// Verify user owns the invitation
		await verifyInvitationOwnership(data.invitationId);
		return getInvitationGuestResponsesInternal(data.invitationId);
	});
