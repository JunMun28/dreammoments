import {
  pgTable,
  uuid,
  text,
  timestamp,
  serial,
  date,
  time,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ============================================================================
// USERS - Couples who create wedding invitations
// ============================================================================
export const users = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),
  email: text().notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
})

// ============================================================================
// LOGIN CODES - Email magic link verification codes
// ============================================================================
export const loginCodes = pgTable('login_codes', {
  id: serial().primaryKey(),
  email: text().notNull(),
  code: text().notNull(), // 6-digit verification code
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
})

// ============================================================================
// SESSIONS - User authentication sessions
// ============================================================================
export const sessions = pgTable('sessions', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

// ============================================================================
// INVITATIONS - Wedding invitation data
// ============================================================================
export const invitations = pgTable('invitations', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // Couple info
  partner1Name: text('partner1_name'),
  partner2Name: text('partner2_name'),

  // Wedding details
  weddingDate: date('wedding_date'),
  weddingTime: time('wedding_time'),
  venueName: text('venue_name'),
  venueAddress: text('venue_address'),

  // Template & theme
  templateId: text('template_id'),
  accentColor: text('accent_color'),
  fontPairing: text('font_pairing'),
  heroImageUrl: text('hero_image_url'),

  // RSVP
  rsvpDeadline: timestamp('rsvp_deadline'),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// ============================================================================
// RELATIONS
// ============================================================================
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  invitations: many(invitations),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

export const invitationsRelations = relations(invitations, ({ one }) => ({
  user: one(users, {
    fields: [invitations.userId],
    references: [users.id],
  }),
}))
