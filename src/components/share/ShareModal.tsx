import type { Invitation } from '../../lib/types'
import { PUBLIC_BASE_URL } from '../../lib/data'

export default function ShareModal({
	open,
	invitation,
	onClose,
}: {
	open: boolean
	invitation: Invitation | null
	onClose: () => void
}) {
	if (!open || !invitation) return null
	const url = `${PUBLIC_BASE_URL}/invite/${invitation.slug}`
	const message = `You’re invited to ${invitation.content.hero.partnerOneName} & ${invitation.content.hero.partnerTwoName}’s wedding on ${invitation.content.hero.date}. ${url}`
	const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(url)}`

	return (
		<div className="dm-inline-edit">
			<div className="dm-inline-card">
				<p className="text-xs uppercase tracking-[0.3em] text-[color:var(--dm-accent-strong)]">
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
								'_blank',
								'noopener,noreferrer',
							)
						}
					>
						WhatsApp
					</button>
					<a
						href={qrUrl}
						download={`invite-${invitation.slug}.png`}
						className="rounded-full border border-[color:var(--dm-border)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[color:var(--dm-accent-strong)]"
					>
						Download QR Code
					</a>
				</div>
				<div className="mt-4 flex justify-center">
					<img
						src={qrUrl}
						alt="Invitation QR"
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
	)
}
