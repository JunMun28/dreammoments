import { Canvas, type FabricObject, IText, Rect } from "fabric";
import { Square, Trash2, Type } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Default canvas dimensions (matches mobile-first invitation layout)
 */
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 700;

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
	 * Get selection info text based on selected object type
	 */
	const getSelectionInfoText = () => {
		if (!selectedObject) return "Nothing selected";

		const type = selectedObject.type;
		if (type === "rect") return "Rectangle selected";
		if (type === "i-text") return "Text selected";
		return `${type} selected`;
	};

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
