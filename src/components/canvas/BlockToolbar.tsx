import {
	ChevronDown,
	ChevronUp,
	Copy,
	Lock,
	Sparkles,
	Trash2,
	Unlock,
} from "lucide-react";

function IconButton({
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
			className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[color:var(--dm-focus)] focus-visible:outline-none ${
				danger
					? "text-red-500 hover:bg-red-50"
					: "text-[color:var(--dm-ink)] hover:bg-[color:var(--dm-surface-muted)]"
			}`}
			aria-label={label}
		>
			{children}
		</button>
	);
}

function Separator() {
	return (
		<div
			className="mx-0.5 h-4 w-px bg-[color:var(--dm-border)]"
			aria-hidden="true"
		/>
	);
}

export function BlockToolbar({
	locked,
	onDelete,
	onDuplicate,
	onLockToggle,
	onBringToFront,
	onSendToBack,
	onAiClick,
}: {
	locked: boolean;
	onDelete: () => void;
	onDuplicate: () => void;
	onLockToggle: () => void;
	onBringToFront: () => void;
	onSendToBack: () => void;
	onAiClick: () => void;
}) {
	return (
		<div
			className="absolute -top-11 left-1/2 z-50 flex -translate-x-1/2 items-center gap-0.5 rounded-xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)]/95 px-1.5 py-1 shadow-[0_2px_12px_rgba(74,78,85,0.08)] backdrop-blur-sm"
			role="toolbar"
			aria-label="Block actions"
			onPointerDown={(e) => e.stopPropagation()}
		>
			<IconButton label="AI" onClick={onAiClick}>
				<Sparkles className="h-4 w-4" />
			</IconButton>
			<IconButton label="Duplicate" onClick={onDuplicate}>
				<Copy className="h-4 w-4" />
			</IconButton>

			<Separator />

			<IconButton label="Bring to front" onClick={onBringToFront}>
				<ChevronUp className="h-4 w-4" />
			</IconButton>
			<IconButton label="Send to back" onClick={onSendToBack}>
				<ChevronDown className="h-4 w-4" />
			</IconButton>

			<Separator />

			<IconButton
				label={locked ? "Unlock" : "Lock"}
				onClick={onLockToggle}
			>
				{locked ? (
					<Unlock className="h-4 w-4" />
				) : (
					<Lock className="h-4 w-4" />
				)}
			</IconButton>
			<IconButton label="Delete" onClick={onDelete} danger>
				<Trash2 className="h-4 w-4" />
			</IconButton>
		</div>
	);
}
