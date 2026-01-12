// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NoteEditor } from "./NoteEditor";

describe("NoteEditor", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders all form fields", () => {
		render(<NoteEditor onSave={vi.fn()} onCancel={vi.fn()} />);

		expect(screen.getByTestId("note-title-input")).toBeDefined();
		expect(screen.getByTestId("note-description-input")).toBeDefined();
		expect(screen.getByTestId("note-save-button")).toBeDefined();
		expect(screen.getByTestId("note-cancel-button")).toBeDefined();
	});

	it("accepts initial values from note prop", () => {
		const note = {
			id: "note-1",
			title: "Dress Code",
			description: "Black tie optional",
			order: 0,
		};

		render(<NoteEditor note={note} onSave={vi.fn()} onCancel={vi.fn()} />);

		expect(
			(screen.getByTestId("note-title-input") as HTMLInputElement).value,
		).toBe("Dress Code");
		expect(
			(screen.getByTestId("note-description-input") as HTMLTextAreaElement)
				.value,
		).toBe("Black tie optional");
	});

	it("calls onSave with trimmed values when save is clicked", async () => {
		const user = userEvent.setup();
		const onSave = vi.fn();

		render(<NoteEditor onSave={onSave} onCancel={vi.fn()} />);

		await user.type(screen.getByTestId("note-title-input"), "  Dress Code  ");
		await user.type(
			screen.getByTestId("note-description-input"),
			"  Black tie  ",
		);
		await user.click(screen.getByTestId("note-save-button"));

		expect(onSave).toHaveBeenCalledWith({
			title: "Dress Code",
			description: "Black tie",
		});
	});

	it("calls onCancel when cancel is clicked", async () => {
		const user = userEvent.setup();
		const onCancel = vi.fn();

		render(<NoteEditor onSave={vi.fn()} onCancel={onCancel} />);

		await user.click(screen.getByTestId("note-cancel-button"));

		expect(onCancel).toHaveBeenCalled();
	});

	it("disables save button when title is empty", () => {
		render(<NoteEditor onSave={vi.fn()} onCancel={vi.fn()} />);

		expect(screen.getByTestId("note-save-button")).toHaveProperty(
			"disabled",
			true,
		);
	});

	it("enables save button when title is provided", async () => {
		const user = userEvent.setup();

		render(<NoteEditor onSave={vi.fn()} onCancel={vi.fn()} />);

		await user.type(screen.getByTestId("note-title-input"), "Parking Info");

		expect(screen.getByTestId("note-save-button")).toHaveProperty(
			"disabled",
			false,
		);
	});

	it("converts empty description to undefined on save", async () => {
		const user = userEvent.setup();
		const onSave = vi.fn();

		render(<NoteEditor onSave={onSave} onCancel={vi.fn()} />);

		await user.type(screen.getByTestId("note-title-input"), "Parking Info");
		// Leave description empty
		await user.click(screen.getByTestId("note-save-button"));

		expect(onSave).toHaveBeenCalledWith({
			title: "Parking Info",
			description: undefined,
		});
	});
});
