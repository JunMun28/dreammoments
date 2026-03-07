import { clerkSetup, setupClerkTestingToken } from "@clerk/testing/playwright"
import { test as setup, expect } from "@playwright/test"

setup.describe.configure({ mode: "serial" })

const authFile = "tests/e2e/.auth/user.json"

setup("global setup", async ({}) => {
	await clerkSetup()
})

setup("authenticate via UI and save state", async ({ page }) => {
	setup.setTimeout(120000)

	await setupClerkTestingToken({ page })

	// Navigate to a protected page to trigger Clerk sign-in
	await page.goto("/dashboard")
	await page.waitForLoadState("domcontentloaded")
	await page.waitForTimeout(8000)

	const url = page.url()
	console.log("Auth setup: URL =", url)

	// If on our domain and no sign-in form, we're already authenticated
	if (url.includes("127.0.0.1") && url.includes("/dashboard")) {
		const signInForm = page.getByRole("heading", { name: /sign in/i })
		if (!(await signInForm.isVisible({ timeout: 3000 }).catch(() => false))) {
			console.log("Auth setup: already authenticated")
			await page.context().storageState({ path: authFile })
			return
		}
	}

	// Wait for the Clerk sign-in form (on either our domain or Clerk hosted page)
	const emailInput = page.getByRole("textbox", { name: /email/i })
	await expect(emailInput).toBeVisible({ timeout: 15000 })

	// The Clerk form shows email AND password fields simultaneously
	// Fill both before clicking Continue
	console.log("Auth setup: filling email")
	await emailInput.fill(process.env.E2E_CLERK_USER_USERNAME!)
	await page.waitForTimeout(500)

	// Fill password (should be visible at same time as email)
	const passwordInput = page.getByRole("textbox", { name: /password/i })
	if (await passwordInput.isVisible({ timeout: 3000 }).catch(() => false)) {
		console.log("Auth setup: filling password")
		await passwordInput.fill(process.env.E2E_CLERK_USER_PASSWORD!)
		await page.waitForTimeout(500)
	}

	// Click the submit Continue button (NOT the "Continue with Google" button)
	// The Google OAuth button has "Continue with Google" in its name
	// The submit button has just "Continue" — use last() to skip the Google button
	console.log("Auth setup: clicking Continue")
	await page.getByRole("button", { name: /^continue$/i }).click()
	await page.waitForTimeout(10000)

	console.log("Auth setup: URL after sign-in =", page.url())

	// If we got redirected back to our app, great
	if (!page.url().includes("127.0.0.1")) {
		console.log("Auth setup: still on Clerk, navigating back")
		await page.goto("/dashboard")
		await page.waitForLoadState("domcontentloaded")
		await page.waitForTimeout(5000)
		console.log("Auth setup: URL after nav back =", page.url())
	}

	// Check auth state
	const cookies = await page.context().cookies()
	const clientUat = cookies.find((c) => c.name === "__client_uat")
	console.log("Auth setup: __client_uat =", clientUat?.value)

	await page.context().storageState({ path: authFile })
	console.log("Auth setup: state saved")
})
