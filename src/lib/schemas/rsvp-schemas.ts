/**
 * Zod validation schemas for RSVP server functions.
 */

import { z } from "zod";

/**
 * UUID validation schema (accepts valid UUID format)
 */
const uuid = z.string().uuid("Invalid UUID format");

/**
 * Schema for a single RSVP response
 */
export const rsvpResponseInputSchema = z.object({
	guestId: uuid,
	attending: z.boolean(),
	mealPreference: z.string().max(100, "Meal preference too long").optional(),
	dietaryNotes: z.string().max(500, "Dietary notes too long").optional(),
	plusOneCount: z
		.number()
		.int()
		.min(0)
		.max(10, "Maximum 10 plus-ones")
		.optional(),
	plusOneNames: z.string().max(500, "Plus-one names too long").optional(),
});

export type RsvpResponseInput = z.infer<typeof rsvpResponseInputSchema>;

/**
 * Schema for submitting RSVP responses for a group
 */
export const submitRsvpSchema = z.object({
	groupId: uuid,
	responses: z
		.array(rsvpResponseInputSchema)
		.min(1, "At least one response is required")
		.max(100, "Maximum 100 responses per submission"),
});

export type SubmitRsvpInput = z.infer<typeof submitRsvpSchema>;

/**
 * Schema for getting group RSVP status
 */
export const getGroupRsvpStatusSchema = z.object({
	groupId: uuid,
});

export type GetGroupRsvpStatusInput = z.infer<typeof getGroupRsvpStatusSchema>;

/**
 * Schema for getting invitation RSVP summary
 */
export const getInvitationRsvpSummarySchema = z.object({
	invitationId: uuid,
});

export type GetInvitationRsvpSummaryInput = z.infer<
	typeof getInvitationRsvpSummarySchema
>;

/**
 * Schema for getting invitation guest responses
 */
export const getInvitationGuestResponsesSchema = z.object({
	invitationId: uuid,
});

export type GetInvitationGuestResponsesInput = z.infer<
	typeof getInvitationGuestResponsesSchema
>;
