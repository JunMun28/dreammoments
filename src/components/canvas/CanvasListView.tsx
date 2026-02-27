import {
	Clock,
	Flower2,
	Heading2,
	Image,
	LayoutGrid,
	MapPin,
	Minus,
	PenLine,
	Type,
} from "lucide-react";
import type { Block, BlockType, CanvasDocument } from "@/lib/canvas/types";
import { cn } from "@/lib/utils";
import { resolveBlockSectionId } from "./CanvasSectionRail";

function blockTypeIcon(type: BlockType) {
	switch (type) {
		case "heading":
			return <Heading2 className="h-3.5 w-3.5" />;
		case "text":
			return <Type className="h-3.5 w-3.5" />;
		case "image":
		case "gallery":
			return <Image className="h-3.5 w-3.5" />;
		case "divider":
			return <Minus className="h-3.5 w-3.5" />;
		case "map":
			return <MapPin className="h-3.5 w-3.5" />;
		case "countdown":
			return <Clock className="h-3.5 w-3.5" />;
		case "timeline":
		case "form":
			return <PenLine className="h-3.5 w-3.5" />;
		case "decorative":
			return <Flower2 className="h-3.5 w-3.5" />;
		case "group":
			return <LayoutGrid className="h-3.5 w-3.5" />;
		default:
			return <Type className="h-3.5 w-3.5" />;
	}
}

function blockPreviewText(block: Block): string {
	const content = block.content as Record<string, unknown>;
	if (typeof content.text === "string") {
		return content.text.length > 60
			? `${content.text.slice(0, 60)}...`
			: content.text;
	}
	if (typeof content.alt === "string") return content.alt;
	if (typeof content.src === "string" && content.src)
		return content.src.split("/").pop() ?? "Image";
	if (typeof content.date === "string") return content.date;
	if (typeof content.color === "string") return content.color;
	return block.type;
}

interface ListRowProps {
	block: Block;
	selected: boolean;
	onSelect: (blockId: string) => void;
}

function ListRow({ block, selected, onSelect }: ListRowProps) {
	return (
		<button
			type="button"
			onClick={() => onSelect(block.id)}
			className={cn(
				"flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors",
				selected
					? "bg-[color:var(--dm-peach)]/15 ring-1 ring-[color:var(--dm-peach)]"
					: "hover:bg-[color:var(--dm-surface-muted)]",
				block.locked && "opacity-60",
			)}
		>
			<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[color:var(--dm-surface-muted)] text-[color:var(--dm-muted)]">
				{blockTypeIcon(block.type)}
			</span>
			<div className="min-w-0 flex-1">
				<p className="truncate text-xs font-medium text-[color:var(--dm-ink)]">
					{blockPreviewText(block)}
				</p>
				<p className="text-[10px] text-[color:var(--dm-muted)]">
					{block.type}
					{block.locked ? " · locked" : ""}
				</p>
			</div>
		</button>
	);
}

export function CanvasListView({
	document,
	selectedBlockIds,
	onSelect,
}: {
	document: CanvasDocument;
	selectedBlockIds: string[];
	onSelect: (blockId: string) => void;
}) {
	const blocks = document.blockOrder
		.map((id) => document.blocksById[id])
		.filter(Boolean);

	if (blocks.length === 0) {
		return (
			<div className="flex flex-col items-center gap-1 p-8 text-center text-[color:var(--dm-muted)]">
				<p className="text-xs">No blocks yet</p>
				<p className="text-[10px]">Add blocks from the toolbar above</p>
			</div>
		);
	}

	// Group blocks by section
	const sectionMap = new Map<string, Block[]>();
	for (const block of blocks) {
		const sectionId = resolveBlockSectionId(block);
		const group = sectionMap.get(sectionId) ?? [];
		group.push(block);
		sectionMap.set(sectionId, group);
	}

	const hasSections = sectionMap.size > 1 || !sectionMap.has("general");

	return (
		<div className="grid gap-1 p-3">
			{hasSections
				? Array.from(sectionMap.entries()).map(([sectionId, sectionBlocks]) => (
						<div key={sectionId}>
							<p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--dm-muted)]">
								{sectionId.replace(/^\w/, (c) => c.toUpperCase())}
							</p>
							{sectionBlocks.map((block) => (
								<ListRow
									key={block.id}
									block={block}
									selected={selectedBlockIds.includes(block.id)}
									onSelect={onSelect}
								/>
							))}
						</div>
					))
				: blocks.map((block) => (
						<ListRow
							key={block.id}
							block={block}
							selected={selectedBlockIds.includes(block.id)}
							onSelect={onSelect}
						/>
					))}
		</div>
	);
}
