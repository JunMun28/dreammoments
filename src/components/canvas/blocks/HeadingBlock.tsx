import type { Block } from "@/lib/canvas/types";

function toText(value: unknown): string {
	return typeof value === "string" ? value : "";
}

function toHeadingLevel(value: unknown): 1 | 2 | 3 | 4 | 5 | 6 {
	if (typeof value !== "number") return 2;
	if (value < 1) return 1;
	if (value > 6) return 6;
	return value as 1 | 2 | 3 | 4 | 5 | 6;
}

export function HeadingBlock({ block }: { block: Block }) {
	const text = toText(block.content.text);
	const level = toHeadingLevel(block.content.level);
	const className =
		"m-0 h-full w-full whitespace-pre-wrap break-words font-semibold leading-tight text-inherit";

	if (level === 1) return <h1 className={className}>{text}</h1>;
	if (level === 2) return <h2 className={className}>{text}</h2>;
	if (level === 3) return <h3 className={className}>{text}</h3>;
	if (level === 4) return <h4 className={className}>{text}</h4>;
	if (level === 5) return <h5 className={className}>{text}</h5>;
	return <h6 className={className}>{text}</h6>;
}
