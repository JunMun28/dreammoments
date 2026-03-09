import { setupClerkTestingToken } from "@clerk/testing/playwright"
import { expect, test } from "@playwright/test"
import {
	seedInvitation,
	getOrCreateTestUser,
	cleanupTestInvitations,
	closeTestDb,
} from "./fixtures/seed"
import { stubBrowserApis } from "./utils"

const VIEWPORTS = [
	{ name: "iPhone SE", width: 375, height: 667 },
	{ name: "iPhone 14 Pro", width: 390, height: 844 },
	{ name: "iPad Portrait", width: 768, height: 1024 },
	{ name: "iPad Landscape", width: 1024, height: 768 },
	{ name: "Laptop", width: 1440, height: 900 },
	{ name: "Desktop XL", width: 1920, height: 1080 },
]

test.describe("editor responsive viewports", () => {
	let testUserId: string
	let invitationId: string

	test.beforeEach(async ({ page }) => {
		await setupClerkTestingToken({ page })
	})

	test.beforeAll(async () => {
		const user = await getOrCreateTestUser()
		testUserId = user.id
		const invitation = await seedInvitation({
			userId: testUserId,
			slug: "e2e-test-responsive",
			status: "draft",
		})
		invitationId = invitation.id
	})

	test.afterAll(async () => {
		await cleanupTestInvitations(testUserId)
		await closeTestDb()
	})

	for (const viewport of VIEWPORTS) {
		test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
			test("editor initial load", async ({ page }) => {
				await stubBrowserApis(page)
				await page.setViewportSize({ width: viewport.width, height: viewport.height })
				await page.goto(`/editor/canvas/${invitationId}`)
				await page.waitForLoadState("domcontentloaded")
				await page.waitForTimeout(3000)

				const content = page
					.locator("[data-testid*='section'], [data-testid*='editor'], [data-testid*='canvas']")
					.or(page.locator("main"))
				await expect(content.first()).toBeVisible({ timeout: 15000 })

				await expect(page).toHaveScreenshot(
					`${viewport.name.replace(/\s/g, "-")}-initial.png`,
					{ maxDiffPixelRatio: 0.01, animations: "disabled" },
				)
			})

			test("editor preview mode", async ({ page }) => {
				await stubBrowserApis(page)
				await page.setViewportSize({ width: viewport.width, height: viewport.height })
				await page.goto(`/editor/canvas/${invitationId}`)
				await page.waitForLoadState("domcontentloaded")
				await page.waitForTimeout(3000)

				// Open preview mode via button (desktop) or overflow menu (mobile)
				if (viewport.width >= 768) {
					const previewBtn = page.getByRole("button", { name: "Preview invitation" })
					if (await previewBtn.isVisible()) {
						await previewBtn.click()
					}
				} else {
					const moreBtn = page.getByRole("button", { name: "More actions" })
					if (await moreBtn.isVisible()) {
						await moreBtn.click()
						await page.getByRole("button", { name: "Preview invitation" }).click()
					}
				}

				await expect(page).toHaveScreenshot(
					`${viewport.name.replace(/\s/g, "-")}-preview.png`,
					{ maxDiffPixelRatio: 0.01, animations: "disabled" },
				)
			})
		})
	}
})
