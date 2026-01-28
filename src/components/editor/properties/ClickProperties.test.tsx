// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { FabricObject } from "fabric";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ClickProperties } from "./ClickProperties";

/**
 * CE-031: Click/Interaction Properties Tests
 *
 * Tests for the click interaction tab that allows setting:
 * - None (no action)
 * - URL Link (open URL on click)
 * - Phone Call (tel: link)
 * - Email (mailto: link)
 */

// Mock FabricObject with properly typed clickInteraction
type ClickActionType = "none" | "url" | "phone" | "email";
interface ClickInteraction {
	type: ClickActionType;
	value?: string;
}

const createMockObject = (
	overrides: Partial<
		FabricObject & { clickInteraction?: ClickInteraction }
	> = {},
) => {
	return {
		type: "image",
		clickInteraction: undefined,
		...overrides,
	} as FabricObject & { clickInteraction?: ClickInteraction };
};

describe("ClickProperties", () => {
	let onPropertyChange: ReturnType<typeof vi.fn>;
	let user: ReturnType<typeof userEvent.setup>;

	beforeEach(() => {
		onPropertyChange = vi.fn();
		user = userEvent.setup();
	});

	afterEach(() => {
		cleanup();
	});

	describe("CE-031: Panel Structure", () => {
		it("renders the Click Action section header", () => {
			const object = createMockObject();
			render(
				<ClickProperties object={object} onPropertyChange={onPropertyChange} />,
			);

			expect(screen.getByText("Click Action")).toBeDefined();
		});

		it("renders action type dropdown", () => {
			const object = createMockObject();
			render(
				<ClickProperties object={object} onPropertyChange={onPropertyChange} />,
			);

			const dropdown = screen.getByLabelText("Action Type");
			expect(dropdown).toBeDefined();
		});

		it("renders dropdown with None, URL, Phone, and Email options", () => {
			const object = createMockObject();
			render(
				<ClickProperties object={object} onPropertyChange={onPropertyChange} />,
			);

			// Verify dropdown is present
			expect(screen.getByLabelText("Action Type")).toBeDefined();

			// Check options exist
			expect(screen.getByRole("option", { name: /none/i })).toBeDefined();
			expect(screen.getByRole("option", { name: /url link/i })).toBeDefined();
			expect(screen.getByRole("option", { name: /phone call/i })).toBeDefined();
			expect(screen.getByRole("option", { name: /email/i })).toBeDefined();
		});
	});

	describe("CE-031: None Action", () => {
		it("defaults to None when no interaction is set", () => {
			const object = createMockObject();
			render(
				<ClickProperties object={object} onPropertyChange={onPropertyChange} />,
			);

			const dropdown = screen.getByLabelText(
				"Action Type",
			) as HTMLSelectElement;
			expect(dropdown.value).toBe("none");
		});

		it("does not show input field when None is selected", () => {
			const object = createMockObject();
			render(
				<ClickProperties object={object} onPropertyChange={onPropertyChange} />,
			);

			// Should not have URL or phone input
			expect(screen.queryByLabelText(/url/i)).toBeNull();
			expect(screen.queryByLabelText(/phone/i)).toBeNull();
			expect(screen.queryByLabelText(/email/i)).toBeNull();
		});
	});

	describe("CE-031: URL Link Action", () => {
		it("shows URL input when URL is selected", async () => {
			const object = createMockObject();
			render(
				<ClickProperties object={object} onPropertyChange={onPropertyChange} />,
			);

			const dropdown = screen.getByLabelText("Action Type");
			await user.selectOptions(dropdown, "url");

			expect(screen.getByLabelText("URL")).toBeDefined();
		});

		it("calls onPropertyChange when URL is entered", async () => {
			const object = createMockObject({
				clickInteraction: { type: "url", value: "" },
			});
			render(
				<ClickProperties object={object} onPropertyChange={onPropertyChange} />,
			);

			const dropdown = screen.getByLabelText("Action Type");
			await user.selectOptions(dropdown, "url");

			const urlInput = screen.getByLabelText("URL");
			await user.type(urlInput, "https://example.com");

			expect(onPropertyChange).toHaveBeenCalledWith("clickInteraction", {
				type: "url",
				value: "https://example.com",
			});
		});

		it("displays existing URL value", () => {
			const object = createMockObject({
				clickInteraction: { type: "url", value: "https://wedding.com" },
			});
			render(
				<ClickProperties object={object} onPropertyChange={onPropertyChange} />,
			);

			const urlInput = screen.getByLabelText("URL") as HTMLInputElement;
			expect(urlInput.value).toBe("https://wedding.com");
		});

		it("shows placeholder text for URL input", async () => {
			const object = createMockObject();
			render(
				<ClickProperties object={object} onPropertyChange={onPropertyChange} />,
			);

			const dropdown = screen.getByLabelText("Action Type");
			await user.selectOptions(dropdown, "url");

			const urlInput = screen.getByLabelText("URL");
			expect(urlInput.getAttribute("placeholder")).toContain("https://");
		});
	});

	describe("CE-031: Phone Call Action", () => {
		it("shows phone input when Phone is selected", async () => {
			const object = createMockObject();
			render(
				<ClickProperties object={object} onPropertyChange={onPropertyChange} />,
			);

			const dropdown = screen.getByLabelText("Action Type");
			await user.selectOptions(dropdown, "phone");

			expect(screen.getByLabelText("Phone Number")).toBeDefined();
		});

		it("calls onPropertyChange when phone number is entered", async () => {
			const object = createMockObject({
				clickInteraction: { type: "phone", value: "" },
			});
			render(
				<ClickProperties object={object} onPropertyChange={onPropertyChange} />,
			);

			const dropdown = screen.getByLabelText("Action Type");
			await user.selectOptions(dropdown, "phone");

			const phoneInput = screen.getByLabelText("Phone Number");
			await user.type(phoneInput, "+1234567890");

			expect(onPropertyChange).toHaveBeenCalledWith("clickInteraction", {
				type: "phone",
				value: "+1234567890",
			});
		});

		it("displays existing phone value", () => {
			const object = createMockObject({
				clickInteraction: { type: "phone", value: "+60123456789" },
			});
			render(
				<ClickProperties object={object} onPropertyChange={onPropertyChange} />,
			);

			const phoneInput = screen.getByLabelText(
				"Phone Number",
			) as HTMLInputElement;
			expect(phoneInput.value).toBe("+60123456789");
		});
	});

	describe("CE-031: Email Action", () => {
		it("shows email input when Email is selected", async () => {
			const object = createMockObject();
			render(
				<ClickProperties object={object} onPropertyChange={onPropertyChange} />,
			);

			const dropdown = screen.getByLabelText("Action Type");
			await user.selectOptions(dropdown, "email");

			expect(screen.getByLabelText("Email Address")).toBeDefined();
		});

		it("calls onPropertyChange when email is entered", async () => {
			const object = createMockObject({
				clickInteraction: { type: "email", value: "" },
			});
			render(
				<ClickProperties object={object} onPropertyChange={onPropertyChange} />,
			);

			const dropdown = screen.getByLabelText("Action Type");
			await user.selectOptions(dropdown, "email");

			const emailInput = screen.getByLabelText("Email Address");
			await user.type(emailInput, "rsvp@wedding.com");

			expect(onPropertyChange).toHaveBeenCalledWith("clickInteraction", {
				type: "email",
				value: "rsvp@wedding.com",
			});
		});

		it("displays existing email value", () => {
			const object = createMockObject({
				clickInteraction: { type: "email", value: "hello@example.com" },
			});
			render(
				<ClickProperties object={object} onPropertyChange={onPropertyChange} />,
			);

			const emailInput = screen.getByLabelText(
				"Email Address",
			) as HTMLInputElement;
			expect(emailInput.value).toBe("hello@example.com");
		});
	});

	describe("CE-031: Action Type Changes", () => {
		it("calls onPropertyChange when action type changes", async () => {
			const object = createMockObject();
			render(
				<ClickProperties object={object} onPropertyChange={onPropertyChange} />,
			);

			const dropdown = screen.getByLabelText("Action Type");
			await user.selectOptions(dropdown, "url");

			expect(onPropertyChange).toHaveBeenCalledWith("clickInteraction", {
				type: "url",
				value: "",
			});
		});

		it("clears value when switching to None", async () => {
			const object = createMockObject({
				clickInteraction: { type: "url", value: "https://example.com" },
			});
			render(
				<ClickProperties object={object} onPropertyChange={onPropertyChange} />,
			);

			const dropdown = screen.getByLabelText("Action Type");
			await user.selectOptions(dropdown, "none");

			expect(onPropertyChange).toHaveBeenCalledWith("clickInteraction", {
				type: "none",
				value: undefined,
			});
		});
	});
});
