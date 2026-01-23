import { relations } from "drizzle-orm";
import {
	boolean,
	date,
	integer,
	jsonb,
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

	// Venue coordinates (for map display)
	venueLatitude: text("venue_latitude"),
	venueLongitude: text("venue_longitude"),

	// Layout format: "card" (default single card) or "longpage" (scrollable sections)
	layoutFormat: text("layout_format").default("card"),

	// Editor mode: "structured" (form-based) or "canvas" (fabric.js free-form)
	editorMode: text("editor_mode").default("structured"),

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
// GUEST SESSIONS - Token-based sessions for RSVP (no login required)
// Created when guest opens RSVP link, stored in cookie for return visits
// ============================================================================
export const guestSessions = pgTable("guest_sessions", {
	id: uuid().primaryKey().defaultRandom(),
	groupId: uuid("group_id")
		.notNull()
		.references(() => guestGroups.id, { onDelete: "cascade" }),

	// Session token stored in cookie
	sessionToken: text("session_token").notNull().unique(),

	// Expiry (30 days from creation)
	expiresAt: timestamp("expires_at").notNull(),

	// Timestamps
	createdAt: timestamp("created_at").defaultNow(),
});

// ============================================================================
// RSVP RESPONSES - Individual RSVP responses per guest
// Each guest in a group can respond with attendance + meal preference
// Supports plus-ones (additional attendees not in original guest list)
// ============================================================================
export const rsvpResponses = pgTable("rsvp_responses", {
	id: uuid().primaryKey().defaultRandom(),
	guestId: uuid("guest_id")
		.notNull()
		.references(() => guests.id, { onDelete: "cascade" }),

	// Response details
	attending: boolean().notNull(), // true = attending, false = not attending
	mealPreference: text("meal_preference"), // e.g., "chicken", "fish", "vegetarian"
	dietaryNotes: text("dietary_notes"), // Special dietary requirements

	// Plus-ones (additional attendees for this guest)
	plusOneCount: integer("plus_one_count").notNull().default(0),
	plusOneNames: text("plus_one_names"), // Comma-separated names of plus-ones

	// Timestamps
	respondedAt: timestamp("responded_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

// ============================================================================
// GALLERY IMAGES - Photo gallery for couple photos
// ============================================================================
export const galleryImages = pgTable("gallery_images", {
	id: uuid().primaryKey().defaultRandom(),
	invitationId: uuid("invitation_id")
		.notNull()
		.references(() => invitations.id, { onDelete: "cascade" }),

	// Image content
	imageUrl: text("image_url").notNull(),
	caption: text(),

	// Ordering
	order: integer().notNull().default(0),

	// Timestamps
	createdAt: timestamp("created_at").defaultNow(),
});

// ============================================================================
// CANVAS STATES - Free-form canvas editor state (Fabric.js JSON)
// Stores the serialized canvas data when editorMode = 'canvas'
// ============================================================================
export const canvasStates = pgTable("canvas_states", {
	id: uuid().primaryKey().defaultRandom(),
	invitationId: uuid("invitation_id")
		.notNull()
		.unique() // One canvas state per invitation
		.references(() => invitations.id, { onDelete: "cascade" }),

	// Canvas data as JSON (Fabric.js serialized format)
	canvasData: jsonb("canvas_data").notNull(),

	// Schema version for future migrations
	version: integer().notNull().default(1),

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
	galleryImages: many(galleryImages),
	canvasState: one(canvasStates),
}));

export const galleryImagesRelations = relations(galleryImages, ({ one }) => ({
	invitation: one(invitations, {
		fields: [galleryImages.invitationId],
		references: [invitations.id],
	}),
}));

export const canvasStatesRelations = relations(canvasStates, ({ one }) => ({
	invitation: one(invitations, {
		fields: [canvasStates.invitationId],
		references: [invitations.id],
	}),
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
	sessions: many(guestSessions),
}));

export const guestsRelations = relations(guests, ({ one }) => ({
	group: one(guestGroups, {
		fields: [guests.groupId],
		references: [guestGroups.id],
	}),
	rsvpResponse: one(rsvpResponses),
}));

export const guestSessionsRelations = relations(guestSessions, ({ one }) => ({
	group: one(guestGroups, {
		fields: [guestSessions.groupId],
		references: [guestGroups.id],
	}),
}));

export const rsvpResponsesRelations = relations(rsvpResponses, ({ one }) => ({
	guest: one(guests, {
		fields: [rsvpResponses.guestId],
		references: [guests.id],
	}),
}));
