import { Canvas, type FabricObject, IText, Rect } from "fabric";
import {
	Maximize,
	Minus,
	Plus,
	Redo2,
	Square,
	Trash2,
	Type,
	Undo2,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
 * FabricCanvas component for canvas-based invitation editing.
 * Implements CE-001 requirements:
 * - Fabric.js canvas with basic element rendering
 * - Drag, resize, and rotate capabilities
 * - Selection with transform handles
 */
export function FabricCanvas() {
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

	/**
	 * CE-003: Save current canvas state to history
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
	}, []);

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
		if (!fabricRef.current || !selectedObject) return;

		fabricRef.current.remove(selectedObject);
		fabricRef.current.discardActiveObject();
		fabricRef.current.requestRenderAll();
		setSelectedObject(null);
	}, [selectedObject]);

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

	// CE-003: Keyboard shortcuts for undo/redo
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Ignore if typing in input/textarea
			if (
				e.target instanceof HTMLInputElement ||
				e.target instanceof HTMLTextAreaElement
			) {
				return;
			}

			// Ctrl+Z or Cmd+Z for undo
			if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
				e.preventDefault();
				handleUndo();
			}
			// Ctrl+Shift+Z or Cmd+Shift+Z for redo
			else if ((e.ctrlKey || e.metaKey) && e.key === "z" && e.shiftKey) {
				e.preventDefault();
				handleRedo();
			}
			// Ctrl+Y or Cmd+Y for redo (alternative)
			else if ((e.ctrlKey || e.metaKey) && e.key === "y") {
				e.preventDefault();
				handleRedo();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleUndo, handleRedo]);

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
