import { unlink } from "node:fs/promises";
import { join } from "node:path";
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";

/**
 * Upload directory for gallery images (relative to project root)
 */
const UPLOADS_DIR = "public/uploads/gallery-images";

export const Route = createFileRoute("/api/delete-gallery-image")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				try {
					const { id } = (await request.json()) as { id: string };

					if (!id) {
						return json(
							{ error: "Missing required field: id" },
							{ status: 400 },
						);
					}

					// Verify user owns the image (via invitation)
					const {
						verifyGalleryImageOwnership,
						AuthenticationError,
						AuthorizationError,
					} = await import("@/lib/auth-helpers");
					try {
						await verifyGalleryImageOwnership(id);
					} catch (error) {
						if (error instanceof AuthenticationError) {
							return json(
								{ error: "Authentication required" },
								{ status: 401 },
							);
						}
						if (error instanceof AuthorizationError) {
							return json({ error: "Access denied" }, { status: 403 });
						}
						throw error;
					}

					// Dynamic imports to avoid bundling for client
					const { eq } = await import("drizzle-orm");
					const { getDb } = await import("@/db/index");
					const { galleryImages } = await import("@/db/schema");

					const db = await getDb();

					// Get the image to find its URL for file deletion
					const [image] = await db
						.select({ imageUrl: galleryImages.imageUrl })
						.from(galleryImages)
						.where(eq(galleryImages.id, id))
						.limit(1);

					if (!image) {
						return json({ error: "Image not found" }, { status: 404 });
					}

					// Delete from database
					await db.delete(galleryImages).where(eq(galleryImages.id, id));

					// Try to delete the file (don't fail if file doesn't exist)
					try {
						const filename = image.imageUrl.split("/").pop();
						if (filename) {
							const filepath = join(UPLOADS_DIR, filename);
							await unlink(filepath);
						}
					} catch {
						// File might not exist, that's OK
						console.warn(
							"Could not delete gallery image file:",
							image.imageUrl,
						);
					}

					return json({ success: true });
				} catch (error) {
					console.error("Gallery delete error:", error);
					return json({ error: "Delete failed" }, { status: 500 });
				}
			},
		},
	},
});
