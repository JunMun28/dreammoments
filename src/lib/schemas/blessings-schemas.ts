/**
 * Zod validation schemas for blessings (guest messages) server functions.
 */

import { z } from "zod";

/**
 * UUID validation schema
 */
const uuid = z.string().uuid("Invalid UUID format");

/**
 * Schema for getting blessings for an invitation
 */
export const getBlessingsSchema = z.object({
	invitationId: uuid,
	includeReplies: z.boolean().optional().default(true),
});

export type GetBlessingsInput = z.infer<typeof getBlessingsSchema>;

/**
 * Schema for creating a new blessing
 */
export const createBlessingSchema = z.object({
	invitationId: uuid,
	authorName: z.string().min(1, "Name is required").max(100, "Name too long"),
	message: z
		.string()
		.min(1, "Message is required")
		.max(1000, "Message too long"),
	parentId: uuid.optional(), // For replies
});

export type CreateBlessingInput = z.infer<typeof createBlessingSchema>;

/**
 * Schema for updating a blessing (moderation)
 */
export const updateBlessingSchema = z.object({
	id: uuid,
	isApproved: z.boolean().optional(),
});

export type UpdateBlessingInput = z.infer<typeof updateBlessingSchema>;

/**
 * Schema for deleting a blessing
 */
export const deleteBlessingSchema = z.object({
	id: uuid,
});

export type DeleteBlessingInput = z.infer<typeof deleteBlessingSchema>;
