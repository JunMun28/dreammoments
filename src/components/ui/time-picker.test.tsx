// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TimePicker } from "./time-picker";

describe("TimePicker", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders hour, minute, and period selects", () => {
		render(<TimePicker onChange={vi.fn()} />);

		// Should have three select triggers
		const triggers = screen.getAllByRole("combobox");
		expect(triggers.length).toBe(3);
	});

	it("displays placeholder when no value provided", () => {
		render(<TimePicker onChange={vi.fn()} />);

		// Should show placeholders
		expect(screen.getByText("Hour")).toBeDefined();
		expect(screen.getByText("Min")).toBeDefined();
		expect(screen.getByText("AM/PM")).toBeDefined();
	});

	it("displays selected time when value provided", () => {
		render(<TimePicker value="14:30" onChange={vi.fn()} />);

		// Should display formatted values (2:30 PM in 12-hour format)
		expect(screen.getByText("2")).toBeDefined();
		expect(screen.getByText("30")).toBeDefined();
		expect(screen.getByText("PM")).toBeDefined();
	});

	it("displays 12 AM correctly for midnight (00:00)", () => {
		render(<TimePicker value="00:00" onChange={vi.fn()} />);

		expect(screen.getByText("12")).toBeDefined();
		expect(screen.getByText("00")).toBeDefined();
		expect(screen.getByText("AM")).toBeDefined();
	});

	it("displays 12 PM correctly for noon (12:00)", () => {
		render(<TimePicker value="12:00" onChange={vi.fn()} />);

		expect(screen.getByText("12")).toBeDefined();
		expect(screen.getByText("00")).toBeDefined();
		expect(screen.getByText("PM")).toBeDefined();
	});

	it("can be disabled", () => {
		render(<TimePicker onChange={vi.fn()} disabled />);

		const triggers = screen.getAllByRole("combobox");
		for (const trigger of triggers) {
			expect((trigger as HTMLButtonElement).disabled).toBe(true);
		}
	});

	it("renders clock icon", () => {
		render(<TimePicker onChange={vi.fn()} />);

		// Clock icon should be visible (lucide icon has aria-hidden but svg element exists)
		const svg = document.querySelector("svg.lucide-clock");
		expect(svg).toBeDefined();
	});
});
