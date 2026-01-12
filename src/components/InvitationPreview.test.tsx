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
