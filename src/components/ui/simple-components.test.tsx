// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Label } from "./label";
import { Switch } from "./switch";
import { Textarea } from "./textarea";

describe("UI Components", () => {
	afterEach(() => {
		cleanup();
	});

	it("Label renders correctly", () => {
		render(<Label>Test Label</Label>);
		expect(screen.getByText("Test Label")).toBeDefined();
	});

	it("Textarea renders correctly", () => {
		render(<Textarea placeholder="Enter text" />);
		const textarea = screen.getByPlaceholderText("Enter text");
		expect(textarea).toBeDefined();
		expect(textarea.tagName).toBe("TEXTAREA");
	});

	it("Switch renders correctly", () => {
		render(<Switch aria-label="Toggle feature" />);
		const switchEl = screen.getByRole("switch", { name: "Toggle feature" });
		expect(switchEl).toBeDefined();
	});
});
