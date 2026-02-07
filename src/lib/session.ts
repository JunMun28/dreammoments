import { SignJWT, jwtVerify } from "jose";

/**
 * Get the JWT signing secret from environment variables.
 * Falls back to a dev-only secret when JWT_SECRET is not set.
 */
export function getJwtSecret(): Uint8Array {
	const secret = process.env.JWT_SECRET || "dev-secret-change-in-production";
	if (
		!process.env.JWT_SECRET &&
		process.env.NODE_ENV === "production"
	) {
		console.warn(
			"[Session] JWT_SECRET is not set. Using insecure default. Set JWT_SECRET in production!",
		);
	}
	return new TextEncoder().encode(secret);
}

/**
 * Create a signed JWT session token for the given user ID.
 * Token expires in 7 days.
 */
export async function createSession(userId: string): Promise<string> {
	const secret = getJwtSecret();
	const token = await new SignJWT({ userId })
		.setProtectedHeader({ alg: "HS256" })
		.setExpirationTime("7d")
		.setIssuedAt()
		.sign(secret);
	return token;
}

/**
 * Verify a JWT session token and return the payload.
 * Returns null if the token is invalid or expired.
 */
export async function verifySession(
	token: string,
): Promise<{ userId: string } | null> {
	try {
		const secret = getJwtSecret();
		const { payload } = await jwtVerify(token, secret);
		if (typeof payload.userId !== "string") {
			return null;
		}
		return { userId: payload.userId };
	} catch {
		return null;
	}
}

/**
 * Refresh a session token if it is within 1 day of expiry.
 * Returns a new token if refreshed, or null if no refresh is needed.
 */
export async function refreshSession(
	token: string,
): Promise<string | null> {
	try {
		const secret = getJwtSecret();
		const { payload } = await jwtVerify(token, secret);
		if (typeof payload.userId !== "string" || typeof payload.exp !== "number") {
			return null;
		}
		const now = Math.floor(Date.now() / 1000);
		const oneDayInSeconds = 24 * 60 * 60;
		// If token expires within the next day, issue a fresh one
		if (payload.exp - now < oneDayInSeconds) {
			return createSession(payload.userId);
		}
		return null;
	} catch {
		return null;
	}
}
