import type { Page } from "@playwright/test"
import { expect } from "@playwright/test"
import AxeBuilder from "@axe-core/playwright"

/**
 * Run axe-core accessibility analysis on the page or a scoped selector.
 * Asserts zero violations and returns the violations array for debugging.
 */
export async function checkAccessibility(page: Page, selector?: string) {
	let builder = new AxeBuilder({ page })
	if (selector) {
		builder = builder.include(selector)
	}
	const results = await builder.analyze()
	expect(results.violations).toEqual([])
	return results.violations
}
