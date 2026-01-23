import {
	ActiveSelection,
	Canvas,
	type FabricObject,
	IText,
	Rect,
} from "fabric";
import {
	AlertCircle,
	Check,
	Loader2,
	Maximize,
	Minus,
	Plus,
	Redo2,
	Square,
	Trash2,
	Type,
	Undo2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CanvasSelectionInfo } from "./CanvasPropertiesPanel";

/**
 * Default canvas dimensions (matches mobile-first invitation layout)
 */
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 700;

/**
 * Zoom configuration for CE-002
 */
const ZOOM_MIN = 0.5; // 50%
const ZOOM_MAX = 2.0; // 200%
const ZOOM_STEP = 0.1; // 10% per click
const ZOOM_PRESETS = [0.5, 0.8, 1.0, 1.5, 2.0]; // 50%, 80%, 100%, 150%, 200%

/**
 * History configuration for CE-003 (undo/redo)
 */
const HISTORY_MAX_SIZE = 50;

/**
 * CE-016: Save status for auto-save indicator
 */
export type SaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * CE-016: Debounce delay for auto-save (1 second)
 */
const AUTO_SAVE_DEBOUNCE_MS = 1000;

/**
 * Simple debounce utility function
 */
function debounce<T extends (...args: Parameters<T>) => void>(
	fn: T,
	delay: number,
): { (...args: Parameters<T>): void; cancel: () => void } {
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	const debouncedFn = (...args: Parameters<T>) => {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}
		timeoutId = setTimeout(() => {
			fn(...args);
			timeoutId = null;
		}, delay);
	};

	debouncedFn.cancel = () => {
		if (timeoutId) {
			clearTimeout(timeoutId);
			timeoutId = null;
		}
	};

	return debouncedFn;
}

/**
 * CE-011: Property update request from properties panel
 */
export interface PropertyUpdate {
	property: string;
	value: unknown;
}

interface FabricCanvasProps {
	/** Callback when canvas selection changes (CE-010) */
	onSelectionChange?: (selection: CanvasSelectionInfo | null) => void;
	/** CE-016: Initial canvas data to restore on mount */
	initialCanvasData?: string | null;
	/** CE-016: Callback when canvas changes (for auto-save) */
	onCanvasChange?: (canvasJson: string) => Promise<void>;
	/** CE-011: Property update to apply to selected object */
	pendingPropertyUpdate?: PropertyUpdate | null;
	/** CE-011: Callback when property update is applied */
	onPropertyUpdateApplied?: () => void;
}

/**
 * FabricCanvas component for canvas-based invitation editing.
 * Implements CE-001 requirements:
 * - Fabric.js canvas with basic element rendering
 * - Drag, resize, and rotate capabilities
 * - Selection with transform handles
 */
export function FabricCanvas({
	onSelectionChange,
	initialCanvasData,
	onCanvasChange,
	pendingPropertyUpdate,
	onPropertyUpdateApplied,
}: FabricCanvasProps = {}) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const fabricRef = useRef<Canvas | null>(null);
	const [selectedObject, setSelectedObject] = useState<FabricObject | null>(
		null,
	);
	const [zoomLevel, setZoomLevel] = useState(1.0); // CE-002: Zoom state

	// CE-003: History state for undo/redo
	const historyRef = useRef<string[]>([]);
	const historyIndexRef = useRef(-1);
	const isRestoringRef = useRef(false);
	const [canUndo, setCanUndo] = useState(false);
	const [canRedo, setCanRedo] = useState(false);

	// CE-004: Clipboard for copy/paste operations
	const clipboardRef = useRef<FabricObject | null>(null);

	// CE-016: Save status for auto-save indicator
	const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

	// CE-016: Debounced auto-save function
	const debouncedSave = useMemo(() => {
		if (!onCanvasChange) return null;

		return debounce(async (canvasJson: string) => {
			setSaveStatus("saving");
			try {
				await onCanvasChange(canvasJson);
				setSaveStatus("saved");
				// Reset to idle after 2 seconds
				setTimeout(() => setSaveStatus("idle"), 2000);
			} catch (error) {
				console.error("Failed to save canvas:", error);
				setSaveStatus("error");
				// Keep error visible for 5 seconds
				setTimeout(() => setSaveStatus("idle"), 5000);
			}
		}, AUTO_SAVE_DEBOUNCE_MS);
	}, [onCanvasChange]);

	// CE-016: Cleanup debounce on unmount
	useEffect(() => {
		return () => {
			debouncedSave?.cancel();
		};
	}, [debouncedSave]);

	/**
	 * CE-003: Save current canvas state to history
	 * CE-016: Also triggers debounced auto-save
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

		// CE-016: Trigger debounced auto-save
		debouncedSave?.(json);
	}, [debouncedSave]);

	// Initialize Fabric.js canvas on mount
	useEffect(() => {
		if (!canvasRef.current) return;

		// Create Fabric.js canvas instance
		const fabricCanvas = new Canvas(canvasRef.current, {
			width: CANVAS_WIDTH,
			height: CANVAS_HEIGHT,
			backgroundColor: "#ffffff",
			selection: true,
			preserveObjectStacking: true,
		});

		// Store reference for cleanup and operations
		fabricRef.current = fabricCanvas;

		// Selection event handlers
		const handleSelectionCreated = () => {
			const active = fabricCanvas.getActiveObject();
			setSelectedObject(active || null);
		};

		const handleSelectionUpdated = () => {
			const active = fabricCanvas.getActiveObject();
			setSelectedObject(active || null);
		};

		const handleSelectionCleared = () => {
			setSelectedObject(null);
		};

		// Register selection events
		fabricCanvas.on("selection:created", handleSelectionCreated);
		fabricCanvas.on("selection:updated", handleSelectionUpdated);
		fabricCanvas.on("selection:cleared", handleSelectionCleared);

		// Cleanup on unmount
		return () => {
			fabricCanvas.off("selection:created", handleSelectionCreated);
			fabricCanvas.off("selection:updated", handleSelectionUpdated);
			fabricCanvas.off("selection:cleared", handleSelectionCleared);
			fabricCanvas.dispose();
			fabricRef.current = null;
		};
	}, []);

	// CE-016: Restore initial canvas data on mount
	useEffect(() => {
		if (!fabricRef.current || !initialCanvasData) return;

		isRestoringRef.current = true;
		const canvas = fabricRef.current;

		canvas.loadFromJSON(JSON.parse(initialCanvasData)).then(() => {
			canvas.requestRenderAll();
			isRestoringRef.current = false;
			// Clear history and save restored state as initial
			historyRef.current = [];
			historyIndexRef.current = -1;
			saveHistoryState();
		});
	}, [initialCanvasData, saveHistoryState]);

	// CE-010: Notify parent of selection changes
	useEffect(() => {
		if (onSelectionChange) {
			if (selectedObject) {
				const info: CanvasSelectionInfo = {
					type: selectedObject.type || "object",
					object: selectedObject,
				};
				// Add count for multi-selection
				if (selectedObject.type === "activeselection") {
					const selection = selectedObject as ActiveSelection;
					info.count = selection.getObjects().length;
				}
				onSelectionChange(info);
			} else {
				onSelectionChange(null);
			}
		}
	}, [selectedObject, onSelectionChange]);

	// CE-011: Apply property updates from properties panel
	useEffect(() => {
		if (!pendingPropertyUpdate || !fabricRef.current) return;

		const canvas = fabricRef.current;
		const active = canvas.getActiveObject();

		if (!active) {
			onPropertyUpdateApplied?.();
			return;
		}

		const { property, value } = pendingPropertyUpdate;

		// Handle toggle properties for image (flipX, flipY)
		if (property === "flipX" || property === "flipY") {
			const currentValue = active.get(property as keyof typeof active);
			active.set(property as keyof typeof active, !currentValue);
		} else {
			// Standard property update
			active.set(property as keyof typeof active, value);
		}

		active.setCoords();
		canvas.requestRenderAll();
		saveHistoryState();
		onPropertyUpdateApplied?.();
	}, [pendingPropertyUpdate, onPropertyUpdateApplied, saveHistoryState]);

	// CE-003: Set up history tracking for canvas changes
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
	}, [saveHistoryState]);

	/**
	 * Add a rectangle element to the canvas
	 */
	const handleAddRectangle = useCallback(() => {
		if (!fabricRef.current) return;

		const rect = new Rect({
			left: 100,
			top: 100,
			width: 150,
			height: 100,
			fill: "#c4a373",
			stroke: "#8b7355",
			strokeWidth: 2,
			cornerColor: "#3b82f6",
			cornerStrokeColor: "#1d4ed8",
			cornerSize: 10,
			transparentCorners: false,
			borderColor: "#3b82f6",
		});

		fabricRef.current.add(rect);
		fabricRef.current.setActiveObject(rect);
		fabricRef.current.requestRenderAll();
	}, []);

	/**
	 * Add a text element to the canvas
	 */
	const handleAddText = useCallback(() => {
		if (!fabricRef.current) return;

		const text = new IText("Sample Text", {
			left: 100,
			top: 100,
			fontSize: 24,
			fontFamily: "serif",
			fill: "#292524",
			cornerColor: "#3b82f6",
			cornerStrokeColor: "#1d4ed8",
			cornerSize: 10,
			transparentCorners: false,
			borderColor: "#3b82f6",
		});

		fabricRef.current.add(text);
		fabricRef.current.setActiveObject(text);
		fabricRef.current.requestRenderAll();
	}, []);

	/**
	 * Delete the currently selected object(s)
	 */
	const handleDeleteSelected = useCallback(() => {
		if (!fabricRef.current) return;

		const active = fabricRef.current.getActiveObject();
		if (!active) return;

		fabricRef.current.remove(active);
		fabricRef.current.discardActiveObject();
		fabricRef.current.requestRenderAll();
		setSelectedObject(null);
	}, []);

	/**
	 * CE-003: Undo last canvas operation
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
	}, []);

	/**
	 * CE-003: Redo previously undone operation
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
	}, []);

	/**
	 * CE-004: Copy selected element(s) to clipboard
	 */
	const handleCopy = useCallback(() => {
		if (!fabricRef.current) return;

		const active = fabricRef.current.getActiveObject();
		if (!active) return;

		// Clone the object for clipboard storage
		active.clone().then((cloned: FabricObject) => {
			clipboardRef.current = cloned;
		});
	}, []);

	/**
	 * CE-004: Paste element(s) from clipboard with offset
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
				// If it's a group of objects, add each one
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
	}, []);

	/**
	 * CE-004: Cut selected element(s) - copy then delete
	 */
	const handleCut = useCallback(() => {
		handleCopy();
		// Small delay to ensure copy completes before delete
		setTimeout(() => {
			handleDeleteSelected();
		}, 10);
	}, [handleCopy, handleDeleteSelected]);

	/**
	 * CE-004: Duplicate selected element(s) - copy then paste
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
	}, []);

	/**
	 * CE-004: Select all elements on canvas
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
	}, []);

	/**
	 * CE-004: Deselect all elements
	 */
	const handleDeselect = useCallback(() => {
		if (!fabricRef.current) return;

		fabricRef.current.discardActiveObject();
		fabricRef.current.requestRenderAll();
		setSelectedObject(null);
	}, []);

	/**
	 * CE-004: Nudge selected element by pixels
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
			saveHistoryState();
		},
		[saveHistoryState],
	);

	// CE-003 & CE-004: Keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Ignore if typing in input/textarea or editing text on canvas
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
			// CE-004: Ctrl+C or Cmd+C for copy
			else if (hasModifier && e.key === "c") {
				e.preventDefault();
				handleCopy();
			}
			// CE-004: Ctrl+V or Cmd+V for paste
			else if (hasModifier && e.key === "v") {
				e.preventDefault();
				handlePaste();
			}
			// CE-004: Ctrl+X or Cmd+X for cut
			else if (hasModifier && e.key === "x") {
				e.preventDefault();
				handleCut();
			}
			// CE-004: Ctrl+D or Cmd+D for duplicate
			else if (hasModifier && e.key === "d") {
				e.preventDefault();
				handleDuplicate();
			}
			// CE-004: Ctrl+A or Cmd+A for select all
			else if (hasModifier && e.key === "a") {
				e.preventDefault();
				handleSelectAll();
			}
			// CE-004: Delete or Backspace to remove selected element(s)
			else if (e.key === "Delete" || e.key === "Backspace") {
				e.preventDefault();
				handleDeleteSelected();
			}
			// CE-004: Escape to deselect
			else if (e.key === "Escape") {
				e.preventDefault();
				handleDeselect();
			}
			// CE-004: Arrow keys for nudging
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

	/**
	 * Get selection info text based on selected object type
	 */
	const getSelectionInfoText = () => {
		if (!selectedObject) return "Nothing selected";

		const type = selectedObject.type;
		if (type === "rect") return "Rectangle selected";
		if (type === "i-text") return "Text selected";
		return `${type} selected`;
	};

	/**
	 * CE-002: Set zoom level on the canvas
	 */
	const setZoom = useCallback((newZoom: number) => {
		if (!fabricRef.current) return;

		// Clamp zoom to valid range
		const clampedZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, newZoom));

		// Get canvas center point for zoom
		const canvas = fabricRef.current;
		const center = canvas.getCenterPoint();

		// Apply zoom centered on canvas
		canvas.zoomToPoint(center, clampedZoom);
		setZoomLevel(clampedZoom);
		canvas.requestRenderAll();
	}, []);

	/**
	 * CE-002: Zoom in by one step
	 */
	const handleZoomIn = useCallback(() => {
		setZoom(zoomLevel + ZOOM_STEP);
	}, [zoomLevel, setZoom]);

	/**
	 * CE-002: Zoom out by one step
	 */
	const handleZoomOut = useCallback(() => {
		setZoom(zoomLevel - ZOOM_STEP);
	}, [zoomLevel, setZoom]);

	/**
	 * CE-002: Set zoom to a specific preset value
	 */
	const handleZoomPreset = useCallback(
		(preset: number) => {
			setZoom(preset);
		},
		[setZoom],
	);

	/**
	 * CE-002: Fit canvas to screen (reset to 100% centered view)
	 */
	const handleFitToScreen = useCallback(() => {
		if (!fabricRef.current) return;

		const canvas = fabricRef.current;

		// Reset zoom to 100%
		setZoom(1.0);

		// Reset viewport transform to center
		canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
		canvas.requestRenderAll();
	}, [setZoom]);

	return (
		<div className="relative flex h-full flex-col bg-stone-200">
			{/* Toolbar */}
			<div className="flex items-center gap-2 border-b bg-white p-2">
				<Button
					variant="outline"
					size="sm"
					onClick={handleAddRectangle}
					className="gap-2"
				>
					<Square className="h-4 w-4" />
					Add Rectangle
				</Button>

				<Button
					variant="outline"
					size="sm"
					onClick={handleAddText}
					className="gap-2"
				>
					<Type className="h-4 w-4" />
					Add Text
				</Button>

				<div className="mx-2 h-6 w-px bg-stone-200" />

				<Button
					variant="outline"
					size="sm"
					onClick={handleDeleteSelected}
					disabled={!selectedObject}
					className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 disabled:text-stone-400"
				>
					<Trash2 className="h-4 w-4" />
					Delete
				</Button>

				<div className="mx-2 h-6 w-px bg-stone-200" />

				{/* CE-003: Undo/Redo controls */}
				<div className="flex items-center gap-1" data-testid="history-controls">
					<Button
						variant="outline"
						size="icon"
						onClick={handleUndo}
						disabled={!canUndo}
						className="h-8 w-8"
						aria-label="Undo (Ctrl+Z)"
						title="Undo (Ctrl+Z)"
					>
						<Undo2 className="h-4 w-4" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						onClick={handleRedo}
						disabled={!canRedo}
						className="h-8 w-8"
						aria-label="Redo (Ctrl+Shift+Z)"
						title="Redo (Ctrl+Shift+Z)"
					>
						<Redo2 className="h-4 w-4" />
					</Button>
				</div>

				<div className="mx-2 h-6 w-px bg-stone-200" />

				{/* CE-002: Zoom controls */}
				<div className="flex items-center gap-1" data-testid="zoom-controls">
					<Button
						variant="outline"
						size="icon"
						onClick={handleZoomOut}
						disabled={zoomLevel <= ZOOM_MIN}
						className="h-8 w-8"
						aria-label="Zoom out"
					>
						<Minus className="h-4 w-4" />
					</Button>

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="outline"
								size="sm"
								className="min-w-[60px] font-mono"
								data-testid="zoom-level"
							>
								{Math.round(zoomLevel * 100)}%
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="center">
							{ZOOM_PRESETS.map((preset) => (
								<DropdownMenuItem
									key={preset}
									onClick={() => handleZoomPreset(preset)}
									className={zoomLevel === preset ? "bg-stone-100" : ""}
								>
									{Math.round(preset * 100)}%
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>

					<Button
						variant="outline"
						size="icon"
						onClick={handleZoomIn}
						disabled={zoomLevel >= ZOOM_MAX}
						className="h-8 w-8"
						aria-label="Zoom in"
					>
						<Plus className="h-4 w-4" />
					</Button>

					<Button
						variant="outline"
						size="icon"
						onClick={handleFitToScreen}
						className="h-8 w-8"
						aria-label="Fit to screen"
					>
						<Maximize className="h-4 w-4" />
					</Button>
				</div>

				{/* CE-016: Save status indicator */}
				{onCanvasChange && saveStatus !== "idle" && (
					<div
						data-testid="save-status"
						className="flex items-center gap-1 text-sm"
					>
						{saveStatus === "saving" && (
							<>
								<Loader2 className="h-4 w-4 animate-spin text-stone-500" />
								<span className="text-stone-500">Saving...</span>
							</>
						)}
						{saveStatus === "saved" && (
							<>
								<Check className="h-4 w-4 text-green-600" />
								<span className="text-green-600">Saved</span>
							</>
						)}
						{saveStatus === "error" && (
							<>
								<AlertCircle className="h-4 w-4 text-red-600" />
								<span className="text-red-600">Error</span>
							</>
						)}
					</div>
				)}

				{/* Selection info */}
				<div
					data-testid="selection-info"
					className="ml-auto text-sm text-stone-500"
				>
					{getSelectionInfoText()}
				</div>
			</div>

			{/* Canvas viewport */}
			<div className="flex flex-1 items-center justify-center overflow-auto p-8">
				<div className="rounded-lg bg-white shadow-2xl">
					<canvas
						ref={canvasRef}
						data-testid="fabric-canvas"
						width={CANVAS_WIDTH}
						height={CANVAS_HEIGHT}
					/>
				</div>
			</div>
		</div>
	);
}
