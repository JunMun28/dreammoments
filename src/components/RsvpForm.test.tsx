import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { type GuestRsvpData, RsvpForm } from "./RsvpForm";

describe("RsvpForm", () => {
	const mockGuests: GuestRsvpData[] = [
		{
			id: "guest-1",
			name: "John Doe",
			email: "john@example.com",
			phone: null,
			rsvpResponse: null,
		},
		{
			id: "guest-2",
			name: "Jane Smith",
			email: null,
			phone: "555-1234",
			rsvpResponse: null,
		},
	];

	const mockGuestsWithResponses: GuestRsvpData[] = [
		{
			id: "guest-1",
			name: "John Doe",
			email: "john@example.com",
			phone: null,
			rsvpResponse: {
				id: "response-1",
				attending: true,
				mealPreference: "chicken",
				dietaryNotes: "No nuts",
				plusOneCount: 1,
				plusOneNames: "Jane Jr.",
			},
		},
		{
			id: "guest-2",
			name: "Jane Smith",
			email: null,
			phone: "555-1234",
			rsvpResponse: {
				id: "response-2",
				attending: false,
				mealPreference: null,
				dietaryNotes: null,
				plusOneCount: 0,
				plusOneNames: null,
			},
		},
	];

	it("should render guest list", () => {
		render(<RsvpForm guests={mockGuests} onSubmit={vi.fn()} />);

		expect(screen.getByText("John Doe")).toBeDefined();
		expect(screen.getByText("Jane Smith")).toBeDefined();
	});

	it("should render attendance radio buttons for each guest", () => {
		render(<RsvpForm guests={mockGuests} onSubmit={vi.fn()} />);

		// Each guest should have yes/no attendance options
		const yesButtons = screen.getAllByRole("radio", {
			name: /joyfully accept/i,
		});
		const noButtons = screen.getAllByRole("radio", {
			name: /regretfully decline/i,
		});

		expect(yesButtons.length).toBe(2);
		expect(noButtons.length).toBe(2);
	});

	it("should pre-fill values from existing responses", () => {
		render(<RsvpForm guests={mockGuestsWithResponses} onSubmit={vi.fn()} />);

		// First guest is attending
		const yesButtons = screen.getAllByRole("radio", {
			name: /joyfully accept/i,
		});
		expect((yesButtons[0] as HTMLInputElement).checked).toBe(true);

		// Second guest is not attending
		const noButtons = screen.getAllByRole("radio", {
			name: /regretfully decline/i,
		});
		expect((noButtons[1] as HTMLInputElement).checked).toBe(true);
	});

	it("should show meal preference when attending", () => {
		render(<RsvpForm guests={mockGuests} onSubmit={vi.fn()} />);

		// Initially no meal preference shown
		expect(screen.queryByLabelText(/meal preference/i)).toBeNull();

		// Select attending for first guest
		const yesButtons = screen.getAllByRole("radio", {
			name: /joyfully accept/i,
		});
		fireEvent.click(yesButtons[0]);

		// Now meal preference should be shown
		expect(screen.getByText(/meal preference/i)).toBeDefined();
	});

	it("should hide meal preference when declining", () => {
		render(<RsvpForm guests={mockGuestsWithResponses} onSubmit={vi.fn()} />);

		// Second guest already declined, no meal preference for them
		// Count meal preference labels - should only be for attending guests
		const mealLabels = screen.getAllByText(/meal preference/i);
		expect(mealLabels.length).toBe(1);
	});

	it("should show plus-one fields when attending", () => {
		render(<RsvpForm guests={mockGuests} onSubmit={vi.fn()} />);

		// Select attending for first guest
		const yesButtons = screen.getAllByRole("radio", {
			name: /joyfully accept/i,
		});
		fireEvent.click(yesButtons[0]);

		// Plus-one section should appear
		expect(screen.getByText(/bringing anyone/i)).toBeDefined();
	});

	it("should call onSubmit with all responses", async () => {
		const handleSubmit = vi.fn().mockResolvedValue(undefined);
		render(<RsvpForm guests={mockGuests} onSubmit={handleSubmit} />);

		// Fill responses for both guests
		const yesButtons = screen.getAllByRole("radio", {
			name: /joyfully accept/i,
		});
		const noButtons = screen.getAllByRole("radio", {
			name: /regretfully decline/i,
		});

		fireEvent.click(yesButtons[0]); // John attending
		fireEvent.click(noButtons[1]); // Jane declining

		// Submit
		const submitButton = screen.getByRole("button", { name: /submit rsvp/i });
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(handleSubmit).toHaveBeenCalledWith([
				expect.objectContaining({
					guestId: "guest-1",
					attending: true,
				}),
				expect.objectContaining({
					guestId: "guest-2",
					attending: false,
				}),
			]);
		});
	});

	it("should disable submit button while submitting", async () => {
		const handleSubmit = vi
			.fn()
			.mockImplementation(
				() => new Promise((resolve) => setTimeout(resolve, 100)),
			);
		render(<RsvpForm guests={mockGuests} onSubmit={handleSubmit} />);

		// Fill minimum required
		const yesButtons = screen.getAllByRole("radio", {
			name: /joyfully accept/i,
		});
		fireEvent.click(yesButtons[0]);
		fireEvent.click(yesButtons[1]);

		const submitButton = screen.getByRole("button", { name: /submit rsvp/i });
		fireEvent.click(submitButton);

		// Button should be disabled during submission
		await waitFor(() => {
			expect(submitButton.hasAttribute("disabled")).toBe(true);
		});
	});

	it("should require all guests to have a response before submit", () => {
		render(<RsvpForm guests={mockGuests} onSubmit={vi.fn()} />);

		// Submit without selecting anything
		const submitButton = screen.getByRole("button", { name: /submit rsvp/i });
		expect(submitButton.hasAttribute("disabled")).toBe(true);
	});

	it("should show error message when submit fails", async () => {
		const handleSubmit = vi.fn().mockRejectedValue(new Error("Network error"));
		render(<RsvpForm guests={mockGuests} onSubmit={handleSubmit} />);

		// Fill responses
		const yesButtons = screen.getAllByRole("radio", {
			name: /joyfully accept/i,
		});
		fireEvent.click(yesButtons[0]);
		fireEvent.click(yesButtons[1]);

		// Submit
		const submitButton = screen.getByRole("button", { name: /submit rsvp/i });
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText(/something went wrong/i)).toBeDefined();
		});
	});

	it("should display total headcount", () => {
		render(<RsvpForm guests={mockGuests} onSubmit={vi.fn()} />);

		// Select attending for first guest
		const yesButtons = screen.getAllByRole("radio", {
			name: /joyfully accept/i,
		});
		fireEvent.click(yesButtons[0]);

		// Should show headcount
		expect(screen.getByText(/1 attending/i)).toBeDefined();
	});

	it("should update headcount when plus-ones change", () => {
		render(<RsvpForm guests={mockGuests} onSubmit={vi.fn()} />);

		// Select attending for first guest
		const yesButtons = screen.getAllByRole("radio", {
			name: /joyfully accept/i,
		});
		fireEvent.click(yesButtons[0]);

		// Add a plus-one
		const plusOneInput = screen.getByLabelText(/how many additional/i);
		fireEvent.change(plusOneInput, { target: { value: "2" } });

		// Should show updated headcount (1 guest + 2 plus-ones = 3)
		expect(screen.getByText(/3 attending/i)).toBeDefined();
	});

	it("should show success message after successful submission", async () => {
		const handleSubmit = vi.fn().mockResolvedValue(undefined);
		render(<RsvpForm guests={mockGuests} onSubmit={handleSubmit} />);

		// Fill responses
		const yesButtons = screen.getAllByRole("radio", {
			name: /joyfully accept/i,
		});
		fireEvent.click(yesButtons[0]);
		fireEvent.click(yesButtons[1]);

		// Submit
		const submitButton = screen.getByRole("button", { name: /submit rsvp/i });
		fireEvent.click(submitButton);

		await waitFor(() => {
			expect(screen.getByText(/rsvp submitted/i)).toBeDefined();
		});
	});

	it("should handle empty guest list", () => {
		render(<RsvpForm guests={[]} onSubmit={vi.fn()} />);

		expect(screen.getByText(/no guests/i)).toBeDefined();
	});
});
