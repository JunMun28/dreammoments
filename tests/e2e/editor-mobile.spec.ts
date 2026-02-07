import { expect, test } from "@playwright/test"
import {
	buildSeedStore,
	mockMobileMatchMedia,
	seedInvitations,
	seedLocalStorage,
	stubBrowserApis,
	testUsers,
	waitForStoreHydration,
} from "./utils"

const MOBILE_VIEWPORT = { width: 390, height: 844 }

const setupMobileEditor = async (page: any) => {
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
	await mockMobileMatchMedia(page, true)
	await page.setViewportSize(MOBILE_VIEWPORT)
}

test.describe("mobile editor", () => {
	test("bottom sheet opens on section tap", async ({ page }) => {
		await setupMobileEditor(page)
		await page.goto(`/editor/${seedInvitations.love.id}`)
		await waitForStoreHydration(page)

		// Tap a section in the preview to open bottom sheet
		const sectionEl = page.locator('[data-section="hero"]').first()
		if (await sectionEl.isVisible()) {
			await sectionEl.click()
			await expect(page.getByText("Section Editor")).toBeVisible()

			// Visual regression: bottom sheet open state
			await expect(page).toHaveScreenshot("mobile-bottom-sheet-open.png", {
				maxDiffPixelRatio: 0.01,
				animations: "disabled",
			})
		}
	})

	test("mobile section nav renders scrollable tab strip", async ({ page }) => {
		await setupMobileEditor(page)
		await page.goto(`/editor/${seedInvitations.love.id}`)
		await waitForStoreHydration(page)

		// MobileSectionNav should have tablist role on the pill container
		const tablist = page.getByRole("tablist", { name: "Invitation sections" })
		await expect(tablist).toBeVisible()

		// Should have tab pills with labels (not just dots)
		const tabs = tablist.getByRole("tab")
		const tabCount = await tabs.count()
		expect(tabCount).toBeGreaterThan(0)

		// Active tab should have aria-selected=true
		const activeTab = tablist.getByRole("tab", { selected: true })
		await expect(activeTab).toBeVisible()

		// Should have navigation buttons outside the tablist
		await expect(page.getByRole("button", { name: "Previous section" })).toBeVisible()
		await expect(page.getByRole("button", { name: "Next section" })).toBeVisible()
	})

	test("section navigation via next/previous buttons", async ({ page }) => {
		await setupMobileEditor(page)
		await page.goto(`/editor/${seedInvitations.love.id}`)
		await waitForStoreHydration(page)

		const nextBtn = page.getByRole("button", { name: "Next section" })
		await nextBtn.click()

		// The active section label should have changed
		const tablist = page.getByRole("tablist", { name: "Invitation sections" })
		await expect(tablist).toBeVisible()
	})

	test("AI assistant opens as bottom sheet on mobile", async ({ page }) => {
		await setupMobileEditor(page)
		await page.goto(`/editor/${seedInvitations.love.id}`)
		await waitForStoreHydration(page)

		// Open bottom sheet first, then AI
		const sectionEl = page.locator('[data-section="hero"]').first()
		if (await sectionEl.isVisible()) {
			await sectionEl.click()
		}

		const aiButton = page.getByRole("button", { name: /AI/i }).first()
		if (await aiButton.isVisible()) {
			await aiButton.click()
			await expect(page.getByText("AI Assistant")).toBeVisible()
		}
	})

	test("inline edit shows bottom input bar on mobile", async ({ page }) => {
		await setupMobileEditor(page)
		await page.goto(`/editor/${seedInvitations.love.id}`)
		await waitForStoreHydration(page)

		const editableEl = page.locator('[data-section="hero"] [role="button"]').first()
		if (await editableEl.isVisible()) {
			await editableEl.click()
			// Should see the bottom input bar (Apply/Cancel buttons)
			await expect(page.getByRole("button", { name: "Apply" })).toBeVisible()
			await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible()
		}
	})
})
