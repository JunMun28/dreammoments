// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ViewportToggle } from "./viewport-toggle";

describe("ViewportToggle", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders mobile and desktop buttons", () => {
		render(<ViewportToggle value="desktop" onChange={() => {}} />);

		expect(screen.getByRole("button", { name: /mobile/i })).toBeDefined();
		expect(screen.getByRole("button", { name: /desktop/i })).toBeDefined();
	});

	it("highlights desktop button when value is desktop", () => {
		render(<ViewportToggle value="desktop" onChange={() => {}} />);

		const desktopButton = screen.getByRole("button", { name: /desktop/i });
		const mobileButton = screen.getByRole("button", { name: /mobile/i });

		// Desktop should have active styling (bg-background)
		expect(desktopButton.className).toContain("bg-background");
		expect(mobileButton.className).not.toContain("bg-background");
	});

	it("highlights mobile button when value is mobile", () => {
		render(<ViewportToggle value="mobile" onChange={() => {}} />);

		const desktopButton = screen.getByRole("button", { name: /desktop/i });
		const mobileButton = screen.getByRole("button", { name: /mobile/i });

		// Mobile should have active styling (bg-background)
		expect(mobileButton.className).toContain("bg-background");
		expect(desktopButton.className).not.toContain("bg-background");
	});

	it("calls onChange with mobile when mobile button clicked", async () => {
		const user = userEvent.setup();
		const handleChange = vi.fn();
		render(<ViewportToggle value="desktop" onChange={handleChange} />);

		await user.click(screen.getByRole("button", { name: /mobile/i }));

		expect(handleChange).toHaveBeenCalledWith("mobile");
	});

	it("calls onChange with desktop when desktop button clicked", async () => {
		const user = userEvent.setup();
		const handleChange = vi.fn();
		render(<ViewportToggle value="mobile" onChange={handleChange} />);

		await user.click(screen.getByRole("button", { name: /desktop/i }));

		expect(handleChange).toHaveBeenCalledWith("desktop");
	});

	it("does not call onChange when clicking already selected button", async () => {
		const user = userEvent.setup();
		const handleChange = vi.fn();
		render(<ViewportToggle value="desktop" onChange={handleChange} />);

		await user.click(screen.getByRole("button", { name: /desktop/i }));

		expect(handleChange).not.toHaveBeenCalled();
	});
});
