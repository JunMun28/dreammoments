import type { CSSProperties } from "react";
import type { Block } from "@/lib/canvas/types";

function toText(value: unknown): string {
	return typeof value === "string" ? value : "";
}

export function ImageBlock({ block }: { block: Block }) {
	const src = toText(block.content.src);
	const alt = toText(block.content.alt) || "Invitation image";
	const objectFitRaw = toText(block.content.objectFit);
	const objectFit: CSSProperties["objectFit"] =
		objectFitRaw === "contain" ||
		objectFitRaw === "cover" ||
		objectFitRaw === "fill" ||
		objectFitRaw === "none" ||
		objectFitRaw === "scale-down"
			? objectFitRaw
			: "cover";
	const imageStyle: CSSProperties = { objectFit };

	if (!src) {
		return (
			<div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-[color:var(--dm-border)] bg-[color:var(--dm-bg-soft)] text-xs uppercase tracking-[0.16em] text-[color:var(--dm-muted)]">
				No image
			</div>
		);
	}

	return (
		<img
			src={src}
			alt={alt}
			className="h-full w-full rounded-[inherit]"
			loading="lazy"
			decoding="async"
			style={imageStyle}
		/>
	);
}
