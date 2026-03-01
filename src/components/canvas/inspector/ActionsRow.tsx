import { Copy, Lock, Trash2, Unlock } from "lucide-react";
import { InspectorSection } from "./InspectorSection";

function ActionButton({
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
			className={`flex h-8 items-center justify-center gap-1.5 rounded-lg text-[11px] font-medium transition-colors ${
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

export function ActionsRow({
	locked,
	onDuplicate,
	onToggleLock,
	onDelete,
}: {
	locked: boolean;
	onDuplicate: () => void;
	onToggleLock: () => void;
	onDelete: () => void;
}) {
	return (
		<InspectorSection title="Actions" defaultOpen>
			<div className="grid grid-cols-3 gap-1">
				<ActionButton label="Duplicate" onClick={onDuplicate}>
					<Copy className="h-3.5 w-3.5" aria-hidden="true" />
					Duplicate
				</ActionButton>
				<ActionButton label={locked ? "Unlock" : "Lock"} onClick={onToggleLock}>
					{locked ? (
						<Unlock className="h-3.5 w-3.5" aria-hidden="true" />
					) : (
						<Lock className="h-3.5 w-3.5" aria-hidden="true" />
					)}
					{locked ? "Unlock" : "Lock"}
				</ActionButton>
				<ActionButton label="Delete" onClick={onDelete} danger>
					<Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
					Delete
				</ActionButton>
			</div>
		</InspectorSection>
	);
}
