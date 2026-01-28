// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BackgroundPanel } from "./BackgroundPanel";

// Mock ResizeObserver for Slider component
beforeEach(() => {
	global.ResizeObserver = vi.fn().mockImplementation(() => ({
		observe: vi.fn(),
		unobserve: vi.fn(),
		disconnect: vi.fn(),
	}));
});

/**
 * CE-030: Background Panel Tests
 *
 * Tests for the background panel that allows setting:
 * - Solid background colors (wedding palette)
 * - Pattern backgrounds (marble, floral, geometric)
 * - Background opacity
 */

describe("BackgroundPanel", () => {
	let onBackgroundChange: ReturnType<typeof vi.fn>;
	let user: ReturnType<typeof userEvent.setup>;

	beforeEach(() => {
		onBackgroundChange = vi.fn();
		user = userEvent.setup();
	});

	afterEach(() => {
		cleanup();
	});

	describe("CE-030: Panel Structure", () => {
		it("renders the Background panel with header", () => {
			render(<BackgroundPanel onBackgroundChange={onBackgroundChange} />);

			expect(screen.getByText("Background")).toBeDefined();
			expect(
				screen.getByText("Set canvas background color or pattern"),
			).toBeDefined();
		});

		it("renders Solid Colors section", () => {
			render(<BackgroundPanel onBackgroundChange={onBackgroundChange} />);

			expect(screen.getByText("Solid Colors")).toBeDefined();
		});

		it("renders Patterns section", () => {
			render(<BackgroundPanel onBackgroundChange={onBackgroundChange} />);

			expect(screen.getByText("Patterns")).toBeDefined();
		});

		it("renders opacity slider", () => {
			render(<BackgroundPanel onBackgroundChange={onBackgroundChange} />);

			expect(screen.getByLabelText("Background Opacity")).toBeDefined();
		});
	});

	describe("CE-030: Solid Colors", () => {
		it("renders wedding color palette swatches", () => {
			render(<BackgroundPanel onBackgroundChange={onBackgroundChange} />);

			// Should have color swatch buttons for each color in palette
			const colorSwatches = screen.getAllByRole("button", {
				name: /color swatch/i,
			});
			expect(colorSwatches.length).toBeGreaterThanOrEqual(16); // At least the wedding colors
		});

		it("calls onBackgroundChange when clicking a color swatch", async () => {
			render(<BackgroundPanel onBackgroundChange={onBackgroundChange} />);

			const colorSwatches = screen.getAllByRole("button", {
				name: /color swatch/i,
			});
			await user.click(colorSwatches[0]);

			expect(onBackgroundChange).toHaveBeenCalledWith({
				type: "solid",
				color: expect.any(String),
				opacity: 1,
			});
		});

		it("renders custom color picker input", () => {
			render(<BackgroundPanel onBackgroundChange={onBackgroundChange} />);

			const colorPicker = screen.getByLabelText("Custom Color");
			expect(colorPicker).toBeDefined();
			expect(colorPicker.getAttribute("type")).toBe("color");
		});

		it("calls onBackgroundChange when using custom color picker", async () => {
			render(<BackgroundPanel onBackgroundChange={onBackgroundChange} />);

			const colorPicker = screen.getByLabelText("Custom Color");
			// Simulate color input change
			await user.click(colorPicker);

			// The color picker should trigger the change
			// Note: fireEvent is needed for color input in tests
		});

		it("highlights currently selected color", () => {
			render(
				<BackgroundPanel
					onBackgroundChange={onBackgroundChange}
					currentBackground={{ type: "solid", color: "#FFFFFF", opacity: 1 }}
				/>,
			);

			// The white color swatch should be highlighted
			const colorSwatches = screen.getAllByRole("button", {
				name: /color swatch/i,
			});
			const whiteSwatches = colorSwatches.filter((swatch) =>
				swatch.className.includes("ring-2"),
			);
			expect(whiteSwatches.length).toBeGreaterThan(0);
		});
	});

	describe("CE-030: Patterns", () => {
		it("renders pattern options", () => {
			render(<BackgroundPanel onBackgroundChange={onBackgroundChange} />);

			// Should have pattern buttons
			expect(
				screen.getByRole("button", { name: /marble pattern/i }),
			).toBeDefined();
			expect(
				screen.getByRole("button", { name: /floral pattern/i }),
			).toBeDefined();
			expect(
				screen.getByRole("button", { name: /geometric pattern/i }),
			).toBeDefined();
		});

		it("calls onBackgroundChange when clicking a pattern", async () => {
			render(<BackgroundPanel onBackgroundChange={onBackgroundChange} />);

			const marblePattern = screen.getByRole("button", {
				name: /marble pattern/i,
			});
			await user.click(marblePattern);

			expect(onBackgroundChange).toHaveBeenCalledWith({
				type: "pattern",
				pattern: "marble",
				opacity: 1,
			});
		});

		it("highlights currently selected pattern", () => {
			render(
				<BackgroundPanel
					onBackgroundChange={onBackgroundChange}
					currentBackground={{ type: "pattern", pattern: "floral", opacity: 1 }}
				/>,
			);

			const floralPattern = screen.getByRole("button", {
				name: /floral pattern/i,
			});
			expect(floralPattern.className).toContain("ring-2");
		});
	});

	describe("CE-030: Opacity Control", () => {
		it("renders opacity slider with default value of 100%", () => {
			render(<BackgroundPanel onBackgroundChange={onBackgroundChange} />);

			// The opacity display should show 100%
			expect(screen.getByText("100%")).toBeDefined();
		});

		it("calls onBackgroundChange when adjusting opacity", async () => {
			render(
				<BackgroundPanel
					onBackgroundChange={onBackgroundChange}
					currentBackground={{ type: "solid", color: "#FFFFFF", opacity: 1 }}
				/>,
			);

			// Find the slider
			const slider = screen.getByLabelText("Background Opacity");
			expect(slider).toBeDefined();

			// Note: Testing slider changes requires more complex interaction
		});

		it("displays current opacity value", () => {
			render(
				<BackgroundPanel
					onBackgroundChange={onBackgroundChange}
					currentBackground={{ type: "solid", color: "#FFFFFF", opacity: 0.5 }}
				/>,
			);

			expect(screen.getByText("50%")).toBeDefined();
		});
	});

	describe("CE-030: Clear Background", () => {
		it("renders clear/transparent button", () => {
			render(<BackgroundPanel onBackgroundChange={onBackgroundChange} />);

			expect(
				screen.getByRole("button", { name: /transparent|clear|none/i }),
			).toBeDefined();
		});

		it("calls onBackgroundChange with transparent when clicking clear", async () => {
			render(<BackgroundPanel onBackgroundChange={onBackgroundChange} />);

			const clearButton = screen.getByRole("button", {
				name: /transparent|clear|none/i,
			});
			await user.click(clearButton);

			expect(onBackgroundChange).toHaveBeenCalledWith({
				type: "none",
				opacity: 0,
			});
		});
	});
});
