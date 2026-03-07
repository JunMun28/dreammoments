import { clerk } from "@clerk/testing/playwright"
import { test, expect } from "@playwright/test"

test("debug: signIn WITHOUT setupClerkTestingToken", async ({ page }) => {
	test.setTimeout(120000)

	// Do NOT call setupClerkTestingToken — let clerk.signIn() handle it internally
	await page.goto("/")
	await page.waitForLoadState("domcontentloaded")
	await page.waitForTimeout(8000)

	// Check Clerk loaded state
	const beforeState = await page.evaluate(() => {
		const w = window as any
		return {
			clerkExists: !!w.Clerk,
			clerkLoaded: w.Clerk?.loaded,
			clerkVersion: w.Clerk?.version,
		}
	})
	console.log("Before signIn:", JSON.stringify(beforeState))

	await clerk.signIn({
		page,
		signInParams: {
			strategy: "password",
			identifier: process.env.E2E_CLERK_USER_USERNAME!,
			password: process.env.E2E_CLERK_USER_PASSWORD!,
		},
	})

	await page.waitForTimeout(5000)

	const afterState = await page.evaluate(() => {
		const w = window as any
		return {
			clerkLoaded: w.Clerk?.loaded,
			clerkUser: w.Clerk?.user?.id || null,
			clerkSession: w.Clerk?.session?.id || null,
			isSignedIn: !!w.Clerk?.user,
		}
	})
	console.log("After signIn:", JSON.stringify(afterState))

	// Check __client_uat cookie
	const cookies = await page.context().cookies()
	const clientUat = cookies.find((c) => c.name === "__client_uat")
	console.log("__client_uat:", clientUat?.value)

	// Navigate to /dashboard
	await page.goto("/dashboard")
	await page.waitForLoadState("domcontentloaded")
	await page.waitForTimeout(5000)
	console.log("URL after /dashboard:", page.url())
})
