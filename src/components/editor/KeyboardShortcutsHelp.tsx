import { useRef } from "react";
import { useFocusTrap } from "@/components/editor/hooks/useFocusTrap";

interface KeyboardShortcutsHelpProps {
	open: boolean;
	onClose: () => void;
}

const SHORTCUTS: [string, string][] = [
	["Cmd/Ctrl+Z", "Undo"],
	["Cmd/Ctrl+Shift+Z", "Redo"],
	["Cmd/Ctrl+S", "Force save"],
	["[", "Collapse panel"],
	["]", "Expand panel"],
	["Cmd/Ctrl+Shift+P", "Toggle preview"],
	["?", "Toggle this help"],
];

export function KeyboardShortcutsHelp({
	open,
	onClose,
}: KeyboardShortcutsHelpProps) {
	const dialogRef = useRef<HTMLDivElement | null>(null);

	useFocusTrap(dialogRef, {
		enabled: open,
		onEscape: onClose,
	});

	if (!open) return null;

	return (
		<div
			ref={dialogRef}
			className="dm-inline-edit"
			role="dialog"
			aria-modal="true"
			aria-label="Keyboard shortcuts"
		>
			<div className="dm-inline-card">
				<p className="text-xs uppercase tracking-[0.3em] text-[color:var(--dm-accent-strong)]">
					Keyboard Shortcuts
				</p>
				<dl className="mt-3 space-y-2 text-sm">
					{SHORTCUTS.map(([key, desc]) => (
						<div key={key} className="flex justify-between">
							<dt className="font-mono text-xs text-[color:var(--dm-muted)]">
								{key}
							</dt>
							<dd className="text-xs text-[color:var(--dm-ink)]">{desc}</dd>
						</div>
					))}
				</dl>
				<button
					type="button"
					className="mt-4 w-full rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-ink)]"
					onClick={onClose}
				>
					Close
				</button>
			</div>
		</div>
	);
}
