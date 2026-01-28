import type { Canvas } from "fabric";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * History configuration for CE-003 (undo/redo)
 */
const HISTORY_MAX_SIZE = 50;

interface UseCanvasHistoryOptions {
	/** Callback when canvas state changes (for auto-save) */
	onStateChange?: (canvasJson: string) => void;
}

/**
 * Hook for managing undo/redo history on a Fabric.js canvas.
 * Provides history state management and undo/redo operations.
 */
export function useCanvasHistory(
	fabricRef: React.MutableRefObject<Canvas | null>,
	options: UseCanvasHistoryOptions = {},
) {
	const { onStateChange } = options;

	// History state for undo/redo
	const historyRef = useRef<string[]>([]);
	const historyIndexRef = useRef(-1);
	const isRestoringRef = useRef(false);
	const [canUndo, setCanUndo] = useState(false);
	const [canRedo, setCanRedo] = useState(false);

	/**
	 * Save current canvas state to history.
	 * Also triggers onStateChange callback for auto-save.
	 */
	const saveHistoryState = useCallback(() => {
		if (!fabricRef.current || isRestoringRef.current) return;

		const json = JSON.stringify(fabricRef.current.toJSON());
		const history = historyRef.current;
		const index = historyIndexRef.current;

		// Remove any redo states (states after current index)
		if (index < history.length - 1) {
			history.splice(index + 1);
		}

		// Add new state
		history.push(json);

		// Limit history size
		if (history.length > HISTORY_MAX_SIZE) {
			history.shift();
		} else {
			historyIndexRef.current = history.length - 1;
		}

		// Update button states
		setCanUndo(historyIndexRef.current > 0);
		setCanRedo(false);

		// Trigger auto-save callback
		onStateChange?.(json);
	}, [fabricRef, onStateChange]);

	/**
	 * Undo last canvas operation
	 */
	const handleUndo = useCallback(() => {
		if (!fabricRef.current || historyIndexRef.current <= 0) return;

		isRestoringRef.current = true;
		historyIndexRef.current -= 1;

		const canvas = fabricRef.current;
		const state = historyRef.current[historyIndexRef.current];

		canvas.loadFromJSON(JSON.parse(state)).then(() => {
			canvas.requestRenderAll();
			setCanUndo(historyIndexRef.current > 0);
			setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
			isRestoringRef.current = false;
		});
	}, [fabricRef]);

	/**
	 * Redo previously undone operation
	 */
	const handleRedo = useCallback(() => {
		if (
			!fabricRef.current ||
			historyIndexRef.current >= historyRef.current.length - 1
		)
			return;

		isRestoringRef.current = true;
		historyIndexRef.current += 1;

		const canvas = fabricRef.current;
		const state = historyRef.current[historyIndexRef.current];

		canvas.loadFromJSON(JSON.parse(state)).then(() => {
			canvas.requestRenderAll();
			setCanUndo(historyIndexRef.current > 0);
			setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
			isRestoringRef.current = false;
		});
	}, [fabricRef]);

	/**
	 * Clear history and reset state (useful after loading initial canvas)
	 */
	const clearHistory = useCallback(() => {
		historyRef.current = [];
		historyIndexRef.current = -1;
		setCanUndo(false);
		setCanRedo(false);
	}, []);

	/**
	 * Check if we're currently restoring a history state
	 */
	const isRestoring = useCallback(() => isRestoringRef.current, []);

	/**
	 * Set restoring flag (useful for external canvas load operations)
	 */
	const setRestoring = useCallback((value: boolean) => {
		isRestoringRef.current = value;
	}, []);

	// Set up history tracking for canvas changes
	useEffect(() => {
		if (!fabricRef.current) return;

		const canvas = fabricRef.current;

		// Save initial state
		saveHistoryState();

		// Track all object modifications for history
		const onObjectModified = () => saveHistoryState();
		const onObjectAdded = () => saveHistoryState();
		const onObjectRemoved = () => saveHistoryState();

		canvas.on("object:modified", onObjectModified);
		canvas.on("object:added", onObjectAdded);
		canvas.on("object:removed", onObjectRemoved);

		return () => {
			canvas.off("object:modified", onObjectModified);
			canvas.off("object:added", onObjectAdded);
			canvas.off("object:removed", onObjectRemoved);
		};
	}, [fabricRef, saveHistoryState]);

	return {
		canUndo,
		canRedo,
		handleUndo,
		handleRedo,
		saveHistoryState,
		clearHistory,
		isRestoring,
		setRestoring,
	};
}
