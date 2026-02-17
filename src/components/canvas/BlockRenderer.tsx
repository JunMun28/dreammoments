import type { Block } from "@/lib/canvas/types";
import { CountdownBlock } from "./blocks/CountdownBlock";
import { DecorativeBlock } from "./blocks/DecorativeBlock";
import { DividerBlock } from "./blocks/DividerBlock";
import { FormBlock } from "./blocks/FormBlock";
import { GalleryBlock } from "./blocks/GalleryBlock";
import { GroupBlock } from "./blocks/GroupBlock";
import { HeadingBlock } from "./blocks/HeadingBlock";
import { ImageBlock } from "./blocks/ImageBlock";
import { MapBlock } from "./blocks/MapBlock";
import { TextBlock } from "./blocks/TextBlock";
import { TimelineBlock } from "./blocks/TimelineBlock";

export interface BlockRendererProps {
	block: Block;
}

export function BlockRenderer({ block }: BlockRendererProps) {
	if (block.type === "text") return <TextBlock block={block} />;
	if (block.type === "heading") return <HeadingBlock block={block} />;
	if (block.type === "image") return <ImageBlock block={block} />;
	if (block.type === "divider") return <DividerBlock block={block} />;
	if (block.type === "gallery") return <GalleryBlock block={block} />;
	if (block.type === "timeline") return <TimelineBlock block={block} />;
	if (block.type === "map") return <MapBlock block={block} />;
	if (block.type === "countdown") return <CountdownBlock block={block} />;
	if (block.type === "form") return <FormBlock block={block} />;
	if (block.type === "group") return <GroupBlock block={block} />;
	if (block.type === "decorative") return <DecorativeBlock block={block} />;

	return (
		<div className="flex h-full w-full items-center justify-center rounded-md border border-dashed border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-2 text-center text-xs text-[color:var(--dm-muted)]">
			{block.type} block coming soon
		</div>
	);
}
