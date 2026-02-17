import type { Block } from "@/lib/canvas/types";

type TimelineItem = {
	date?: string;
	title?: string;
	description?: string;
};

function toItems(value: unknown): TimelineItem[] {
	if (!Array.isArray(value)) return [];
	return value.filter(
		(item) => typeof item === "object" && item !== null,
	) as TimelineItem[];
}

export function TimelineBlock({ block }: { block: Block }) {
	const summary =
		typeof block.content.summary === "string" ? block.content.summary : "";
	const items = toItems(block.content.items).slice(0, 3);

	if (summary) {
		return (
			<div className="h-full w-full overflow-hidden whitespace-pre-wrap break-words text-sm leading-relaxed text-inherit">
				{summary}
			</div>
		);
	}

	if (items.length === 0) {
		return (
			<div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed border-[color:var(--dm-border)] text-xs uppercase tracking-[0.16em] text-[color:var(--dm-muted)]">
				No timeline items
			</div>
		);
	}

	return (
		<div className="grid h-full w-full gap-2 overflow-hidden text-xs text-inherit">
			{items.map((item, index) => (
				<div
					key={`${item.date ?? "item"}-${index}`}
					className="rounded-md border border-black/10 p-2"
				>
					<p className="text-[10px] uppercase tracking-[0.12em] opacity-70">
						{item.date || "Date"}
					</p>
					<p className="font-semibold">{item.title || "Timeline title"}</p>
					<p className="opacity-80">{item.description || ""}</p>
				</div>
			))}
		</div>
	);
}
