import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/$invitationId/')({
	component: InvitationDashboard,
})

export function InvitationDashboard() {
	return (
		<div className="min-h-screen bg-[#0c0a08] px-6 py-10">
			<div className="mx-auto max-w-6xl space-y-8">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<p className="text-xs uppercase tracking-[0.4em] text-[#d8b25a]">
							Invitation Overview
						</p>
						<h1 className="mt-2 text-3xl font-semibold text-[#fdf6ea]">
							Love at Dusk
						</h1>
					</div>
					<Link
						to="/editor/$invitationId"
						params={{ invitationId: 'draft-1' }}
						className="rounded-full border border-white/20 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f7e8c4]"
					>
						Open Editor
					</Link>
				</div>

				<div className="grid gap-4 lg:grid-cols-3">
					<div className="rounded-3xl border border-white/10 bg-[#0f0c0a] p-6">
						<p className="text-xs uppercase tracking-[0.3em] text-[#d8b25a]">
							RSVP
						</p>
						<p className="mt-3 text-2xl font-semibold text-[#fdf6ea]">0</p>
						<p className="mt-1 text-sm text-[#f7e8c4]/70">Responses</p>
					</div>
					<div className="rounded-3xl border border-white/10 bg-[#0f0c0a] p-6">
						<p className="text-xs uppercase tracking-[0.3em] text-[#d8b25a]">
							Views
						</p>
						<p className="mt-3 text-2xl font-semibold text-[#fdf6ea]">0</p>
						<p className="mt-1 text-sm text-[#f7e8c4]/70">Total views</p>
					</div>
					<div className="rounded-3xl border border-white/10 bg-[#0f0c0a] p-6">
						<p className="text-xs uppercase tracking-[0.3em] text-[#d8b25a]">
							Status
						</p>
						<p className="mt-3 text-2xl font-semibold text-[#fdf6ea]">Draft</p>
						<p className="mt-1 text-sm text-[#f7e8c4]/70">
							Publish when ready
						</p>
					</div>
				</div>

				<div className="rounded-3xl border border-white/10 bg-[#0f0c0a] p-6">
					<h2 className="text-xl font-semibold text-[#fdf6ea]">
						RSVP Management
					</h2>
					<p className="mt-2 text-sm text-[#f7e8c4]/70">
						Guest list, filters, and CSV export will live here.
					</p>
				</div>
			</div>
		</div>
	)
}
