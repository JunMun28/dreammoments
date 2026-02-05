import { expect, test } from "@playwright/test"
import {
	buildSeedStore,
	getStore,
	seedInvitations,
	seedLocalStorage,
	stubBrowserApis,
	waitForStoreHydration,
} from "./utils"

const setup = async (page: any, overrides?: Partial<ReturnType<typeof buildSeedStore>>) => {
	const store = { ...buildSeedStore({ currentUserId: undefined }), ...(overrides ?? {}) }
	await seedLocalStorage(page, store)
	await stubBrowserApis(page)
}

const waitForInviteHydration = async (page: any) => {
	await page.waitForFunction(
		() => !document.querySelector('[data-section="gallery"]'),
		null,
		{ timeout: 15000 },
	)
}

test("invite sample renders", async ({ page }) => {
	await setup(page)
	await page.goto("/invite/love-at-dusk-sample")
	await expect(page.getByText(/Sample Invitation/)).toBeVisible()
})

test("invite live tracks view + hidden sections", async ({ page }) => {
	await setup(page)
	await page.goto(`/invite/${seedInvitations.love.slug}`)
	await waitForStoreHydration(page)
	await waitForInviteHydration(page)
	await expect(page.locator(".dm-shell-dark")).toBeVisible()
	await expect(page.locator('[data-section="gallery"]')).toHaveCount(0)

	const store = await getStore(page)
	const views = store.views.filter((view: any) => view.invitationId === seedInvitations.love.id)
	expect(views.length).toBeGreaterThan(2)
})

test("rsvp submit + guest count", async ({ page }) => {
	await setup(page)
	await page.goto(`/invite/${seedInvitations.love.slug}`)
	await waitForStoreHydration(page)
	await waitForInviteHydration(page)

	await page.fill('input[name="name"]', "Test Guest")
	await page.fill('input[name="guestCount"]', "2")
	await page.fill('input[name="dietary"]', "Vegetarian")
	await page.fill('textarea[name="message"]', "Congrats!")
	await page.getByRole("button", { name: /RSVP/i }).click()
	await expect(page.getByRole("status")).toBeVisible()

	const store = await getStore(page)
	const guests = store.guests.filter((guest: any) => guest.invitationId === seedInvitations.love.id)
	expect(guests.at(-1)?.guestCount).toBe(2)
})

test("rsvp errors: guest limit + rate limit", async ({ page }) => {
	await setup(page)
	await page.goto(`/invite/${seedInvitations.love.slug}`)
	await waitForStoreHydration(page)
	await waitForInviteHydration(page)

	await page.fill('input[name="name"]', "Too Many")
	await page.fill('input[name="guestCount"]', "9")
	await page.getByRole("button", { name: /RSVP/i }).click()
	await expect(page.getByRole("status")).toContainText("RSVP limit reached")

	for (let i = 0; i < 6; i += 1) {
		await page.fill('input[name="name"]', `Rate ${i}`)
		await page.fill('input[name="guestCount"]', "1")
		await page.getByRole("button", { name: /RSVP/i }).click()
	}
	await expect(page.getByRole("status")).toContainText("RSVP limit reached")
})
