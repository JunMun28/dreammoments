import { expect, test } from "@playwright/test"
import {
	buildSeedStore,
	seedInvitations,
	seedLocalStorage,
	stubBrowserApis,
	testUsers,
	waitForStoreHydration,
} from "./utils"

const setup = async (page: any, currentUserId?: string) => {
	await seedLocalStorage(page, buildSeedStore({ currentUserId }))
	await stubBrowserApis(page)
}

test("routing smoke unauth", async ({ page }) => {
	await setup(page)
	await page.goto("/")
	await expect(page.locator("#main-content")).toBeVisible()

	await page.goto("/auth/login")
	await expect(page.getByRole("heading", { name: "Welcome Back" })).toBeVisible()

	await page.goto("/auth/signup")
	await expect(page.getByRole("heading", { name: "Create Your Account" })).toBeVisible()

	await page.goto("/auth/reset")
	await expect(page.getByRole("heading", { name: "Reset Password" })).toBeVisible()

	await page.goto("/invite/love-at-dusk-sample")
	await expect(page.getByText(/Sample Invitation/i)).toBeVisible()
})

test("routing smoke auth", async ({ page }) => {
	await setup(page, testUsers.free.id)
	await page.goto("/dashboard")
	await waitForStoreHydration(page)
	await expect(page.getByRole("heading", { name: "My Invitations" })).toBeVisible()

	await page.goto(`/editor/${seedInvitations.love.id}`)
	await waitForStoreHydration(page)
	await expect(
		page.getByRole("heading", { name: "Sarah & Michael", exact: true }),
	).toBeVisible()

	await page.goto("/upgrade")
	await expect(page.getByRole("heading", { name: "Premium Checkout" })).toBeVisible()
})

test("editor/new redirect", async ({ page }) => {
	await setup(page, testUsers.free.id)
	await page.goto("/editor/new")
	await expect(page).toHaveURL(/\/editor\//)
})

test("callback redirects to dashboard", async ({ page }) => {
	await setup(page)
	await page.goto("/auth/callback?code=1")
	await expect(page).toHaveURL(/\/dashboard/)
})
