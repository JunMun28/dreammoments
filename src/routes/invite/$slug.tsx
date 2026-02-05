import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import InvitationRenderer from '../../components/templates/InvitationRenderer'
import { buildSampleContent } from '../../data/sample-invitation'
import { submitRsvp, trackInvitationView } from '../../lib/data'
import { useStore } from '../../lib/store'

export const Route = createFileRoute('/invite/$slug')({
	component: InviteScreen,
})

const lightTemplates = new Set(['garden-romance', 'eternal-elegance', 'blush-romance'])

function formatTemplateName(templateId: string) {
	return templateId
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ')
}

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
	const [rsvpStatus, setRsvpStatus] = useState('')
	const isSample = slug.endsWith('-sample') || !invitation
	const templateId =
		(invitation?.templateSnapshot as { id?: string } | undefined)?.id ??
		invitation?.templateId ??
		resolveSampleTemplate(slug)
	const content = invitation?.content ?? buildSampleContent(templateId)
	const hiddenSections = useMemo(() => {
		if (!invitation?.sectionVisibility) return undefined
		return Object.fromEntries(
			Object.entries(invitation.sectionVisibility).map(([key, value]) => [
				key,
				!value,
			]),
		)
	}, [invitation?.sectionVisibility])

	useEffect(() => {
		if (typeof window === 'undefined') return
		if (!invitation) return
		trackInvitationView(invitation.id, navigator.userAgent, document.referrer)
	}, [invitation?.id])

	const templateLabel = useMemo(() => formatTemplateName(templateId), [templateId])
	const headerLabel = useMemo(() => {
		if (isSample) return `${templateLabel} Sample Invitation`
		return `${content.hero.partnerOneName} & ${content.hero.partnerTwoName}`
	}, [content.hero.partnerOneName, content.hero.partnerTwoName, isSample, templateLabel])
	const shellClass = lightTemplates.has(templateId)
		? 'dm-shell-light'
		: 'dm-shell-dark'

	const handleRsvpSubmit = (payload: {
		name: string
		attendance: 'attending' | 'not_attending' | 'undecided'
		guestCount: number
		dietaryRequirements?: string
		message?: string
		email?: string
	}) => {
		if (!invitation) return
		try {
			const visitorKey = localStorage.getItem('dm-visitor') ?? `${Date.now()}-${Math.random()}`
			localStorage.setItem('dm-visitor', visitorKey)
			submitRsvp(invitation.id, payload, visitorKey)
			setRsvpStatus('RSVP received. Thank you!')
		} catch {
			setRsvpStatus('RSVP limit reached. Please try again later.')
		}
	}

	return (
		<div className={`min-h-screen ${shellClass}`}>
			<header className="border-b border-[color:var(--dm-border)] px-6 py-6 text-center text-xs uppercase tracking-[0.4em] text-[color:var(--dm-accent-strong)]">
				{headerLabel}
			</header>
			<InvitationRenderer
				templateId={templateId}
				content={content}
				hiddenSections={hiddenSections}
				onRsvpSubmit={handleRsvpSubmit}
				rsvpStatus={rsvpStatus}
			/>
		</div>
	)
}
