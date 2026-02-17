import type { Block } from "@/lib/canvas/types";

function text(value: unknown): string {
	return typeof value === "string" ? value : "";
}

export function MapBlock({ block }: { block: Block }) {
	const name = text(block.content.name);
	const address = text(block.content.address);

	return (
		<div className="flex h-full w-full flex-col justify-between rounded-md bg-white/70 p-2 text-[12px] text-inherit">
			<div>
				<p className="text-[10px] uppercase tracking-[0.16em] opacity-70">
					Venue
				</p>
				<p className="font-semibold">{name || "Venue name"}</p>
				<p className="opacity-80">{address || "Venue address"}</p>
			</div>
			<div className="mt-2 rounded border border-dashed border-black/20 px-2 py-1 text-[10px] uppercase tracking-[0.12em] opacity-70">
				Map preview
			</div>
		</div>
	);
}
