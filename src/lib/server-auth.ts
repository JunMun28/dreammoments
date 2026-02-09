import { eq } from "drizzle-orm";
import { getDbOrNull, schema } from "@/db/index";
import { verifySession } from "./session";

/**
 * Hash a token using SHA-256 for blocklist lookups.
 */
async function hashToken(token: string): Promise<string> {
	const encoded = new TextEncoder().encode(token);
	const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
	return Array.from(new Uint8Array(hashBuffer))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

/**
 * Check whether a token has been revoked (added to the blocklist).
 * Returns true if the token is blocked, false otherwise.
 */
async function isTokenBlocked(token: string): Promise<boolean> {
	const db = getDbOrNull();
	if (!db) return false;

	const hash = await hashToken(token);
	const [entry] = await db
		.select()
		.from(schema.tokenBlocklist)
		.where(eq(schema.tokenBlocklist.tokenHash, hash));

	return !!entry;
}

/**
 * Verify a JWT token and return the authenticated user's ID.
 * Throws an error if the token is missing, invalid, expired, or revoked.
 */
export async function requireAuth(
	token: string | undefined,
): Promise<{ userId: string }> {
	if (!token) {
		throw new Error("Authentication required");
	}

	const session = await verifySession(token);
	if (!session) {
		throw new Error("Invalid or expired session");
	}

	// Check if the token has been revoked
	const blocked = await isTokenBlocked(token);
	if (blocked) {
		throw new Error("Token has been revoked");
	}

	return { userId: session.userId };
}
