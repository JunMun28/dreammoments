import { History, Plus, Save } from "lucide-react";
import type { BlockType, DesignTokens } from "@/lib/canvas/types";

function Button({
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
			className="inline-flex items-center gap-1 rounded-full border border-[color:var(--dm-border)] px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-[color:var(--dm-ink)] transition-colors hover:bg-[color:var(--dm-surface-muted)] disabled:opacity-50"
			aria-label={label}
		>
			{children}
		</button>
	);
}

export function CanvasToolbar({
	title,
	canUndo,
	canRedo,
	onUndo,
	onRedo,
	onSave,
	saveStatus,
	onAddBlock,
	onToggleListView,
	listView,
	onPreview,
	onPublish,
	animationsEnabled,
	onToggleAnimations,
	designTokens,
	onDesignTokenChange,
	onSpacingChange,
}: {
	title: string;
	canUndo: boolean;
	canRedo: boolean;
	onUndo: () => void;
	onRedo: () => void;
	onSave: () => void;
	saveStatus: "saved" | "saving" | "unsaved" | "error";
	onAddBlock: (type: BlockType) => void;
	onToggleListView: () => void;
	listView: boolean;
	onPreview: () => void;
	onPublish: () => void;
	animationsEnabled: boolean;
	onToggleAnimations: () => void;
	designTokens: DesignTokens;
	onDesignTokenChange: (
		section: "colors" | "fonts",
		key: string,
		value: string,
	) => void;
	onSpacingChange: (spacing: number) => void;
}) {
	return (
		<div className="sticky top-0 z-50 border-b border-[color:var(--dm-border)] bg-[color:var(--dm-bg)]/95 px-4 py-3 backdrop-blur">
			<div className="flex flex-wrap items-center gap-2">
				<p className="mr-2 text-sm font-semibold text-[color:var(--dm-ink)]">
					{title}
				</p>
				<Button label="Undo" onClick={onUndo} disabled={!canUndo}>
					<History className="h-3.5 w-3.5" aria-hidden="true" />
					Undo
				</Button>
				<Button label="Redo" onClick={onRedo} disabled={!canRedo}>
					<History className="h-3.5 w-3.5 rotate-180" aria-hidden="true" />
					Redo
				</Button>
				<Button label="Add text block" onClick={() => onAddBlock("text")}>
					<Plus className="h-3.5 w-3.5" aria-hidden="true" />
					Text
				</Button>
				<Button label="Add image block" onClick={() => onAddBlock("image")}>
					<Plus className="h-3.5 w-3.5" aria-hidden="true" />
					Image
				</Button>
				<Button
					label="Add decorative block"
					onClick={() => onAddBlock("decorative")}
				>
					<Plus className="h-3.5 w-3.5" aria-hidden="true" />
					Decor
				</Button>
				<Button label="Toggle list view" onClick={onToggleListView}>
					{listView ? "Canvas View" : "List View"}
				</Button>
				<Button label="Toggle animation preview" onClick={onToggleAnimations}>
					{animationsEnabled ? "Anim On" : "Anim Off"}
				</Button>
				<Button label="Save now" onClick={onSave}>
					<Save className="h-3.5 w-3.5" aria-hidden="true" />
					{saveStatus}
				</Button>
				<Button label="Preview invitation" onClick={onPreview}>
					Preview
				</Button>
				<Button label="Publish invitation" onClick={onPublish}>
					Publish
				</Button>
			</div>
			<div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-[color:var(--dm-muted)]">
				<label className="inline-flex items-center gap-1">
					BG
					<input
						type="color"
						value={designTokens.colors.background || "#ffffff"}
						onChange={(event) =>
							onDesignTokenChange("colors", "background", event.target.value)
						}
						className="h-7 w-9 rounded border border-[color:var(--dm-border)] p-1"
						aria-label="Canvas background color"
					/>
				</label>
				<label className="inline-flex items-center gap-1">
					Text
					<input
						type="color"
						value={designTokens.colors.text || "#111111"}
						onChange={(event) =>
							onDesignTokenChange("colors", "text", event.target.value)
						}
						className="h-7 w-9 rounded border border-[color:var(--dm-border)] p-1"
						aria-label="Canvas text color"
					/>
				</label>
				<label className="inline-flex items-center gap-1">
					Grid
					<input
						type="number"
						min={1}
						max={24}
						value={designTokens.spacing}
						onChange={(event) =>
							onSpacingChange(Math.max(1, Number(event.target.value) || 8))
						}
						className="w-14 rounded border border-[color:var(--dm-border)] px-1.5 py-1 text-[11px] normal-case tracking-normal text-[color:var(--dm-ink)]"
						aria-label="Snap grid size"
					/>
				</label>
				<label className="inline-flex items-center gap-1">
					Heading font
					<input
						type="text"
						value={designTokens.fonts.heading || ""}
						onChange={(event) =>
							onDesignTokenChange("fonts", "heading", event.target.value)
						}
						className="w-28 rounded border border-[color:var(--dm-border)] px-1.5 py-1 text-[11px] normal-case tracking-normal text-[color:var(--dm-ink)]"
						aria-label="Heading font family"
					/>
				</label>
				<label className="inline-flex items-center gap-1">
					Body font
					<input
						type="text"
						value={designTokens.fonts.body || ""}
						onChange={(event) =>
							onDesignTokenChange("fonts", "body", event.target.value)
						}
						className="w-28 rounded border border-[color:var(--dm-border)] px-1.5 py-1 text-[11px] normal-case tracking-normal text-[color:var(--dm-ink)]"
						aria-label="Body font family"
					/>
				</label>
			</div>
		</div>
	);
}
