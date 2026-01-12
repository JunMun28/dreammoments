import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ScheduleBlock } from "@/contexts/InvitationBuilderContext";
import { ScheduleBlockEditor } from "./ScheduleBlockEditor";

describe("ScheduleBlockEditor", () => {
	const mockOnSave = vi.fn();
	const mockOnCancel = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders all form fields", () => {
		render(<ScheduleBlockEditor onSave={mockOnSave} onCancel={mockOnCancel} />);

		expect(screen.getByTestId("schedule-block-editor")).toBeDefined();
		expect(screen.getByTestId("block-title-input")).toBeDefined();
		expect(screen.getByText("Time")).toBeDefined();
		expect(screen.getByTestId("block-description-input")).toBeDefined();
		expect(screen.getByTestId("block-save-button")).toBeDefined();
		expect(screen.getByTestId("block-cancel-button")).toBeDefined();
	});

	it("renders with initial block values", () => {
		const block: ScheduleBlock = {
			id: "test-1",
			title: "Ceremony",
			time: "14:00",
			description: "Main church",
			order: 0,
		};

		render(
			<ScheduleBlockEditor
				block={block}
				onSave={mockOnSave}
				onCancel={mockOnCancel}
			/>,
		);

		const titleInput = screen.getByTestId(
			"block-title-input",
		) as HTMLInputElement;
		const descInput = screen.getByTestId(
			"block-description-input",
		) as HTMLTextAreaElement;

		expect(titleInput.value).toBe("Ceremony");
		expect(descInput.value).toBe("Main church");
	});

	it("calls onSave with form values when save is clicked", () => {
		render(<ScheduleBlockEditor onSave={mockOnSave} onCancel={mockOnCancel} />);

		const titleInput = screen.getByTestId("block-title-input");
		fireEvent.change(titleInput, { target: { value: "Reception" } });

		const descInput = screen.getByTestId("block-description-input");
		fireEvent.change(descInput, { target: { value: "Grand Ballroom" } });

		const saveButton = screen.getByTestId("block-save-button");
		fireEvent.click(saveButton);

		expect(mockOnSave).toHaveBeenCalledTimes(1);
		expect(mockOnSave).toHaveBeenCalledWith({
			title: "Reception",
			time: undefined,
			description: "Grand Ballroom",
		});
	});

	it("calls onCancel when cancel is clicked", () => {
		render(<ScheduleBlockEditor onSave={mockOnSave} onCancel={mockOnCancel} />);

		const cancelButton = screen.getByTestId("block-cancel-button");
		fireEvent.click(cancelButton);

		expect(mockOnCancel).toHaveBeenCalledTimes(1);
	});

	it("disables save button when title is empty", () => {
		render(<ScheduleBlockEditor onSave={mockOnSave} onCancel={mockOnCancel} />);

		const saveButton = screen.getByTestId(
			"block-save-button",
		) as HTMLButtonElement;
		expect(saveButton.disabled).toBe(true);

		const titleInput = screen.getByTestId("block-title-input");
		fireEvent.change(titleInput, { target: { value: "Ceremony" } });

		expect(saveButton.disabled).toBe(false);
	});

	it("disables save button when title is only whitespace", () => {
		render(<ScheduleBlockEditor onSave={mockOnSave} onCancel={mockOnCancel} />);

		const titleInput = screen.getByTestId("block-title-input");
		fireEvent.change(titleInput, { target: { value: "   " } });

		const saveButton = screen.getByTestId(
			"block-save-button",
		) as HTMLButtonElement;
		expect(saveButton.disabled).toBe(true);
	});

	it("trims title and description on save", () => {
		render(<ScheduleBlockEditor onSave={mockOnSave} onCancel={mockOnCancel} />);

		const titleInput = screen.getByTestId("block-title-input");
		fireEvent.change(titleInput, { target: { value: "  Ceremony  " } });

		const descInput = screen.getByTestId("block-description-input");
		fireEvent.change(descInput, { target: { value: "  Main church  " } });

		const saveButton = screen.getByTestId("block-save-button");
		fireEvent.click(saveButton);

		expect(mockOnSave).toHaveBeenCalledWith({
			title: "Ceremony",
			time: undefined,
			description: "Main church",
		});
	});

	it("calls onChange on each field change", () => {
		const mockOnChange = vi.fn();

		render(
			<ScheduleBlockEditor
				onSave={mockOnSave}
				onCancel={mockOnCancel}
				onChange={mockOnChange}
			/>,
		);

		// Initial call from useEffect
		expect(mockOnChange).toHaveBeenCalled();
		mockOnChange.mockClear();

		const titleInput = screen.getByTestId("block-title-input");
		fireEvent.change(titleInput, { target: { value: "Dinner" } });

		expect(mockOnChange).toHaveBeenCalledWith(
			expect.objectContaining({ title: "Dinner" }),
		);
	});

	it("sets description to undefined when empty string", () => {
		const block: ScheduleBlock = {
			id: "test-1",
			title: "Ceremony",
			description: "Some description",
			order: 0,
		};

		render(
			<ScheduleBlockEditor
				block={block}
				onSave={mockOnSave}
				onCancel={mockOnCancel}
			/>,
		);

		const descInput = screen.getByTestId("block-description-input");
		fireEvent.change(descInput, { target: { value: "" } });

		const saveButton = screen.getByTestId("block-save-button");
		fireEvent.click(saveButton);

		expect(mockOnSave).toHaveBeenCalledWith({
			title: "Ceremony",
			time: undefined,
			description: undefined,
		});
	});
});
