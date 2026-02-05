import { expect, test } from "@playwright/test"
import { buildSeedStore, seedLocalStorage, stubBrowserApis, testUsers } from "./utils"

const setup = async (page: any, storeOverrides?: Partial<ReturnType<typeof buildSeedStore>>) => {
	const base = buildSeedStore({ currentUserId: undefined })
	const store = { ...base, ...(storeOverrides ?? {}) }
	await seedLocalStorage(page, store)
	await stubBrowserApis(page)
}

const waitForHydration = async (page: any) => {
	await page.waitForLoadState("networkidle")
}

const expectSignedIn = async (page: any) => {
	try {
		await page.waitForURL(/\/dashboard/, { timeout: 3000 })
		return
	} catch {}
	try {
		await page.waitForURL(/accounts\.google\.com/, { timeout: 3000 })
		return
	} catch {}
	await expect.poll(
		async () =>
			page.evaluate(() => {
				const raw = localStorage.getItem("dm-store-v1")
				if (!raw) return ""
				return JSON.parse(raw)?.sessions?.currentUserId ?? ""
			}),
		{ timeout: 3000 },
	).not.toBe("")
}

test("login success + invalid + unknown", async ({ page }) => {
	await setup(page)
	await page.goto("/auth/login")
	await waitForHydration(page)

	await page.fill('input[name="email"]', testUsers.free.email)
	await page.fill('input[name="password"]', "password123")
	await page.getByRole("button", { name: "Sign In", exact: true }).click()
	await expectSignedIn(page)

	await setup(page)
	await page.goto("/auth/login")
	await waitForHydration(page)
	await page.fill('input[name="email"]', testUsers.free.email)
	await page.fill('input[name="password"]', "wrongpass")
	await page.getByRole("button", { name: "Sign In", exact: true }).click()
	await expect(page.getByRole("status")).toContainText("Invalid password")

	await setup(page)
	await page.goto("/auth/login")
	await waitForHydration(page)
	await page.fill('input[name="email"]', "unknown@dreammoments.app")
	await page.fill('input[name="password"]', "password123")
	await page.getByRole("button", { name: "Sign In", exact: true }).click()
	await expect(page.getByRole("status")).toContainText("Account not found")
})

test("login google fallback", async ({ page }) => {
	await setup(page)
	await page.goto("/auth/login")
	await waitForHydration(page)
	await page.getByRole("button", { name: "Sign In with Google" }).click()
	await expectSignedIn(page)
})

test("signup validation + success", async ({ page }) => {
	await setup(page)
	await page.goto("/auth/signup")
	await waitForHydration(page)
	await page.fill('input[name="name"]', "New User")
	await page.fill('input[name="email"]', "new@dreammoments.app")
	await page.fill('input[name="password"]', "short")
	await page.getByRole("button", { name: "Create Account" }).click()
	await expect(page.getByText("Password must be at least 8")).toBeVisible()

	await setup(page)
	await page.goto("/auth/signup")
	await waitForHydration(page)
	await page.fill('input[name="name"]', "Free User")
	await page.fill('input[name="email"]', testUsers.free.email)
	await page.fill('input[name="password"]', "password123")
	await page.getByRole("button", { name: "Create Account" }).click()
	await expect(page.getByText("Email already registered")).toBeVisible()

	await setup(page)
	await page.goto("/auth/signup")
	await waitForHydration(page)
	await page.fill('input[name="name"]', "Fresh User")
	await page.fill('input[name="email"]', "fresh@dreammoments.app")
	await page.fill('input[name="password"]', "password123")
	await page.getByRole("button", { name: "Create Account" }).click()
	await expectSignedIn(page)
})

test("reset password", async ({ page }) => {
	await setup(page)
	await page.goto("/auth/reset")
	await waitForHydration(page)
	await page.fill('input[name="email"]', testUsers.free.email)
	await page.fill('input[name="password"]', "short")
	await page.getByRole("button", { name: "Update Password" }).click()
	await expect(page.getByText("Password must be at least 8")).toBeVisible()

	await page.fill('input[name="password"]', "password123")
	await page.getByRole("button", { name: "Update Password" }).click()
	await expect(page.getByText("Password updated")).toBeVisible()
})
