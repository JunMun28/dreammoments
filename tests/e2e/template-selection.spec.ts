import { test, expect } from "@playwright/test"

// This test uses the chromium-authed project (pre-authenticated via storageState)

test.describe("Template selection", () => {
	test("shows template grid on /editor/new", async ({ page }) => {
		await page.goto("/editor/new")
		await page.waitForLoadState("networkidle")

		const templateCards = page.locator(
			"button[aria-label*='template' i], [data-testid*='template']",
		)
		await expect(templateCards.first()).toBeVisible({ timeout: 10000 })
	})

	test("template card shows name and preview", async ({ page }) => {
		await page.goto("/editor/new")
		await page.waitForLoadState("networkidle")

		const cards = page.locator("button[aria-label*='template' i]")
		const count = await cards.count()
		expect(count).toBeGreaterThan(0)

		const firstCard = cards.first()
		const text = await firstCard.textContent()
		expect(text?.length).toBeGreaterThan(0)
	})

	test("clicking template opens preview modal", async ({ page }) => {
		await page.goto("/editor/new")
		await page.waitForLoadState("networkidle")

		const cards = page.locator("button[aria-label*='template' i]")
		await cards.first().click()

		const modal = page.locator(
			"[role='dialog'], [data-testid='template-preview']",
		)
		await expect(modal).toBeVisible({ timeout: 5000 })
	})

	test("'Use this template' creates invitation and redirects to editor", async ({
		page,
	}) => {
		await page.goto("/editor/new")
		await page.waitForLoadState("networkidle")

		const cards = page.locator("button[aria-label*='template' i]")
		await cards.first().click()

		const useButton = page.getByRole("button", {
			name: /use this template|create|select/i,
		})
		await expect(useButton).toBeVisible({ timeout: 5000 })
		await useButton.click()

		await page.waitForURL(/\/editor\/canvas\//, { timeout: 15000 })
		expect(page.url()).toMatch(/\/editor\/canvas\//)
	})
})
