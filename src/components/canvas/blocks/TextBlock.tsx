import type { Block } from "@/lib/canvas/types";

function toText(value: unknown): string {
	return typeof value === "string" ? value : "";
}

export function TextBlock({ block }: { block: Block }) {
	const text = toText(block.content.text);
	return (
		<p className="h-full w-full whitespace-pre-wrap break-words text-sm leading-relaxed text-inherit">
			{text}
		</p>
	);
}
