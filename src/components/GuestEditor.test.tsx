// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GuestEditor } from "./GuestEditor";

describe("GuestEditor", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders empty form for new guest", () => {
		render(<GuestEditor onSave={vi.fn()} onCancel={vi.fn()} />);

		expect(
			(screen.getByTestId("guest-name-input") as HTMLInputElement).value,
		).toBe("");
		expect(
			(screen.getByTestId("guest-email-input") as HTMLInputElement).value,
		).toBe("");
		expect(
			(screen.getByTestId("guest-phone-input") as HTMLInputElement).value,
		).toBe("");
	});

	it("renders with initial values for editing", () => {
		render(
			<GuestEditor
				initialValues={{
					name: "John Doe",
					email: "john@example.com",
					phone: "555-1234",
				}}
				onSave={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);

		expect(
			(screen.getByTestId("guest-name-input") as HTMLInputElement).value,
		).toBe("John Doe");
		expect(
			(screen.getByTestId("guest-email-input") as HTMLInputElement).value,
		).toBe("john@example.com");
		expect(
			(screen.getByTestId("guest-phone-input") as HTMLInputElement).value,
		).toBe("555-1234");
	});

	it("shows validation error when name is empty", async () => {
		const user = userEvent.setup();
		const onSave = vi.fn();
		render(<GuestEditor onSave={onSave} onCancel={vi.fn()} />);

		await user.click(screen.getByTestId("save-guest-button"));

		expect(screen.getByTestId("guest-name-error")).toBeDefined();
		expect(onSave).not.toHaveBeenCalled();
	});

	it("shows validation error for invalid email", async () => {
		const user = userEvent.setup();
		const onSave = vi.fn();
		render(<GuestEditor onSave={onSave} onCancel={vi.fn()} />);

		await user.type(screen.getByTestId("guest-name-input"), "John Doe");
		await user.type(screen.getByTestId("guest-email-input"), "invalid-email");
		await user.click(screen.getByTestId("save-guest-button"));

		expect(screen.getByTestId("guest-email-error")).toBeDefined();
		expect(onSave).not.toHaveBeenCalled();
	});

	it("calls onSave with trimmed values", async () => {
		const user = userEvent.setup();
		const onSave = vi.fn();
		render(<GuestEditor onSave={onSave} onCancel={vi.fn()} />);

		await user.type(screen.getByTestId("guest-name-input"), "  John Doe  ");
		await user.type(
			screen.getByTestId("guest-email-input"),
			"  john@example.com  ",
		);
		await user.type(screen.getByTestId("guest-phone-input"), "  555-1234  ");
		await user.click(screen.getByTestId("save-guest-button"));

		expect(onSave).toHaveBeenCalledWith({
			name: "John Doe",
			email: "john@example.com",
			phone: "555-1234",
		});
	});

	it("omits empty optional fields from save", async () => {
		const user = userEvent.setup();
		const onSave = vi.fn();
		render(<GuestEditor onSave={onSave} onCancel={vi.fn()} />);

		await user.type(screen.getByTestId("guest-name-input"), "John Doe");
		await user.click(screen.getByTestId("save-guest-button"));

		expect(onSave).toHaveBeenCalledWith({
			name: "John Doe",
			email: undefined,
			phone: undefined,
		});
	});

	it("calls onCancel when cancel clicked", async () => {
		const user = userEvent.setup();
		const onCancel = vi.fn();
		render(<GuestEditor onSave={vi.fn()} onCancel={onCancel} />);

		await user.click(screen.getByTestId("cancel-guest-button"));

		expect(onCancel).toHaveBeenCalled();
	});

	it("disables buttons when saving", () => {
		render(<GuestEditor onSave={vi.fn()} onCancel={vi.fn()} isSaving={true} />);

		expect(
			(screen.getByTestId("save-guest-button") as HTMLButtonElement).disabled,
		).toBe(true);
		expect(
			(screen.getByTestId("cancel-guest-button") as HTMLButtonElement).disabled,
		).toBe(true);
	});

	it("shows Update text when editing existing guest", () => {
		render(
			<GuestEditor
				initialValues={{ name: "John Doe" }}
				onSave={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);

		expect(screen.getByTestId("save-guest-button").textContent).toBe("Update");
	});

	it("shows Add text when creating new guest", () => {
		render(<GuestEditor onSave={vi.fn()} onCancel={vi.fn()} />);

		expect(screen.getByTestId("save-guest-button").textContent).toBe("Add");
	});
});
