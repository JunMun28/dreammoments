import { beforeEach, describe, expect, test, vi } from "vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@tanstack/react-start", () => ({
	createServerFn: ({ method }: { method: string }) => {
		let validatorFn: ((data: unknown) => unknown) | undefined;
		let handlerFn: ((ctx: { data: unknown }) => unknown) | undefined;

		const builder = {
			inputValidator(fn: (data: unknown) => unknown) {
				validatorFn = fn;
				return builder;
			},
			handler(fn: (ctx: { data: unknown }) => unknown) {
				handlerFn = fn;
				const callable = async (input: unknown) => {
					const validated = validatorFn ? validatorFn(input) : input;
					return handlerFn?.({ data: validated });
				};
				callable._method = method;
				callable.inputValidator = builder.inputValidator;
				callable.handler = builder.handler;
				return callable;
			},
		};
		return builder;
	},
}));

const { mockRsvpLimiter } = vi.hoisted(() => ({
	mockRsvpLimiter: vi.fn(async () => ({
		allowed: true,
		remaining: 9,
		resetAt: 0,
	})),
}));

const mockDb = {
	select: vi.fn(),
	insert: vi.fn(),
	update: vi.fn(),
	delete: vi.fn(),
};

function chainable(result: unknown[] = []) {
	const chain: Record<string, unknown> = {};
	chain.from = vi.fn().mockReturnValue(chain);
	chain.where = vi.fn().mockReturnValue(chain);
	chain.set = vi.fn().mockReturnValue(chain);
	chain.values = vi.fn().mockReturnValue(chain);
	chain.returning = vi.fn().mockResolvedValue(result);
	chain.orderBy = vi.fn().mockReturnValue(chain);
	// biome-ignore lint/suspicious/noThenProperty: mock Drizzle thenable chain
	chain.then = vi
		.fn()
		.mockImplementation((resolve: (v: unknown) => void) => resolve(result));
	return chain;
}

vi.mock("@/db/index", () => ({
	getDbOrNull: vi.fn(() => null),
	schema: {
		invitations: {
			id: "id",
			userId: "user_id",
			status: "status",
			content: "content",
		},
		guests: {
			id: "id",
			invitationId: "invitation_id",
			attendance: "attendance",
		},
	},
}));

vi.mock("@/lib/server-auth", () => ({
	requireAuth: vi.fn(async () => ({ userId: "user-a" })),
}));

vi.mock("@/lib/rate-limit", () => ({
	createDbRateLimiter: vi.fn(() => mockRsvpLimiter),
}));

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import {
	bulkUpdateGuestsFn,
	deleteGuestFn,
	exportGuestsCsvFn,
	importGuestsFn,
	listGuestsFn,
	submitRsvpFn,
	updateGuestFn,
} from "@/api/guests";
import { getDbOrNull } from "@/db/index";
import { createDbRateLimiter } from "@/lib/rate-limit";
import { requireAuth } from "@/lib/server-auth";

const mockedGetDbOrNull = vi.mocked(getDbOrNull);
const mockedRequireAuth = vi.mocked(requireAuth);
const mockedCreateDbRateLimiter = vi.mocked(createDbRateLimiter);

beforeEach(() => {
	vi.clearAllMocks();
	mockedGetDbOrNull.mockReturnValue(
		mockDb as unknown as ReturnType<typeof getDbOrNull>,
	);
	mockedRequireAuth.mockResolvedValue({ userId: "user-a" });
	mockedCreateDbRateLimiter.mockReturnValue(mockRsvpLimiter);
	mockRsvpLimiter.mockResolvedValue({
		allowed: true,
		remaining: 9,
		resetAt: 0,
	});
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("submitRsvpFn", () => {
	test("rate limiting returns error", async () => {
		mockRsvpLimiter.mockResolvedValue({
			allowed: false,
			remaining: 0,
			resetAt: Date.now() + 60000,
		});

		const result = (await (submitRsvpFn as CallableFunction)({
			invitationId: "inv-1",
			name: "Guest",
			visitorKey: "visitor-123",
		})) as { error: string };

		expect(result.error).toContain("Too many submissions");
	});

	test("submits RSVP with DB path", async () => {
		const invitation = {
			id: "inv-1",
			status: "published",
			content: {
				rsvp: { allowPlusOnes: true, maxPlusOnes: 2 },
			},
		};
		const guest = {
			id: "guest-db-1",
			name: "DB Guest",
			attendance: "attending",
			invitationId: "inv-1",
		};

		const selectChain = chainable([invitation]);
		const insertChain = chainable([guest]);
		mockDb.select.mockReturnValue(selectChain);
		mockDb.insert.mockReturnValue(insertChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = await (submitRsvpFn as CallableFunction)({
			invitationId: "inv-1",
			name: "DB Guest",
			attendance: "attending",
			visitorKey: "visitor-123",
		});

		expect(result.name).toBe("DB Guest");
	});

	test("returns error when invitation not found (DB)", async () => {
		const selectChain = chainable([]);
		mockDb.select.mockReturnValue(selectChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = (await (submitRsvpFn as CallableFunction)({
			invitationId: "inv-nonexistent",
			name: "Guest",
			visitorKey: "visitor-123",
		})) as { error: string };

		expect(result.error).toContain("Invitation not found");
	});

	test("returns error when invitation not published (DB)", async () => {
		const invitation = {
			id: "inv-1",
			status: "draft",
			content: {},
		};
		const selectChain = chainable([invitation]);
		mockDb.select.mockReturnValue(selectChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = (await (submitRsvpFn as CallableFunction)({
			invitationId: "inv-1",
			name: "Guest",
			visitorKey: "visitor-123",
		})) as { error: string };

		expect(result.error).toContain("not published");
	});

	test("guest count exceeds limit (DB)", async () => {
		const invitation = {
			id: "inv-1",
			status: "published",
			content: {
				rsvp: { allowPlusOnes: true, maxPlusOnes: 1 },
			},
		};
		const selectChain = chainable([invitation]);
		mockDb.select.mockReturnValue(selectChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = (await (submitRsvpFn as CallableFunction)({
			invitationId: "inv-1",
			name: "Guest",
			guestCount: 5,
			visitorKey: "visitor-123",
		})) as { error: string };

		expect(result.error).toContain("Guest count exceeds limit");
	});
});

describe("listGuestsFn", () => {
	test("lists guests from DB", async () => {
		const invitation = { userId: "user-a" };
		const guests = [
			{ id: "g-1", name: "Alice", attendance: "attending" },
			{ id: "g-2", name: "Bob", attendance: null },
		];

		// First select: check invitation ownership
		const selectOwnerChain = chainable([invitation]);
		// Second select: list guests
		const selectGuestsChain = chainable(guests);

		mockDb.select
			.mockReturnValueOnce(selectOwnerChain)
			.mockReturnValueOnce(selectGuestsChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = await (listGuestsFn as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
		});

		expect(result).toEqual(guests);
	});

	test("denies access for wrong user (DB)", async () => {
		const invitation = { userId: "user-b" };
		const selectChain = chainable([invitation]);
		mockDb.select.mockReturnValue(selectChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = (await (listGuestsFn as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
		})) as { error: string };

		expect(result.error).toBe("Access denied");
	});
});

describe("updateGuestFn", () => {
	test("denies update for wrong user (DB)", async () => {
		const invitation = { userId: "user-b" };
		const selectChain = chainable([invitation]);
		mockDb.select.mockReturnValue(selectChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = (await (updateGuestFn as CallableFunction)({
			guestId: "g-1",
			token: "valid-token",
			invitationId: "inv-1",
			name: "Hacked",
		})) as { error: string };

		expect(result.error).toBe("Access denied");
	});

	test("updates guest successfully (DB)", async () => {
		const invitation = { userId: "user-a" };
		const updatedGuest = {
			id: "g-1",
			name: "Updated",
			attendance: "attending",
		};

		const selectChain = chainable([invitation]);
		const updateChain = chainable([updatedGuest]);
		mockDb.select.mockReturnValue(selectChain);
		mockDb.update.mockReturnValue(updateChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = await (updateGuestFn as CallableFunction)({
			guestId: "g-1",
			token: "valid-token",
			invitationId: "inv-1",
			name: "Updated",
		});

		expect(result.name).toBe("Updated");
	});
});

describe("deleteGuestFn", () => {
	test("deletes guest (DB path)", async () => {
		const invitation = { userId: "user-a" };
		const selectChain = chainable([invitation]);
		const deleteChain = chainable([]);
		mockDb.select.mockReturnValue(selectChain);
		mockDb.delete.mockReturnValue(deleteChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = (await (deleteGuestFn as CallableFunction)({
			guestId: "g-1",
			token: "valid-token",
			invitationId: "inv-1",
		})) as { success: boolean };

		expect(result.success).toBe(true);
	});
});

describe("bulkUpdateGuestsFn", () => {
	test("bulk updates guest attendance (DB)", async () => {
		const invitation = { userId: "user-a" };
		const selectChain = chainable([invitation]);
		const updateChain = chainable([{ id: "g-1" }]);
		mockDb.select.mockReturnValue(selectChain);
		mockDb.update.mockReturnValue(updateChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = (await (bulkUpdateGuestsFn as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
			updates: [{ guestId: "g-1", attendance: "attending" }],
		})) as { updated: number };

		expect(result.updated).toBe(1);
	});
});

describe("importGuestsFn", () => {
	test("imports guests (DB path)", async () => {
		const invitation = { userId: "user-a" };
		const imported = [
			{ id: "g-1", name: "Alice" },
			{ id: "g-2", name: "Bob" },
		];

		const selectChain = chainable([invitation]);
		const insertChain = chainable(imported);
		mockDb.select.mockReturnValue(selectChain);
		mockDb.insert.mockReturnValue(insertChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = await (importGuestsFn as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
			guests: [{ name: "Alice" }, { name: "Bob" }],
		});

		expect(result).toHaveLength(2);
	});
});

describe("exportGuestsCsvFn", () => {
	test("exports CSV from DB", async () => {
		const invitation = { userId: "user-a" };
		const guests = [
			{
				id: "g-1",
				name: "Alice",
				attendance: "attending",
				guestCount: 2,
				dietaryRequirements: "Vegetarian",
				message: "Can't wait!",
			},
		];

		const selectOwnerChain = chainable([invitation]);
		const selectGuestsChain = chainable(guests);
		mockDb.select
			.mockReturnValueOnce(selectOwnerChain)
			.mockReturnValueOnce(selectGuestsChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = (await (exportGuestsCsvFn as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
		})) as { csv: string };

		expect(result.csv).toContain("name");
		expect(result.csv).toContain("Alice");
		expect(result.csv).toContain("attending");
		expect(result.csv).toContain("Vegetarian");
	});

	test("CSV properly escapes quotes", async () => {
		const invitation = { userId: "user-a" };
		const guests = [
			{
				id: "g-1",
				name: 'Guest "Special"',
				attendance: "attending",
				guestCount: 1,
				dietaryRequirements: null,
				message: null,
			},
		];

		const selectOwnerChain = chainable([invitation]);
		const selectGuestsChain = chainable(guests);
		mockDb.select
			.mockReturnValueOnce(selectOwnerChain)
			.mockReturnValueOnce(selectGuestsChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = (await (exportGuestsCsvFn as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
		})) as { csv: string };

		// Double quotes should be escaped as ""
		expect(result.csv).toContain('""Special""');
	});
});
