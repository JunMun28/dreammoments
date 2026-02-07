/**
 * Database Seeding Script for DreamMoments
 *
 * Run with: pnpm tsx src/db/seed.ts
 *
 * This script populates the database with sample data for development.
 * It creates demo users, invitations, guests, and related records.
 */

import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { buildSampleContent } from "../data/sample-invitation";
import * as schema from "./schema";

// Load environment variables
config({ path: [".env.local", ".env"] });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	console.error("ERROR: DATABASE_URL environment variable is not set.");
	console.error("Please set it in .env.local or .env file.");
	process.exit(1);
}

const pool = new Pool({
	connectionString: databaseUrl,
	ssl:
		process.env.NODE_ENV === "production"
			? { rejectUnauthorized: false }
			: undefined,
});

const db = drizzle(pool, { schema });

// Sample data
const sampleUsers = [
	{
		email: "demo@dreammoments.com",
		name: "Demo User",
		avatarUrl: null,
		authProvider: "email" as const,
		plan: "premium" as const,
	},
	{
		email: "sarah.lim@example.com",
		name: "Sarah Lim",
		avatarUrl: null,
		authProvider: "google" as const,
		plan: "free" as const,
	},
	{
		email: "michael.tan@example.com",
		name: "Michael Tan",
		avatarUrl: null,
		authProvider: "google" as const,
		plan: "premium" as const,
	},
];

const templateIds = [
	"love-at-dusk",
	"blush-romance",
	"garden-romance",
	"eternal-elegance",
];

async function clearDatabase() {
	console.log("Clearing existing data...");

	// Delete in reverse order of dependencies
	await db.delete(schema.payments);
	await db.delete(schema.aiGenerations);
	await db.delete(schema.invitationViews);
	await db.delete(schema.guests);
	await db.delete(schema.invitations);
	await db.delete(schema.users);

	console.log("Database cleared.");
}

async function seedUsers() {
	console.log("Seeding users...");

	const insertedUsers = await db
		.insert(schema.users)
		.values(sampleUsers)
		.returning();

	console.log(`Created ${insertedUsers.length} users.`);
	return insertedUsers;
}

async function seedInvitations(users: (typeof schema.users.$inferSelect)[]) {
	console.log("Seeding invitations...");

	const invitations = [];

	// Create one invitation per template for the demo user
	const demoUser = users.find((u) => u.email === "demo@dreammoments.com");
	if (demoUser) {
		for (const templateId of templateIds) {
			const content = buildSampleContent(templateId);
			const slug = `demo-${templateId}-${Date.now().toString(36)}`;

			invitations.push({
				userId: demoUser.id,
				slug,
				title: `Demo - ${templateId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}`,
				templateId,
				templateVersion: "1.0.0",
				templateSnapshot: null,
				content: content as unknown as Record<string, unknown>,
				sectionVisibility: {
					hero: true,
					announcement: true,
					couple: true,
					story: true,
					gallery: true,
					schedule: true,
					venue: true,
					entourage: true,
					registry: true,
					rsvp: true,
					faq: true,
					footer: true,
				},
				designOverrides: {},
				status: templateId === "love-at-dusk" ? "published" : "draft",
				publishedAt: templateId === "love-at-dusk" ? new Date() : null,
				aiGenerationsUsed: 0,
				invitedCount: 0,
			});
		}
	}

	// Create invitation for Sarah
	const sarahUser = users.find((u) => u.email === "sarah.lim@example.com");
	if (sarahUser) {
		const content = buildSampleContent("garden-romance");
		invitations.push({
			userId: sarahUser.id,
			slug: `sarah-michael-wedding-${Date.now().toString(36)}`,
			title: "Sarah & Michael Wedding",
			templateId: "garden-romance",
			templateVersion: "1.0.0",
			templateSnapshot: null,
			content: content as unknown as Record<string, unknown>,
			sectionVisibility: {
				hero: true,
				announcement: true,
				couple: true,
				story: true,
				gallery: true,
				schedule: true,
				venue: true,
				entourage: false,
				registry: true,
				rsvp: true,
				faq: true,
				footer: true,
			},
			designOverrides: {},
			status: "published" as const,
			publishedAt: new Date(),
			aiGenerationsUsed: 2,
			invitedCount: 50,
		});
	}

	const insertedInvitations = await db
		.insert(schema.invitations)
		.values(invitations)
		.returning();

	console.log(`Created ${insertedInvitations.length} invitations.`);
	return insertedInvitations;
}

async function seedGuests(
	invitations: (typeof schema.invitations.$inferSelect)[],
) {
	console.log("Seeding guests...");

	const guests = [];

	// Find published invitations to add guests to
	const publishedInvitations = invitations.filter(
		(inv) => inv.status === "published",
	);

	for (const invitation of publishedInvitations) {
		// Add sample guests for each published invitation
		guests.push(
			{
				invitationId: invitation.id,
				name: "Wei Ling",
				email: "weiling@example.com",
				phone: "+65 9123 4567",
				relationship: "Friend",
				attendance: "attending" as const,
				guestCount: 2,
				dietaryRequirements: "No pork",
				message: "Congratulations! So happy for you both!",
				rsvpSubmittedAt: new Date(),
			},
			{
				invitationId: invitation.id,
				name: "Jian Hao",
				email: "jianhao@example.com",
				phone: "+65 9234 5678",
				relationship: "Best Friend",
				attendance: "attending" as const,
				guestCount: 1,
				dietaryRequirements: null,
				message: "Cannot wait for the big day!",
				rsvpSubmittedAt: new Date(),
			},
			{
				invitationId: invitation.id,
				name: "Mei Fen",
				email: "meifen@example.com",
				phone: "+60 12 345 6789",
				relationship: "Colleague",
				attendance: "not_attending" as const,
				guestCount: 0,
				dietaryRequirements: null,
				message: "So sorry I cannot make it. Sending love!",
				rsvpSubmittedAt: new Date(),
			},
			{
				invitationId: invitation.id,
				name: "David Wong",
				email: "david.wong@example.com",
				phone: null,
				relationship: "Family Friend",
				attendance: "undecided" as const,
				guestCount: 2,
				dietaryRequirements: "Vegetarian",
				message: null,
				rsvpSubmittedAt: null,
			},
		);
	}

	if (guests.length > 0) {
		const insertedGuests = await db
			.insert(schema.guests)
			.values(guests)
			.returning();
		console.log(`Created ${insertedGuests.length} guests.`);
		return insertedGuests;
	}

	console.log("No guests to create (no published invitations).");
	return [];
}

async function seedInvitationViews(
	invitations: (typeof schema.invitations.$inferSelect)[],
) {
	console.log("Seeding invitation views...");

	const views = [];
	const publishedInvitations = invitations.filter(
		(inv) => inv.status === "published",
	);

	for (const invitation of publishedInvitations) {
		// Add sample views from different devices
		const baseDate = new Date();
		baseDate.setDate(baseDate.getDate() - 7); // Start from 7 days ago

		for (let i = 0; i < 25; i++) {
			const viewDate = new Date(baseDate);
			viewDate.setHours(viewDate.getHours() + i * 6); // Every 6 hours

			views.push({
				invitationId: invitation.id,
				viewedAt: viewDate,
				userAgent:
					i % 3 === 0
						? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)"
						: i % 3 === 1
							? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0"
							: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15",
				referrer: i % 4 === 0 ? "https://instagram.com" : null,
				visitorHash: `visitor_${i}_${Date.now().toString(36)}`,
				deviceType:
					i % 3 === 0
						? ("mobile" as const)
						: i % 3 === 1
							? ("desktop" as const)
							: ("tablet" as const),
			});
		}
	}

	if (views.length > 0) {
		const insertedViews = await db
			.insert(schema.invitationViews)
			.values(views)
			.returning();
		console.log(`Created ${insertedViews.length} invitation views.`);
		return insertedViews;
	}

	console.log("No views to create (no published invitations).");
	return [];
}

async function seedAiGenerations(
	invitations: (typeof schema.invitations.$inferSelect)[],
) {
	console.log("Seeding AI generations...");

	const aiGenerations = [];

	// Find invitations with AI generations used
	const invitationsWithAi = invitations.filter(
		(inv) => (inv.aiGenerationsUsed ?? 0) > 0,
	);

	for (const invitation of invitationsWithAi) {
		aiGenerations.push(
			{
				invitationId: invitation.id,
				sectionId: "announcement",
				prompt: "Generate a heartfelt wedding announcement message",
				generatedContent: {
					title: "We're Getting Married!",
					message:
						"With hearts full of love and joy, we invite you to celebrate the beginning of our forever.",
				},
				accepted: true,
			},
			{
				invitationId: invitation.id,
				sectionId: "story",
				prompt: "Write romantic milestones for our love story",
				generatedContent: {
					milestones: [
						{
							date: "2018",
							title: "The First Glance",
							description:
								"Across a crowded room, our eyes met and everything changed.",
						},
						{
							date: "2020",
							title: "Growing Together",
							description:
								"Through adventures and quiet moments, we built our love story.",
						},
					],
				},
				accepted: true,
			},
		);
	}

	if (aiGenerations.length > 0) {
		const insertedAiGenerations = await db
			.insert(schema.aiGenerations)
			.values(aiGenerations)
			.returning();
		console.log(`Created ${insertedAiGenerations.length} AI generations.`);
		return insertedAiGenerations;
	}

	console.log("No AI generations to create.");
	return [];
}

async function seedPayments(
	users: (typeof schema.users.$inferSelect)[],
	invitations: (typeof schema.invitations.$inferSelect)[],
) {
	console.log("Seeding payments...");

	const payments = [];

	// Find premium users
	const premiumUsers = users.filter((u) => u.plan === "premium");

	for (const user of premiumUsers) {
		const userInvitation = invitations.find((inv) => inv.userId === user.id);

		payments.push({
			userId: user.id,
			invitationId: userInvitation?.id ?? null,
			stripePaymentIntentId: `pi_demo_${Date.now().toString(36)}_${user.id.slice(0, 8)}`,
			stripeCustomerId: `cus_demo_${user.id.slice(0, 8)}`,
			amountCents: 9900, // RM 99.00 or SGD 99.00
			currency: user.email.includes("michael") ? "SGD" : "MYR",
			status: "succeeded" as const,
		});
	}

	if (payments.length > 0) {
		const insertedPayments = await db
			.insert(schema.payments)
			.values(payments)
			.returning();
		console.log(`Created ${insertedPayments.length} payments.`);
		return insertedPayments;
	}

	console.log("No payments to create.");
	return [];
}

async function main() {
	console.log("Starting database seeding...");
	console.log("Database URL:", databaseUrl?.replace(/:[^:@]+@/, ":***@"));
	console.log("");

	try {
		// Clear existing data
		await clearDatabase();
		console.log("");

		// Seed in order of dependencies
		const users = await seedUsers();
		const invitations = await seedInvitations(users);
		await seedGuests(invitations);
		await seedInvitationViews(invitations);
		await seedAiGenerations(invitations);
		await seedPayments(users, invitations);

		console.log("");
		console.log("Database seeding completed successfully!");
		console.log("");
		console.log("Summary:");
		console.log(`- Users: ${users.length}`);
		console.log(`- Invitations: ${invitations.length}`);
		console.log("");
		console.log("Demo credentials:");
		console.log("- Email: demo@dreammoments.com");
		console.log("- (Use email/password auth with any password for demo)");
	} catch (error) {
		console.error("Error seeding database:", error);
		process.exit(1);
	} finally {
		await pool.end();
	}
}

main();
