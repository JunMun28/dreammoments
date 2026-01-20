import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	getGroupRsvpStatusInternal,
	getInvitationGuestResponsesInternal,
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

// Mock drizzle-orm (include relations for schema imports)
vi.mock("drizzle-orm", () => ({
	eq: vi.fn((a, b) => ({ eq: [a, b] })),
	inArray: vi.fn((a, b) => ({ inArray: [a, b] })),
	relations: vi.fn(() => ({})),
}));

// Get the mocked db
import { db } from "@/db/index";

const mockDb = db as unknown as {
	select: ReturnType<typeof vi.fn>;
	insert: ReturnType<typeof vi.fn>;
	update: ReturnType<typeof vi.fn>;
	delete: ReturnType<typeof vi.fn>;
};

// Helper to create a chainable mock for select queries
function createSelectMock(result: unknown) {
	return {
		from: vi.fn().mockReturnValue({
			where: vi.fn().mockReturnValue({
				limit: vi.fn().mockResolvedValue(result),
			}),
		}),
	};
}

// Helper to create chainable mock for select without limit
function createSelectMockNoLimit(result: unknown) {
	return {
		from: vi.fn().mockReturnValue({
			where: vi.fn().mockResolvedValue(result),
		}),
	};
}

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
			// Mock 1: Authorization - verify guests belong to group
			mockDb.select.mockReturnValueOnce(
				createSelectMockNoLimit([{ id: "guest-1" }]),
			);

			// Mock 2: Check existing responses - none exist
			mockDb.select.mockReturnValueOnce(
				createSelectMockNoLimit([]),
			);

			// Mock: insert new response
			mockDb.insert.mockReturnValueOnce({
				values: vi.fn().mockResolvedValueOnce([{ id: "response-1" }]),
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
			// Mock 1: Authorization - verify guests belong to group
			mockDb.select.mockReturnValueOnce(
				createSelectMockNoLimit([{ id: "guest-1" }]),
			);

			// Mock 2: Check existing responses - one exists
			mockDb.select.mockReturnValueOnce(
				createSelectMockNoLimit([{ guestId: "guest-1" }]),
			);

			// Mock: update existing response
			mockDb.update.mockReturnValueOnce({
				set: vi.fn().mockReturnValueOnce({
					where: vi.fn().mockResolvedValueOnce([{ id: "existing-response-1" }]),
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
			// Mock 1: Authorization - verify both guests belong to group
			mockDb.select.mockReturnValueOnce(
				createSelectMockNoLimit([{ id: "guest-1" }, { id: "guest-2" }]),
			);

			// Mock 2: Check existing responses - only guest-2 has one
			mockDb.select.mockReturnValueOnce(
				createSelectMockNoLimit([{ guestId: "guest-2" }]),
			);

			// Mock: insert new response for guest-1
			mockDb.insert.mockReturnValueOnce({
				values: vi.fn().mockResolvedValueOnce([{ id: "new-response-1" }]),
			});

			// Mock: update existing response for guest-2
			mockDb.update.mockReturnValueOnce({
				set: vi.fn().mockReturnValueOnce({
					where: vi.fn().mockResolvedValueOnce([{ id: "existing-response-2" }]),
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

		it("should throw error if guest does not belong to group", async () => {
			// Mock: Authorization - guest not found in group
			mockDb.select.mockReturnValueOnce(createSelectMockNoLimit([]));

			const input: SubmitRsvpInput = {
				groupId: "group-123",
				responses: [{ guestId: "unauthorized-guest", attending: true }],
			};

			await expect(submitRsvpInternal(input)).rejects.toThrow(
				"One or more guests do not belong to this group",
			);
		});
	});

	describe("getGroupRsvpStatusInternal", () => {
		it("should throw error if groupId is missing", async () => {
			await expect(getGroupRsvpStatusInternal("")).rejects.toThrow(
				"groupId is required",
			);
		});

		it("should return guest list with their RSVP responses", async () => {
			// Mock 1: get guests in group
			mockDb.select.mockReturnValueOnce(
				createSelectMockNoLimit([
					{ id: "guest-1", name: "John Doe", email: null, phone: null },
					{
						id: "guest-2",
						name: "Jane Smith",
						email: "jane@example.com",
						phone: null,
					},
				]),
			);

			// Mock 2: batch fetch all RSVP responses (only guest-1 has response)
			mockDb.select.mockReturnValueOnce(
				createSelectMockNoLimit([
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
			);

			const result = await getGroupRsvpStatusInternal("group-123");

			expect(result.guests).toHaveLength(2);
			expect(result.guests[0].name).toBe("John Doe");
			expect(result.guests[0].rsvpResponse).toBeDefined();
			expect(result.guests[0].rsvpResponse?.attending).toBe(true);
			expect(result.guests[1].name).toBe("Jane Smith");
			expect(result.guests[1].rsvpResponse).toBeNull();
		});

		it("should return empty array when no guests in group", async () => {
			mockDb.select.mockReturnValueOnce(createSelectMockNoLimit([]));

			const result = await getGroupRsvpStatusInternal("group-123");

			expect(result.guests).toHaveLength(0);
		});

		it("should calculate total headcount correctly", async () => {
			// Mock 1: two guests
			mockDb.select.mockReturnValueOnce(
				createSelectMockNoLimit([
					{ id: "guest-1", name: "John", email: null, phone: null },
					{ id: "guest-2", name: "Jane", email: null, phone: null },
				]),
			);

			// Mock 2: batch fetch all responses
			mockDb.select.mockReturnValueOnce(
				createSelectMockNoLimit([
					{
						id: "r1",
						guestId: "guest-1",
						attending: true,
						mealPreference: null,
						dietaryNotes: null,
						plusOneCount: 2,
						plusOneNames: "Child 1, Child 2",
					},
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
			);

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
			mockDb.select.mockReturnValueOnce(createSelectMockNoLimit([]));

			const result = await getInvitationRsvpSummaryInternal("invitation-123");

			expect(result.totalInvited).toBe(0);
			expect(result.totalAttending).toBe(0);
			expect(result.totalDeclined).toBe(0);
			expect(result.totalPending).toBe(0);
			expect(result.groups).toHaveLength(0);
		});

		it("should aggregate totals across all groups", async () => {
			// Mock 1: get guest groups for invitation
			mockDb.select.mockReturnValueOnce(
				createSelectMockNoLimit([
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
			);

			// Mock 2: Group 1 guests
			mockDb.select.mockReturnValueOnce(
				createSelectMockNoLimit([
					{ id: "guest-1", name: "Mom", email: null, phone: null },
					{ id: "guest-2", name: "Dad", email: null, phone: null },
				]),
			);

			// Mock 3: Batch fetch RSVP responses for Group 1
			mockDb.select.mockReturnValueOnce(
				createSelectMockNoLimit([
					{
						id: "r1",
						guestId: "guest-1",
						attending: true,
						mealPreference: "chicken",
						dietaryNotes: null,
						plusOneCount: 1,
						plusOneNames: "Brother",
					},
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
			);

			// Mock 4: Group 2 guests
			mockDb.select.mockReturnValueOnce(
				createSelectMockNoLimit([
					{ id: "guest-3", name: "Alice", email: null, phone: null },
				]),
			);

			// Mock 5: Batch fetch RSVP responses for Group 2 (no responses)
			mockDb.select.mockReturnValueOnce(createSelectMockNoLimit([]));

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
			// Mock 1: single group
			mockDb.select.mockReturnValueOnce(
				createSelectMockNoLimit([
					{
						id: "group-1",
						name: "VIP",
						invitationId: "inv-1",
						rsvpToken: "vip-token",
					},
				]),
			);

			// Mock 2: guests in group
			mockDb.select.mockReturnValueOnce(
				createSelectMockNoLimit([
					{
						id: "guest-1",
						name: "John",
						email: "john@test.com",
						phone: null,
					},
				]),
			);

			// Mock 3: batch fetch responses
			mockDb.select.mockReturnValueOnce(
				createSelectMockNoLimit([
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
			);

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

	describe("getInvitationGuestResponsesInternal", () => {
		it("should throw error if invitationId is missing", async () => {
			await expect(getInvitationGuestResponsesInternal("")).rejects.toThrow(
				"invitationId is required",
			);
		});

		it("should return empty array when no guest groups exist", async () => {
			// Mock: no guest groups
			mockDb.select.mockReturnValueOnce(createSelectMockNoLimit([]));

			const result =
				await getInvitationGuestResponsesInternal("invitation-123");

			expect(result).toHaveLength(0);
		});

		it("should return guest responses with group name and timestamps", async () => {
			const respondedAt = new Date("2026-01-10T14:30:00Z");
			const updatedAt = new Date("2026-01-11T10:00:00Z");

			// Mock 1: get guest groups for invitation
			mockDb.select.mockReturnValueOnce(
				createSelectMockNoLimit([
					{
						id: "group-1",
						name: "Family",
						invitationId: "invitation-123",
						rsvpToken: "token1",
					},
				]),
			);

			// Mock 2: get guests in group
			mockDb.select.mockReturnValueOnce(
				createSelectMockNoLimit([
					{
						id: "guest-1",
						name: "John Doe",
						email: "john@example.com",
						phone: "555-1234",
					},
				]),
			);

			// Mock 3: get RSVP response for guest
			mockDb.select.mockReturnValueOnce(
				createSelectMockNoLimit([
					{
						id: "response-1",
						guestId: "guest-1",
						attending: true,
						mealPreference: "chicken",
						dietaryNotes: "No nuts",
						plusOneCount: 2,
						plusOneNames: "Jane, Jimmy",
						respondedAt,
						updatedAt,
					},
				]),
			);

			const result =
				await getInvitationGuestResponsesInternal("invitation-123");

			expect(result).toHaveLength(1);
			expect(result[0]).toEqual({
				guestId: "guest-1",
				guestName: "John Doe",
				email: "john@example.com",
				phone: "555-1234",
				groupId: "group-1",
				groupName: "Family",
				status: "attending",
				mealPreference: "chicken",
				dietaryNotes: "No nuts",
				plusOneCount: 2,
				plusOneNames: "Jane, Jimmy",
				headcount: 3,
				respondedAt,
				updatedAt,
			});
		});

		it("should return pending status for guests without response", async () => {
			// Mock 1: get guest groups
			mockDb.select.mockReturnValueOnce(
				createSelectMockNoLimit([
					{
						id: "group-1",
						name: "Friends",
						invitationId: "inv-1",
						rsvpToken: "token1",
					},
				]),
			);

			// Mock 2: guests
			mockDb.select.mockReturnValueOnce(
				createSelectMockNoLimit([
					{ id: "guest-1", name: "Alice", email: null, phone: null },
				]),
			);

			// Mock 3: no RSVP response
			mockDb.select.mockReturnValueOnce(createSelectMockNoLimit([]));

			const result = await getInvitationGuestResponsesInternal("inv-1");

			expect(result[0].status).toBe("pending");
			expect(result[0].headcount).toBe(0);
			expect(result[0].respondedAt).toBeNull();
		});

		it("should return declined status correctly", async () => {
			const respondedAt = new Date("2026-01-12T09:00:00Z");

			// Mock 1: get guest groups
			mockDb.select.mockReturnValueOnce(
				createSelectMockNoLimit([
					{
						id: "group-1",
						name: "Colleagues",
						invitationId: "inv-1",
						rsvpToken: "token1",
					},
				]),
			);

			// Mock 2: guests
			mockDb.select.mockReturnValueOnce(
				createSelectMockNoLimit([
					{
						id: "guest-1",
						name: "Bob",
						email: "bob@work.com",
						phone: null,
					},
				]),
			);

			// Mock 3: RSVP response - declined
			mockDb.select.mockReturnValueOnce(
				createSelectMockNoLimit([
					{
						id: "r1",
						guestId: "guest-1",
						attending: false,
						mealPreference: null,
						dietaryNotes: null,
						plusOneCount: 0,
						plusOneNames: null,
						respondedAt,
						updatedAt: respondedAt,
					},
				]),
			);

			const result = await getInvitationGuestResponsesInternal("inv-1");

			expect(result[0].status).toBe("declined");
			expect(result[0].headcount).toBe(0);
			expect(result[0].respondedAt).toEqual(respondedAt);
		});

		it("should aggregate guests from multiple groups", async () => {
			// Mock 1: get multiple guest groups
			mockDb.select.mockReturnValueOnce(
				createSelectMockNoLimit([
					{
						id: "group-1",
						name: "Family",
						invitationId: "inv-1",
						rsvpToken: "token1",
					},
					{
						id: "group-2",
						name: "Friends",
						invitationId: "inv-1",
						rsvpToken: "token2",
					},
				]),
			);

			// Mock 2: Group 1 guests
			mockDb.select.mockReturnValueOnce(
				createSelectMockNoLimit([
					{ id: "guest-1", name: "Mom", email: null, phone: null },
				]),
			);

			// Mock 3: Group 1 guest's RSVP (no response)
			mockDb.select.mockReturnValueOnce(createSelectMockNoLimit([]));

			// Mock 4: Group 2 guests
			mockDb.select.mockReturnValueOnce(
				createSelectMockNoLimit([
					{ id: "guest-2", name: "Alice", email: null, phone: null },
				]),
			);

			// Mock 5: Group 2 guest's RSVP (no response)
			mockDb.select.mockReturnValueOnce(createSelectMockNoLimit([]));

			const result = await getInvitationGuestResponsesInternal("inv-1");

			expect(result).toHaveLength(2);
			expect(result[0].guestName).toBe("Mom");
			expect(result[0].groupName).toBe("Family");
			expect(result[1].guestName).toBe("Alice");
			expect(result[1].groupName).toBe("Friends");
		});
	});
});
