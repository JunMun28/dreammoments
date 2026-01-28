import type { Canvas, IText } from "fabric";
import { useEffect } from "react";

interface KeyboardHandlers {
	handleUndo: () => void;
	handleRedo: () => void;
	handleCopy: () => void;
	handlePaste: () => void;
	handleCut: () => void;
	handleDuplicate: () => void;
	handleSelectAll: () => void;
	handleDeleteSelected: () => void;
	handleDeselect: () => void;
	handleNudge: (
		direction: "up" | "down" | "left" | "right",
		amount: number,
	) => void;
}

/**
 * Hook for handling keyboard shortcuts on a Fabric.js canvas.
 * Provides standard shortcuts for undo/redo, clipboard operations,
 * selection, deletion, and nudging.
 */
export function useCanvasKeyboardShortcuts(
	fabricRef: React.MutableRefObject<Canvas | null>,
	handlers: KeyboardHandlers,
) {
	const {
		handleUndo,
		handleRedo,
		handleCopy,
		handlePaste,
		handleCut,
		handleDuplicate,
		handleSelectAll,
		handleDeleteSelected,
		handleDeselect,
		handleNudge,
	} = handlers;

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Ignore if typing in input/textarea
			if (
				e.target instanceof HTMLInputElement ||
				e.target instanceof HTMLTextAreaElement
			) {
				return;
			}

			// Check if currently editing text in canvas
			const activeObj = fabricRef.current?.getActiveObject();
			if (activeObj && activeObj.type === "i-text") {
				const itext = activeObj as IText;
				if (itext.isEditing) {
					return; // Let text editing handle the keypress
				}
			}

			const hasModifier = e.ctrlKey || e.metaKey;

			// Ctrl+Z or Cmd+Z for undo
			if (hasModifier && e.key === "z" && !e.shiftKey) {
				e.preventDefault();
				handleUndo();
			}
			// Ctrl+Shift+Z or Cmd+Shift+Z for redo
			else if (hasModifier && e.key === "z" && e.shiftKey) {
				e.preventDefault();
				handleRedo();
			}
			// Ctrl+Y or Cmd+Y for redo (alternative)
			else if (hasModifier && e.key === "y") {
				e.preventDefault();
				handleRedo();
			}
			// Ctrl+C or Cmd+C for copy
			else if (hasModifier && e.key === "c") {
				e.preventDefault();
				handleCopy();
			}
			// Ctrl+V or Cmd+V for paste
			else if (hasModifier && e.key === "v") {
				e.preventDefault();
				handlePaste();
			}
			// Ctrl+X or Cmd+X for cut
			else if (hasModifier && e.key === "x") {
				e.preventDefault();
				handleCut();
			}
			// Ctrl+D or Cmd+D for duplicate
			else if (hasModifier && e.key === "d") {
				e.preventDefault();
				handleDuplicate();
			}
			// Ctrl+A or Cmd+A for select all
			else if (hasModifier && e.key === "a") {
				e.preventDefault();
				handleSelectAll();
			}
			// Delete or Backspace to remove selected element(s)
			else if (e.key === "Delete" || e.key === "Backspace") {
				e.preventDefault();
				handleDeleteSelected();
			}
			// Escape to deselect
			else if (e.key === "Escape") {
				e.preventDefault();
				handleDeselect();
			}
			// Arrow keys for nudging
			else if (e.key === "ArrowUp") {
				e.preventDefault();
				handleNudge("up", e.shiftKey ? 10 : 1);
			} else if (e.key === "ArrowDown") {
				e.preventDefault();
				handleNudge("down", e.shiftKey ? 10 : 1);
			} else if (e.key === "ArrowLeft") {
				e.preventDefault();
				handleNudge("left", e.shiftKey ? 10 : 1);
			} else if (e.key === "ArrowRight") {
				e.preventDefault();
				handleNudge("right", e.shiftKey ? 10 : 1);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [
		fabricRef,
		handleUndo,
		handleRedo,
		handleCopy,
		handlePaste,
		handleCut,
		handleDuplicate,
		handleSelectAll,
		handleDeleteSelected,
		handleDeselect,
		handleNudge,
	]);
}
