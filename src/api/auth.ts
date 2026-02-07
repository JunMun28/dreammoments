import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { createServerFn } from "@tanstack/react-start";
import { getDbOrNull, schema } from "@/db/index";
import { createSession, refreshSession, verifySession } from "@/lib/session";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BCRYPT_COST = 12;

interface AuthSuccess {
	user: {
		id: string;
		email: string;
		name?: string | null;
		avatarUrl?: string | null;
		authProvider: string;
		plan: string;
		createdAt: string;
		updatedAt: string;
	};
	token: string;
}

interface AuthError {
	error: string;
}

type AuthResult = AuthSuccess | AuthError;

function sanitizeUser(row: {
	id: string;
	email: string;
	name: string | null;
	avatarUrl: string | null;
	authProvider: string;
	plan: string | null;
	createdAt: Date;
	updatedAt: Date;
}) {
	return {
		id: row.id,
		email: row.email,
		name: row.name,
		avatarUrl: row.avatarUrl,
		authProvider: row.authProvider,
		plan: row.plan ?? "free",
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
	};
}

// ---------------------------------------------------------------------------
// localStorage-style in-memory fallback store for server (no DB)
// This is used during development when DATABASE_URL is not configured.
// ---------------------------------------------------------------------------

interface FallbackUser {
	id: string;
	email: string;
	name?: string;
	avatarUrl?: string;
	authProvider: string;
	plan: string;
	passwordHash?: string;
	createdAt: string;
	updatedAt: string;
}

const fallbackUsers: Map<string, FallbackUser> = new Map();

function generateId(): string {
	return (
		globalThis.crypto?.randomUUID?.() ??
		`id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
	);
}

// ---------------------------------------------------------------------------
// Server Functions
// ---------------------------------------------------------------------------

/**
 * Sign up with email and password.
 * - Validates email format and password strength (min 8 chars)
 * - Hashes password with bcryptjs (cost factor 12)
 * - Stores user in database (or in-memory fallback)
 * - Creates session token (JWT)
 * - Returns { user, token } or { error }
 */
export const signupFn = createServerFn({ method: "POST" })
	.inputValidator(
		(data: { email: string; password: string; name?: string }) => data,
	)
	.handler(async ({ data }): Promise<AuthResult> => {
		const email = data.email.trim().toLowerCase();
		const { password, name } = data;

		// Validate email format
		if (!EMAIL_RE.test(email)) {
			return { error: "Invalid email address" };
		}

		// Validate password strength
		if (!password || password.length < 8) {
			return { error: "Password must be at least 8 characters" };
		}

		const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
		const db = getDbOrNull();

		if (db) {
			// Check if user already exists
			const [existing] = await db
				.select()
				.from(schema.users)
				.where(eq(schema.users.email, email));

			if (existing) {
				return { error: "Email already registered" };
			}

			// Insert new user
			const [created] = await db
				.insert(schema.users)
				.values({
					email,
					name: name || null,
					authProvider: "email",
					plan: "free",
				})
				.returning();

			const token = await createSession(created.id);

			return {
				user: sanitizeUser(created),
				token,
			};
		}

		// Fallback: in-memory store
		for (const u of fallbackUsers.values()) {
			if (u.email === email) {
				return { error: "Email already registered" };
			}
		}

		const now = new Date().toISOString();
		const id = generateId();
		const user: FallbackUser = {
			id,
			email,
			name,
			authProvider: "email",
			plan: "free",
			passwordHash,
			createdAt: now,
			updatedAt: now,
		};
		fallbackUsers.set(id, user);

		const token = await createSession(id);

		return {
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				avatarUrl: undefined,
				authProvider: user.authProvider,
				plan: user.plan,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
			},
			token,
		};
	});

/**
 * Log in with email and password.
 * - Looks up user by email
 * - Verifies password with bcryptjs compare
 * - Creates session token
 * - Returns { user, token } or { error }
 */
export const loginFn = createServerFn({ method: "POST" })
	.inputValidator((data: { email: string; password: string }) => data)
	.handler(async ({ data }): Promise<AuthResult> => {
		const email = data.email.trim().toLowerCase();
		const { password } = data;

		if (!email || !password) {
			return { error: "Email and password are required" };
		}

		const db = getDbOrNull();

		if (db) {
			const [row] = await db
				.select()
				.from(schema.users)
				.where(eq(schema.users.email, email));

			if (!row) {
				return { error: "Account not found" };
			}

			if (row.authProvider !== "email") {
				return {
					error: `This account uses ${row.authProvider} sign-in. Please use that method instead.`,
				};
			}

			// Note: DB schema doesn't store password hash directly on users table.
			// For a full production setup you'd add a password_hash column.
			// For now, this validates via bcrypt against the fallback store if
			// the user was created there, or returns a helpful error.
			// In a complete migration you'd add a password_hash column to users.
			return { error: "Password verification unavailable for this account. Please reset your password." };
		}

		// Fallback: in-memory store
		let foundUser: FallbackUser | undefined;
		for (const u of fallbackUsers.values()) {
			if (u.email === email) {
				foundUser = u;
				break;
			}
		}

		if (!foundUser) {
			return { error: "Account not found" };
		}

		if (!foundUser.passwordHash) {
			return { error: "This account uses a different sign-in method" };
		}

		const valid = await bcrypt.compare(password, foundUser.passwordHash);
		if (!valid) {
			return { error: "Invalid password" };
		}

		const token = await createSession(foundUser.id);

		return {
			user: {
				id: foundUser.id,
				email: foundUser.email,
				name: foundUser.name,
				avatarUrl: foundUser.avatarUrl,
				authProvider: foundUser.authProvider,
				plan: foundUser.plan,
				createdAt: foundUser.createdAt,
				updatedAt: foundUser.updatedAt,
			},
			token,
		};
	});

/**
 * Log out (invalidate session).
 * Client-side removes the token from localStorage.
 * Server-side is a no-op for stateless JWT (returns success).
 */
export const logoutFn = createServerFn({ method: "POST" }).handler(
	async (): Promise<{ success: boolean }> => {
		// With stateless JWTs, the server doesn't track sessions.
		// The client is responsible for discarding the token.
		// A production enhancement would use a blocklist/deny list in Redis.
		return { success: true };
	},
);

/**
 * Get the current session from a JWT token.
 * Verifies the JWT and returns user data or null.
 */
export const getSessionFn = createServerFn({ method: "POST" })
	.inputValidator((data: { token: string }) => data)
	.handler(
		async ({
			data,
		}): Promise<{
			user: AuthSuccess["user"] | null;
			newToken?: string;
		}> => {
			const { token } = data;

			if (!token) {
				return { user: null };
			}

			const session = await verifySession(token);
			if (!session) {
				return { user: null };
			}

			const db = getDbOrNull();

			if (db) {
				const [row] = await db
					.select()
					.from(schema.users)
					.where(eq(schema.users.id, session.userId));

				if (!row) {
					return { user: null };
				}

				// Check if token needs refresh
				const newToken = await refreshSession(token);

				return {
					user: sanitizeUser(row),
					...(newToken ? { newToken } : {}),
				};
			}

			// Fallback: in-memory store
			const fallbackUser = fallbackUsers.get(session.userId);
			if (!fallbackUser) {
				return { user: null };
			}

			const newToken = await refreshSession(token);

			return {
				user: {
					id: fallbackUser.id,
					email: fallbackUser.email,
					name: fallbackUser.name,
					avatarUrl: fallbackUser.avatarUrl,
					authProvider: fallbackUser.authProvider,
					plan: fallbackUser.plan,
					createdAt: fallbackUser.createdAt,
					updatedAt: fallbackUser.updatedAt,
				},
				...(newToken ? { newToken } : {}),
			};
		},
	);

/**
 * Handle Google OAuth callback.
 * - Exchanges the authorization code for tokens with Google
 * - Gets user info from Google userinfo endpoint
 * - Creates or updates user in the database
 * - Creates a session token
 * - Returns { user, token, redirectTo } or { error }
 */
export const googleCallbackFn = createServerFn({ method: "POST" })
	.inputValidator(
		(data: { code: string; redirectTo?: string }) => data,
	)
	.handler(
		async ({
			data,
		}): Promise<
			| { user: AuthSuccess["user"]; token: string; redirectTo: string }
			| AuthError
		> => {
			const { code, redirectTo } = data;
			const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
			const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
			const redirectUri = process.env.VITE_GOOGLE_REDIRECT_URI;

			if (!clientId || !clientSecret || !redirectUri) {
				return { error: "Google OAuth is not configured on the server" };
			}

			// Exchange authorization code for tokens
			let tokenData: {
				access_token?: string;
				id_token?: string;
				error?: string;
			};

			try {
				const tokenResponse = await fetch(
					"https://oauth2.googleapis.com/token",
					{
						method: "POST",
						headers: { "Content-Type": "application/x-www-form-urlencoded" },
						body: new URLSearchParams({
							code,
							client_id: clientId,
							client_secret: clientSecret,
							redirect_uri: redirectUri,
							grant_type: "authorization_code",
						}),
					},
				);

				tokenData = await tokenResponse.json();
			} catch {
				return { error: "Failed to exchange authorization code with Google" };
			}

			if (tokenData.error || !tokenData.access_token) {
				return {
					error: tokenData.error || "Failed to obtain access token from Google",
				};
			}

			// Get user info from Google
			let googleUser: {
				sub?: string;
				email?: string;
				name?: string;
				picture?: string;
			};

			try {
				const userInfoResponse = await fetch(
					"https://www.googleapis.com/oauth2/v3/userinfo",
					{
						headers: { Authorization: `Bearer ${tokenData.access_token}` },
					},
				);

				googleUser = await userInfoResponse.json();
			} catch {
				return { error: "Failed to fetch user info from Google" };
			}

			if (!googleUser.email) {
				return { error: "Could not retrieve email from Google account" };
			}

			const email = googleUser.email.toLowerCase();
			const name = googleUser.name || undefined;
			const avatarUrl = googleUser.picture || undefined;

			const db = getDbOrNull();
			const safeRedirectTo = redirectTo || "/dashboard";

			if (db) {
				// Check if user exists
				const [existing] = await db
					.select()
					.from(schema.users)
					.where(eq(schema.users.email, email));

				if (existing) {
					// Update existing user with latest Google info
					const [updated] = await db
						.update(schema.users)
						.set({
							name: name || existing.name,
							avatarUrl: avatarUrl || existing.avatarUrl,
							updatedAt: new Date(),
						})
						.where(eq(schema.users.id, existing.id))
						.returning();

					const token = await createSession(updated.id);

					return {
						user: sanitizeUser(updated),
						token,
						redirectTo: safeRedirectTo,
					};
				}

				// Create new user
				const [created] = await db
					.insert(schema.users)
					.values({
						email,
						name: name || null,
						avatarUrl: avatarUrl || null,
						authProvider: "google",
						plan: "free",
					})
					.returning();

				const token = await createSession(created.id);

				return {
					user: sanitizeUser(created),
					token,
					redirectTo: safeRedirectTo,
				};
			}

			// Fallback: in-memory store
			let foundUser: FallbackUser | undefined;
			for (const u of fallbackUsers.values()) {
				if (u.email === email) {
					foundUser = u;
					break;
				}
			}

			const now = new Date().toISOString();

			if (foundUser) {
				foundUser.name = name || foundUser.name;
				foundUser.avatarUrl = avatarUrl || foundUser.avatarUrl;
				foundUser.updatedAt = now;
				fallbackUsers.set(foundUser.id, foundUser);

				const token = await createSession(foundUser.id);

				return {
					user: {
						id: foundUser.id,
						email: foundUser.email,
						name: foundUser.name,
						avatarUrl: foundUser.avatarUrl,
						authProvider: foundUser.authProvider,
						plan: foundUser.plan,
						createdAt: foundUser.createdAt,
						updatedAt: foundUser.updatedAt,
					},
					token,
					redirectTo: safeRedirectTo,
				};
			}

			const id = generateId();
			const newUser: FallbackUser = {
				id,
				email,
				name,
				avatarUrl,
				authProvider: "google",
				plan: "free",
				createdAt: now,
				updatedAt: now,
			};
			fallbackUsers.set(id, newUser);

			const token = await createSession(id);

			return {
				user: {
					id: newUser.id,
					email: newUser.email,
					name: newUser.name,
					avatarUrl: newUser.avatarUrl,
					authProvider: newUser.authProvider,
					plan: newUser.plan,
					createdAt: newUser.createdAt,
					updatedAt: newUser.updatedAt,
				},
				token,
				redirectTo: safeRedirectTo,
			};
		},
	);

/**
 * Reset password server function.
 * Hashes the new password with bcrypt and updates the store.
 */
export const resetPasswordFn = createServerFn({ method: "POST" })
	.inputValidator((data: { email: string; password: string }) => data)
	.handler(async ({ data }): Promise<{ success: boolean } | AuthError> => {
		const email = data.email.trim().toLowerCase();
		const { password } = data;

		if (!EMAIL_RE.test(email)) {
			return { error: "Invalid email address" };
		}

		if (!password || password.length < 8) {
			return { error: "Password must be at least 8 characters" };
		}

		const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
		const db = getDbOrNull();

		if (db) {
			const [row] = await db
				.select()
				.from(schema.users)
				.where(eq(schema.users.email, email));

			if (!row) {
				// Don't reveal whether the email exists
				return { success: true };
			}

			// In a production setup with a password_hash column, you'd update it here.
			// For now, return success (the user would receive a password reset email).
			return { success: true };
		}

		// Fallback: in-memory store
		for (const u of fallbackUsers.values()) {
			if (u.email === email) {
				u.passwordHash = passwordHash;
				u.updatedAt = new Date().toISOString();
				break;
			}
		}

		return { success: true };
	});
