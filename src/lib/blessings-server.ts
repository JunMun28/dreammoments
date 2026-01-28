/**
 * Server functions for guest blessings/messages
 */

import { createServerFn } from "@tanstack/react-start";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db/index";
import { blessings } from "@/db/schema";
import { verifyInvitationOwnership } from "./auth-helpers";
import {
	createBlessingSchema,
	deleteBlessingSchema,
	getBlessingsSchema,
	updateBlessingSchema,
} from "./schemas";

export interface BlessingData {
	id: string;
	invitationId: string;
	authorName: string;
	message: string;
	parentId: string | null;
	isApproved: boolean;
	createdAt: Date | null;
	replies?: BlessingData[];
}

// ------------ Internal functions (for testing) ------------

/**
 * Get all blessings for an invitation (public - guests can view)
 */
export async function getBlessingsInternal(
	invitationId: string,
	includeReplies = true,
): Promise<BlessingData[]> {
	const db = await getDb();

	// Get top-level blessings (no parent)
	const topLevelBlessings = await db
		.select()
		.from(blessings)
		.where(eq(blessings.invitationId, invitationId))
		.orderBy(desc(blessings.createdAt));

	// Filter to only approved top-level blessings
	const approvedTopLevel = topLevelBlessings.filter(
		(b) => b.parentId === null && b.isApproved,
	);

	if (!includeReplies) {
		return approvedTopLevel.map((b) => ({
			id: b.id,
			invitationId: b.invitationId,
			authorName: b.authorName,
			message: b.message,
			parentId: b.parentId,
			isApproved: b.isApproved,
			createdAt: b.createdAt,
		}));
	}

	// Build reply map
	const replyMap = new Map<string, BlessingData[]>();
	for (const blessing of topLevelBlessings) {
		if (blessing.parentId && blessing.isApproved) {
			const replies = replyMap.get(blessing.parentId) || [];
			replies.push({
				id: blessing.id,
				invitationId: blessing.invitationId,
				authorName: blessing.authorName,
				message: blessing.message,
				parentId: blessing.parentId,
				isApproved: blessing.isApproved,
				createdAt: blessing.createdAt,
			});
			replyMap.set(blessing.parentId, replies);
		}
	}

	// Attach replies to top-level blessings
	return approvedTopLevel.map((b) => ({
		id: b.id,
		invitationId: b.invitationId,
		authorName: b.authorName,
		message: b.message,
		parentId: b.parentId,
		isApproved: b.isApproved,
		createdAt: b.createdAt,
		replies: replyMap.get(b.id) || [],
	}));
}

/**
 * Get all blessings for moderation (couple only - includes unapproved)
 */
export async function getBlessingsForModerationInternal(
	invitationId: string,
): Promise<BlessingData[]> {
	const db = await getDb();

	const allBlessings = await db
		.select()
		.from(blessings)
		.where(eq(blessings.invitationId, invitationId))
		.orderBy(desc(blessings.createdAt));

	// Build reply map
	const replyMap = new Map<string, BlessingData[]>();
	const topLevel: BlessingData[] = [];

	for (const blessing of allBlessings) {
		const blessingData: BlessingData = {
			id: blessing.id,
			invitationId: blessing.invitationId,
			authorName: blessing.authorName,
			message: blessing.message,
			parentId: blessing.parentId,
			isApproved: blessing.isApproved,
			createdAt: blessing.createdAt,
		};

		if (blessing.parentId) {
			const replies = replyMap.get(blessing.parentId) || [];
			replies.push(blessingData);
			replyMap.set(blessing.parentId, replies);
		} else {
			topLevel.push(blessingData);
		}
	}

	// Attach replies
	return topLevel.map((b) => ({
		...b,
		replies: replyMap.get(b.id) || [],
	}));
}

/**
 * Create a new blessing (public - guests can create)
 */
export async function createBlessingInternal(data: {
	invitationId: string;
	authorName: string;
	message: string;
	parentId?: string;
}): Promise<BlessingData> {
	const db = await getDb();

	const [newBlessing] = await db
		.insert(blessings)
		.values({
			invitationId: data.invitationId,
			authorName: data.authorName,
			message: data.message,
			parentId: data.parentId || null,
			isApproved: true, // Auto-approve by default
		})
		.returning();

	return {
		id: newBlessing.id,
		invitationId: newBlessing.invitationId,
		authorName: newBlessing.authorName,
		message: newBlessing.message,
		parentId: newBlessing.parentId,
		isApproved: newBlessing.isApproved,
		createdAt: newBlessing.createdAt,
	};
}

/**
 * Update a blessing (moderation - couple only)
 */
export async function updateBlessingInternal(data: {
	id: string;
	isApproved?: boolean;
}): Promise<BlessingData | null> {
	const db = await getDb();

	const updates: Partial<{ isApproved: boolean }> = {};

	if (data.isApproved !== undefined) {
		updates.isApproved = data.isApproved;
	}

	const [updated] = await db
		.update(blessings)
		.set(updates)
		.where(eq(blessings.id, data.id))
		.returning();

	if (!updated) return null;

	return {
		id: updated.id,
		invitationId: updated.invitationId,
		authorName: updated.authorName,
		message: updated.message,
		parentId: updated.parentId,
		isApproved: updated.isApproved,
		createdAt: updated.createdAt,
	};
}

/**
 * Delete a blessing (couple only)
 */
export async function deleteBlessingInternal(id: string): Promise<boolean> {
	const db = await getDb();

	const result = await db
		.delete(blessings)
		.where(eq(blessings.id, id))
		.returning();

	return result.length > 0;
}

/**
 * Helper to get invitation ID from blessing ID
 */
export async function getInvitationIdFromBlessing(
	blessingId: string,
): Promise<string | null> {
	const db = await getDb();

	const [blessing] = await db
		.select({ invitationId: blessings.invitationId })
		.from(blessings)
		.where(eq(blessings.id, blessingId))
		.limit(1);

	return blessing?.invitationId || null;
}

// ------------ Server Functions ------------

/**
 * Get blessings for public view (approved only)
 */
export const getBlessings = createServerFn({ method: "GET" })
	.inputValidator((input: unknown) => getBlessingsSchema.parse(input))
	.handler(async ({ data }) => {
		return getBlessingsInternal(data.invitationId, data.includeReplies);
	});

/**
 * Get blessings for moderation (couple only, includes unapproved)
 */
export const getBlessingsForModeration = createServerFn({ method: "GET" })
	.inputValidator((input: unknown) => getBlessingsSchema.parse(input))
	.handler(async ({ data }) => {
		await verifyInvitationOwnership(data.invitationId);
		return getBlessingsForModerationInternal(data.invitationId);
	});

/**
 * Create a new blessing (public - guests can create)
 */
export const createBlessing = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) => createBlessingSchema.parse(input))
	.handler(async ({ data }) => {
		// No auth required - guests can create blessings
		return createBlessingInternal(data);
	});

/**
 * Update a blessing (moderation - couple only)
 */
export const updateBlessing = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) => updateBlessingSchema.parse(input))
	.handler(async ({ data }) => {
		const invitationId = await getInvitationIdFromBlessing(data.id);
		if (!invitationId) {
			throw new Error("Blessing not found");
		}
		await verifyInvitationOwnership(invitationId);
		return updateBlessingInternal(data);
	});

/**
 * Delete a blessing (couple only)
 */
export const deleteBlessing = createServerFn({ method: "POST" })
	.inputValidator((input: unknown) => deleteBlessingSchema.parse(input))
	.handler(async ({ data }) => {
		const invitationId = await getInvitationIdFromBlessing(data.id);
		if (!invitationId) {
			throw new Error("Blessing not found");
		}
		await verifyInvitationOwnership(invitationId);
		return deleteBlessingInternal(data.id);
	});
