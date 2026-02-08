import { expect, test } from "@playwright/test"
import { buildSeedStore, seedLocalStorage, stubBrowserApis, testUsers } from "./utils"

const setup = async (page: any, currentUserId?: string) => {
	await seedLocalStorage(page, buildSeedStore({ currentUserId }))
	await stubBrowserApis(page)
}

test("landing hero + sections", async ({ page }) => {
	await setup(page)
	await page.goto("/")
	await expect(
		page.getByRole("heading", { name: /Beautiful invitations your guests/i }),
	).toBeVisible()
	await page.getByRole("link", { name: "Browse Templates" }).click()
	await expect(page).toHaveURL(/#templates/)
	await expect(page.locator("#showcase")).toBeVisible()
	await expect(page.locator("#showcase h3")).toHaveCount(4)
	await expect(page.locator("footer")).toBeVisible()
})

test("skip link targets main", async ({ page }) => {
	await setup(page)
	await page.goto("/")
	const skipLink = page.getByRole("link", { name: "Skip to Content" })
	await skipLink.focus()
	await skipLink.press("Enter")
	await expect(page.locator("#main")).toBeFocused()
})

test("header desktop unauth", async ({ page }, testInfo) => {
	if (testInfo.project.name !== "chromium") test.skip()
	await setup(page)
	await page.goto("/")
	await expect(page.getByRole("link", { name: "Templates" })).toBeVisible()
	await expect(page.getByRole("link", { name: "How it works" })).toBeVisible()
	await expect(page.getByRole("link", { name: "Pricing" })).toBeVisible()
	await expect(page.getByRole("link", { name: "Start free" })).toBeVisible()
	await expect(page.getByRole("link", { name: "Sign in" })).toBeVisible()
})

test("nav anchors exist", async ({ page }, testInfo) => {
	if (testInfo.project.name !== "chromium") test.skip()
	await setup(page)
	await page.goto("/")
	await page.getByRole("link", { name: "Templates" }).click()
	await expect(page).toHaveURL(/#templates/)
	await expect(page.locator("#templates")).toHaveCount(1)
	await expect(page.locator("#showcase")).toBeVisible()
	await page.getByRole("link", { name: "How it works" }).click()
	await expect(page).toHaveURL(/#process/)
	await expect(page.locator("#process")).toBeVisible()
	await page.getByRole("link", { name: "Pricing" }).click()
	await expect(page).toHaveURL(/#pricing/)
	await expect(page.locator("#pricing")).toBeVisible()
})

test("header desktop auth", async ({ page }, testInfo) => {
	if (testInfo.project.name !== "chromium") test.skip()
	await setup(page, testUsers.free.id)
	await page.goto("/")
	await expect(page.getByRole("link", { name: "Open app" })).toBeVisible()
	await expect(page.getByRole("link", { name: "Upgrade" })).toBeVisible()
	await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible()
})

test.describe("mobile nav", () => {
	test.use({ viewport: { width: 375, height: 800 } })

	test("toggle open/close", async ({ page }) => {
		await setup(page)
		await page.goto("/")
		await page.getByRole("button", { name: "Toggle navigation" }).click()
		await expect(page.getByRole("link", { name: "Templates" })).toBeVisible()
		await page.getByRole("link", { name: "Templates" }).click()
		await expect(page.getByRole("link", { name: "Templates" })).toBeHidden()
	})
})
