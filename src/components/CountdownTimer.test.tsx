// @vitest-environment jsdom

import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CountdownTimer } from "./CountdownTimer";

describe("CountdownTimer", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		// Set fixed "now" date for consistent testing
		vi.setSystemTime(new Date("2025-06-01T10:00:00"));
	});

	afterEach(() => {
		vi.useRealTimers();
		cleanup();
	});

	it("renders countdown when wedding date is in the future", () => {
		render(<CountdownTimer weddingDate="2025-07-15" />);

		// Should display days, hours, minutes, seconds labels
		expect(screen.getByText("Days")).toBeDefined();
		expect(screen.getByText("Hours")).toBeDefined();
		expect(screen.getByText("Minutes")).toBeDefined();
		expect(screen.getByText("Seconds")).toBeDefined();

		// Check that numbers are displayed (days should be around 44)
		expect(screen.getByText("44")).toBeDefined(); // days
	});

	it("shows 'The day has arrived!' when countdown reaches zero", () => {
		// Set wedding date to today
		render(<CountdownTimer weddingDate="2025-06-01" />);

		expect(screen.getByText(/the day has arrived/i)).toBeDefined();
	});

	it("shows past message when wedding date has passed", () => {
		render(<CountdownTimer weddingDate="2025-05-01" />);

		expect(screen.getByText(/celebrated/i)).toBeDefined();
	});

	it("updates countdown every second", () => {
		render(<CountdownTimer weddingDate="2025-07-15" />);

		// Initial state - get the seconds element
		const secondsLabel = screen.getByText("Seconds");
		const secondsContainer = secondsLabel.parentElement;
		const initialSeconds =
			secondsContainer?.querySelector("div:first-child")?.textContent;

		// Advance time by 1 second
		act(() => {
			vi.advanceTimersByTime(1000);
		});

		// Seconds should have changed
		const newSeconds =
			secondsContainer?.querySelector("div:first-child")?.textContent;
		expect(newSeconds).not.toBe(initialSeconds);
	});

	it("renders with custom accent color", () => {
		render(<CountdownTimer weddingDate="2025-07-15" accentColor="#e11d48" />);

		// Check that the component renders
		expect(screen.getByText("Days")).toBeDefined();
	});

	it("renders message when no wedding date is set", () => {
		render(<CountdownTimer />);

		expect(screen.getByText(/set your wedding date/i)).toBeDefined();
	});

	it("handles invalid date gracefully", () => {
		render(<CountdownTimer weddingDate="invalid-date" />);

		// Should display fallback message
		expect(screen.getByText(/set your wedding date/i)).toBeDefined();
	});
});
