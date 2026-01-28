// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type TextStyleDefinition, TextStylesPanel } from "./TextStylesPanel";

describe("TextStylesPanel (CE-008)", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		cleanup();
	});

	describe("rendering", () => {
		it("renders the panel with title", () => {
			render(<TextStylesPanel onAddTextStyle={() => {}} />);

			const title = screen.getByText("Text Styles");
			expect(title).toBeDefined();
		});

		it("displays at least 5 text styles", () => {
			render(<TextStylesPanel onAddTextStyle={() => {}} />);

			// Check for the 5 required styles (use exact match to avoid Subheading matching Heading)
			expect(screen.getByRole("button", { name: "Heading" })).toBeDefined();
			expect(screen.getByRole("button", { name: "Subheading" })).toBeDefined();
			expect(screen.getByRole("button", { name: "Body" })).toBeDefined();
			expect(screen.getByRole("button", { name: "Quote" })).toBeDefined();
			expect(screen.getByRole("button", { name: "Caption" })).toBeDefined();
		});

		it("shows preview text for each style", () => {
			render(<TextStylesPanel onAddTextStyle={() => {}} />);

			// Each style should have a sample preview
			const headingPreview = screen.getByTestId("style-preview-heading");
			const bodyPreview = screen.getByTestId("style-preview-body");

			expect(headingPreview).toBeDefined();
			expect(bodyPreview).toBeDefined();
		});

		it("applies visual styling to preview text", () => {
			render(<TextStylesPanel onAddTextStyle={() => {}} />);

			// Heading should be larger
			const headingPreview = screen.getByTestId("style-preview-heading");
			expect(headingPreview.className).toContain("text-2xl");

			// Caption should be smaller
			const captionPreview = screen.getByTestId("style-preview-caption");
			expect(captionPreview.className).toContain("text-xs");
		});
	});

	describe("interaction", () => {
		it("calls onAddTextStyle when clicking a style", async () => {
			const user = userEvent.setup();
			const onAddTextStyle = vi.fn();
			render(<TextStylesPanel onAddTextStyle={onAddTextStyle} />);

			// Click the Heading style button (use exact name to avoid ambiguity)
			const headingButton = screen.getByRole("button", { name: "Heading" });
			await user.click(headingButton);

			expect(onAddTextStyle).toHaveBeenCalledTimes(1);
		});

		it("passes the correct style definition when clicking Heading", async () => {
			const user = userEvent.setup();
			const onAddTextStyle = vi.fn();
			render(<TextStylesPanel onAddTextStyle={onAddTextStyle} />);

			await user.click(screen.getByRole("button", { name: "Heading" }));

			const style = onAddTextStyle.mock.calls[0][0] as TextStyleDefinition;
			expect(style.id).toBe("heading");
			expect(style.fontSize).toBeGreaterThanOrEqual(32);
			expect(style.fontWeight).toBe("bold");
		});

		it("passes the correct style definition when clicking Body", async () => {
			const user = userEvent.setup();
			const onAddTextStyle = vi.fn();
			render(<TextStylesPanel onAddTextStyle={onAddTextStyle} />);

			await user.click(screen.getByRole("button", { name: "Body" }));

			const style = onAddTextStyle.mock.calls[0][0] as TextStyleDefinition;
			expect(style.id).toBe("body");
			expect(style.fontSize).toBeGreaterThanOrEqual(14);
			expect(style.fontSize).toBeLessThanOrEqual(18);
		});

		it("passes the correct style definition when clicking Quote", async () => {
			const user = userEvent.setup();
			const onAddTextStyle = vi.fn();
			render(<TextStylesPanel onAddTextStyle={onAddTextStyle} />);

			await user.click(screen.getByRole("button", { name: "Quote" }));

			const style = onAddTextStyle.mock.calls[0][0] as TextStyleDefinition;
			expect(style.id).toBe("quote");
			expect(style.fontStyle).toBe("italic");
		});

		it("passes the correct style definition when clicking Caption", async () => {
			const user = userEvent.setup();
			const onAddTextStyle = vi.fn();
			render(<TextStylesPanel onAddTextStyle={onAddTextStyle} />);

			await user.click(screen.getByRole("button", { name: "Caption" }));

			const style = onAddTextStyle.mock.calls[0][0] as TextStyleDefinition;
			expect(style.id).toBe("caption");
			expect(style.fontSize).toBeLessThanOrEqual(12);
		});

		it("passes the correct style definition when clicking Subheading", async () => {
			const user = userEvent.setup();
			const onAddTextStyle = vi.fn();
			render(<TextStylesPanel onAddTextStyle={onAddTextStyle} />);

			await user.click(screen.getByRole("button", { name: "Subheading" }));

			const style = onAddTextStyle.mock.calls[0][0] as TextStyleDefinition;
			expect(style.id).toBe("subheading");
			expect(style.fontSize).toBeLessThan(32);
			expect(style.fontSize).toBeGreaterThan(16);
		});
	});

	describe("style definitions include all properties", () => {
		it("each style has fontFamily, fontSize, fontWeight, fill, and text", async () => {
			const user = userEvent.setup();
			const onAddTextStyle = vi.fn();
			render(<TextStylesPanel onAddTextStyle={onAddTextStyle} />);

			// Click each style and verify all required properties
			const styles = ["Heading", "Subheading", "Body", "Quote", "Caption"];

			for (const styleName of styles) {
				const button = screen.getByRole("button", { name: styleName });
				await user.click(button);

				const style = onAddTextStyle.mock.calls.at(
					-1,
				)?.[0] as TextStyleDefinition;
				expect(style).toHaveProperty("id");
				expect(style).toHaveProperty("fontFamily");
				expect(style).toHaveProperty("fontSize");
				expect(style).toHaveProperty("fontWeight");
				expect(style).toHaveProperty("fill");
				expect(style).toHaveProperty("text");
			}
		});
	});

	describe("accessibility", () => {
		it("all styles are accessible as buttons", () => {
			render(<TextStylesPanel onAddTextStyle={() => {}} />);

			const headingButton = screen.getByRole("button", { name: "Heading" });

			// Button should be enabled and focusable
			expect(headingButton).not.toBeNull();
			expect(headingButton.getAttribute("disabled")).toBeNull();
		});
	});
});
