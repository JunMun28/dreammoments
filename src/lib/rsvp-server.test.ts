import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	getGroupRsvpStatusInternal,
	getInvitationRsvpSummaryInternal,
	type SubmitRsvpInput,
	submitRsvpInternal,
} from "./rsvp-server";

// Mock the database
vi.mock("@/db/index", () => ({
	db: {
		select: vi.fn(),
		insert: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	},
}));

// Get the mocked db
import { db } from "@/db/index";

const mockDb = db as unknown as {
	select: ReturnType<typeof vi.fn>;
	insert: ReturnType<typeof vi.fn>;
	update: ReturnType<typeof vi.fn>;
	delete: ReturnType<typeof vi.fn>;
};

describe("rsvp-server", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("submitRsvpInternal", () => {
		it("should throw error if groupId is missing", async () => {
			const input: SubmitRsvpInput = {
				groupId: "",
				responses: [],
			};

			await expect(submitRsvpInternal(input)).rejects.toThrow(
				"groupId is required",
			);
		});

		it("should throw error if responses array is empty", async () => {
			const input: SubmitRsvpInput = {
				groupId: "group-123",
				responses: [],
			};

			await expect(submitRsvpInternal(input)).rejects.toThrow(
				"At least one response is required",
			);
		});

		it("should throw error if response guestId is missing", async () => {
			const input: SubmitRsvpInput = {
				groupId: "group-123",
				responses: [
					{
						guestId: "",
						attending: true,
					},
				],
			};

			await expect(submitRsvpInternal(input)).rejects.toThrow(
				"guestId is required for each response",
			);
		});

		it("should create new RSVP responses for guests without existing responses", async () => {
			// Mock: no existing responses
			mockDb.select.mockReturnValueOnce({
				from: vi.fn().mockReturnValueOnce({
					where: vi.fn().mockResolvedValueOnce([]),
				}),
			});

			// Mock: insert new response
			mockDb.insert.mockReturnValueOnce({
				values: vi.fn().mockReturnValueOnce({
					returning: vi.fn().mockResolvedValueOnce([{ id: "response-1" }]),
				}),
			});

			const input: SubmitRsvpInput = {
				groupId: "group-123",
				responses: [
					{
						guestId: "guest-1",
						attending: true,
						mealPreference: "chicken",
						plusOneCount: 1,
						plusOneNames: "Jane Doe",
					},
				],
			};

			const result = await submitRsvpInternal(input);

			expect(result.success).toBe(true);
			expect(result.responsesCreated).toBe(1);
			expect(result.responsesUpdated).toBe(0);
		});

		it("should update existing RSVP responses", async () => {
			// Mock: existing response found
			mockDb.select.mockReturnValueOnce({
				from: vi.fn().mockReturnValueOnce({
					where: vi.fn().mockResolvedValueOnce([{ id: "existing-response-1" }]),
				}),
			});

			// Mock: update existing response
			mockDb.update.mockReturnValueOnce({
				set: vi.fn().mockReturnValueOnce({
					where: vi.fn().mockReturnValueOnce({
						returning: vi
							.fn()
							.mockResolvedValueOnce([{ id: "existing-response-1" }]),
					}),
				}),
			});

			const input: SubmitRsvpInput = {
				groupId: "group-123",
				responses: [
					{
						guestId: "guest-1",
						attending: false,
					},
				],
			};

			const result = await submitRsvpInternal(input);

			expect(result.success).toBe(true);
			expect(result.responsesCreated).toBe(0);
			expect(result.responsesUpdated).toBe(1);
		});

		it("should handle mixed create and update responses", async () => {
			// First guest: no existing response
			mockDb.select.mockReturnValueOnce({
				from: vi.fn().mockReturnValueOnce({
					where: vi.fn().mockResolvedValueOnce([]),
				}),
			});
			mockDb.insert.mockReturnValueOnce({
				values: vi.fn().mockReturnValueOnce({
					returning: vi.fn().mockResolvedValueOnce([{ id: "new-response-1" }]),
				}),
			});

			// Second guest: existing response
			mockDb.select.mockReturnValueOnce({
				from: vi.fn().mockReturnValueOnce({
					where: vi.fn().mockResolvedValueOnce([{ id: "existing-response-2" }]),
				}),
			});
			mockDb.update.mockReturnValueOnce({
				set: vi.fn().mockReturnValueOnce({
					where: vi.fn().mockReturnValueOnce({
						returning: vi
							.fn()
							.mockResolvedValueOnce([{ id: "existing-response-2" }]),
					}),
				}),
			});

			const input: SubmitRsvpInput = {
				groupId: "group-123",
				responses: [
					{ guestId: "guest-1", attending: true },
					{ guestId: "guest-2", attending: false },
				],
			};

			const result = await submitRsvpInternal(input);

			expect(result.success).toBe(true);
			expect(result.responsesCreated).toBe(1);
			expect(result.responsesUpdated).toBe(1);
		});
	});

	describe("getGroupRsvpStatusInternal", () => {
		it("should throw error if groupId is missing", async () => {
			await expect(getGroupRsvpStatusInternal("")).rejects.toThrow(
				"groupId is required",
			);
		});

		it("should return guest list with their RSVP responses", async () => {
			// Mock: get guests in group
			mockDb.select.mockReturnValueOnce({
				from: vi.fn().mockReturnValueOnce({
					where: vi.fn().mockResolvedValueOnce([
						{ id: "guest-1", name: "John Doe", email: null, phone: null },
						{
							id: "guest-2",
							name: "Jane Smith",
							email: "jane@example.com",
							phone: null,
						},
					]),
				}),
			});

			// Mock: get RSVP responses for guest-1 (has response)
			mockDb.select.mockReturnValueOnce({
				from: vi.fn().mockReturnValueOnce({
					where: vi.fn().mockResolvedValueOnce([
						{
							id: "response-1",
							guestId: "guest-1",
							attending: true,
							mealPreference: "fish",
							dietaryNotes: null,
							plusOneCount: 0,
							plusOneNames: null,
						},
					]),
				}),
			});

			// Mock: get RSVP responses for guest-2 (no response)
			mockDb.select.mockReturnValueOnce({
				from: vi.fn().mockReturnValueOnce({
					where: vi.fn().mockResolvedValueOnce([]),
				}),
			});

			const result = await getGroupRsvpStatusInternal("group-123");

			expect(result.guests).toHaveLength(2);
			expect(result.guests[0].name).toBe("John Doe");
			expect(result.guests[0].rsvpResponse).toBeDefined();
			expect(result.guests[0].rsvpResponse?.attending).toBe(true);
			expect(result.guests[1].name).toBe("Jane Smith");
			expect(result.guests[1].rsvpResponse).toBeNull();
		});

		it("should return empty array when no guests in group", async () => {
			mockDb.select.mockReturnValueOnce({
				from: vi.fn().mockReturnValueOnce({
					where: vi.fn().mockResolvedValueOnce([]),
				}),
			});

			const result = await getGroupRsvpStatusInternal("group-123");

			expect(result.guests).toHaveLength(0);
		});

		it("should calculate total headcount correctly", async () => {
			// Mock: two guests
			mockDb.select.mockReturnValueOnce({
				from: vi.fn().mockReturnValueOnce({
					where: vi.fn().mockResolvedValueOnce([
						{ id: "guest-1", name: "John", email: null, phone: null },
						{ id: "guest-2", name: "Jane", email: null, phone: null },
					]),
				}),
			});

			// Guest 1: attending with 2 plus-ones
			mockDb.select.mockReturnValueOnce({
				from: vi.fn().mockReturnValueOnce({
					where: vi.fn().mockResolvedValueOnce([
						{
							id: "r1",
							guestId: "guest-1",
							attending: true,
							mealPreference: null,
							dietaryNotes: null,
							plusOneCount: 2,
							plusOneNames: "Child 1, Child 2",
						},
					]),
				}),
			});

			// Guest 2: attending with no plus-ones
			mockDb.select.mockReturnValueOnce({
				from: vi.fn().mockReturnValueOnce({
					where: vi.fn().mockResolvedValueOnce([
						{
							id: "r2",
							guestId: "guest-2",
							attending: true,
							mealPreference: null,
							dietaryNotes: null,
							plusOneCount: 0,
							plusOneNames: null,
						},
					]),
				}),
			});

			const result = await getGroupRsvpStatusInternal("group-123");

			// 2 guests + 2 plus-ones = 4 total attending
			expect(result.totalAttending).toBe(4);
			expect(result.totalDeclined).toBe(0);
			expect(result.totalPending).toBe(0);
		});
	});

	describe("getInvitationRsvpSummaryInternal", () => {
		it("should throw error if invitationId is missing", async () => {
			await expect(getInvitationRsvpSummaryInternal("")).rejects.toThrow(
				"invitationId is required",
			);
		});

		it("should return zeros when no guest groups exist", async () => {
			// Mock: no guest groups
			mockDb.select.mockReturnValueOnce({
				from: vi.fn().mockReturnValueOnce({
					where: vi.fn().mockResolvedValueOnce([]),
				}),
			});

			const result = await getInvitationRsvpSummaryInternal("invitation-123");

			expect(result.totalInvited).toBe(0);
			expect(result.totalAttending).toBe(0);
			expect(result.totalDeclined).toBe(0);
			expect(result.totalPending).toBe(0);
			expect(result.groups).toHaveLength(0);
		});

		it("should aggregate totals across all groups", async () => {
			// Mock: get guest groups for invitation
			mockDb.select.mockReturnValueOnce({
				from: vi.fn().mockReturnValueOnce({
					where: vi.fn().mockResolvedValueOnce([
						{
							id: "group-1",
							name: "Family",
							invitationId: "invitation-123",
							rsvpToken: "token1",
						},
						{
							id: "group-2",
							name: "Friends",
							invitationId: "invitation-123",
							rsvpToken: "token2",
						},
					]),
				}),
			});

			// Mock: Group 1 guests
			mockDb.select.mockReturnValueOnce({
				from: vi.fn().mockReturnValueOnce({
					where: vi.fn().mockResolvedValueOnce([
						{ id: "guest-1", name: "Mom", email: null, phone: null },
						{ id: "guest-2", name: "Dad", email: null, phone: null },
					]),
				}),
			});
			// Guest 1: attending with 1 plus-one
			mockDb.select.mockReturnValueOnce({
				from: vi.fn().mockReturnValueOnce({
					where: vi.fn().mockResolvedValueOnce([
						{
							id: "r1",
							guestId: "guest-1",
							attending: true,
							mealPreference: "chicken",
							dietaryNotes: null,
							plusOneCount: 1,
							plusOneNames: "Brother",
						},
					]),
				}),
			});
			// Guest 2: declined
			mockDb.select.mockReturnValueOnce({
				from: vi.fn().mockReturnValueOnce({
					where: vi.fn().mockResolvedValueOnce([
						{
							id: "r2",
							guestId: "guest-2",
							attending: false,
							mealPreference: null,
							dietaryNotes: null,
							plusOneCount: 0,
							plusOneNames: null,
						},
					]),
				}),
			});

			// Mock: Group 2 guests
			mockDb.select.mockReturnValueOnce({
				from: vi.fn().mockReturnValueOnce({
					where: vi
						.fn()
						.mockResolvedValueOnce([
							{ id: "guest-3", name: "Alice", email: null, phone: null },
						]),
				}),
			});
			// Guest 3: pending (no response)
			mockDb.select.mockReturnValueOnce({
				from: vi.fn().mockReturnValueOnce({
					where: vi.fn().mockResolvedValueOnce([]),
				}),
			});

			const result = await getInvitationRsvpSummaryInternal("invitation-123");

			expect(result.totalInvited).toBe(3); // 3 guests total (not counting plus-ones)
			expect(result.totalAttending).toBe(2); // 1 guest + 1 plus-one
			expect(result.totalDeclined).toBe(1);
			expect(result.totalPending).toBe(1);
			expect(result.groups).toHaveLength(2);
			expect(result.groups[0].name).toBe("Family");
			expect(result.groups[0].totalAttending).toBe(2);
			expect(result.groups[1].name).toBe("Friends");
			expect(result.groups[1].totalPending).toBe(1);
		});

		it("should return per-group breakdown", async () => {
			// Mock: single group
			mockDb.select.mockReturnValueOnce({
				from: vi.fn().mockReturnValueOnce({
					where: vi.fn().mockResolvedValueOnce([
						{
							id: "group-1",
							name: "VIP",
							invitationId: "inv-1",
							rsvpToken: "vip-token",
						},
					]),
				}),
			});

			// Mock: guests
			mockDb.select.mockReturnValueOnce({
				from: vi.fn().mockReturnValueOnce({
					where: vi.fn().mockResolvedValueOnce([
						{
							id: "guest-1",
							name: "John",
							email: "john@test.com",
							phone: null,
						},
					]),
				}),
			});
			mockDb.select.mockReturnValueOnce({
				from: vi.fn().mockReturnValueOnce({
					where: vi.fn().mockResolvedValueOnce([
						{
							id: "r1",
							guestId: "guest-1",
							attending: true,
							mealPreference: "fish",
							dietaryNotes: "No shellfish",
							plusOneCount: 0,
							plusOneNames: null,
						},
					]),
				}),
			});

			const result = await getInvitationRsvpSummaryInternal("inv-1");

			expect(result.groups[0]).toEqual({
				id: "group-1",
				name: "VIP",
				rsvpToken: "vip-token",
				guestCount: 1,
				totalAttending: 1,
				totalDeclined: 0,
				totalPending: 0,
			});
		});
	});
});
