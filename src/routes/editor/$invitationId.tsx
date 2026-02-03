import { createFileRoute } from '@tanstack/react-router'
import TemplateRenderer from '../../components/templates/TemplateRenderer'
import { loveAtDuskTemplate } from '../../templates'

export const Route = createFileRoute('/editor/$invitationId')({
	component: EditorScreen,
})

export function EditorScreen() {
	return (
		<div className="min-h-screen bg-[#0c0a08] px-6 py-10">
			<div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.6fr_0.4fr]">
				<div className="rounded-3xl border border-white/10 bg-[#0f0c0a] p-6">
					<p className="text-xs uppercase tracking-[0.4em] text-[#d8b25a]">
						Live Preview
					</p>
					<TemplateRenderer template={loveAtDuskTemplate} className="mt-6" />
				</div>
				<div className="rounded-3xl border border-white/10 bg-[#100d0a] p-6">
					<p className="text-xs uppercase tracking-[0.4em] text-[#d8b25a]">
						Section Editor
					</p>
					<h2 className="mt-4 text-xl font-semibold text-[#fdf6ea]">
						Contextual form panel
					</h2>
					<p className="mt-3 text-sm text-[#f7e8c4]/70">
						This panel will switch based on the preview scroll position.
						Autosave, validation, and AI helpers are planned in Phase 2.
					</p>
					<div className="mt-6 space-y-3 text-sm text-[#f7e8c4]/70">
						<div className="rounded-2xl border border-white/10 bg-[#14100d] p-4">
							Hero section form placeholder
						</div>
						<div className="rounded-2xl border border-white/10 bg-[#14100d] p-4">
							Announcement section form placeholder
						</div>
						<div className="rounded-2xl border border-white/10 bg-[#14100d] p-4">
							RSVP section form placeholder
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
