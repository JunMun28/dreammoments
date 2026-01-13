import { getTableName } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import {
	guestGroups,
	guestGroupsRelations,
	guests,
	guestsRelations,
	invitations,
	invitationsRelations,
	notes,
	notesRelations,
	scheduleBlocks,
	scheduleBlocksRelations,
	users,
	usersRelations,
} from "./schema";

describe("Database Schema", () => {
	describe("users table", () => {
		it("should export users table", () => {
			expect(users).toBeDefined();
		});

		it("should have correct table name", () => {
			expect(getTableName(users)).toBe("users");
		});

		it("should have required columns", () => {
			expect(users.id).toBeDefined();
			expect(users.email).toBeDefined();
			expect(users.createdAt).toBeDefined();
		});

		it("should have neonAuthId column for Neon Auth linking", () => {
			expect(users.neonAuthId).toBeDefined();
		});
	});

	describe("invitations table", () => {
		it("should export invitations table", () => {
			expect(invitations).toBeDefined();
		});

		it("should have correct table name", () => {
			expect(getTableName(invitations)).toBe("invitations");
		});

		it("should have couple info columns", () => {
			expect(invitations.partner1Name).toBeDefined();
			expect(invitations.partner2Name).toBeDefined();
		});

		it("should have wedding details columns", () => {
			expect(invitations.weddingDate).toBeDefined();
			expect(invitations.weddingTime).toBeDefined();
			expect(invitations.venueName).toBeDefined();
			expect(invitations.venueAddress).toBeDefined();
		});

		it("should have theme columns", () => {
			expect(invitations.templateId).toBeDefined();
			expect(invitations.accentColor).toBeDefined();
			expect(invitations.fontPairing).toBeDefined();
			expect(invitations.heroImageUrl).toBeDefined();
		});

		it("should have RSVP and timestamp columns", () => {
			expect(invitations.rsvpDeadline).toBeDefined();
			expect(invitations.createdAt).toBeDefined();
			expect(invitations.updatedAt).toBeDefined();
		});
	});

	describe("scheduleBlocks table", () => {
		it("should export scheduleBlocks table", () => {
			expect(scheduleBlocks).toBeDefined();
		});

		it("should have correct table name", () => {
			expect(getTableName(scheduleBlocks)).toBe("schedule_blocks");
		});

		it("should have required columns", () => {
			expect(scheduleBlocks.id).toBeDefined();
			expect(scheduleBlocks.invitationId).toBeDefined();
			expect(scheduleBlocks.title).toBeDefined();
		});

		it("should have optional content columns", () => {
			expect(scheduleBlocks.time).toBeDefined();
			expect(scheduleBlocks.description).toBeDefined();
		});

		it("should have order column for sequencing", () => {
			expect(scheduleBlocks.order).toBeDefined();
		});

		it("should have timestamp columns", () => {
			expect(scheduleBlocks.createdAt).toBeDefined();
			expect(scheduleBlocks.updatedAt).toBeDefined();
		});
	});

	describe("notes table", () => {
		it("should export notes table", () => {
			expect(notes).toBeDefined();
		});

		it("should have correct table name", () => {
			expect(getTableName(notes)).toBe("notes");
		});

		it("should have required columns", () => {
			expect(notes.id).toBeDefined();
			expect(notes.invitationId).toBeDefined();
			expect(notes.title).toBeDefined();
		});

		it("should have optional description column", () => {
			expect(notes.description).toBeDefined();
		});

		it("should have order column for sequencing", () => {
			expect(notes.order).toBeDefined();
		});

		it("should have timestamp columns", () => {
			expect(notes.createdAt).toBeDefined();
			expect(notes.updatedAt).toBeDefined();
		});
	});

	describe("guestGroups table", () => {
		it("should export guestGroups table", () => {
			expect(guestGroups).toBeDefined();
		});

		it("should have correct table name", () => {
			expect(getTableName(guestGroups)).toBe("guest_groups");
		});

		it("should have required columns", () => {
			expect(guestGroups.id).toBeDefined();
			expect(guestGroups.invitationId).toBeDefined();
			expect(guestGroups.name).toBeDefined();
		});

		it("should have RSVP token column for unique group links", () => {
			expect(guestGroups.rsvpToken).toBeDefined();
		});

		it("should have timestamp columns", () => {
			expect(guestGroups.createdAt).toBeDefined();
			expect(guestGroups.updatedAt).toBeDefined();
		});
	});

	describe("guests table", () => {
		it("should export guests table", () => {
			expect(guests).toBeDefined();
		});

		it("should have correct table name", () => {
			expect(getTableName(guests)).toBe("guests");
		});

		it("should have required columns", () => {
			expect(guests.id).toBeDefined();
			expect(guests.groupId).toBeDefined();
			expect(guests.name).toBeDefined();
		});

		it("should have optional contact columns", () => {
			expect(guests.email).toBeDefined();
			expect(guests.phone).toBeDefined();
		});

		it("should have timestamp columns", () => {
			expect(guests.createdAt).toBeDefined();
			expect(guests.updatedAt).toBeDefined();
		});
	});

	describe("relations", () => {
		it("should export usersRelations", () => {
			expect(usersRelations).toBeDefined();
		});

		it("should export invitationsRelations", () => {
			expect(invitationsRelations).toBeDefined();
		});

		it("should export scheduleBlocksRelations", () => {
			expect(scheduleBlocksRelations).toBeDefined();
		});

		it("should export notesRelations", () => {
			expect(notesRelations).toBeDefined();
		});

		it("should export guestGroupsRelations", () => {
			expect(guestGroupsRelations).toBeDefined();
		});

		it("should export guestsRelations", () => {
			expect(guestsRelations).toBeDefined();
		});
	});
});
