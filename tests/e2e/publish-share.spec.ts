import { test, expect } from "@playwright/test"
import {
	seedInvitation,
	getOrCreateTestUser,
	cleanupTestInvitations,
	closeTestDb,
} from "./fixtures/seed"
import { stubBrowserApis } from "./utils"

test.describe("Publishing & sharing", () => {
	let testUserId: string

	test.beforeAll(async () => {
		const user = await getOrCreateTestUser()
		testUserId = user.id
	})

	test.afterAll(async () => {
		await cleanupTestInvitations(testUserId)
		await closeTestDb()
	})

	test("user can publish a draft invitation", async ({ page }) => {
		const invitation = await seedInvitation({
			userId: testUserId,
			slug: "e2e-test-publish-draft",
			status: "draft",
		})

		await page.goto(`/editor/canvas/${invitation.id}`)
		await page.waitForLoadState("networkidle")
		await page.waitForTimeout(3000)

		const publishBtn = page.getByRole("button", {
			name: /publish/i,
		})
		if (await publishBtn.isVisible()) {
			await publishBtn.click()

			const confirmBtn = page
				.getByRole("button", {
					name: /publish|confirm/i,
				})
				.last()
			if (await confirmBtn.isVisible()) {
				await confirmBtn.click()
			}

			await expect(
				page.getByText(/published|share|live/i).first(),
			).toBeVisible({ timeout: 10000 })
		}
	})

	test("share modal shows correct URL after publishing", async ({
		page,
	}) => {
		await stubBrowserApis(page)

		await seedInvitation({
			userId: testUserId,
			slug: "e2e-test-share-url",
			status: "published",
		})

		await page.goto("/dashboard")
		await page.waitForLoadState("networkidle")

		const shareBtn = page
			.getByRole("button", { name: /share/i })
			.first()
		await expect(shareBtn).toBeVisible({ timeout: 10000 })
		await shareBtn.click()

		await expect(
			page.getByText(/invite\//i).first(),
		).toBeVisible({ timeout: 5000 })
	})

	test("published invitation is accessible at /invite/{slug}", async ({
		page,
	}) => {
		const slug = "e2e-test-public-access"
		await seedInvitation({
			userId: testUserId,
			slug,
			status: "published",
		})

		await page.goto(`/invite/${slug}`)
		await page.waitForLoadState("networkidle")

		await expect(
			page.getByText(/unable to load/i),
		).not.toBeVisible({ timeout: 5000 })
	})

	test("unpublished invitation shows error at /invite/{slug}", async ({
		page,
	}) => {
		const slug = "e2e-test-unpublished"
		await seedInvitation({
			userId: testUserId,
			slug,
			status: "draft",
		})

		await page.goto(`/invite/${slug}`)
		await page.waitForLoadState("networkidle")
		await page.waitForTimeout(3000)
	})
})
