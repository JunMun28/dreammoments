import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	createGuestGroupInternal,
	createGuestInternal,
	deleteGuestGroupInternal,
	deleteGuestInternal,
	generateRsvpToken,
	getGuestGroupsWithGuestsInternal,
	importGuestsFromCsvInternal,
	updateGuestGroupInternal,
	updateGuestInternal,
} from "./guest-server";

// Mock the db module
vi.mock("@/db/index", () => ({
	db: {
		insert: vi.fn().mockReturnValue({
			values: vi.fn().mockReturnValue({
				returning: vi.fn().mockResolvedValue([{ id: "mock-uuid" }]),
			}),
		}),
		update: vi.fn().mockReturnValue({
			set: vi.fn().mockReturnValue({
				where: vi.fn().mockReturnValue({
					returning: vi.fn().mockResolvedValue([{ id: "mock-uuid" }]),
				}),
			}),
		}),
		delete: vi.fn().mockReturnValue({
			where: vi.fn().mockReturnValue({
				returning: vi.fn().mockResolvedValue([{ id: "mock-uuid" }]),
			}),
		}),
		select: vi.fn().mockReturnValue({
			from: vi.fn().mockReturnValue({
				where: vi.fn().mockReturnValue([]),
				leftJoin: vi.fn().mockReturnValue({
					where: vi.fn().mockResolvedValue([]),
				}),
			}),
		}),
	},
}));

describe("guest-server", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("generateRsvpToken", () => {
		it("generates a token of expected length", () => {
			const token = generateRsvpToken();
			// Should be 32 chars (16 bytes hex encoded)
			expect(token.length).toBe(32);
		});

		it("generates unique tokens on each call", () => {
			const token1 = generateRsvpToken();
			const token2 = generateRsvpToken();
			expect(token1).not.toBe(token2);
		});

		it("generates only alphanumeric characters", () => {
			const token = generateRsvpToken();
			expect(token).toMatch(/^[a-f0-9]+$/);
		});
	});

	describe("createGuestGroupInternal", () => {
		it("creates a guest group with generated rsvpToken", async () => {
			const result = await createGuestGroupInternal({
				invitationId: "inv-123",
				name: "Family",
			});

			expect(result.id).toBe("mock-uuid");
			expect(result.rsvpToken).toBeDefined();
			expect(result.rsvpToken).toMatch(/^[a-f0-9]{32}$/);
		});

		it("requires invitationId", async () => {
			await expect(
				createGuestGroupInternal({
					invitationId: "",
					name: "Family",
				}),
			).rejects.toThrow("invitationId is required");
		});

		it("requires name", async () => {
			await expect(
				createGuestGroupInternal({
					invitationId: "inv-123",
					name: "",
				}),
			).rejects.toThrow("name is required");
		});
	});

	describe("updateGuestGroupInternal", () => {
		it("updates guest group name", async () => {
			const result = await updateGuestGroupInternal({
				id: "group-123",
				name: "Close Friends",
			});

			expect(result).toEqual({ id: "mock-uuid" });
		});

		it("requires id", async () => {
			await expect(
				updateGuestGroupInternal({
					id: "",
					name: "Test",
				}),
			).rejects.toThrow("id is required");
		});
	});

	describe("deleteGuestGroupInternal", () => {
		it("deletes a guest group", async () => {
			const result = await deleteGuestGroupInternal("group-123");

			expect(result).toEqual({ success: true });
		});

		it("requires id", async () => {
			await expect(deleteGuestGroupInternal("")).rejects.toThrow(
				"id is required",
			);
		});
	});

	describe("createGuestInternal", () => {
		it("creates a guest with required fields", async () => {
			const result = await createGuestInternal({
				groupId: "group-123",
				name: "John Doe",
			});

			expect(result).toEqual({ id: "mock-uuid" });
		});

		it("creates a guest with optional email and phone", async () => {
			const result = await createGuestInternal({
				groupId: "group-123",
				name: "Jane Doe",
				email: "jane@example.com",
				phone: "555-1234",
			});

			expect(result).toEqual({ id: "mock-uuid" });
		});

		it("requires groupId", async () => {
			await expect(
				createGuestInternal({
					groupId: "",
					name: "John Doe",
				}),
			).rejects.toThrow("groupId is required");
		});

		it("requires name", async () => {
			await expect(
				createGuestInternal({
					groupId: "group-123",
					name: "",
				}),
			).rejects.toThrow("name is required");
		});
	});

	describe("updateGuestInternal", () => {
		it("updates guest fields", async () => {
			const result = await updateGuestInternal({
				id: "guest-123",
				name: "Updated Name",
				email: "new@example.com",
			});

			expect(result).toEqual({ id: "mock-uuid" });
		});

		it("requires id", async () => {
			await expect(
				updateGuestInternal({
					id: "",
					name: "Test",
				}),
			).rejects.toThrow("id is required");
		});
	});

	describe("deleteGuestInternal", () => {
		it("deletes a guest", async () => {
			const result = await deleteGuestInternal("guest-123");

			expect(result).toEqual({ success: true });
		});

		it("requires id", async () => {
			await expect(deleteGuestInternal("")).rejects.toThrow("id is required");
		});
	});

	describe("importGuestsFromCsvInternal", () => {
		it("creates groups and guests from CSV data", async () => {
			const csvRows = [
				{ name: "John Doe", group: "Family", email: "john@example.com" },
				{ name: "Jane Doe", group: "Family", phone: "555-1234" },
				{ name: "Bob Smith", group: "Friends" },
			];

			const result = await importGuestsFromCsvInternal({
				invitationId: "inv-123",
				rows: csvRows,
			});

			// Should create 2 groups and 3 guests
			expect(result.groupsCreated).toBe(2);
			expect(result.guestsCreated).toBe(3);
		});

		it("handles empty rows array", async () => {
			const result = await importGuestsFromCsvInternal({
				invitationId: "inv-123",
				rows: [],
			});

			expect(result.groupsCreated).toBe(0);
			expect(result.guestsCreated).toBe(0);
		});

		it("requires invitationId", async () => {
			await expect(
				importGuestsFromCsvInternal({
					invitationId: "",
					rows: [{ name: "Test", group: "Test" }],
				}),
			).rejects.toThrow("invitationId is required");
		});
	});

	describe("getGuestGroupsWithGuestsInternal", () => {
		it("returns empty array when no groups exist", async () => {
			const result = await getGuestGroupsWithGuestsInternal("inv-123");

			expect(result).toEqual([]);
		});

		it("requires invitationId", async () => {
			await expect(getGuestGroupsWithGuestsInternal("")).rejects.toThrow(
				"invitationId is required",
			);
		});
	});
});
