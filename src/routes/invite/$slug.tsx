import { createFileRoute } from '@tanstack/react-router'
import TemplateRenderer from '../../components/templates/TemplateRenderer'
import { loveAtDuskTemplate } from '../../templates'

export const Route = createFileRoute('/invite/$slug')({
	component: InviteScreen,
})

function InviteScreen() {
	return (
		<div className="min-h-screen bg-[#0c0a08] px-6 py-10">
			<div className="mx-auto max-w-5xl">
				<p className="text-xs uppercase tracking-[0.4em] text-[#d8b25a]">
					Public Invitation
				</p>
				<h1 className="mt-4 text-3xl font-semibold text-[#fdf6ea]">
					Love at Dusk — Sample View
				</h1>
				<p className="mt-2 text-sm text-[#f7e8c4]/70">
					This is a placeholder renderer for the published invitation view.
				</p>
				<TemplateRenderer template={loveAtDuskTemplate} className="mt-8" />
			</div>
		</div>
	)
}
