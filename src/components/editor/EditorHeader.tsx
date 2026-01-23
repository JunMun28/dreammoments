import { Link } from "@tanstack/react-router";
import { ArrowLeft, Eye, LogOut, Redo, Undo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInvitationBuilder } from "@/contexts/InvitationBuilderContext";
import type { AutosaveStatus } from "@/hooks/useAutosave";
import { cn } from "@/lib/utils";

interface EditorHeaderProps {
	/** Callback when preview button is clicked */
	onPreview?: () => void;
	/** Callback when exit button is clicked */
	onExit?: () => void;
}

/**
 * Autosave status indicator with animation
 */
function AutosaveIndicator({ status }: { status: AutosaveStatus }) {
	return (
		<div
			className={cn(
				"flex items-center gap-2 text-sm transition-opacity duration-200",
				status === "idle" && "opacity-0",
			)}
		>
			{status === "saving" && (
				<>
					<div className="h-2 w-2 animate-pulse rounded-full bg-yellow-500" />
					<span className="text-muted-foreground">Saving...</span>
				</>
			)}
			{status === "saved" && (
				<>
					<div className="h-2 w-2 rounded-full bg-green-500" />
					<span className="text-muted-foreground">Saved</span>
				</>
			)}
			{status === "error" && (
				<>
					<div className="h-2 w-2 rounded-full bg-red-500" />
					<span className="text-destructive">Failed to save</span>
				</>
			)}
		</div>
	);
}

/**
 * Editor header with logo, navigation, autosave status, and actions.
 */
export function EditorHeader({ onPreview, onExit }: EditorHeaderProps) {
	const { autosaveStatus, invitation } = useInvitationBuilder();

	return (
		<div className="flex h-14 items-center justify-between px-4">
			{/* Left section: Logo and back navigation */}
			<div className="flex items-center gap-4">
				<Link
					to="/"
					className="flex items-center gap-2 text-stone-600 transition-colors hover:text-stone-900"
				>
					<ArrowLeft className="h-4 w-4" />
					<span className="hidden text-sm font-medium sm:inline">Back</span>
				</Link>

				<div className="h-6 w-px bg-stone-200" />

				<span className="text-lg font-semibold text-stone-800">
					{invitation.partner1Name && invitation.partner2Name
						? `${invitation.partner1Name} & ${invitation.partner2Name}`
						: "Untitled Invitation"}
				</span>
			</div>

			{/* Center section: Undo/Redo (placeholder for future) */}
			<div className="hidden items-center gap-1 md:flex">
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8"
					disabled
					title="Undo (coming soon)"
				>
					<Undo className="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					className="h-8 w-8"
					disabled
					title="Redo (coming soon)"
				>
					<Redo className="h-4 w-4" />
				</Button>
			</div>

			{/* Right section: Autosave status and actions */}
			<div className="flex items-center gap-4">
				<AutosaveIndicator status={autosaveStatus} />

				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={onPreview}
						className="gap-2"
					>
						<Eye className="h-4 w-4" />
						<span className="hidden sm:inline">Preview</span>
					</Button>

					<Button
						variant="ghost"
						size="sm"
						onClick={onExit}
						className="gap-2 text-stone-600 hover:text-stone-900"
					>
						<LogOut className="h-4 w-4" />
						<span className="hidden sm:inline">Exit</span>
					</Button>
				</div>
			</div>
		</div>
	);
}
