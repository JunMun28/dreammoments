/**
 * Zod validation schemas for gallery server functions.
 */

import { z } from "zod";

/**
 * UUID validation schema (accepts valid UUID format)
 */
const uuid = z.string().uuid("Invalid UUID format");

/**
 * URL validation for image URLs (relative or absolute)
 */
const imageUrl = z
	.string()
	.min(1, "Image URL is required")
	.max(500, "Image URL too long");

/**
 * Schema for getting gallery images
 */
export const getGalleryImagesSchema = z.object({
	invitationId: uuid,
});

export type GetGalleryImagesInput = z.infer<typeof getGalleryImagesSchema>;

/**
 * Schema for adding a gallery image
 */
export const addGalleryImageSchema = z.object({
	invitationId: uuid,
	imageUrl: imageUrl,
	caption: z.string().max(200, "Caption too long").optional(),
});

export type AddGalleryImageInput = z.infer<typeof addGalleryImageSchema>;

/**
 * Schema for updating a gallery image
 */
export const updateGalleryImageSchema = z.object({
	id: uuid,
	caption: z.string().max(200, "Caption too long").optional(),
	order: z.number().int().min(0).optional(),
});

export type UpdateGalleryImageInput = z.infer<typeof updateGalleryImageSchema>;

/**
 * Schema for deleting a gallery image
 */
export const deleteGalleryImageSchema = z.object({
	id: uuid,
});

export type DeleteGalleryImageInput = z.infer<typeof deleteGalleryImageSchema>;

/**
 * Schema for reordering gallery images
 */
export const reorderGalleryImagesSchema = z.object({
	imageId: uuid,
	direction: z.enum(["up", "down"]),
});

export type ReorderGalleryImagesInput = z.infer<
	typeof reorderGalleryImagesSchema
>;
