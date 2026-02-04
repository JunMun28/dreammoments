import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { createInvitation, getCurrentUserId } from '../../lib/data'

export const Route = createFileRoute('/editor/new')({
	component: NewEditorRedirect,
})

function NewEditorRedirect() {
	const [invitationId, setInvitationId] = useState<string | null>(null)
	const userId = getCurrentUserId()

	useEffect(() => {
		if (!userId) return
		const params = new URLSearchParams(window.location.search)
		const templateId = params.get('template') ?? 'blush-romance'
		const invitation = createInvitation(userId, templateId)
		setInvitationId(invitation.id)
	}, [userId])

	if (!userId) {
		return <Navigate to="/auth/login" />
	}

	if (!invitationId) return null
	return <Navigate to={`/editor/${invitationId}`} />
}
