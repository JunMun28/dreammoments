import { test, expect } from "@playwright/test"
import {
	seedInvitation,
	getOrCreateTestUser,
	cleanupTestInvitations,
	closeTestDb,
} from "./fixtures/seed"
import { setupClerkTestingToken } from "@clerk/testing/playwright"

// This runs in the mobile project (iPhone 13 viewport)

test.describe("Mobile experience", () => {
	let testUserId: string

	test.beforeAll(async () => {
		const user = await getOrCreateTestUser()
		testUserId = user.id
		await seedInvitation({
			userId: testUserId,
			slug: "e2e-test-mobile-inv",
			status: "published",
		})
	})

	test.afterAll(async () => {
		await cleanupTestInvitations(testUserId)
		await closeTestDb()
	})

	test("landing page is responsive on mobile", async ({ page }) => {
		await setupClerkTestingToken({ page })
		await page.goto("/")
		await page.waitForLoadState("networkidle")

		await expect(
			page.getByRole("heading", { level: 1 }),
		).toBeVisible({ timeout: 10000 })

		const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
		const viewportWidth = await page.evaluate(() => window.innerWidth)
		expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5)
	})

	test("hamburger menu opens navigation on mobile", async ({ page }) => {
		await setupClerkTestingToken({ page })
		await page.goto("/")
		await page.waitForLoadState("networkidle")

		const menuBtn = page
			.getByRole("button", { name: /menu/i })
			.or(page.locator("[aria-label*='menu' i]"))
		if (await menuBtn.isVisible()) {
			await menuBtn.click()

			await page.waitForTimeout(500)

			const navLinks = page.locator("nav a, [role='navigation'] a")
			await expect(navLinks.first()).toBeVisible({ timeout: 3000 })
		}
	})

	test("dashboard cards stack vertically on mobile", async ({ page }) => {
		await page.goto("/dashboard")
		await page.waitForLoadState("networkidle")

		const cards = page.locator(
			"[data-testid*='invitation'], article",
		)
		if ((await cards.count()) > 0) {
			const firstCard = cards.first()
			const box = await firstCard.boundingBox()
			if (box) {
				const viewportWidth = await page.evaluate(
					() => window.innerWidth,
				)
				expect(box.width).toBeGreaterThan(viewportWidth * 0.7)
			}
		}
	})

	test("RSVP form is usable on mobile", async ({ page }) => {
		await setupClerkTestingToken({ page })
		await page.goto("/invite/e2e-test-mobile-inv")
		await page.waitForLoadState("networkidle")
		await page.waitForTimeout(5000)

		const nameInput = page
			.locator("input[placeholder*='name' i], input[name='name']")
			.first()
		if (await nameInput.isVisible()) {
			await nameInput.tap()
			await nameInput.fill("Mobile Guest")

			const box = await nameInput.boundingBox()
			if (box) {
				expect(box.height).toBeGreaterThanOrEqual(30)
			}
		}
	})

	test("editor loads on mobile viewport", async ({ page }) => {
		const invitation = await seedInvitation({
			userId: testUserId,
			slug: "e2e-test-mobile-editor",
			status: "draft",
		})

		await page.goto(`/editor/canvas/${invitation.id}`)
		await page.waitForLoadState("networkidle")
		await page.waitForTimeout(5000)

		await expect(
			page.getByText(/error|crash/i),
		).not.toBeVisible()

		const editorContent = page.locator("main").or(
			page.locator("[data-testid*='editor']"),
		)
		await expect(editorContent.first()).toBeVisible({ timeout: 10000 })
	})
})
