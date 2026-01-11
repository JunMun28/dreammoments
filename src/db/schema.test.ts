import { describe, it, expect } from 'vitest'
import {
  users,
  loginCodes,
  sessions,
  invitations,
  usersRelations,
  sessionsRelations,
  invitationsRelations,
} from './schema'
import { getTableName } from 'drizzle-orm'

describe('Database Schema', () => {
  describe('users table', () => {
    it('should export users table', () => {
      expect(users).toBeDefined()
    })

    it('should have correct table name', () => {
      expect(getTableName(users)).toBe('users')
    })

    it('should have required columns', () => {
      expect(users.id).toBeDefined()
      expect(users.email).toBeDefined()
      expect(users.createdAt).toBeDefined()
    })
  })

  describe('loginCodes table', () => {
    it('should export loginCodes table', () => {
      expect(loginCodes).toBeDefined()
    })

    it('should have correct table name', () => {
      expect(getTableName(loginCodes)).toBe('login_codes')
    })

    it('should have required columns', () => {
      expect(loginCodes.id).toBeDefined()
      expect(loginCodes.email).toBeDefined()
      expect(loginCodes.code).toBeDefined()
      expect(loginCodes.expiresAt).toBeDefined()
      expect(loginCodes.usedAt).toBeDefined()
    })
  })

  describe('sessions table', () => {
    it('should export sessions table', () => {
      expect(sessions).toBeDefined()
    })

    it('should have correct table name', () => {
      expect(getTableName(sessions)).toBe('sessions')
    })

    it('should have required columns', () => {
      expect(sessions.id).toBeDefined()
      expect(sessions.userId).toBeDefined()
      expect(sessions.expiresAt).toBeDefined()
      expect(sessions.createdAt).toBeDefined()
    })
  })

  describe('invitations table', () => {
    it('should export invitations table', () => {
      expect(invitations).toBeDefined()
    })

    it('should have correct table name', () => {
      expect(getTableName(invitations)).toBe('invitations')
    })

    it('should have couple info columns', () => {
      expect(invitations.partner1Name).toBeDefined()
      expect(invitations.partner2Name).toBeDefined()
    })

    it('should have wedding details columns', () => {
      expect(invitations.weddingDate).toBeDefined()
      expect(invitations.weddingTime).toBeDefined()
      expect(invitations.venueName).toBeDefined()
      expect(invitations.venueAddress).toBeDefined()
    })

    it('should have theme columns', () => {
      expect(invitations.templateId).toBeDefined()
      expect(invitations.accentColor).toBeDefined()
      expect(invitations.fontPairing).toBeDefined()
      expect(invitations.heroImageUrl).toBeDefined()
    })

    it('should have RSVP and timestamp columns', () => {
      expect(invitations.rsvpDeadline).toBeDefined()
      expect(invitations.createdAt).toBeDefined()
      expect(invitations.updatedAt).toBeDefined()
    })
  })

  describe('relations', () => {
    it('should export usersRelations', () => {
      expect(usersRelations).toBeDefined()
    })

    it('should export sessionsRelations', () => {
      expect(sessionsRelations).toBeDefined()
    })

    it('should export invitationsRelations', () => {
      expect(invitationsRelations).toBeDefined()
    })
  })
})
