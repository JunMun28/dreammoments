import { createFileRoute } from "@tanstack/react-router";
import { FabricCanvas } from "@/components/editor";

export const Route = createFileRoute("/canvas-editor")({
	component: CanvasEditorPage,
});

/**
 * Canvas Editor test page for testing CE-001 through CE-025 features.
 * This route provides direct access to the FabricCanvas component.
 */
function CanvasEditorPage() {
	return (
		<div className="h-screen w-screen">
			<FabricCanvas />
		</div>
	);
}
