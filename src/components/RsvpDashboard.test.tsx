import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
	calculatePercentage,
	RsvpDashboard,
	type RsvpSummaryData,
} from "./RsvpDashboard";

describe("RsvpDashboard", () => {
	describe("calculatePercentage helper", () => {
		it("should return 0 when total is 0", () => {
			expect(calculatePercentage(5, 0)).toBe(0);
		});

		it("should calculate correct percentage", () => {
			expect(calculatePercentage(25, 100)).toBe(25);
			expect(calculatePercentage(1, 4)).toBe(25);
			expect(calculatePercentage(3, 4)).toBe(75);
		});

		it("should round to whole numbers", () => {
			expect(calculatePercentage(1, 3)).toBe(33);
			expect(calculatePercentage(2, 3)).toBe(67);
		});
	});

	describe("RsvpDashboard component", () => {
		const emptySummary: RsvpSummaryData = {
			totalInvited: 0,
			totalAttending: 0,
			totalDeclined: 0,
			totalPending: 0,
			groups: [],
		};

		it("should render empty state when no guests", () => {
			render(<RsvpDashboard summary={emptySummary} />);

			expect(screen.getByText("RSVP Overview")).toBeDefined();
			expect(screen.getByText(/0 guests invited/i)).toBeDefined();
		});

		it("should render total invited count", () => {
			const summary: RsvpSummaryData = {
				totalInvited: 50,
				totalAttending: 30,
				totalDeclined: 10,
				totalPending: 10,
				groups: [],
			};

			render(<RsvpDashboard summary={summary} />);

			expect(screen.getByText("50")).toBeDefined();
			expect(screen.getByText("Invited")).toBeDefined();
		});

		it("should render confirmed attending count", () => {
			const summary: RsvpSummaryData = {
				totalInvited: 50,
				totalAttending: 30,
				totalDeclined: 10,
				totalPending: 10,
				groups: [],
			};

			render(<RsvpDashboard summary={summary} />);

			expect(screen.getByText("30")).toBeDefined();
			expect(screen.getByText("Attending")).toBeDefined();
		});

		it("should render declined count", () => {
			const summary: RsvpSummaryData = {
				totalInvited: 50,
				totalAttending: 30,
				totalDeclined: 15,
				totalPending: 5,
				groups: [],
			};

			render(<RsvpDashboard summary={summary} />);

			expect(screen.getByText("15")).toBeDefined();
			expect(screen.getByText("Declined")).toBeDefined();
		});

		it("should render pending count", () => {
			const summary: RsvpSummaryData = {
				totalInvited: 50,
				totalAttending: 30,
				totalDeclined: 10,
				totalPending: 10,
				groups: [],
			};

			render(<RsvpDashboard summary={summary} />);

			// Use getAllByText since "10" appears twice (declined and pending)
			const tens = screen.getAllByText("10");
			expect(tens.length).toBeGreaterThanOrEqual(1);
			expect(screen.getByText("Pending")).toBeDefined();
		});

		it("should render percentage bars", () => {
			const summary: RsvpSummaryData = {
				totalInvited: 100,
				totalAttending: 50,
				totalDeclined: 30,
				totalPending: 20,
				groups: [],
			};

			render(<RsvpDashboard summary={summary} />);

			// Check for percentage display (attending=50%, declined=30%, pending=20%)
			expect(screen.getByText("50%")).toBeDefined();
			expect(screen.getByText("30%")).toBeDefined();
			expect(screen.getByText("20%")).toBeDefined();
		});

		it("should display group breakdown when groups exist", () => {
			const summary: RsvpSummaryData = {
				totalInvited: 10,
				totalAttending: 5,
				totalDeclined: 2,
				totalPending: 3,
				groups: [
					{
						id: "group-1",
						name: "Family",
						rsvpToken: "token1",
						guestCount: 6,
						totalAttending: 4,
						totalDeclined: 1,
						totalPending: 1,
					},
					{
						id: "group-2",
						name: "Friends",
						rsvpToken: "token2",
						guestCount: 4,
						totalAttending: 1,
						totalDeclined: 1,
						totalPending: 2,
					},
				],
			};

			render(<RsvpDashboard summary={summary} />);

			expect(screen.getByText("Family")).toBeDefined();
			expect(screen.getByText("Friends")).toBeDefined();
			expect(screen.getByText("6 guests")).toBeDefined();
			expect(screen.getByText("4 guests")).toBeDefined();
		});

		it("should show loading state when isLoading is true", () => {
			render(<RsvpDashboard summary={emptySummary} isLoading />);

			expect(screen.getByText("Loading RSVP data...")).toBeDefined();
		});
	});
});
