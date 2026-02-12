import { describe, expect, test } from "vitest";
import { requireAuth } from "../lib/server-auth";
import { createRefreshToken, createSession } from "../lib/session";

describe("requireAuth", () => {
	test("throws error when token is undefined", async () => {
		await expect(requireAuth(undefined)).rejects.toThrow(
			"Authentication required",
		);
	});

	test("throws error when token is empty", async () => {
		await expect(requireAuth("")).rejects.toThrow("Authentication required");
	});

	test("throws error for invalid token", async () => {
		await expect(requireAuth("invalid-token")).rejects.toThrow(
			"Invalid or expired session",
		);
	});

	test("returns userId for valid token", async () => {
		const originalSecret = process.env.JWT_SECRET;
		process.env.JWT_SECRET = "my-super-secret-key-that-is-32-chars-long!!";
		process.env.NODE_ENV = "development";

		const token = await createSession("user-123");
		const result = await requireAuth(token);

		expect(result).toEqual({ userId: "user-123" });

		process.env.JWT_SECRET = originalSecret;
	});

	test("rejects refresh token on protected auth path", async () => {
		const originalSecret = process.env.JWT_SECRET;
		process.env.JWT_SECRET = "my-super-secret-key-that-is-32-chars-long!!";
		process.env.NODE_ENV = "development";

		const refreshToken = await createRefreshToken("user-123");
		await expect(requireAuth(refreshToken)).rejects.toThrow(
			"Invalid or expired session",
		);

		process.env.JWT_SECRET = originalSecret;
	});
});
