import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import {
	type AssetDefinition,
	AssetsPanel,
	type CanvasEditorTool,
	CanvasPropertiesPanel,
	type CanvasSelectionInfo,
	CanvasToolSidebar,
	ComponentsPanel,
	FabricCanvas,
	type LayerInfo,
	type LayerOperation,
	LayersPanel,
	type PageInfo,
	PageThumbnailsPanel,
	type PropertyUpdate,
	SettingsPanel,
	type TemplateDefinition,
	TemplatesPanel,
	type TextStyleDefinition,
	TextStylesPanel,
	type WidgetDefinition,
} from "@/components/editor";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { EditorMode } from "@/lib/invitation-server";

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

	// CE-019: Editor mode state
	const [editorMode, setEditorMode] = useState<EditorMode>("structured");

	// CE-019: Handle editor mode change
	const handleEditorModeChange = useCallback((mode: EditorMode) => {
		setEditorMode(mode);
		// In real implementation, this would call updateEditorMode server function
		console.log("Editor mode changed to:", mode);
	}, []);

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

	// CE-007/CE-020-023: Widget state for adding widgets from ComponentsPanel
	const [pendingAddWidget, setPendingAddWidget] =
		useState<WidgetDefinition | null>(null);

	// CE-007: Handle widget selection from ComponentsPanel
	const handleAddWidget = useCallback((widget: WidgetDefinition) => {
		setPendingAddWidget(widget);
	}, []);

	// CE-020-023: Clear pending widget after canvas adds it
	const handleWidgetAdded = useCallback(() => {
		setPendingAddWidget(null);
	}, []);

	// CE-009: Asset state for adding assets from AssetsPanel
	// Note: pendingAddAsset will be used to add image elements to canvas
	const [_pendingAddAsset, setPendingAddAsset] =
		useState<AssetDefinition | null>(null);

	// CE-009: Handle asset selection from AssetsPanel
	const handleAddAsset = useCallback((asset: AssetDefinition) => {
		setPendingAddAsset(asset);
		// TODO: Add asset as image element to canvas via FabricCanvas
		console.log("Asset selected:", asset.name, asset.category);
	}, []);

	// CE-006: Template state for previewing and applying templates
	const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
		null,
	);

	// CE-006: Handle template selection (opens preview dialog)
	const handleSelectTemplate = useCallback(
		(template: TemplateDefinition | null) => {
			setSelectedTemplateId(template?.id ?? null);
		},
		[],
	);

	// CE-006: Handle template apply (loads elements onto canvas)
	const handleApplyTemplate = useCallback((template: TemplateDefinition) => {
		// TODO: Load template elements onto canvas via FabricCanvas
		console.log(
			"Applying template:",
			template.name,
			template.elements.length,
			"elements",
		);
		setSelectedTemplateId(null);
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

	// CE-015: Multi-page state
	const [pages, setPages] = useState<PageInfo[]>([
		{ id: "page-1", name: "Page 1", thumbnailUrl: null, order: 0 },
	]);
	const [currentPageId, setCurrentPageId] = useState("page-1");

	// CE-015: Add a new page
	const handleAddPage = useCallback(() => {
		const newPageId = `page-${Date.now()}`;
		const newPage: PageInfo = {
			id: newPageId,
			name: `Page ${pages.length + 1}`,
			thumbnailUrl: null,
			order: pages.length,
		};
		setPages((prev) => [...prev, newPage]);
		setCurrentPageId(newPageId);
	}, [pages.length]);

	// CE-015: Delete a page
	const handleDeletePage = useCallback(
		(pageId: string) => {
			if (pages.length <= 1) return; // Don't delete last page

			setPages((prev) => {
				const filtered = prev.filter((p) => p.id !== pageId);
				// Reorder remaining pages
				return filtered.map((p, i) => ({ ...p, order: i }));
			});

			// If deleting current page, switch to first remaining page
			if (pageId === currentPageId) {
				const remaining = pages.filter((p) => p.id !== pageId);
				if (remaining.length > 0) {
					setCurrentPageId(remaining[0].id);
				}
			}
		},
		[pages, currentPageId],
	);

	// CE-015: Reorder pages
	const handleReorderPages = useCallback((pageId: string, newIndex: number) => {
		setPages((prev) => {
			const pagesCopy = [...prev];
			const sourceIndex = pagesCopy.findIndex((p) => p.id === pageId);
			if (sourceIndex === -1) return prev;

			const [movedPage] = pagesCopy.splice(sourceIndex, 1);
			pagesCopy.splice(newIndex, 0, movedPage);

			// Update order values
			return pagesCopy.map((p, i) => ({ ...p, order: i }));
		});
	}, []);

	// CE-015: Select a page
	const handlePageSelect = useCallback((pageId: string) => {
		setCurrentPageId(pageId);
	}, []);

	/**
	 * CE-006, CE-008: Render the content browser panel based on active tool
	 */
	const renderContentPanel = () => {
		if (activeTool === "templates") {
			return (
				<TemplatesPanel
					onSelectTemplate={handleSelectTemplate}
					onApplyTemplate={handleApplyTemplate}
					selectedTemplateId={selectedTemplateId}
				/>
			);
		}

		if (activeTool === "text") {
			return <TextStylesPanel onAddTextStyle={handleAddTextStyle} />;
		}

		if (activeTool === "components") {
			return <ComponentsPanel onAddWidget={handleAddWidget} />;
		}

		if (activeTool === "assets") {
			return <AssetsPanel onAddAsset={handleAddAsset} />;
		}

		// CE-019: Settings panel with editor mode toggle
		if (activeTool === "settings") {
			return (
				<SettingsPanel
					currentMode={editorMode}
					onModeChange={handleEditorModeChange}
				/>
			);
		}

		// Placeholder for other tools
		return (
			<div className="text-sm text-stone-500">
				<h3 className="mb-2 font-medium text-stone-700">
					{activeTool.charAt(0).toUpperCase() + activeTool.slice(1)}
				</h3>
				<p>Content panel for: {activeTool}</p>
			</div>
		);
	};

	return (
		<TooltipProvider>
			<div className="flex h-screen w-screen flex-col">
				{/* Main content area */}
				<div className="flex flex-1 overflow-hidden">
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
							pendingAddWidget={pendingAddWidget}
							onWidgetAdded={handleWidgetAdded}
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

				{/* Bottom Panel: Page Thumbnails (CE-015) */}
				<PageThumbnailsPanel
					pages={pages}
					currentPageId={currentPageId}
					onPageSelect={handlePageSelect}
					onAddPage={handleAddPage}
					onDeletePage={handleDeletePage}
					onReorderPages={handleReorderPages}
				/>
			</div>
		</TooltipProvider>
	);
}
