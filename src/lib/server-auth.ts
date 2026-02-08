import { verifySession } from "./session";

/**
 * Verify a JWT token and return the authenticated user's ID.
 * Throws an error if the token is missing, invalid, or expired.
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

	return { userId: session.userId };
}
