import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createRateLimiter } from "../lib/rate-limit";

describe("createRateLimiter", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	test("allows requests within limit", () => {
		const limiter = createRateLimiter("test1", {
			maxAttempts: 3,
			windowMs: 60000,
		});

		const result1 = limiter("key1");
		expect(result1.allowed).toBe(true);
		expect(result1.remaining).toBe(2);

		const result2 = limiter("key1");
		expect(result2.allowed).toBe(true);
		expect(result2.remaining).toBe(1);

		const result3 = limiter("key1");
		expect(result3.allowed).toBe(true);
		expect(result3.remaining).toBe(0);
	});

	test("blocks requests over limit", () => {
		const limiter = createRateLimiter("test2", {
			maxAttempts: 2,
			windowMs: 60000,
		});

		limiter("key1");
		limiter("key1");

		const result = limiter("key1");
		expect(result.allowed).toBe(false);
		expect(result.remaining).toBe(0);
	});

	test("resets after window expires", () => {
		const windowMs = 60000;
		const limiter = createRateLimiter("test3", { maxAttempts: 2, windowMs });

		limiter("key1");
		limiter("key1");

		// Blocked
		expect(limiter("key1").allowed).toBe(false);

		// Advance past window
		vi.advanceTimersByTime(windowMs + 1);

		// Should be allowed again
		const result = limiter("key1");
		expect(result.allowed).toBe(true);
		expect(result.remaining).toBe(1);
	});

	test("tracks different keys independently", () => {
		const limiter = createRateLimiter("test4", {
			maxAttempts: 2,
			windowMs: 60000,
		});

		// Use up limit for key1
		limiter("key1");
		limiter("key1");
		expect(limiter("key1").allowed).toBe(false);

		// key2 should still have full limit
		const result = limiter("key2");
		expect(result.allowed).toBe(true);
		expect(result.remaining).toBe(1);
	});

	test("different limiters have separate stores", () => {
		const limiter1 = createRateLimiter("store1", {
			maxAttempts: 2,
			windowMs: 60000,
		});
		const limiter2 = createRateLimiter("store2", {
			maxAttempts: 2,
			windowMs: 60000,
		});

		// Use up limiter1's quota
		limiter1("key");
		limiter1("key");

		// limiter2 should still have full quota
		const result = limiter2("key");
		expect(result.allowed).toBe(true);
		expect(result.remaining).toBe(1);
	});

	test("returns correct resetAt timestamp", () => {
		const windowMs = 60000;
		const limiter = createRateLimiter("test5", { maxAttempts: 2, windowMs });

		const before = Date.now();
		const result = limiter("key1");
		const after = Date.now();

		expect(result.resetAt).toBeGreaterThanOrEqual(before + windowMs);
		expect(result.resetAt).toBeLessThanOrEqual(after + windowMs);
	});

	test("first request starts new window", () => {
		const windowMs = 60000;
		const limiter = createRateLimiter("test6", { maxAttempts: 2, windowMs });

		const result = limiter("key1");
		expect(result.allowed).toBe(true);
		expect(result.remaining).toBe(1);
	});

	test("handles many requests correctly", () => {
		const limiter = createRateLimiter("test7", {
			maxAttempts: 100,
			windowMs: 60000,
		});

		for (let i = 0; i < 100; i++) {
			expect(limiter("key1").allowed).toBe(true);
		}
		expect(limiter("key1").allowed).toBe(false);
	});
});
