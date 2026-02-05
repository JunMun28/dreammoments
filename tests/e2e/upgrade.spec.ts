import { expect, test } from "@playwright/test"
import { buildSeedStore, getStore, seedLocalStorage, stubBrowserApis, testUsers } from "./utils"

test("upgrade flow", async ({ page }) => {
	const store = buildSeedStore({ currentUserId: testUsers.free.id })
	await seedLocalStorage(page, store)
	await stubBrowserApis(page)

	await page.goto("/upgrade")
	await expect(page.getByRole("heading", { name: "Premium Checkout" })).toBeVisible()
	await page.getByRole("combobox", { name: "Currency" }).selectOption("SGD")
	await expect(page.getByText("PayNow")).toBeVisible()
	await page.getByRole("button", { name: "Proceed to Stripe Checkout" }).click()
	await expect(page.getByRole("status")).toContainText("Payment succeeded")

	const updated = await getStore(page)
	const user = updated.users.find((item: any) => item.id === testUsers.free.id)
	expect(user?.plan).toBe("premium")
})
