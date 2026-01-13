// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GuestGroupEditor } from "./GuestGroupEditor";

describe("GuestGroupEditor", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders empty form for new group", () => {
		render(<GuestGroupEditor onSave={vi.fn()} onCancel={vi.fn()} />);

		const input = screen.getByTestId("group-name-input");
		expect(input).toBeDefined();
		expect((input as HTMLInputElement).value).toBe("");
	});

	it("renders with initial values for editing", () => {
		render(
			<GuestGroupEditor
				initialValues={{ name: "Family" }}
				onSave={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);

		const input = screen.getByTestId("group-name-input");
		expect((input as HTMLInputElement).value).toBe("Family");
	});

	it("shows validation error when name is empty", async () => {
		const user = userEvent.setup();
		const onSave = vi.fn();
		render(<GuestGroupEditor onSave={onSave} onCancel={vi.fn()} />);

		await user.click(screen.getByTestId("save-group-button"));

		expect(screen.getByTestId("group-name-error")).toBeDefined();
		expect(onSave).not.toHaveBeenCalled();
	});

	it("calls onSave with trimmed name", async () => {
		const user = userEvent.setup();
		const onSave = vi.fn();
		render(<GuestGroupEditor onSave={onSave} onCancel={vi.fn()} />);

		await user.type(screen.getByTestId("group-name-input"), "  Family  ");
		await user.click(screen.getByTestId("save-group-button"));

		expect(onSave).toHaveBeenCalledWith({ name: "Family" });
	});

	it("calls onCancel when cancel clicked", async () => {
		const user = userEvent.setup();
		const onCancel = vi.fn();
		render(<GuestGroupEditor onSave={vi.fn()} onCancel={onCancel} />);

		await user.click(screen.getByTestId("cancel-group-button"));

		expect(onCancel).toHaveBeenCalled();
	});

	it("disables buttons when saving", () => {
		render(
			<GuestGroupEditor onSave={vi.fn()} onCancel={vi.fn()} isSaving={true} />,
		);

		expect(
			(screen.getByTestId("save-group-button") as HTMLButtonElement).disabled,
		).toBe(true);
		expect(
			(screen.getByTestId("cancel-group-button") as HTMLButtonElement).disabled,
		).toBe(true);
	});

	it("shows Update text when editing existing group", () => {
		render(
			<GuestGroupEditor
				initialValues={{ name: "Family" }}
				onSave={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);

		expect(screen.getByTestId("save-group-button").textContent).toBe("Update");
	});

	it("shows Create text when creating new group", () => {
		render(<GuestGroupEditor onSave={vi.fn()} onCancel={vi.fn()} />);

		expect(screen.getByTestId("save-group-button").textContent).toBe("Create");
	});
});
