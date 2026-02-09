import { createServerFn } from "@tanstack/react-start";
import bcrypt from "bcryptjs";
import { and, eq, gt, isNull } from "drizzle-orm";
import { z } from "zod";
import { getDbOrNull, isProduction, schema } from "@/db/index";
import { authRateLimit } from "@/lib/rate-limit";
import {
	createRefreshToken,
	createSession,
	refreshSession,
	verifySession,
} from "@/lib/session";
import { ApiError } from "./errors";
import { parseInput } from "./validate";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
	refreshToken: string;
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

function sanitizeFallbackUser(u: FallbackUser): AuthSuccess["user"] {
	return {
		id: u.id,
		email: u.email,
		name: u.name,
		avatarUrl: u.avatarUrl,
		authProvider: u.authProvider,
		plan: u.plan,
		createdAt: u.createdAt,
		updatedAt: u.updatedAt,
	};
}

function generateId(): string {
	return (
		globalThis.crypto?.randomUUID?.() ??
		`id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
	);
}

// ---------------------------------------------------------------------------
// Server Functions
// ---------------------------------------------------------------------------

const signupSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
	name: z.string().max(100).optional(),
});

export const signupFn = createServerFn({ method: "POST" })
	.inputValidator((data: { email: string; password: string; name?: string }) =>
		parseInput(signupSchema, data),
	)
	.handler(async ({ data }): Promise<AuthResult> => {
		const email = data.email.trim().toLowerCase();
		const { password, name } = data;

		// Rate limit by email
		const limit = authRateLimit(email);
		if (!limit.allowed) {
			return { error: ApiError.rateLimit().message };
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
				return {
					error: ApiError.badRequest("Email already registered").message,
				};
			}

			// Insert new user
			const [created] = await db
				.insert(schema.users)
				.values({
					email,
					name: name || null,
					passwordHash,
					authProvider: "email",
					plan: "free",
				})
				.returning();

			const token = await createSession(created.id);
			const refreshToken = await createRefreshToken(created.id);

			return {
				user: sanitizeUser(created),
				token,
				refreshToken,
			};
		}

		// In production, DB is required (startup check prevents reaching here)
		if (isProduction()) {
			return { error: "Service unavailable. Please try again later." };
		}

		// Dev-only fallback: in-memory store
		console.warn("[Auth] signup: using in-memory fallback (no DATABASE_URL)");
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
		const refreshToken = await createRefreshToken(id);

		return {
			user: sanitizeFallbackUser(user),
			token,
			refreshToken,
		};
	});

const loginSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(1, "Password is required"),
});

export const loginFn = createServerFn({ method: "POST" })
	.inputValidator((data: { email: string; password: string }) =>
		parseInput(loginSchema, data),
	)
	.handler(async ({ data }): Promise<AuthResult> => {
		const email = data.email.trim().toLowerCase();
		const { password } = data;

		// Rate limit by email
		const limit = authRateLimit(email);
		if (!limit.allowed) {
			return { error: "Too many attempts. Please try again later." };
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

			if (!row.passwordHash) {
				return { error: "Please reset your password to continue." };
			}

			const valid = await bcrypt.compare(password, row.passwordHash);
			if (!valid) {
				return { error: "Invalid password" };
			}

			const token = await createSession(row.id);
			const refreshToken = await createRefreshToken(row.id);
			return { user: sanitizeUser(row), token, refreshToken };
		}

		// In production, DB is required
		if (isProduction()) {
			return { error: "Service unavailable. Please try again later." };
		}

		// Dev-only fallback: in-memory store
		console.warn("[Auth] login: using in-memory fallback (no DATABASE_URL)");
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
		const refreshToken = await createRefreshToken(foundUser.id);

		return {
			user: sanitizeFallbackUser(foundUser),
			token,
			refreshToken,
		};
	});

const logoutSchema = z.object({
	token: z.string().min(1, "Token is required"),
});

export const logoutFn = createServerFn({ method: "POST" })
	.inputValidator((data: { token: string }) => parseInput(logoutSchema, data))
	.handler(async ({ data }): Promise<{ success: boolean }> => {
		const db = getDbOrNull();

		if (db) {
			const tokenHash = await hashToken(data.token);

			// Decode JWT to get expiry (best-effort; if invalid, use 1h default)
			let expiresAt = new Date(Date.now() + 60 * 60 * 1000);
			try {
				const parts = data.token.split(".");
				if (parts[1]) {
					const payload = JSON.parse(atob(parts[1]));
					if (typeof payload.exp === "number") {
						expiresAt = new Date(payload.exp * 1000);
					}
				}
			} catch {
				// Use default expiry
			}

			await db.insert(schema.tokenBlocklist).values({
				tokenHash,
				expiresAt,
			});
		}

		return { success: true };
	});

const getSessionSchema = z.object({
	token: z.string().min(1, "Token is required"),
	refreshToken: z.string().optional(),
});

export const getSessionFn = createServerFn({ method: "POST" })
	.inputValidator((data: { token: string; refreshToken?: string }) =>
		parseInput(getSessionSchema, data),
	)
	.handler(
		async ({
			data,
		}): Promise<{
			user: AuthSuccess["user"] | null;
			newToken?: string;
			newRefreshToken?: string;
		}> => {
			const { token } = data;

			if (!token) {
				return { user: null };
			}

			// First try to verify the access token
			const session = await verifySession(token, "access");

			// If access token is expired but we have a refresh token, try refreshing
			if (!session && data.refreshToken) {
				const refreshed = await refreshSession(data.refreshToken);
				if (refreshed) {
					const refreshedSession = await verifySession(
						refreshed.token,
						"access",
					);
					if (refreshedSession) {
						const db = getDbOrNull();

						if (db) {
							const [row] = await db
								.select()
								.from(schema.users)
								.where(eq(schema.users.id, refreshedSession.userId));

							if (!row) {
								return { user: null };
							}

							return {
								user: sanitizeUser(row),
								newToken: refreshed.token,
								newRefreshToken: refreshed.refreshToken,
							};
						}

						if (isProduction()) {
							return { user: null };
						}

						const fallbackUser = fallbackUsers.get(refreshedSession.userId);
						if (!fallbackUser) {
							return { user: null };
						}

						return {
							user: sanitizeFallbackUser(fallbackUser),
							newToken: refreshed.token,
							newRefreshToken: refreshed.refreshToken,
						};
					}
				}
				return { user: null };
			}

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

				return { user: sanitizeUser(row) };
			}

			// In production, DB is required
			if (isProduction()) {
				return { user: null };
			}

			// Dev-only fallback: in-memory store
			const fallbackUser = fallbackUsers.get(session.userId);
			if (!fallbackUser) {
				return { user: null };
			}

			return { user: sanitizeFallbackUser(fallbackUser) };
		},
	);

const googleCallbackSchema = z.object({
	code: z.string().min(1, "Authorization code is required"),
	redirectTo: z.string().max(500).optional(),
});

export const googleCallbackFn = createServerFn({ method: "POST" })
	.inputValidator((data: { code: string; redirectTo?: string }) =>
		parseInput(googleCallbackSchema, data),
	)
	.handler(
		async ({
			data,
		}): Promise<
			| { user: AuthSuccess["user"]; token: string; redirectTo: string }
			| AuthError
		> => {
			const { code, redirectTo } = data;

			// Rate limit by code prefix (prevents replay/brute-force)
			const limit = authRateLimit(`google:${code.slice(0, 16)}`);
			if (!limit.allowed) {
				return { error: "Too many attempts. Please try again later." };
			}

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
			// Validate redirectTo is a safe relative URL (prevent open redirect)
			const safeRedirectTo =
				redirectTo?.startsWith("/") && !redirectTo.startsWith("//")
					? redirectTo
					: "/dashboard";

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

			// In production, DB is required
			if (isProduction()) {
				return { error: "Service unavailable. Please try again later." };
			}

			// Dev-only fallback: in-memory store
			console.warn(
				"[Auth] googleCallback: using in-memory fallback (no DATABASE_URL)",
			);
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
					user: sanitizeFallbackUser(foundUser),
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
				user: sanitizeFallbackUser(newUser),
				token,
				redirectTo: safeRedirectTo,
			};
		},
	);

// ── Token hashing helper ─────────────────────────────────────────

async function hashToken(token: string): Promise<string> {
	const encoded = new TextEncoder().encode(token);
	const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
	return Array.from(new Uint8Array(hashBuffer))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

// ── Request password reset ──────────────────────────────────────

const requestPasswordResetSchema = z.object({
	email: z.string().email("Invalid email address"),
});

export const requestPasswordResetFn = createServerFn({ method: "POST" })
	.inputValidator((data: { email: string }) =>
		parseInput(requestPasswordResetSchema, data),
	)
	.handler(async ({ data }): Promise<{ success: boolean } | AuthError> => {
		const email = data.email.trim().toLowerCase();

		// Rate limit by email
		const limit = authRateLimit(`reset:${email}`);
		if (!limit.allowed) {
			return { error: "Too many attempts. Please try again later." };
		}

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

			// Generate a random token and hash it for storage
			const rawToken = crypto.randomUUID();
			const tokenHash = await hashToken(rawToken);
			const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

			await db.insert(schema.passwordResetTokens).values({
				userId: row.id,
				tokenHash,
				expiresAt,
			});

			// Build reset URL and send email
			const baseUrl = process.env.VITE_APP_URL ?? "https://dreammoments.app";
			const resetUrl = `${baseUrl}/auth/reset?token=${rawToken}`;

			const { sendPasswordResetEmail } = await import("@/lib/email");
			await sendPasswordResetEmail(email, resetUrl);
		}

		// Always return success to avoid email enumeration
		return { success: true };
	});

// ── Confirm password reset ──────────────────────────────────────

const confirmPasswordResetSchema = z.object({
	token: z.string().min(1, "Token is required"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

export const confirmPasswordResetFn = createServerFn({ method: "POST" })
	.inputValidator((data: { token: string; password: string }) =>
		parseInput(confirmPasswordResetSchema, data),
	)
	.handler(async ({ data }): Promise<{ success: boolean } | AuthError> => {
		const { token, password } = data;

		// Rate limit by token prefix
		const limit = authRateLimit(`confirm-reset:${token.slice(0, 8)}`);
		if (!limit.allowed) {
			return { error: "Too many attempts. Please try again later." };
		}

		const db = getDbOrNull();

		if (!db) {
			return {
				error: "Password reset is not available without a database.",
			};
		}

		const tokenHash = await hashToken(token);
		const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

		// Atomically consume the token: only succeeds if unused and not expired
		const [consumed] = await db
			.update(schema.passwordResetTokens)
			.set({ usedAt: new Date() })
			.where(
				and(
					eq(schema.passwordResetTokens.tokenHash, tokenHash),
					isNull(schema.passwordResetTokens.usedAt),
					gt(schema.passwordResetTokens.expiresAt, new Date()),
				),
			)
			.returning();

		if (!consumed) {
			return { error: "Invalid, expired, or already used reset link." };
		}

		await db
			.update(schema.users)
			.set({ passwordHash, updatedAt: new Date() })
			.where(eq(schema.users.id, consumed.userId));

		return { success: true };
	});
