import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";

/**
 * Upload directory for gallery images (relative to project root)
 */
const UPLOADS_DIR = "public/uploads/gallery-images";

/**
 * Base URL path for uploaded images
 */
const UPLOADS_URL_BASE = "/uploads/gallery-images";

/**
 * Generate a unique filename for uploaded images
 */
function generateFilename(invitationId: string): string {
	const timestamp = Date.now();
	const random = Math.random().toString(36).slice(2, 8);
	return `${invitationId}-${timestamp}-${random}.webp`;
}

/**
 * Ensure upload directory exists
 */
async function ensureUploadDir(): Promise<void> {
	await mkdir(UPLOADS_DIR, { recursive: true });
}

export const Route = createFileRoute("/api/upload-gallery-image")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				try {
					const formData = await request.formData();
					const image = formData.get("image") as Blob | null;
					const invitationId = formData.get("invitationId") as string | null;
					const caption = formData.get("caption") as string | null;

					if (!image || !invitationId) {
						return json(
							{ error: "Missing required fields: image and invitationId" },
							{ status: 400 },
						);
					}

					// Verify user owns the invitation
					const {
						verifyInvitationOwnership,
						AuthenticationError,
						AuthorizationError,
					} = await import("@/lib/auth-helpers");
					try {
						await verifyInvitationOwnership(invitationId);
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

					// Validate image type
					if (!image.type.startsWith("image/")) {
						return json({ error: "Invalid file type" }, { status: 400 });
					}

					// Validate image size (max 5MB for compressed WebP)
					const MAX_SIZE = 5 * 1024 * 1024;
					if (image.size > MAX_SIZE) {
						return json({ error: "File too large" }, { status: 400 });
					}

					// Ensure upload directory exists
					await ensureUploadDir();

					// Generate filename and save file
					const filename = generateFilename(invitationId);
					const filepath = join(UPLOADS_DIR, filename);
					const buffer = Buffer.from(await image.arrayBuffer());
					await writeFile(filepath, buffer);

					// Generate URL
					const imageUrl = `${UPLOADS_URL_BASE}/${filename}`;

					// Dynamic imports to avoid bundling for client
					const { addGalleryImageInternal } = await import(
						"@/lib/gallery-server"
					);

					// Add gallery image record to database
					const galleryImage = await addGalleryImageInternal({
						invitationId,
						imageUrl,
						caption: caption || undefined,
					});

					return json({ success: true, image: galleryImage });
				} catch (error) {
					console.error("Gallery upload error:", error);
					return json({ error: "Upload failed" }, { status: 500 });
				}
			},
		},
	},
});
