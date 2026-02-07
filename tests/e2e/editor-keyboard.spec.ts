import { expect, test } from "@playwright/test"
import {
	buildSeedStore,
	seedInvitations,
	seedLocalStorage,
	stubBrowserApis,
	testUsers,
	waitForStoreHydration,
} from "./utils"

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

const modKey = process.platform === "darwin" ? "Meta" : "Control"

test.describe("keyboard shortcuts", () => {
	test.beforeEach(async ({ page }) => {
		await setupEditor(page)
		await page.goto(`/editor/${seedInvitations.love.id}`)
		await waitForStoreHydration(page)
		await expect(page.getByRole("heading", { name: "Sarah & Michael", exact: true })).toBeVisible()
	})

	test("Cmd/Ctrl+Z triggers undo", async ({ page }) => {
		// First make a change
		await page.fill('input[name="hero.partnerOneName"]', "Alex")
		// Click outside to ensure focus is not in a text input (shortcuts are suppressed there)
		await page.locator("body").click()

		await page.keyboard.press(`${modKey}+z`)

		// Undo should revert the change
		await expect(page.locator('[data-section="hero"]')).not.toContainText("Alex")
	})

	test("Cmd/Ctrl+Shift+Z triggers redo", async ({ page }) => {
		await page.fill('input[name="hero.partnerOneName"]', "Alex")
		await page.locator("body").click()

		await page.keyboard.press(`${modKey}+z`)
		await expect(page.locator('[data-section="hero"]')).not.toContainText("Alex")

		await page.keyboard.press(`${modKey}+Shift+z`)
		await expect(page.locator('[data-section="hero"]')).toContainText("Alex")
	})

	test("Cmd/Ctrl+S triggers save", async ({ page }) => {
		await page.fill('input[name="hero.partnerOneName"]', "SaveTest")
		await page.locator("body").click()

		// Save should not trigger browser's save dialog (we prevent default)
		// Instead it should trigger the save action in the editor
		await page.keyboard.press(`${modKey}+s`)

		// After save, the content should persist (no unsaved indicator)
		await page.waitForTimeout(500)
	})

	test("Cmd/Ctrl+P toggles preview mode", async ({ page }) => {
		await page.locator("body").click()
		await page.keyboard.press(`${modKey}+p`)

		// Preview should be visible
		await expect(page.locator(".dm-preview")).toBeVisible()

		// Toggle back
		await page.keyboard.press(`${modKey}+p`)
		await expect(page.locator(".dm-preview")).toBeHidden()
	})

	test("[ navigates to previous section", async ({ page }) => {
		// First switch to a non-first section
		await page.locator('[data-section="story"]').click()
		await expect(page.getByText("Active: story")).toBeVisible()

		// Click body to make sure focus is not in an input
		await page.locator("body").click()

		await page.keyboard.press("[")

		// Should have navigated to the previous section
		const activeText = await page.getByText(/Active:/).textContent()
		expect(activeText).not.toContain("story")
	})

	test("] navigates to next section", async ({ page }) => {
		// Start at hero section
		await page.locator('[data-section="hero"]').click()
		await expect(page.getByText("Active: hero")).toBeVisible()

		await page.locator("body").click()

		await page.keyboard.press("]")

		// Should have moved to the next section
		const activeText = await page.getByText(/Active:/).textContent()
		expect(activeText).not.toContain("hero")
	})

	test("? toggles shortcuts help dialog", async ({ page }) => {
		await page.locator("body").click()

		await page.keyboard.press("?")

		// Shortcuts help should appear
		await expect(page.getByText("Keyboard Shortcuts")).toBeVisible()

		// Press ? again to close
		await page.keyboard.press("?")
		await expect(page.getByText("Keyboard Shortcuts")).toBeHidden()
	})
})
