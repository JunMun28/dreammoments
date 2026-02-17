import type { CSSProperties } from "react";
import type { Block } from "@/lib/canvas/types";

function toNumber(value: unknown, fallback: number): number {
	if (typeof value !== "number" || Number.isNaN(value)) return fallback;
	return value;
}

function toText(value: unknown): string {
	return typeof value === "string" ? value : "";
}

export function DividerBlock({ block }: { block: Block }) {
	const orientation =
		toText(block.content.orientation) === "vertical"
			? "vertical"
			: "horizontal";
	const thickness = Math.max(1, toNumber(block.content.thickness, 1));
	const color = toText(block.content.color) || "currentColor";
	const lineStyle: CSSProperties =
		orientation === "vertical"
			? { width: thickness, height: "100%", backgroundColor: color }
			: { width: "100%", height: thickness, backgroundColor: color };

	return (
		<div
			className="flex h-full w-full items-center justify-center"
			aria-hidden="true"
		>
			<div style={lineStyle} />
		</div>
	);
}
