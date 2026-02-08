import { useEffect, useId, useMemo, useRef, useState } from "react";
import { PUBLIC_BASE_URL } from "../../lib/data";
import { generateQrDataUrl } from "../../lib/qr";
import type { Invitation } from "../../lib/types";
import { useFocusTrap } from "../editor/hooks/useFocusTrap";

export default function ShareModal({
	open,
	invitation,
	onClose,
}: {
	open: boolean;
	invitation: Invitation | null;
	onClose: () => void;
}) {
	const rawId = useId();
	const titleId = `share-modal-title-${rawId.replaceAll(":", "")}`;
	const dialogRef = useRef<HTMLDivElement>(null);
	const [copied, setCopied] = useState(false);
	const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		if (!open) {
			setCopied(false);
			if (copyTimeoutRef.current) {
				clearTimeout(copyTimeoutRef.current);
				copyTimeoutRef.current = null;
			}
		}
		return () => {
			if (copyTimeoutRef.current) {
				clearTimeout(copyTimeoutRef.current);
			}
		};
	}, [open]);

	useFocusTrap(dialogRef, {
		enabled: open && invitation != null,
		onEscape: onClose,
	});

	const url = useMemo(
		() => (invitation ? `${PUBLIC_BASE_URL}/invite/${invitation.slug}` : ""),
		[invitation],
	);
	const qrDataUrl = useMemo(() => (url ? generateQrDataUrl(url) : ""), [url]);

	if (!open || !invitation) return null;
	const message = `You're invited to ${invitation.content.hero.partnerOneName} & ${invitation.content.hero.partnerTwoName}'s wedding on ${invitation.content.hero.date}. ${url}`;

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
					Share Invitation
				</p>
				<p className="mt-2 text-sm text-[color:var(--dm-muted)]">{url}</p>
				<div className="mt-4 flex flex-col flex-nowrap gap-3">
					<button
						type="button"
						className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--dm-accent-strong)] focus-visible:ring-offset-2 active:scale-[0.98] ${
							copied
								? "border-[color:var(--dm-sage)] bg-[color:var(--dm-sage)] text-[color:var(--dm-ink)]"
								: "border-[color:var(--dm-border)] text-[color:var(--dm-accent-strong)] hover:bg-[color:var(--dm-surface-muted)] hover:border-[color:var(--dm-accent-strong)]"
						}`}
						onClick={async () => {
							try {
								await navigator.clipboard.writeText(url);
								if (copyTimeoutRef.current)
									clearTimeout(copyTimeoutRef.current);
								setCopied(true);
								copyTimeoutRef.current = setTimeout(() => {
									setCopied(false);
									copyTimeoutRef.current = null;
								}, 2000);
							} catch {
								// clipboard failed (e.g. insecure context)
							}
						}}
						aria-live="polite"
						aria-label={
							copied ? "Link copied to clipboard" : "Copy link to clipboard"
						}
					>
						{copied ? "Copied!" : "Copy Link"}
					</button>
					<button
						type="button"
						className="rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-accent-strong)] transition-colors hover:bg-[color:var(--dm-surface-muted)] hover:border-[color:var(--dm-accent-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--dm-accent-strong)] focus-visible:ring-offset-2 active:scale-[0.98]"
						onClick={() =>
							window.open(
								`https://wa.me/?text=${encodeURIComponent(message)}`,
								"_blank",
								"noopener,noreferrer",
							)
						}
					>
						WhatsApp
					</button>
					<a
						href={qrDataUrl}
						download={`invite-${invitation.slug}.svg`}
						className="rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-center text-xs uppercase tracking-[0.2em] text-[color:var(--dm-accent-strong)] transition-colors hover:bg-[color:var(--dm-surface-muted)] hover:border-[color:var(--dm-accent-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--dm-accent-strong)] focus-visible:ring-offset-2 active:scale-[0.98]"
					>
						Download QR Code
					</a>
				</div>
				<div className="mt-4 flex justify-center">
					<img
						src={qrDataUrl}
						alt="Invitation QR code"
						width={160}
						height={160}
						className="h-40 w-40 rounded-2xl"
					/>
				</div>
				<button
					type="button"
					className="mt-4 w-full rounded-full bg-[color:var(--dm-accent-strong)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-on-accent)]"
					onClick={onClose}
				>
					Close
				</button>
			</div>
		</div>
	);
}
