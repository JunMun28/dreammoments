// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { ScheduleBlock } from "@/contexts/InvitationBuilderContext";
import {
	InvitationBuilderProvider,
	type InvitationData,
} from "@/contexts/InvitationBuilderContext";
import {
	formatDate,
	formatTime,
	InvitationPreview,
	sortBlocksByOrder,
} from "./InvitationPreview";

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

	it("shows schedule placeholder when no blocks exist", () => {
		renderWithContext(emptyData);

		expect(screen.getByText("Schedule")).toBeDefined();
		expect(screen.getByText("Schedule events will appear here")).toBeDefined();
	});

	it("displays schedule blocks when provided", () => {
		const dataWithBlocks: InvitationData = {
			...fullData,
			scheduleBlocks: [
				{ id: "1", title: "Ceremony", time: "14:00", order: 0 },
				{
					id: "2",
					title: "Reception",
					time: "16:00",
					description: "Grand Hall",
					order: 1,
				},
			],
		};
		renderWithContext(dataWithBlocks);

		expect(screen.getByText("Schedule")).toBeDefined();
		expect(screen.getByText("Ceremony")).toBeDefined();
		expect(screen.getByText("2:00 PM")).toBeDefined();
		expect(screen.getByText("Reception")).toBeDefined();
		expect(screen.getByText("4:00 PM")).toBeDefined();
		expect(screen.getByText("Grand Hall")).toBeDefined();
	});

	it("displays blocks sorted by order", () => {
		const dataWithBlocks: InvitationData = {
			...fullData,
			scheduleBlocks: [
				{ id: "2", title: "Reception", time: "16:00", order: 2 },
				{ id: "1", title: "Ceremony", time: "14:00", order: 0 },
				{ id: "3", title: "Dinner", time: "18:00", order: 1 },
			],
		};
		renderWithContext(dataWithBlocks);

		// Get all block titles and check order
		const blockTitles = screen.getAllByText(/Ceremony|Reception|Dinner/);
		expect(blockTitles[0].textContent).toBe("Ceremony");
		expect(blockTitles[1].textContent).toBe("Dinner");
		expect(blockTitles[2].textContent).toBe("Reception");
	});

	it("displays dash when block has no time", () => {
		const dataWithBlocks: InvitationData = {
			...fullData,
			scheduleBlocks: [{ id: "1", title: "Photos", order: 0 }],
		};
		renderWithContext(dataWithBlocks);

		expect(screen.getByText("Photos")).toBeDefined();
		expect(screen.getByText("—")).toBeDefined();
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

describe("sortBlocksByOrder", () => {
	it("sorts blocks by order field ascending", () => {
		const blocks: ScheduleBlock[] = [
			{ id: "3", title: "Third", order: 2 },
			{ id: "1", title: "First", order: 0 },
			{ id: "2", title: "Second", order: 1 },
		];
		const sorted = sortBlocksByOrder(blocks);
		expect(sorted[0].title).toBe("First");
		expect(sorted[1].title).toBe("Second");
		expect(sorted[2].title).toBe("Third");
	});

	it("returns empty array for empty input", () => {
		expect(sortBlocksByOrder([])).toEqual([]);
	});

	it("does not mutate original array", () => {
		const blocks: ScheduleBlock[] = [
			{ id: "2", title: "Second", order: 1 },
			{ id: "1", title: "First", order: 0 },
		];
		const original = [...blocks];
		sortBlocksByOrder(blocks);
		expect(blocks[0].id).toBe(original[0].id);
		expect(blocks[1].id).toBe(original[1].id);
	});
});
