import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo } from 'react'
import InvitationRenderer from '../../components/templates/InvitationRenderer'
import { buildSampleContent } from '../../data/sample-invitation'
import { getInvitationBySlug, trackInvitationView } from '../../lib/data'
import { useStore } from '../../lib/store'

export const Route = createFileRoute('/invite/$slug')({
	component: InviteScreen,
})

const lightTemplates = new Set(['garden-romance', 'eternal-elegance', 'blush-romance'])

function resolveSampleTemplate(slug: string) {
	if (slug.includes('blush-romance')) return 'blush-romance'
	if (slug.includes('garden-romance')) return 'garden-romance'
	if (slug.includes('eternal-elegance')) return 'eternal-elegance'
	return 'love-at-dusk'
}

export function InviteScreen() {
	const { slug } = Route.useParams()
	const invitation = useStore((store) =>
		store.invitations.find((item) => item.slug === slug),
	)
	const isSample = slug.endsWith('-sample') || !invitation
	const templateId = invitation?.templateId ?? resolveSampleTemplate(slug)
	const content = invitation?.content ?? buildSampleContent(templateId)

	useEffect(() => {
		if (typeof window === 'undefined') return
		if (!invitation) return
		trackInvitationView(invitation.id, navigator.userAgent, document.referrer)
	}, [invitation?.id])

	const headerLabel = useMemo(() => {
		if (isSample) return `${templateId.replace('-', ' ')} sample invitation`
		return `${content.hero.partnerOneName} & ${content.hero.partnerTwoName}`
	}, [content.hero.partnerOneName, content.hero.partnerTwoName, isSample, templateId])

	const shellClass = lightTemplates.has(templateId)
		? 'dm-shell-light'
		: 'dm-shell-dark'

	return (
		<div className={`min-h-screen ${shellClass}`}>
			<header className="border-b border-[color:var(--dm-border)] px-6 py-6 text-center text-xs uppercase tracking-[0.4em] text-[color:var(--dm-accent-strong)]">
				{headerLabel}
			</header>
			<InvitationRenderer templateId={templateId} content={content} />
		</div>
	)
}
