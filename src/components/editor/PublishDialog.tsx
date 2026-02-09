import { useRef } from "react";
import { useFocusTrap } from "@/components/editor/hooks/useFocusTrap";
import { PUBLIC_BASE_URL } from "@/lib/data";

interface PublishDialogProps {
	open: boolean;
	onClose: () => void;
	slug: string;
	onShare: () => void;
}

export function PublishDialog({
	open,
	onClose,
	slug,
	onShare,
}: PublishDialogProps) {
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
			aria-label="Invitation published"
		>
			<div className="dm-inline-card text-center">
				<div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--dm-sage)]/20 text-3xl">
					&#127881;
				</div>
				<p className="text-xs uppercase tracking-[0.3em] text-[color:var(--dm-accent-strong)]">
					Your invitation is live!
				</p>
				<p className="mt-2 break-all text-sm text-[color:var(--dm-muted)]">
					{`${PUBLIC_BASE_URL}/invite/${slug}`}
				</p>
				<div className="mt-4 flex gap-3">
					<button
						type="button"
						className="flex-1 rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-ink)]"
						onClick={onClose}
					>
						Close
					</button>
					<button
						type="button"
						className="flex-1 rounded-full bg-[color:var(--dm-accent-strong)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-on-accent)]"
						onClick={onShare}
					>
						Share Now
					</button>
				</div>
			</div>
		</div>
	);
}
