/**
 * Zod validation schemas for music server functions.
 */

import { z } from "zod";

/**
 * UUID validation schema
 */
const uuid = z.string().uuid("Invalid UUID format");

/**
 * Music settings schema
 */
export const musicSettingsSchema = z.object({
	autoplay: z.boolean().optional().default(false),
	loop: z.boolean().optional().default(true),
	volume: z.number().min(0).max(1).optional().default(0.7),
});

export type MusicSettings = z.infer<typeof musicSettingsSchema>;

/**
 * Schema for updating invitation music
 */
export const updateMusicSchema = z.object({
	invitationId: uuid,
	backgroundMusicUrl: z.string().url("Invalid music URL").optional().nullable(),
	musicSettings: musicSettingsSchema.optional().nullable(),
});

export type UpdateMusicInput = z.infer<typeof updateMusicSchema>;

/**
 * Schema for deleting music from invitation
 */
export const deleteMusicSchema = z.object({
	invitationId: uuid,
});

export type DeleteMusicInput = z.infer<typeof deleteMusicSchema>;
