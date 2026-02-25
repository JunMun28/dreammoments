import { Sparkles } from "lucide-react";

function ToolbarButton({
	label,
	onClick,
	danger,
	children,
}: {
	label: string;
	onClick: () => void;
	danger?: boolean;
	children: React.ReactNode;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.14em] transition-colors ${
				danger
					? "border-red-300 text-red-600 hover:bg-red-50"
					: "border-[color:var(--dm-border)] text-[color:var(--dm-ink)] hover:bg-[color:var(--dm-surface-muted)]"
			}`}
			aria-label={label}
		>
			{children}
		</button>
	);
}

export function BlockToolbar({
	locked,
	onDelete,
	onDuplicate,
	onLockToggle,
	onBringForward,
	onSendBackward,
	onBringToFront,
	onSendToBack,
	onAiClick,
}: {
	locked: boolean;
	onDelete: () => void;
	onDuplicate: () => void;
	onLockToggle: () => void;
	onBringForward: () => void;
	onSendBackward: () => void;
	onBringToFront: () => void;
	onSendToBack: () => void;
	onAiClick: () => void;
}) {
	return (
		<div
			className="pointer-events-auto absolute -top-12 left-0 z-50 rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-2 shadow-sm"
			onPointerDown={(event) => event.stopPropagation()}
		>
			<div className="mb-2 flex flex-wrap items-center gap-1">
				<ToolbarButton label="AI actions" onClick={onAiClick}>
					<span className="inline-flex items-center gap-1">
						<Sparkles className="h-3 w-3" aria-hidden="true" />
						AI
					</span>
				</ToolbarButton>
				<ToolbarButton label="Duplicate block" onClick={onDuplicate}>
					Duplicate
				</ToolbarButton>
				<ToolbarButton label="Bring forward" onClick={onBringForward}>
					Forward
				</ToolbarButton>
				<ToolbarButton label="Send backward" onClick={onSendBackward}>
					Backward
				</ToolbarButton>
				<ToolbarButton label="Bring to front" onClick={onBringToFront}>
					Front
				</ToolbarButton>
				<ToolbarButton label="Send to back" onClick={onSendToBack}>
					Back
				</ToolbarButton>
				<ToolbarButton
					label={locked ? "Unlock block" : "Lock block"}
					onClick={onLockToggle}
				>
					{locked ? "Unlock" : "Lock"}
				</ToolbarButton>
				<ToolbarButton label="Delete block" onClick={onDelete} danger>
					Delete
				</ToolbarButton>
			</div>
		</div>
	);
}
