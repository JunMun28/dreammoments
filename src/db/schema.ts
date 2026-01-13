import { relations } from "drizzle-orm";
import {
	date,
	integer,
	pgTable,
	text,
	time,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

// ============================================================================
// USERS - Couples who create wedding invitations
// Note: Authentication is managed by Neon Auth (neon_auth schema).
// This table stores application-specific user data, linked via neonAuthId.
// ============================================================================
export const users = pgTable("users", {
	id: uuid().primaryKey().defaultRandom(),
	neonAuthId: text("neon_auth_id").unique(), // Links to neon_auth.users.id
	email: text().notNull().unique(),
	createdAt: timestamp("created_at").defaultNow(),
});

// ============================================================================
// INVITATIONS - Wedding invitation data
// ============================================================================
export const invitations = pgTable("invitations", {
	id: uuid().primaryKey().defaultRandom(),
	userId: uuid("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),

	// Couple info
	partner1Name: text("partner1_name"),
	partner2Name: text("partner2_name"),

	// Wedding details
	weddingDate: date("wedding_date"),
	weddingTime: time("wedding_time"),
	venueName: text("venue_name"),
	venueAddress: text("venue_address"),

	// Template & theme
	templateId: text("template_id"),
	accentColor: text("accent_color"),
	fontPairing: text("font_pairing"),
	heroImageUrl: text("hero_image_url"),

	// RSVP
	rsvpDeadline: timestamp("rsvp_deadline"),

	// Timestamps
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================================================
// SCHEDULE BLOCKS - Timeline events for the wedding (ceremony, reception, etc.)
// ============================================================================
export const scheduleBlocks = pgTable("schedule_blocks", {
	id: uuid().primaryKey().defaultRandom(),
	invitationId: uuid("invitation_id")
		.notNull()
		.references(() => invitations.id, { onDelete: "cascade" }),

	// Block content
	title: text().notNull(),
	time: time(),
	description: text(),

	// Ordering
	order: integer().notNull().default(0),

	// Timestamps
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================================================
// NOTES - Custom notes/FAQ items (dress code, kids policy, etc.)
// ============================================================================
export const notes = pgTable("notes", {
	id: uuid().primaryKey().defaultRandom(),
	invitationId: uuid("invitation_id")
		.notNull()
		.references(() => invitations.id, { onDelete: "cascade" }),

	// Note content
	title: text().notNull(),
	description: text(),

	// Ordering
	order: integer().notNull().default(0),

	// Timestamps
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================================================
// GUEST GROUPS - Groups of guests (Family, Friends, Colleagues, etc.)
// Each group gets its own RSVP link via rsvpToken
// ============================================================================
export const guestGroups = pgTable("guest_groups", {
	id: uuid().primaryKey().defaultRandom(),
	invitationId: uuid("invitation_id")
		.notNull()
		.references(() => invitations.id, { onDelete: "cascade" }),

	// Group details
	name: text().notNull(),
	rsvpToken: text("rsvp_token").notNull().unique(), // For /rsvp#t=<TOKEN> links

	// Timestamps
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================================================
// GUESTS - Individual guests belonging to a group
// ============================================================================
export const guests = pgTable("guests", {
	id: uuid().primaryKey().defaultRandom(),
	groupId: uuid("group_id")
		.notNull()
		.references(() => guestGroups.id, { onDelete: "cascade" }),

	// Guest details
	name: text().notNull(),
	email: text(),
	phone: text(),

	// Timestamps
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================================================
// RELATIONS
// ============================================================================
export const usersRelations = relations(users, ({ many }) => ({
	invitations: many(invitations),
}));

export const invitationsRelations = relations(invitations, ({ one, many }) => ({
	user: one(users, {
		fields: [invitations.userId],
		references: [users.id],
	}),
	scheduleBlocks: many(scheduleBlocks),
	notes: many(notes),
	guestGroups: many(guestGroups),
}));

export const scheduleBlocksRelations = relations(scheduleBlocks, ({ one }) => ({
	invitation: one(invitations, {
		fields: [scheduleBlocks.invitationId],
		references: [invitations.id],
	}),
}));

export const notesRelations = relations(notes, ({ one }) => ({
	invitation: one(invitations, {
		fields: [notes.invitationId],
		references: [invitations.id],
	}),
}));

export const guestGroupsRelations = relations(guestGroups, ({ one, many }) => ({
	invitation: one(invitations, {
		fields: [guestGroups.invitationId],
		references: [invitations.id],
	}),
	guests: many(guests),
}));

export const guestsRelations = relations(guests, ({ one }) => ({
	group: one(guestGroups, {
		fields: [guests.groupId],
		references: [guestGroups.id],
	}),
}));
