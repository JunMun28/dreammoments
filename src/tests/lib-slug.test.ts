import { describe, expect, test } from "vitest";
import { generateSlug, slugify } from "../lib/slug";

describe("slugify", () => {
	test("converts to lowercase", () => {
		expect(slugify("HELLO WORLD")).toBe("hello-world");
	});

	test("replaces spaces with hyphens", () => {
		expect(slugify("hello world test")).toBe("hello-world-test");
	});

	test("removes special characters", () => {
		expect(slugify("hello@world#test!")).toBe("hello-world-test");
	});

	test("trims leading and trailing hyphens", () => {
		expect(slugify("---hello world---")).toBe("hello-world");
	});

	test("handles multiple consecutive special chars", () => {
		expect(slugify("hello!!!world???test")).toBe("hello-world-test");
	});

	test("handles empty string", () => {
		expect(slugify("")).toBe("");
	});

	test("handles only special characters", () => {
		expect(slugify("!@#$%^&*()")).toBe("");
	});

	test("preserves numbers", () => {
		expect(slugify("hello123world456")).toBe("hello123world456");
	});

	test("handles chinese characters", () => {
		expect(slugify("你好世界")).toBe("");
	});

	test("trims whitespace", () => {
		expect(slugify("  hello world  ")).toBe("hello-world");
	});
});

describe("generateSlug", () => {
	test("returns base slug when no conflicts", () => {
		const existing = new Set<string>();
		const result = generateSlug("john-jane", existing);
		expect(result).toBe("john-jane");
	});

	test("returns base slug when not in existing", () => {
		const existing = new Set(["jane-doe", "bob-alice"]);
		const result = generateSlug("john-jane", existing);
		expect(result).toBe("john-jane");
	});

	test("generates unique slug when conflict exists", () => {
		const existing = new Set(["john-jane"]);
		const result = generateSlug("john-jane", existing);
		expect(result).not.toBe("john-jane");
		expect(result.startsWith("john-jane-")).toBe(true);
	});

	test("handles multiple conflicts", () => {
		const existing = new Set(["test", "test-abc1", "test-xyz2"]);
		const result = generateSlug("test", existing);
		expect(result).not.toBe("test");
		expect(result.startsWith("test-")).toBe(true);
	});

	test("handles empty base", () => {
		const existing = new Set<string>();
		const result = generateSlug("", existing);
		expect(result).toBe("dreammoments");
	});

	test("handles base that slugifies to empty", () => {
		const existing = new Set<string>();
		const result = generateSlug("!@#$%", existing);
		expect(result).toBe("dreammoments");
	});

	test("always returns unique slug even with many conflicts", () => {
		const existing = new Set<string>();
		// Fill with many variations
		for (let i = 0; i < 60; i++) {
			existing.add(`test-${i}`);
		}
		const result = generateSlug("test", existing);
		expect(existing.has(result)).toBe(false);
	});

	test("slugifies base before generating", () => {
		const existing = new Set<string>();
		const result = generateSlug("Hello World!!!", existing);
		expect(result).toBe("hello-world");
	});
});
