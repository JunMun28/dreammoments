import { setupClerkTestingToken } from "@clerk/testing/playwright"
import type { Page } from "@playwright/test"

export async function setupTestAuth(page: Page) {
	await setupClerkTestingToken({ page })
}

export async function stubBrowserApis(page: Page) {
	await page.addInitScript(() => {
		window.__openedUrls = []
		window.__clipboardText = ""

		Object.defineProperty(navigator, "clipboard", {
			value: {
				writeText: async (text: string) => {
					window.__clipboardText = String(text)
				},
			},
			configurable: true,
		})

		const _originalOpen = window.open
		window.open = ((url: string | URL) => {
			window.__openedUrls.push(String(url))
			return null
		}) as typeof window.open
	})
}

export async function waitForAppReady(page: Page) {
	await page.waitForLoadState("networkidle")
}

declare global {
	interface Window {
		__openedUrls: string[]
		__clipboardText: string
	}
}
