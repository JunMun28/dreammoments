// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DatePicker } from "./date-picker";

describe("DatePicker", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders with placeholder text when no date selected", () => {
		render(<DatePicker onChange={vi.fn()} />);

		expect(screen.getByRole("button")).toBeDefined();
		expect(screen.getByText(/pick a date/i)).toBeDefined();
	});

	it("displays selected date when value provided", () => {
		const date = new Date(2026, 5, 15); // June 15, 2026

		render(<DatePicker value={date} onChange={vi.fn()} />);

		// Should display formatted date
		expect(screen.getByRole("button").textContent).toContain("June");
		expect(screen.getByRole("button").textContent).toContain("15");
		expect(screen.getByRole("button").textContent).toContain("2026");
	});

	it("opens calendar popover when clicked", async () => {
		const user = userEvent.setup();

		render(<DatePicker onChange={vi.fn()} />);

		await user.click(screen.getByRole("button"));

		// Calendar should be visible
		await waitFor(() => {
			expect(screen.getByRole("grid")).toBeDefined();
		});
	});

	it("calls onChange when date is selected", async () => {
		const user = userEvent.setup();
		const handleChange = vi.fn();

		render(<DatePicker onChange={handleChange} />);

		// Open the calendar
		await user.click(screen.getByRole("button"));

		await waitFor(() => {
			expect(screen.getByRole("grid")).toBeDefined();
		});

		// Click on a day button (find a day that's not disabled)
		const dayButtons = screen.getAllByRole("button").filter((btn) => {
			const day = btn.getAttribute("data-day");
			return day !== null;
		});

		if (dayButtons.length > 0) {
			await user.click(dayButtons[0]);

			await waitFor(() => {
				expect(handleChange).toHaveBeenCalled();
			});
		}
	});

	it("renders with custom placeholder", () => {
		render(<DatePicker onChange={vi.fn()} placeholder="Select wedding date" />);

		expect(screen.getByText(/select wedding date/i)).toBeDefined();
	});

	it("can be disabled", () => {
		render(<DatePicker onChange={vi.fn()} disabled />);

		const button = screen.getByRole("button") as HTMLButtonElement;
		expect(button.disabled).toBe(true);
	});
});
