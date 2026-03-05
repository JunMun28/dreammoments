import { setupClerkTestingToken, clerk } from "@clerk/testing/playwright"
import { test, expect } from "@playwright/test"

// This runs in chromium-public project (starts unauthenticated)

test.describe("Route guards & navigation", () => {
	test.beforeEach(async ({ page }) => {
		await setupClerkTestingToken({ page })
	})

	test("public routes are accessible without auth", async ({ page }) => {
		await page.goto("/")
		await expect(page).toHaveURL("/")
		await expect(page.locator("body")).not.toContainText(
			"Unable to load",
		)

		await page.goto("/terms")
		await expect(page).toHaveURL(/\/terms/)

		await page.goto("/privacy")
		await expect(page).toHaveURL(/\/privacy/)
	})

	test("sample invitation accessible without auth", async ({ page }) => {
		await page.goto("/invite/double-happiness-sample")
		await page.waitForLoadState("networkidle")
		await expect(page).toHaveURL(/\/invite\//)
	})

	test("protected routes redirect unauthenticated users", async ({
		page,
	}) => {
		await page.goto("/dashboard")
		await page.waitForLoadState("networkidle")
		await expect(
			page
				.locator(".cl-signIn-root, .cl-signIn-start")
				.or(page.getByText(/sign in/i)),
		).toBeVisible({ timeout: 15000 })

		await page.goto("/editor/new")
		await page.waitForLoadState("networkidle")
		await expect(
			page
				.locator(".cl-signIn-root, .cl-signIn-start")
				.or(page.getByText(/sign in/i)),
		).toBeVisible({ timeout: 15000 })

		await page.goto("/upgrade")
		await page.waitForLoadState("networkidle")
		await expect(
			page
				.locator(".cl-signIn-root, .cl-signIn-start")
				.or(page.getByText(/sign in/i)),
		).toBeVisible({ timeout: 15000 })
	})

	test("authenticated user can access all protected routes", async ({
		page,
	}) => {
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

		await page.goto("/editor/new")
		await page.waitForLoadState("networkidle")
		await expect(page).toHaveURL(/\/editor\/new/)

		await page.goto("/upgrade")
		await page.waitForLoadState("networkidle")
		await expect(page).toHaveURL(/\/upgrade/)
	})

	test("browser back/forward navigation works", async ({ page }) => {
		await page.goto("/")
		await page.waitForLoadState("networkidle")

		await page.goto("/terms")
		await page.waitForLoadState("networkidle")

		await page.goto("/privacy")
		await page.waitForLoadState("networkidle")

		await page.goBack()
		await expect(page).toHaveURL(/\/terms/)

		await page.goBack()
		await expect(page).toHaveURL(/^\/$|^http/)

		await page.goForward()
		await expect(page).toHaveURL(/\/terms/)
	})
})
