// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
	DEFAULT_FONT_PAIRING_ID,
	FONT_PAIRINGS,
	FontPicker,
	getFontPairingById,
	getGoogleFontsUrl,
} from "./font-picker";

describe("FONT_PAIRINGS", () => {
	it("has expected number of pairings", () => {
		expect(FONT_PAIRINGS.length).toBe(5);
	});

	it("all pairings have required fields", () => {
		for (const pairing of FONT_PAIRINGS) {
			expect(pairing.id).toBeDefined();
			expect(pairing.name).toBeDefined();
			expect(pairing.headingFont).toBeDefined();
			expect(pairing.bodyFont).toBeDefined();
			expect(pairing.description).toBeDefined();
		}
	});

	it("all pairing IDs are unique", () => {
		const ids = FONT_PAIRINGS.map((p) => p.id);
		const uniqueIds = new Set(ids);
		expect(uniqueIds.size).toBe(ids.length);
	});
});

describe("getFontPairingById", () => {
	it("returns matching pairing for valid ID", () => {
		const pairing = getFontPairingById("modern-romantic");
		expect(pairing.id).toBe("modern-romantic");
		expect(pairing.name).toBe("Modern Romantic");
	});

	it("returns default pairing for undefined", () => {
		const pairing = getFontPairingById(undefined);
		expect(pairing.id).toBe(DEFAULT_FONT_PAIRING_ID);
	});

	it("returns default pairing for invalid ID", () => {
		const pairing = getFontPairingById("nonexistent");
		expect(pairing.id).toBe(DEFAULT_FONT_PAIRING_ID);
	});
});

describe("getGoogleFontsUrl", () => {
	it("returns empty string for empty array", () => {
		expect(getGoogleFontsUrl([])).toBe("");
	});

	it("generates valid URL for single font", () => {
		const url = getGoogleFontsUrl(["Playfair Display"]);
		expect(url).toContain("fonts.googleapis.com");
		expect(url).toContain("Playfair%20Display");
	});

	it("generates URL with multiple fonts", () => {
		const url = getGoogleFontsUrl(["Playfair Display", "Lato"]);
		expect(url).toContain("Playfair%20Display");
		expect(url).toContain("Lato");
	});

	it("includes font weights", () => {
		const url = getGoogleFontsUrl(["Lato"]);
		expect(url).toContain("wght@400;500;600;700");
	});

	it("includes display=swap parameter", () => {
		const url = getGoogleFontsUrl(["Lato"]);
		expect(url).toContain("display=swap");
	});
});

describe("FontPicker", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders with label", () => {
		render(<FontPicker />);
		expect(screen.getByText("Font Style")).toBeDefined();
	});

	it("renders custom label", () => {
		render(<FontPicker label="Choose Fonts" />);
		expect(screen.getByText("Choose Fonts")).toBeDefined();
	});

	it("renders select trigger", () => {
		render(<FontPicker />);
		expect(screen.getByRole("combobox")).toBeDefined();
	});

	it("displays default pairing when no value", () => {
		render(<FontPicker />);
		const defaultPairing = getFontPairingById(DEFAULT_FONT_PAIRING_ID);
		expect(screen.getByText(defaultPairing.name)).toBeDefined();
	});

	it("displays selected pairing name", () => {
		render(<FontPicker value="whimsical" />);
		expect(screen.getByText("Whimsical Script")).toBeDefined();
	});

	it("renders preview section", () => {
		render(<FontPicker />);
		expect(screen.getByText("Preview")).toBeDefined();
		expect(screen.getByText("Sarah & Michael")).toBeDefined();
	});

	it("applies heading font to preview heading", () => {
		render(<FontPicker value="classic" />);
		const heading = screen.getByText("Sarah & Michael");
		expect(heading.style.fontFamily).toContain("Playfair Display");
	});

	it("applies body font to preview body", () => {
		render(<FontPicker value="classic" />);
		const body = screen.getByText(/request the pleasure/);
		expect(body.style.fontFamily).toContain("Lato");
	});

	// Note: Testing Select interaction is skipped due to jsdom limitations with
	// Radix UI Select's scrollIntoView. The component is covered by integration tests.
	// See: https://github.com/radix-ui/primitives/issues/1822
});
