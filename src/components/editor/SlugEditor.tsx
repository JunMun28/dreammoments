import { useId, useRef } from "react";
import { useFocusTrap } from "@/components/editor/hooks/useFocusTrap";
import type { SlugAvailability } from "@/components/editor/hooks/useSlugValidation";

interface SlugEditorProps {
	open: boolean;
	onClose: () => void;
	slugValue: string;
	slugError: string;
	slugAvailability: SlugAvailability;
	slugIsValid: boolean;
	onSlugChange: (value: string) => void;
	onConfirm: () => void;
}

export function SlugEditor({
	open,
	onClose,
	slugValue,
	slugError,
	slugAvailability,
	slugIsValid,
	onSlugChange,
	onConfirm,
}: SlugEditorProps) {
	const rawId = useId();
	const slugInputId = `slug-input-${rawId.replaceAll(":", "")}`;
	const slugFeedbackId = useId();
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
			aria-label="Set custom slug"
		>
			<div className="dm-inline-card">
				<p className="text-xs uppercase tracking-[0.3em] text-[color:var(--dm-accent-strong)]">
					Set Your Custom URL
				</p>
				<label
					htmlFor={slugInputId}
					className="mt-3 block text-sm text-[color:var(--dm-muted)]"
				>
					Invitation slug
				</label>
				<input
					id={slugInputId}
					type="text"
					value={slugValue}
					onChange={(e) => onSlugChange(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter" && slugIsValid) onConfirm();
					}}
					className={`mt-1 w-full rounded-lg bg-[color:var(--dm-bg)] px-3 py-2 text-sm text-[color:var(--dm-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--dm-focus)]/60 ${
						slugError || slugAvailability === "taken"
							? "border border-[color:var(--dm-error)]"
							: slugAvailability === "available"
								? "border border-green-500"
								: "border border-[color:var(--dm-border)]"
					}`}
					aria-invalid={!!slugError || slugAvailability === "taken"}
					aria-describedby={slugFeedbackId}
					autoComplete="off"
				/>
				<p
					id={slugFeedbackId}
					className={`mt-1 text-xs ${
						slugError || slugAvailability === "taken"
							? "text-[color:var(--dm-error)]"
							: slugAvailability === "available"
								? "text-green-600"
								: slugAvailability === "checking"
									? "text-[color:var(--dm-muted)]"
									: "text-transparent"
					}`}
					aria-live="polite"
				>
					{slugError ||
						(slugAvailability === "taken"
							? "Already taken"
							: slugAvailability === "available"
								? "Available"
								: slugAvailability === "checking"
									? "Checking..."
									: "\u00A0")}
				</p>
				<div className="mt-3 flex gap-3">
					<button
						type="button"
						className="flex-1 rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-ink)]"
						onClick={onClose}
					>
						Cancel
					</button>
					<button
						type="button"
						disabled={
							!!slugError ||
							slugAvailability === "taken" ||
							slugAvailability === "checking"
						}
						className="flex-1 rounded-full bg-[color:var(--dm-accent-strong)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-on-accent)] disabled:opacity-50"
						onClick={onConfirm}
					>
						Save
					</button>
				</div>
			</div>
		</div>
	);
}
