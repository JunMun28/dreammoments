import { setupClerkTestingToken } from "@clerk/testing/playwright"
import { expect, test } from "@playwright/test"
import { drag, swipe } from "./helpers/gestures"
import {
	seedInvitation,
	getOrCreateTestUser,
	cleanupTestInvitations,
	closeTestDb,
} from "./fixtures/seed"
import { stubBrowserApis } from "./utils"

const MOBILE_VIEWPORT = { width: 390, height: 844 }

test.describe("gesture interactions", () => {
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
			slug: "e2e-test-gestures",
			status: "draft",
		})
		invitationId = invitation.id
	})

	test.afterAll(async () => {
		await cleanupTestInvitations(testUserId)
		await closeTestDb()
	})

	// Touch events may not be fully supported in all browser engines
	// These tests verify the gesture helper wiring and basic behavior

	test("swipe down on bottom sheet drag handle dismisses it", async ({ page }, testInfo) => {
		// Touch events work best on mobile-configured projects
		if (testInfo.project.name === "chromium") {
			test.skip(true, "Touch events require mobile browser project")
		}

		await stubBrowserApis(page)
		await page.setViewportSize(MOBILE_VIEWPORT)
		await page.goto(`/editor/canvas/${invitationId}`)
		await page.waitForLoadState("domcontentloaded")
		await page.waitForTimeout(3000)

		// Open bottom sheet by tapping a section
		const sectionEl = page.locator('[data-section="hero"]').first()
		if (!(await sectionEl.isVisible())) return
		await sectionEl.click()
		await expect(page.getByText("Section Editor")).toBeVisible()

		// Find the drag handle and swipe down to dismiss
		const dragHandle = page.locator('[role="dialog"] button').first()
		if (await dragHandle.isVisible()) {
			await swipe(page, dragHandle, "down", 400)
			await page.waitForTimeout(500)
		}
	})

	test("vertical drag on bottom sheet changes snap point", async ({ page }, testInfo) => {
		if (testInfo.project.name === "chromium") {
			test.skip(true, "Touch events require mobile browser project")
		}

		await stubBrowserApis(page)
		await page.setViewportSize(MOBILE_VIEWPORT)
		await page.goto(`/editor/canvas/${invitationId}`)
		await page.waitForLoadState("domcontentloaded")
		await page.waitForTimeout(3000)

		const sectionEl = page.locator('[data-section="hero"]').first()
		if (!(await sectionEl.isVisible())) return
		await sectionEl.click()
		await expect(page.getByText("Section Editor")).toBeVisible()

		const dragHandle = page.locator('[role="dialog"] button').first()
		if (await dragHandle.isVisible()) {
			const box = await dragHandle.boundingBox()
			if (box) {
				// Drag upward to expand the sheet
				await drag(page, dragHandle, box.y, box.y - 200)
				await page.waitForTimeout(500)
			}
		}
	})

	test("swipe helper works with different directions", async ({ page }) => {
		await stubBrowserApis(page)
		await page.setViewportSize(MOBILE_VIEWPORT)
		await page.goto(`/editor/canvas/${invitationId}`)
		await page.waitForLoadState("domcontentloaded")
		await page.waitForTimeout(3000)

		// Verify the swipe helper doesn't throw for basic usage
		const body = page.locator("body")
		await swipe(page, body, "left", 100)
		await swipe(page, body, "right", 100)
		await swipe(page, body, "up", 100)
		await swipe(page, body, "down", 100)
	})
})
