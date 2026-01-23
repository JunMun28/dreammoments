import {
	ChevronDown,
	ChevronUp,
	Eye,
	EyeOff,
	Image,
	Lock,
	Square,
	Type,
	Unlock,
} from "lucide-react";
import { useCallback, useState } from "react";
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
} from "@/components/ui/context-menu";

/**
 * Layer information for display in the LayersPanel
 */
export interface LayerInfo {
	/** Unique identifier for the layer (fabric object id or generated) */
	id: string;
	/** Fabric.js object type (e.g., 'rect', 'i-text', 'image') */
	type: string;
	/** Display name for the layer */
	name: string;
	/** Whether the layer is visible on canvas */
	visible: boolean;
	/** Whether the layer is locked (cannot be moved/edited) */
	locked: boolean;
}

interface LayersPanelProps {
	/** Array of layer info, ordered by z-index (highest first) */
	layers: LayerInfo[];
	/** Currently selected layer ID */
	selectedLayerId: string | null;
	/** Callback when a layer is clicked to select it */
	onLayerSelect: (layerId: string) => void;
	/** Callback to toggle layer visibility */
	onToggleVisibility: (layerId: string) => void;
	/** Callback to toggle layer lock state */
	onToggleLock: (layerId: string) => void;
	/** Callback when layer is dragged to new position */
	onReorderLayers: (layerId: string, newIndex: number) => void;
	/** Callback to bring layer to front (top z-index) */
	onBringToFront?: (layerId: string) => void;
	/** Callback to send layer to back (bottom z-index) */
	onSendToBack?: (layerId: string) => void;
	/** Callback to move layer one step forward */
	onBringForward?: (layerId: string) => void;
	/** Callback to move layer one step backward */
	onSendBackward?: (layerId: string) => void;
}

/**
 * Get icon component based on layer type
 */
function getLayerIcon(type: string) {
	switch (type) {
		case "i-text":
		case "text":
			return Type;
		case "image":
			return Image;
		case "rect":
		case "rectangle":
			return Square;
		default:
			return Square;
	}
}

/**
 * LayersPanel component for managing canvas layer z-index.
 * Implements CE-014 requirements:
 * - Lists all elements by z-index (top to bottom)
 * - Shows element type icon and name/preview
 * - Click to select, eye icon for visibility, lock icon for locking
 * - Drag rows to reorder z-index
 * - Context menu for z-index operations
 */
export function LayersPanel({
	layers,
	selectedLayerId,
	onLayerSelect,
	onToggleVisibility,
	onToggleLock,
	onReorderLayers,
	onBringToFront,
	onSendToBack,
	onBringForward,
	onSendBackward,
}: LayersPanelProps) {
	const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
	// Track which layer has context menu open (for potential future use)
	const [_contextMenuLayerId, setContextMenuLayerId] = useState<string | null>(
		null,
	);

	const handleDragStart = useCallback(
		(e: React.DragEvent<HTMLButtonElement>, layerId: string) => {
			e.dataTransfer.setData("text/plain", layerId);
			e.dataTransfer.effectAllowed = "move";
		},
		[],
	);

	const handleDragOver = useCallback(
		(e: React.DragEvent<HTMLButtonElement>, index: number) => {
			e.preventDefault();
			setDragOverIndex(index);
		},
		[],
	);

	const handleDragLeave = useCallback(() => {
		setDragOverIndex(null);
	}, []);

	const handleDrop = useCallback(
		(e: React.DragEvent<HTMLButtonElement>, targetIndex: number) => {
			e.preventDefault();
			const draggedLayerId = e.dataTransfer.getData("text/plain");
			setDragOverIndex(null);
			onReorderLayers(draggedLayerId, targetIndex);
		},
		[onReorderLayers],
	);

	const handleContextMenu = useCallback(
		(_e: React.MouseEvent, layerId: string) => {
			setContextMenuLayerId(layerId);
		},
		[],
	);

	return (
		<div className="flex h-full flex-col border-t bg-white">
			{/* Panel header */}
			<div className="flex items-center justify-between border-b px-3 py-2">
				<h3 className="text-sm font-medium text-stone-700">Layers</h3>
			</div>

			{/* Layer list */}
			<div className="flex-1 overflow-y-auto p-2">
				{layers.length === 0 ? (
					<div className="py-4 text-center text-sm text-stone-400">
						No layers
					</div>
				) : (
					<div className="flex flex-col gap-1">
						{layers.map((layer, index) => {
							const IconComponent = getLayerIcon(layer.type);
							const isSelected = selectedLayerId === layer.id;
							const isDragOver = dragOverIndex === index;

							return (
								<ContextMenu key={layer.id}>
									<ContextMenuTrigger asChild>
										<div
											role="button"
											tabIndex={0}
											data-testid={`layer-row-${layer.id}`}
											draggable
											aria-label={`Layer: ${layer.name}`}
											onClick={() => onLayerSelect(layer.id)}
											onKeyDown={(e) => {
												if (e.key === "Enter" || e.key === " ") {
													e.preventDefault();
													onLayerSelect(layer.id);
												}
											}}
											onDragStart={(e) =>
												handleDragStart(
													e as unknown as React.DragEvent<HTMLButtonElement>,
													layer.id,
												)
											}
											onDragOver={(e) =>
												handleDragOver(
													e as unknown as React.DragEvent<HTMLButtonElement>,
													index,
												)
											}
											onDragLeave={handleDragLeave}
											onDrop={(e) =>
												handleDrop(
													e as unknown as React.DragEvent<HTMLButtonElement>,
													index,
												)
											}
											onContextMenu={(e) => handleContextMenu(e, layer.id)}
											className={`flex w-full cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors ${
												isSelected
													? "bg-blue-50 text-blue-700"
													: "hover:bg-stone-50"
											} ${!layer.visible ? "opacity-50" : ""} ${
												isDragOver ? "border-t-2 border-blue-400" : ""
											}`}
										>
											{/* Layer type icon */}
											<span
												data-testid={`layer-icon-${layer.id}`}
												className="flex h-5 w-5 items-center justify-center text-stone-500"
											>
												<IconComponent className="h-4 w-4" />
											</span>

											{/* Layer name */}
											<span className="flex-1 truncate">{layer.name}</span>

											{/* Visibility toggle */}
											<button
												type="button"
												data-testid={`visibility-toggle-${layer.id}`}
												aria-label={layer.visible ? "Hide layer" : "Show layer"}
												onClick={(e) => {
													e.stopPropagation();
													onToggleVisibility(layer.id);
												}}
												className="rounded p-0.5 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
											>
												{layer.visible ? (
													<Eye className="h-4 w-4" />
												) : (
													<EyeOff className="h-4 w-4" />
												)}
											</button>

											{/* Lock toggle */}
											<button
												type="button"
												data-testid={`lock-toggle-${layer.id}`}
												data-locked={layer.locked ? "true" : "false"}
												aria-label={
													layer.locked ? "Unlock layer" : "Lock layer"
												}
												onClick={(e) => {
													e.stopPropagation();
													onToggleLock(layer.id);
												}}
												className={`rounded p-0.5 hover:bg-stone-100 ${
													layer.locked
														? "text-stone-600"
														: "text-stone-400 hover:text-stone-600"
												}`}
											>
												{layer.locked ? (
													<Lock className="h-4 w-4" />
												) : (
													<Unlock className="h-4 w-4" />
												)}
											</button>
										</div>
									</ContextMenuTrigger>

									{/* Context menu for z-index operations */}
									<ContextMenuContent>
										<ContextMenuItem
											onClick={() => onBringToFront?.(layer.id)}
											className="flex items-center gap-2"
										>
											<ChevronUp className="h-4 w-4" />
											Bring to Front
										</ContextMenuItem>
										<ContextMenuItem
											onClick={() => onBringForward?.(layer.id)}
											className="flex items-center gap-2"
										>
											<ChevronUp className="h-4 w-4" />
											Bring Forward
										</ContextMenuItem>
										<ContextMenuItem
											onClick={() => onSendBackward?.(layer.id)}
											className="flex items-center gap-2"
										>
											<ChevronDown className="h-4 w-4" />
											Send Backward
										</ContextMenuItem>
										<ContextMenuItem
											onClick={() => onSendToBack?.(layer.id)}
											className="flex items-center gap-2"
										>
											<ChevronDown className="h-4 w-4" />
											Send to Back
										</ContextMenuItem>
									</ContextMenuContent>
								</ContextMenu>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
