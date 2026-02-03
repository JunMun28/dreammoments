import { describe, expect, test, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import { EditorScreen } from '../routes/editor/$invitationId'
import { InviteScreen } from '../routes/invite/$slug'
import { DashboardScreen } from '../routes/dashboard/index'

vi.mock('@tanstack/react-router', () => ({
	Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
	createFileRoute: () => () => ({}),
}))

describe('route placeholders', () => {
	test('editor renders preview label', () => {
		const markup = renderToString(<EditorScreen />)
		expect(markup).toContain('Live Preview')
	})

	test('invite renders public label', () => {
		const markup = renderToString(<InviteScreen />)
		expect(markup).toContain('Public Invitation')
	})

	test('dashboard renders heading', () => {
		const markup = renderToString(<DashboardScreen />)
		expect(markup).toContain('My Invitations')
	})
})
