import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RsvpDeadlineSection } from "./RsvpDeadlineSection";

describe("RsvpDeadlineSection", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders without a deadline set", () => {
		render(<RsvpDeadlineSection value={undefined} onChange={vi.fn()} />);
		expect(screen.getByText("RSVP Deadline")).toBeDefined();
		expect(
			screen.getByText("Set a deadline for guests to submit their RSVP"),
		).toBeDefined();
	});

	it("renders with a deadline set", () => {
		const deadline = new Date("2026-06-15T23:59:00");
		render(<RsvpDeadlineSection value={deadline} onChange={vi.fn()} />);

		// Should show the formatted date
		expect(screen.getByText("RSVP Deadline")).toBeDefined();
	});

	it("calls onChange when date is cleared", () => {
		const onChange = vi.fn();
		const deadline = new Date("2026-06-15T23:59:00");
		render(<RsvpDeadlineSection value={deadline} onChange={onChange} />);

		// Click the clear button
		const clearButton = screen.getByRole("button", { name: /clear deadline/i });
		fireEvent.click(clearButton);

		expect(onChange).toHaveBeenCalledWith(undefined);
	});

	it("shows helper text when deadline is set", () => {
		const deadline = new Date("2026-06-15T23:59:00");
		render(<RsvpDeadlineSection value={deadline} onChange={vi.fn()} />);

		expect(screen.getByText(/guests must respond by this date/i)).toBeDefined();
	});
});
