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
	isProduction: vi.fn(() => false),
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

vi.mock("@/lib/data", () => ({
	submitRsvp: vi.fn(() => ({
		id: "guest-1",
		name: "Guest One",
		attendance: "attending",
	})),
	deleteGuest: vi.fn(),
	deleteGuestInInvitation: vi.fn(() => true),
	listGuests: vi.fn(() => []),
	updateGuest: vi.fn(),
	updateGuestInInvitation: vi.fn(() => ({
		id: "g-1",
		name: "Updated Name",
	})),
	importGuests: vi.fn(() => [
		{ id: "g-1", name: "Imported One" },
		{ id: "g-2", name: "Imported Two" },
	]),
	exportGuestsCsv: vi.fn(
		() => '"name","attendance","guest_count","dietary","message"',
	),
	getInvitationById: vi.fn(() => null),
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
import {
	deleteGuestInInvitation as localDeleteGuestInInvitation,
	getInvitationById as localGetInvitationById,
	listGuests as localListGuests,
	updateGuestInInvitation as localUpdateGuestInInvitation,
} from "@/lib/data";
import { createDbRateLimiter } from "@/lib/rate-limit";
import { requireAuth } from "@/lib/server-auth";

const mockedGetDbOrNull = vi.mocked(getDbOrNull);
const mockedRequireAuth = vi.mocked(requireAuth);
const mockedCreateDbRateLimiter = vi.mocked(createDbRateLimiter);
const mockedLocalGetById = vi.mocked(localGetInvitationById);
const mockedLocalListGuests = vi.mocked(localListGuests);
const mockedLocalDeleteGuestInInvitation = vi.mocked(
	localDeleteGuestInInvitation,
);
const mockedLocalUpdateGuestInInvitation = vi.mocked(
	localUpdateGuestInInvitation,
);

beforeEach(() => {
	vi.clearAllMocks();
	mockedGetDbOrNull.mockReturnValue(null);
	mockedRequireAuth.mockResolvedValue({ userId: "user-a" });
	mockedCreateDbRateLimiter.mockReturnValue(mockRsvpLimiter);
	mockedLocalDeleteGuestInInvitation.mockReturnValue(true);
	mockedLocalUpdateGuestInInvitation.mockReturnValue({
		id: "g-1",
		name: "Updated Name",
	} as ReturnType<typeof localUpdateGuestInInvitation>);
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
	test("submits RSVP (fallback path)", async () => {
		const result = await (submitRsvpFn as CallableFunction)({
			invitationId: "inv-1",
			name: "Guest One",
			attendance: "attending",
			visitorKey: "visitor-123",
		});

		expect(result).toBeDefined();
		expect(result.name).toBe("Guest One");
	});

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
	test("lists guests (fallback path)", async () => {
		const inv = { id: "inv-1", userId: "user-a" };
		mockedLocalGetById.mockReturnValue(
			inv as ReturnType<typeof localGetInvitationById>,
		);
		mockedLocalListGuests.mockReturnValue([]);

		const result = await (listGuestsFn as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
		});

		expect(result).toEqual([]);
	});

	test("denies access for wrong user (fallback)", async () => {
		const inv = { id: "inv-1", userId: "user-b" };
		mockedLocalGetById.mockReturnValue(
			inv as ReturnType<typeof localGetInvitationById>,
		);

		const result = (await (listGuestsFn as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
		})) as { error: string };

		expect(result.error).toBe("Access denied");
	});

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

	test("with attendance filter (fallback)", async () => {
		const inv = { id: "inv-1", userId: "user-a" };
		mockedLocalGetById.mockReturnValue(
			inv as ReturnType<typeof localGetInvitationById>,
		);
		mockedLocalListGuests.mockReturnValue([]);

		const result = await (listGuestsFn as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
			filter: "attending",
		});

		expect(result).toEqual([]);
		expect(mockedLocalListGuests).toHaveBeenCalledWith("inv-1", "attending");
	});

	test("filters by search term (fallback)", async () => {
		const inv = { id: "inv-1", userId: "user-a" };
		mockedLocalGetById.mockReturnValue(
			inv as ReturnType<typeof localGetInvitationById>,
		);
		mockedLocalListGuests.mockReturnValue([
			{
				id: "g-1",
				name: "Alice Wong",
				email: "alice@example.com",
				relationship: "friend",
			},
			{
				id: "g-2",
				name: "Bob Tan",
				email: "bob@example.com",
				relationship: "family",
			},
		] as ReturnType<typeof localListGuests>);

		const result = await (listGuestsFn as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
			search: "alice",
		});

		expect(result).toHaveLength(1);
		expect(result[0]?.name).toBe("Alice Wong");
	});

	test("filters by relationship (fallback)", async () => {
		const inv = { id: "inv-1", userId: "user-a" };
		mockedLocalGetById.mockReturnValue(
			inv as ReturnType<typeof localGetInvitationById>,
		);
		mockedLocalListGuests.mockReturnValue([
			{ id: "g-1", name: "Alice", relationship: "friend" },
			{ id: "g-2", name: "Bob", relationship: "family" },
		] as ReturnType<typeof localListGuests>);

		const result = await (listGuestsFn as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
			relationship: "family",
		});

		expect(result).toHaveLength(1);
		expect(result[0]?.name).toBe("Bob");
	});
});

describe("updateGuestFn", () => {
	test("updates guest (fallback path)", async () => {
		const inv = { id: "inv-1", userId: "user-a" };
		mockedLocalGetById.mockReturnValue(
			inv as ReturnType<typeof localGetInvitationById>,
		);

		const result = (await (updateGuestFn as CallableFunction)({
			guestId: "g-1",
			token: "valid-token",
			invitationId: "inv-1",
			name: "Updated Name",
		})) as { id: string; name: string };

		expect(result.id).toBe("g-1");
		expect(result.name).toBe("Updated Name");
	});

	test("returns guest not found when guest is outside invitation (fallback)", async () => {
		const inv = { id: "inv-1", userId: "user-a" };
		mockedLocalGetById.mockReturnValue(
			inv as ReturnType<typeof localGetInvitationById>,
		);
		mockedLocalUpdateGuestInInvitation.mockReturnValue(undefined);

		const result = (await (updateGuestFn as CallableFunction)({
			guestId: "g-other",
			token: "valid-token",
			invitationId: "inv-1",
			name: "Updated Name",
		})) as { error: string };

		expect(result.error).toBe("Guest not found");
	});

	test("denies update for wrong user (fallback)", async () => {
		const inv = { id: "inv-1", userId: "user-b" };
		mockedLocalGetById.mockReturnValue(
			inv as ReturnType<typeof localGetInvitationById>,
		);

		const result = (await (updateGuestFn as CallableFunction)({
			guestId: "g-1",
			token: "valid-token",
			invitationId: "inv-1",
			name: "Hacked",
		})) as { error: string };

		expect(result.error).toBe("Access denied");
	});

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
	test("deletes guest (fallback path)", async () => {
		const inv = { id: "inv-1", userId: "user-a" };
		mockedLocalGetById.mockReturnValue(
			inv as ReturnType<typeof localGetInvitationById>,
		);

		const result = (await (deleteGuestFn as CallableFunction)({
			guestId: "g-1",
			token: "valid-token",
			invitationId: "inv-1",
		})) as { success: boolean };

		expect(result.success).toBe(true);
	});

	test("returns guest not found for non-member guest (fallback)", async () => {
		const inv = { id: "inv-1", userId: "user-a" };
		mockedLocalGetById.mockReturnValue(
			inv as ReturnType<typeof localGetInvitationById>,
		);
		mockedLocalDeleteGuestInInvitation.mockReturnValue(false);

		const result = (await (deleteGuestFn as CallableFunction)({
			guestId: "g-other",
			token: "valid-token",
			invitationId: "inv-1",
		})) as { error: string };

		expect(result.error).toBe("Guest not found");
	});

	test("denies delete for wrong user (fallback)", async () => {
		const inv = { id: "inv-1", userId: "user-b" };
		mockedLocalGetById.mockReturnValue(
			inv as ReturnType<typeof localGetInvitationById>,
		);

		const result = (await (deleteGuestFn as CallableFunction)({
			guestId: "g-1",
			token: "valid-token",
			invitationId: "inv-1",
		})) as { error: string };

		expect(result.error).toBe("Access denied");
	});

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
	test("bulk updates guest attendance (fallback)", async () => {
		const inv = { id: "inv-1", userId: "user-a" };
		mockedLocalGetById.mockReturnValue(
			inv as ReturnType<typeof localGetInvitationById>,
		);

		const result = (await (bulkUpdateGuestsFn as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
			updates: [
				{ guestId: "g-1", attendance: "attending" },
				{ guestId: "g-2", attendance: "not_attending" },
			],
		})) as { updated: number };

		expect(result.updated).toBe(2);
	});

	test("only counts guests in invitation (fallback)", async () => {
		const inv = { id: "inv-1", userId: "user-a" };
		mockedLocalGetById.mockReturnValue(
			inv as ReturnType<typeof localGetInvitationById>,
		);
		mockedLocalUpdateGuestInInvitation
			.mockReturnValueOnce({
				id: "g-1",
				name: "Updated Name",
			} as ReturnType<typeof localUpdateGuestInInvitation>)
			.mockReturnValueOnce(undefined);

		const result = (await (bulkUpdateGuestsFn as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
			updates: [
				{ guestId: "g-1", attendance: "attending" },
				{ guestId: "g-other", attendance: "not_attending" },
			],
		})) as { updated: number };

		expect(result.updated).toBe(1);
	});

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
	test("imports guests (fallback path)", async () => {
		const inv = { id: "inv-1", userId: "user-a" };
		mockedLocalGetById.mockReturnValue(
			inv as ReturnType<typeof localGetInvitationById>,
		);

		const result = await (importGuestsFn as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
			guests: [
				{ name: "Import One", email: "one@example.com" },
				{ name: "Import Two" },
			],
		});

		expect(result).toHaveLength(2);
	});

	test("denies import for wrong user (fallback)", async () => {
		const inv = { id: "inv-1", userId: "user-b" };
		mockedLocalGetById.mockReturnValue(
			inv as ReturnType<typeof localGetInvitationById>,
		);

		const result = (await (importGuestsFn as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
			guests: [{ name: "Hacked" }],
		})) as { error: string };

		expect(result.error).toBe("Access denied");
	});

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
	test("exports CSV (fallback path)", async () => {
		const inv = { id: "inv-1", userId: "user-a" };
		mockedLocalGetById.mockReturnValue(
			inv as ReturnType<typeof localGetInvitationById>,
		);

		const result = (await (exportGuestsCsvFn as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
		})) as { csv: string };

		expect(result.csv).toContain("name");
	});

	test("denies export for wrong user (fallback)", async () => {
		const inv = { id: "inv-1", userId: "user-b" };
		mockedLocalGetById.mockReturnValue(
			inv as ReturnType<typeof localGetInvitationById>,
		);

		const result = (await (exportGuestsCsvFn as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
		})) as { error: string };

		expect(result.error).toBe("Access denied");
	});

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
