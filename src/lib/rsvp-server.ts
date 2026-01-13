import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import { guests, rsvpResponses } from "@/db/schema";

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
