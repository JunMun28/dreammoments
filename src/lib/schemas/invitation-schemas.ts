/**
 * Zod validation schemas for invitation server functions.
 */

import { z } from "zod";

/**
 * UUID validation schema (accepts valid UUID format)
 */
const uuid = z.string().uuid("Invalid UUID format");

/**
 * ISO date string validation (YYYY-MM-DD format)
 */
const isoDateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (expected YYYY-MM-DD)")
  .nullable()
  .optional();

/**
 * Time string validation (HH:mm format)
 */
const timeString = z
  .string()
  .regex(/^\d{2}:\d{2}$/, "Invalid time format (expected HH:mm)")
  .nullable()
  .optional();

/**
 * Schema for updating invitation basic info
 */
export const updateInvitationSchema = z.object({
  invitationId: uuid,
  partner1Name: z.string().max(100, "Partner name too long").optional(),
  partner2Name: z.string().max(100, "Partner name too long").optional(),
  weddingDate: isoDateString,
  weddingTime: timeString,
  venueName: z.string().max(200, "Venue name too long").nullable().optional(),
  venueAddress: z
    .string()
    .max(500, "Venue address too long")
    .nullable()
    .optional(),
});

export type UpdateInvitationInput = z.infer<typeof updateInvitationSchema>;

/**
 * Schema for creating a new invitation
 */
export const createInvitationSchema = z.object({
  userId: uuid,
  templateId: z.string().max(50, "Template ID too long").optional(),
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;

/**
 * Schema for getting or creating an invitation
 */
export const getOrCreateInvitationSchema = z.object({
  userId: uuid,
  templateId: z.string().max(50, "Template ID too long").optional(),
});

export type GetOrCreateInvitationInput = z.infer<
  typeof getOrCreateInvitationSchema
>;

/**
 * Schema for getting invitation by ID
 */
export const getInvitationSchema = z.object({
  id: uuid,
});

export type GetInvitationInput = z.infer<typeof getInvitationSchema>;

/**
 * Schema for getting invitation with relations
 */
export const getInvitationWithRelationsSchema = z.object({
  invitationId: uuid,
});

export type GetInvitationWithRelationsInput = z.infer<
  typeof getInvitationWithRelationsSchema
>;
