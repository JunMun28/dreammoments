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
			slug: "slug",
			status: "status",
			updatedAt: "updated_at",
		},
	},
}));

vi.mock("@/lib/server-auth", () => ({
	requireAuth: vi.fn(async () => ({ userId: "user-a" })),
}));

vi.mock("@/lib/data", () => ({
	createInvitationSnapshot: vi.fn(),
	createInvitation: vi.fn(() => ({
		id: "local-inv-1",
		userId: "user-a",
		templateId: "double-happiness",
		title: "Sample",
		status: "draft",
	})),
	deleteInvitation: vi.fn(),
	getInvitationById: vi.fn(() => null),
	listInvitationsByUser: vi.fn(() => []),
	publishInvitation: vi.fn(() => ({
		id: "local-inv-1",
		status: "published",
		slug: "alice-bob",
	})),
	unpublishInvitation: vi.fn(() => ({
		id: "local-inv-1",
		status: "draft",
	})),
	updateInvitation: vi.fn(() => ({
		id: "local-inv-1",
		title: "Updated",
	})),
}));

vi.mock("@/lib/slug", () => ({
	generateSlug: vi.fn((base: string) => base.toLowerCase()),
	slugify: vi.fn((s: string) => s.toLowerCase().replace(/\s+/g, "-")),
}));

vi.mock("@/data/sample-invitation", () => ({
	buildSampleContent: vi.fn(() => ({
		hero: { partnerOneName: "Alice", partnerTwoName: "Bob" },
	})),
}));

vi.mock("@/templates/index", () => ({
	templates: [
		{
			id: "double-happiness",
			version: "1.0",
			sections: [
				{ id: "hero", defaultVisible: true },
				{ id: "details", defaultVisible: true },
			],
		},
	],
}));

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import {
	checkSlugAvailabilityFn,
	createInvitationFn,
	deleteInvitationFn,
	getInvitation,
	getInvitations,
	patchInvitationContentFn,
	publishInvitationFn,
	updateInvitationFn,
} from "@/api/invitations";
import { getDbOrNull } from "@/db/index";
import {
	getInvitationById as localGetInvitationById,
	listInvitationsByUser as localListInvitationsByUser,
} from "@/lib/data";
import { requireAuth } from "@/lib/server-auth";

const mockedGetDbOrNull = vi.mocked(getDbOrNull);
const mockedRequireAuth = vi.mocked(requireAuth);
const mockedLocalGetById = vi.mocked(localGetInvitationById);
const mockedLocalListByUser = vi.mocked(localListInvitationsByUser);

beforeEach(() => {
	vi.clearAllMocks();
	mockedGetDbOrNull.mockReturnValue(null);
	mockedRequireAuth.mockResolvedValue({ userId: "user-a" });
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("getInvitations", () => {
	test("returns user invitations from localStorage fallback", async () => {
		mockedLocalListByUser.mockReturnValue([]);

		const result = await (getInvitations as CallableFunction)({
			token: "valid-token",
		});

		expect(result).toEqual([]);
		expect(mockedRequireAuth).toHaveBeenCalledWith("valid-token");
	});

	test("returns invitations from DB", async () => {
		const now = new Date();
		const dbInvitations = [
			{
				id: "inv-1",
				userId: "user-a",
				title: "Wedding 1",
				status: "draft",
				createdAt: now,
				updatedAt: now,
			},
		];

		const selectChain = chainable(dbInvitations);
		mockDb.select.mockReturnValue(selectChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = await (getInvitations as CallableFunction)({
			token: "valid-token",
		});

		expect(result).toEqual(dbInvitations);
	});
});

describe("getInvitation", () => {
	test("returns invitation when user owns it (fallback)", async () => {
		const inv = {
			id: "inv-1",
			userId: "user-a",
			title: "My Wedding",
		};
		mockedLocalGetById.mockReturnValue(
			inv as unknown as ReturnType<typeof localGetInvitationById>,
		);

		const result = await (getInvitation as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
		});

		expect(result).toEqual(inv);
	});

	test("denies access when user does not own invitation (fallback)", async () => {
		const inv = {
			id: "inv-1",
			userId: "user-b",
			title: "Not My Wedding",
		};
		mockedLocalGetById.mockReturnValue(
			inv as unknown as ReturnType<typeof localGetInvitationById>,
		);

		const result = (await (getInvitation as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
		})) as { error: string };

		expect(result.error).toBe("Access denied");
	});

	test("returns error when invitation not found (fallback)", async () => {
		mockedLocalGetById.mockReturnValue(
			null as unknown as ReturnType<typeof localGetInvitationById>,
		);

		const result = (await (getInvitation as CallableFunction)({
			invitationId: "nonexistent",
			token: "valid-token",
		})) as { error: string };

		expect(result.error).toContain("not found");
	});

	test("returns invitation from DB when user owns it", async () => {
		const dbInv = {
			id: "inv-1",
			userId: "user-a",
			title: "DB Wedding",
		};
		const selectChain = chainable([dbInv]);
		mockDb.select.mockReturnValue(selectChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = await (getInvitation as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
		});

		expect(result).toEqual(dbInv);
	});

	test("denies access when not found in DB", async () => {
		const selectChain = chainable([]);
		mockDb.select.mockReturnValue(selectChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = (await (getInvitation as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
		})) as { error: string };

		expect(result.error).toContain("not found or access denied");
	});
});

describe("createInvitationFn", () => {
	test("creates invitation (fallback path)", async () => {
		const result = await (createInvitationFn as CallableFunction)({
			token: "valid-token",
			templateId: "double-happiness",
		});

		expect(result).toBeDefined();
		expect(result.id).toBe("local-inv-1");
	});

	test("creates invitation with DB", async () => {
		const created = {
			id: "db-inv-1",
			userId: "user-a",
			templateId: "double-happiness",
			title: "Alice & Bob",
			slug: "alice-bob",
			status: "draft",
		};

		const selectChain = chainable([]);
		const insertChain = chainable([created]);
		mockDb.select.mockReturnValue(selectChain);
		mockDb.insert.mockReturnValue(insertChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = await (createInvitationFn as CallableFunction)({
			token: "valid-token",
			templateId: "double-happiness",
		});

		expect(result.id).toBe("db-inv-1");
		expect(result.title).toBe("Alice & Bob");
	});
});

describe("updateInvitationFn", () => {
	test("updates invitation (fallback path)", async () => {
		const inv = {
			id: "inv-1",
			userId: "user-a",
			title: "Old Title",
		};
		mockedLocalGetById.mockReturnValue(
			inv as unknown as ReturnType<typeof localGetInvitationById>,
		);

		const result = await (updateInvitationFn as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
			title: "New Title",
		});

		expect(result).toBeDefined();
	});

	test("denies update for wrong user (fallback)", async () => {
		const inv = {
			id: "inv-1",
			userId: "user-b",
			title: "Not Mine",
		};
		mockedLocalGetById.mockReturnValue(
			inv as unknown as ReturnType<typeof localGetInvitationById>,
		);

		const result = (await (updateInvitationFn as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
			title: "Hacked",
		})) as { error: string };

		expect(result.error).toBe("Access denied");
	});

	test("denies update for wrong user (DB path)", async () => {
		const existing = { userId: "user-b" };
		const selectChain = chainable([existing]);
		mockDb.select.mockReturnValue(selectChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = (await (updateInvitationFn as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
			title: "Hacked",
		})) as { error: string };

		expect(result.error).toBe("Access denied");
	});

	test("returns not found for nonexistent invitation (DB path)", async () => {
		const selectChain = chainable([]);
		mockDb.select.mockReturnValue(selectChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = (await (updateInvitationFn as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
			title: "X",
		})) as { error: string };

		expect(result.error).toBe("Invitation not found");
	});

	test("updates invitation successfully (DB path)", async () => {
		const existing = { userId: "user-a" };
		const updated = { id: "inv-1", title: "New Title" };

		const selectChain = chainable([existing]);
		const updateChain = chainable([updated]);
		mockDb.select.mockReturnValue(selectChain);
		mockDb.update.mockReturnValue(updateChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = await (updateInvitationFn as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
			title: "New Title",
		});

		expect(result.title).toBe("New Title");
	});
});

describe("deleteInvitationFn", () => {
	test("deletes invitation (fallback path)", async () => {
		const inv = {
			id: "inv-1",
			userId: "user-a",
		};
		mockedLocalGetById.mockReturnValue(
			inv as unknown as ReturnType<typeof localGetInvitationById>,
		);

		const result = (await (deleteInvitationFn as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
		})) as { success: boolean };

		expect(result.success).toBe(true);
	});

	test("denies delete for wrong user (fallback)", async () => {
		const inv = {
			id: "inv-1",
			userId: "user-b",
		};
		mockedLocalGetById.mockReturnValue(
			inv as unknown as ReturnType<typeof localGetInvitationById>,
		);

		const result = (await (deleteInvitationFn as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
		})) as { error: string };

		expect(result.error).toBe("Access denied");
	});

	test("denies delete for wrong user (DB path)", async () => {
		const existing = { userId: "user-b" };
		const selectChain = chainable([existing]);
		mockDb.select.mockReturnValue(selectChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = (await (deleteInvitationFn as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
		})) as { error: string };

		expect(result.error).toBe("Access denied");
	});

	test("deletes invitation (DB path)", async () => {
		const existing = { userId: "user-a" };
		const selectChain = chainable([existing]);
		const deleteChain = chainable([]);
		mockDb.select.mockReturnValue(selectChain);
		mockDb.delete.mockReturnValue(deleteChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = (await (deleteInvitationFn as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
		})) as { success: boolean };

		expect(result.success).toBe(true);
	});
});

describe("publishInvitationFn", () => {
	test("publishes invitation (fallback path)", async () => {
		const inv = {
			id: "inv-1",
			userId: "user-a",
			content: { hero: { partnerOneName: "Alice", partnerTwoName: "Bob" } },
		};
		mockedLocalGetById.mockReturnValue(
			inv as unknown as ReturnType<typeof localGetInvitationById>,
		);

		const result = await (publishInvitationFn as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
		});

		expect(result).toBeDefined();
		expect(result.status).toBe("published");
	});

	test("denies publish for wrong user (fallback)", async () => {
		const inv = {
			id: "inv-1",
			userId: "user-b",
		};
		mockedLocalGetById.mockReturnValue(
			inv as unknown as ReturnType<typeof localGetInvitationById>,
		);

		const result = (await (publishInvitationFn as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
		})) as { error: string };

		expect(result.error).toBe("Access denied");
	});
});

describe("checkSlugAvailabilityFn", () => {
	test("returns available when no DB", async () => {
		const result = (await (checkSlugAvailabilityFn as CallableFunction)({
			token: "valid-token",
			slug: "alice-bob",
		})) as { available: boolean };

		expect(result.available).toBe(true);
	});

	test("returns available when slug not taken (DB)", async () => {
		const selectChain = chainable([]);
		mockDb.select.mockReturnValue(selectChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = (await (checkSlugAvailabilityFn as CallableFunction)({
			token: "valid-token",
			slug: "new-slug",
		})) as { available: boolean };

		expect(result.available).toBe(true);
	});

	test("returns not available when slug taken (DB)", async () => {
		const selectChain = chainable([{ id: "other-inv" }]);
		mockDb.select.mockReturnValue(selectChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = (await (checkSlugAvailabilityFn as CallableFunction)({
			token: "valid-token",
			slug: "taken-slug",
		})) as { available: boolean };

		expect(result.available).toBe(false);
	});

	test("returns available when slug belongs to same invitation (DB)", async () => {
		const selectChain = chainable([{ id: "inv-1" }]);
		mockDb.select.mockReturnValue(selectChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = (await (checkSlugAvailabilityFn as CallableFunction)({
			token: "valid-token",
			slug: "my-slug",
			invitationId: "inv-1",
		})) as { available: boolean };

		expect(result.available).toBe(true);
	});
});

describe("patchInvitationContentFn", () => {
	test("patches specific content field (fallback path)", async () => {
		const inv = {
			id: "inv-1",
			userId: "user-a",
			content: {
				hero: {
					partnerOneName: "Alice",
					partnerTwoName: "Bob",
					tagline: "old",
					date: "2026-06-01",
				},
				schedule: { events: [] },
			},
		};
		mockedLocalGetById.mockReturnValue(
			inv as unknown as ReturnType<typeof localGetInvitationById>,
		);

		const result = await (patchInvitationContentFn as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
			path: "hero.tagline",
			value: "Forever Yours",
		});

		expect(result.error).toBeUndefined();
	});

	test("denies patch for wrong user (fallback)", async () => {
		const inv = { id: "inv-1", userId: "user-b", content: {} };
		mockedLocalGetById.mockReturnValue(
			inv as unknown as ReturnType<typeof localGetInvitationById>,
		);

		const result = (await (patchInvitationContentFn as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
			path: "hero.tagline",
			value: "Hacked",
		})) as { error: string };

		expect(result.error).toBe("Access denied");
	});

	test("rejects unsafe patch path", async () => {
		const inv = {
			id: "inv-1",
			userId: "user-a",
			content: {},
		};
		mockedLocalGetById.mockReturnValue(
			inv as unknown as ReturnType<typeof localGetInvitationById>,
		);

		await expect(
			(patchInvitationContentFn as CallableFunction)({
				invitationId: "inv-1",
				token: "valid-token",
				path: "__proto__.polluted",
				value: "x",
			}),
		).rejects.toThrow("Invalid path");
	});
});
