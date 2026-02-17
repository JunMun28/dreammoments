import { useMemo } from "react";
import type { Block } from "@/lib/canvas/types";

function parseDate(value: unknown): Date | null {
	if (typeof value !== "string" || !value.trim()) return null;
	const parsed = new Date(value);
	return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function CountdownBlock({ block }: { block: Block }) {
	const targetDate = useMemo(
		() => parseDate(block.content.targetDate),
		[block.content.targetDate],
	);
	const label =
		typeof block.content.label === "string" && block.content.label.trim()
			? block.content.label
			: "Countdown";

	const daysLeft =
		targetDate === null
			? null
			: Math.max(
					0,
					Math.ceil(
						(targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
					),
				);

	return (
		<div className="flex h-full w-full flex-col items-center justify-center gap-1 text-center text-inherit">
			<p className="text-[10px] uppercase tracking-[0.18em] opacity-70">
				{label}
			</p>
			<p className="text-3xl font-semibold leading-none tabular-nums">
				{daysLeft === null ? "--" : daysLeft}
			</p>
			<p className="text-[11px] uppercase tracking-[0.14em] opacity-75">days</p>
		</div>
	);
}
