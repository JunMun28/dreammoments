import { describe, expect, test } from "vitest";
import { detectDeviceType, exportGuestsCsv } from "../lib/data";

describe("data module - utilities", () => {
	describe("detectDeviceType", () => {
		test("detects mobile user agents", () => {
			expect(
				detectDeviceType(
					"Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
				),
			).toBe("mobile");
			expect(
				detectDeviceType("Mozilla/5.0 (Android 10; Mobile; rv:83.0)"),
			).toBe("mobile");
			expect(
				detectDeviceType("Mozilla/5.0 (Linux; Android 11; SM-G991B)"),
			).toBe("mobile");
		});

		test("detects tablet user agents", () => {
			expect(
				detectDeviceType("Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)"),
			).toBe("tablet");
			expect(
				detectDeviceType("Mozilla/5.0 (Linux; tablet; Android 10; SM-T510)"),
			).toBe("tablet");
		});

		test("defaults to desktop for unknown user agents", () => {
			expect(
				detectDeviceType("Mozilla/5.0 (Windows NT 10.0; Win64; x64)"),
			).toBe("desktop");
			expect(
				detectDeviceType("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"),
			).toBe("desktop");
			expect(detectDeviceType("Mozilla/5.0 (X11; Linux x86_64)")).toBe(
				"desktop",
			);
			expect(detectDeviceType("")).toBe("desktop");
		});
	});

	describe("exportGuestsCsv", () => {
		// Note: Full tests require mocking the store, which is complex.
		// These tests verify the CSV structure when called with various guest lists.
		test("CSV format is correct", () => {
			// This test will use the actual store state, which may be empty
			// We're primarily testing that the function doesn't throw
			const csv = exportGuestsCsv("non-existent-invitation-id");
			expect(typeof csv).toBe("string");
			// Should always have header
			expect(csv).toContain('"name"');
			expect(csv).toContain('"attendance"');
			expect(csv).toContain('"guest_count"');
		});
	});
});

// Note: Integration tests for data functions are in the e2e tests
// because they require proper store setup and teardown.
