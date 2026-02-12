import { beforeEach, describe, expect, test, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mocks — must be declared before any import that triggers the module
// ---------------------------------------------------------------------------

vi.mock("@tanstack/react-start", () => ({
	createServerFn: ({ method }: { method: string }) => {
		let validatorFn: ((data: unknown) => unknown) | undefined;
		let handlerFn: ((ctx: { data: unknown }) => unknown) | undefined;

		const builder = {
			inputValidator(fn: (data: unknown) => unknown) {
				validatorFn = fn;
				return builder;
			},
			handler(fn: (ctx: { data: unknown }) => unknown) {
				handlerFn = fn;

				// The final callable: validate input, then run handler
				const callable = async (input: unknown) => {
					const validated = validatorFn ? validatorFn(input) : input;
					return handlerFn?.({ data: validated });
				};
				callable._method = method;
				callable.inputValidator = builder.inputValidator;
				callable.handler = builder.handler;
				return callable;
			},
		};
		return builder;
	},
}));

const mockDb = {
	select: vi.fn(),
	insert: vi.fn(),
	update: vi.fn(),
	delete: vi.fn(),
};

// Chainable query builder helpers
function chainable(result: unknown[] = []) {
	const chain: Record<string, unknown> = {};
	chain.from = vi.fn().mockReturnValue(chain);
	chain.where = vi.fn().mockReturnValue(chain);
	chain.set = vi.fn().mockReturnValue(chain);
	chain.values = vi.fn().mockReturnValue(chain);
	chain.returning = vi.fn().mockResolvedValue(result);
	chain.orderBy = vi.fn().mockReturnValue(chain);
	chain.groupBy = vi.fn().mockReturnValue(chain);
	chain.limit = vi.fn().mockReturnValue(chain);
	// For select queries without .returning() — make it thenable
	// biome-ignore lint/suspicious/noThenProperty: mock Drizzle thenable chain
	chain.then = vi
		.fn()
		.mockImplementation((resolve: (v: unknown) => void) => resolve(result));
	return chain;
}

vi.mock("@/db/index", () => ({
	getDbOrNull: vi.fn(() => null),
	isProduction: vi.fn(() => false),
	schema: {
		users: { id: "id", email: "email", passwordHash: "password_hash" },
		passwordResetTokens: {
			id: "id",
			tokenHash: "token_hash",
			userId: "user_id",
			expiresAt: "expires_at",
			usedAt: "used_at",
		},
		tokenBlocklist: {
			id: "id",
			tokenHash: "token_hash",
			expiresAt: "expires_at",
		},
	},
}));

vi.mock("@/lib/rate-limit", () => ({
	authRateLimit: vi.fn(() => ({ allowed: true, remaining: 4, resetAt: 0 })),
	formatRateLimitMessage: vi.fn(
		() => "Too many attempts. Try again in 15 minutes.",
	),
}));

vi.mock("@/lib/session", () => ({
	createSession: vi.fn(async () => "mock-access-token"),
	createRefreshToken: vi.fn(async () => "mock-refresh-token"),
	createOAuthStateToken: vi.fn(async () => "mock-oauth-state-token"),
	verifyOAuthStateToken: vi.fn(async () => ({ redirectTo: "/dashboard" })),
	verifySession: vi.fn(async () => null),
	refreshSession: vi.fn(async () => null),
}));

vi.mock("@/lib/email", () => ({
	sendPasswordResetEmail: vi.fn(async () => ({ success: true })),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

// We need to import the auth module *after* mocks are set up
import {
	confirmPasswordResetFn,
	createGoogleAuthStateFn,
	getSessionFn,
	googleCallbackFn,
	loginFn,
	logoutFn,
	requestPasswordResetFn,
	signupFn,
} from "@/api/auth";
import { getDbOrNull, isProduction } from "@/db/index";
import { authRateLimit } from "@/lib/rate-limit";
import {
	createOAuthStateToken,
	createRefreshToken,
	createSession,
	refreshSession,
	verifyOAuthStateToken,
	verifySession,
} from "@/lib/session";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockedGetDbOrNull = vi.mocked(getDbOrNull);
const mockedIsProduction = vi.mocked(isProduction);
const mockedAuthRateLimit = vi.mocked(authRateLimit);
const mockedCreateSession = vi.mocked(createSession);
const mockedCreateRefreshToken = vi.mocked(createRefreshToken);
const mockedCreateOAuthStateToken = vi.mocked(createOAuthStateToken);
const mockedVerifyOAuthStateToken = vi.mocked(verifyOAuthStateToken);
const mockedVerifySession = vi.mocked(verifySession);
const mockedRefreshSession = vi.mocked(refreshSession);

beforeEach(() => {
	vi.clearAllMocks();
	mockedGetDbOrNull.mockReturnValue(null);
	mockedIsProduction.mockReturnValue(false);
	mockedAuthRateLimit.mockReturnValue({
		allowed: true,
		remaining: 4,
		resetAt: 0,
	});
	mockedCreateSession.mockResolvedValue("mock-access-token");
	mockedCreateRefreshToken.mockResolvedValue("mock-refresh-token");
	mockedCreateOAuthStateToken.mockResolvedValue("mock-oauth-state-token");
	mockedVerifyOAuthStateToken.mockResolvedValue({ redirectTo: "/dashboard" });
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("signupFn", () => {
	test("successful signup (fallback path, no DB)", async () => {
		const result = (await (signupFn as CallableFunction)({
			email: "alice@example.com",
			password: "strongpass123",
			name: "Alice",
		})) as { user: { email: string }; token: string; refreshToken: string };

		expect(result.user).toBeDefined();
		expect(result.user.email).toBe("alice@example.com");
		expect(result.token).toBe("mock-access-token");
		expect(result.refreshToken).toBe("mock-refresh-token");
	});

	test("duplicate email returns error (fallback path)", async () => {
		// First signup succeeds
		await (signupFn as CallableFunction)({
			email: "dup@example.com",
			password: "strongpass123",
			name: "First",
		});

		// Second signup with same email
		const result = (await (signupFn as CallableFunction)({
			email: "dup@example.com",
			password: "strongpass123",
			name: "Second",
		})) as { error: string };

		expect(result.error).toContain("Unable to create account");
	});

	test("rate limiting returns error", async () => {
		mockedAuthRateLimit.mockReturnValue({
			allowed: false,
			remaining: 0,
			resetAt: Date.now() + 60000,
		});

		const result = (await (signupFn as CallableFunction)({
			email: "ratelimit@example.com",
			password: "strongpass123",
		})) as { error: string };

		expect(result.error).toContain("Too many attempts");
	});

	test("weak password is rejected by validator", async () => {
		await expect(
			(signupFn as CallableFunction)({
				email: "weak@example.com",
				password: "short",
			}),
		).rejects.toThrow();
	});

	test("invalid email is rejected by validator", async () => {
		await expect(
			(signupFn as CallableFunction)({
				email: "not-an-email",
				password: "strongpass123",
			}),
		).rejects.toThrow();
	});

	test("returns service unavailable in production without DB", async () => {
		mockedIsProduction.mockReturnValue(true);

		const result = (await (signupFn as CallableFunction)({
			email: "prod@example.com",
			password: "strongpass123",
		})) as { error: string };

		expect(result.error).toContain("Service unavailable");
	});

	test("successful signup with DB path", async () => {
		const now = new Date();
		const createdUser = {
			id: "user-uuid-1",
			email: "db@example.com",
			name: "DB User",
			avatarUrl: null,
			authProvider: "email",
			plan: "free",
			passwordHash: "hashed",
			createdAt: now,
			updatedAt: now,
		};

		const selectChain = chainable([]);
		const insertChain = chainable([createdUser]);

		mockDb.select.mockReturnValue(selectChain);
		mockDb.insert.mockReturnValue(insertChain);

		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = (await (signupFn as CallableFunction)({
			email: "db@example.com",
			password: "strongpass123",
			name: "DB User",
		})) as { user: { email: string }; token: string };

		expect(result.user.email).toBe("db@example.com");
		expect(result.token).toBe("mock-access-token");
	});

	test("duplicate email with DB path returns error", async () => {
		const existingUser = {
			id: "existing-user",
			email: "existing@example.com",
		};

		const selectChain = chainable([existingUser]);
		mockDb.select.mockReturnValue(selectChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = (await (signupFn as CallableFunction)({
			email: "existing@example.com",
			password: "strongpass123",
		})) as { error: string };

		expect(result.error).toContain("Unable to create account");
	});
});

describe("loginFn", () => {
	test("account not found (fallback path)", async () => {
		const result = (await (loginFn as CallableFunction)({
			email: "noone@example.com",
			password: "somepassword",
		})) as { error: string };

		expect(result.error).toBe("Invalid email or password");
	});

	test("rate limiting returns error", async () => {
		mockedAuthRateLimit.mockReturnValue({
			allowed: false,
			remaining: 0,
			resetAt: Date.now() + 60000,
		});

		const result = (await (loginFn as CallableFunction)({
			email: "rate@example.com",
			password: "somepassword",
		})) as { error: string };

		expect(result.error).toContain("Too many attempts");
	});

	test("returns service unavailable in production without DB", async () => {
		mockedIsProduction.mockReturnValue(true);

		const result = (await (loginFn as CallableFunction)({
			email: "prod@example.com",
			password: "somepassword",
		})) as { error: string };

		expect(result.error).toContain("Service unavailable");
	});

	test("account not found with DB path", async () => {
		const selectChain = chainable([]);
		mockDb.select.mockReturnValue(selectChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = (await (loginFn as CallableFunction)({
			email: "noone@example.com",
			password: "somepassword",
		})) as { error: string };

		expect(result.error).toBe("Invalid email or password");
	});

	test("wrong auth provider with DB path", async () => {
		const googleUser = {
			id: "google-user",
			email: "google@example.com",
			authProvider: "google",
			passwordHash: null,
		};

		const selectChain = chainable([googleUser]);
		mockDb.select.mockReturnValue(selectChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = (await (loginFn as CallableFunction)({
			email: "google@example.com",
			password: "somepassword",
		})) as { error: string };

		expect(result.error).toBe("Invalid email or password");
	});

	test("invalid password is rejected by validator", async () => {
		await expect(
			(loginFn as CallableFunction)({
				email: "user@example.com",
				password: "",
			}),
		).rejects.toThrow();
	});
});

describe("logoutFn", () => {
	test("returns success", async () => {
		const result = (await (logoutFn as CallableFunction)({
			token: "some-valid-token",
		})) as {
			success: boolean;
		};
		expect(result.success).toBe(true);
	});

	test("allows empty payload and still succeeds", async () => {
		const result = (await (logoutFn as CallableFunction)({})) as {
			success: boolean;
		};
		expect(result.success).toBe(true);
	});
});

describe("getSessionFn", () => {
	test("returns null user for invalid token", async () => {
		mockedVerifySession.mockResolvedValue(null);

		const result = (await (getSessionFn as CallableFunction)({
			token: "invalid-token",
		})) as { user: null };

		expect(result.user).toBeNull();
	});

	test("returns user for valid token (fallback path)", async () => {
		// First create a user via signup to populate fallbackUsers
		const signupResult = (await (signupFn as CallableFunction)({
			email: "session-test@example.com",
			password: "strongpass123",
			name: "Session User",
		})) as { user: { id: string } };

		const userId = signupResult.user.id;
		mockedVerifySession.mockResolvedValue({ userId });

		const result = (await (getSessionFn as CallableFunction)({
			token: "valid-token",
		})) as { user: { email: string } };

		expect(result.user).toBeDefined();
		expect(result.user.email).toBe("session-test@example.com");
	});

	test("refreshes token when access token expires", async () => {
		// First signup to create user in fallback
		const signupResult = (await (signupFn as CallableFunction)({
			email: "refresh-test@example.com",
			password: "strongpass123",
		})) as { user: { id: string } };

		const userId = signupResult.user.id;

		// Access token fails
		mockedVerifySession
			.mockResolvedValueOnce(null) // first call for access token
			.mockResolvedValueOnce({ userId }); // second call for refreshed token

		mockedRefreshSession.mockResolvedValue({
			token: "new-access-token",
			refreshToken: "new-refresh-token",
		});

		const result = (await (getSessionFn as CallableFunction)({
			token: "expired-token",
			refreshToken: "valid-refresh-token",
		})) as {
			user: { email: string };
			newToken: string;
			newRefreshToken: string;
		};

		expect(result.user).toBeDefined();
		expect(result.newToken).toBe("new-access-token");
		expect(result.newRefreshToken).toBe("new-refresh-token");
	});

	test("returns null when refresh also fails", async () => {
		mockedVerifySession.mockResolvedValue(null);
		mockedRefreshSession.mockResolvedValue(null);

		const result = (await (getSessionFn as CallableFunction)({
			token: "expired",
			refreshToken: "also-expired",
		})) as { user: null };

		expect(result.user).toBeNull();
	});

	test("returns user with DB path", async () => {
		const now = new Date();
		const dbUser = {
			id: "db-user-id",
			email: "dbuser@example.com",
			name: "DB User",
			avatarUrl: null,
			authProvider: "email",
			plan: "free",
			createdAt: now,
			updatedAt: now,
		};

		mockedVerifySession.mockResolvedValue({ userId: "db-user-id" });

		const blocklistLookupChain = chainable([]);
		const userLookupChain = chainable([dbUser]);
		mockDb.select
			.mockReturnValueOnce(blocklistLookupChain)
			.mockReturnValueOnce(userLookupChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = (await (getSessionFn as CallableFunction)({
			token: "valid-db-token",
		})) as { user: { email: string } };

		expect(result.user).toBeDefined();
		expect(result.user.email).toBe("dbuser@example.com");
	});
});

describe("googleCallbackFn", () => {
	test("creates signed OAuth state token", async () => {
		const result = (await (createGoogleAuthStateFn as CallableFunction)({
			redirectTo: "/editor/new",
		})) as { stateToken: string };

		expect(result.stateToken).toBe("mock-oauth-state-token");
	});

	test("returns error when OAuth is not configured", async () => {
		// Ensure env vars are not set
		const origClientId = process.env.VITE_GOOGLE_CLIENT_ID;
		const origSecret = process.env.GOOGLE_CLIENT_SECRET;
		const origRedirect = process.env.VITE_GOOGLE_REDIRECT_URI;

		delete process.env.VITE_GOOGLE_CLIENT_ID;
		delete process.env.GOOGLE_CLIENT_SECRET;
		delete process.env.VITE_GOOGLE_REDIRECT_URI;

		const result = (await (googleCallbackFn as CallableFunction)({
			code: "test-auth-code-12345",
			stateToken: "state-token",
		})) as { error: string };

		expect(result.error).toContain("Google OAuth is not configured");

		// Restore
		if (origClientId) process.env.VITE_GOOGLE_CLIENT_ID = origClientId;
		if (origSecret) process.env.GOOGLE_CLIENT_SECRET = origSecret;
		if (origRedirect) process.env.VITE_GOOGLE_REDIRECT_URI = origRedirect;
	});

	test("rate limiting returns error", async () => {
		mockedAuthRateLimit.mockReturnValue({
			allowed: false,
			remaining: 0,
			resetAt: Date.now() + 60000,
		});

		const result = (await (googleCallbackFn as CallableFunction)({
			code: "test-auth-code-12345",
			stateToken: "state-token",
		})) as { error: string };

		expect(result.error).toContain("Too many attempts");
	});

	test("invalid OAuth state is rejected", async () => {
		mockedVerifyOAuthStateToken.mockResolvedValueOnce(null);

		const result = (await (googleCallbackFn as CallableFunction)({
			code: "test-auth-code-12345",
			stateToken: "bad-state-token",
		})) as { error: string };

		expect(result.error).toContain("Invalid or expired OAuth state");
	});
});

describe("requestPasswordResetFn", () => {
	test("returns success even for non-existent email (no DB)", async () => {
		const result = (await (requestPasswordResetFn as CallableFunction)({
			email: "unknown@example.com",
		})) as { success: boolean };

		expect(result.success).toBe(true);
	});

	test("rate limiting returns error", async () => {
		mockedAuthRateLimit.mockReturnValue({
			allowed: false,
			remaining: 0,
			resetAt: Date.now() + 60000,
		});

		const result = (await (requestPasswordResetFn as CallableFunction)({
			email: "rate@example.com",
		})) as { error: string };

		expect(result.error).toContain("Too many attempts");
	});

	test("returns success with DB (user found)", async () => {
		const dbUser = { id: "user-1", email: "found@example.com" };
		const selectChain = chainable([dbUser]);
		const insertChain = chainable([{ id: "token-1" }]);

		mockDb.select.mockReturnValue(selectChain);
		mockDb.insert.mockReturnValue(insertChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = (await (requestPasswordResetFn as CallableFunction)({
			email: "found@example.com",
		})) as { success: boolean };

		expect(result.success).toBe(true);
	});

	test("returns success with DB (user not found — no email enumeration)", async () => {
		const selectChain = chainable([]);
		mockDb.select.mockReturnValue(selectChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = (await (requestPasswordResetFn as CallableFunction)({
			email: "notfound@example.com",
		})) as { success: boolean };

		expect(result.success).toBe(true);
	});
});

describe("confirmPasswordResetFn", () => {
	test("returns error without DB", async () => {
		const result = (await (confirmPasswordResetFn as CallableFunction)({
			token: "some-reset-token",
			password: "newstrongpass",
		})) as { error: string };

		expect(result.error).toContain("not available without a database");
	});

	test("rate limiting returns error", async () => {
		mockedAuthRateLimit.mockReturnValue({
			allowed: false,
			remaining: 0,
			resetAt: Date.now() + 60000,
		});

		const result = (await (confirmPasswordResetFn as CallableFunction)({
			token: "some-token",
			password: "newstrongpass",
		})) as { error: string };

		expect(result.error).toContain("Too many attempts");
	});

	test("invalid token returns error with DB", async () => {
		// Atomic update returns empty (no matching row)
		const updateChain = chainable([]);
		mockDb.update.mockReturnValue(updateChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = (await (confirmPasswordResetFn as CallableFunction)({
			token: "bad-token-value",
			password: "newstrongpass",
		})) as { error: string };

		expect(result.error).toContain("Invalid, expired, or already used");
	});

	test("used token returns error with DB", async () => {
		// Atomic update returns empty (usedAt IS NOT NULL fails the WHERE)
		const updateChain = chainable([]);
		mockDb.update.mockReturnValue(updateChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = (await (confirmPasswordResetFn as CallableFunction)({
			token: "used-token-value",
			password: "newstrongpass",
		})) as { error: string };

		expect(result.error).toContain("Invalid, expired, or already used");
	});

	test("expired token returns error with DB", async () => {
		// Atomic update returns empty (expiresAt check fails the WHERE)
		const updateChain = chainable([]);
		mockDb.update.mockReturnValue(updateChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = (await (confirmPasswordResetFn as CallableFunction)({
			token: "expired-token-value",
			password: "newstrongpass",
		})) as { error: string };

		expect(result.error).toContain("Invalid, expired, or already used");
	});

	test("valid token resets password with DB", async () => {
		const consumedReset = {
			id: "reset-3",
			userId: "user-1",
			tokenHash: "abc",
			expiresAt: new Date(Date.now() + 3600000),
			usedAt: new Date(),
		};

		// First update (atomic consume) returns the consumed row,
		// second update (password change) returns nothing
		const consumeChain = chainable([consumedReset]);
		const passwordChain = chainable([]);
		mockDb.update
			.mockReturnValueOnce(consumeChain)
			.mockReturnValueOnce(passwordChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = (await (confirmPasswordResetFn as CallableFunction)({
			token: "valid-reset-token",
			password: "newstrongpass",
		})) as { success: boolean };

		expect(result.success).toBe(true);
	});

	test("weak password is rejected by validator", async () => {
		await expect(
			(confirmPasswordResetFn as CallableFunction)({
				token: "some-token",
				password: "short",
			}),
		).rejects.toThrow();
	});
});
