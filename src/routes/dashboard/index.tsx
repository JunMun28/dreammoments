import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/')({
	component: DashboardScreen,
})

export function DashboardScreen() {
	return (
		<div className="min-h-screen bg-[#0c0a08] px-6 py-10">
			<div className="mx-auto max-w-6xl space-y-8">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<p className="text-xs uppercase tracking-[0.4em] text-[#d8b25a]">
							Dashboard
						</p>
						<h1 className="mt-2 text-3xl font-semibold text-[#fdf6ea]">
							My Invitations
						</h1>
					</div>
					<Link
						to="/editor/new"
						className="rounded-full bg-[#d8b25a] px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#0c0a08]"
					>
						New Invitation
					</Link>
				</div>

				<div className="grid gap-4 lg:grid-cols-3">
					{['Love at Dusk', 'Garden Romance', 'Eternal Elegance'].map(
						(name, index) => (
							<div
								key={name}
								className="rounded-3xl border border-white/10 bg-[#0f0c0a] p-6"
							>
								<p className="text-xs uppercase tracking-[0.3em] text-[#d8b25a]">
									Draft
								</p>
								<h2 className="mt-3 text-xl font-semibold text-[#fdf6ea]">
									{name}
								</h2>
								<p className="mt-2 text-sm text-[#f7e8c4]/70">
									Placeholder invitation card {index + 1}
								</p>
								<div className="mt-6 flex gap-3 text-xs uppercase tracking-[0.2em]">
									<Link
										to="/editor/$invitationId"
										params={{ invitationId: `draft-${index + 1}` }}
										className="rounded-full border border-white/20 px-4 py-2 text-[#f7e8c4]"
									>
										Edit
									</Link>
									<Link
										to="/dashboard/$invitationId"
										params={{ invitationId: `draft-${index + 1}` }}
										className="rounded-full border border-white/20 px-4 py-2 text-[#f7e8c4]"
									>
										Manage
									</Link>
								</div>
							</div>
						),
					)}
				</div>
			</div>
		</div>
	)
}
