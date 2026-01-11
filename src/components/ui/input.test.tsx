// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Input } from "./input";

describe("Input component", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders correctly", () => {
		render(<Input type="text" placeholder="Enter text" />);
		const input = screen.getByPlaceholderText("Enter text");
		expect(input).toBeDefined();
		expect(input.getAttribute("type")).toBe("text");
		expect(input.className).toContain("border-input");
	});

	it("applies custom className", () => {
		render(<Input className="custom-class" />);
		const input = screen.getByRole("textbox");
		expect(input.className).toContain("custom-class");
	});

	it("forwards props", () => {
		render(<Input disabled />);
		const input = screen.getByRole("textbox");
		expect(input.hasAttribute("disabled")).toBe(true);
	});
});
