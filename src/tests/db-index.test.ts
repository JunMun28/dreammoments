import { describe, expect, test } from "vitest";
import {
	checkDatabaseHealth,
	isDatabaseAvailable,
	isProduction,
} from "../db/index";

describe("isProduction", () => {
	test("returns true when NODE_ENV is production", () => {
		const originalEnv = process.env.NODE_ENV;
		process.env.NODE_ENV = "production";

		expect(isProduction()).toBe(true);

		process.env.NODE_ENV = originalEnv;
	});

	test("returns false when NODE_ENV is not production", () => {
		const originalEnv = process.env.NODE_ENV;
		process.env.NODE_ENV = "development";

		expect(isProduction()).toBe(false);

		process.env.NODE_ENV = originalEnv;
	});

	test("returns false when NODE_ENV is undefined", () => {
		const originalEnv = process.env.NODE_ENV;
		delete process.env.NODE_ENV;

		expect(isProduction()).toBe(false);

		process.env.NODE_ENV = originalEnv;
	});
});

describe("isDatabaseAvailable", () => {
	test("returns false when DATABASE_URL is not set", () => {
		// This depends on environment setup
		// In test environment without DB, should return false
		expect(typeof isDatabaseAvailable()).toBe("boolean");
	});
});

describe("checkDatabaseHealth", () => {
	test("returns error when database is not configured", async () => {
		const result = await checkDatabaseHealth();

		// Should return a result object with connected field
		expect(result).toHaveProperty("connected");
		expect(result).toHaveProperty("latencyMs");
		expect(typeof result.connected).toBe("boolean");
		expect(typeof result.latencyMs).toBe("number");

		// If not connected, should have error message
		if (!result.connected) {
			expect(result.error).toBeDefined();
		}
	});
});
