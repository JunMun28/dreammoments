import { describe, expect, test, vi } from "vitest";
import {
	createRefreshToken,
	createSession,
	getJwtSecret,
	refreshSession,
	verifySession,
} from "../lib/session";

describe("getJwtSecret", () => {
	test("returns Uint8Array from JWT_SECRET env var", () => {
		const originalSecret = process.env.JWT_SECRET;
		process.env.JWT_SECRET = "my-super-secret-key-that-is-32-chars-long!!";
		process.env.NODE_ENV = "development";

		const secret = getJwtSecret();
		expect(secret).toBeInstanceOf(Uint8Array);

		process.env.JWT_SECRET = originalSecret;
	});

	test("throws error in production when JWT_SECRET is not set", () => {
		const originalSecret = process.env.JWT_SECRET;
		const originalEnv = process.env.NODE_ENV;
		delete process.env.JWT_SECRET;
		process.env.NODE_ENV = "production";

		// Should throw an error
		expect(() => getJwtSecret()).toThrow("JWT_SECRET is required in production");

		process.env.JWT_SECRET = originalSecret;
		process.env.NODE_ENV = originalEnv;
	});

	test("uses dev fallback when JWT_SECRET not set in development", () => {
		const originalSecret = process.env.JWT_SECRET;
		const originalEnv = process.env.NODE_ENV;
		delete process.env.JWT_SECRET;
		process.env.NODE_ENV = "development";

		// Reset the dev fallback by using a fresh module
		const secret1 = getJwtSecret();
		const secret2 = getJwtSecret();

		// Should return the same fallback value
		expect(secret1).toEqual(secret2);

		process.env.JWT_SECRET = originalSecret;
		process.env.NODE_ENV = originalEnv;
	});
});

describe("createSession and verifySession", () => {
	test("creates and verifies a valid session", async () => {
		const originalSecret = process.env.JWT_SECRET;
		process.env.JWT_SECRET = "my-super-secret-key-that-is-32-chars-long!!";
		process.env.NODE_ENV = "development";

		const token = await createSession("user-123");
		expect(typeof token).toBe("string");
		expect(token.length).toBeGreaterThan(0);

		const session = await verifySession(token);
		expect(session).not.toBeNull();
		expect(session?.userId).toBe("user-123");

		process.env.JWT_SECRET = originalSecret;
	});

	test("returns null for invalid token", async () => {
		const session = await verifySession("invalid-token");
		expect(session).toBeNull();
	});

	test("returns null for empty token", async () => {
		const session = await verifySession("");
		expect(session).toBeNull();
	});

	test("returns null for malformed token", async () => {
		const session = await verifySession("not.a.jwt");
		expect(session).toBeNull();
	});
});

describe("createRefreshToken", () => {
	test("creates a valid refresh token", async () => {
		const originalSecret = process.env.JWT_SECRET;
		process.env.JWT_SECRET = "my-super-secret-key-that-is-32-chars-long!!";
		process.env.NODE_ENV = "development";

		const token = await createRefreshToken("user-123");
		expect(typeof token).toBe("string");
		expect(token.length).toBeGreaterThan(0);

		// Verify it works as a refresh token
		const session = await verifySession(token, "refresh");
		expect(session).not.toBeNull();
		expect(session?.userId).toBe("user-123");

		// Should not work as access token
		const accessSession = await verifySession(token, "access");
		expect(accessSession).toBeNull();

		process.env.JWT_SECRET = originalSecret;
	});
});

describe("refreshSession", () => {
	test("returns new tokens for valid refresh token", async () => {
		const originalSecret = process.env.JWT_SECRET;
		process.env.JWT_SECRET = "my-super-secret-key-that-is-32-chars-long!!";
		process.env.NODE_ENV = "development";

		const refreshToken = await createRefreshToken("user-123");
		const result = await refreshSession(refreshToken);

		expect(result).not.toBeNull();
		expect(result?.token).toBeDefined();
		expect(result?.refreshToken).toBeDefined();

		// Verify new access token works
		const session = await verifySession(result!.token, "access");
		expect(session?.userId).toBe("user-123");

		process.env.JWT_SECRET = originalSecret;
	});

	test("returns null for invalid refresh token", async () => {
		const result = await refreshSession("invalid-token");
		expect(result).toBeNull();
	});

	test("returns null for access token used as refresh", async () => {
		const originalSecret = process.env.JWT_SECRET;
		process.env.JWT_SECRET = "my-super-secret-key-that-is-32-chars-long!!";
		process.env.NODE_ENV = "development";

		const accessToken = await createSession("user-123");
		const result = await refreshSession(accessToken);

		expect(result).toBeNull();

		process.env.JWT_SECRET = originalSecret;
	});
});
