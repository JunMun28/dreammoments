import { expect, test } from "@playwright/test"
import {
	buildSeedStore,
	getStore,
	seedInvitations,
	seedLocalStorage,
	stubBrowserApis,
	testUsers,
	waitForStoreHydration,
} from "./utils"

const setup = async (
	page: any,
	options?: { currentUserId?: string | null; withInvitations?: boolean },
) => {
	const hasUser = options && Object.prototype.hasOwnProperty.call(options, "currentUserId")
	const store = buildSeedStore({
		currentUserId: hasUser ? options?.currentUserId ?? undefined : testUsers.free.id,
		withInvitations: options?.withInvitations ?? true,
	})
	await seedLocalStorage(page, store)
	await stubBrowserApis(page)
}

test("dashboard auth guard", async ({ page }) => {
	await setup(page, { currentUserId: null })
	await page.goto("/dashboard")
	await waitForStoreHydration(page)
	await expect(page).toHaveURL(/\/auth\/login/)
})

test("dashboard empty state", async ({ page }) => {
	await setup(page, { withInvitations: false })
	await page.goto("/dashboard")
	await waitForStoreHydration(page)
	await expect(page.getByText("No Invitations Yet")).toBeVisible()
	await expect(page.getByRole("link", { name: "Create Invitation" })).toBeVisible()
})

test("dashboard list + actions", async ({ page }) => {
	await setup(page)
	await page.goto("/dashboard")
	await waitForStoreHydration(page)

	const firstTitle = page.locator("h2").first()
	await expect(firstTitle).toHaveText(seedInvitations.love.title)

	await expect(page.getByText("Views", { exact: true }).first()).toBeVisible()
	await expect(page.getByText("RSVPs", { exact: true }).first()).toBeVisible()

	await page.getByRole("button", { name: "Share" }).first().click()
	await expect(page.getByText("Share Invitation")).toBeVisible()

	await page.getByRole("button", { name: "Copy Link" }).click()
	const clipboard = await page.evaluate(() => window.__clipboardText)
	expect(clipboard).toContain("/invite/")

	await page.getByRole("button", { name: "WhatsApp" }).click()
	const opened = await page.evaluate(() => window.__openedUrls)
	expect(opened[0]).toContain("wa.me")

	await page.getByRole("button", { name: "Close" }).click()
	await expect(page.getByText("Share Invitation")).toBeHidden()

	await page.getByRole("link", { name: "Preview" }).first().click()
	await expect(page).toHaveURL(/\/invite\//)

	await page.goBack()
	await page.getByRole("link", { name: "Edit" }).first().click()
	await expect(page).toHaveURL(/\/editor\//)
})

test("dashboard delete confirm yes/no", async ({ page }) => {
	await setup(page)
	await page.goto("/dashboard")
	await waitForStoreHydration(page)

	page.on("dialog", (dialog) => dialog.dismiss())
	await page.getByRole("button", { name: "Delete Invitation" }).first().click()
	await expect(
		page
			.getByRole("heading", { name: seedInvitations.love.title, exact: true })
			.first(),
	).toBeVisible()

	page.removeAllListeners("dialog")
	page.on("dialog", (dialog) => dialog.accept())
	await page.getByRole("button", { name: "Delete Invitation" }).first().click()
	const store = await getStore(page)
	expect(store.invitations.find((item: any) => item.id === seedInvitations.love.id)).toBeUndefined()
})
