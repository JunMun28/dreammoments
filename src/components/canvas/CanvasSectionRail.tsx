import type { Block, CanvasDocument } from "@/lib/canvas/types";
import { getSectionLabel } from "@/templates/types";

export type CanvasSection = {
	id: string;
	label: string;
	blockId: string;
	count: number;
};

export function resolveBlockSectionId(block: Block): string {
	if (block.sectionId && block.sectionId.trim().length > 0) {
		return block.sectionId;
	}
	if (block.semantic?.includes("-")) {
		return block.semantic.split("-")[0] || "general";
	}
	return "general";
}

export function buildCanvasSections(document: CanvasDocument): CanvasSection[] {
	const byId = new Map<string, CanvasSection>();
	for (const blockId of document.blockOrder) {
		const block = document.blocksById[blockId];
		if (!block) continue;
		const sectionId = resolveBlockSectionId(block);
		const existing = byId.get(sectionId);
		if (existing) {
			existing.count += 1;
			continue;
		}
		byId.set(sectionId, {
			id: sectionId,
			label: getSectionLabel(sectionId),
			blockId,
			count: 1,
		});
	}
	return Array.from(byId.values());
}

export function CanvasSectionRail({
	sections,
	activeSectionId,
	onSectionSelect,
}: {
	sections: CanvasSection[];
	activeSectionId: string;
	onSectionSelect: (section: CanvasSection) => void;
}) {
	if (sections.length === 0) {
		return (
			<div className="p-3 text-[11px] text-[color:var(--dm-muted)]">
				No sections
			</div>
		);
	}

	return (
		<nav
			className="flex h-full flex-col gap-1 p-2"
			aria-label="Canvas sections"
		>
			{sections.map((section) => {
				const active = section.id === activeSectionId;
				return (
					<button
						key={section.id}
						type="button"
						onClick={() => onSectionSelect(section)}
						aria-pressed={active}
						className={`rounded-lg px-2.5 py-2 text-left transition-colors ${
							active
								? "bg-[color:var(--dm-accent-strong)] text-white"
								: "text-[color:var(--dm-ink)] hover:bg-[color:var(--dm-surface-muted)]"
						}`}
					>
						<p className="truncate text-[11px] font-medium">{section.label}</p>
						<p
							className={`text-[10px] ${active ? "text-white/70" : "text-[color:var(--dm-ink-muted)]"}`}
						>
							{section.count} block{section.count > 1 ? "s" : ""}
						</p>
					</button>
				);
			})}
		</nav>
	);
}
