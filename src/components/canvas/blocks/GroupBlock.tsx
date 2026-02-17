import type { Block } from "@/lib/canvas/types";

export function GroupBlock({ block }: { block: Block }) {
	const count = block.children?.length ?? 0;
	return (
		<div className="flex h-full w-full items-center justify-center rounded-md border border-dashed border-black/20 bg-white/30 text-[11px] uppercase tracking-[0.12em] text-inherit">
			Group ({count})
		</div>
	);
}
