import {
	Calendar,
	Image,
	Info,
	MessageSquare,
	Palette,
	Settings,
	UserCheck,
	Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	type EditorTool,
	useInvitationBuilder,
} from "@/contexts/InvitationBuilderContext";
import { cn } from "@/lib/utils";

/**
 * Tool definitions with icons and labels
 */
const tools: { id: EditorTool; icon: typeof Info; label: string }[] = [
	{ id: "info", icon: Info, label: "Basic Info" },
	{ id: "images", icon: Image, label: "Images" },
	{ id: "theme", icon: Palette, label: "Theme" },
	{ id: "schedule", icon: Calendar, label: "Schedule" },
	{ id: "notes", icon: MessageSquare, label: "Notes" },
	{ id: "guests", icon: Users, label: "Guests" },
	{ id: "rsvp", icon: UserCheck, label: "RSVP" },
	{ id: "settings", icon: Settings, label: "Settings" },
];

/**
 * Narrow sidebar with tool icons.
 * Clicking a tool updates the active tool in editor state.
 */
export function ToolSidebar() {
	const { editorState, setActiveTool } = useInvitationBuilder();

	return (
		<div className="flex h-full flex-col py-2">
			{tools.map(({ id, icon: Icon, label }) => (
				<Tooltip key={id} delayDuration={100}>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							className={cn(
								"mx-auto my-1 h-10 w-10 rounded-lg transition-colors",
								editorState.activeTool === id
									? "bg-stone-100 text-stone-900"
									: "text-stone-500 hover:bg-stone-50 hover:text-stone-700",
							)}
							onClick={() => setActiveTool(id)}
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
