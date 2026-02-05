import type { Page } from "@playwright/test"
import type { Invitation, Store, User } from "../../src/lib/types"
import { buildSampleContent } from "../../src/data/sample-invitation"
import { templates } from "../../src/templates"

export const STORAGE_KEY = "dm-store-v1"

export const testUsers: Record<"free" | "premium", User> = {
	free: {
		id: "user-free",
		email: "free@dreammoments.app",
		name: "Free User",
		authProvider: "email",
		plan: "free",
		createdAt: "2025-01-01T00:00:00.000Z",
		updatedAt: "2025-01-01T00:00:00.000Z",
	},
	premium: {
		id: "user-premium",
		email: "premium@dreammoments.app",
		name: "Premium User",
		authProvider: "email",
		plan: "premium",
		createdAt: "2025-01-01T00:00:00.000Z",
		updatedAt: "2025-01-01T00:00:00.000Z",
	},
}

const buildSectionVisibility = (templateId: string, hiddenIds: string[] = []) => {
	const template = templates.find((item) => item.id === templateId)
	if (!template) return {}
	const visibility: Record<string, boolean> = {}
	template.sections.forEach((section) => {
		visibility[section.id] = section.defaultVisible
	})
	hiddenIds.forEach((id) => {
		visibility[id] = false
	})
	return visibility
}

const buildInvitation = (payload: {
	id: string
	userId: string
	templateId: string
	slug: string
	status?: Invitation["status"]
	updatedAt: string
	hidden?: string[]
	aiGenerationsUsed?: number
}) => {
	const template = templates.find((item) => item.id === payload.templateId)
	const content = buildSampleContent(payload.templateId)
	const invitation: Invitation = {
		id: payload.id,
		userId: payload.userId,
		slug: payload.slug,
		title: `${content.hero.partnerOneName} & ${content.hero.partnerTwoName}`,
		templateId: payload.templateId,
		templateVersion: template?.version ?? "1.0.0",
		templateSnapshot: template ?? {},
		content,
		sectionVisibility: buildSectionVisibility(payload.templateId, payload.hidden),
		designOverrides: {},
		status: payload.status ?? "published",
		publishedAt: payload.status === "published" ? "2025-01-02T00:00:00.000Z" : undefined,
		aiGenerationsUsed: payload.aiGenerationsUsed ?? 0,
		invitedCount: 120,
		createdAt: "2025-01-01T00:00:00.000Z",
		updatedAt: payload.updatedAt,
	}
	return invitation
}

export const seedInvitations = {
	love: buildInvitation({
		id: "inv-love",
		userId: testUsers.free.id,
		templateId: "love-at-dusk",
		slug: "love-at-dusk-live",
		updatedAt: "2025-01-05T00:00:00.000Z",
		hidden: ["gallery"],
	}),
	blush: buildInvitation({
		id: "inv-blush",
		userId: testUsers.free.id,
		templateId: "blush-romance",
		slug: "blush-romance-live",
		updatedAt: "2025-01-03T00:00:00.000Z",
	}),
	garden: buildInvitation({
		id: "inv-garden",
		userId: testUsers.premium.id,
		templateId: "garden-romance",
		slug: "garden-romance-live",
		updatedAt: "2025-01-04T00:00:00.000Z",
	}),
	eternal: buildInvitation({
		id: "inv-eternal",
		userId: testUsers.premium.id,
		templateId: "eternal-elegance",
		slug: "eternal-elegance-live",
		updatedAt: "2025-01-02T00:00:00.000Z",
		hidden: ["registry"],
	}),
}

export const hashPassword = (value: string) =>
	Buffer.from(value, "utf-8").toString("base64")

export const buildSeedStore = (options?: {
	currentUserId?: string
	withInvitations?: boolean
	withGuests?: boolean
	withViews?: boolean
	overrides?: Partial<Store>
}) => {
	const now = "2025-01-06T00:00:00.000Z"
	const withInvitations = options?.withInvitations ?? true
	const withGuests = options?.withGuests ?? true
	const withViews = options?.withViews ?? true

	const invitations = withInvitations
		? [
				seedInvitations.love,
				seedInvitations.blush,
				seedInvitations.garden,
				seedInvitations.eternal,
			]
		: []

	const guests = withGuests
		? [
				{
					id: "guest-1",
					invitationId: seedInvitations.love.id,
					name: "Guest One",
					attendance: "attending",
					guestCount: 2,
					createdAt: now,
					updatedAt: now,
				},
				{
					id: "guest-2",
					invitationId: seedInvitations.love.id,
					name: "Guest Two",
					attendance: "undecided",
					guestCount: 1,
					createdAt: now,
					updatedAt: now,
				},
			]
		: []

	const views = withViews
		? [
				{
					id: "view-1",
					invitationId: seedInvitations.love.id,
					viewedAt: now,
					userAgent: "Playwright",
					referrer: "",
					visitorHash: "visitor-1",
					deviceType: "desktop",
				},
				{
					id: "view-2",
					invitationId: seedInvitations.love.id,
					viewedAt: now,
					userAgent: "Playwright",
					referrer: "",
					visitorHash: "visitor-2",
					deviceType: "mobile",
				},
			]
		: []

	const store: Store = {
		users: [testUsers.free, testUsers.premium],
		invitations,
		guests,
		views,
		aiGenerations: [],
		payments: [],
		sessions: options?.currentUserId ? { currentUserId: options.currentUserId } : {},
		passwords: {
			[testUsers.free.email]: hashPassword("password123"),
			[testUsers.premium.email]: hashPassword("password123"),
		},
		rateLimits: {},
		...(options?.overrides ?? {}),
	}

	return store
}

export const seedLocalStorage = async (page: Page, store: Store) => {
	await page.addInitScript(
		({ key, value }) => {
			window.localStorage.setItem(key, value)
		},
		{ key: STORAGE_KEY, value: JSON.stringify(store) },
	)
}

export const stubBrowserApis = async (page: Page) => {
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

		const originalOpen = window.open
		window.open = ((url: string | URL) => {
			window.__openedUrls.push(String(url))
			return null
		}) as typeof window.open

		if (!window.matchMedia) {
			window.matchMedia = (query: string) =>
				({
					matches: false,
					media: query,
					onchange: null,
					addEventListener: () => {},
					removeEventListener: () => {},
					addListener: () => {},
					removeListener: () => {},
					dispatchEvent: () => false,
				}) as MediaQueryList
		}
	})
}

export const mockMobileMatchMedia = async (page: Page, isMobile: boolean) => {
	await page.addInitScript(({ isMobile }) => {
		const original = window.matchMedia
		window.matchMedia = (query: string) => {
			if (query.includes("max-width: 768px")) {
				return {
					matches: isMobile,
					media: query,
					onchange: null,
					addEventListener: () => {},
					removeEventListener: () => {},
					addListener: () => {},
					removeListener: () => {},
					dispatchEvent: () => false,
				} as MediaQueryList
			}
			return original ? original(query) : ({} as MediaQueryList)
		}
	}, { isMobile })
}

export const getStore = async (page: Page) =>
	page.evaluate(() => JSON.parse(localStorage.getItem("dm-store-v1") ?? "{}"))

export const waitForStoreHydration = async (page: Page) =>
	page.waitForFunction(() => window.__dmStoreHydrated === true, null, {
		timeout: 15000,
	})

declare global {
	interface Window {
		__openedUrls: string[]
		__clipboardText: string
		__dmStoreHydrated?: boolean
	}
}
