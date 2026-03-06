import { setupClerkTestingToken, clerk } from "@clerk/testing/playwright"
import { test, expect } from "@playwright/test"

test.describe("Authentication", () => {
	test.beforeEach(async ({ page }) => {
		await setupClerkTestingToken({ page })
	})

	test("unauthenticated user is redirected from dashboard", async ({
		page,
	}) => {
		await page.goto("/dashboard")

		await expect(
			page
				.locator(".cl-signIn-root, .cl-signIn-start")
				.or(page.getByText(/sign in/i))
				.first(),
		).toBeVisible({ timeout: 15000 })
	})

	test("unauthenticated user is redirected from editor", async ({
		page,
	}) => {
		await page.goto("/editor/new")
		await expect(
			page
				.locator(".cl-signIn-root, .cl-signIn-start")
				.or(page.getByText(/sign in/i))
				.first(),
		).toBeVisible({ timeout: 15000 })
	})

	// clerk.signIn() doesn't establish a session with @clerk/tanstack-react-start (SSR).
	// These tests are skipped until @clerk/testing adds TanStack Start support.
	// Auth is verified via UI-based sign-in in global.setup.ts and the chromium-authed project.

	test.skip("user can sign in and access dashboard", async ({ page }) => {
		// Requires clerk.signIn() which is broken with TanStack Start SSR
	})

	test.skip("signed-in user sees user button in header", async ({ page }) => {
		// Requires clerk.signIn() which is broken with TanStack Start SSR
	})

	test.skip("user can sign out", async ({ page }) => {
		// Requires clerk.signIn() which is broken with TanStack Start SSR
	})
})
