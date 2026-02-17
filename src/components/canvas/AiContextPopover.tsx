import { Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import type { Block } from "@/lib/canvas/types";

export type CanvasAiActionType =
	| "rewrite"
	| "shorten"
	| "expand"
	| "translate"
	| "restyle"
	| "reposition"
	| "caption"
	| "imageAlt"
	| "layout";

export interface CanvasAiAction {
	type: CanvasAiActionType;
	label: string;
	description: string;
	apply: (block: Block) => Partial<Block>;
}

function defaultActions(block: Block): CanvasAiAction[] {
	const textLike = block.type === "text" || block.type === "heading";
	const actions: CanvasAiAction[] = [];

	if (textLike) {
		actions.push({
			type: "rewrite",
			label: "Rewrite",
			description: "Refine wording while keeping meaning",
			apply: (target) => {
				const text =
					typeof target.content.text === "string" ? target.content.text : "";
				return {
					content: {
						...target.content,
						text: text ? `${text} ✨` : text,
					},
				};
			},
		});
		actions.push({
			type: "shorten",
			label: "Shorten",
			description: "Make content tighter and concise",
			apply: (target) => {
				const text =
					typeof target.content.text === "string" ? target.content.text : "";
				return {
					content: {
						...target.content,
						text: text.slice(0, Math.max(30, Math.floor(text.length * 0.7))),
					},
				};
			},
		});
		actions.push({
			type: "expand",
			label: "Expand",
			description: "Add richer detail and emotion",
			apply: (target) => {
				const text =
					typeof target.content.text === "string" ? target.content.text : "";
				return {
					content: {
						...target.content,
						text: text ? `${text}\nWith joy, love, and gratitude.` : text,
					},
				};
			},
		});
		actions.push({
			type: "translate",
			label: "Translate",
			description: "Generate bilingual-friendly copy",
			apply: (target) => {
				const text =
					typeof target.content.text === "string" ? target.content.text : "";
				return {
					content: {
						...target.content,
						text: text ? `诚挚邀请：${text}` : text,
					},
				};
			},
		});
	}

	if (block.type === "image") {
		actions.push({
			type: "caption",
			label: "Caption",
			description: "Generate photo caption",
			apply: (target) => {
				const current =
					typeof target.content.caption === "string"
						? target.content.caption
						: "";
				return {
					content: {
						...target.content,
						caption: current || "A timeless moment captured in soft light.",
					},
				};
			},
		});
		actions.push({
			type: "imageAlt",
			label: "Image idea",
			description: "Suggest alternate visual concept",
			apply: (target) => {
				const src =
					typeof target.content.src === "string" ? target.content.src : "";
				return {
					content: {
						...target.content,
						src: src || "/placeholders/photo-light.svg",
						alt: "Romantic ceremony portrait with floral background",
					},
				};
			},
		});
	}

	if (block.type === "group" || block.semantic?.includes("section")) {
		actions.push({
			type: "layout",
			label: "Rearrange",
			description: "Reorder grouped content",
			apply: (target) => ({
				children: [...(target.children ?? [])].reverse(),
			}),
		});
	}

	actions.push({
		type: "restyle",
		label: "Restyle",
		description: "Adjust mood via colors/filters",
		apply: () => ({
			style: {
				filter: "saturate(1.08)",
			},
		}),
	});
	actions.push({
		type: "reposition",
		label: "Reposition",
		description: "Nudge block to cleaner alignment",
		apply: (target) => ({
			position: {
				x: Math.max(0, target.position.x + 8),
				y: Math.max(0, target.position.y + 8),
			},
		}),
	});

	return actions;
}

function actionOrderBySemantic(block: Block): CanvasAiActionType[] {
	const semantic = (block.semantic ?? "").toLowerCase();
	if (semantic.includes("partner-name") || semantic.includes("announcement")) {
		return [
			"rewrite",
			"expand",
			"shorten",
			"translate",
			"restyle",
			"reposition",
		];
	}
	if (semantic.includes("hero-image") || semantic.includes("gallery")) {
		return ["caption", "imageAlt", "restyle", "reposition"];
	}
	if (semantic.includes("story") || semantic.includes("timeline")) {
		return ["expand", "rewrite", "shorten", "restyle", "reposition"];
	}
	if (semantic.includes("rsvp") || semantic.includes("form")) {
		return ["rewrite", "shorten", "layout", "restyle"];
	}
	return ["rewrite", "caption", "layout", "restyle", "reposition", "translate"];
}

export function AiContextPopover({
	block,
	onApply,
	onClose,
}: {
	block: Block;
	onApply: (patch: Partial<Block>, actionType: CanvasAiActionType) => void;
	onClose: () => void;
}) {
	const [selected, setSelected] = useState<CanvasAiActionType | null>(null);
	const [pendingPatch, setPendingPatch] = useState<Partial<Block> | null>(null);
	const [pendingType, setPendingType] = useState<CanvasAiActionType | null>(
		null,
	);
	const actions = useMemo(() => {
		const all = defaultActions(block);
		const byType = new Map(all.map((action) => [action.type, action]));
		const orderedTypes = actionOrderBySemantic(block);
		const ordered = orderedTypes
			.map((type) => byType.get(type))
			.filter((action): action is CanvasAiAction => !!action);
		const leftovers = all.filter(
			(action) => !orderedTypes.includes(action.type),
		);
		return [...ordered, ...leftovers];
	}, [block]);

	return (
		<div className="absolute left-0 top-full z-[60] mt-2 w-56 rounded-xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-2 shadow-md">
			<div className="mb-1 flex items-center gap-1 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-[color:var(--dm-muted)]">
				<Sparkles className="h-3 w-3" aria-hidden="true" />
				AI suggestions
			</div>
			<div className="grid gap-1">
				{actions.map((action) => (
					<button
						key={action.type}
						type="button"
						className="rounded-lg px-2 py-1.5 text-left text-xs text-[color:var(--dm-ink)] hover:bg-[color:var(--dm-surface-muted)]"
						onClick={() => {
							setSelected(action.type);
							setPendingType(action.type);
							setPendingPatch(action.apply(block));
						}}
					>
						<p>{action.label}</p>
						<p className="text-[10px] uppercase tracking-[0.1em] text-[color:var(--dm-muted)]">
							{action.description}
						</p>
					</button>
				))}
			</div>
			<div className="mt-2 flex items-center justify-between px-1">
				<p className="text-[10px] text-[color:var(--dm-muted)]">
					{selected ? `Preview: ${selected}` : "Preview + apply"}
				</p>
				<div className="flex items-center gap-1">
					<button
						type="button"
						className="rounded-full border border-[color:var(--dm-border)] px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] disabled:opacity-50"
						onClick={() => {
							if (!pendingPatch || !pendingType) return;
							onApply(pendingPatch, pendingType);
							setPendingPatch(null);
						}}
						disabled={!pendingPatch || !pendingType}
					>
						Apply
					</button>
					<button
						type="button"
						className="rounded-full border border-[color:var(--dm-border)] px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]"
						onClick={onClose}
					>
						Close
					</button>
				</div>
			</div>
		</div>
	);
}
