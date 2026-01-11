import { beforeEach, describe, expect, it, vi } from "vitest";

// Create chainable mock helpers
const createChainMock = (finalValue: unknown = []) => {
	const chain: Record<string, unknown> = {};
	const methods = [
		"values",
		"from",
		"where",
		"set",
		"returning",
		"innerJoin",
		"leftJoin",
	];
	for (const method of methods) {
		chain[method] = vi.fn().mockImplementation(() => chain);
	}
	// Make the chain thenable for await (required for mocking async drizzle queries)
	// biome-ignore lint/suspicious/noThenProperty: intentional for Promise-like mock
	chain.then = (resolve: (value: unknown) => void) => resolve(finalValue);
	return chain;
};

// Mock the database module before importing auth functions
vi.mock("@/db/index", () => ({
	db: {
		insert: vi
			.fn()
			.mockImplementation(() => createChainMock([{ id: "mock-session-id" }])),
		select: vi.fn().mockImplementation(() => createChainMock([])),
		update: vi.fn().mockImplementation(() => createChainMock(undefined)),
		delete: vi.fn().mockImplementation(() => createChainMock(undefined)),
	},
}));

import {
	createSession,
	generateLoginCode,
	invalidateSession,
	validateSession,
	verifyLoginCode,
} from "./auth-server";

describe("Auth Server Functions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2024-06-15T12:00:00Z"));
	});

	describe("generateLoginCode", () => {
		it("generates a 6-digit numeric code", async () => {
			const result = await generateLoginCode("test@example.com");

			expect(result.code).toMatch(/^\d{6}$/);
		});

		it("returns expiration time 10 minutes from now", async () => {
			const result = await generateLoginCode("test@example.com");

			const expectedExpiry = new Date("2024-06-15T12:10:00Z");
			expect(result.expiresAt.getTime()).toBe(expectedExpiry.getTime());
		});

		it("normalizes email to lowercase", async () => {
			const result = await generateLoginCode("TEST@EXAMPLE.COM");

			expect(result.email).toBe("test@example.com");
		});
	});

	describe("verifyLoginCode", () => {
		it("returns error for invalid code format", async () => {
			const result = await verifyLoginCode("test@example.com", "12345");

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe("Invalid code format");
			}
		});

		it("returns error for non-existent code", async () => {
			const result = await verifyLoginCode("test@example.com", "123456");

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error).toBe("Invalid or expired code");
			}
		});
	});

	describe("createSession", () => {
		it("creates a session with 30-day expiry", async () => {
			const result = await createSession("user-uuid-123");

			expect(result.sessionId).toBeDefined();
			expect(typeof result.sessionId).toBe("string");

			const expectedExpiry = new Date("2024-07-15T12:00:00Z");
			expect(result.expiresAt.getTime()).toBe(expectedExpiry.getTime());
		});
	});

	describe("validateSession", () => {
		it("returns null for non-existent session", async () => {
			const result = await validateSession("non-existent-session-id");

			expect(result).toBeNull();
		});
	});

	describe("invalidateSession", () => {
		it("completes without error", async () => {
			await expect(invalidateSession("session-id-123")).resolves.not.toThrow();
		});
	});
});
