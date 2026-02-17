import type { Block } from "@/lib/canvas/types";

function text(value: unknown): string {
	return typeof value === "string" ? value : "";
}

export function FormBlock({ block }: { block: Block }) {
	const title = text(block.content.title) || "RSVP";
	const deadline = text(block.content.deadline);
	const note = text(block.content.customMessage);

	return (
		<div className="flex h-full w-full flex-col gap-2 rounded-md bg-white/70 p-2 text-inherit">
			<p className="text-sm font-semibold">{title}</p>
			{deadline ? (
				<p className="text-[11px] uppercase tracking-[0.12em] opacity-75">
					Deadline: {deadline}
				</p>
			) : null}
			<p className="line-clamp-2 text-xs opacity-80">
				{note || "Guests can RSVP from the public invitation page."}
			</p>
			<button
				type="button"
				className="mt-auto rounded-full border border-black/20 px-3 py-1 text-[10px] uppercase tracking-[0.12em] opacity-80"
				disabled
			>
				RSVP Form
			</button>
		</div>
	);
}
