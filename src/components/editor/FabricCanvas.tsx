import {
	type ActiveSelection,
	Canvas,
	type FabricObject,
	type IText,
} from "fabric";
import {
	AlertCircle,
	Check,
	Download,
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
import { MobilePreviewFrame, MobilePreviewToggle } from "./MobilePreviewFrame";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAlignmentGuides } from "@/hooks/useAlignmentGuides";
import { useCanvasClipboard } from "@/hooks/useCanvasClipboard";
import { useCanvasHistory } from "@/hooks/useCanvasHistory";
import { useCanvasKeyboardShortcuts } from "@/hooks/useCanvasKeyboardShortcuts";
import { useCanvasZoom, ZOOM_PRESETS } from "@/hooks/useCanvasZoom";
import {
	createRectangle,
	createStyledText,
	createTextElement,
	createWidgetGroup,
} from "@/lib/canvas-widgets";
import { CanvasContextMenu } from "./CanvasContextMenu";
import type { CanvasSelectionInfo } from "./CanvasPropertiesPanel";
import type { WidgetDefinition } from "./ComponentsPanel";
import { ExportDialog } from "./ExportDialog";
import type { LayerInfo } from "./LayersPanel";
import type { TextStyleDefinition } from "./TextStylesPanel";

/**
 * Default canvas dimensions (matches mobile-first invitation layout)
 */
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 700;

/**
 * CE-016: Debounce delay for auto-save (1 second)
 */
const AUTO_SAVE_DEBOUNCE_MS = 1000;

/**
 * CE-016: Save status for auto-save indicator
 */
export type SaveStatus = "idle" | "saving" | "saved" | "error";

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

/**
 * CE-014: Layer operation types
 */
export interface LayerOperation {
	type:
		| "select"
		| "toggleVisibility"
		| "toggleLock"
		| "reorder"
		| "bringToFront"
		| "sendToBack"
		| "bringForward"
		| "sendBackward"
		| "rename";
	layerId: string;
	newIndex?: number;
	/** G12: New name for rename operation */
	newName?: string;
}

interface FabricCanvasProps {
	onSelectionChange?: (selection: CanvasSelectionInfo | null) => void;
	initialCanvasData?: string | null;
	onCanvasChange?: (canvasJson: string) => Promise<void>;
	pendingPropertyUpdate?: PropertyUpdate | null;
	onPropertyUpdateApplied?: () => void;
	pendingAddTextStyle?: TextStyleDefinition | null;
	onTextStyleAdded?: () => void;
	onLayersChange?: (layers: LayerInfo[]) => void;
	pendingLayerOperation?: LayerOperation | null;
	onLayerOperationApplied?: () => void;
	pendingAddWidget?: WidgetDefinition | null;
	onWidgetAdded?: () => void;
	/** CE-027: Canvas height in pixels (default 700) */
	canvasHeight?: number;
}

/**
 * FabricCanvas component for canvas-based invitation editing.
 * Implements CE-001 through CE-025 requirements.
 */
export function FabricCanvas({
	onSelectionChange,
	initialCanvasData,
	onCanvasChange,
	pendingPropertyUpdate,
	onPropertyUpdateApplied,
	pendingAddTextStyle,
	onTextStyleAdded,
	onLayersChange,
	pendingLayerOperation,
	onLayerOperationApplied,
	pendingAddWidget,
	onWidgetAdded,
	canvasHeight = CANVAS_HEIGHT,
}: FabricCanvasProps = {}) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const fabricRef = useRef<Canvas | null>(null);
	const [selectedObject, setSelectedObject] = useState<FabricObject | null>(
		null,
	);
	const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
	const [_layerUpdateCounter, setLayerUpdateCounter] = useState(0);
	const [showExportDialog, setShowExportDialog] = useState(false);
	const [hasClipboard, setHasClipboard] = useState(false);
	const [showPhoneFrame, setShowPhoneFrame] = useState(false);

	// CE-016: Debounced auto-save function
	const debouncedSave = useMemo(() => {
		if (!onCanvasChange) return null;

		return debounce(async (canvasJson: string) => {
			setSaveStatus("saving");
			try {
				await onCanvasChange(canvasJson);
				setSaveStatus("saved");
				setTimeout(() => setSaveStatus("idle"), 2000);
			} catch (error) {
				console.error("Failed to save canvas:", error);
				setSaveStatus("error");
				setTimeout(() => setSaveStatus("idle"), 5000);
			}
		}, AUTO_SAVE_DEBOUNCE_MS);
	}, [onCanvasChange]);

	// Cleanup debounce on unmount
	useEffect(() => {
		return () => {
			debouncedSave?.cancel();
		};
	}, [debouncedSave]);

	// Use extracted hooks
	const {
		canUndo,
		canRedo,
		handleUndo,
		handleRedo,
		saveHistoryState,
		clearHistory,
		setRestoring,
	} = useCanvasHistory(fabricRef, {
		onStateChange: debouncedSave ?? undefined,
	});

	const {
		zoomLevel,
		handleZoomIn,
		handleZoomOut,
		handleZoomPreset,
		handleFitToScreen,
		isMinZoom,
		isMaxZoom,
	} = useCanvasZoom(fabricRef);

	const {
		handleCopy: handleCopyInternal,
		handlePaste,
		handleCut: handleCutInternal,
		handleDuplicate,
		handleDeleteSelected,
		handleSelectAll,
		handleDeselect,
		handleNudge,
	} = useCanvasClipboard(fabricRef, { onHistorySave: saveHistoryState });

	// CE-026: Wrap clipboard functions to track clipboard state
	const handleCopy = useCallback(() => {
		handleCopyInternal();
		setHasClipboard(true);
	}, [handleCopyInternal]);

	const handleCut = useCallback(() => {
		handleCutInternal();
		setHasClipboard(true);
	}, [handleCutInternal]);

	// Alignment guides hook
	const { handleObjectMoving, handleObjectModified } = useAlignmentGuides(
		fabricRef,
		{
			canvasWidth: CANVAS_WIDTH,
			canvasHeight,
		},
	);

	// Keyboard shortcuts hook
	useCanvasKeyboardShortcuts(fabricRef, {
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
	});

	/**
	 * CE-014: Generate layer info from canvas objects
	 * G12: Include customName for renamed layers
	 */
	const generateLayers = useCallback((): LayerInfo[] => {
		if (!fabricRef.current) return [];

		const canvas = fabricRef.current;
		const objects = canvas.getObjects();

		return [...objects].reverse().map((obj, index) => {
			const extObj = obj as FabricObject & {
				layerId?: string;
				customName?: string;
			};
			const objId = extObj.layerId || `layer-${objects.length - 1 - index}`;

			let name = "Object";
			if (obj.type === "i-text" || obj.type === "text") {
				const textObj = obj as IText;
				name = textObj.text?.slice(0, 20) || "Text";
				if (textObj.text && textObj.text.length > 20) name += "...";
			} else if (obj.type === "rect") {
				name = "Rectangle";
			} else if (obj.type === "image") {
				name = "Image";
			} else if (obj.type) {
				name = obj.type.charAt(0).toUpperCase() + obj.type.slice(1);
			}

			return {
				id: objId,
				type: obj.type || "object",
				name,
				customName: extObj.customName,
				visible: obj.visible !== false,
				locked: obj.selectable === false || obj.evented === false,
			};
		});
	}, []);

	// Report layers when canvas changes
	useEffect(() => {
		if (onLayersChange && fabricRef.current) {
			const layers = generateLayers();
			onLayersChange(layers);
		}
	}, [onLayersChange, generateLayers]);

	// Handle layer operations
	useEffect(() => {
		if (!pendingLayerOperation || !fabricRef.current) return;

		const canvas = fabricRef.current;
		const objects = canvas.getObjects();
		const { type, layerId, newIndex, newName } = pendingLayerOperation;

		const layerIndex = parseInt(layerId.replace("layer-", ""), 10);
		const obj = objects[layerIndex];

		if (!obj && type !== "reorder") {
			onLayerOperationApplied?.();
			return;
		}

		const layerOperations: Record<string, () => void> = {
			select: () => {
				if (obj) {
					canvas.setActiveObject(obj);
					canvas.requestRenderAll();
				}
			},
			toggleVisibility: () => {
				if (obj) {
					obj.visible = !obj.visible;
					canvas.requestRenderAll();
					setLayerUpdateCounter((c) => c + 1);
				}
			},
			toggleLock: () => {
				if (obj) {
					const isLocked = obj.selectable === false;
					obj.selectable = isLocked;
					obj.evented = isLocked;
					obj.lockMovementX = !isLocked;
					obj.lockMovementY = !isLocked;
					canvas.requestRenderAll();
					setLayerUpdateCounter((c) => c + 1);
				}
			},
			bringToFront: () => {
				if (obj) {
					canvas.bringObjectToFront(obj);
					canvas.requestRenderAll();
					setLayerUpdateCounter((c) => c + 1);
					saveHistoryState();
				}
			},
			sendToBack: () => {
				if (obj) {
					canvas.sendObjectToBack(obj);
					canvas.requestRenderAll();
					setLayerUpdateCounter((c) => c + 1);
					saveHistoryState();
				}
			},
			bringForward: () => {
				if (obj) {
					canvas.bringObjectForward(obj);
					canvas.requestRenderAll();
					setLayerUpdateCounter((c) => c + 1);
					saveHistoryState();
				}
			},
			sendBackward: () => {
				if (obj) {
					canvas.sendObjectBackwards(obj);
					canvas.requestRenderAll();
					setLayerUpdateCounter((c) => c + 1);
					saveHistoryState();
				}
			},
			reorder: () => {
				if (newIndex !== undefined) {
					const sourceObj = objects[layerIndex];
					if (sourceObj) {
						const targetCanvasIndex = objects.length - 1 - newIndex;
						canvas.remove(sourceObj);
						const updatedObjects = canvas.getObjects();
						const insertIndex = Math.min(
							targetCanvasIndex,
							updatedObjects.length,
						);
						canvas.insertAt(insertIndex, sourceObj);
						canvas.requestRenderAll();
						setLayerUpdateCounter((c) => c + 1);
						saveHistoryState();
					}
				}
			},
			// G12: Rename layer
			rename: () => {
				if (obj && newName) {
					(obj as FabricObject & { customName?: string }).customName = newName;
					canvas.requestRenderAll();
					setLayerUpdateCounter((c) => c + 1);
					saveHistoryState();
				}
			},
		};

		layerOperations[type]?.();
		onLayerOperationApplied?.();
	}, [pendingLayerOperation, onLayerOperationApplied, saveHistoryState]);

	// Initialize Fabric.js canvas on mount
	useEffect(() => {
		if (!canvasRef.current) return;

		const fabricCanvas = new Canvas(canvasRef.current, {
			width: CANVAS_WIDTH,
			height: canvasHeight,
			backgroundColor: "#ffffff",
			selection: true,
			preserveObjectStacking: true,
		});

		fabricRef.current = fabricCanvas;

		const handleSelectionCreated = () => {
			setSelectedObject(fabricCanvas.getActiveObject() || null);
		};
		const handleSelectionUpdated = () => {
			setSelectedObject(fabricCanvas.getActiveObject() || null);
		};
		const handleSelectionCleared = () => {
			setSelectedObject(null);
		};

		fabricCanvas.on("selection:created", handleSelectionCreated);
		fabricCanvas.on("selection:updated", handleSelectionUpdated);
		fabricCanvas.on("selection:cleared", handleSelectionCleared);

		return () => {
			fabricCanvas.off("selection:created", handleSelectionCreated);
			fabricCanvas.off("selection:updated", handleSelectionUpdated);
			fabricCanvas.off("selection:cleared", handleSelectionCleared);
			fabricCanvas.dispose();
			fabricRef.current = null;
		};
		// Note: canvasHeight is intentionally not in deps - we handle height changes separately
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [canvasHeight]);

	// CE-027: Update canvas height when prop changes
	useEffect(() => {
		if (!fabricRef.current) return;

		fabricRef.current.setHeight(canvasHeight);
		fabricRef.current.requestRenderAll();
	}, [canvasHeight]);

	// CE-024: Register alignment guide event handlers
	useEffect(() => {
		if (!fabricRef.current) return;

		const canvas = fabricRef.current;

		canvas.on("object:moving", handleObjectMoving);
		canvas.on("object:modified", handleObjectModified);
		canvas.on("mouse:up", handleObjectModified);

		return () => {
			canvas.off("object:moving", handleObjectMoving);
			canvas.off("object:modified", handleObjectModified);
			canvas.off("mouse:up", handleObjectModified);
		};
	}, [handleObjectMoving, handleObjectModified]);

	// Restore initial canvas data on mount
	useEffect(() => {
		if (!fabricRef.current || !initialCanvasData) return;

		setRestoring(true);
		const canvas = fabricRef.current;

		canvas.loadFromJSON(JSON.parse(initialCanvasData)).then(() => {
			canvas.requestRenderAll();
			setRestoring(false);
			clearHistory();
			saveHistoryState();
		});
	}, [initialCanvasData, saveHistoryState, clearHistory, setRestoring]);

	// Notify parent of selection changes
	useEffect(() => {
		if (onSelectionChange) {
			if (selectedObject) {
				const info: CanvasSelectionInfo = {
					type: selectedObject.type || "object",
					object: selectedObject,
				};
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

	// Apply property updates from properties panel
	useEffect(() => {
		if (!pendingPropertyUpdate || !fabricRef.current) return;

		const canvas = fabricRef.current;
		const active = canvas.getActiveObject();

		if (!active) {
			onPropertyUpdateApplied?.();
			return;
		}

		const { property, value } = pendingPropertyUpdate;

		if (property === "flipX" || property === "flipY") {
			const currentValue = active.get(property as keyof typeof active);
			active.set(property as keyof typeof active, !currentValue);
		} else {
			active.set(property as keyof typeof active, value);
		}

		active.setCoords();
		canvas.requestRenderAll();
		saveHistoryState();
		onPropertyUpdateApplied?.();
	}, [pendingPropertyUpdate, onPropertyUpdateApplied, saveHistoryState]);

	// Add styled text element from TextStylesPanel
	useEffect(() => {
		if (!pendingAddTextStyle || !fabricRef.current) return;

		const canvas = fabricRef.current;
		const text = createStyledText(pendingAddTextStyle);

		canvas.add(text);
		canvas.setActiveObject(text);
		canvas.requestRenderAll();
		onTextStyleAdded?.();
	}, [pendingAddTextStyle, onTextStyleAdded]);

	// Add widget to canvas
	useEffect(() => {
		if (!pendingAddWidget || !fabricRef.current) return;

		const canvas = fabricRef.current;
		const group = createWidgetGroup(pendingAddWidget);

		canvas.add(group);
		canvas.setActiveObject(group);
		canvas.requestRenderAll();
		onWidgetAdded?.();
	}, [pendingAddWidget, onWidgetAdded]);

	// Add shape handlers
	const handleAddRectangle = useCallback(() => {
		if (!fabricRef.current) return;

		const rect = createRectangle();
		fabricRef.current.add(rect);
		fabricRef.current.setActiveObject(rect);
		fabricRef.current.requestRenderAll();
	}, []);

	const handleAddText = useCallback(() => {
		if (!fabricRef.current) return;

		const text = createTextElement();
		fabricRef.current.add(text);
		fabricRef.current.setActiveObject(text);
		fabricRef.current.requestRenderAll();
	}, []);

	// Delete handler that clears selection state
	const handleDelete = useCallback(() => {
		handleDeleteSelected();
		setSelectedObject(null);
	}, [handleDeleteSelected]);

	// CE-026: Context menu lock/unlock handler
	const handleLock = useCallback(() => {
		if (!fabricRef.current) return;

		const active = fabricRef.current.getActiveObject();
		if (!active) return;

		const isLocked = active.selectable === false;
		active.selectable = isLocked;
		active.evented = isLocked;
		active.lockMovementX = !isLocked;
		active.lockMovementY = !isLocked;
		fabricRef.current.requestRenderAll();
		setLayerUpdateCounter((c) => c + 1);
		saveHistoryState();
	}, [saveHistoryState]);

	// CE-026: Context menu z-order handlers
	const handleBringToFront = useCallback(() => {
		if (!fabricRef.current) return;

		const active = fabricRef.current.getActiveObject();
		if (!active) return;

		fabricRef.current.bringObjectToFront(active);
		fabricRef.current.requestRenderAll();
		setLayerUpdateCounter((c) => c + 1);
		saveHistoryState();
	}, [saveHistoryState]);

	const handleSendToBack = useCallback(() => {
		if (!fabricRef.current) return;

		const active = fabricRef.current.getActiveObject();
		if (!active) return;

		fabricRef.current.sendObjectToBack(active);
		fabricRef.current.requestRenderAll();
		setLayerUpdateCounter((c) => c + 1);
		saveHistoryState();
	}, [saveHistoryState]);

	const handleBringForward = useCallback(() => {
		if (!fabricRef.current) return;

		const active = fabricRef.current.getActiveObject();
		if (!active) return;

		fabricRef.current.bringObjectForward(active);
		fabricRef.current.requestRenderAll();
		setLayerUpdateCounter((c) => c + 1);
		saveHistoryState();
	}, [saveHistoryState]);

	const handleSendBackward = useCallback(() => {
		if (!fabricRef.current) return;

		const active = fabricRef.current.getActiveObject();
		if (!active) return;

		fabricRef.current.sendObjectBackwards(active);
		fabricRef.current.requestRenderAll();
		setLayerUpdateCounter((c) => c + 1);
		saveHistoryState();
	}, [saveHistoryState]);

	// CE-026: Check if selected object is locked
	const isSelectedLocked = useMemo(() => {
		return selectedObject?.selectable === false;
	}, [selectedObject]);

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
					onClick={handleDelete}
					disabled={!selectedObject}
					className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 disabled:text-stone-400"
				>
					<Trash2 className="h-4 w-4" />
					Delete
				</Button>

				<div className="mx-2 h-6 w-px bg-stone-200" />

				{/* Undo/Redo controls */}
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

				{/* Zoom controls */}
				<div className="flex items-center gap-1" data-testid="zoom-controls">
					<Button
						variant="outline"
						size="icon"
						onClick={handleZoomOut}
						disabled={isMinZoom}
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
						disabled={isMaxZoom}
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

				{/* Save status indicator */}
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

				{/* G2: Phone preview toggle */}
				<MobilePreviewToggle
					isActive={showPhoneFrame}
					onToggle={() => setShowPhoneFrame(!showPhoneFrame)}
				/>

				{/* Export button */}
				<Button
					variant="outline"
					size="sm"
					onClick={() => setShowExportDialog(true)}
					className="ml-auto gap-2"
				>
					<Download className="h-4 w-4" />
					Export
				</Button>

				{/* Selection info */}
				<div data-testid="selection-info" className="text-sm text-stone-500">
					{getSelectionInfoText()}
				</div>
			</div>

			{/* Canvas viewport */}
			<div className="flex flex-1 items-center justify-center overflow-auto p-8">
				<MobilePreviewFrame showFrame={showPhoneFrame} variant="dark">
					<CanvasContextMenu
						onCopy={handleCopy}
						onPaste={handlePaste}
						onCut={handleCut}
						onDuplicate={handleDuplicate}
						onDelete={handleDelete}
						onSelectAll={handleSelectAll}
						onLock={handleLock}
						onBringToFront={handleBringToFront}
						onSendToBack={handleSendToBack}
						onBringForward={handleBringForward}
						onSendBackward={handleSendBackward}
						hasSelection={!!selectedObject}
						isLocked={isSelectedLocked}
						hasClipboard={hasClipboard}
					>
						<div
							className={showPhoneFrame ? "" : "rounded-lg bg-white shadow-2xl"}
						>
							<canvas
								ref={canvasRef}
								data-testid="fabric-canvas"
								width={CANVAS_WIDTH}
								height={canvasHeight}
							/>
						</div>
					</CanvasContextMenu>
				</MobilePreviewFrame>
			</div>

			{/* Export dialog */}
			<ExportDialog
				open={showExportDialog}
				onOpenChange={setShowExportDialog}
				canvasRef={fabricRef}
			/>
		</div>
	);
}
