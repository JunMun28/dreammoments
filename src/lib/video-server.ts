/**
 * Server functions for video embedding
 */

import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/index";
import type { VideoSource } from "@/db/schema";
import { invitations } from "@/db/schema";
import { verifyInvitationOwnership } from "./auth-helpers";
import { deleteVideoSchema, updateVideoSchema } from "./schemas";

export interface VideoData {
	videoUrl: string | null;
	videoSource: VideoSource | null;
}

// ------------ Internal functions (for testing) ------------

/**
 * Get video data for an invitation
 */
export async function getVideoInternal(
	invitationId: string,
): Promise<VideoData> {
	const db = await getDb();

	const [invitation] = await db
		.select({
			videoUrl: invitations.videoUrl,
			videoSource: invitations.videoSource,
		})
		.from(invitations)
		.where(eq(invitations.id, invitationId))
		.limit(1);

	if (!invitation) {
		throw new Error("Invitation not found");
	}

	return {
		videoUrl: invitation.videoUrl,
		videoSource: invitation.videoSource,
	};
}

/**
 * Update video for an invitation
 */
export async function updateVideoInternal(data: {
	invitationId: string;
	videoUrl?: string | null;
	videoSource?: VideoSource | null;
}): Promise<VideoData> {
	const db = await getDb();

	const updates: Partial<{
		videoUrl: string | null;
		videoSource: VideoSource | null;
	}> = {};

	if (data.videoUrl !== undefined) {
		updates.videoUrl = data.videoUrl;
	}
	if (data.videoSource !== undefined) {
		updates.videoSource = data.videoSource;
	}

	const [updated] = await db
		.update(invitations)
		.set(updates)
		.where(eq(invitations.id, data.invitationId))
		.returning({
			videoUrl: invitations.videoUrl,
			videoSource: invitations.videoSource,
		});

	if (!updated) {
		throw new Error("Invitation not found");
	}

	return {
		videoUrl: updated.videoUrl,
		videoSource: updated.videoSource,
	};
}

/**
 * Delete video from an invitation
 */
export async function deleteVideoInternal(
	invitationId: string,
): Promise<boolean> {
	const db = await getDb();

	const [updated] = await db
		.update(invitations)
		.set({
			videoUrl: null,
			videoSource: null,
		})
		.where(eq(invitations.id, invitationId))
		.returning();

	return !!updated;
}

// ------------ Server Functions ------------

/**
 * Update video for an invitation
 */
export const updateVideo = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) => updateVideoSchema.parse(input))
	.handler(async ({ data }) => {
		await verifyInvitationOwnership(data.invitationId);
		return updateVideoInternal({
			invitationId: data.invitationId,
			videoUrl: data.videoUrl,
			videoSource: data.videoSource as VideoSource | null | undefined,
		});
	});

/**
 * Delete video from an invitation
 */
export const deleteVideo = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) => deleteVideoSchema.parse(input))
	.handler(async ({ data }) => {
		await verifyInvitationOwnership(data.invitationId);
		return deleteVideoInternal(data.invitationId);
	});
