import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
	ColorPicker,
	isValidHexColor,
	normalizeHexColor,
	PRESET_COLORS,
} from "./color-picker";

describe("isValidHexColor", () => {
	it("returns true for valid 6-digit hex", () => {
		expect(isValidHexColor("#b76e79")).toBe(true);
		expect(isValidHexColor("#FFFFFF")).toBe(true);
		expect(isValidHexColor("#000000")).toBe(true);
	});

	it("returns true for valid 3-digit hex", () => {
		expect(isValidHexColor("#fff")).toBe(true);
		expect(isValidHexColor("#ABC")).toBe(true);
	});

	it("returns false for invalid hex colors", () => {
		expect(isValidHexColor("b76e79")).toBe(false); // missing #
		expect(isValidHexColor("#xyz")).toBe(false); // invalid chars
		expect(isValidHexColor("#12345")).toBe(false); // wrong length
		expect(isValidHexColor("")).toBe(false);
	});
});

describe("normalizeHexColor", () => {
	it("adds # prefix if missing", () => {
		expect(normalizeHexColor("b76e79")).toBe("#b76e79");
	});

	it("expands 3-digit to 6-digit", () => {
		expect(normalizeHexColor("#fff")).toBe("#ffffff");
		expect(normalizeHexColor("#abc")).toBe("#aabbcc");
	});

	it("lowercases hex values", () => {
		expect(normalizeHexColor("#FFFFFF")).toBe("#ffffff");
		expect(normalizeHexColor("#B76E79")).toBe("#b76e79");
	});
});

describe("PRESET_COLORS", () => {
	it("has expected number of presets", () => {
		expect(PRESET_COLORS.length).toBe(8);
	});

	it("all presets have valid hex values", () => {
		for (const preset of PRESET_COLORS) {
			expect(isValidHexColor(preset.value)).toBe(true);
		}
	});
});

describe("ColorPicker", () => {
	it("renders with label", () => {
		render(<ColorPicker />);
		expect(screen.getByText("Accent Color")).toBeDefined();
	});

	it("renders custom label", () => {
		render(<ColorPicker label="Theme Color" />);
		expect(screen.getByText("Theme Color")).toBeDefined();
	});

	it("renders all preset swatches", () => {
		render(<ColorPicker />);
		for (const preset of PRESET_COLORS) {
			expect(screen.getByRole("button", { name: preset.name })).toBeDefined();
		}
	});

	it("shows selected swatch with pressed state", () => {
		render(<ColorPicker value="#b76e79" />);
		const roseGoldButton = screen.getByRole("button", { name: "Rose Gold" });
		expect(roseGoldButton.getAttribute("aria-pressed")).toBe("true");
	});

	it("calls onChange when swatch clicked", () => {
		const onChange = vi.fn();
		render(<ColorPicker onChange={onChange} />);

		fireEvent.click(screen.getByRole("button", { name: "Sage" }));
		expect(onChange).toHaveBeenCalledWith("#9caf88");
	});

	it("renders hex input field", () => {
		render(<ColorPicker />);
		expect(screen.getByPlaceholderText("#b76e79")).toBeDefined();
	});

	it("shows initial value in hex input", () => {
		render(<ColorPicker value="#d4af37" />);
		const input = screen.getByPlaceholderText("#b76e79") as HTMLInputElement;
		expect(input.value).toBe("#d4af37");
	});

	it("calls onChange with valid hex input", () => {
		const onChange = vi.fn();
		render(<ColorPicker onChange={onChange} />);

		const input = screen.getByPlaceholderText("#b76e79");
		fireEvent.change(input, { target: { value: "#ff5500" } });
		expect(onChange).toHaveBeenCalledWith("#ff5500");
	});

	it("shows error for invalid hex input", () => {
		render(<ColorPicker />);

		const input = screen.getByPlaceholderText("#b76e79");
		fireEvent.change(input, { target: { value: "#xyz" } });

		expect(screen.getByText(/Enter a valid hex color/)).toBeDefined();
		expect(input.getAttribute("aria-invalid")).toBe("true");
	});

	it("clears error when valid hex entered after invalid", () => {
		render(<ColorPicker />);

		const input = screen.getByPlaceholderText("#b76e79");
		fireEvent.change(input, { target: { value: "#xyz" } });
		expect(screen.getByText(/Enter a valid hex color/)).toBeDefined();

		fireEvent.change(input, { target: { value: "#ff5500" } });
		expect(screen.queryByText(/Enter a valid hex color/)).toBeNull();
	});

	it("adds # prefix automatically for valid hex without it", () => {
		const onChange = vi.fn();
		render(<ColorPicker onChange={onChange} />);

		const input = screen.getByPlaceholderText("#b76e79");
		fireEvent.change(input, { target: { value: "ff5500" } });
		expect(onChange).toHaveBeenCalledWith("#ff5500");
	});

	it("normalizes 3-digit hex to 6-digit", () => {
		const onChange = vi.fn();
		render(<ColorPicker onChange={onChange} />);

		const input = screen.getByPlaceholderText("#b76e79");
		fireEvent.change(input, { target: { value: "#fff" } });
		expect(onChange).toHaveBeenCalledWith("#ffffff");
	});
});
