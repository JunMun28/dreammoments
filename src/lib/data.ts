import { buildSampleContent } from '../data/sample-invitation'
import { templates } from '../templates'
import { generateSlug, slugify } from './slug'
import { getStore, updateStore } from './store'
import type {
	AiGeneration,
	AttendanceStatus,
	DeviceType,
	Guest,
	Invitation,
	InvitationContent,
	InvitationView,
	Payment,
	PlanTier,
	User,
} from './types'

const now = () => new Date().toISOString()
const createId = () =>
	globalThis.crypto?.randomUUID?.() ??
	`id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`

const getTemplate = (templateId: string) =>	templates.find((template) => template.id === templateId) ?? templates[0]

export const PUBLIC_BASE_URL = 'https://dreammoments.app'

export function getCurrentUserId() {
	return getStore().sessions.currentUserId ?? ''
}

export function setCurrentUserId(userId: string | null) {
	updateStore((store) => {
		const next = { ...store }
		if (userId) {
			next.sessions.currentUserId = userId
		} else {
			delete next.sessions.currentUserId
		}
		return next
	})
}

export function getCurrentUser(): User | undefined {
	const userId = getCurrentUserId()
	if (!userId) return undefined
	return getStore().users.find((user) => user.id === userId)
}

export function createUser({
	email,
	name,
	authProvider,
}: {
	email: string
	name?: string
	authProvider: 'google' | 'email'
}) {
	const store = getStore()
	const existing = store.users.find((user) => user.email === email)
	if (existing) {
		setCurrentUserId(existing.id)
		return existing
	}
	const user: User = {
		id: createId(),
		email,
		name,
		authProvider,
		plan: 'free',
		createdAt: now(),
		updatedAt: now(),
	}
	updateStore((next) => ({ ...next, users: [...next.users, user] }))
	setCurrentUserId(user.id)
	return user
}

export function updateUser(userId: string, patch: Partial<User>) {
	return updateStore((store) => ({
		...store,
		users: store.users.map((user) =>
			user.id === userId ? { ...user, ...patch, updatedAt: now() } : user,
		),
	}))
}

export function updateUserPlan(userId: string, plan: PlanTier) {
	return updateUser(userId, { plan })
}

export function createInvitation(userId: string, templateId: string) {
	const template = getTemplate(templateId)
	const content = buildSampleContent(template.id)
	const baseSlug = `${content.hero.partnerOneName}-${content.hero.partnerTwoName}`
	const existing = new Set(getStore().invitations.map((inv) => inv.slug))
	const invitation: Invitation = {
		id: createId(),
		userId,
		slug: generateSlug(baseSlug, existing),
		title: `${content.hero.partnerOneName} & ${content.hero.partnerTwoName}`,
		templateId: template.id,
		templateVersion: template.version,
		content,
		sectionVisibility: Object.fromEntries(
			template.sections.map((section) => [section.id, section.defaultVisible]),
		),
		designOverrides: {},
		status: 'draft',
		aiGenerationsUsed: 0,
		invitedCount: 0,
		createdAt: now(),
		updatedAt: now(),
	}
	updateStore((store) => ({
		...store,
		invitations: [...store.invitations, invitation],
	}))
	return invitation
}

export function listInvitationsByUser(userId: string) {
	return getStore().invitations.filter((invitation) => invitation.userId === userId)
}

export function getInvitationById(invitationId: string) {
	return getStore().invitations.find((invitation) => invitation.id === invitationId)
}

export function getInvitationBySlug(slug: string) {
	return getStore().invitations.find((invitation) => invitation.slug === slug)
}

export function updateInvitation(invitationId: string, patch: Partial<Invitation>) {
	let updated: Invitation | undefined
	updateStore((store) => {
		const invitations = store.invitations.map((invitation) => {
			if (invitation.id !== invitationId) return invitation
			updated = { ...invitation, ...patch, updatedAt: now() }
			return updated
		})
		return { ...store, invitations }
	})
	return updated
}

export function updateInvitationContent(
	invitationId: string,
	content: InvitationContent,
) {
	return updateInvitation(invitationId, { content })
}

export function publishInvitation(
	invitationId: string,
	options?: { slug?: string; randomize?: boolean },
) {
	const invitation = getInvitationById(invitationId)
	if (!invitation) return
	const template = getTemplate(invitation.templateId)
	const existing = new Set(
		getStore().invitations
			.filter((inv) => inv.id !== invitationId)
			.map((inv) => inv.slug),
	)
	const baseSlug = options?.slug
		? slugify(options.slug)
		: `${invitation.content.hero.partnerOneName}-${invitation.content.hero.partnerTwoName}`
	const seed = options?.randomize ? `${baseSlug}-${Math.random().toString(36).slice(2, 6)}` : baseSlug
	const slug = generateSlug(seed, existing)
	return updateInvitation(invitationId, {
		slug,
		status: 'published',
		publishedAt: now(),
		templateVersion: template.version,
		templateSnapshot: template,
	})
}

export function unpublishInvitation(invitationId: string) {
	return updateInvitation(invitationId, { status: 'draft', publishedAt: undefined })
}

export function deleteInvitation(invitationId: string) {
	updateStore((store) => ({
		...store,
		invitations: store.invitations.filter((inv) => inv.id !== invitationId),
		guests: store.guests.filter((guest) => guest.invitationId !== invitationId),
		views: store.views.filter((view) => view.invitationId !== invitationId),
		aiGenerations: store.aiGenerations.filter(
			(gen) => gen.invitationId !== invitationId,
		),
	}))
}

export function setInvitationSlug(invitationId: string, slug: string) {
	const existing = new Set(
		getStore().invitations
			.filter((inv) => inv.id !== invitationId)
			.map((inv) => inv.slug),
	)
	return updateInvitation(invitationId, {
		slug: generateSlug(slug, existing),
	})
}

export function setInvitationVisibility(
	invitationId: string,
	sectionVisibility: Record<string, boolean>,
) {
	return updateInvitation(invitationId, { sectionVisibility })
}

export function addGuest(invitationId: string, payload: Partial<Guest>) {
	const guest: Guest = {
		id: createId(),
		invitationId,
		name: payload.name ?? 'Guest',
		email: payload.email,
		phone: payload.phone,
		relationship: payload.relationship,
		attendance: payload.attendance,
		guestCount: payload.guestCount ?? 1,
		dietaryRequirements: payload.dietaryRequirements,
		message: payload.message,
		userId: payload.userId,
		rsvpSubmittedAt: payload.rsvpSubmittedAt ?? now(),
		createdAt: now(),
		updatedAt: now(),
	}
	updateStore((store) => ({ ...store, guests: [...store.guests, guest] }))
	return guest
}

export function submitRsvp(
	invitationId: string,
	payload: Partial<Guest>,
	visitorKey: string,
) {
	const invitation = getInvitationById(invitationId)
	if (!invitation) throw new Error('Invitation not found')
	const maxAllowed = invitation.content.rsvp.allowPlusOnes
		? 1 + invitation.content.rsvp.maxPlusOnes
		: 1
	if ((payload.guestCount ?? 1) > maxAllowed) {
		throw new Error('Guest count exceeds limit')
	}
	const key = `rsvp:${invitationId}:${visitorKey}`
	const store = getStore()
	const limit = store.rateLimits[key]
	const nowTime = Date.now()
	if (limit) {
		const lastReset = new Date(limit.lastReset).getTime()
		if (nowTime - lastReset < 10 * 60 * 1000 && limit.count >= 5) {
			throw new Error('Rate limit reached')
		}
	}
	updateStore((current) => ({
		...current,
		rateLimits: {
			...current.rateLimits,
			[key]: {
				count: limit && nowTime - new Date(limit.lastReset).getTime() < 10 * 60 * 1000 ? limit.count + 1 : 1,
				lastReset: limit && nowTime - new Date(limit.lastReset).getTime() < 10 * 60 * 1000 ? limit.lastReset : new Date().toISOString(),
			},
		},
	}))
	return addGuest(invitationId, payload)
}

export function updateGuest(guestId: string, patch: Partial<Guest>) {
	updateStore((store) => ({
		...store,
		guests: store.guests.map((guest) =>
			guest.id === guestId ? { ...guest, ...patch, updatedAt: now() } : guest,
		),
	}))
}

export function listGuests(invitationId: string, filter?: AttendanceStatus | 'pending') {
	let guests = getStore().guests.filter((guest) => guest.invitationId === invitationId)
	if (filter) {
		if (filter === 'pending') {
			guests = guests.filter((guest) => !guest.attendance)
		} else {
			guests = guests.filter((guest) => guest.attendance === filter)
		}
	}
	return guests
}

export function importGuests(invitationId: string, guests: Array<Partial<Guest>>) {
	const created = guests.map((guest) =>
		addGuest(invitationId, {
			name: guest.name ?? 'Guest',
			email: guest.email,
			relationship: guest.relationship,
			attendance: undefined,
			guestCount: 1,
			rsvpSubmittedAt: undefined,
		}),
	)
	return created
}

export function getDietarySummary(invitationId: string) {
	const summary: Record<string, number> = {}
	const notes: string[] = []
	getStore()
		.guests.filter((guest) => guest.invitationId === invitationId)
		.forEach((guest) => {
			const diet = guest.dietaryRequirements?.trim()
			if (!diet) return
			if (diet.length > 24) {
				notes.push(diet)
				return
			}
			summary[diet] = (summary[diet] ?? 0) + 1
		})
	return { summary, notes }
}

export function exportGuestsCsv(invitationId: string) {
	const guests = listGuests(invitationId)
	const header = ['name', 'attendance', 'guest_count', 'dietary', 'message']
	const rows = guests.map((guest) => [
		guest.name,
		guest.attendance ?? 'pending',
		guest.guestCount.toString(),
		guest.dietaryRequirements ?? '',
		guest.message ?? '',
	])
	return [header, ...rows]
		.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
		.join('\n')
}

export function detectDeviceType(userAgent: string): DeviceType {
	if (/ipad|tablet/i.test(userAgent)) return 'tablet'
	if (/mobi|iphone|android/i.test(userAgent)) return 'mobile'
	return 'desktop'
}

export function trackInvitationView(invitationId: string, userAgent: string, referrer?: string) {
	const encoder =
		typeof btoa !== 'undefined'
			? (value: string) => btoa(value)
			: (value: string) =>
					typeof Buffer !== 'undefined'
						? Buffer.from(value).toString('base64')
						: value
	const visitorHash = encoder(`${userAgent}-${Date.now().toString(36)}`).slice(0, 12)
	const view: InvitationView = {
		id: createId(),
		invitationId,
		viewedAt: now(),
		userAgent,
		referrer,
		visitorHash,
		deviceType: detectDeviceType(userAgent),
	}
	updateStore((store) => ({ ...store, views: [...store.views, view] }))
	return view
}

export function getAnalytics(invitationId: string) {
	const views = getStore().views.filter((view) => view.invitationId === invitationId)
	const uniqueVisitors = new Set(views.map((view) => view.visitorHash))
	const invitedCount =
		getInvitationById(invitationId)?.invitedCount ?? listGuests(invitationId).length
	const responded = listGuests(invitationId).length
	const rsvpRate = invitedCount ? responded / invitedCount : 0
	const viewsByDay: Array<{ date: string; views: number }> = []
	views.forEach((view) => {
		const date = view.viewedAt.slice(0, 10)
		const existing = viewsByDay.find((item) => item.date === date)
		if (existing) existing.views += 1
		else viewsByDay.push({ date, views: 1 })
	})
	return {
		totalViews: views.length,
		uniqueVisitors: uniqueVisitors.size,
		rsvpRate,
		viewsByDay,
	}
}

export function getDeviceBreakdown(invitationId: string) {
	const views = getStore().views.filter((view) => view.invitationId === invitationId)
	return views.reduce(
		(acc, view) => {
			acc[view.deviceType] = (acc[view.deviceType] ?? 0) + 1
			return acc
		},
		{} as Record<DeviceType, number>,
	)
}

export function recordAiGeneration(
	invitationId: string,
	sectionId: string,
	prompt: string,
	generatedContent: Record<string, unknown>,
) {
	const generation: AiGeneration = {
		id: createId(),
		invitationId,
		sectionId,
		prompt,
		generatedContent,
		accepted: false,
		createdAt: now(),
	}
	updateStore((store) => ({
		...store,
		aiGenerations: [...store.aiGenerations, generation],
	}))
	return generation
}

export function markAiGenerationAccepted(generationId: string) {
	updateStore((store) => ({
		...store,
		aiGenerations: store.aiGenerations.map((gen) =>
			gen.id === generationId ? { ...gen, accepted: true } : gen,
		),
	}))
}

export function incrementAiUsage(invitationId: string) {
	const invitation = getInvitationById(invitationId)
	if (!invitation) return
	return updateInvitation(invitationId, {
		aiGenerationsUsed: invitation.aiGenerationsUsed + 1,
	})
}

export function aiUsageLimit(plan: PlanTier) {
	return plan === 'premium' ? 100 : 5
}

export function recordPayment(payment: Omit<Payment, 'id' | 'createdAt'>) {
	const entry: Payment = {
		...payment,
		id: createId(),
		createdAt: now(),
	}
	updateStore((store) => ({ ...store, payments: [...store.payments, entry] }))
	return entry
}
