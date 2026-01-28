import { createServerFn } from "@tanstack/react-start";
import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/db/index";
import { galleryImages } from "@/db/schema";
import {
	verifyGalleryImageOwnership,
	verifyInvitationOwnership,
} from "./auth-helpers";
import {
	addGalleryImageSchema,
	deleteGalleryImageSchema,
	getGalleryImagesSchema,
	reorderGalleryImagesSchema,
	updateGalleryImageSchema,
} from "./schemas";

export interface GalleryImageData {
	id: string;
	invitationId: string;
	imageUrl: string;
	caption?: string | null;
	order: number;
}

// ------------ Internal functions (for testing) ------------

/**
 * Get all gallery images for an invitation
 */
export async function getGalleryImagesInternal(
	invitationId: string,
): Promise<GalleryImageData[]> {
	const db = await getDb();
	const images = await db
		.select()
		.from(galleryImages)
		.where(eq(galleryImages.invitationId, invitationId))
		.orderBy(asc(galleryImages.order));

	return images.map((img) => ({
		id: img.id,
		invitationId: img.invitationId,
		imageUrl: img.imageUrl,
		caption: img.caption,
		order: img.order,
	}));
}

/**
 * Add a new gallery image
 */
export async function addGalleryImageInternal(data: {
	invitationId: string;
	imageUrl: string;
	caption?: string;
}): Promise<GalleryImageData> {
	const db = await getDb();
	// Get the max order for this invitation
	const existingImages = await db
		.select({ order: galleryImages.order })
		.from(galleryImages)
		.where(eq(galleryImages.invitationId, data.invitationId))
		.orderBy(desc(galleryImages.order))
		.limit(1);

	const maxOrder = existingImages.length > 0 ? existingImages[0].order : -1;

	const [newImage] = await db
		.insert(galleryImages)
		.values({
			invitationId: data.invitationId,
			imageUrl: data.imageUrl,
			caption: data.caption,
			order: maxOrder + 1,
		})
		.returning();

	return {
		id: newImage.id,
		invitationId: newImage.invitationId,
		imageUrl: newImage.imageUrl,
		caption: newImage.caption,
		order: newImage.order,
	};
}

/**
 * Update an existing gallery image
 */
export async function updateGalleryImageInternal(data: {
	id: string;
	caption?: string;
	order?: number;
}): Promise<GalleryImageData | null> {
	const db = await getDb();
	const updates: Partial<{ caption: string; order: number }> = {};

	if (data.caption !== undefined) {
		updates.caption = data.caption;
	}
	if (data.order !== undefined) {
		updates.order = data.order;
	}

	const [updated] = await db
		.update(galleryImages)
		.set(updates)
		.where(eq(galleryImages.id, data.id))
		.returning();

	if (!updated) return null;

	return {
		id: updated.id,
		invitationId: updated.invitationId,
		imageUrl: updated.imageUrl,
		caption: updated.caption,
		order: updated.order,
	};
}

/**
 * Delete a gallery image
 */
export async function deleteGalleryImageInternal(id: string): Promise<boolean> {
	const db = await getDb();
	const result = await db
		.delete(galleryImages)
		.where(eq(galleryImages.id, id))
		.returning();

	return result.length > 0;
}

/**
 * Reorder gallery images (swap two images)
 */
export async function reorderGalleryImagesInternal(data: {
	imageId: string;
	direction: "up" | "down";
}): Promise<boolean> {
	const db = await getDb();
	// Get the image to move
	const [currentImage] = await db
		.select()
		.from(galleryImages)
		.where(eq(galleryImages.id, data.imageId))
		.limit(1);

	if (!currentImage) return false;

	// Get all images for this invitation ordered by order
	const allImages = await db
		.select()
		.from(galleryImages)
		.where(eq(galleryImages.invitationId, currentImage.invitationId))
		.orderBy(asc(galleryImages.order));

	const currentIndex = allImages.findIndex((img) => img.id === data.imageId);
	if (currentIndex === -1) return false;

	const targetIndex =
		data.direction === "up" ? currentIndex - 1 : currentIndex + 1;
	if (targetIndex < 0 || targetIndex >= allImages.length) return false;

	const targetImage = allImages[targetIndex];

	// Swap the order values
	await Promise.all([
		db
			.update(galleryImages)
			.set({ order: targetImage.order })
			.where(eq(galleryImages.id, currentImage.id)),
		db
			.update(galleryImages)
			.set({ order: currentImage.order })
			.where(eq(galleryImages.id, targetImage.id)),
	]);

	return true;
}

// ------------ Server Functions ------------

/**
 * Get all gallery images for an invitation.
 * Requires authentication and ownership verification.
 */
export const getGalleryImages = createServerFn({ method: "GET" })
	.inputValidator((input: unknown) => getGalleryImagesSchema.parse(input))
	.handler(async ({ data }) => {
		// Verify user owns the invitation
		await verifyInvitationOwnership(data.invitationId);
		return getGalleryImagesInternal(data.invitationId);
	});

/**
 * Add a new gallery image.
 * Requires authentication and ownership verification.
 */
export const addGalleryImage = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) => addGalleryImageSchema.parse(input))
	.handler(async ({ data }) => {
		// Verify user owns the invitation
		await verifyInvitationOwnership(data.invitationId);
		return addGalleryImageInternal(data);
	});

/**
 * Update an existing gallery image.
 * Requires authentication and ownership verification.
 */
export const updateGalleryImage = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) => updateGalleryImageSchema.parse(input))
	.handler(async ({ data }) => {
		// Verify user owns the image (via invitation)
		await verifyGalleryImageOwnership(data.id);
		return updateGalleryImageInternal(data);
	});

/**
 * Delete a gallery image.
 * Requires authentication and ownership verification.
 */
export const deleteGalleryImage = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) => deleteGalleryImageSchema.parse(input))
	.handler(async ({ data }) => {
		// Verify user owns the image (via invitation)
		await verifyGalleryImageOwnership(data.id);
		return deleteGalleryImageInternal(data.id);
	});

/**
 * Reorder gallery images.
 * Requires authentication and ownership verification.
 */
export const reorderGalleryImages = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) => reorderGalleryImagesSchema.parse(input))
	.handler(async ({ data }) => {
		// Verify user owns the image (via invitation)
		await verifyGalleryImageOwnership(data.imageId);
		return reorderGalleryImagesInternal(data);
	});
