import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { GuestResponseRow } from "@/lib/rsvp-server";
import {
	filterResponses,
	type RsvpFilterState,
	RsvpResponseFilters,
} from "./RsvpResponseFilters";

// Mock ResizeObserver for Radix UI
global.ResizeObserver = vi.fn().mockImplementation(() => ({
	observe: vi.fn(),
	unobserve: vi.fn(),
	disconnect: vi.fn(),
}));

// Mock scrollIntoView for Radix UI Select
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.HTMLElement.prototype.hasPointerCapture = vi.fn();
window.HTMLElement.prototype.releasePointerCapture = vi.fn();

// ============================================================================
// FILTER LOGIC TESTS
// ============================================================================

describe("filterResponses", () => {
	const mockResponses: GuestResponseRow[] = [
		{
			guestId: "1",
			guestName: "Alice Smith",
			email: "alice@example.com",
			phone: null,
			groupId: "g1",
			groupName: "Family",
			status: "attending",
			mealPreference: "Chicken",
			dietaryNotes: null,
			plusOneCount: 1,
			plusOneNames: "Bob Smith",
			headcount: 2,
			respondedAt: new Date("2024-01-15"),
			updatedAt: null,
		},
		{
			guestId: "2",
			guestName: "Charlie Brown",
			email: "charlie@example.com",
			phone: null,
			groupId: "g1",
			groupName: "Family",
			status: "declined",
			mealPreference: null,
			dietaryNotes: null,
			plusOneCount: 0,
			plusOneNames: null,
			headcount: 0,
			respondedAt: new Date("2024-01-16"),
			updatedAt: null,
		},
		{
			guestId: "3",
			guestName: "Diana Prince",
			email: null,
			phone: null,
			groupId: "g2",
			groupName: "Friends",
			status: "pending",
			mealPreference: null,
			dietaryNotes: null,
			plusOneCount: 0,
			plusOneNames: null,
			headcount: 0,
			respondedAt: null,
			updatedAt: null,
		},
		{
			guestId: "4",
			guestName: "Edward Norton",
			email: null,
			phone: null,
			groupId: "g2",
			groupName: "Friends",
			status: "attending",
			mealPreference: "Vegetarian",
			dietaryNotes: "No nuts",
			plusOneCount: 0,
			plusOneNames: null,
			headcount: 1,
			respondedAt: new Date("2024-01-17"),
			updatedAt: null,
		},
	];

	it("returns all responses when no filters applied", () => {
		const filters: RsvpFilterState = {
			status: "all",
			groupId: "all",
			searchQuery: "",
		};

		const result = filterResponses(mockResponses, filters);
		expect(result).toHaveLength(4);
	});

	it("filters by status: attending", () => {
		const filters: RsvpFilterState = {
			status: "attending",
			groupId: "all",
			searchQuery: "",
		};

		const result = filterResponses(mockResponses, filters);
		expect(result).toHaveLength(2);
		expect(result.every((r) => r.status === "attending")).toBe(true);
	});

	it("filters by status: declined", () => {
		const filters: RsvpFilterState = {
			status: "declined",
			groupId: "all",
			searchQuery: "",
		};

		const result = filterResponses(mockResponses, filters);
		expect(result).toHaveLength(1);
		expect(result[0].guestName).toBe("Charlie Brown");
	});

	it("filters by status: pending", () => {
		const filters: RsvpFilterState = {
			status: "pending",
			groupId: "all",
			searchQuery: "",
		};

		const result = filterResponses(mockResponses, filters);
		expect(result).toHaveLength(1);
		expect(result[0].guestName).toBe("Diana Prince");
	});

	it("filters by group", () => {
		const filters: RsvpFilterState = {
			status: "all",
			groupId: "g1",
			searchQuery: "",
		};

		const result = filterResponses(mockResponses, filters);
		expect(result).toHaveLength(2);
		expect(result.every((r) => r.groupId === "g1")).toBe(true);
	});

	it("filters by search query (case-insensitive)", () => {
		const filters: RsvpFilterState = {
			status: "all",
			groupId: "all",
			searchQuery: "alice",
		};

		const result = filterResponses(mockResponses, filters);
		expect(result).toHaveLength(1);
		expect(result[0].guestName).toBe("Alice Smith");
	});

	it("filters by search query with partial match", () => {
		const filters: RsvpFilterState = {
			status: "all",
			groupId: "all",
			searchQuery: "brown",
		};

		const result = filterResponses(mockResponses, filters);
		expect(result).toHaveLength(1);
		expect(result[0].guestName).toBe("Charlie Brown");
	});

	it("combines status and group filters", () => {
		const filters: RsvpFilterState = {
			status: "attending",
			groupId: "g2",
			searchQuery: "",
		};

		const result = filterResponses(mockResponses, filters);
		expect(result).toHaveLength(1);
		expect(result[0].guestName).toBe("Edward Norton");
	});

	it("combines all three filters", () => {
		const filters: RsvpFilterState = {
			status: "attending",
			groupId: "g1",
			searchQuery: "alice",
		};

		const result = filterResponses(mockResponses, filters);
		expect(result).toHaveLength(1);
		expect(result[0].guestName).toBe("Alice Smith");
	});

	it("returns empty array when no matches", () => {
		const filters: RsvpFilterState = {
			status: "pending",
			groupId: "g1",
			searchQuery: "",
		};

		const result = filterResponses(mockResponses, filters);
		expect(result).toHaveLength(0);
	});

	it("handles empty responses array", () => {
		const filters: RsvpFilterState = {
			status: "all",
			groupId: "all",
			searchQuery: "",
		};

		const result = filterResponses([], filters);
		expect(result).toHaveLength(0);
	});

	it("trims and normalizes search query whitespace", () => {
		const filters: RsvpFilterState = {
			status: "all",
			groupId: "all",
			searchQuery: "  alice  ",
		};

		const result = filterResponses(mockResponses, filters);
		expect(result).toHaveLength(1);
		expect(result[0].guestName).toBe("Alice Smith");
	});
});

// ============================================================================
// COMPONENT TESTS
// ============================================================================

describe("RsvpResponseFilters", () => {
	const mockGroups = [
		{ id: "g1", name: "Family" },
		{ id: "g2", name: "Friends" },
	];

	const defaultFilters: RsvpFilterState = {
		status: "all",
		groupId: "all",
		searchQuery: "",
	};

	afterEach(() => {
		cleanup();
	});

	it("renders all filter controls", () => {
		render(
			<RsvpResponseFilters
				filters={defaultFilters}
				onFiltersChange={() => {}}
				groups={mockGroups}
			/>,
		);

		expect(screen.getByPlaceholderText("Search by name...")).toBeDefined();
		expect(screen.getByRole("combobox", { name: /status/i })).toBeDefined();
		expect(screen.getByRole("combobox", { name: /group/i })).toBeDefined();
	});

	it("displays current search value", () => {
		const filters: RsvpFilterState = {
			status: "all",
			groupId: "all",
			searchQuery: "Alice",
		};

		render(
			<RsvpResponseFilters
				filters={filters}
				onFiltersChange={() => {}}
				groups={mockGroups}
			/>,
		);

		const input = screen.getByPlaceholderText(
			"Search by name...",
		) as HTMLInputElement;
		expect(input.value).toBe("Alice");
	});

	it("calls onFiltersChange when search input changes", () => {
		const handleChange = vi.fn();

		render(
			<RsvpResponseFilters
				filters={defaultFilters}
				onFiltersChange={handleChange}
				groups={mockGroups}
			/>,
		);

		const input = screen.getByPlaceholderText("Search by name...");
		fireEvent.change(input, { target: { value: "Bob" } });

		expect(handleChange).toHaveBeenCalledWith({
			...defaultFilters,
			searchQuery: "Bob",
		});
	});

	it("renders group options including 'All Groups'", () => {
		render(
			<RsvpResponseFilters
				filters={defaultFilters}
				onFiltersChange={() => {}}
				groups={mockGroups}
			/>,
		);

		// Click to open the group dropdown
		const groupSelect = screen.getByRole("combobox", { name: /group/i });
		fireEvent.click(groupSelect);

		// Should show All Groups option and individual groups (use getAllByText since trigger and option both show text)
		const allGroupsElements = screen.getAllByText("All Groups");
		expect(allGroupsElements.length).toBeGreaterThan(0);
		expect(screen.getByText("Family")).toBeDefined();
		expect(screen.getByText("Friends")).toBeDefined();
	});

	it("renders status options including 'All Statuses'", () => {
		render(
			<RsvpResponseFilters
				filters={defaultFilters}
				onFiltersChange={() => {}}
				groups={mockGroups}
			/>,
		);

		// Click to open the status dropdown
		const statusSelect = screen.getByRole("combobox", { name: /status/i });
		fireEvent.click(statusSelect);

		// Should show all status options (use getAllByText since trigger and option both show text)
		const allStatusesElements = screen.getAllByText("All Statuses");
		expect(allStatusesElements.length).toBeGreaterThan(0);
		expect(screen.getByText("Attending")).toBeDefined();
		expect(screen.getByText("Declined")).toBeDefined();
		expect(screen.getByText("Pending")).toBeDefined();
	});

	it("handles empty groups array", () => {
		render(
			<RsvpResponseFilters
				filters={defaultFilters}
				onFiltersChange={() => {}}
				groups={[]}
			/>,
		);

		// Should still render without errors
		expect(screen.getByRole("combobox", { name: /group/i })).toBeDefined();
	});

	it("shows result count when provided", () => {
		render(
			<RsvpResponseFilters
				filters={defaultFilters}
				onFiltersChange={() => {}}
				groups={mockGroups}
				resultCount={15}
				totalCount={25}
			/>,
		);

		expect(screen.getByText("Showing 15 of 25 guests")).toBeDefined();
	});

	it("shows singular 'guest' when resultCount is 1", () => {
		render(
			<RsvpResponseFilters
				filters={defaultFilters}
				onFiltersChange={() => {}}
				groups={mockGroups}
				resultCount={1}
				totalCount={25}
			/>,
		);

		expect(screen.getByText("Showing 1 of 25 guests")).toBeDefined();
	});

	it("does not show result count when counts not provided", () => {
		render(
			<RsvpResponseFilters
				filters={defaultFilters}
				onFiltersChange={() => {}}
				groups={mockGroups}
			/>,
		);

		expect(screen.queryByText(/Showing/)).toBeNull();
	});
});
