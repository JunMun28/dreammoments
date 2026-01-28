/**
 * Authorization helpers for verifying resource ownership.
 *
 * These functions ensure users can only access/modify their own resources.
 * All server functions should use these helpers to verify ownership
 * before performing mutations.
 */

import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/index";
import {
	galleryImages,
	guestGroups,
	guests,
	invitations,
	users,
} from "@/db/schema";
import { getSession } from "./auth";

/**
 * Error thrown when user is not authenticated.
 */
export class AuthenticationError extends Error {
	constructor(message = "Authentication required") {
		super(message);
		this.name = "AuthenticationError";
	}
}

/**
 * Error thrown when user doesn't have permission to access a resource.
 */
export class AuthorizationError extends Error {
	constructor(message = "Unauthorized access") {
		super(message);
		this.name = "AuthorizationError";
	}
}

/**
 * Get the authenticated user's local ID from the session.
 * Throws AuthenticationError if not authenticated or user not found.
 *
 * @returns The local user ID (from users table)
 */
export async function getAuthenticatedUserId(): Promise<string> {
	const session = await getSession();

	if (!session.data?.user) {
		throw new AuthenticationError();
	}

	const neonAuthId = session.data.user.id;
	const db = await getDb();

	const result = await db
		.select({ id: users.id })
		.from(users)
		.where(eq(users.neonAuthId, neonAuthId))
		.limit(1);

	if (result.length === 0) {
		throw new AuthenticationError("User not found in local database");
	}

	return result[0].id;
}

/**
 * Verify that the authenticated user owns the specified invitation.
 * Throws AuthorizationError if the user doesn't own the invitation.
 *
 * @param invitationId - The invitation ID to verify ownership of
 * @returns The invitation ID if ownership is verified
 */
export async function verifyInvitationOwnership(
	invitationId: string,
): Promise<string> {
	const userId = await getAuthenticatedUserId();
	const db = await getDb();

	const result = await db
		.select({ id: invitations.id })
		.from(invitations)
		.where(
			and(eq(invitations.id, invitationId), eq(invitations.userId, userId)),
		)
		.limit(1);

	if (result.length === 0) {
		throw new AuthorizationError("Invitation not found or access denied");
	}

	return invitationId;
}

/**
 * Verify that the authenticated user owns the invitation containing the specified guest group.
 * Throws AuthorizationError if the user doesn't own the invitation.
 *
 * @param groupId - The guest group ID to verify ownership of
 * @returns The group ID and invitation ID if ownership is verified
 */
export async function verifyGuestGroupOwnership(
	groupId: string,
): Promise<{ groupId: string; invitationId: string }> {
	const userId = await getAuthenticatedUserId();
	const db = await getDb();

	const result = await db
		.select({
			groupId: guestGroups.id,
			invitationId: guestGroups.invitationId,
		})
		.from(guestGroups)
		.innerJoin(invitations, eq(guestGroups.invitationId, invitations.id))
		.where(and(eq(guestGroups.id, groupId), eq(invitations.userId, userId)))
		.limit(1);

	if (result.length === 0) {
		throw new AuthorizationError("Guest group not found or access denied");
	}

	return result[0];
}

/**
 * Verify that the authenticated user owns the invitation containing the specified guest.
 * Throws AuthorizationError if the user doesn't own the invitation.
 *
 * @param guestId - The guest ID to verify ownership of
 * @returns The guest ID, group ID, and invitation ID if ownership is verified
 */
export async function verifyGuestOwnership(
	guestId: string,
): Promise<{ guestId: string; groupId: string; invitationId: string }> {
	const userId = await getAuthenticatedUserId();
	const db = await getDb();

	const result = await db
		.select({
			guestId: guests.id,
			groupId: guests.groupId,
			invitationId: guestGroups.invitationId,
		})
		.from(guests)
		.innerJoin(guestGroups, eq(guests.groupId, guestGroups.id))
		.innerJoin(invitations, eq(guestGroups.invitationId, invitations.id))
		.where(and(eq(guests.id, guestId), eq(invitations.userId, userId)))
		.limit(1);

	if (result.length === 0) {
		throw new AuthorizationError("Guest not found or access denied");
	}

	return result[0];
}

/**
 * Verify that the authenticated user owns the invitation containing the specified gallery image.
 * Throws AuthorizationError if the user doesn't own the invitation.
 *
 * @param imageId - The gallery image ID to verify ownership of
 * @returns The image ID and invitation ID if ownership is verified
 */
export async function verifyGalleryImageOwnership(
	imageId: string,
): Promise<{ imageId: string; invitationId: string }> {
	const userId = await getAuthenticatedUserId();
	const db = await getDb();

	const result = await db
		.select({
			imageId: galleryImages.id,
			invitationId: galleryImages.invitationId,
		})
		.from(galleryImages)
		.innerJoin(invitations, eq(galleryImages.invitationId, invitations.id))
		.where(and(eq(galleryImages.id, imageId), eq(invitations.userId, userId)))
		.limit(1);

	if (result.length === 0) {
		throw new AuthorizationError("Gallery image not found or access denied");
	}

	return result[0];
}
