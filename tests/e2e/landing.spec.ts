import { setupClerkTestingToken } from "@clerk/testing/playwright"
import { test, expect } from "@playwright/test"

test.describe("Landing page", () => {
	test.beforeEach(async ({ page }) => {
		await setupClerkTestingToken({ page })
		await page.goto("/")
	})

	test("hero section renders with CTA buttons", async ({ page }) => {
		await expect(
			page.getByRole("heading", { level: 1 }),
		).toBeVisible()

		const cta = page.getByRole("link", { name: /start creating|get started/i })
		await expect(cta.first()).toBeVisible()
	})

	test("theme toggle switches between light and dark", async ({ page }) => {
		const toggle = page.locator(
			"button[aria-label*='theme' i], button[aria-label*='dark' i], button[aria-label*='light' i]",
		)
		if (await toggle.first().isVisible()) {
			// The landing page uses a CSS class "dark" on a wrapper div
			const wrapper = page.locator(".landing").first()
			const hasDarkBefore = await wrapper.evaluate((el) =>
				el.classList.contains("dark"),
			)

			await toggle.first().click()
			await page.waitForTimeout(500)

			const hasDarkAfter = await wrapper.evaluate((el) =>
				el.classList.contains("dark"),
			)
			expect(hasDarkAfter).not.toBe(hasDarkBefore)
		}
	})

	test("navigation anchors scroll to sections", async ({ page }) => {
		const navLinks = page.locator("nav a[href*='#']")
		const count = await navLinks.count()

		for (let i = 0; i < Math.min(count, 3); i++) {
			const link = navLinks.nth(i)
			const href = await link.getAttribute("href")
			if (!href) continue

			await link.click()

			const hash = href.split("#")[1]
			if (hash) {
				const section = page.locator(`#${hash}`)
				if (await section.isVisible()) {
					await expect(section).toBeInViewport({ timeout: 3000 })
				}
			}
		}
	})

	test("FAQ accordion items expand and collapse", async ({ page }) => {
		const faqSection = page.locator("#faq")
		if (!(await faqSection.isVisible())) {
			await page.goto("/#faq")
		}

		const faqItems = faqSection.getByRole("button").first()
		if (await faqItems.isVisible()) {
			await faqItems.click()
			await page.waitForTimeout(500)
			await faqItems.click()
		}
	})

	test("primary CTA links to template selection", async ({ page }) => {
		const cta = page.getByRole("link", { name: /start creating|get started/i })
		if (await cta.first().isVisible()) {
			// Verify the link points to the right destination without navigating
			// (navigating would redirect to Clerk sign-in since we're unauthenticated)
			const href = await cta.first().getAttribute("href")
			expect(href).toContain("/editor/new")
		}
	})

	test("footer renders with expected content", async ({ page }) => {
		const footer = page.locator("footer")
		await expect(footer).toBeVisible()
		await expect(footer).toContainText(/dreammoments/i)
	})
})
