import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
	type CanvasEditorTool,
	CanvasPropertiesPanel,
	type CanvasSelectionInfo,
	CanvasToolSidebar,
	FabricCanvas,
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

				{/* Content Browser Panel - placeholder for future content panels */}
				<aside className="hidden w-64 flex-shrink-0 overflow-y-auto border-r bg-white p-4 lg:block">
					<div className="text-sm text-stone-500">
						<h3 className="mb-2 font-medium text-stone-700">
							{activeTool.charAt(0).toUpperCase() + activeTool.slice(1)}
						</h3>
						<p>Content panel for: {activeTool}</p>
						<p className="mt-2 text-xs text-stone-400">
							(CE-006 to CE-009: Content browser panels)
						</p>
					</div>
				</aside>

				{/* Central Canvas */}
				<main className="flex-1 overflow-hidden">
					<FabricCanvas onSelectionChange={setSelection} />
				</main>

				{/* Right Properties Panel (CE-010) */}
				<aside className="hidden w-72 flex-shrink-0 overflow-y-auto border-l bg-white lg:block">
					<CanvasPropertiesPanel selection={selection} />
				</aside>
			</div>
		</TooltipProvider>
	);
}
