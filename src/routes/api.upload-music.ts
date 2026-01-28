import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";

/**
 * Upload directory for custom music (relative to project root)
 */
const UPLOADS_DIR = "public/uploads/music";

/**
 * Base URL path for uploaded music
 */
const UPLOADS_URL_BASE = "/uploads/music";

/**
 * Allowed audio MIME types
 */
const ALLOWED_MIME_TYPES = [
  "audio/mpeg", // MP3
  "audio/mp3",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/ogg",
  "audio/vorbis",
  "audio/webm",
];

/**
 * Max file size: 10MB
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Generate a unique filename for uploaded music
 */
function generateFilename(invitationId: string, originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2, 8);
  // Extract extension from original filename
  const ext = originalName.split(".").pop()?.toLowerCase() || "mp3";
  return `${invitationId}-${timestamp}-${random}.${ext}`;
}

/**
 * Ensure upload directory exists
 */
async function ensureUploadDir(): Promise<void> {
  await mkdir(UPLOADS_DIR, { recursive: true });
}

export const Route = createFileRoute("/api/upload-music")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const formData = await request.formData();
          const audio = formData.get("audio") as Blob | null;
          const invitationId = formData.get("invitationId") as string | null;
          const originalName =
            (formData.get("filename") as string) || "music.mp3";

          if (!audio || !invitationId) {
            return json(
              { error: "Missing required fields: audio and invitationId" },
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

          // Validate audio type
          if (!ALLOWED_MIME_TYPES.includes(audio.type)) {
            return json(
              {
                error: `Invalid file type: ${audio.type}. Allowed types: MP3, WAV, OGG, WebM`,
              },
              { status: 400 },
            );
          }

          // Validate file size
          if (audio.size > MAX_FILE_SIZE) {
            return json(
              { error: "File too large. Maximum size is 10MB" },
              { status: 400 },
            );
          }

          // Ensure upload directory exists
          await ensureUploadDir();

          // Generate filename and save file
          const filename = generateFilename(invitationId, originalName);
          const filepath = join(UPLOADS_DIR, filename);
          const buffer = Buffer.from(await audio.arrayBuffer());
          await writeFile(filepath, buffer);

          // Generate URL
          const musicUrl = `${UPLOADS_URL_BASE}/${filename}`;

          return json({
            success: true,
            musicUrl,
            filename,
            size: audio.size,
          });
        } catch (error) {
          console.error("Music upload error:", error);
          return json({ error: "Upload failed" }, { status: 500 });
        }
      },
    },
  },
});
