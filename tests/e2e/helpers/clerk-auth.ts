import { setupClerkTestingToken } from "@clerk/testing/playwright"
import type { Page } from "@playwright/test"

/**
 * Ensure the page has a valid Clerk authentication session.
 * Navigates to /dashboard and waits for either dashboard content (auth valid)
 * or Clerk sign-in page (auth expired). If expired, performs UI-based sign-in.
 *
 * Only use this in tests that actually need re-authentication (long-running suites).
 * For most tests, `setupClerkTestingToken` + storageState is sufficient.
 */
export async function ensureAuthenticated(page: Page) {
	await setupClerkTestingToken({ page })

	// Navigate to dashboard to check if auth is valid
	await page.goto("/dashboard")
	await page.waitForLoadState("domcontentloaded")

	// Wait for either dashboard content (auth valid) or Clerk sign-in (auth expired).
	// Must wait for Clerk SDK to initialize — URL alone is unreliable.
	const result = await Promise.race([
		page
			.getByText("My Invitations")
			.or(page.getByText("Create Your First Invitation"))
			.or(page.getByText("Dashboard"))
			.first()
			.waitFor({ timeout: 20000 })
			.then(() => "dashboard" as const),
		page
			.getByRole("textbox", { name: /email/i })
			.waitFor({ timeout: 20000 })
			.then(() => "clerk-signin" as const),
	]).catch(() => null)

	if (result === "dashboard") {
		return
	}

	if (result !== "clerk-signin") {
		// Neither appeared — check URL as fallback
		if (page.url().includes("127.0.0.1")) {
			// Might be loading slowly, give it more time
			const retryResult = await Promise.race([
				page.getByText("My Invitations").or(page.getByText("Create Your First Invitation")).first().waitFor({ timeout: 10000 }).then(() => "dashboard" as const),
				page.getByRole("textbox", { name: /email/i }).waitFor({ timeout: 10000 }).then(() => "clerk-signin" as const),
			]).catch(() => null)

			if (retryResult === "dashboard") return
			if (retryResult !== "clerk-signin") {
				console.log("ensureAuthenticated: could not determine auth state, proceeding")
				return
			}
		}
	}

	// Session expired — do UI sign-in
	console.log("ensureAuthenticated: session expired, re-authenticating...")

	const emailInput = page.getByRole("textbox", { name: /email/i })
	await emailInput.waitFor({ timeout: 15000 })
	await emailInput.fill(process.env.E2E_CLERK_USER_USERNAME!)
	await page.waitForTimeout(500)

	// Check if password is already visible
	const passwordInput = page.getByRole("textbox", { name: /password/i })
	const passwordVisible = await passwordInput
		.isVisible({ timeout: 1000 })
		.catch(() => false)

	if (passwordVisible) {
		await passwordInput.fill(process.env.E2E_CLERK_USER_PASSWORD!)
		await page.waitForTimeout(500)
		await page.getByRole("button", { name: /^continue$/i }).click()
	} else {
		await page.getByRole("button", { name: /^continue$/i }).click()
		await page.waitForTimeout(3000)

		const pwdInput = page.getByRole("textbox", { name: /password/i })
		await pwdInput.waitFor({ timeout: 10000 })
		await pwdInput.fill(process.env.E2E_CLERK_USER_PASSWORD!)
		await page.waitForTimeout(500)
		await page.getByRole("button", { name: /^continue$/i }).click()
	}

	// Wait for sign-in to complete and redirect back
	await page.waitForTimeout(8000)

	if (!page.url().includes("127.0.0.1")) {
		await page.goto("/dashboard")
		await page.waitForLoadState("domcontentloaded")
		await page.waitForTimeout(3000)
	}

	console.log("ensureAuthenticated: complete, URL:", page.url())
}
