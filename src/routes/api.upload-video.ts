import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";

/**
 * Upload directory for videos (relative to project root)
 */
const UPLOADS_DIR = "public/uploads/videos";

/**
 * Base URL path for uploaded videos
 */
const UPLOADS_URL_BASE = "/uploads/videos";

/**
 * Allowed video MIME types
 */
const ALLOWED_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime", // .mov
  "video/x-msvideo", // .avi (less common on web)
];

/**
 * Max file size: 50MB
 */
const MAX_FILE_SIZE = 50 * 1024 * 1024;

/**
 * Generate a unique filename for uploaded videos
 */
function generateFilename(invitationId: string, originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  // Extract extension from original filename, default to mp4
  const ext = originalName.split(".").pop()?.toLowerCase() || "mp4";
  // Normalize extension
  const normalizedExt = ext === "mov" ? "mp4" : ext;
  return `${invitationId}-${timestamp}-${random}.${normalizedExt}`;
}

/**
 * Ensure upload directory exists
 */
async function ensureUploadDir(): Promise<void> {
  await mkdir(UPLOADS_DIR, { recursive: true });
}

export const Route = createFileRoute("/api/upload-video")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const formData = await request.formData();
          const video = formData.get("video") as Blob | null;
          const invitationId = formData.get("invitationId") as string | null;
          const originalName =
            (formData.get("filename") as string) || "video.mp4";

          if (!video || !invitationId) {
            return json(
              { error: "Missing required fields: video and invitationId" },
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

          // Validate video type
          if (!ALLOWED_MIME_TYPES.includes(video.type)) {
            return json(
              {
                error: `Invalid file type: ${video.type}. Allowed types: MP4, WebM, MOV`,
              },
              { status: 400 },
            );
          }

          // Validate file size
          if (video.size > MAX_FILE_SIZE) {
            return json(
              { error: "File too large. Maximum size is 50MB" },
              { status: 400 },
            );
          }

          // Ensure upload directory exists
          await ensureUploadDir();

          // Generate filename and save file
          const filename = generateFilename(invitationId, originalName);
          const filepath = join(UPLOADS_DIR, filename);
          const buffer = Buffer.from(await video.arrayBuffer());
          await writeFile(filepath, buffer);

          // Generate URL
          const videoUrl = `${UPLOADS_URL_BASE}/${filename}`;

          // Update invitation with new video URL
          const { eq } = await import("drizzle-orm");
          const { db } = await import("@/db/index");
          const { invitations } = await import("@/db/schema");

          await db
            .update(invitations)
            .set({
              videoUrl,
              videoSource: "upload",
              updatedAt: new Date(),
            })
            .where(eq(invitations.id, invitationId));

          return json({
            success: true,
            videoUrl,
            filename,
            size: video.size,
          });
        } catch (error) {
          console.error("Video upload error:", error);
          return json({ error: "Upload failed" }, { status: 500 });
        }
      },
    },
  },
});
