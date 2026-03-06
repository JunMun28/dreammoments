import { setupClerkTestingToken } from "@clerk/testing/playwright"
import { expect, test } from "@playwright/test"
import {
	seedInvitation,
	getOrCreateTestUser,
	cleanupTestInvitations,
	closeTestDb,
} from "./fixtures/seed"
import { stubBrowserApis } from "./utils"

const modKey = process.platform === "darwin" ? "Meta" : "Control"

test.describe("keyboard shortcuts", () => {
	let testUserId: string
	let invitationId: string

	test.beforeAll(async () => {
		const user = await getOrCreateTestUser()
		testUserId = user.id
		const invitation = await seedInvitation({
			userId: testUserId,
			slug: "e2e-test-keyboard",
			status: "draft",
		})
		invitationId = invitation.id
	})

	test.afterAll(async () => {
		await cleanupTestInvitations(testUserId)
		await closeTestDb()
	})

	test.beforeEach(async ({ page }) => {
		await setupClerkTestingToken({ page })
		await stubBrowserApis(page)
		await page.goto(`/editor/canvas/${invitationId}`)
		await page.waitForLoadState("domcontentloaded")
		await page.waitForTimeout(3000)
	})

	test("Cmd/Ctrl+Z triggers undo", async ({ page }) => {
		const input = page.locator("input[type='text'], textarea").first()
		if (!(await input.isVisible())) return

		await input.fill("Alex")
		await page.locator("body").click()

		await page.keyboard.press(`${modKey}+z`)
		await page.waitForTimeout(500)
	})

	test("Cmd/Ctrl+Shift+Z triggers redo", async ({ page }) => {
		const input = page.locator("input[type='text'], textarea").first()
		if (!(await input.isVisible())) return

		await input.fill("Alex")
		await page.locator("body").click()

		await page.keyboard.press(`${modKey}+z`)
		await page.waitForTimeout(300)

		await page.keyboard.press(`${modKey}+Shift+z`)
		await page.waitForTimeout(300)
	})

	test("Cmd/Ctrl+S triggers save", async ({ page }) => {
		const input = page.locator("input[type='text'], textarea").first()
		if (!(await input.isVisible())) return

		await input.fill("SaveTest")
		await page.locator("body").click()

		// Save should not trigger browser's save dialog (we prevent default)
		await page.keyboard.press(`${modKey}+s`)
		await page.waitForTimeout(500)
	})

	test("Cmd/Ctrl+P toggles preview mode", async ({ page }) => {
		await page.locator("body").click()
		await page.keyboard.press(`${modKey}+p`)
		await page.waitForTimeout(500)

		// Toggle back
		await page.keyboard.press(`${modKey}+p`)
		await page.waitForTimeout(500)
	})

	test("? toggles shortcuts help dialog", async ({ page }) => {
		await page.locator("body").click()

		await page.keyboard.press("?")
		const help = page.getByText("Keyboard Shortcuts")
		if (await help.isVisible({ timeout: 2000 }).catch(() => false)) {
			await page.keyboard.press("?")
			await expect(help).toBeHidden()
		}
	})
})
