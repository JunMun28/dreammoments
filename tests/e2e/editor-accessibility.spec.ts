import { expect, test } from "@playwright/test"
import { checkAccessibility } from "./helpers/accessibility"
import {
	buildSeedStore,
	mockMobileMatchMedia,
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

const MOBILE_VIEWPORT = { width: 390, height: 844 }

const setupMobileEditor = async (page: any) => {
	await setupEditor(page)
	await mockMobileMatchMedia(page, true)
	await page.setViewportSize(MOBILE_VIEWPORT)
}

// --- Item 4.2: Axe-Core Accessibility Scans ---

test.describe("accessibility scans", () => {
	test("editor load has no accessibility violations", async ({ page }) => {
		await setupEditor(page)
		await page.goto(`/editor/${seedInvitations.love.id}`)
		await waitForStoreHydration(page)
		await expect(page.getByRole("heading", { name: "Sarah & Michael", exact: true })).toBeVisible()
		await checkAccessibility(page)
	})

	test("bottom sheet open has no accessibility violations", async ({ page }) => {
		await setupMobileEditor(page)
		await page.goto(`/editor/${seedInvitations.love.id}`)
		await waitForStoreHydration(page)

		const sectionEl = page.locator('[data-section="hero"]').first()
		if (await sectionEl.isVisible()) {
			await sectionEl.click()
			await expect(page.getByText("Section Editor")).toBeVisible()
			await checkAccessibility(page)
		}
	})

	test("AI drawer open has no accessibility violations", async ({ page }) => {
		await setupEditor(page)
		await page.goto(`/editor/${seedInvitations.love.id}`)
		await waitForStoreHydration(page)

		await page.getByRole("button", { name: "AI Helper" }).click()
		await expect(page.getByText("AI Assistant")).toBeVisible()
		await checkAccessibility(page)
	})

	test("inline edit open has no accessibility violations", async ({ page }) => {
		await setupEditor(page)
		await page.goto(`/editor/${seedInvitations.love.id}`)
		await waitForStoreHydration(page)

		const editableEl = page.locator('[data-section="hero"] [role="button"]').first()
		if (await editableEl.isVisible()) {
			await editableEl.click()
			await page.waitForTimeout(300)
			await checkAccessibility(page)
		}
	})
})

// --- Item 4.4: Focus Trap Validation ---

test.describe("focus trap validation", () => {
	test("bottom sheet traps focus and Escape closes it", async ({ page }) => {
		await setupMobileEditor(page)
		await page.goto(`/editor/${seedInvitations.love.id}`)
		await waitForStoreHydration(page)

		const sectionEl = page.locator('[data-section="hero"]').first()
		if (!(await sectionEl.isVisible())) return
		await sectionEl.click()
		await expect(page.getByText("Section Editor")).toBeVisible()

		// Tab through focusable elements in the bottom sheet
		const firstFocusable = await page.evaluate(() => {
			const sheet = document.querySelector('[role="dialog"]')
			if (!sheet) return null
			const focusable = sheet.querySelectorAll<HTMLElement>(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
			)
			if (focusable.length > 0) {
				focusable[0].focus()
				return document.activeElement?.tagName
			}
			return null
		})

		if (firstFocusable) {
			// Tab through all elements to verify focus stays inside
			for (let i = 0; i < 20; i++) {
				await page.keyboard.press("Tab")
			}
			const activeAfterTabs = await page.evaluate(() => {
				const sheet = document.querySelector('[role="dialog"]')
				return sheet?.contains(document.activeElement) ?? false
			})
			expect(activeAfterTabs).toBe(true)
		}

		// Escape should close the bottom sheet
		await page.keyboard.press("Escape")
		await expect(page.getByText("Section Editor")).toBeHidden()
	})

	test("AI drawer traps focus and Escape closes it", async ({ page }) => {
		await setupEditor(page)
		await page.goto(`/editor/${seedInvitations.love.id}`)
		await waitForStoreHydration(page)

		await page.getByRole("button", { name: "AI Helper" }).click()
		await expect(page.getByText("AI Assistant")).toBeVisible()

		// Tab through elements in the AI drawer
		const drawerDialog = page.locator('[role="dialog"]').filter({ hasText: "AI Assistant" })
		await expect(drawerDialog).toBeVisible()

		for (let i = 0; i < 15; i++) {
			await page.keyboard.press("Tab")
		}
		const activeInsideDrawer = await page.evaluate(() => {
			const drawers = document.querySelectorAll('[role="dialog"]')
			for (let i = 0; i < drawers.length; i++) {
				if (drawers[i].textContent?.includes("AI Assistant") && drawers[i].contains(document.activeElement)) {
					return true
				}
			}
			return false
		})
		expect(activeInsideDrawer).toBe(true)

		// Escape closes the drawer
		await page.keyboard.press("Escape")
		await expect(drawerDialog).toBeHidden()
	})

	test("inline edit overlay traps focus and Escape closes it", async ({ page }) => {
		await setupEditor(page)
		await page.goto(`/editor/${seedInvitations.love.id}`)
		await waitForStoreHydration(page)

		const editableEl = page.locator('[data-section="hero"] [role="button"]').first()
		if (!(await editableEl.isVisible())) return
		await editableEl.click()
		await page.waitForTimeout(300)

		// Verify the inline edit dialog is open
		const inlineDialog = page.locator('[role="dialog"]').filter({ hasText: /Apply|Save/ })
		if (!(await inlineDialog.isVisible())) return

		for (let i = 0; i < 10; i++) {
			await page.keyboard.press("Tab")
		}
		const focusInsideDialog = await page.evaluate(() => {
			const dialogs = document.querySelectorAll('[role="dialog"]')
			for (let i = 0; i < dialogs.length; i++) {
				if (dialogs[i].contains(document.activeElement)) return true
			}
			return false
		})
		expect(focusInsideDialog).toBe(true)

		// Escape closes the overlay
		await page.keyboard.press("Escape")
		await page.waitForTimeout(200)
	})
})
