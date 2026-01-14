import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { GuestResponseRow } from "@/lib/rsvp-server";
import { CsvExportButton, convertToCsvRows } from "./CsvExportButton";

// Mock the csv-export module
vi.mock("@/lib/csv-export", () => ({
	generateCsvContent: vi.fn().mockReturnValue("mock,csv,content"),
	downloadCsv: vi.fn(),
}));

describe("convertToCsvRows", () => {
	it("converts GuestResponseRow to CsvExportRow", () => {
		const responses: GuestResponseRow[] = [
			{
				guestId: "1",
				guestName: "John Smith",
				email: "john@example.com",
				phone: "555-1234",
				groupId: "g1",
				groupName: "Family",
				status: "attending",
				mealPreference: "Chicken",
				dietaryNotes: "No nuts",
				plusOneCount: 1,
				plusOneNames: "Jane Smith",
				headcount: 2,
				respondedAt: new Date("2026-01-10T10:00:00Z"),
				updatedAt: new Date("2026-01-10T10:00:00Z"),
			},
		];

		const result = convertToCsvRows(responses);

		expect(result).toHaveLength(1);
		expect(result[0]).toEqual({
			guestName: "John Smith",
			groupName: "Family",
			status: "attending",
			headcount: 2,
			mealPreference: "Chicken",
			dietaryNotes: "No nuts",
			plusOneCount: 1,
			plusOneNames: "Jane Smith",
			respondedAt: responses[0].respondedAt,
		});
	});

	it("handles null values correctly", () => {
		const responses: GuestResponseRow[] = [
			{
				guestId: "1",
				guestName: "John Smith",
				email: null,
				phone: null,
				groupId: "g1",
				groupName: "Family",
				status: "pending",
				mealPreference: null,
				dietaryNotes: null,
				plusOneCount: 0,
				plusOneNames: null,
				headcount: 0,
				respondedAt: null,
				updatedAt: null,
			},
		];

		const result = convertToCsvRows(responses);

		expect(result[0].mealPreference).toBeNull();
		expect(result[0].dietaryNotes).toBeNull();
		expect(result[0].plusOneNames).toBeNull();
		expect(result[0].respondedAt).toBeNull();
	});
});

describe("CsvExportButton", () => {
	it("renders with default text", () => {
		render(<CsvExportButton responses={[]} />);

		expect(screen.getByRole("button")).toBeDefined();
		expect(screen.getByText("Export to CSV")).toBeDefined();
	});

	it("renders with custom text", () => {
		render(<CsvExportButton responses={[]} buttonText="Download CSV" />);

		expect(screen.getByText("Download CSV")).toBeDefined();
	});

	it("is disabled when responses are empty", () => {
		render(<CsvExportButton responses={[]} />);

		const button = screen.getByRole("button");
		expect(button.hasAttribute("disabled")).toBe(true);
	});

	it("is enabled when responses are provided", () => {
		const responses: GuestResponseRow[] = [
			{
				guestId: "1",
				guestName: "John Smith",
				email: null,
				phone: null,
				groupId: "g1",
				groupName: "Family",
				status: "attending",
				mealPreference: null,
				dietaryNotes: null,
				plusOneCount: 0,
				plusOneNames: null,
				headcount: 1,
				respondedAt: null,
				updatedAt: null,
			},
		];

		render(<CsvExportButton responses={responses} />);

		const button = screen.getByRole("button");
		expect(button.hasAttribute("disabled")).toBe(false);
	});

	it("calls downloadCsv with correct filename when clicked", async () => {
		const user = userEvent.setup();
		const { downloadCsv } = await import("@/lib/csv-export");

		const responses: GuestResponseRow[] = [
			{
				guestId: "1",
				guestName: "John Smith",
				email: null,
				phone: null,
				groupId: "g1",
				groupName: "Family",
				status: "attending",
				mealPreference: null,
				dietaryNotes: null,
				plusOneCount: 0,
				plusOneNames: null,
				headcount: 1,
				respondedAt: null,
				updatedAt: null,
			},
		];

		render(<CsvExportButton responses={responses} filename="my-export.csv" />);

		await user.click(screen.getByRole("button"));

		expect(downloadCsv).toHaveBeenCalledWith(
			"mock,csv,content",
			"my-export.csv",
		);
	});

	it("uses default filename when not provided", async () => {
		const user = userEvent.setup();
		const { downloadCsv } = await import("@/lib/csv-export");

		const responses: GuestResponseRow[] = [
			{
				guestId: "1",
				guestName: "John Smith",
				email: null,
				phone: null,
				groupId: "g1",
				groupName: "Family",
				status: "attending",
				mealPreference: null,
				dietaryNotes: null,
				plusOneCount: 0,
				plusOneNames: null,
				headcount: 1,
				respondedAt: null,
				updatedAt: null,
			},
		];

		render(<CsvExportButton responses={responses} />);

		await user.click(screen.getByRole("button"));

		expect(downloadCsv).toHaveBeenCalledWith(
			expect.any(String),
			"rsvp-responses.csv",
		);
	});
});
