import { useEffect, useState } from "react";

type KeyboardShortcutActions = {
	onUndo: () => void;
	onRedo: () => void;
	onSave: () => void;
	onCollapsePanel: () => void;
	onExpandPanel: () => void;
	onTogglePreview: () => void;
};

export function useKeyboardShortcuts(
	actions: KeyboardShortcutActions,
	options: { enabled: boolean },
) {
	const [showHelp, setShowHelp] = useState(false);

	useEffect(() => {
		if (!options.enabled) return;

		function isTextInput(el: EventTarget | null): boolean {
			if (!el || !(el instanceof HTMLElement)) return false;
			const tag = el.tagName;
			return (
				tag === "INPUT" ||
				tag === "TEXTAREA" ||
				tag === "SELECT" ||
				el.isContentEditable
			);
		}

		function handler(e: KeyboardEvent) {
			if (isTextInput(e.target)) return;

			const mod = e.metaKey || e.ctrlKey;

			// Cmd/Ctrl+Z - Undo
			if (mod && !e.shiftKey && e.key === "z") {
				e.preventDefault();
				actions.onUndo();
				return;
			}

			// Cmd/Ctrl+Shift+Z - Redo
			if (mod && e.shiftKey && e.key === "z") {
				e.preventDefault();
				actions.onRedo();
				return;
			}

			// Cmd/Ctrl+S - Force save
			if (mod && e.key === "s") {
				e.preventDefault();
				actions.onSave();
				return;
			}

			// Cmd/Ctrl+P - Toggle preview
			if (mod && e.key === "p") {
				e.preventDefault();
				actions.onTogglePreview();
				return;
			}

			// [ - Collapse panel
			if (e.key === "[" && !mod) {
				actions.onCollapsePanel();
				return;
			}

			// ] - Expand panel
			if (e.key === "]" && !mod) {
				actions.onExpandPanel();
				return;
			}

			// ? - Show shortcuts help
			if (e.key === "?" && !mod) {
				setShowHelp((prev) => !prev);
			}
		}

		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, [options.enabled, actions]);

	return { showHelp, setShowHelp };
}
