import { setupClerkTestingToken } from "@clerk/testing/playwright"
import { test, expect } from "@playwright/test"

// This runs in chromium-authed project (uses saved auth state)

test.describe("Authenticated routing", () => {
	test.beforeEach(async ({ page }) => {
		await setupClerkTestingToken({ page })
	})

	test("authenticated user can access all protected routes", async ({
		page,
	}) => {
		await page.goto("/dashboard")
		await page.waitForLoadState("domcontentloaded")
		await page.waitForTimeout(3000)
		await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 })

		await page.goto("/editor/new")
		await page.waitForLoadState("domcontentloaded")
		await page.waitForTimeout(3000)
		await expect(page).toHaveURL(/\/editor\/new/, { timeout: 15000 })

		await page.goto("/upgrade")
		await page.waitForLoadState("domcontentloaded")
		await page.waitForTimeout(3000)
		await expect(page).toHaveURL(/\/upgrade/, { timeout: 15000 })
	})
})
