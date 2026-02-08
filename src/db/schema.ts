import {
	boolean,
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: uuid("id").defaultRandom().primaryKey(),
	email: varchar("email", { length: 255 }).notNull().unique(),
	name: varchar("name", { length: 255 }),
	avatarUrl: text("avatar_url"),
	passwordHash: text("password_hash"),
	authProvider: varchar("auth_provider", { length: 50 }).notNull(),
	plan: varchar("plan", { length: 20 }).default("free"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const invitations = pgTable(
	"invitations",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		userId: uuid("user_id")
			.notNull()
			.references(() => users.id, {
				onDelete: "cascade",
			}),
		slug: varchar("slug", { length: 100 }).notNull().unique(),
		title: varchar("title", { length: 255 }),
		templateId: varchar("template_id", { length: 50 }).notNull(),
		templateVersion: varchar("template_version", { length: 20 }).notNull(),
		templateSnapshot:
			jsonb("template_snapshot").$type<Record<string, unknown>>(),
		content: jsonb("content").$type<Record<string, unknown>>().notNull(),
		sectionVisibility:
			jsonb("section_visibility").$type<Record<string, boolean>>(),
		designOverrides: jsonb("design_overrides").$type<Record<string, unknown>>(),
		status: varchar("status", { length: 20 }).default("draft"),
		publishedAt: timestamp("published_at"),
		aiGenerationsUsed: integer("ai_generations_used").default(0),
		invitedCount: integer("invited_count").default(0),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => ({
		userIdx: index("idx_invitations_user").on(table.userId),
		slugIdx: index("idx_invitations_slug").on(table.slug),
	}),
);

export const guests = pgTable(
	"guests",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		invitationId: uuid("invitation_id")
			.notNull()
			.references(() => invitations.id, { onDelete: "cascade" }),
		name: varchar("name", { length: 255 }).notNull(),
		email: varchar("email", { length: 255 }),
		phone: varchar("phone", { length: 50 }),
		relationship: varchar("relationship", { length: 100 }),
		attendance: varchar("attendance", { length: 20 }),
		guestCount: integer("guest_count").default(1),
		dietaryRequirements: text("dietary_requirements"),
		message: text("message"),
		userId: uuid("user_id").references(() => users.id),
		rsvpSubmittedAt: timestamp("rsvp_submitted_at"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => ({
		invitationIdx: index("idx_guests_invitation").on(table.invitationId),
	}),
);

export const invitationViews = pgTable(
	"invitation_views",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		invitationId: uuid("invitation_id")
			.notNull()
			.references(() => invitations.id, { onDelete: "cascade" }),
		viewedAt: timestamp("viewed_at").defaultNow().notNull(),
		userAgent: text("user_agent"),
		referrer: text("referrer"),
		visitorHash: varchar("visitor_hash", { length: 64 }),
		deviceType: varchar("device_type", { length: 20 }).default("desktop"),
	},
	(table) => ({
		invitationIdx: index("idx_views_invitation").on(table.invitationId),
		dateIdx: index("idx_views_date").on(table.viewedAt),
	}),
);

export const aiGenerations = pgTable(
	"ai_generations",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		invitationId: uuid("invitation_id")
			.notNull()
			.references(() => invitations.id, { onDelete: "cascade" }),
		sectionId: varchar("section_id", { length: 50 }),
		prompt: text("prompt").notNull(),
		generatedContent:
			jsonb("generated_content").$type<Record<string, unknown>>(),
		accepted: boolean("accepted").default(false),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => ({
		invitationIdx: index("idx_ai_invitation").on(table.invitationId),
	}),
);

export const payments = pgTable("payments", {
	id: uuid("id").defaultRandom().primaryKey(),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id),
	invitationId: uuid("invitation_id").references(() => invitations.id),
	stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
	stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
	amountCents: integer("amount_cents").notNull(),
	currency: varchar("currency", { length: 3 }).notNull(),
	status: varchar("status", { length: 20 }).default("pending"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});
