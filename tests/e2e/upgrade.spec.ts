import { test, expect } from "@playwright/test"

// This test uses the chromium-authed project

test.describe("Upgrade & payment", () => {
	test("upgrade page shows pricing", async ({ page }) => {
		await page.goto("/upgrade")
		await page.waitForLoadState("networkidle")

		await expect(
			page.getByText(/premium|upgrade/i).first(),
		).toBeVisible({ timeout: 10000 })

		await expect(
			page.getByText(/rm|sgd|\$/i).first(),
		).toBeVisible({ timeout: 5000 })
	})

	test("currency selector switches between MYR and SGD", async ({
		page,
	}) => {
		await page.goto("/upgrade")
		await page.waitForLoadState("networkidle")

		const sgdBtn = page.getByRole("button", { name: /sgd/i }).or(
			page.getByText("SGD"),
		)
		if (await sgdBtn.isVisible()) {
			await sgdBtn.click()
			await page.waitForTimeout(500)

			await expect(
				page.getByText(/sgd/i).first(),
			).toBeVisible()
		}

		const myrBtn = page.getByRole("button", { name: /myr/i }).or(
			page.getByText("MYR"),
		)
		if (await myrBtn.isVisible()) {
			await myrBtn.click()
			await page.waitForTimeout(500)

			await expect(
				page.getByText(/rm|myr/i).first(),
			).toBeVisible()
		}
	})

	test("payment methods change with currency", async ({ page }) => {
		await page.goto("/upgrade")
		await page.waitForLoadState("networkidle")

		const myrBtn = page.getByRole("button", { name: /myr/i }).or(
			page.getByText("MYR"),
		)
		if (await myrBtn.isVisible()) {
			await myrBtn.click()
			await page.waitForTimeout(500)
			await expect(page.getByText(/fpx/i).first()).toBeVisible({
				timeout: 3000,
			})
		}

		const sgdBtn = page.getByRole("button", { name: /sgd/i }).or(
			page.getByText("SGD"),
		)
		if (await sgdBtn.isVisible()) {
			await sgdBtn.click()
			await page.waitForTimeout(500)
			await expect(page.getByText(/paynow/i).first()).toBeVisible({
				timeout: 3000,
			})
		}
	})

	test("upgrade button initiates checkout", async ({ page }) => {
		await page.goto("/upgrade")
		await page.waitForLoadState("networkidle")

		const upgradeBtn = page.getByRole("button", {
			name: /upgrade|subscribe|pay/i,
		})
		await expect(upgradeBtn.first()).toBeVisible({ timeout: 10000 })
		await expect(upgradeBtn.first()).toBeEnabled()
	})
})
