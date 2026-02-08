import { describe, expect, test } from "vitest";
import { cn } from "../lib/utils";

describe("cn (className utility)", () => {
	test("combines simple strings", () => {
		const result = cn("class1", "class2");
		expect(result).toBe("class1 class2");
	});

	test("handles conditional classes", () => {
		const isActive = true;
		const result = cn("base", isActive && "active", !isActive && "inactive");
		expect(result).toBe("base active");
	});

	test("handles falsey values", () => {
		const result = cn("base", null, undefined, false, "", "valid");
		expect(result).toBe("base valid");
	});

	test("merges tailwind classes correctly", () => {
		const result = cn("px-2 py-1", "px-4");
		expect(result).toBe("py-1 px-4");
	});

	test("handles object syntax", () => {
		const result = cn("base", { active: true, disabled: false });
		expect(result).toBe("base active");
	});

	test("handles empty input", () => {
		const result = cn();
		expect(result).toBe("");
	});

	test("handles array input", () => {
		const result = cn(["class1", "class2"], "class3");
		expect(result).toBe("class1 class2 class3");
	});

	test("deduplicates conflicting tailwind classes", () => {
		const result = cn("text-red-500", "text-blue-500", "text-green-500");
		expect(result).toBe("text-green-500");
	});
});
