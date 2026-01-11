import { relations } from "drizzle-orm";
import {
	date,
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
// RELATIONS
// ============================================================================
export const usersRelations = relations(users, ({ many }) => ({
	invitations: many(invitations),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
	user: one(users, {
		fields: [invitations.userId],
		references: [users.id],
	}),
}));
