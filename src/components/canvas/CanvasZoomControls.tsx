import { Maximize, Minus, Plus } from "lucide-react";
import type { Camera } from "@/lib/canvas/camera";

function ZoomButton({
	label,
	onClick,
	children,
}: {
	label: string;
	onClick: () => void;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="flex h-7 w-7 items-center justify-center rounded-lg text-[color:var(--dm-ink)] transition-colors hover:bg-[color:var(--dm-surface-muted)] focus-visible:ring-2 focus-visible:ring-[color:var(--dm-focus)] focus-visible:outline-none"
			aria-label={label}
		>
			{children}
		</button>
	);
}

export function CanvasZoomControls({
	camera,
	onZoomIn,
	onZoomOut,
	onReset,
	onFit,
}: {
	camera: Camera;
	onZoomIn: () => void;
	onZoomOut: () => void;
	onReset: () => void;
	onFit: () => void;
}) {
	const percentage = Math.round(camera.z * 100);

	return (
		<div
			className="fixed bottom-4 right-4 z-50 hidden items-center gap-0.5 rounded-xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)]/95 px-1.5 py-1 shadow-[0_2px_12px_rgba(74,78,85,0.08)] backdrop-blur-sm lg:flex"
			role="toolbar"
			aria-label="Zoom controls"
		>
			<ZoomButton label="Zoom out" onClick={onZoomOut}>
				<Minus className="h-4 w-4" />
			</ZoomButton>
			<button
				type="button"
				onClick={onReset}
				className="min-w-[48px] rounded-lg px-1.5 py-1 text-center text-[11px] font-medium tabular-nums text-[color:var(--dm-ink)] transition-colors hover:bg-[color:var(--dm-surface-muted)] focus-visible:ring-2 focus-visible:ring-[color:var(--dm-focus)] focus-visible:outline-none"
				aria-label={`Zoom ${percentage}%, click to reset`}
			>
				{percentage}%
			</button>
			<ZoomButton label="Zoom in" onClick={onZoomIn}>
				<Plus className="h-4 w-4" />
			</ZoomButton>
			<div
				className="mx-0.5 h-4 w-px bg-[color:var(--dm-border)]"
				aria-hidden="true"
			/>
			<ZoomButton label="Fit to viewport" onClick={onFit}>
				<Maximize className="h-3.5 w-3.5" />
			</ZoomButton>
		</div>
	);
}
