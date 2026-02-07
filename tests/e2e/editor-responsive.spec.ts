import { expect, test } from "@playwright/test"
import {
	buildSeedStore,
	seedInvitations,
	seedLocalStorage,
	stubBrowserApis,
	testUsers,
	waitForStoreHydration,
} from "./utils"

const VIEWPORTS = [
	{ name: "iPhone SE", width: 375, height: 667 },
	{ name: "iPhone 14 Pro", width: 390, height: 844 },
	{ name: "iPad Portrait", width: 768, height: 1024 },
	{ name: "iPad Landscape", width: 1024, height: 768 },
	{ name: "Laptop", width: 1440, height: 900 },
	{ name: "Desktop XL", width: 1920, height: 1080 },
]

const setupEditor = async (page: any) => {
	await page.addInitScript(() => {
		class NoopObserver {
			observe() {}
			unobserve() {}
			disconnect() {}
		}
		// @ts-expect-error test override
		window.IntersectionObserver = NoopObserver
	})
	const store = buildSeedStore({ currentUserId: testUsers.free.id })
	await seedLocalStorage(page, store)
	await stubBrowserApis(page)
}

for (const viewport of VIEWPORTS) {
	test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
		test("editor initial load", async ({ page }) => {
			await setupEditor(page)
			await page.setViewportSize({ width: viewport.width, height: viewport.height })
			await page.goto(`/editor/${seedInvitations.love.id}`)
			await waitForStoreHydration(page)

			await expect(page.getByRole("heading", { name: "Sarah & Michael", exact: true })).toBeVisible()
			await expect(page).toHaveScreenshot(
				`${viewport.name.replace(/\s/g, "-")}-initial.png`,
				{ maxDiffPixelRatio: 0.01, animations: "disabled" },
			)
		})

		test("editor preview mode", async ({ page }) => {
			await setupEditor(page)
			await page.setViewportSize({ width: viewport.width, height: viewport.height })
			await page.goto(`/editor/${seedInvitations.love.id}`)
			await waitForStoreHydration(page)

			// Open preview mode via button (desktop) or overflow menu (mobile)
			if (viewport.width >= 768) {
				await page.getByRole("button", { name: "Preview", exact: true }).click()
			} else {
				const moreBtn = page.getByRole("button", { name: "More actions" })
				if (await moreBtn.isVisible()) {
					await moreBtn.click()
					await page.getByRole("button", { name: "Preview" }).click()
				}
			}

			await expect(page).toHaveScreenshot(
				`${viewport.name.replace(/\s/g, "-")}-preview.png`,
				{ maxDiffPixelRatio: 0.01, animations: "disabled" },
			)
		})
	})
}
