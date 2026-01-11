import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db/index";
import { loginCodes, sessions, users } from "@/db/schema";

const CODE_EXPIRY_MINUTES = 10;
const SESSION_EXPIRY_DAYS = 30;

/**
 * Generates a 6-digit login code for the given email.
 * Code expires after 10 minutes.
 */
export async function generateLoginCode(email: string): Promise<{
	code: string;
	email: string;
	expiresAt: Date;
}> {
	const normalizedEmail = email.toLowerCase().trim();
	const code = Math.floor(100000 + Math.random() * 900000).toString();
	const expiresAt = new Date(Date.now() + CODE_EXPIRY_MINUTES * 60 * 1000);

	await db.insert(loginCodes).values({
		email: normalizedEmail,
		code,
		expiresAt,
	});

	return {
		code,
		email: normalizedEmail,
		expiresAt,
	};
}

/**
 * Verifies a login code and returns user info if valid.
 * Marks the code as used on success.
 */
export async function verifyLoginCode(
	email: string,
	code: string,
): Promise<
	{ success: true; userId: string } | { success: false; error: string }
> {
	// Validate code format
	if (!/^\d{6}$/.test(code)) {
		return { success: false, error: "Invalid code format" };
	}

	const normalizedEmail = email.toLowerCase().trim();
	const now = new Date();

	// Find valid, unused code
	const [validCode] = await db
		.select()
		.from(loginCodes)
		.where(
			and(
				eq(loginCodes.email, normalizedEmail),
				eq(loginCodes.code, code),
				gt(loginCodes.expiresAt, now),
				isNull(loginCodes.usedAt),
			),
		);

	if (!validCode) {
		return { success: false, error: "Invalid or expired code" };
	}

	// Mark code as used
	await db
		.update(loginCodes)
		.set({ usedAt: now })
		.where(eq(loginCodes.id, validCode.id));

	// Find or create user
	let [user] = await db
		.select()
		.from(users)
		.where(eq(users.email, normalizedEmail));

	if (!user) {
		const [newUser] = await db
			.insert(users)
			.values({ email: normalizedEmail })
			.returning();
		user = newUser;
	}

	return { success: true, userId: user.id };
}

/**
 * Creates a new session for the given user.
 * Session expires after 30 days.
 */
export async function createSession(userId: string): Promise<{
	sessionId: string;
	expiresAt: Date;
}> {
	const expiresAt = new Date(
		Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
	);

	const [session] = await db
		.insert(sessions)
		.values({
			userId,
			expiresAt,
		})
		.returning();

	return {
		sessionId: session.id,
		expiresAt,
	};
}

/**
 * Validates a session and returns user info if valid.
 * Returns null if session is invalid or expired.
 */
export async function validateSession(
	sessionId: string,
): Promise<{ userId: string; email: string } | null> {
	const now = new Date();

	const [result] = await db
		.select({
			userId: sessions.userId,
			email: users.email,
		})
		.from(sessions)
		.innerJoin(users, eq(sessions.userId, users.id))
		.where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, now)));

	if (!result) {
		return null;
	}

	return { userId: result.userId, email: result.email };
}

/**
 * Invalidates (deletes) a session.
 */
export async function invalidateSession(sessionId: string): Promise<void> {
	await db.delete(sessions).where(eq(sessions.id, sessionId));
}
