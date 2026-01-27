import { createFileRoute, redirect } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import type { SavedElementData } from "@/lib/collection-server";
import type { EditorMode } from "@/lib/invitation-server";

interface BuilderSearch {
	template?: string;
}

export const Route = createFileRoute("/builder")({
	component: CanvasEditorPage,
	validateSearch: (search: Record<string, unknown>): BuilderSearch => ({
		template: typeof search.template === "string" ? search.template : undefined,
	}),
	loaderDeps: ({ search }) => ({ template: search.template }),
	beforeLoad: async ({ search }) => {
		const { getSession } = await import("@/lib/auth");
		const result = await getSession();

		if (!result.data?.user) {
			const loginParams = search.template
				? { template: search.template }
				: undefined;
			throw redirect({
				to: "/login",
				search: loginParams,
			});
		}

		return { user: result.data.user };
	},
	loader: async ({ context, deps }) => {
		// Use loader-specific server functions that accept user info directly.
		// These don't re-check auth (which fails during SSR cookie forwarding)
		// since beforeLoad already verified authentication.
		const { syncUserFromNeonAuth } = await import("@/lib/user-sync");
		const {
			getExistingInvitationForLoader,
			getOrCreateInvitationForLoader,
			getInvitationWithRelationsForLoader,
		} = await import("@/lib/invitation-server");

		const { user } = context;
		const { template } = deps;

		const localUser = await syncUserFromNeonAuth({
			data: {
				neonAuthId: user.id,
				email: user.email,
			},
		});

		// PRD-005: If no template is provided, check if user has an existing invitation
		// If not, redirect to landing page for template selection
		if (!template) {
			const existingInvitation = await getExistingInvitationForLoader({
				data: { userId: localUser.id },
			});

			if (!existingInvitation) {
				// No existing invitation and no template selected - redirect to landing page
				throw redirect({
					to: "/",
				});
			}

			// User has existing invitation - load it
			const invitation = await getInvitationWithRelationsForLoader({
				data: { invitationId: existingInvitation.id },
			});

			if (!invitation) {
				throw new Error("Failed to load invitation");
			}

			return { invitation };
		}

		// Template provided - create/get invitation with template
		const { id: invitationId } = await getOrCreateInvitationForLoader({
			data: {
				userId: localUser.id,
				templateId: template,
			},
		});

		const invitation = await getInvitationWithRelationsForLoader({
			data: { invitationId },
		});

		if (!invitation) {
			throw new Error("Failed to load invitation");
		}

		return { invitation };
	},
});

/**
 * Canvas Editor page for canvas-based invitation editing.
 */
function CanvasEditorPage() {
	const [activeTool, setActiveTool] = useState<CanvasEditorTool>("sections");
	const [selection, setSelection] = useState<CanvasSelectionInfo | null>(null);
	const [editorMode, setEditorMode] = useState<EditorMode>("structured");
	const [pendingPropertyUpdate, setPendingPropertyUpdate] =
		useState<PropertyUpdate | null>(null);
	const [pendingAddTextStyle, setPendingAddTextStyle] =
		useState<TextStyleDefinition | null>(null);
	const [pendingAddWidget, setPendingAddWidget] =
		useState<WidgetDefinition | null>(null);
	const [, setPendingAddAsset] = useState<AssetDefinition | null>(null);
	const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
		null,
	);
	const [layers, setLayers] = useState<LayerInfo[]>([]);
	const [pendingLayerOperation, setPendingLayerOperation] =
		useState<LayerOperation | null>(null);
	const [pages, setPages] = useState<PageInfo[]>([
		{ id: "page-1", name: "Page 1", thumbnailUrl: null, order: 0 },
	]);
	const [currentPageId, setCurrentPageId] = useState("page-1");

	// Saved elements state for personal collection (G9)
	const [savedElements, setSavedElements] = useState<SavedElementData[]>([]);
	const [isLoadingCollection, setIsLoadingCollection] = useState(true);

	// Load saved elements on mount
	useEffect(() => {
		const loadSavedElements = async () => {
			try {
				const { getSavedElements } = await import("@/lib/collection-server");
				const elements = await getSavedElements();
				setSavedElements(elements);
			} catch (error) {
				console.error("Failed to load saved elements:", error);
			} finally {
				setIsLoadingCollection(false);
			}
		};
		loadSavedElements();
	}, []);

	// Editor mode handler
	const handleEditorModeChange = useCallback((mode: EditorMode) => {
		setEditorMode(mode);
		console.log("Editor mode changed to:", mode);
	}, []);

	// Property change handlers
	const handlePropertyChange = useCallback(
		(property: string, value: unknown) => {
			setPendingPropertyUpdate({ property, value });
		},
		[],
	);

	const handlePropertyUpdateApplied = useCallback(() => {
		setPendingPropertyUpdate(null);
		setSelection((current) => (current ? { ...current } : null));
	}, []);

	// Text style handlers
	const handleAddTextStyle = useCallback((style: TextStyleDefinition) => {
		setPendingAddTextStyle(style);
	}, []);

	const handleTextStyleAdded = useCallback(() => {
		setPendingAddTextStyle(null);
	}, []);

	// Widget handlers
	const handleAddWidget = useCallback((widget: WidgetDefinition) => {
		setPendingAddWidget(widget);
	}, []);

	const handleWidgetAdded = useCallback(() => {
		setPendingAddWidget(null);
	}, []);

	// Asset handler
	const handleAddAsset = useCallback((asset: AssetDefinition) => {
		setPendingAddAsset(asset);
		console.log("Asset selected:", asset.name, asset.category);
	}, []);

	// Saved element handlers (G9 Personal Collection)
	const handleAddSavedElement = useCallback((element: SavedElementData) => {
		// TODO: Add the element to the canvas
		console.log(
			"Adding saved element to canvas:",
			element.name,
			element.elementType,
		);
	}, []);

	const handleDeleteSavedElement = useCallback(async (id: string) => {
		try {
			const { deleteSavedElement } = await import("@/lib/collection-server");
			const result = await deleteSavedElement({ data: { id } });
			if (result) {
				setSavedElements((prev) => prev.filter((el) => el.id !== id));
			}
		} catch (error) {
			console.error("Failed to delete saved element:", error);
		}
	}, []);

	// Template handlers
	const handleSelectTemplate = useCallback(
		(template: TemplateDefinition | null) => {
			setSelectedTemplateId(template?.id ?? null);
		},
		[],
	);

	const handleApplyTemplate = useCallback((template: TemplateDefinition) => {
		console.log(
			"Applying template:",
			template.name,
			template.elements.length,
			"elements",
		);
		setSelectedTemplateId(null);
	}, []);

	// Layers handlers - consolidated factory pattern
	const createLayerHandler = useCallback(
		(type: LayerOperation["type"]) => (layerId: string, newIndex?: number) => {
			setPendingLayerOperation({
				type,
				layerId,
				...(newIndex !== undefined && { newIndex }),
			});
		},
		[],
	);

	const layerHandlers = useMemo(
		() => ({
			onLayerSelect: createLayerHandler("select"),
			onToggleVisibility: createLayerHandler("toggleVisibility"),
			onToggleLock: createLayerHandler("toggleLock"),
			onReorderLayers: createLayerHandler("reorder"),
			onBringToFront: createLayerHandler("bringToFront"),
			onSendToBack: createLayerHandler("sendToBack"),
			onBringForward: createLayerHandler("bringForward"),
			onSendBackward: createLayerHandler("sendBackward"),
		}),
		[createLayerHandler],
	);

	const selectedLayerId =
		selection && layers.length > 0
			? layers.find((l) => l.name === "Rectangle" || l.name.includes("Text"))
					?.id || null
			: null;

	const handleLayersChange = useCallback((newLayers: LayerInfo[]) => {
		setLayers(newLayers);
	}, []);

	const handleLayerOperationApplied = useCallback(() => {
		setPendingLayerOperation(null);
	}, []);

	// Page handlers
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

	const handleDeletePage = useCallback(
		(pageId: string) => {
			if (pages.length <= 1) return;

			setPages((prev) => {
				const filtered = prev.filter((p) => p.id !== pageId);
				return filtered.map((p, i) => ({ ...p, order: i }));
			});

			if (pageId === currentPageId) {
				const remaining = pages.filter((p) => p.id !== pageId);
				if (remaining.length > 0) {
					setCurrentPageId(remaining[0].id);
				}
			}
		},
		[pages, currentPageId],
	);

	const handleReorderPages = useCallback((pageId: string, newIndex: number) => {
		setPages((prev) => {
			const pagesCopy = [...prev];
			const sourceIndex = pagesCopy.findIndex((p) => p.id === pageId);
			if (sourceIndex === -1) return prev;

			const [movedPage] = pagesCopy.splice(sourceIndex, 1);
			pagesCopy.splice(newIndex, 0, movedPage);

			return pagesCopy.map((p, i) => ({ ...p, order: i }));
		});
	}, []);

	const handlePageSelect = useCallback((pageId: string) => {
		setCurrentPageId(pageId);
	}, []);

	// Content panel mapping for cleaner rendering
	const contentPanelMap: Partial<Record<CanvasEditorTool, React.ReactNode>> = {
		templates: (
			<TemplatesPanel
				onSelectTemplate={handleSelectTemplate}
				onApplyTemplate={handleApplyTemplate}
				selectedTemplateId={selectedTemplateId}
			/>
		),
		text: <TextStylesPanel onAddTextStyle={handleAddTextStyle} />,
		components: (
			<ComponentsPanel
				onAddWidget={handleAddWidget}
				onAddSavedElement={handleAddSavedElement}
				savedElements={savedElements}
				onDeleteSavedElement={handleDeleteSavedElement}
				isLoadingCollection={isLoadingCollection}
			/>
		),
		assets: <AssetsPanel onAddAsset={handleAddAsset} />,
		settings: (
			<SettingsPanel
				currentMode={editorMode}
				onModeChange={handleEditorModeChange}
			/>
		),
	};

	const renderContentPanel = () => {
		const panel = contentPanelMap[activeTool];
		if (panel) return panel;

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
				<div className="flex flex-1 overflow-hidden">
					{/* Left Tool Sidebar */}
					<aside className="w-14 flex-shrink-0 border-r bg-white">
						<CanvasToolSidebar
							activeTool={activeTool}
							onToolChange={setActiveTool}
						/>
					</aside>

					{/* Content Browser Panel */}
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

					{/* Right Panel: Properties + Layers */}
					<aside className="hidden w-72 flex-shrink-0 flex-col border-l bg-white lg:flex">
						<div className="flex-1 overflow-y-auto">
							<CanvasPropertiesPanel
								selection={selection}
								onPropertyChange={handlePropertyChange}
							/>
						</div>
						<div className="h-64 flex-shrink-0">
							<LayersPanel
								layers={layers}
								selectedLayerId={selectedLayerId}
								{...layerHandlers}
							/>
						</div>
					</aside>
				</div>

				{/* Bottom Panel: Page Thumbnails */}
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
