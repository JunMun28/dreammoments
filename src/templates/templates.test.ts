import { describe, expect, test } from 'vitest'
import { templates, loveAtDuskTemplate } from './index'

describe('templates registry', () => {
	test('includes four templates', () => {
		expect(templates.length).toBe(4)
	})

	test('love at dusk has core sections', () => {
		const sectionIds = loveAtDuskTemplate.sections.map((section) => section.id)
		expect(sectionIds).toContain('hero')
		expect(sectionIds).toContain('announcement')
		expect(sectionIds).toContain('rsvp')
	})

	test('love at dusk tokens include palette', () => {
		expect(loveAtDuskTemplate.tokens.colors.primary).toBe('#B30E0E')
	})
})
