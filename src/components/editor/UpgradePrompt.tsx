import { useNavigate } from "@tanstack/react-router";
import { useId, useRef } from "react";
import { useFocusTrap } from "@/components/editor/hooks/useFocusTrap";

interface UpgradePromptProps {
	open: boolean;
	onClose: () => void;
	onContinueFree: () => void;
}

export function UpgradePrompt({
	open,
	onClose,
	onContinueFree,
}: UpgradePromptProps) {
	const navigate = useNavigate();
	const rawId = useId();
	const titleId = `upgrade-title-${rawId.replaceAll(":", "")}`;
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
			aria-labelledby={titleId}
		>
			<div className="dm-inline-card">
				<p
					id={titleId}
					className="text-xs uppercase tracking-[0.3em] text-[color:var(--dm-accent-strong)]"
				>
					Upgrade to Premium
				</p>
				<ul className="mt-3 space-y-2 text-sm text-[color:var(--dm-muted)]">
					<li>Custom URL slug</li>
					<li>100 AI generations</li>
					<li>CSV import + export</li>
					<li>Advanced analytics</li>
				</ul>
				<div className="mt-4 flex gap-3">
					<button
						type="button"
						className="flex-1 rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-ink)]"
						onClick={onContinueFree}
					>
						Continue Free
					</button>
					<button
						type="button"
						className="flex-1 rounded-full bg-[color:var(--dm-accent-strong)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-on-accent)]"
						onClick={() => navigate({ to: "/upgrade" })}
					>
						Upgrade
					</button>
				</div>
			</div>
		</div>
	);
}
