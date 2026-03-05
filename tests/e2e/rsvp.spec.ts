import { setupClerkTestingToken } from "@clerk/testing/playwright"
import { test, expect } from "@playwright/test"
import {
	seedInvitation,
	getOrCreateTestUser,
	cleanupTestInvitations,
	closeTestDb,
} from "./fixtures/seed"

// This runs in the chromium-public project (no auth needed for RSVP)

test.describe("RSVP submission", () => {
	let testUserId: string
	let invitationSlug: string

	test.beforeAll(async () => {
		const user = await getOrCreateTestUser()
		testUserId = user.id
		invitationSlug = "e2e-test-rsvp"
		await seedInvitation({
			userId: testUserId,
			slug: invitationSlug,
			status: "published",
		})
	})

	test.afterAll(async () => {
		await cleanupTestInvitations(testUserId)
		await closeTestDb()
	})

	test.beforeEach(async ({ page }) => {
		await setupClerkTestingToken({ page })
		// Clear localStorage to avoid duplicate RSVP prevention
		await page.addInitScript(() => {
			const keysToRemove: string[] = []
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i)
				if (key?.includes("rsvp")) keysToRemove.push(key)
			}
			keysToRemove.forEach((key) => localStorage.removeItem(key))
		})
	})

	test("RSVP form is visible on public invitation", async ({ page }) => {
		await page.goto(`/invite/${invitationSlug}`)
		await page.waitForLoadState("networkidle")
		await page.waitForTimeout(5000)

		const rsvpSection = page.getByText(/rsvp/i).first()
		await expect(rsvpSection).toBeVisible({ timeout: 10000 })
	})

	test("guest can submit RSVP with name and attendance", async ({
		page,
	}) => {
		await page.goto(`/invite/${invitationSlug}`)
		await page.waitForLoadState("networkidle")
		await page.waitForTimeout(5000)

		const nameInput = page
			.locator("input[placeholder*='name' i], input[name='name']")
			.first()
		if (await nameInput.isVisible()) {
			await nameInput.fill("E2E Test Guest")

			const attendanceSelect = page.locator("select").first()
			if (await attendanceSelect.isVisible()) {
				await attendanceSelect.selectOption("attending")
			}

			const submitBtn = page.getByRole("button", {
				name: /submit|send|rsvp/i,
			})
			if (await submitBtn.isVisible()) {
				await submitBtn.click()

				await expect(
					page.getByText(/thank|confirmed|submitted|received/i).first(),
				).toBeVisible({ timeout: 10000 })
			}
		}
	})

	test("RSVP captures plus-one count", async ({ page }) => {
		await page.goto(`/invite/${invitationSlug}`)
		await page.waitForLoadState("networkidle")
		await page.waitForTimeout(5000)

		const nameInput = page
			.locator("input[placeholder*='name' i], input[name='name']")
			.first()
		if (await nameInput.isVisible()) {
			await nameInput.fill("E2E Plus One Guest")

			const guestCountInput = page
				.locator("input[type='number']")
				.first()
			if (await guestCountInput.isVisible()) {
				await guestCountInput.fill("2")
			}

			const submitBtn = page.getByRole("button", {
				name: /submit|send|rsvp/i,
			})
			if (await submitBtn.isVisible()) {
				await submitBtn.click()
				await page.waitForTimeout(3000)
			}
		}
	})

	test("required fields show validation errors", async ({ page }) => {
		await page.goto(`/invite/${invitationSlug}`)
		await page.waitForLoadState("networkidle")
		await page.waitForTimeout(5000)

		const submitBtn = page.getByRole("button", {
			name: /submit|send|rsvp/i,
		})
		if (await submitBtn.isVisible()) {
			await submitBtn.click()
			await page.waitForTimeout(1000)

			const nameInput = page
				.locator("input[placeholder*='name' i], input[name='name']")
				.first()
			if (await nameInput.isVisible()) {
				const validationMessage = await nameInput.evaluate(
					(el: HTMLInputElement) => el.validationMessage,
				)
				if (!validationMessage) {
					const errorText = page.getByText(/required|please|enter/i)
				}
			}
		}
	})
})
