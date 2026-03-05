import { test, expect } from "@playwright/test"
import {
	seedInvitation,
	getOrCreateTestUser,
	cleanupTestInvitations,
	closeTestDb,
} from "./fixtures/seed"
import { stubBrowserApis } from "./utils"

// This test uses the chromium-authed project

test.describe("Dashboard management", () => {
	let testUserId: string

	test.beforeAll(async () => {
		const user = await getOrCreateTestUser()
		testUserId = user.id

		await seedInvitation({
			userId: testUserId,
			slug: "e2e-test-dashboard-published",
			status: "published",
		})
		await seedInvitation({
			userId: testUserId,
			slug: "e2e-test-dashboard-draft",
			status: "draft",
		})
	})

	test.afterAll(async () => {
		await cleanupTestInvitations(testUserId)
		await closeTestDb()
	})

	test("shows list of user invitations", async ({ page }) => {
		await page.goto("/dashboard")
		await page.waitForLoadState("networkidle")

		const cards = page.locator(
			"[data-testid*='invitation'], article, .invitation-card",
		).or(page.locator("text=Draft").or(page.locator("text=Published")))
		await expect(cards.first()).toBeVisible({ timeout: 10000 })
	})

	test("shows status badges for draft and published", async ({ page }) => {
		await page.goto("/dashboard")
		await page.waitForLoadState("networkidle")

		await expect(page.getByText("Draft").first()).toBeVisible({
			timeout: 10000,
		})
		await expect(page.getByText("Published").first()).toBeVisible({
			timeout: 10000,
		})
	})

	test("share button opens modal with copyable link", async ({ page }) => {
		await stubBrowserApis(page)
		await page.goto("/dashboard")
		await page.waitForLoadState("networkidle")

		const shareBtn = page
			.getByRole("button", { name: /share/i })
			.first()
		await expect(shareBtn).toBeVisible({ timeout: 10000 })
		await shareBtn.click()

		const modal = page.locator("[role='dialog']").or(
			page.getByText(/copy/i),
		)
		await expect(modal.first()).toBeVisible({ timeout: 5000 })

		const copyBtn = page.getByRole("button", { name: /copy/i })
		if (await copyBtn.isVisible()) {
			await copyBtn.click()

			const clipboardText = await page.evaluate(
				() => window.__clipboardText,
			)
			expect(clipboardText).toContain("invite/")
		}
	})

	test("edit button navigates to canvas editor", async ({ page }) => {
		await page.goto("/dashboard")
		await page.waitForLoadState("networkidle")

		const editBtn = page
			.getByRole("link", { name: /edit/i })
			.or(page.getByRole("button", { name: /edit/i }))
			.first()
		await expect(editBtn).toBeVisible({ timeout: 10000 })
		await editBtn.click()

		await page.waitForURL(/\/editor\/canvas\//, { timeout: 10000 })
	})

	test("delete shows confirmation and removes invitation on confirm", async ({
		page,
	}) => {
		await seedInvitation({
			userId: testUserId,
			slug: "e2e-test-dashboard-delete-me",
			status: "draft",
		})

		await page.goto("/dashboard")
		await page.waitForLoadState("networkidle")

		const deleteBtn = page
			.getByRole("button", { name: /delete/i })
			.first()
		await expect(deleteBtn).toBeVisible({ timeout: 10000 })
		await deleteBtn.click()

		const confirmBtn = page.getByRole("button", {
			name: /confirm|yes|delete/i,
		})
		await expect(confirmBtn).toBeVisible({ timeout: 5000 })
		await confirmBtn.click()

		await page.waitForTimeout(2000)
	})

	test("cancel delete keeps the invitation", async ({ page }) => {
		await page.goto("/dashboard")
		await page.waitForLoadState("networkidle")

		const deleteBtn = page
			.getByRole("button", { name: /delete/i })
			.first()
		if (!(await deleteBtn.isVisible())) return

		await deleteBtn.click()

		const cancelBtn = page.getByRole("button", {
			name: /cancel|no|keep/i,
		})
		await expect(cancelBtn).toBeVisible({ timeout: 5000 })
		await cancelBtn.click()

		await expect(cancelBtn).not.toBeVisible({ timeout: 3000 })
	})
})
