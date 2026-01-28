/**
 * Zod validation schemas for video server functions.
 */

import { z } from "zod";

/**
 * UUID validation schema
 */
const uuid = z.string().uuid("Invalid UUID format");

/**
 * Video source type enum
 */
export const videoSourceSchema = z.enum(["upload", "youtube"]);

export type VideoSource = z.infer<typeof videoSourceSchema>;

/**
 * Schema for updating invitation video
 */
export const updateVideoSchema = z.object({
	invitationId: uuid,
	videoUrl: z.string().url("Invalid video URL").optional().nullable(),
	videoSource: videoSourceSchema.optional().nullable(),
});

export type UpdateVideoInput = z.infer<typeof updateVideoSchema>;

/**
 * Schema for deleting video from invitation
 */
export const deleteVideoSchema = z.object({
	invitationId: uuid,
});

export type DeleteVideoInput = z.infer<typeof deleteVideoSchema>;

/**
 * Helper to extract YouTube video ID from URL
 */
export function extractYouTubeId(url: string): string | null {
	const patterns = [
		/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
	];

	for (const pattern of patterns) {
		const match = url.match(pattern);
		if (match?.[1]) {
			return match[1];
		}
	}

	return null;
}
