import { useId, useMemo, useRef } from "react";
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
				<div className="mt-4 flex flex-wrap gap-3">
					<button
						type="button"
						className="rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-accent-strong)]"
						onClick={() => navigator.clipboard.writeText(url)}
					>
						Copy Link
					</button>
					<button
						type="button"
						className="rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-accent-strong)]"
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
						className="rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-accent-strong)]"
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
