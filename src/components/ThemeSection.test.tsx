// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
	InvitationBuilderProvider,
	type InvitationData,
} from "@/contexts/InvitationBuilderContext";
import { ThemeSection } from "./ThemeSection";

function renderWithContext(initialData: InvitationData) {
	return render(
		<InvitationBuilderProvider initialData={initialData}>
			<ThemeSection />
		</InvitationBuilderProvider>,
	);
}

describe("ThemeSection", () => {
	afterEach(() => {
		cleanup();
	});

	const baseData: InvitationData = {
		id: "test-123",
		partner1Name: "Alice",
		partner2Name: "Bob",
	};

	it("renders ColorPicker with label", () => {
		renderWithContext(baseData);
		expect(screen.getByText("Accent Color")).toBeDefined();
	});

	it("displays preset color swatches", () => {
		renderWithContext(baseData);
		expect(screen.getByRole("button", { name: "Rose Gold" })).toBeDefined();
		expect(screen.getByRole("button", { name: "Sage" })).toBeDefined();
	});

	it("displays hex input field", () => {
		renderWithContext(baseData);
		expect(screen.getByPlaceholderText("#b76e79")).toBeDefined();
	});

	it("shows initial accent color in input", () => {
		const dataWithColor: InvitationData = {
			...baseData,
			accentColor: "#9caf88",
		};
		renderWithContext(dataWithColor);

		const input = screen.getByPlaceholderText("#b76e79") as HTMLInputElement;
		expect(input.value).toBe("#9caf88");
	});

	it("marks matching preset as selected", () => {
		const dataWithColor: InvitationData = {
			...baseData,
			accentColor: "#9caf88", // Sage
		};
		renderWithContext(dataWithColor);

		const sageButton = screen.getByRole("button", { name: "Sage" });
		expect(sageButton.getAttribute("aria-pressed")).toBe("true");
	});

	it("updates color when preset swatch clicked", () => {
		renderWithContext(baseData);

		fireEvent.click(screen.getByRole("button", { name: "Dusty Blue" }));

		const input = screen.getByPlaceholderText("#b76e79") as HTMLInputElement;
		expect(input.value).toBe("#8fa8c8");
	});

	it("renders FontPicker with label", () => {
		renderWithContext(baseData);
		expect(screen.getByText("Font Style")).toBeDefined();
	});

	it("displays font style dropdown", () => {
		renderWithContext(baseData);
		expect(screen.getByRole("combobox")).toBeDefined();
	});

	it("shows initial font pairing selection", () => {
		const dataWithFont: InvitationData = {
			...baseData,
			fontPairing: "whimsical",
		};
		renderWithContext(dataWithFont);

		expect(screen.getByText("Whimsical Script")).toBeDefined();
	});
});
