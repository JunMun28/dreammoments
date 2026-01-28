// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import {
	InvitationBuilderProvider,
	type InvitationData,
} from "@/contexts/InvitationBuilderContext";
import { NoteList } from "./NoteList";

const mockInitialData: InvitationData = {
	id: "test-123",
	partner1Name: "Alice",
	partner2Name: "Bob",
};

function renderWithProvider(initialData: InvitationData = mockInitialData) {
	return render(
		<InvitationBuilderProvider initialData={initialData}>
			<NoteList />
		</InvitationBuilderProvider>,
	);
}

describe("NoteList", () => {
	afterEach(() => {
		cleanup();
	});

	it("renders empty state when no notes exist", () => {
		renderWithProvider();

		expect(screen.getByTestId("empty-note-message")).toBeDefined();
		expect(screen.getByTestId("add-note-button")).toBeDefined();
	});

	it("shows note editor when add button is clicked", async () => {
		const user = userEvent.setup();
		renderWithProvider();

		await user.click(screen.getByTestId("add-note-button"));

		expect(screen.getByTestId("note-editor")).toBeDefined();
	});

	it("disables add button while editor is open", async () => {
		const user = userEvent.setup();
		renderWithProvider();

		await user.click(screen.getByTestId("add-note-button"));

		expect(screen.getByTestId("add-note-button")).toHaveProperty(
			"disabled",
			true,
		);
	});

	it("adds note when saved", async () => {
		const user = userEvent.setup();
		renderWithProvider();

		await user.click(screen.getByTestId("add-note-button"));
		await user.type(screen.getByTestId("note-title-input"), "Dress Code");
		await user.type(
			screen.getByTestId("note-description-input"),
			"Black tie optional",
		);
		await user.click(screen.getByTestId("note-save-button"));

		expect(screen.getByText("Dress Code")).toBeDefined();
		expect(screen.getByText("Black tie optional")).toBeDefined();
	});

	it("renders existing notes from context", () => {
		const dataWithNotes: InvitationData = {
			...mockInitialData,
			notes: [
				{ id: "note-1", title: "Parking", description: "Free valet", order: 0 },
				{ id: "note-2", title: "Dress Code", order: 1 },
			],
		};

		renderWithProvider(dataWithNotes);

		expect(screen.getByText("Parking")).toBeDefined();
		expect(screen.getByText("Dress Code")).toBeDefined();
		expect(screen.queryByTestId("empty-note-message")).toBeNull();
	});

	it("shows edit and delete buttons for each note", () => {
		const dataWithNotes: InvitationData = {
			...mockInitialData,
			notes: [{ id: "note-1", title: "Parking", order: 0 }],
		};

		renderWithProvider(dataWithNotes);

		expect(screen.getByTestId("edit-note-note-1")).toBeDefined();
		expect(screen.getByTestId("delete-note-note-1")).toBeDefined();
	});

	it("shows editor when edit button is clicked", async () => {
		const user = userEvent.setup();
		const dataWithNotes: InvitationData = {
			...mockInitialData,
			notes: [{ id: "note-1", title: "Parking", order: 0 }],
		};

		renderWithProvider(dataWithNotes);

		await user.click(screen.getByTestId("edit-note-note-1"));

		expect(screen.getByTestId("note-editor")).toBeDefined();
		expect(
			(screen.getByTestId("note-title-input") as HTMLInputElement).value,
		).toBe("Parking");
	});

	it("updates note when edit is saved", async () => {
		const user = userEvent.setup();
		const dataWithNotes: InvitationData = {
			...mockInitialData,
			notes: [{ id: "note-1", title: "Parking", order: 0 }],
		};

		renderWithProvider(dataWithNotes);

		await user.click(screen.getByTestId("edit-note-note-1"));
		await user.clear(screen.getByTestId("note-title-input"));
		await user.type(screen.getByTestId("note-title-input"), "Free Parking");
		await user.click(screen.getByTestId("note-save-button"));

		expect(screen.getByText("Free Parking")).toBeDefined();
	});

	it("closes editor when cancel is clicked", async () => {
		const user = userEvent.setup();
		renderWithProvider();

		await user.click(screen.getByTestId("add-note-button"));
		expect(screen.getByTestId("note-editor")).toBeDefined();

		await user.click(screen.getByTestId("note-cancel-button"));
		expect(screen.queryByTestId("note-editor")).toBeNull();
	});

	it("shows delete confirmation dialog", async () => {
		const user = userEvent.setup();
		const dataWithNotes: InvitationData = {
			...mockInitialData,
			notes: [{ id: "note-1", title: "Parking", order: 0 }],
		};

		renderWithProvider(dataWithNotes);

		await user.click(screen.getByTestId("delete-note-note-1"));

		expect(screen.getByText("Delete Note")).toBeDefined();
		expect(
			screen.getByText(
				'Are you sure you want to delete "Parking"? This action cannot be undone.',
			),
		).toBeDefined();
	});

	it("deletes note when confirmed", async () => {
		const user = userEvent.setup();
		const dataWithNotes: InvitationData = {
			...mockInitialData,
			notes: [{ id: "note-1", title: "Parking", order: 0 }],
		};

		renderWithProvider(dataWithNotes);

		await user.click(screen.getByTestId("delete-note-note-1"));
		await user.click(screen.getByTestId("confirm-delete-note-1"));

		expect(screen.queryByText("Parking")).toBeNull();
		expect(screen.getByTestId("empty-note-message")).toBeDefined();
	});

	it("shows reorder buttons for each note", () => {
		const dataWithNotes: InvitationData = {
			...mockInitialData,
			notes: [
				{ id: "note-1", title: "Parking", order: 0 },
				{ id: "note-2", title: "Dress Code", order: 1 },
			],
		};

		renderWithProvider(dataWithNotes);

		expect(screen.getByTestId("move-up-note-1")).toBeDefined();
		expect(screen.getByTestId("move-down-note-1")).toBeDefined();
		expect(screen.getByTestId("move-up-note-2")).toBeDefined();
		expect(screen.getByTestId("move-down-note-2")).toBeDefined();
	});

	it("disables move up for first note", () => {
		const dataWithNotes: InvitationData = {
			...mockInitialData,
			notes: [
				{ id: "note-1", title: "Parking", order: 0 },
				{ id: "note-2", title: "Dress Code", order: 1 },
			],
		};

		renderWithProvider(dataWithNotes);

		expect(screen.getByTestId("move-up-note-1")).toHaveProperty(
			"disabled",
			true,
		);
	});

	it("disables move down for last note", () => {
		const dataWithNotes: InvitationData = {
			...mockInitialData,
			notes: [
				{ id: "note-1", title: "Parking", order: 0 },
				{ id: "note-2", title: "Dress Code", order: 1 },
			],
		};

		renderWithProvider(dataWithNotes);

		expect(screen.getByTestId("move-down-note-2")).toHaveProperty(
			"disabled",
			true,
		);
	});
});
