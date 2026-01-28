import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	createGuestSessionInternal,
	exchangeTokenForSessionInternal,
	validateGuestSessionInternal,
} from "./guest-session";

// Use vi.hoisted to create mock before vi.mock hoisting
const { mockDb } = vi.hoisted(() => ({
	mockDb: {
		insert: vi.fn(() => ({
			values: vi.fn(() => ({
				returning: vi.fn(),
			})),
		})),
		select: vi.fn(() => ({
			from: vi.fn(() => ({
				where: vi.fn(() => ({
					limit: vi.fn(),
				})),
				innerJoin: vi.fn(() => ({
					where: vi.fn(() => ({
						limit: vi.fn(),
					})),
				})),
			})),
		})),
		delete: vi.fn(() => ({
			where: vi.fn(),
		})),
	},
}));

vi.mock("@/db/index", () => ({
	db: mockDb,
	getDb: vi.fn(() => Promise.resolve(mockDb)),
}));

// Mock crypto - need to export default since it's a Node builtin
vi.mock("node:crypto", async (importOriginal) => {
	const actual = await importOriginal<typeof import("node:crypto")>();
	return {
		...actual,
		randomBytes: vi.fn(() => ({
			toString: vi.fn(() => "mockedsessiontoken12345678901234"),
		})),
	};
});

describe("guest-session", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("createGuestSessionInternal", () => {
		it("should create a new guest session with 30-day expiry", async () => {
			const { db } = await import("@/db/index");
			const mockSession = {
				id: "session-id",
				groupId: "group-id",
				sessionToken: "mockedsessiontoken12345678901234",
				expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
				createdAt: new Date(),
			};

			vi.mocked(db.insert).mockReturnValue({
				values: vi.fn().mockReturnValue({
					returning: vi.fn().mockResolvedValue([mockSession]),
				}),
			} as unknown as ReturnType<typeof db.insert>);

			const result = await createGuestSessionInternal("group-id");

			expect(result).toEqual(mockSession);
			expect(db.insert).toHaveBeenCalled();
		});

		it("should generate a secure session token", async () => {
			const { db } = await import("@/db/index");
			const mockSession = {
				id: "session-id",
				groupId: "group-id",
				sessionToken: "mockedsessiontoken12345678901234",
				expiresAt: new Date(),
				createdAt: new Date(),
			};

			vi.mocked(db.insert).mockReturnValue({
				values: vi.fn().mockReturnValue({
					returning: vi.fn().mockResolvedValue([mockSession]),
				}),
			} as unknown as ReturnType<typeof db.insert>);

			const result = await createGuestSessionInternal("group-id");

			expect(result.sessionToken).toBe("mockedsessiontoken12345678901234");
		});
	});

	describe("validateGuestSessionInternal", () => {
		it("should return session with group data if valid and not expired", async () => {
			const { db } = await import("@/db/index");
			const futureDate = new Date(Date.now() + 1000 * 60 * 60);
			const mockResult = [
				{
					guest_sessions: {
						id: "session-id",
						groupId: "group-id",
						sessionToken: "token",
						expiresAt: futureDate,
						createdAt: new Date(),
					},
					guest_groups: {
						id: "group-id",
						invitationId: "invitation-id",
						name: "Smith Family",
						rsvpToken: "rsvp-token",
						createdAt: new Date(),
						updatedAt: new Date(),
					},
				},
			];

			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					innerJoin: vi.fn().mockReturnValue({
						where: vi.fn().mockReturnValue({
							limit: vi.fn().mockResolvedValue(mockResult),
						}),
					}),
				}),
			} as unknown as ReturnType<typeof db.select>);

			const result = await validateGuestSessionInternal("token");

			expect(result).toEqual({
				session: mockResult[0].guest_sessions,
				group: mockResult[0].guest_groups,
			});
		});

		it("should return null if session not found", async () => {
			const { db } = await import("@/db/index");

			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					innerJoin: vi.fn().mockReturnValue({
						where: vi.fn().mockReturnValue({
							limit: vi.fn().mockResolvedValue([]),
						}),
					}),
				}),
			} as unknown as ReturnType<typeof db.select>);

			const result = await validateGuestSessionInternal("invalid-token");

			expect(result).toBeNull();
		});

		it("should return null if session is expired", async () => {
			const { db } = await import("@/db/index");
			const pastDate = new Date(Date.now() - 1000 * 60 * 60); // 1 hour ago
			const mockResult = [
				{
					guest_sessions: {
						id: "session-id",
						groupId: "group-id",
						sessionToken: "token",
						expiresAt: pastDate,
						createdAt: new Date(),
					},
					guest_groups: {
						id: "group-id",
						invitationId: "invitation-id",
						name: "Smith Family",
						rsvpToken: "rsvp-token",
						createdAt: new Date(),
						updatedAt: new Date(),
					},
				},
			];

			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					innerJoin: vi.fn().mockReturnValue({
						where: vi.fn().mockReturnValue({
							limit: vi.fn().mockResolvedValue(mockResult),
						}),
					}),
				}),
			} as unknown as ReturnType<typeof db.select>);

			const result = await validateGuestSessionInternal("token");

			expect(result).toBeNull();
		});
	});

	describe("exchangeTokenForSessionInternal", () => {
		it("should look up group by RSVP token and create session", async () => {
			const { db } = await import("@/db/index");
			const mockGroup = {
				id: "group-id",
				invitationId: "invitation-id",
				name: "Smith Family",
				rsvpToken: "rsvp-token",
				createdAt: new Date(),
				updatedAt: new Date(),
			};
			const mockSession = {
				id: "session-id",
				groupId: "group-id",
				sessionToken: "mockedsessiontoken12345678901234",
				expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
				createdAt: new Date(),
			};

			// Mock select for group lookup
			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([mockGroup]),
					}),
				}),
			} as unknown as ReturnType<typeof db.select>);

			// Mock insert for session creation
			vi.mocked(db.insert).mockReturnValue({
				values: vi.fn().mockReturnValue({
					returning: vi.fn().mockResolvedValue([mockSession]),
				}),
			} as unknown as ReturnType<typeof db.insert>);

			const result = await exchangeTokenForSessionInternal("rsvp-token");

			expect(result).toEqual({
				session: mockSession,
				group: mockGroup,
			});
		});

		it("should return null if RSVP token is invalid", async () => {
			const { db } = await import("@/db/index");

			vi.mocked(db.select).mockReturnValue({
				from: vi.fn().mockReturnValue({
					where: vi.fn().mockReturnValue({
						limit: vi.fn().mockResolvedValue([]),
					}),
				}),
			} as unknown as ReturnType<typeof db.select>);

			const result = await exchangeTokenForSessionInternal("invalid-token");

			expect(result).toBeNull();
		});
	});
});
