import { describe, expect, it, vi } from "vitest";
import {
	type CsvExportRow,
	downloadCsv,
	formatCsvValue,
	generateCsvContent,
} from "./csv-export";

describe("formatCsvValue", () => {
	it("returns empty string for null", () => {
		expect(formatCsvValue(null)).toBe("");
	});

	it("returns empty string for undefined", () => {
		expect(formatCsvValue(undefined)).toBe("");
	});

	it("converts numbers to strings", () => {
		expect(formatCsvValue(42)).toBe("42");
		expect(formatCsvValue(0)).toBe("0");
	});

	it("returns string as-is when no special characters", () => {
		expect(formatCsvValue("John Smith")).toBe("John Smith");
	});

	it("wraps values with commas in quotes", () => {
		expect(formatCsvValue("Doe, John")).toBe('"Doe, John"');
	});

	it("wraps values with quotes in double-quotes", () => {
		expect(formatCsvValue('Said "hello"')).toBe('"Said ""hello"""');
	});

	it("wraps values with newlines in quotes", () => {
		expect(formatCsvValue("Line 1\nLine 2")).toBe('"Line 1\nLine 2"');
	});

	it("handles multiple special characters", () => {
		expect(formatCsvValue('John "Jack", Jr.')).toBe('"John ""Jack"", Jr."');
	});

	it("formats dates in ISO format", () => {
		const date = new Date("2026-06-15T14:30:00Z");
		expect(formatCsvValue(date)).toBe("2026-06-15T14:30:00.000Z");
	});
});

describe("generateCsvContent", () => {
	it("generates CSV with headers and data rows", () => {
		const rows: CsvExportRow[] = [
			{
				guestName: "John Smith",
				groupName: "Family",
				status: "attending",
				headcount: 2,
				mealPreference: "Chicken",
				dietaryNotes: null,
				plusOneCount: 1,
				plusOneNames: "Jane Smith",
				respondedAt: null,
			},
		];

		const csv = generateCsvContent(rows);
		const lines = csv.split("\n");

		expect(lines[0]).toBe(
			"Guest Name,Group,Status,Headcount,Meal Preference,Dietary Notes,Plus-One Count,Plus-One Names,Responded At",
		);
		expect(lines[1]).toBe(
			"John Smith,Family,Attending,2,Chicken,,1,Jane Smith,",
		);
	});

	it("generates CSV with multiple rows", () => {
		const rows: CsvExportRow[] = [
			{
				guestName: "John Smith",
				groupName: "Family",
				status: "attending",
				headcount: 1,
				mealPreference: "Chicken",
				dietaryNotes: null,
				plusOneCount: 0,
				plusOneNames: null,
				respondedAt: new Date("2026-01-10T10:00:00Z"),
			},
			{
				guestName: "Mary Johnson",
				groupName: "Friends",
				status: "declined",
				headcount: 0,
				mealPreference: null,
				dietaryNotes: null,
				plusOneCount: 0,
				plusOneNames: null,
				respondedAt: new Date("2026-01-11T12:00:00Z"),
			},
			{
				guestName: "Bob Wilson",
				groupName: "Colleagues",
				status: "pending",
				headcount: 0,
				mealPreference: null,
				dietaryNotes: null,
				plusOneCount: 0,
				plusOneNames: null,
				respondedAt: null,
			},
		];

		const csv = generateCsvContent(rows);
		const lines = csv.split("\n");

		expect(lines.length).toBe(4); // header + 3 data rows
		expect(lines[1]).toContain("John Smith,Family,Attending");
		expect(lines[2]).toContain("Mary Johnson,Friends,Declined");
		expect(lines[3]).toContain("Bob Wilson,Colleagues,Pending");
	});

	it("handles empty rows array", () => {
		const csv = generateCsvContent([]);
		const lines = csv.split("\n");

		expect(lines.length).toBe(1); // header only
		expect(lines[0]).toContain("Guest Name");
	});

	it("escapes special characters in values", () => {
		const rows: CsvExportRow[] = [
			{
				guestName: "Smith, John",
				groupName: 'The "Friends"',
				status: "attending",
				headcount: 1,
				mealPreference: "Vegetarian",
				dietaryNotes: "Allergic to nuts\nand shellfish",
				plusOneCount: 0,
				plusOneNames: null,
				respondedAt: null,
			},
		];

		const csv = generateCsvContent(rows);

		// Check the raw CSV content (not split by newlines since the content has embedded newlines)
		expect(csv).toContain('"Smith, John"');
		expect(csv).toContain('"The ""Friends"""');
		expect(csv).toContain('"Allergic to nuts\nand shellfish"');
	});

	it("capitalizes status values", () => {
		const rows: CsvExportRow[] = [
			{
				guestName: "Test",
				groupName: "Group",
				status: "attending",
				headcount: 1,
				mealPreference: null,
				dietaryNotes: null,
				plusOneCount: 0,
				plusOneNames: null,
				respondedAt: null,
			},
		];

		const csv = generateCsvContent(rows);
		expect(csv).toContain("Attending");
	});
});

describe("downloadCsv", () => {
	it("creates a download link with correct attributes", () => {
		// Mock URL methods that don't exist in jsdom
		const originalCreateObjectURL = URL.createObjectURL;
		const originalRevokeObjectURL = URL.revokeObjectURL;
		URL.createObjectURL = vi.fn().mockReturnValue("blob:test-url");
		URL.revokeObjectURL = vi.fn();

		// Mock DOM methods
		const capturedAnchor: {
			href: string;
			download: string;
			click: () => void;
		} = { href: "", download: "", click: vi.fn() };
		const createElementSpy = vi
			.spyOn(document, "createElement")
			.mockImplementation((tag: string) => {
				if (tag === "a") {
					return capturedAnchor as unknown as HTMLAnchorElement;
				}
				return document.createElement(tag);
			});

		downloadCsv("test,csv,content", "test-file.csv");

		expect(createElementSpy).toHaveBeenCalledWith("a");
		expect(URL.createObjectURL).toHaveBeenCalled();
		expect(capturedAnchor.download).toBe("test-file.csv");
		expect(capturedAnchor.href).toBe("blob:test-url");
		expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:test-url");
		expect(capturedAnchor.click).toHaveBeenCalled();

		// Restore
		createElementSpy.mockRestore();
		URL.createObjectURL = originalCreateObjectURL;
		URL.revokeObjectURL = originalRevokeObjectURL;
	});
});
