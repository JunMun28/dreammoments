import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import { guestGroups, guestSessions } from "@/db/schema";

/** Session expiry time: 30 days in milliseconds */
const SESSION_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;

/** Generate a cryptographically secure session token */
function generateSessionToken(): string {
	const bytes = new Uint8Array(16);
	crypto.getRandomValues(bytes);
	return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Guest session data returned from DB */
export interface GuestSession {
	id: string;
	groupId: string;
	sessionToken: string;
	expiresAt: Date;
	createdAt: Date | null;
}

/** Guest group data */
export interface GuestGroupData {
	id: string;
	invitationId: string;
	name: string;
	rsvpToken: string;
	createdAt: Date | null;
	updatedAt: Date | null;
}

/** Session validation result */
export interface SessionValidationResult {
	session: GuestSession;
	group: GuestGroupData;
}

/**
 * Create a new guest session for a group.
 * Session token should be stored in a cookie on the client.
 */
export async function createGuestSessionInternal(
	groupId: string,
): Promise<GuestSession> {
	const sessionToken = generateSessionToken();
	const expiresAt = new Date(Date.now() + SESSION_EXPIRY_MS);

	const [session] = await db
		.insert(guestSessions)
		.values({
			groupId,
			sessionToken,
			expiresAt,
		})
		.returning();

	return session;
}

/**
 * Validate a guest session token.
 * Returns session and group data if valid and not expired, null otherwise.
 */
export async function validateGuestSessionInternal(
	sessionToken: string,
): Promise<SessionValidationResult | null> {
	const results = await db
		.select()
		.from(guestSessions)
		.innerJoin(guestGroups, eq(guestSessions.groupId, guestGroups.id))
		.where(eq(guestSessions.sessionToken, sessionToken))
		.limit(1);

	if (results.length === 0) {
		return null;
	}

	const { guest_sessions: session, guest_groups: group } = results[0];

	// Check if session is expired
	if (new Date() > session.expiresAt) {
		return null;
	}

	return { session, group };
}

/**
 * Exchange an RSVP token (from URL) for a session token (stored in cookie).
 * This is the main flow when a guest opens an RSVP link:
 * 1. Parse RSVP token from URL hash
 * 2. Look up guest group by RSVP token
 * 3. Create new session for the group
 * 4. Set session cookie
 */
export async function exchangeTokenForSessionInternal(
	rsvpToken: string,
): Promise<SessionValidationResult | null> {
	// Look up guest group by RSVP token
	const groups = await db
		.select()
		.from(guestGroups)
		.where(eq(guestGroups.rsvpToken, rsvpToken))
		.limit(1);

	if (groups.length === 0) {
		return null;
	}

	const group = groups[0];

	// Create a new session for this group
	const session = await createGuestSessionInternal(group.id);

	return { session, group };
}

// ============================================================================
// Session cookie types and helpers
// ============================================================================

/** Data stored in the guest session cookie */
interface GuestSessionCookieData {
	sessionToken?: string;
}

/**
 * Get guest session from cookie.
 * Uses TanStack Start's useSession for secure HTTP-only cookie handling.
 */
function getGuestSessionCookie() {
	return useSession<GuestSessionCookieData>({
		name: "guest-session",
		password:
			process.env.SESSION_SECRET ?? "dreammoments-guest-session-secret-32c",
		cookie: {
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			httpOnly: true,
			maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
		},
	});
}

// ============================================================================
// Server functions for RSVP flow
// ============================================================================

/**
 * Server function to exchange RSVP token for session.
 * Called when guest opens RSVP link - validates token and creates session cookie.
 */
export const exchangeRsvpTokenForSession = createServerFn({ method: "POST" })
	.inputValidator((data: { rsvpToken: string }) => data)
	.handler(async ({ data }) => {
		const sessionCookie = await getGuestSessionCookie();

		const result = await exchangeTokenForSessionInternal(data.rsvpToken);

		if (!result) {
			return { success: false as const, error: "Invalid RSVP token" };
		}

		// Set session cookie
		await sessionCookie.update({ sessionToken: result.session.sessionToken });

		return {
			success: true as const,
			groupId: result.group.id,
			invitationId: result.group.invitationId,
			groupName: result.group.name,
		};
	});

/**
 * Server function to validate existing guest session.
 * Called on RSVP page load to check if guest has a valid session.
 */
export const validateGuestSession = createServerFn({ method: "GET" }).handler(
	async () => {
		const sessionCookie = await getGuestSessionCookie();
		const { sessionToken } = sessionCookie.data;

		if (!sessionToken) {
			return { valid: false as const };
		}

		const result = await validateGuestSessionInternal(sessionToken);

		if (!result) {
			// Clear invalid session
			await sessionCookie.clear();
			return { valid: false as const };
		}

		return {
			valid: true as const,
			groupId: result.group.id,
			invitationId: result.group.invitationId,
			groupName: result.group.name,
		};
	},
);
