// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { InlineTextEditor } from "./InlineTextEditor";

function makeBlock(text: string) {
	return {
		id: "block-1",
		type: "text" as const,
		content: { text },
		position: { x: 0, y: 0 },
		size: { width: 200, height: 40 },
		zIndex: 0,
		locked: false,
		sectionId: "s1",
	};
}

describe("InlineTextEditor", () => {
	beforeEach(() => {
		vi.stubGlobal(
			"requestAnimationFrame",
			(callback: FrameRequestCallback) => {
				callback(0);
				return 1;
			},
		);
		vi.stubGlobal("cancelAnimationFrame", vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	test("renders contentEditable with initial text", () => {
		render(
			<InlineTextEditor
				block={makeBlock("Hello")}
				onCommit={vi.fn()}
				onCancel={vi.fn()}
			/>,
		);

		const editor = screen.getByRole("textbox");
		expect(editor.getAttribute("contenteditable")).toBe("true");
		expect(editor.textContent).toBe("Hello");
	});

	test("calls onCancel on Escape when not composing", () => {
		const onCancel = vi.fn();
		render(
			<InlineTextEditor
				block={makeBlock("Hello")}
				onCommit={vi.fn()}
				onCancel={onCancel}
			/>,
		);

		const editor = screen.getByRole("textbox");
		fireEvent.keyDown(editor, { key: "Escape" });
		expect(onCancel).toHaveBeenCalledOnce();
	});

	test("does not call onCancel on Escape during IME composition", () => {
		const onCancel = vi.fn();
		render(
			<InlineTextEditor
				block={makeBlock("Hello")}
				onCommit={vi.fn()}
				onCancel={onCancel}
			/>,
		);

		const editor = screen.getByRole("textbox");
		fireEvent.compositionStart(editor);
		fireEvent.keyDown(editor, { key: "Escape" });
		expect(onCancel).not.toHaveBeenCalled();
	});

	test("commits on blur with DOM textContent", () => {
		const onCommit = vi.fn();
		render(
			<InlineTextEditor
				block={makeBlock("Hello")}
				onCommit={onCommit}
				onCancel={vi.fn()}
			/>,
		);

		const editor = screen.getByRole("textbox");
		// Simulate editing the DOM content directly (like IME would)
		editor.textContent = "  Updated text  ";
		fireEvent.blur(editor);
		expect(onCommit).toHaveBeenCalledWith("Updated text");
	});

	test("committedRef prevents double-fire from blur after Enter", () => {
		const onCommit = vi.fn();
		render(
			<InlineTextEditor
				block={makeBlock("Hello")}
				onCommit={onCommit}
				onCancel={vi.fn()}
				singleLine
			/>,
		);

		const editor = screen.getByRole("textbox");
		fireEvent.keyDown(editor, { key: "Enter" });
		// First commit from Enter
		expect(onCommit).toHaveBeenCalledOnce();

		// Blur should NOT fire a second commit
		fireEvent.blur(editor);
		expect(onCommit).toHaveBeenCalledOnce();
	});
});
