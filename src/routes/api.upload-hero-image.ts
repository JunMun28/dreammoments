import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";

// Note: drizzle-orm and db are dynamically imported in handlers
// to avoid bundling for the client

/**
 * Upload directory for hero images (relative to project root)
 */
const UPLOADS_DIR = "public/uploads/hero-images";

/**
 * Base URL path for uploaded images
 */
const UPLOADS_URL_BASE = "/uploads/hero-images";

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

export const Route = createFileRoute("/api/upload-hero-image")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				try {
					const formData = await request.formData();
					const image = formData.get("image") as Blob | null;
					const invitationId = formData.get("invitationId") as string | null;

					if (!image || !invitationId) {
						return json(
							{ error: "Missing required fields: image and invitationId" },
							{ status: 400 },
						);
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
					const { eq } = await import("drizzle-orm");
					const { db } = await import("@/db/index");
					const { invitations } = await import("@/db/schema");

					// Update invitation with new hero image URL
					const result = await db
						.update(invitations)
						.set({
							heroImageUrl: imageUrl,
							updatedAt: new Date(),
						})
						.where(eq(invitations.id, invitationId))
						.returning({ id: invitations.id });

					if (result.length === 0) {
						return json({ error: "Invitation not found" }, { status: 404 });
					}

					return json({ success: true, imageUrl });
				} catch (error) {
					console.error("Upload error:", error);
					return json({ error: "Upload failed" }, { status: 500 });
				}
			},
		},
	},
});
