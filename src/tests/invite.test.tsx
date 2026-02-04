import { describe, expect, test, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import InvitationRenderer from '../components/templates/InvitationRenderer'
import { buildSampleContent } from '../data/sample-invitation'

vi.mock('@tanstack/react-router', () => ({
	Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
	createFileRoute: () => () => ({}),
}))

describe('invite template', () => {
	test('love at dusk renders 11 sections', () => {
		const markup = renderToString(
			<InvitationRenderer
				templateId="love-at-dusk"
				content={buildSampleContent('love-at-dusk')}
			/>
		)
		const matches = markup.match(/data-section=/g) ?? []
		expect(matches).toHaveLength(11)
	})
})
