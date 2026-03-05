import { clerk } from "@clerk/testing/playwright"
import { test as setup, expect } from "@playwright/test"

const authFile = "tests/e2e/.auth/user.json"

setup("authenticate", async ({ page }) => {
	await page.goto("/")
	await clerk.signIn({
		page,
		signInParams: {
			strategy: "password",
			identifier: process.env.E2E_CLERK_USER_USERNAME!,
			password: process.env.E2E_CLERK_USER_PASSWORD!,
		},
	})

	// Wait for auth to settle
	await page.waitForTimeout(2000)

	// Verify we're signed in by checking for user button
	await expect(page.locator(".cl-userButtonTrigger")).toBeVisible({
		timeout: 10000,
	})

	// Save signed-in state
	await page.context().storageState({ path: authFile })
})
