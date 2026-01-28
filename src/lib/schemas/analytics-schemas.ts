/**
 * Zod validation schemas for analytics server functions.
 */

import { z } from "zod";

/**
 * UUID validation schema
 */
const uuid = z.string().uuid("Invalid UUID format");

/**
 * Device type enum
 */
export const deviceTypeSchema = z.enum(["mobile", "desktop", "tablet"]);

export type DeviceType = z.infer<typeof deviceTypeSchema>;

/**
 * Schema for tracking a page view
 */
export const trackViewSchema = z.object({
	invitationId: uuid,
	sessionId: z.string().min(1, "Session ID required"),
	deviceType: deviceTypeSchema.optional(),
	referrer: z.string().optional(),
	sectionsViewed: z.array(z.string()).optional(),
	rsvpSubmitted: z.boolean().optional(),
});

export type TrackViewInput = z.infer<typeof trackViewSchema>;

/**
 * Schema for updating sections viewed
 */
export const updateSectionsViewedSchema = z.object({
	viewId: uuid,
	sectionsViewed: z.array(z.string()),
});

export type UpdateSectionsViewedInput = z.infer<
	typeof updateSectionsViewedSchema
>;

/**
 * Schema for marking RSVP submitted
 */
export const markRsvpSubmittedSchema = z.object({
	viewId: uuid,
});

export type MarkRsvpSubmittedInput = z.infer<typeof markRsvpSubmittedSchema>;

/**
 * Schema for getting analytics for an invitation
 */
export const getAnalyticsSchema = z.object({
	invitationId: uuid,
	startDate: z.string().optional(), // ISO date string
	endDate: z.string().optional(), // ISO date string
});

export type GetAnalyticsInput = z.infer<typeof getAnalyticsSchema>;
