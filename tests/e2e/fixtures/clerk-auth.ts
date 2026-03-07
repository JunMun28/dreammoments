import { clerk, setupClerkTestingToken } from "@clerk/testing/playwright"
import { test as base } from "@playwright/test"

/**
 * Extended test fixture that signs in via Clerk before each test.
 * Use `authedTest` instead of `test` for tests that need authentication.
 */
export const authedTest = base.extend({
	page: async ({ page }, use) => {
		// Set up Clerk testing token (bypasses bot detection)
		await setupClerkTestingToken({ page })

		// Navigate to app and sign in
		await page.goto("/")
		await page.waitForLoadState("domcontentloaded")
		await page.waitForTimeout(3000)

		await clerk.signIn({
			page,
			signInParams: {
				strategy: "password",
				identifier: process.env.E2E_CLERK_USER_USERNAME!,
				password: process.env.E2E_CLERK_USER_PASSWORD!,
			},
		})

		// Wait for session to establish
		await page.waitForTimeout(3000)

		await use(page)
	},
})

export { expect } from "@playwright/test"
