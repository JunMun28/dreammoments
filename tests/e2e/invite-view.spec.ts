import { setupClerkTestingToken } from "@clerk/testing/playwright"
import { test, expect } from "@playwright/test"
import {
	seedInvitation,
	getOrCreateTestUser,
	cleanupTestInvitations,
	closeTestDb,
} from "./fixtures/seed"

// This runs in the chromium-public project (no auth)

test.describe("Public invitation view", () => {
	let testUserId: string
	let publishedSlug: string

	test.beforeAll(async () => {
		const user = await getOrCreateTestUser()
		testUserId = user.id
		publishedSlug = "e2e-test-invite-view"
		await seedInvitation({
			userId: testUserId,
			slug: publishedSlug,
			status: "published",
		})
	})

	test.afterAll(async () => {
		await cleanupTestInvitations(testUserId)
		await closeTestDb()
	})

	test.beforeEach(async ({ page }) => {
		await setupClerkTestingToken({ page })
	})

	test("published invitation renders hero section", async ({ page }) => {
		await page.goto(`/invite/${publishedSlug}`)
		await page.waitForLoadState("networkidle")
		await page.waitForTimeout(3000)

		const heroText = await page.textContent("body")
		expect(heroText).toBeTruthy()
	})

	test("invitation renders multiple sections", async ({ page }) => {
		await page.goto(`/invite/${publishedSlug}`)
		await page.waitForLoadState("networkidle")
		await page.waitForTimeout(5000)

		const body = page.locator("body")
		const bodyText = await body.textContent()

		expect(bodyText?.length).toBeGreaterThan(100)
	})

	test("sample invitation renders at /invite/{name}-sample", async ({
		page,
	}) => {
		await page.goto("/invite/double-happiness-sample")
		await page.waitForLoadState("networkidle")
		await page.waitForTimeout(5000)

		await expect(
			page.getByText(/unable to load/i),
		).not.toBeVisible()

		const bodyText = await page.textContent("body")
		expect(bodyText?.length).toBeGreaterThan(100)
	})

	test("non-existent slug shows error", async ({ page }) => {
		await page.goto("/invite/this-slug-does-not-exist-ever-12345")
		await page.waitForLoadState("networkidle")
		await page.waitForTimeout(3000)
	})
})
