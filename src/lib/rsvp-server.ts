import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import { guestGroups, guests, rsvpResponses } from "@/db/schema";

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
 */
export const submitRsvp = createServerFn({ method: "POST" })
	.inputValidator((input: SubmitRsvpInput) => input)
	.handler(async ({ data }) => {
		return submitRsvpInternal(data);
	});

// ============================================================================
// GET GROUP RSVP STATUS
// ============================================================================

/**
 * Internal function to get RSVP status for all guests in a group.
 * Returns each guest with their response (if any) and total counts.
 */
export async function getGroupRsvpStatusInternal(
	groupId: string,
): Promise<GroupRsvpStatus> {
	if (!groupId) {
		throw new Error("groupId is required");
	}

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

	// Get RSVP responses for each guest
	const guestsWithRsvp: GuestWithRsvp[] = [];
	let totalAttending = 0;
	let totalDeclined = 0;
	let totalPending = 0;

	for (const guest of groupGuests) {
		const responses = await db
			.select()
			.from(rsvpResponses)
			.where(eq(rsvpResponses.guestId, guest.id));

		const rsvpResponse = responses.length > 0 ? responses[0] : null;

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
				// Count the guest + their plus-ones
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
 */
export const getGroupRsvpStatus = createServerFn({ method: "GET" })
	.inputValidator((input: { groupId: string }) => input)
	.handler(async ({ data }) => {
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
 */
export async function getInvitationRsvpSummaryInternal(
	invitationId: string,
): Promise<InvitationRsvpSummary> {
	if (!invitationId) {
		throw new Error("invitationId is required");
	}

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

	let totalInvited = 0;
	let totalAttending = 0;
	let totalDeclined = 0;
	let totalPending = 0;
	const groupSummaries: GroupRsvpSummary[] = [];

	// Get RSVP status for each group
	for (const group of groups) {
		const groupStatus = await getGroupRsvpStatusInternal(group.id);

		const guestCount = groupStatus.guests.length;
		totalInvited += guestCount;
		totalAttending += groupStatus.totalAttending;
		totalDeclined += groupStatus.totalDeclined;
		totalPending += groupStatus.totalPending;

		groupSummaries.push({
			id: group.id,
			name: group.name,
			rsvpToken: group.rsvpToken,
			guestCount,
			totalAttending: groupStatus.totalAttending,
			totalDeclined: groupStatus.totalDeclined,
			totalPending: groupStatus.totalPending,
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
 */
export const getInvitationRsvpSummary = createServerFn({ method: "GET" })
	.inputValidator((input: { invitationId: string }) => input)
	.handler(async ({ data }) => {
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
 */
export async function getInvitationGuestResponsesInternal(
	invitationId: string,
): Promise<GuestResponseRow[]> {
	if (!invitationId) {
		throw new Error("invitationId is required");
	}

	// Get all guest groups for this invitation
	const groups = await db
		.select()
		.from(guestGroups)
		.where(eq(guestGroups.invitationId, invitationId));

	if (groups.length === 0) {
		return [];
	}

	const responses: GuestResponseRow[] = [];

	// Get guests and their responses for each group
	for (const group of groups) {
		const groupGuests = await db
			.select()
			.from(guests)
			.where(eq(guests.groupId, group.id));

		for (const guest of groupGuests) {
			const rsvpResponseRows = await db
				.select()
				.from(rsvpResponses)
				.where(eq(rsvpResponses.guestId, guest.id));

			const rsvpResponse =
				rsvpResponseRows.length > 0 ? rsvpResponseRows[0] : null;

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
	}

	return responses;
}

/**
 * Server function to get guest responses for table display.
 */
export const getInvitationGuestResponses = createServerFn({ method: "GET" })
	.inputValidator((input: { invitationId: string }) => input)
	.handler(async ({ data }) => {
		return getInvitationGuestResponsesInternal(data.invitationId);
	});
