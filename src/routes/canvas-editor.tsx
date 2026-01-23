import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import {
	type CanvasEditorTool,
	CanvasPropertiesPanel,
	type CanvasSelectionInfo,
	CanvasToolSidebar,
	ComponentsPanel,
	FabricCanvas,
	type LayerInfo,
	type LayerOperation,
	LayersPanel,
	type PropertyUpdate,
	type TextStyleDefinition,
	TextStylesPanel,
	type WidgetDefinition,
} from "@/components/editor";
import { TooltipProvider } from "@/components/ui/tooltip";

export const Route = createFileRoute("/canvas-editor")({
	component: CanvasEditorPage,
});

/**
 * Canvas Editor test page for testing CE-001 through CE-025 features.
 * This route provides direct access to the FabricCanvas component
 * alongside the CanvasToolSidebar (CE-005) and CanvasPropertiesPanel (CE-010).
 */
function CanvasEditorPage() {
	const [activeTool, setActiveTool] = useState<CanvasEditorTool>("sections");
	const [selection, setSelection] = useState<CanvasSelectionInfo | null>(null);

	// CE-011: Property update state for bi-directional communication
	const [pendingPropertyUpdate, setPendingPropertyUpdate] =
		useState<PropertyUpdate | null>(null);

	// CE-011: Handle property changes from the properties panel
	const handlePropertyChange = useCallback(
		(property: string, value: unknown) => {
			setPendingPropertyUpdate({ property, value });
		},
		[],
	);

	// CE-011: Clear pending property update after canvas applies it
	const handlePropertyUpdateApplied = useCallback(() => {
		setPendingPropertyUpdate(null);
		// Refresh selection to update properties panel with new values
		setSelection((current) => (current ? { ...current } : null));
	}, []);

	// CE-008: Text style state for adding styled text from TextStylesPanel
	const [pendingAddTextStyle, setPendingAddTextStyle] =
		useState<TextStyleDefinition | null>(null);

	// CE-008: Handle text style selection from TextStylesPanel
	const handleAddTextStyle = useCallback((style: TextStyleDefinition) => {
		setPendingAddTextStyle(style);
	}, []);

	// CE-008: Clear pending text style after canvas adds it
	const handleTextStyleAdded = useCallback(() => {
		setPendingAddTextStyle(null);
	}, []);

	// CE-007: Widget state for adding widgets from ComponentsPanel
	// Note: pendingAddWidget will be used when CE-020-023 widget rendering is implemented
	const [_pendingAddWidget, setPendingAddWidget] =
		useState<WidgetDefinition | null>(null);

	// CE-007: Handle widget selection from ComponentsPanel
	const handleAddWidget = useCallback((widget: WidgetDefinition) => {
		setPendingAddWidget(widget);
		// TODO: CE-020-023 will implement actual widget rendering on canvas
		console.log("Widget selected:", widget.name);
	}, []);

	// CE-014: Layers panel state
	const [layers, setLayers] = useState<LayerInfo[]>([]);
	const [pendingLayerOperation, setPendingLayerOperation] =
		useState<LayerOperation | null>(null);

	// CE-014: Get selected layer ID from selection
	const selectedLayerId =
		selection && layers.length > 0
			? layers.find((l) => l.name === "Rectangle" || l.name.includes("Text"))
					?.id || null
			: null;

	// CE-014: Handle layers change from FabricCanvas
	const handleLayersChange = useCallback((newLayers: LayerInfo[]) => {
		setLayers(newLayers);
	}, []);

	// CE-014: Handle layer operation applied
	const handleLayerOperationApplied = useCallback(() => {
		setPendingLayerOperation(null);
	}, []);

	// CE-014: Layer panel callbacks
	const handleLayerSelect = useCallback((layerId: string) => {
		setPendingLayerOperation({ type: "select", layerId });
	}, []);

	const handleToggleVisibility = useCallback((layerId: string) => {
		setPendingLayerOperation({ type: "toggleVisibility", layerId });
	}, []);

	const handleToggleLock = useCallback((layerId: string) => {
		setPendingLayerOperation({ type: "toggleLock", layerId });
	}, []);

	const handleReorderLayers = useCallback(
		(layerId: string, newIndex: number) => {
			setPendingLayerOperation({ type: "reorder", layerId, newIndex });
		},
		[],
	);

	const handleBringToFront = useCallback((layerId: string) => {
		setPendingLayerOperation({ type: "bringToFront", layerId });
	}, []);

	const handleSendToBack = useCallback((layerId: string) => {
		setPendingLayerOperation({ type: "sendToBack", layerId });
	}, []);

	const handleBringForward = useCallback((layerId: string) => {
		setPendingLayerOperation({ type: "bringForward", layerId });
	}, []);

	const handleSendBackward = useCallback((layerId: string) => {
		setPendingLayerOperation({ type: "sendBackward", layerId });
	}, []);

	/**
	 * CE-008: Render the content browser panel based on active tool
	 */
	const renderContentPanel = () => {
		if (activeTool === "text") {
			return <TextStylesPanel onAddTextStyle={handleAddTextStyle} />;
		}

		if (activeTool === "components") {
			return <ComponentsPanel onAddWidget={handleAddWidget} />;
		}

		// Placeholder for other tools (CE-006, CE-009)
		return (
			<div className="text-sm text-stone-500">
				<h3 className="mb-2 font-medium text-stone-700">
					{activeTool.charAt(0).toUpperCase() + activeTool.slice(1)}
				</h3>
				<p>Content panel for: {activeTool}</p>
				<p className="mt-2 text-xs text-stone-400">
					(CE-006, CE-009: Content browser panels)
				</p>
			</div>
		);
	};

	return (
		<TooltipProvider>
			<div className="flex h-screen w-screen">
				{/* Left Tool Sidebar (CE-005) */}
				<aside className="w-14 flex-shrink-0 border-r bg-white">
					<CanvasToolSidebar
						activeTool={activeTool}
						onToolChange={setActiveTool}
					/>
				</aside>

				{/* Content Browser Panel (CE-006 to CE-009) */}
				<aside className="hidden w-64 flex-shrink-0 overflow-y-auto border-r bg-white p-4 lg:block">
					{renderContentPanel()}
				</aside>

				{/* Central Canvas */}
				<main className="flex-1 overflow-hidden">
					<FabricCanvas
						onSelectionChange={setSelection}
						pendingPropertyUpdate={pendingPropertyUpdate}
						onPropertyUpdateApplied={handlePropertyUpdateApplied}
						pendingAddTextStyle={pendingAddTextStyle}
						onTextStyleAdded={handleTextStyleAdded}
						onLayersChange={handleLayersChange}
						pendingLayerOperation={pendingLayerOperation}
						onLayerOperationApplied={handleLayerOperationApplied}
					/>
				</main>

				{/* Right Panel: Properties + Layers (CE-010, CE-011, CE-014) */}
				<aside className="hidden w-72 flex-shrink-0 flex-col border-l bg-white lg:flex">
					{/* Properties Panel */}
					<div className="flex-1 overflow-y-auto">
						<CanvasPropertiesPanel
							selection={selection}
							onPropertyChange={handlePropertyChange}
						/>
					</div>
					{/* Layers Panel (CE-014) */}
					<div className="h-64 flex-shrink-0">
						<LayersPanel
							layers={layers}
							selectedLayerId={selectedLayerId}
							onLayerSelect={handleLayerSelect}
							onToggleVisibility={handleToggleVisibility}
							onToggleLock={handleToggleLock}
							onReorderLayers={handleReorderLayers}
							onBringToFront={handleBringToFront}
							onSendToBack={handleSendToBack}
							onBringForward={handleBringForward}
							onSendBackward={handleSendBackward}
						/>
					</div>
				</aside>
			</div>
		</TooltipProvider>
	);
}
