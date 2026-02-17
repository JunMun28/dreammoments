import type { Block } from "@/lib/canvas/types";

export function SelectionOverlay({
	block,
	onResizePointerDown,
	onResizePointerMove,
	onResizePointerUp,
	onResizePointerCancel,
}: {
	block: Block;
	onResizePointerDown?: (event: React.PointerEvent<HTMLElement>) => void;
	onResizePointerMove?: (event: React.PointerEvent<HTMLElement>) => void;
	onResizePointerUp?: (event: React.PointerEvent<HTMLElement>) => void;
	onResizePointerCancel?: (event: React.PointerEvent<HTMLElement>) => void;
}) {
	return (
		<div className="pointer-events-none absolute inset-0 z-30 rounded-[inherit] border border-[color:var(--dm-accent-strong)] shadow-[0_0_0_1px_rgba(0,0,0,0.06)]">
			<div className="absolute -left-1.5 -top-1.5 rounded bg-[color:var(--dm-accent-strong)] px-1.5 py-0.5 text-[10px] font-medium text-white">
				{block.type}
			</div>
			<button
				type="button"
				className="pointer-events-auto absolute -bottom-2 -right-2 h-4 w-4 rounded-sm border border-white bg-[color:var(--dm-accent-strong)]"
				onPointerDown={onResizePointerDown}
				onPointerMove={onResizePointerMove}
				onPointerUp={onResizePointerUp}
				onPointerCancel={onResizePointerCancel}
				aria-label="Resize block"
			/>
		</div>
	);
}
