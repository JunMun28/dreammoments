import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import { eq, sql } from "drizzle-orm"
import * as schema from "../../../src/db/schema"
import { buildSampleContent } from "../../../src/data/sample-invitation"
import { templates } from "../../../src/templates"

const DATABASE_URL = process.env.E2E_DATABASE_URL || process.env.DATABASE_URL

let pool: Pool | null = null

function getPool() {
	if (!pool) {
		if (!DATABASE_URL) {
			throw new Error("E2E_DATABASE_URL or DATABASE_URL must be set for E2E tests")
		}
		pool = new Pool({ connectionString: DATABASE_URL, max: 3 })
	}
	return pool
}

export function getTestDb() {
	return drizzle(getPool(), { schema })
}

export async function closeTestDb() {
	if (pool) {
		await pool.end()
		pool = null
	}
}

export async function getOrCreateTestUser(
	overrides?: Partial<typeof schema.users.$inferInsert>,
) {
	const db = getTestDb()
	const email = process.env.E2E_CLERK_USER_USERNAME!

	// Prefer the real Clerk user (created by JIT on first sign-in) over fake test users
	const allMatches = await db
		.select()
		.from(schema.users)
		.where(eq(schema.users.email, email))

	// Real Clerk user IDs start with "user_", test ones start with "test_"
	const realUser = allMatches.find((u) => u.clerkId.startsWith("user_"))
	if (realUser) return realUser
	if (allMatches.length > 0) return allMatches[0]

	const [created] = await db
		.insert(schema.users)
		.values({
			clerkId: `test_${Date.now()}`,
			email,
			name: "E2E Test User",
			plan: "free",
			...overrides,
		})
		.returning()

	return created
}

const DEFAULT_TEMPLATE_ID = "double-happiness"

export async function seedInvitation(options?: {
	userId?: string
	slug?: string
	status?: "draft" | "published" | "archived"
	templateId?: string
}) {
	const db = getTestDb()
	const templateId = options?.templateId ?? DEFAULT_TEMPLATE_ID
	const template = templates.find((t) => t.id === templateId)
	if (!template) throw new Error(`Template ${templateId} not found`)

	const content = buildSampleContent(templateId)
	const sectionVisibility: Record<string, boolean> = {}
	for (const section of template.sections) {
		sectionVisibility[section.id] = section.defaultVisible
	}

	const user = options?.userId
		? { id: options.userId }
		: await getOrCreateTestUser()

	const slug =
		options?.slug ?? `e2e-test-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

	// Clean up any existing invitation with the same slug to avoid unique constraint violations
	await db.delete(schema.invitations).where(eq(schema.invitations.slug, slug))

	const [invitation] = await db
		.insert(schema.invitations)
		.values({
			userId: user.id,
			slug,
			title: `${content.hero.partnerOneName} & ${content.hero.partnerTwoName}`,
			templateId,
			templateVersion: template.version,
			templateSnapshot: template as unknown as Record<string, unknown>,
			content: content as unknown as Record<string, unknown>,
			sectionVisibility,
			designOverrides: {},
			status: options?.status ?? "published",
			publishedAt:
				(options?.status ?? "published") === "published"
					? new Date()
					: undefined,
			aiGenerationsUsed: 0,
			invitedCount: 0,
		})
		.returning()

	return invitation
}

export async function seedGuest(
	invitationId: string,
	overrides?: Partial<typeof schema.guests.$inferInsert>,
) {
	const db = getTestDb()
	const [guest] = await db
		.insert(schema.guests)
		.values({
			invitationId,
			name: "Test Guest",
			attendance: "attending",
			guestCount: 1,
			...overrides,
		})
		.returning()
	return guest
}

export async function cleanupTestInvitations(userId: string) {
	const db = getTestDb()
	await db
		.delete(schema.invitations)
		.where(eq(schema.invitations.userId, userId))
}

export async function cleanupInvitationBySlug(slug: string) {
	const db = getTestDb()
	await db
		.delete(schema.invitations)
		.where(eq(schema.invitations.slug, slug))
}

export async function cleanupAllTestData() {
	const db = getTestDb()
	await db.execute(sql`DELETE FROM invitations WHERE slug LIKE 'e2e-test-%'`)
}
