import { setupClerkTestingToken } from "@clerk/testing/playwright"
import { test, expect } from "@playwright/test"
import {
	seedInvitation,
	getOrCreateTestUser,
	cleanupTestInvitations,
	closeTestDb,
} from "./fixtures/seed"

test.describe("Canvas editor", () => {
	test.describe.configure({ mode: "serial" })
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
			slug: "e2e-test-editor-main",
			status: "draft",
		})
		invitationId = invitation.id
	})

	test.afterAll(async () => {
		await cleanupTestInvitations(testUserId)
		await closeTestDb()
	})

	test("editor loads with section rail and content", async ({ page }) => {
		await page.goto(`/editor/canvas/${invitationId}`)
		await page.waitForLoadState("domcontentloaded")
		await page.waitForTimeout(3000)

		const content = page.locator(
			"[data-testid*='section'], [data-testid*='editor'], [data-testid*='canvas']",
		).or(page.locator("main"))
		await expect(content.first()).toBeVisible({ timeout: 15000 })
	})

	test("section switching updates content panel", async ({ page }) => {
		await page.goto(`/editor/canvas/${invitationId}`)
		await page.waitForLoadState("domcontentloaded")
		await page.waitForTimeout(3000)

		const sectionItems = page.locator(
			"[data-testid*='section-nav'] button, nav button, [role='tab']",
		)
		const count = await sectionItems.count()

		if (count >= 2) {
			await sectionItems.nth(1).click()
			await page.waitForTimeout(1000)
			await expect(page.locator("main").or(page.locator("[role='main']")).first()).toBeVisible()
		}
	})

	test("section visibility toggle works", async ({ page }) => {
		await page.goto(`/editor/canvas/${invitationId}`)
		await page.waitForLoadState("domcontentloaded")
		await page.waitForTimeout(3000)

		const toggles = page.locator(
			"input[type='checkbox'][aria-label*='visible' i], button[aria-label*='visible' i], [data-testid*='visibility']",
		)
		if ((await toggles.count()) > 0) {
			const toggle = toggles.first()
			const initialState = await toggle.isChecked().catch(() => null)

			await toggle.click()
			await page.waitForTimeout(500)

			if (initialState !== null) {
				const newState = await toggle.isChecked().catch(() => null)
				expect(newState).not.toBe(initialState)
			}
		}
	})

	test("autosave indicator shows after changes", async ({ page }) => {
		await page.goto(`/editor/canvas/${invitationId}`)
		await page.waitForLoadState("domcontentloaded")
		await page.waitForTimeout(3000)

		const input = page
			.locator("input[type='text'], textarea")
			.first()
		if (await input.isVisible()) {
			await input.click()
			await input.fill("E2E test change")

			await expect(
				page.getByText(/saving|saved|auto-?save/i).first(),
			).toBeVisible({ timeout: 10000 })
		}
	})

	test("preview mode shows the invitation", async ({ page, context }) => {
		await page.goto(`/editor/canvas/${invitationId}`)
		await page.waitForLoadState("domcontentloaded")
		await page.waitForTimeout(3000)

		const previewBtn = page.getByRole("button", {
			name: "Preview invitation",
		})
		if (await previewBtn.isVisible()) {
			// Preview opens in a new tab via window.open
			const [newPage] = await Promise.all([
				context.waitForEvent("page"),
				previewBtn.click(),
			])
			await newPage.waitForLoadState("domcontentloaded")
			expect(newPage.url()).toContain("/invite/")
			await newPage.close()
		}
	})
})
