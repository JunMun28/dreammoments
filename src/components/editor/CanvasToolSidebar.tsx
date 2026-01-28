import {
	Image,
	LayoutGrid,
	Music,
	Paintbrush,
	Puzzle,
	Settings,
	Sparkles,
	Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * Canvas editor tool types for hunbei.com-style editor
 */
export type CanvasEditorTool =
	| "sections"
	| "templates"
	| "text"
	| "assets"
	| "components"
	| "background"
	| "music"
	| "settings";

/**
 * Tool definitions with icons and labels for canvas editor
 */
const canvasTools: {
	id: CanvasEditorTool;
	icon: typeof LayoutGrid;
	label: string;
}[] = [
	{ id: "sections", icon: LayoutGrid, label: "Sections" },
	{ id: "templates", icon: Sparkles, label: "Templates" },
	{ id: "text", icon: Type, label: "Text" },
	{ id: "assets", icon: Image, label: "Assets" },
	{ id: "components", icon: Puzzle, label: "Components" },
	{ id: "background", icon: Paintbrush, label: "Background" },
	{ id: "music", icon: Music, label: "Music" },
	{ id: "settings", icon: Settings, label: "Settings" },
];

interface CanvasToolSidebarProps {
	/** Currently active tool */
	activeTool: CanvasEditorTool;
	/** Callback when tool is changed */
	onToolChange: (tool: CanvasEditorTool) => void;
}

/**
 * Narrow sidebar with tool icons for canvas editor.
 * Clicking a tool switches the content browser panel.
 */
export function CanvasToolSidebar({
	activeTool,
	onToolChange,
}: CanvasToolSidebarProps) {
	return (
		<div className="flex h-full flex-col py-2">
			{canvasTools.map(({ id, icon: Icon, label }) => (
				<Tooltip key={id} delayDuration={100}>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className={cn(
								"mx-auto my-1 h-10 w-10 rounded-lg transition-colors",
								activeTool === id
									? "bg-stone-100 text-stone-900"
									: "text-stone-500 hover:bg-stone-50 hover:text-stone-700",
							)}
							onClick={() => onToolChange(id)}
						>
							<Icon className="h-5 w-5" />
							<span className="sr-only">{label}</span>
						</Button>
					</TooltipTrigger>
					<TooltipContent side="right" sideOffset={8}>
						{label}
					</TooltipContent>
				</Tooltip>
			))}
		</div>
	);
}
