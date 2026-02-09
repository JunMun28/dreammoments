import { X } from "lucide-react";
import { useCallback, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";

type ModalProps = {
	open: boolean;
	onClose: () => void;
	title: string;
	description?: string;
	children: React.ReactNode;
	className?: string;
};

export function Modal({
	open,
	onClose,
	title,
	description,
	children,
	className,
}: ModalProps) {
	const titleId = useId();
	const descriptionId = useId();
	const dialogRef = useRef<HTMLDivElement>(null);
	const previousFocusRef = useRef<HTMLElement | null>(null);

	const handleKeyDown = useCallback(
		(e: globalThis.KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
				return;
			}

			if (e.key === "Tab") {
				const dialog = dialogRef.current;
				if (!dialog) return;

				const focusable = dialog.querySelectorAll<HTMLElement>(
					'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
				);
				if (focusable.length === 0) return;

				const first = focusable[0];
				const last = focusable[focusable.length - 1];

				if (e.shiftKey && document.activeElement === first) {
					e.preventDefault();
					last.focus();
				} else if (!e.shiftKey && document.activeElement === last) {
					e.preventDefault();
					first.focus();
				}
			}
		},
		[onClose],
	);

	useEffect(() => {
		if (!open) return;
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [open, handleKeyDown]);

	useEffect(() => {
		if (open) {
			previousFocusRef.current = document.activeElement as HTMLElement;
			const dialog = dialogRef.current;
			if (dialog) {
				const firstFocusable = dialog.querySelector<HTMLElement>(
					'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
				);
				firstFocusable?.focus();
			}
		} else if (previousFocusRef.current) {
			previousFocusRef.current.focus();
			previousFocusRef.current = null;
		}
	}, [open]);

	useEffect(() => {
		if (open) {
			const original = document.body.style.overflow;
			document.body.style.overflow = "hidden";
			return () => {
				document.body.style.overflow = original;
			};
		}
	}, [open]);

	if (!open) return null;

	return createPortal(
		<div
			className="fixed inset-0 flex items-center justify-center p-4"
			style={{ zIndex: "var(--dm-z-modal)" }}
		>
			{/* Backdrop - click to close */}
			<button
				type="button"
				onClick={onClose}
				className="absolute inset-0 bg-black/45 backdrop-blur-sm animate-in fade-in duration-200 cursor-default"
				aria-label="Close modal"
				tabIndex={-1}
			/>

			{/* Dialog */}
			<div
				ref={dialogRef}
				role="dialog"
				aria-modal="true"
				aria-labelledby={titleId}
				aria-describedby={description ? descriptionId : undefined}
				className={cn(
					"relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] p-6 animate-in fade-in zoom-in-95 duration-200",
					className,
				)}
				style={{ boxShadow: "var(--dm-shadow-xl)" }}
			>
				{/* Close button */}
				<button
					type="button"
					onClick={onClose}
					className="absolute top-4 right-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-[color:var(--dm-muted)] hover:bg-[color:var(--dm-surface-muted)] hover:text-[color:var(--dm-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--dm-focus)] transition-colors"
					aria-label="Close"
				>
					<X size={18} />
				</button>

				{/* Header */}
				<h2
					id={titleId}
					className="pr-8 text-lg font-medium text-[color:var(--dm-ink)] font-heading"
				>
					{title}
				</h2>
				{description && (
					<p
						id={descriptionId}
						className="mt-1 text-sm text-[color:var(--dm-muted)]"
					>
						{description}
					</p>
				)}

				{/* Content */}
				<div className="mt-4">{children}</div>
			</div>
		</div>,
		document.body,
	);
}
