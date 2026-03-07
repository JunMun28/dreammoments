import { clerk, setupClerkTestingToken } from "@clerk/testing/playwright"
import { test as setup, expect } from "@playwright/test"

const authFile = "tests/e2e/.auth/user.json"

setup("authenticate", async ({ page }) => {
	setup.setTimeout(120000)

	// Must set up testing token before navigating to avoid redirect loops
	await setupClerkTestingToken({ page })

	await page.goto("/")
	await page.waitForLoadState("domcontentloaded")
	// Wait for the app to hydrate and Clerk to initialize
	await page.waitForTimeout(5000)

	await clerk.signIn({
		page,
		signInParams: {
			strategy: "password",
			identifier: process.env.E2E_CLERK_USER_USERNAME!,
			password: process.env.E2E_CLERK_USER_PASSWORD!,
		},
	})

	// Wait for auth to settle
	await page.waitForTimeout(3000)

	// Navigate to a protected page to verify auth works and capture session cookies
	await page.goto("/dashboard")
	await page.waitForLoadState("domcontentloaded")
	await page.waitForTimeout(5000)

	// Verify we're on the dashboard (not redirected to sign-in)
	expect(page.url()).toContain("/dashboard")

	// Save signed-in state with proper session cookies
	await page.context().storageState({ path: authFile })
})
