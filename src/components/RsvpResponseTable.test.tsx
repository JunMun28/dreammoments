import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { GuestResponseRow } from "@/lib/rsvp-server";
import {
	formatResponseDate,
	getStatusBadgeVariant,
	RsvpResponseTable,
} from "./RsvpResponseTable";

// ============================================================================
// HELPER TESTS
// ============================================================================

describe("formatResponseDate", () => {
	it("should return dash for null date", () => {
		expect(formatResponseDate(null)).toBe("—");
	});

	it("should format date correctly", () => {
		const date = new Date("2026-01-10T14:30:00Z");
		const result = formatResponseDate(date);
		// Should contain date parts (format may vary by locale)
		expect(result).toContain("2026");
		expect(result).not.toBe("—");
	});
});

describe("getStatusBadgeVariant", () => {
	it("should return success variant for attending", () => {
		expect(getStatusBadgeVariant("attending")).toBe("success");
	});

	it("should return destructive variant for declined", () => {
		expect(getStatusBadgeVariant("declined")).toBe("destructive");
	});

	it("should return secondary variant for pending", () => {
		expect(getStatusBadgeVariant("pending")).toBe("secondary");
	});
});

// ============================================================================
// COMPONENT TESTS
// ============================================================================

describe("RsvpResponseTable", () => {
	const mockResponses: GuestResponseRow[] = [
		{
			guestId: "guest-1",
			guestName: "John Doe",
			email: "john@example.com",
			phone: "555-1234",
			groupId: "group-1",
			groupName: "Family",
			status: "attending",
			mealPreference: "Chicken",
			dietaryNotes: "No nuts",
			plusOneCount: 1,
			plusOneNames: "Jane Doe",
			headcount: 2,
			respondedAt: new Date("2026-01-10T14:30:00Z"),
			updatedAt: new Date("2026-01-10T14:30:00Z"),
		},
		{
			guestId: "guest-2",
			guestName: "Alice Smith",
			email: null,
			phone: null,
			groupId: "group-2",
			groupName: "Friends",
			status: "declined",
			mealPreference: null,
			dietaryNotes: null,
			plusOneCount: 0,
			plusOneNames: null,
			headcount: 0,
			respondedAt: new Date("2026-01-11T10:00:00Z"),
			updatedAt: new Date("2026-01-11T10:00:00Z"),
		},
		{
			guestId: "guest-3",
			guestName: "Bob Wilson",
			email: "bob@example.com",
			phone: null,
			groupId: "group-1",
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

	it("should render loading state", () => {
		render(<RsvpResponseTable responses={[]} isLoading />);
		expect(screen.getByText("Loading responses...")).toBeDefined();
	});

	it("should render empty state when no responses", () => {
		render(<RsvpResponseTable responses={[]} />);
		expect(screen.getByText(/No guests to display/)).toBeDefined();
	});

	it("should render table headers", () => {
		render(<RsvpResponseTable responses={mockResponses} />);

		expect(screen.getByText("Guest")).toBeDefined();
		expect(screen.getByText("Group")).toBeDefined();
		expect(screen.getByText("Status")).toBeDefined();
		expect(screen.getByText("Headcount")).toBeDefined();
		expect(screen.getByText("Meal")).toBeDefined();
		expect(screen.getByText("Responded")).toBeDefined();
	});

	it("should render guest names", () => {
		render(<RsvpResponseTable responses={mockResponses} />);

		expect(screen.getByText("John Doe")).toBeDefined();
		expect(screen.getByText("Alice Smith")).toBeDefined();
		expect(screen.getByText("Bob Wilson")).toBeDefined();
	});

	it("should render group names", () => {
		render(<RsvpResponseTable responses={mockResponses} />);

		// Family appears twice (John and Bob)
		const familyBadges = screen.getAllByText("Family");
		expect(familyBadges).toHaveLength(2);
		expect(screen.getByText("Friends")).toBeDefined();
	});

	it("should render status badges with correct text", () => {
		render(<RsvpResponseTable responses={mockResponses} />);

		expect(screen.getByText("Attending")).toBeDefined();
		expect(screen.getByText("Declined")).toBeDefined();
		expect(screen.getByText("Pending")).toBeDefined();
	});

	it("should render headcount for attending guests", () => {
		render(<RsvpResponseTable responses={mockResponses} />);

		// John Doe has headcount of 2
		expect(screen.getByText("2")).toBeDefined();
	});

	it("should show plus-one names when hovering/tooltip", () => {
		render(<RsvpResponseTable responses={mockResponses} />);

		// Plus-one info should be displayed somewhere
		expect(screen.getByText(/\+1 guest/)).toBeDefined();
	});

	it("should render meal preference", () => {
		render(<RsvpResponseTable responses={mockResponses} />);

		expect(screen.getByText("Chicken")).toBeDefined();
	});

	it("should show dash for null meal preference", () => {
		render(<RsvpResponseTable responses={mockResponses} />);

		// Multiple dashes for declined/pending guests with no meal
		const dashes = screen.getAllByText("—");
		expect(dashes.length).toBeGreaterThan(0);
	});

	it("should render response date", () => {
		render(<RsvpResponseTable responses={mockResponses} />);

		// Should contain formatted dates for guests who responded
		// Exact format depends on locale, but should have some date content
		const cells = screen.getAllByRole("cell");
		const hasDateContent = cells.some(
			(cell) => cell.textContent?.includes("2026") || false,
		);
		expect(hasDateContent).toBe(true);
	});

	it("should render dietary notes when present", () => {
		render(<RsvpResponseTable responses={mockResponses} />);

		expect(screen.getByText("No nuts")).toBeDefined();
	});
});
