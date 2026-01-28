import { beforeEach, describe, expect, it, vi } from "vitest";

const mockDb = {
	select: vi.fn().mockReturnThis(),
	from: vi.fn().mockReturnThis(),
	where: vi.fn().mockReturnThis(),
	insert: vi.fn().mockReturnThis(),
	values: vi.fn().mockReturnThis(),
	returning: vi.fn(),
	update: vi.fn().mockReturnThis(),
	set: vi.fn().mockReturnThis(),
};

vi.mock("@/db/index", () => ({
	getDb: vi.fn().mockResolvedValue(mockDb),
}));

vi.mock("@/db/schema", () => ({
	users: { neonAuthId: "neon_auth_id", email: "email", id: "id" },
}));

vi.mock("drizzle-orm", () => ({
	eq: vi.fn((a, b) => ({ column: a, value: b })),
}));

describe("User Sync", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Reset chain methods
		mockDb.select.mockReturnThis();
		mockDb.from.mockReturnThis();
		mockDb.where.mockReturnThis();
		mockDb.insert.mockReturnThis();
		mockDb.values.mockReturnThis();
		mockDb.update.mockReturnThis();
		mockDb.set.mockReturnThis();
	});

	describe("syncUserFromNeonAuthInternal", () => {
		it("should create new user when neonAuthId not found", async () => {
			// First query returns empty (user not found by neonAuthId)
			mockDb.where.mockResolvedValueOnce([]);
			// Insert returns new user
			mockDb.returning.mockResolvedValueOnce([
				{
					id: "new-user-id",
					neonAuthId: "neon-123",
					email: "test@example.com",
				},
			]);

			const { syncUserFromNeonAuthInternal } = await import("./user-sync");
			const result = await syncUserFromNeonAuthInternal({
				neonAuthId: "neon-123",
				email: "test@example.com",
			});

			expect(result).toEqual({
				id: "new-user-id",
				neonAuthId: "neon-123",
				email: "test@example.com",
			});
			expect(mockDb.insert).toHaveBeenCalled();
		});

		it("should return existing user when neonAuthId found", async () => {
			const existingUser = {
				id: "existing-id",
				neonAuthId: "neon-123",
				email: "test@example.com",
			};
			mockDb.where.mockResolvedValueOnce([existingUser]);

			const { syncUserFromNeonAuthInternal } = await import("./user-sync");
			const result = await syncUserFromNeonAuthInternal({
				neonAuthId: "neon-123",
				email: "test@example.com",
			});

			expect(result).toEqual(existingUser);
			expect(mockDb.insert).not.toHaveBeenCalled();
		});

		it("should update email if changed for existing user", async () => {
			const existingUser = {
				id: "existing-id",
				neonAuthId: "neon-123",
				email: "old@example.com",
			};
			mockDb.where.mockResolvedValueOnce([existingUser]);
			// Update returns updated user
			mockDb.returning.mockResolvedValueOnce([
				{ ...existingUser, email: "new@example.com" },
			]);

			const { syncUserFromNeonAuthInternal } = await import("./user-sync");
			const result = await syncUserFromNeonAuthInternal({
				neonAuthId: "neon-123",
				email: "new@example.com",
			});

			expect(result.email).toBe("new@example.com");
			expect(mockDb.update).toHaveBeenCalled();
		});

		it("should throw error when neonAuthId is missing", async () => {
			const { syncUserFromNeonAuthInternal } = await import("./user-sync");

			await expect(
				syncUserFromNeonAuthInternal({
					neonAuthId: "",
					email: "test@example.com",
				}),
			).rejects.toThrow("neonAuthId is required");
		});

		it("should throw error when email is missing", async () => {
			const { syncUserFromNeonAuthInternal } = await import("./user-sync");

			await expect(
				syncUserFromNeonAuthInternal({ neonAuthId: "neon-123", email: "" }),
			).rejects.toThrow("email is required");
		});

		it("should normalize email to lowercase", async () => {
			mockDb.where.mockResolvedValueOnce([]);
			mockDb.returning.mockResolvedValueOnce([
				{
					id: "new-user-id",
					neonAuthId: "neon-123",
					email: "test@example.com",
				},
			]);

			const { syncUserFromNeonAuthInternal } = await import("./user-sync");
			await syncUserFromNeonAuthInternal({
				neonAuthId: "neon-123",
				email: "TEST@EXAMPLE.COM",
			});

			expect(mockDb.values).toHaveBeenCalledWith(
				expect.objectContaining({
					email: "test@example.com",
				}),
			);
		});
	});
});
