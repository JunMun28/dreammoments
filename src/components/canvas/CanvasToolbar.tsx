import {
	Eye,
	List,
	MonitorPlay,
	PanelLeft,
	Plus,
	Redo2,
	Send,
	Undo2,
} from "lucide-react";
import type { BlockType } from "@/lib/canvas/types";

function ToolbarButton({
	label,
	onClick,
	children,
	disabled,
}: {
	label: string;
	onClick: () => void;
	children: React.ReactNode;
	disabled?: boolean;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium text-[color:var(--dm-ink)] transition-colors hover:bg-[color:var(--dm-surface-muted)] disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-[color:var(--dm-focus)] focus-visible:outline-none"
			aria-label={label}
		>
			{children}
		</button>
	);
}

function Separator() {
	return (
		<div
			className="mx-1 h-5 w-px bg-[color:var(--dm-border)]"
			aria-hidden="true"
		/>
	);
}

function SaveBadge({ status }: { status: string }) {
	const label =
		status === "saved"
			? "Saved"
			: status === "saving"
				? "Saving..."
				: status === "error"
					? "Error"
					: "Unsaved";
	return (
		<span
			className="rounded bg-[color:var(--dm-surface-muted)] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[color:var(--dm-ink-muted)]"
			role="status"
			aria-live="polite"
		>
			{label}
		</span>
	);
}

export function CanvasToolbar({
	title,
	canUndo,
	canRedo,
	onUndo,
	onRedo,
	saveStatus,
	onAddBlock,
	onToggleListView,
	listView,
	onPreview,
	onPublish,
	animationsEnabled,
	onToggleAnimations,
}: {
	title: string;
	canUndo: boolean;
	canRedo: boolean;
	onUndo: () => void;
	onRedo: () => void;
	saveStatus: "saved" | "saving" | "unsaved" | "error";
	onAddBlock: (type: BlockType) => void;
	onToggleListView: () => void;
	listView: boolean;
	onPreview: () => void;
	onPublish: () => void;
	animationsEnabled: boolean;
	onToggleAnimations: () => void;
}) {
	return (
		<div className="sticky top-0 z-50 border-b border-[color:var(--dm-border)] bg-[color:var(--dm-bg)] px-4 py-2">
			<div className="flex items-center gap-1">
				<p className="mr-2 shrink-0 text-sm font-semibold text-[color:var(--dm-ink)]">
					{title}
				</p>

				<Separator />

				<ToolbarButton label="Undo" onClick={onUndo} disabled={!canUndo}>
					<Undo2 className="h-3.5 w-3.5" aria-hidden="true" />
				</ToolbarButton>
				<ToolbarButton label="Redo" onClick={onRedo} disabled={!canRedo}>
					<Redo2 className="h-3.5 w-3.5" aria-hidden="true" />
				</ToolbarButton>

				<Separator />

				<ToolbarButton
					label="Add text block"
					onClick={() => onAddBlock("text")}
				>
					<Plus className="h-3.5 w-3.5" aria-hidden="true" />
					Text
				</ToolbarButton>
				<ToolbarButton
					label="Add image block"
					onClick={() => onAddBlock("image")}
				>
					<Plus className="h-3.5 w-3.5" aria-hidden="true" />
					Image
				</ToolbarButton>
				<ToolbarButton
					label="Add decorative block"
					onClick={() => onAddBlock("decorative")}
				>
					<Plus className="h-3.5 w-3.5" aria-hidden="true" />
					Decor
				</ToolbarButton>

				<Separator />

				<ToolbarButton label="Toggle list view" onClick={onToggleListView}>
					{listView ? (
						<PanelLeft className="h-3.5 w-3.5" aria-hidden="true" />
					) : (
						<List className="h-3.5 w-3.5" aria-hidden="true" />
					)}
					{listView ? "Canvas" : "List"}
				</ToolbarButton>
				<ToolbarButton
					label="Toggle animation preview"
					onClick={onToggleAnimations}
				>
					<MonitorPlay className="h-3.5 w-3.5" aria-hidden="true" />
					{animationsEnabled ? "Anim On" : "Anim Off"}
				</ToolbarButton>

				<div className="ml-auto flex items-center gap-1">
					<SaveBadge status={saveStatus} />

					<ToolbarButton label="Preview invitation" onClick={onPreview}>
						<Eye className="h-3.5 w-3.5" aria-hidden="true" />
						Preview
					</ToolbarButton>
					<ToolbarButton label="Publish invitation" onClick={onPublish}>
						<Send className="h-3.5 w-3.5" aria-hidden="true" />
						Publish
					</ToolbarButton>
				</div>
			</div>
		</div>
	);
}
