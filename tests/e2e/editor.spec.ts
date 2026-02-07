import { expect, test } from "@playwright/test"
import {
	buildSeedStore,
	getStore,
	mockMobileMatchMedia,
	seedInvitations,
	seedLocalStorage,
	stubBrowserApis,
	testUsers,
	waitForStoreHydration,
} from "./utils"

const setupEditor = async (
	page: any,
	options?: {
		currentUserId?: string
		invitationId?: string
		invitationOverrides?: Record<string, any>
	},
) => {
	await page.addInitScript(() => {
		class NoopObserver {
			observe() {}
			unobserve() {}
			disconnect() {}
		}
		// @ts-expect-error test override
		window.IntersectionObserver = NoopObserver
	})
	const store = buildSeedStore({ currentUserId: options?.currentUserId ?? testUsers.free.id })
	if (options?.invitationOverrides) {
		store.invitations = store.invitations.map((item) =>
			item.id === (options.invitationId ?? seedInvitations.love.id)
				? { ...item, ...options.invitationOverrides }
				: item,
		)
	}
	await seedLocalStorage(page, store)
	await stubBrowserApis(page)
}

test("editor layout + section switching", async ({ page }) => {
	await setupEditor(page)
	await page.goto(`/editor/${seedInvitations.love.id}`)
	await waitForStoreHydration(page)
	await expect(page.getByRole("heading", { name: "Sarah & Michael", exact: true })).toBeVisible()
	await expect(page.getByText("Section Editor")).toBeVisible()
	await expect(page.getByText(/Active:/)).toBeVisible()

	await page.locator('[data-section="story"]').click()
	await expect(page.getByText("Active: story")).toBeVisible()

	await page.locator('[data-section="schedule"]').click()
	await expect(page.getByText("Active: schedule")).toBeVisible()
})

test("editor visibility toggle", async ({ page }) => {
	await setupEditor(page)
	await page.goto(`/editor/${seedInvitations.love.id}`)
	await waitForStoreHydration(page)
	const toggle = page.getByRole("checkbox", { name: "story" })
	await toggle.uncheck()
	await expect(page.locator('[data-section="story"]')).toHaveCount(0)
	await toggle.check()
	await expect(page.locator('[data-section="story"]')).toHaveCount(1)
})

test("editor field types + list + image", async ({ page }) => {
	await setupEditor(page)
	await page.goto(`/editor/${seedInvitations.love.id}`)
	await waitForStoreHydration(page)
	await page.locator('[data-section="hero"]').click()
	await expect(page.getByText("Active: hero")).toBeVisible()

	await page.fill('input[name="hero.partnerOneName"]', "Alex")
	await expect(page.locator('[data-section="hero"]')).toContainText("Alex")

	const imageInput = page.locator('input[type="file"][name="hero.heroImageUrl"]')
	await imageInput.setInputFiles("tests/e2e/fixtures/sample.png")
	await expect(page.getByAltText("Uploaded")).toBeVisible()
	await page.getByRole("button", { name: "Remove Image" }).click()
	await expect(page.getByAltText("Uploaded")).toHaveCount(0)

	await page.locator('[data-section="announcement"]').click()
	await expect(page.getByText("Active: announcement")).toBeVisible()
	await page.fill('textarea[name="announcement.message"]', "Hello friends")
	await expect(page.locator('[data-section="announcement"]')).toContainText("Hello friends")

	await page.locator('[data-section="rsvp"]').click()
	await expect(page.getByText("Active: rsvp")).toBeVisible()
	await page.fill('input[name="rsvp.deadline"]', "2025-12-12")
	await expect(page.locator('input[name="rsvp.deadline"]')).toHaveValue("2025-12-12")

	await page.getByRole("checkbox", { name: "Allow plus ones" }).check()

	await page.locator('[data-section="story"]').click()
	const removeButtons = page.getByRole("button", { name: "Remove" })
	const removeCount = await removeButtons.count()
	await page.getByRole("button", { name: "Add Item" }).click()
	await expect(removeButtons).toHaveCount(removeCount + 1)
	await page.fill('input[name="story.date.3"]', "2099")
	await page.fill('input[name="story.title.3"]', "Our Future")
	await page.fill('input[name="story.description.3"]', "New chapter")
	await expect(page.locator('[data-section="story"]')).toContainText("Our Future")
	await removeButtons.last().click()
	await expect(removeButtons).toHaveCount(removeCount)
})

test("editor validation + undo/redo", async ({ page }) => {
	await setupEditor(page)
	await page.goto(`/editor/${seedInvitations.love.id}`)
	await waitForStoreHydration(page)

	const nameInput = page.locator('input[name="hero.partnerOneName"]')
	await nameInput.fill("")
	await nameInput.blur()
	await expect(page.locator('span[role="status"]').first()).toContainText("required")

	await nameInput.fill("Nova")
	await page.getByRole("button", { name: "Undo" }).click()
	await expect(page.locator('[data-section="hero"]')).not.toContainText("Nova")
	await page.getByRole("button", { name: "Redo" }).click()
	await expect(page.locator('[data-section="hero"]')).toContainText("Nova")
})

test("editor autosave label", async ({ page }) => {
	await page.addInitScript(() => {
		const original = window.setInterval
		window.setInterval = (handler, timeout, ...args) =>
			original(handler, timeout === 30000 ? 50 : timeout, ...args)
	})
	await setupEditor(page)
	await page.goto(`/editor/${seedInvitations.love.id}`)
	await waitForStoreHydration(page)
	await page.fill('input[name="hero.partnerOneName"]', "Autosave")
	await expect(page.getByText(/AI Usage:/)).not.toContainText("Pending")
})

// beforeunload dialog behavior varies across browser engines
test("editor beforeunload prompt", async ({ page }, testInfo) => {
	if (testInfo.project.name !== "chromium") test.skip()
	await page.addInitScript(() => {
		window.setInterval = () => 0
	})
	await setupEditor(page)
	await page.goto(`/editor/${seedInvitations.love.id}`)
	await waitForStoreHydration(page)
	await page.fill('input[name="hero.partnerOneName"]', "Unsaved")
	await page.waitForTimeout(100)

	let dialogType = ""
	page.once("dialog", (dialog) => {
		dialogType = dialog.type()
		void dialog.accept()
	})
	await page.reload({ waitUntil: "domcontentloaded" })
	expect(dialogType).toBe("beforeunload")
})

test("editor preview + share", async ({ page }) => {
	await setupEditor(page)
	await page.goto(`/editor/${seedInvitations.love.id}`)
	await waitForStoreHydration(page)
	await page.getByRole("button", { name: "Preview", exact: true }).click()
	await expect(page.locator(".dm-preview")).toBeVisible()
	await page.getByRole("button", { name: "Back to Edit" }).click()
	await expect(page.locator(".dm-preview")).toBeHidden()

	await page.getByRole("button", { name: "Preview", exact: true }).click()
	await page.getByRole("button", { name: "Share" }).click()
	await expect(page).toHaveURL(/\/dashboard/)
	const store = await getStore(page)
	const updated = store.invitations.find((item: any) => item.id === seedInvitations.love.id)
	expect(updated?.status).toBe("published")
})

test("editor publish flow free + premium", async ({ page }) => {
	await setupEditor(page)
	await page.goto(`/editor/${seedInvitations.love.id}`)
	await waitForStoreHydration(page)
	await page.getByRole("button", { name: "Publish" }).click()
	await expect(page.getByText("Upgrade to Premium")).toBeVisible()
	await page.getByRole("button", { name: "Continue Free" }).click()
	const freeStore = await getStore(page)
	const freeInvitation = freeStore.invitations.find((item: any) => item.id === seedInvitations.love.id)
	expect(freeInvitation?.status).toBe("published")

	await setupEditor(page, { currentUserId: testUsers.premium.id, invitationId: seedInvitations.garden.id })
	await page.goto(`/editor/${seedInvitations.garden.id}`)
	await waitForStoreHydration(page)
	await page.getByRole("button", { name: "Publish" }).click()
	// Custom slug dialog replaces native prompt() — fill in the slug input and confirm
	await page.getByRole("textbox", { name: /slug/i }).fill("My Cool Slug!!")
	await page.getByRole("button", { name: /save/i }).click()
	const premiumStore = await getStore(page)
	const premiumInvitation = premiumStore.invitations.find((item: any) => item.id === seedInvitations.garden.id)
	expect(premiumInvitation?.slug).toBe("my-cool-slug")
})

test("editor ai panel + limit", async ({ page }) => {
	await setupEditor(page)
	await page.goto(`/editor/${seedInvitations.love.id}`)
	await waitForStoreHydration(page)
	await page.getByRole("button", { name: "AI Helper" }).click()
	const panel = page.getByText("AI Assistant").locator("..")
	await expect(panel.getByLabel("AI Task")).toHaveValue("tagline")
	await panel.getByLabel("AI Prompt").fill("Make it romantic")
	const oldTagline = "暮色里相遇，星光里相守"
	await panel.getByRole("button", { name: "Generate" }).click()
	await expect(panel.getByRole("button", { name: "Apply" })).toBeEnabled()
	await panel.getByRole("button", { name: "Apply" }).click()
	await expect(page.getByText(oldTagline)).toBeHidden()

	await setupEditor(page, {
		invitationOverrides: { aiGenerationsUsed: 5 },
	})
	await page.goto(`/editor/${seedInvitations.love.id}`)
	await waitForStoreHydration(page)
	await page.getByRole("button", { name: "AI Helper" }).click()
	const limitPanel = page.getByText("AI Assistant").locator("..")
	await limitPanel.getByLabel("AI Prompt").fill("Any prompt")
	await limitPanel.getByRole("button", { name: "Generate" }).click()
	await expect(limitPanel.getByText("AI limit reached")).toBeVisible()
})

test("inline edit mobile", async ({ page }) => {
	await mockMobileMatchMedia(page, true)
	await setupEditor(page)
	await page.setViewportSize({ width: 1024, height: 768 })
	await page.goto(`/editor/${seedInvitations.love.id}`)
	await waitForStoreHydration(page)
	await page.locator('[data-section="hero"] [role="button"]').first().click()
	await expect(page.getByText("Quick Edit")).toBeVisible()
	await page.getByLabel("Quick Edit Value").fill("Mobile Edit")
	await page.getByRole("button", { name: "Apply" }).click()
	await expect(page.locator('[data-section="hero"]')).toContainText("Mobile Edit")
})
