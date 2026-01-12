// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
	InvitationBuilderProvider,
	type InvitationData,
} from "@/contexts/InvitationBuilderContext";
import { formatDate, formatTime, InvitationPreview } from "./InvitationPreview";

// Wrapper to provide context
function renderWithContext(invitationData: InvitationData) {
	return render(
		<InvitationBuilderProvider initialData={invitationData}>
			<InvitationPreview />
		</InvitationBuilderProvider>,
	);
}

describe("InvitationPreview", () => {
	afterEach(() => {
		cleanup();
	});

	const fullData: InvitationData = {
		id: "test-123",
		partner1Name: "Alice",
		partner2Name: "Bob",
		weddingDate: new Date(2026, 5, 15), // June 15, 2026
		weddingTime: "14:30",
		venueName: "Grand Ballroom",
		venueAddress: "123 Wedding Lane, City",
	};

	const emptyData: InvitationData = {
		id: "test-123",
		partner1Name: "",
		partner2Name: "",
	};

	it("displays partner names when provided", () => {
		renderWithContext(fullData);

		// Names are in the same h1 element, check via heading role
		const heading = screen.getByRole("heading", { level: 1 });
		expect(heading.textContent).toContain("Alice");
		expect(heading.textContent).toContain("Bob");
	});

	it("shows placeholder when names are empty", () => {
		renderWithContext(emptyData);

		expect(screen.getByText("Your Names Here")).toBeDefined();
	});

	it("displays formatted wedding date", () => {
		renderWithContext(fullData);

		expect(screen.getByText("June 15, 2026")).toBeDefined();
	});

	it("displays formatted wedding time", () => {
		renderWithContext(fullData);

		expect(screen.getByText("2:30 PM")).toBeDefined();
	});

	it("displays venue name and address", () => {
		renderWithContext(fullData);

		expect(screen.getByText("Grand Ballroom")).toBeDefined();
		expect(screen.getByText("123 Wedding Lane, City")).toBeDefined();
	});

	it("shows placeholder text when date/time are missing", () => {
		renderWithContext(emptyData);

		expect(screen.getByText("Date and time will appear here")).toBeDefined();
	});

	it("shows placeholder text when venue is missing", () => {
		renderWithContext(emptyData);

		expect(screen.getByText("Venue details will appear here")).toBeDefined();
	});

	it("renders RSVP section placeholder", () => {
		renderWithContext(fullData);

		expect(screen.getByText("RSVP")).toBeDefined();
	});

	it("shows schedule placeholder when no blocks", () => {
		renderWithContext(emptyData);

		expect(screen.getByText("Event schedule will appear here")).toBeDefined();
	});

	it("displays schedule blocks when provided", () => {
		const dataWithSchedule: InvitationData = {
			...fullData,
			scheduleBlocks: [
				{
					id: "block-1",
					title: "Ceremony",
					time: "14:00",
					description: "Main Chapel",
					order: 0,
				},
				{
					id: "block-2",
					title: "Reception",
					time: "16:00",
					description: "Garden Pavilion",
					order: 1,
				},
			],
		};

		renderWithContext(dataWithSchedule);

		expect(screen.getByText("Ceremony")).toBeDefined();
		expect(screen.getByText("Main Chapel")).toBeDefined();
		expect(screen.getByText("Reception")).toBeDefined();
		expect(screen.getByText("Garden Pavilion")).toBeDefined();
	});

	it("formats schedule block time in 12-hour format", () => {
		const dataWithSchedule: InvitationData = {
			...fullData,
			scheduleBlocks: [
				{
					id: "block-1",
					title: "Ceremony",
					time: "14:00",
					order: 0,
				},
			],
		};

		renderWithContext(dataWithSchedule);

		// 14:00 should display as 2:00 PM
		expect(screen.getByText("2:00 PM")).toBeDefined();
	});

	it("displays schedule blocks sorted by order", () => {
		const dataWithSchedule: InvitationData = {
			...fullData,
			scheduleBlocks: [
				{
					id: "block-2",
					title: "Reception",
					order: 1,
				},
				{
					id: "block-1",
					title: "Ceremony",
					order: 0,
				},
				{
					id: "block-3",
					title: "Dinner",
					order: 2,
				},
			],
		};

		renderWithContext(dataWithSchedule);

		const container = screen.getByTestId("preview-schedule-blocks");
		const blocks = container.querySelectorAll(
			"[data-testid^='preview-block-']",
		);

		// Should be in order: Ceremony, Reception, Dinner
		expect(blocks[0].getAttribute("data-testid")).toBe("preview-block-block-1");
		expect(blocks[1].getAttribute("data-testid")).toBe("preview-block-block-2");
		expect(blocks[2].getAttribute("data-testid")).toBe("preview-block-block-3");
	});

	it("displays schedule block without time", () => {
		const dataWithSchedule: InvitationData = {
			...fullData,
			scheduleBlocks: [
				{
					id: "block-1",
					title: "TBD Event",
					description: "Time to be announced",
					order: 0,
				},
			],
		};

		renderWithContext(dataWithSchedule);

		expect(screen.getByText("TBD Event")).toBeDefined();
		expect(screen.getByText("Time to be announced")).toBeDefined();
	});
});

describe("formatDate", () => {
	it("formats date correctly", () => {
		const date = new Date(2026, 5, 15); // June 15, 2026
		expect(formatDate(date)).toBe("June 15, 2026");
	});

	it("returns empty string for undefined", () => {
		expect(formatDate(undefined)).toBe("");
	});
});

describe("formatTime", () => {
	it("formats morning time correctly", () => {
		expect(formatTime("09:30")).toBe("9:30 AM");
	});

	it("formats afternoon time correctly", () => {
		expect(formatTime("14:30")).toBe("2:30 PM");
	});

	it("formats noon correctly", () => {
		expect(formatTime("12:00")).toBe("12:00 PM");
	});

	it("formats midnight correctly", () => {
		expect(formatTime("00:00")).toBe("12:00 AM");
	});

	it("returns empty string for undefined", () => {
		expect(formatTime(undefined)).toBe("");
	});
});
