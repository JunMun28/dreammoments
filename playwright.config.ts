import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
	testDir: "./tests/e2e",
	timeout: 60000,
	expect: {
		timeout: 10000,
		toHaveScreenshot: {
			maxDiffPixelRatio: 0.01,
			animations: "disabled",
		},
	},
	fullyParallel: true,
	retries: process.env.CI ? 1 : 0,
	reporter: [["list"], ["html", { open: "never" }]],
	use: {
		baseURL: "http://127.0.0.1:3000",
		trace: "retain-on-failure",
		video: "retain-on-failure",
		screenshot: "only-on-failure",
	},
	webServer: {
		command: "pnpm dev",
		url: "http://127.0.0.1:3000",
		reuseExistingServer: !process.env.CI,
		timeout: 120000,
	},
	projects: [
		// Global setup — obtains Clerk testing token
		{
			name: "global-setup",
			testMatch: /global\.setup\.ts/,
		},

		// Auth setup — signs in and saves storage state
		{
			name: "auth-setup",
			testMatch: /auth\.setup\.ts/,
			dependencies: ["global-setup"],
		},

		// Tests that require authentication
		{
			name: "chromium-authed",
			use: {
				...devices["Desktop Chrome"],
				storageState: "tests/e2e/.auth/user.json",
			},
			testIgnore: [
				/global\.setup\.ts/,
				/auth\.setup\.ts/,
				/landing\.spec\.ts/,
				/invite-view\.spec\.ts/,
				/rsvp\.spec\.ts/,
				/routing\.spec\.ts/,
				/mobile\.spec\.ts/,
			],
			dependencies: ["auth-setup"],
		},

		// Tests that don't require authentication (public pages)
		{
			name: "chromium-public",
			use: { ...devices["Desktop Chrome"] },
			testMatch: [
				/landing\.spec\.ts/,
				/invite-view\.spec\.ts/,
				/rsvp\.spec\.ts/,
				/routing\.spec\.ts/,
			],
			dependencies: ["global-setup"],
		},

		// Mobile tests
		{
			name: "mobile",
			use: {
				...devices["iPhone 13"],
				storageState: "tests/e2e/.auth/user.json",
			},
			testMatch: /mobile\.spec\.ts/,
			dependencies: ["auth-setup"],
		},
	],
})
