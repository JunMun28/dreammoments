import { jwtVerify, SignJWT } from "jose";

const MIN_SECRET_LENGTH = 32;

// Dev fallback generated once per process so it stays stable across calls
let devFallbackSecret: string | undefined;

/**
 * Get the JWT signing secret from environment variables.
 * Falls back to a random dev-only secret when JWT_SECRET is not set.
 */
export function getJwtSecret(): Uint8Array {
	const secret = process.env.JWT_SECRET;
	if (!secret) {
		if (process.env.NODE_ENV === "production") {
			throw new Error("[Session] FATAL: JWT_SECRET is required in production.");
		}
		if (!devFallbackSecret) {
			devFallbackSecret = crypto.randomUUID();
			console.warn(
				"[Session] JWT_SECRET not set. Using random dev fallback (sessions won't survive restarts).",
			);
		}
		return new TextEncoder().encode(devFallbackSecret);
	}
	if (secret.length < MIN_SECRET_LENGTH && process.env.NODE_ENV !== "production") {
		console.warn(
			`[Session] JWT_SECRET is shorter than ${MIN_SECRET_LENGTH} characters. Use a longer secret for better security.`,
		);
	}
	return new TextEncoder().encode(secret);
}

/**
 * Create a signed JWT access token for the given user ID.
 * Token expires in 1 hour.
 */
export async function createSession(userId: string): Promise<string> {
	const secret = getJwtSecret();
	const token = await new SignJWT({ userId, type: "access" })
		.setProtectedHeader({ alg: "HS256" })
		.setExpirationTime("1h")
		.setIssuedAt()
		.sign(secret);
	return token;
}

/**
 * Create a signed JWT refresh token for the given user ID.
 * Token expires in 7 days.
 */
export async function createRefreshToken(userId: string): Promise<string> {
	const secret = getJwtSecret();
	const token = await new SignJWT({ userId, type: "refresh" })
		.setProtectedHeader({ alg: "HS256" })
		.setExpirationTime("7d")
		.setIssuedAt()
		.sign(secret);
	return token;
}

/**
 * Verify a JWT session token and return the payload.
 * Returns null if the token is invalid or expired.
 * Optionally checks the token type claim.
 */
export async function verifySession(
	token: string,
	expectedType?: "access" | "refresh",
): Promise<{ userId: string } | null> {
	try {
		const secret = getJwtSecret();
		const { payload } = await jwtVerify(token, secret);
		if (typeof payload.userId !== "string") {
			return null;
		}
		if (expectedType && payload.type !== expectedType) {
			return null;
		}
		return { userId: payload.userId };
	} catch {
		return null;
	}
}

/**
 * Refresh a session using a refresh token.
 * Verifies the refresh token and returns new access + refresh tokens.
 * Returns null if the refresh token is invalid.
 */
export async function refreshSession(
	refreshToken: string,
): Promise<{ token: string; refreshToken: string } | null> {
	const session = await verifySession(refreshToken, "refresh");
	if (!session) {
		return null;
	}
	const newToken = await createSession(session.userId);
	const newRefreshToken = await createRefreshToken(session.userId);
	return { token: newToken, refreshToken: newRefreshToken };
}
