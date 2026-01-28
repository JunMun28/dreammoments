/**
 * Zod validation schemas for guest server functions.
 */

import { z } from "zod";

/**
 * UUID validation schema (accepts valid UUID format)
 */
const uuid = z.string().uuid("Invalid UUID format");

/**
 * Schema for creating a guest group
 */
export const createGuestGroupSchema = z.object({
	invitationId: uuid,
	name: z.string().min(1, "Group name is required").max(100, "Name too long"),
});

export type CreateGuestGroupInput = z.infer<typeof createGuestGroupSchema>;

/**
 * Schema for updating a guest group
 */
export const updateGuestGroupSchema = z.object({
	id: uuid,
	name: z
		.string()
		.min(1, "Group name is required")
		.max(100, "Name too long")
		.optional(),
});

export type UpdateGuestGroupInput = z.infer<typeof updateGuestGroupSchema>;

/**
 * Schema for deleting a guest group
 */
export const deleteGuestGroupSchema = z.object({
	id: uuid,
});

export type DeleteGuestGroupInput = z.infer<typeof deleteGuestGroupSchema>;

/**
 * Schema for creating a guest
 */
export const createGuestSchema = z.object({
	groupId: uuid,
	name: z.string().min(1, "Guest name is required").max(100, "Name too long"),
	email: z
		.string()
		.email("Invalid email format")
		.max(254, "Email too long")
		.optional()
		.nullable(),
	phone: z.string().max(20, "Phone number too long").optional().nullable(),
});

export type CreateGuestInput = z.infer<typeof createGuestSchema>;

/**
 * Schema for updating a guest
 */
export const updateGuestSchema = z.object({
	id: uuid,
	name: z
		.string()
		.min(1, "Guest name is required")
		.max(100, "Name too long")
		.optional(),
	email: z
		.string()
		.email("Invalid email format")
		.max(254, "Email too long")
		.optional()
		.nullable(),
	phone: z.string().max(20, "Phone number too long").optional().nullable(),
	groupId: uuid.optional(),
});

export type UpdateGuestInput = z.infer<typeof updateGuestSchema>;

/**
 * Schema for deleting a guest
 */
export const deleteGuestSchema = z.object({
	id: uuid,
});

export type DeleteGuestInput = z.infer<typeof deleteGuestSchema>;

/**
 * Schema for a CSV guest row
 */
export const csvGuestRowSchema = z.object({
	name: z.string().min(1, "Guest name is required").max(100, "Name too long"),
	group: z.string().max(100, "Group name too long").default("Ungrouped"),
	email: z
		.string()
		.email("Invalid email format")
		.max(254, "Email too long")
		.optional(),
	phone: z.string().max(20, "Phone number too long").optional(),
});

export type CsvGuestRow = z.infer<typeof csvGuestRowSchema>;

/**
 * Schema for importing guests from CSV
 */
export const importGuestsFromCsvSchema = z.object({
	invitationId: uuid,
	rows: z.array(csvGuestRowSchema).max(1000, "Maximum 1000 guests per import"),
});

export type ImportGuestsFromCsvInput = z.infer<
	typeof importGuestsFromCsvSchema
>;

/**
 * Schema for getting guest groups with guests
 */
export const getGuestGroupsWithGuestsSchema = z.object({
	invitationId: uuid,
});

export type GetGuestGroupsWithGuestsInput = z.infer<
	typeof getGuestGroupsWithGuestsSchema
>;

/**
 * Schema for getting guest group by token
 */
export const getGuestGroupByTokenSchema = z.object({
	token: z.string().min(1, "Token is required").max(64, "Token too long"),
});

export type GetGuestGroupByTokenInput = z.infer<
	typeof getGuestGroupByTokenSchema
>;
