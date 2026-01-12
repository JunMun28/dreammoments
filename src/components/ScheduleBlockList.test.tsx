// @vitest-environment jsdom

import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
	InvitationBuilderProvider,
	type InvitationData,
	type ScheduleBlock,
} from "@/contexts/InvitationBuilderContext";
import { formatBlockTime, ScheduleBlockList } from "./ScheduleBlockList";

describe("formatBlockTime", () => {
	it("formats morning time correctly", () => {
		expect(formatBlockTime("09:30")).toBe("9:30 AM");
	});

	it("formats noon correctly", () => {
		expect(formatBlockTime("12:00")).toBe("12:00 PM");
	});

	it("formats afternoon time correctly", () => {
		expect(formatBlockTime("14:30")).toBe("2:30 PM");
	});

	it("formats midnight correctly", () => {
		expect(formatBlockTime("00:00")).toBe("12:00 AM");
	});

	it("returns empty string for undefined", () => {
		expect(formatBlockTime(undefined)).toBe("");
	});
});

describe("ScheduleBlockList", () => {
	afterEach(() => {
		cleanup();
	});

	const mockInitialData: InvitationData = {
		id: "test-123",
		partner1Name: "Alice",
		partner2Name: "Bob",
	};

	const mockScheduleBlocks: ScheduleBlock[] = [
		{
			id: "1",
			title: "Ceremony",
			time: "14:00",
			description: "Main hall",
			order: 0,
		},
		{
			id: "2",
			title: "Reception",
			time: "16:00",
			description: "Garden",
			order: 1,
		},
	];

	const renderWithProvider = (
		initialData: InvitationData = mockInitialData,
	) => {
		return render(
			<InvitationBuilderProvider initialData={initialData}>
				<ScheduleBlockList />
			</InvitationBuilderProvider>,
		);
	};

	it("renders empty state when no schedule blocks exist", () => {
		renderWithProvider();

		expect(screen.getByTestId("empty-schedule-message")).toBeDefined();
		expect(screen.getByText(/no events added yet/i)).toBeDefined();
	});

	it("renders add event button", () => {
		renderWithProvider();

		const addButton = screen.getByTestId("add-schedule-block-button");
		expect(addButton).toBeDefined();
		expect(addButton.textContent).toContain("Add Event");
	});

	it("renders schedule blocks when they exist", () => {
		renderWithProvider({
			...mockInitialData,
			scheduleBlocks: mockScheduleBlocks,
		});

		expect(screen.getByTestId("schedule-block-list")).toBeDefined();
		expect(screen.getByText("Ceremony")).toBeDefined();
		expect(screen.getByText("Reception")).toBeDefined();
	});

	it("displays formatted time for blocks", () => {
		renderWithProvider({
			...mockInitialData,
			scheduleBlocks: mockScheduleBlocks,
		});

		expect(screen.getByText("2:00 PM")).toBeDefined();
		expect(screen.getByText("4:00 PM")).toBeDefined();
	});

	it("displays description for blocks", () => {
		renderWithProvider({
			...mockInitialData,
			scheduleBlocks: mockScheduleBlocks,
		});

		expect(screen.getByText("Main hall")).toBeDefined();
		expect(screen.getByText("Garden")).toBeDefined();
	});

	it("shows editor when add button is clicked", () => {
		renderWithProvider(mockInitialData);

		act(() => {
			screen.getByTestId("add-schedule-block-button").click();
		});

		expect(screen.getByTestId("schedule-block-editor")).toBeDefined();
		expect(screen.getByTestId("block-title-input")).toBeDefined();
	});

	it("disables add button while editor is open", () => {
		renderWithProvider(mockInitialData);

		const addButton = screen.getByTestId(
			"add-schedule-block-button",
		) as HTMLButtonElement;
		expect(addButton.disabled).toBe(false);

		act(() => {
			addButton.click();
		});

		expect(addButton.disabled).toBe(true);
	});

	it("shows edit button on each block", () => {
		renderWithProvider({
			...mockInitialData,
			scheduleBlocks: mockScheduleBlocks,
		});

		expect(screen.getByTestId("edit-block-1")).toBeDefined();
		expect(screen.getByTestId("edit-block-2")).toBeDefined();
	});

	it("shows editor when edit button is clicked", () => {
		renderWithProvider({
			...mockInitialData,
			scheduleBlocks: mockScheduleBlocks,
		});

		act(() => {
			screen.getByTestId("edit-block-1").click();
		});

		// Editor should be shown with block data
		expect(screen.getByTestId("schedule-block-editor")).toBeDefined();
		const titleInput = screen.getByTestId(
			"block-title-input",
		) as HTMLInputElement;
		expect(titleInput.value).toBe("Ceremony");
	});

	it("sorts blocks by order", () => {
		const unorderedBlocks: ScheduleBlock[] = [
			{ id: "1", title: "Reception", order: 2, time: "16:00" },
			{ id: "2", title: "Ceremony", order: 0, time: "14:00" },
			{ id: "3", title: "Cocktails", order: 1, time: "15:00" },
		];

		renderWithProvider({
			...mockInitialData,
			scheduleBlocks: unorderedBlocks,
		});

		const list = screen.getByTestId("schedule-block-list");
		const blockTitles = list.querySelectorAll("h4");

		expect(blockTitles[0].textContent).toBe("Ceremony");
		expect(blockTitles[1].textContent).toBe("Cocktails");
		expect(blockTitles[2].textContent).toBe("Reception");
	});

	it("shows delete button on each block", () => {
		renderWithProvider({
			...mockInitialData,
			scheduleBlocks: mockScheduleBlocks,
		});

		expect(screen.getByTestId("delete-block-1")).toBeDefined();
		expect(screen.getByTestId("delete-block-2")).toBeDefined();
	});

	it("shows confirmation dialog when delete button clicked", () => {
		renderWithProvider({
			...mockInitialData,
			scheduleBlocks: mockScheduleBlocks,
		});

		act(() => {
			screen.getByTestId("delete-block-1").click();
		});

		// Confirmation dialog should appear
		expect(screen.getByText("Delete Event")).toBeDefined();
		expect(
			screen.getByText(/Are you sure you want to delete "Ceremony"/),
		).toBeDefined();
		expect(screen.getByText("Cancel")).toBeDefined();
		expect(screen.getByTestId("confirm-delete-1")).toBeDefined();
	});

	it("deletes block when confirm is clicked", () => {
		renderWithProvider({
			...mockInitialData,
			scheduleBlocks: mockScheduleBlocks,
		});

		// Click delete button
		act(() => {
			screen.getByTestId("delete-block-1").click();
		});

		// Click confirm
		act(() => {
			screen.getByTestId("confirm-delete-1").click();
		});

		// Block should be removed
		expect(screen.queryByText("Ceremony")).toBeNull();
		expect(screen.getByText("Reception")).toBeDefined();
	});

	it("keeps block when cancel is clicked in confirmation dialog", () => {
		renderWithProvider({
			...mockInitialData,
			scheduleBlocks: mockScheduleBlocks,
		});

		// Click delete button
		act(() => {
			screen.getByTestId("delete-block-1").click();
		});

		// Click cancel
		act(() => {
			screen.getByText("Cancel").click();
		});

		// Block should still exist
		expect(screen.getByText("Ceremony")).toBeDefined();
		expect(screen.getByText("Reception")).toBeDefined();
	});

	it("shows move up and move down buttons on each block", () => {
		renderWithProvider({
			...mockInitialData,
			scheduleBlocks: mockScheduleBlocks,
		});

		expect(screen.getByTestId("move-up-1")).toBeDefined();
		expect(screen.getByTestId("move-down-1")).toBeDefined();
		expect(screen.getByTestId("move-up-2")).toBeDefined();
		expect(screen.getByTestId("move-down-2")).toBeDefined();
	});

	it("disables move up button for first block", () => {
		renderWithProvider({
			...mockInitialData,
			scheduleBlocks: mockScheduleBlocks,
		});

		const moveUpFirst = screen.getByTestId("move-up-1") as HTMLButtonElement;
		const moveDownFirst = screen.getByTestId(
			"move-down-1",
		) as HTMLButtonElement;

		// First block: up disabled, down enabled
		expect(moveUpFirst.disabled).toBe(true);
		expect(moveDownFirst.disabled).toBe(false);
	});

	it("disables move down button for last block", () => {
		renderWithProvider({
			...mockInitialData,
			scheduleBlocks: mockScheduleBlocks,
		});

		const moveUpLast = screen.getByTestId("move-up-2") as HTMLButtonElement;
		const moveDownLast = screen.getByTestId("move-down-2") as HTMLButtonElement;

		// Last block: up enabled, down disabled
		expect(moveUpLast.disabled).toBe(false);
		expect(moveDownLast.disabled).toBe(true);
	});

	it("moves block down when move down button is clicked", () => {
		renderWithProvider({
			...mockInitialData,
			scheduleBlocks: mockScheduleBlocks,
		});

		// Verify initial order
		const list = screen.getByTestId("schedule-block-list");
		let blockTitles = list.querySelectorAll("h4");
		expect(blockTitles[0].textContent).toBe("Ceremony");
		expect(blockTitles[1].textContent).toBe("Reception");

		// Move first block down
		act(() => {
			screen.getByTestId("move-down-1").click();
		});

		// Verify new order
		blockTitles = screen
			.getByTestId("schedule-block-list")
			.querySelectorAll("h4");
		expect(blockTitles[0].textContent).toBe("Reception");
		expect(blockTitles[1].textContent).toBe("Ceremony");
	});

	it("moves block up when move up button is clicked", () => {
		renderWithProvider({
			...mockInitialData,
			scheduleBlocks: mockScheduleBlocks,
		});

		// Verify initial order
		const list = screen.getByTestId("schedule-block-list");
		let blockTitles = list.querySelectorAll("h4");
		expect(blockTitles[0].textContent).toBe("Ceremony");
		expect(blockTitles[1].textContent).toBe("Reception");

		// Move second block up
		act(() => {
			screen.getByTestId("move-up-2").click();
		});

		// Verify new order
		blockTitles = screen
			.getByTestId("schedule-block-list")
			.querySelectorAll("h4");
		expect(blockTitles[0].textContent).toBe("Reception");
		expect(blockTitles[1].textContent).toBe("Ceremony");
	});

	it("updates disabled state after reordering", () => {
		renderWithProvider({
			...mockInitialData,
			scheduleBlocks: mockScheduleBlocks,
		});

		// Initially block 1 is first, so move-up is disabled
		const moveUpFirst = screen.getByTestId("move-up-1") as HTMLButtonElement;
		expect(moveUpFirst.disabled).toBe(true);

		// Move block 1 down (so block 2 becomes first)
		act(() => {
			screen.getByTestId("move-down-1").click();
		});

		// Now block 1 is last, so its move-up should be enabled
		const moveUpBlock1AfterMove = screen.getByTestId(
			"move-up-1",
		) as HTMLButtonElement;
		expect(moveUpBlock1AfterMove.disabled).toBe(false);

		// And block 2 is now first, so its move-up should be disabled
		const moveUpBlock2AfterMove = screen.getByTestId(
			"move-up-2",
		) as HTMLButtonElement;
		expect(moveUpBlock2AfterMove.disabled).toBe(true);
	});
});
