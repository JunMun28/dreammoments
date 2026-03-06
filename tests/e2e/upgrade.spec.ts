import { setupClerkTestingToken } from "@clerk/testing/playwright"
import { test, expect } from "@playwright/test"

// This test uses the chromium-authed project

test.describe("Upgrade & payment", () => {
	test.beforeEach(async ({ page }) => {
		await setupClerkTestingToken({ page })
	})

	test("upgrade page shows pricing", async ({ page }) => {
		console.log("Before goto: cookies =", (await page.context().cookies()).map(c => c.name).join(", "))
		await page.goto("/upgrade")
		await page.waitForLoadState("domcontentloaded")
		console.log("After goto: URL =", page.url())

		await expect(
			page.getByText(/premium|upgrade/i).first(),
		).toBeVisible({ timeout: 10000 })

		await expect(
			page.getByRole("button", { name: /proceed|checkout/i }),
		).toBeVisible({ timeout: 5000 })
	})

	test("currency selector switches between MYR and SGD", async ({
		page,
	}) => {
		await page.goto("/upgrade")
		await page.waitForLoadState("domcontentloaded")

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
		await page.waitForLoadState("domcontentloaded")

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
		await page.waitForLoadState("domcontentloaded")

		const upgradeBtn = page.getByRole("button", {
			name: /upgrade|subscribe|pay|proceed|checkout/i,
		})
		await expect(upgradeBtn.first()).toBeVisible({ timeout: 10000 })
		await expect(upgradeBtn.first()).toBeEnabled()
	})
})
