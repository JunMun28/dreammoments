import { describe, expect, test } from "vitest";

// Simple unit tests for hook existence
// Note: Full integration tests for hooks require jsdom environment
// These tests verify that the hook files can be imported

describe("editor hooks", () => {
	test("useMediaQuery module exists", async () => {
		// This will throw if the module doesn't exist
		const module = await import("../components/editor/hooks/useMediaQuery");
		expect(typeof module.useMediaQuery).toBe("function");
	});

	test("useFocusTrap module exists", async () => {
		const module = await import("../components/editor/hooks/useFocusTrap");
		expect(typeof module.useFocusTrap).toBe("function");
	});

	test("useKeyboardShortcuts module exists", async () => {
		const module = await import(
			"../components/editor/hooks/useKeyboardShortcuts"
		);
		expect(typeof module.useKeyboardShortcuts).toBe("function");
	});

	test("useEditorState module exists", async () => {
		const module = await import("../components/editor/hooks/useEditorState");
		expect(typeof module.useEditorState).toBe("function");
	});

	test("useAutoSave module exists", async () => {
		const module = await import("../components/editor/hooks/useAutoSave");
		expect(typeof module.useAutoSave).toBe("function");
	});

	test("useFieldValidation module exists", async () => {
		const module = await import(
			"../components/editor/hooks/useFieldValidation"
		);
		expect(typeof module.useFieldValidation).toBe("function");
	});
});
