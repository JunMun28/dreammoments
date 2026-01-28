/**
 * Server functions for background music
 */

import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/index";
import type { MusicSettings } from "@/db/schema";
import { invitations } from "@/db/schema";
import { verifyInvitationOwnership } from "./auth-helpers";
import { deleteMusicSchema, updateMusicSchema } from "./schemas";

export interface MusicData {
	backgroundMusicUrl: string | null;
	musicSettings: MusicSettings | null;
}

// ------------ Internal functions (for testing) ------------

/**
 * Get music data for an invitation
 */
export async function getMusicInternal(
	invitationId: string,
): Promise<MusicData> {
	const db = await getDb();

	const [invitation] = await db
		.select({
			backgroundMusicUrl: invitations.backgroundMusicUrl,
			musicSettings: invitations.musicSettings,
		})
		.from(invitations)
		.where(eq(invitations.id, invitationId))
		.limit(1);

	if (!invitation) {
		throw new Error("Invitation not found");
	}

	return {
		backgroundMusicUrl: invitation.backgroundMusicUrl,
		musicSettings: invitation.musicSettings,
	};
}

/**
 * Update music for an invitation
 */
export async function updateMusicInternal(data: {
	invitationId: string;
	backgroundMusicUrl?: string | null;
	musicSettings?: MusicSettings | null;
}): Promise<MusicData> {
	const db = await getDb();

	const updates: Partial<{
		backgroundMusicUrl: string | null;
		musicSettings: MusicSettings | null;
	}> = {};

	if (data.backgroundMusicUrl !== undefined) {
		updates.backgroundMusicUrl = data.backgroundMusicUrl;
	}
	if (data.musicSettings !== undefined) {
		updates.musicSettings = data.musicSettings;
	}

	const [updated] = await db
		.update(invitations)
		.set(updates)
		.where(eq(invitations.id, data.invitationId))
		.returning({
			backgroundMusicUrl: invitations.backgroundMusicUrl,
			musicSettings: invitations.musicSettings,
		});

	if (!updated) {
		throw new Error("Invitation not found");
	}

	return {
		backgroundMusicUrl: updated.backgroundMusicUrl,
		musicSettings: updated.musicSettings,
	};
}

/**
 * Delete music from an invitation
 */
export async function deleteMusicInternal(
	invitationId: string,
): Promise<boolean> {
	const db = await getDb();

	const [updated] = await db
		.update(invitations)
		.set({
			backgroundMusicUrl: null,
			musicSettings: null,
		})
		.where(eq(invitations.id, invitationId))
		.returning();

	return !!updated;
}

// ------------ Server Functions ------------

/**
 * Update music for an invitation
 */
export const updateMusic = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) => updateMusicSchema.parse(input))
	.handler(async ({ data }) => {
		await verifyInvitationOwnership(data.invitationId);
		return updateMusicInternal(data);
	});

/**
 * Delete music from an invitation
 */
export const deleteMusic = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) => deleteMusicSchema.parse(input))
	.handler(async ({ data }) => {
		await verifyInvitationOwnership(data.invitationId);
		return deleteMusicInternal(data.invitationId);
	});
