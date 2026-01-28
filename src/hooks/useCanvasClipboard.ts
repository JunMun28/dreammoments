import { ActiveSelection, type Canvas, type FabricObject } from "fabric";
import { useCallback, useRef } from "react";

/**
 * Hook for managing clipboard operations on a Fabric.js canvas.
 * Provides copy, paste, cut, and duplicate functionality.
 */
export function useCanvasClipboard(
	fabricRef: React.MutableRefObject<Canvas | null>,
	options: {
		onHistorySave?: () => void;
	} = {},
) {
	const { onHistorySave } = options;
	const clipboardRef = useRef<FabricObject | null>(null);

	/**
	 * Copy selected element(s) to clipboard
	 */
	const handleCopy = useCallback(() => {
		if (!fabricRef.current) return;

		const active = fabricRef.current.getActiveObject();
		if (!active) return;

		// Clone the object for clipboard storage
		active.clone().then((cloned: FabricObject) => {
			clipboardRef.current = cloned;
		});
	}, [fabricRef]);

	/**
	 * Paste element(s) from clipboard with offset
	 */
	const handlePaste = useCallback(() => {
		if (!fabricRef.current || !clipboardRef.current) return;

		const canvas = fabricRef.current;

		clipboardRef.current.clone().then((cloned: FabricObject) => {
			canvas.discardActiveObject();

			// Offset pasted element by 10px
			cloned.set({
				left: (cloned.left || 0) + 10,
				top: (cloned.top || 0) + 10,
				evented: true,
			});

			// Handle ActiveSelection (multi-select) vs single object
			if (cloned.type === "activeselection") {
				const activeSelection = cloned as ActiveSelection;
				activeSelection.canvas = canvas;
				activeSelection.forEachObject((obj: FabricObject) => {
					canvas.add(obj);
				});
				cloned.setCoords();
			} else {
				canvas.add(cloned);
			}

			// Update clipboard offset for next paste
			clipboardRef.current?.set({
				left: (clipboardRef.current.left || 0) + 10,
				top: (clipboardRef.current.top || 0) + 10,
			});

			canvas.setActiveObject(cloned);
			canvas.requestRenderAll();
		});
	}, [fabricRef]);

	/**
	 * Delete the currently selected object(s).
	 * Handles both single selection and multi-selection (ActiveSelection).
	 */
	const handleDeleteSelected = useCallback(() => {
		if (!fabricRef.current) return;

		const active = fabricRef.current.getActiveObject();
		if (!active) return null;

		// Handle multi-selection (ActiveSelection)
		if (active instanceof ActiveSelection) {
			const objectsToRemove = active.getObjects();
			fabricRef.current.discardActiveObject();
			for (const obj of objectsToRemove) {
				fabricRef.current.remove(obj);
			}
		} else {
			fabricRef.current.remove(active);
			fabricRef.current.discardActiveObject();
		}

		fabricRef.current.requestRenderAll();
		return null; // Return null to signal selection cleared
	}, [fabricRef]);

	/**
	 * Cut selected element(s) - copy then delete
	 */
	const handleCut = useCallback(() => {
		handleCopy();
		// Small delay to ensure copy completes before delete
		setTimeout(() => {
			handleDeleteSelected();
		}, 10);
	}, [handleCopy, handleDeleteSelected]);

	/**
	 * Duplicate selected element(s) - clone and offset
	 */
	const handleDuplicate = useCallback(() => {
		if (!fabricRef.current) return;

		const active = fabricRef.current.getActiveObject();
		if (!active) return;

		const canvas = fabricRef.current;

		active.clone().then((cloned: FabricObject) => {
			canvas.discardActiveObject();

			// Offset duplicated element by 10px
			cloned.set({
				left: (cloned.left || 0) + 10,
				top: (cloned.top || 0) + 10,
				evented: true,
			});

			if (cloned.type === "activeselection") {
				const activeSelection = cloned as ActiveSelection;
				activeSelection.canvas = canvas;
				activeSelection.forEachObject((obj: FabricObject) => {
					canvas.add(obj);
				});
				cloned.setCoords();
			} else {
				canvas.add(cloned);
			}

			canvas.setActiveObject(cloned);
			canvas.requestRenderAll();
		});
	}, [fabricRef]);

	/**
	 * Select all elements on canvas
	 */
	const handleSelectAll = useCallback(() => {
		if (!fabricRef.current) return;

		const canvas = fabricRef.current;
		const objects = canvas.getObjects();

		if (objects.length === 0) return;

		if (objects.length === 1) {
			canvas.setActiveObject(objects[0]);
		} else {
			const selection = new ActiveSelection(objects, { canvas });
			canvas.setActiveObject(selection);
		}
		canvas.requestRenderAll();
	}, [fabricRef]);

	/**
	 * Deselect all elements
	 */
	const handleDeselect = useCallback(() => {
		if (!fabricRef.current) return;

		fabricRef.current.discardActiveObject();
		fabricRef.current.requestRenderAll();
	}, [fabricRef]);

	/**
	 * Nudge selected element by pixels
	 */
	const handleNudge = useCallback(
		(direction: "up" | "down" | "left" | "right", amount: number) => {
			if (!fabricRef.current) return;

			const active = fabricRef.current.getActiveObject();
			if (!active) return;

			switch (direction) {
				case "up":
					active.set("top", (active.top || 0) - amount);
					break;
				case "down":
					active.set("top", (active.top || 0) + amount);
					break;
				case "left":
					active.set("left", (active.left || 0) - amount);
					break;
				case "right":
					active.set("left", (active.left || 0) + amount);
					break;
			}

			active.setCoords();
			fabricRef.current.requestRenderAll();
			onHistorySave?.();
		},
		[fabricRef, onHistorySave],
	);

	return {
		handleCopy,
		handlePaste,
		handleCut,
		handleDuplicate,
		handleDeleteSelected,
		handleSelectAll,
		handleDeselect,
		handleNudge,
	};
}
