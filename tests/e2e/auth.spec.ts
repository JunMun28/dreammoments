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
				.or(page.getByText(/sign in/i)),
		).toBeVisible({ timeout: 15000 })
	})

	test("unauthenticated user is redirected from editor", async ({
		page,
	}) => {
		await page.goto("/editor/new")
		await expect(
			page
				.locator(".cl-signIn-root, .cl-signIn-start")
				.or(page.getByText(/sign in/i)),
		).toBeVisible({ timeout: 15000 })
	})

	test("user can sign in and access dashboard", async ({ page }) => {
		await page.goto("/")

		await clerk.signIn({
			page,
			signInParams: {
				strategy: "password",
				identifier: process.env.E2E_CLERK_USER_USERNAME!,
				password: process.env.E2E_CLERK_USER_PASSWORD!,
			},
		})

		await page.goto("/dashboard")
		await page.waitForLoadState("networkidle")

		await expect(page).toHaveURL(/\/dashboard/)
	})

	test("signed-in user sees user button in header", async ({ page }) => {
		await page.goto("/")

		await clerk.signIn({
			page,
			signInParams: {
				strategy: "password",
				identifier: process.env.E2E_CLERK_USER_USERNAME!,
				password: process.env.E2E_CLERK_USER_PASSWORD!,
			},
		})

		await page.goto("/dashboard")
		await page.waitForLoadState("networkidle")

		await expect(
			page.locator(".cl-userButtonTrigger"),
		).toBeVisible({ timeout: 10000 })
	})

	test("user can sign out", async ({ page }) => {
		await page.goto("/")

		await clerk.signIn({
			page,
			signInParams: {
				strategy: "password",
				identifier: process.env.E2E_CLERK_USER_USERNAME!,
				password: process.env.E2E_CLERK_USER_PASSWORD!,
			},
		})

		await page.goto("/dashboard")
		await page.waitForLoadState("networkidle")

		await page.locator(".cl-userButtonTrigger").click()

		await page
			.locator(".cl-userButtonPopoverActionButton__signOut")
			.or(page.getByText(/sign out/i))
			.click()

		await page.goto("/dashboard")
		await expect(
			page
				.locator(".cl-signIn-root, .cl-signIn-start")
				.or(page.getByText(/sign in/i)),
		).toBeVisible({ timeout: 15000 })
	})
})
