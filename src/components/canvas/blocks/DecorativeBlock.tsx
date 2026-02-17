import type { Block } from "@/lib/canvas/types";

export function DecorativeBlock({ block }: { block: Block }) {
	const color =
		typeof block.content.color === "string" && block.content.color
			? block.content.color
			: "currentColor";
	return (
		<div
			className="relative h-full w-full overflow-hidden rounded-md opacity-70"
			aria-hidden="true"
		>
			<div
				className="absolute -left-8 -top-10 h-24 w-24 rounded-full blur-xl"
				style={{ backgroundColor: color }}
			/>
			<div
				className="absolute bottom-0 right-0 h-16 w-16 rounded-full blur-lg"
				style={{ backgroundColor: color }}
			/>
		</div>
	);
}
