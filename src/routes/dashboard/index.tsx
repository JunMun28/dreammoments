import { createFileRoute, Link, Navigate } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import ShareModal from '../../components/share/ShareModal'
import { deleteInvitation, getAnalytics, listGuests } from '../../lib/data'
import { useAuth } from '../../lib/auth'
import { useStore } from '../../lib/store'
import { templates } from '../../templates'
import type { Invitation, InvitationStatus } from '../../lib/types'

export const Route = createFileRoute('/dashboard/')({
	component: DashboardScreen,
})

const statusLabels: Record<InvitationStatus, string> = {
	draft: 'Draft',
	published: 'Published',
	archived: 'Archived',
}

function DashboardScreen() {
	const { user } = useAuth()
	const invitations = useStore((store) =>
		store.invitations.filter((item) => item.userId === user?.id),
	)
	const [shareOpen, setShareOpen] = useState(false)
	const [selected, setSelected] = useState<Invitation | null>(null)

	const sortedInvitations = useMemo(
		() => [...invitations].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
		[invitations],
	)

	if (!user) return <Navigate to="/auth/login" />

	return (
		<div className="min-h-screen bg-[#0c0a08] px-6 py-10">
			<div className="mx-auto max-w-6xl space-y-8">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
								<div className="min-w-0">
						<p className="text-xs uppercase tracking-[0.4em] text-[#d8b25a]">Dashboard</p>
						<h1 className="mt-2 text-3xl font-semibold text-[#fdf6ea]">My Invitations</h1>
						<p className="mt-2 text-sm text-[#f7e8c4]/70">Manage drafts, RSVPs, and sharing.</p>
					</div>
					<Link
						to="/editor/new"
						className="rounded-full bg-[#d8b25a] px-5 py-3 text-xs uppercase tracking-[0.2em] text-[#0c0a08]"
					>
						New Invitation
					</Link>
				</div>

				<div className="grid gap-6 lg:grid-cols-2">
					{!sortedInvitations.length ? (
						<div className="rounded-3xl border border-white/10 bg-[#0f0c0a] p-8 text-center">
							<p className="text-xs uppercase tracking-[0.3em] text-[#d8b25a]">No Invitations Yet</p>
							<p className="mt-3 text-sm text-[#f7e8c4]/70">Start with a template and publish in minutes.</p>
							<Link
								to="/editor/new"
								className="mt-5 inline-flex rounded-full bg-[#d8b25a] px-5 py-3 text-xs uppercase tracking-[0.2em] text-[#0c0a08]"
							>
								Create Invitation
							</Link>
						</div>
					) : null}
					{sortedInvitations.map((invitation) => {
						const templateName =
							templates.find((template) => template.id === invitation.templateId)?.name ??
							invitation.templateId
						const guests = listGuests(invitation.id)
						const analytics = getAnalytics(invitation.id)

						return (
							<div
								key={invitation.id}
								className="rounded-3xl border border-white/10 bg-[#0f0c0a] p-6"
							>
								<div className="flex flex-wrap items-start justify-between gap-4">
									<div>
										<p className="text-xs uppercase tracking-[0.3em] text-[#d8b25a]">
											{templateName}
										</p>
									<h2 className="mt-2 text-xl font-semibold text-[#fdf6ea] break-words">
											{invitation.title}
										</h2>
										<p className="mt-2 text-xs uppercase tracking-[0.2em] text-[#f7e8c4]/60">
											{statusLabels[invitation.status]}
										</p>
									</div>
									<div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em]">
										<Link
											to="/editor/$invitationId"
											params={{ invitationId: invitation.id }}
											className="rounded-full border border-white/20 px-4 py-2 text-[#f7e8c4]"
										>
											Edit
										</Link>
										<Link
											to="/invite/$slug"
											params={{ slug: invitation.slug }}
											className="rounded-full border border-white/20 px-4 py-2 text-[#f7e8c4]"
										>
											Preview
										</Link>
										<button
											type="button"
											className="rounded-full border border-white/20 px-4 py-2 text-[#f7e8c4]"
											onClick={() => {
												setSelected(invitation)
												setShareOpen(true)
											}}
										>
											Share
										</button>
										<button
											type="button"
											className="rounded-full border border-white/20 px-4 py-2 text-[#f7e8c4]"
											onClick={() => {
												const confirmed = window.confirm('Delete this invitation?')
												if (!confirmed) return
												deleteInvitation(invitation.id)
											}}
										>
											Delete Invitation
										</button>
									</div>
								</div>
								<div className="mt-4 grid gap-3 sm:grid-cols-3">
									<div className="rounded-2xl border border-white/5 bg-[#14100d] p-4">
										<p className="text-xs uppercase tracking-[0.2em] text-[#f7e8c4]/60">Views</p>
										<p className="mt-2 text-lg font-semibold tabular-nums text-[#fdf6ea]">
											{analytics.totalViews}
										</p>
									</div>
									<div className="rounded-2xl border border-white/5 bg-[#14100d] p-4">
										<p className="text-xs uppercase tracking-[0.2em] text-[#f7e8c4]/60">RSVPs</p>
										<p className="mt-2 text-lg font-semibold tabular-nums text-[#fdf6ea]">
											{guests.length}
										</p>
									</div>
									<div className="rounded-2xl border border-white/5 bg-[#14100d] p-4">
										<p className="text-xs uppercase tracking-[0.2em] text-[#f7e8c4]/60">Updated</p>
										<p className="mt-2 text-xs text-[#f7e8c4]/70">
											{new Date(invitation.updatedAt).toLocaleDateString()}
										</p>
									</div>
								</div>
							</div>
						)
					})}
				</div>
			</div>

			<ShareModal open={shareOpen} invitation={selected} onClose={() => setShareOpen(false)} />
		</div>
	)
}
