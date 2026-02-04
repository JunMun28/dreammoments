import { describe, expect, test, vi } from 'vitest'
import { renderToString } from 'react-dom/server'
import { Landing } from '../routes/index'

vi.mock('@tanstack/react-router', () => ({
	Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
	createFileRoute: () => () => ({}),
}))

describe('landing page', () => {
	test('renders hero headline', () => {
		const markup = renderToString(<Landing />)
		expect(markup).toContain('A wedding invitation')
		expect(markup).toContain('Templates')
		expect(markup).toContain('How it works')
		expect(markup).toContain('Pricing')
	})

	test('renders three full template sections', () => {
		const markup = renderToString(<Landing />)
		const matches = markup.match(/data-template-section=/g) ?? []
		expect(matches).toHaveLength(3)
	})
})
