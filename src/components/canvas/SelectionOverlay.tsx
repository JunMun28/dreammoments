export function SelectionOverlay({
	onResizePointerDown,
	onResizePointerMove,
	onResizePointerUp,
	onResizePointerCancel,
}: {
	onResizePointerDown?: (event: React.PointerEvent<HTMLElement>) => void;
	onResizePointerMove?: (event: React.PointerEvent<HTMLElement>) => void;
	onResizePointerUp?: (event: React.PointerEvent<HTMLElement>) => void;
	onResizePointerCancel?: (event: React.PointerEvent<HTMLElement>) => void;
}) {
	return (
		<div className="pointer-events-none absolute inset-0 z-30 rounded-[inherit] border border-[color:var(--dm-accent-strong)] shadow-[0_0_0_1px_rgba(0,0,0,0.06)]">
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
