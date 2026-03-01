import { beforeEach, describe, expect, test, vi } from "vitest";

/**
 * Cross-user authorization tests.
 *
 * These tests verify that user A cannot access user B's resources,
 * even with a valid authentication token. The key boundary is the
 * ownership check in each API handler.
 */

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
	chain.groupBy = vi.fn().mockReturnValue(chain);
	chain.limit = vi.fn().mockReturnValue(chain);
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
			content: "content",
		},
		guests: {
			id: "id",
			invitationId: "invitation_id",
			attendance: "attendance",
		},
		invitationViews: {
			id: "id",
			invitationId: "invitation_id",
			viewedAt: "viewed_at",
			visitorHash: "visitor_hash",
			deviceType: "device_type",
			referrer: "referrer",
		},
		users: { id: "id", email: "email", plan: "plan" },
		payments: { id: "id", userId: "user_id" },
	},
}));

// Default: user-a is authenticated
vi.mock("@/lib/server-auth", () => ({
	requireAuth: vi.fn(async () => ({ userId: "user-a" })),
}));

vi.mock("@/lib/rate-limit", () => ({
	authRateLimit: vi.fn(() => ({ allowed: true, remaining: 4, resetAt: 0 })),
	rsvpRateLimit: vi.fn(() => ({ allowed: true, remaining: 9, resetAt: 0 })),
	createDbRateLimiter: vi.fn(() =>
		vi.fn(async () => ({ allowed: true, remaining: 9, resetAt: 0 })),
	),
}));

vi.mock("@/lib/session", () => ({
	createSession: vi.fn(async () => "mock-token"),
	createRefreshToken: vi.fn(async () => "mock-refresh"),
	verifySession: vi.fn(async () => null),
	refreshSession: vi.fn(async () => null),
}));

vi.mock("@/lib/slug", () => ({
	generateSlug: vi.fn((base: string) => base.toLowerCase()),
	slugify: vi.fn((s: string) => s.toLowerCase()),
}));

vi.mock("@/lib/data", () => ({
	getInvitationById: vi.fn(() => null),
	listInvitationsByUser: vi.fn(() => []),
	createInvitation: vi.fn(),
	updateInvitation: vi.fn(),
	deleteInvitation: vi.fn(),
	publishInvitation: vi.fn(),
	unpublishInvitation: vi.fn(),
	listGuests: vi.fn(() => []),
	submitRsvp: vi.fn(),
	updateGuest: vi.fn(),
	importGuests: vi.fn(() => []),
	exportGuestsCsv: vi.fn(() => ""),
	getAnalytics: vi.fn(() => ({
		totalViews: 0,
		uniqueVisitors: 0,
		viewsByDay: [],
	})),
	getDeviceBreakdown: vi.fn(() => ({
		mobile: 0,
		desktop: 0,
		tablet: 0,
	})),
	updateUserPlan: vi.fn(),
	recordPayment: vi.fn(),
}));

vi.mock("@/lib/stripe", () => ({
	getStripeConfig: vi.fn(() => null),
	createCheckoutSession: vi.fn(),
	PRICING: {
		MYR: { amountCents: 4900, label: "RM49" },
		SGD: { amountCents: 1900, label: "$19" },
	},
	verifyWebhookSignature: vi.fn(async () => true),
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
			sections: [{ id: "hero", defaultVisible: true }],
		},
	],
}));

vi.mock("@/lib/email", () => ({
	sendPasswordResetEmail: vi.fn(async () => ({ success: true })),
}));

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { getAnalyticsFn } from "@/api/analytics";
import {
	exportGuestsCsvFn,
	importGuestsFn,
	listGuestsFn,
	updateGuestFn,
} from "@/api/guests";
import {
	deleteInvitationFn,
	getInvitation,
	publishInvitationFn,
	updateInvitationFn,
} from "@/api/invitations";
import { getDbOrNull } from "@/db/index";
import { getInvitationById as localGetInvitationById } from "@/lib/data";
import { requireAuth } from "@/lib/server-auth";

const mockedGetDbOrNull = vi.mocked(getDbOrNull);
const mockedRequireAuth = vi.mocked(requireAuth);
const mockedLocalGetById = vi.mocked(localGetInvitationById);

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const USER_A = "user-a";
const USER_B = "user-b";

/** An invitation owned by User B */
const USER_B_INVITATION = {
	id: "inv-b-1",
	userId: USER_B,
	title: "User B Wedding",
	slug: "user-b-wedding",
	status: "published",
	content: { hero: { partnerOneName: "X", partnerTwoName: "Y" } },
};

beforeEach(() => {
	vi.clearAllMocks();
	mockedGetDbOrNull.mockReturnValue(null);
	// User A is authenticated
	mockedRequireAuth.mockResolvedValue({ userId: USER_A });
});

// ---------------------------------------------------------------------------
// Cross-user authorization tests — localStorage fallback path
// ---------------------------------------------------------------------------

describe("cross-user authorization (fallback path)", () => {
	beforeEach(() => {
		mockedLocalGetById.mockReturnValue(
			USER_B_INVITATION as ReturnType<typeof localGetInvitationById>,
		);
	});

	test("User A cannot read User B's invitation", async () => {
		const result = (await (getInvitation as CallableFunction)({
			invitationId: "inv-b-1",
			token: "token-a",
		})) as { error: string };

		expect(result.error).toBe("Access denied");
	});

	test("User A cannot update User B's invitation", async () => {
		const result = (await (updateInvitationFn as CallableFunction)({
			invitationId: "inv-b-1",
			token: "token-a",
			title: "Hacked",
		})) as { error: string };

		expect(result.error).toBe("Access denied");
	});

	test("User A cannot delete User B's invitation", async () => {
		const result = (await (deleteInvitationFn as CallableFunction)({
			invitationId: "inv-b-1",
			token: "token-a",
		})) as { error: string };

		expect(result.error).toBe("Access denied");
	});

	test("User A cannot publish User B's invitation", async () => {
		const result = (await (publishInvitationFn as CallableFunction)({
			invitationId: "inv-b-1",
			token: "token-a",
		})) as { error: string };

		expect(result.error).toBe("Access denied");
	});

	test("User A cannot view User B's guest list", async () => {
		const result = (await (listGuestsFn as CallableFunction)({
			invitationId: "inv-b-1",
			token: "token-a",
		})) as { error: string };

		expect(result.error).toBe("Access denied");
	});

	test("User A cannot export User B's guests CSV", async () => {
		const result = (await (exportGuestsCsvFn as CallableFunction)({
			invitationId: "inv-b-1",
			token: "token-a",
		})) as { error: string };

		expect(result.error).toBe("Access denied");
	});

	test("User A cannot import guests to User B's invitation", async () => {
		const result = (await (importGuestsFn as CallableFunction)({
			invitationId: "inv-b-1",
			token: "token-a",
			guests: [{ name: "Injected Guest" }],
		})) as { error: string };

		expect(result.error).toBe("Access denied");
	});

	test("User A cannot update guests of User B's invitation", async () => {
		const result = (await (updateGuestFn as CallableFunction)({
			guestId: "guest-1",
			token: "token-a",
			invitationId: "inv-b-1",
			name: "Hacked",
		})) as { error: string };

		expect(result.error).toBe("Access denied");
	});

	test("User A cannot view User B's analytics", async () => {
		const result = (await (getAnalyticsFn as CallableFunction)({
			token: "token-a",
			invitationId: "inv-b-1",
		})) as { error: string };

		expect(result.error).toBe("Access denied");
	});
});

// ---------------------------------------------------------------------------
// Cross-user authorization tests — DB path
// ---------------------------------------------------------------------------

describe("cross-user authorization (DB path)", () => {
	beforeEach(() => {
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);
	});

	test("User A cannot read User B's invitation (DB)", async () => {
		// DB returns no rows when filtering by both invitation ID and user A's ID
		const selectChain = chainable([]);
		mockDb.select.mockReturnValue(selectChain);

		const result = (await (getInvitation as CallableFunction)({
			invitationId: "inv-b-1",
			token: "token-a",
		})) as { error: string };

		expect(result.error).toContain("not found or access denied");
	});

	test("User A cannot update User B's invitation (DB)", async () => {
		const existing = { userId: USER_B };
		const selectChain = chainable([existing]);
		mockDb.select.mockReturnValue(selectChain);

		const result = (await (updateInvitationFn as CallableFunction)({
			invitationId: "inv-b-1",
			token: "token-a",
			title: "Hacked",
		})) as { error: string };

		expect(result.error).toBe("Access denied");
	});

	test("User A cannot delete User B's invitation (DB)", async () => {
		const existing = { userId: USER_B };
		const selectChain = chainable([existing]);
		mockDb.select.mockReturnValue(selectChain);

		const result = (await (deleteInvitationFn as CallableFunction)({
			invitationId: "inv-b-1",
			token: "token-a",
		})) as { error: string };

		expect(result.error).toBe("Access denied");
	});

	test("User A cannot publish User B's invitation (DB)", async () => {
		const invitation = { ...USER_B_INVITATION };
		const selectChain = chainable([invitation]);
		mockDb.select.mockReturnValue(selectChain);

		const result = (await (publishInvitationFn as CallableFunction)({
			invitationId: "inv-b-1",
			token: "token-a",
		})) as { error: string };

		expect(result.error).toBe("Access denied");
	});

	test("User A cannot view User B's guest list (DB)", async () => {
		const invitation = { userId: USER_B };
		const selectChain = chainable([invitation]);
		mockDb.select.mockReturnValue(selectChain);

		const result = (await (listGuestsFn as CallableFunction)({
			invitationId: "inv-b-1",
			token: "token-a",
		})) as { error: string };

		expect(result.error).toBe("Access denied");
	});

	test("User A cannot export User B's guests (DB)", async () => {
		const invitation = { userId: USER_B };
		const selectChain = chainable([invitation]);
		mockDb.select.mockReturnValue(selectChain);

		const result = (await (exportGuestsCsvFn as CallableFunction)({
			invitationId: "inv-b-1",
			token: "token-a",
		})) as { error: string };

		expect(result.error).toBe("Access denied");
	});

	test("User A cannot import guests to User B's invitation (DB)", async () => {
		const invitation = { userId: USER_B };
		const selectChain = chainable([invitation]);
		mockDb.select.mockReturnValue(selectChain);

		const result = (await (importGuestsFn as CallableFunction)({
			invitationId: "inv-b-1",
			token: "token-a",
			guests: [{ name: "Injected" }],
		})) as { error: string };

		expect(result.error).toBe("Access denied");
	});

	test("User A cannot update User B's guests (DB)", async () => {
		const invitation = { userId: USER_B };
		const selectChain = chainable([invitation]);
		mockDb.select.mockReturnValue(selectChain);

		const result = (await (updateGuestFn as CallableFunction)({
			guestId: "guest-1",
			token: "token-a",
			invitationId: "inv-b-1",
			name: "Hacked",
		})) as { error: string };

		expect(result.error).toBe("Access denied");
	});

	test("User A cannot view User B's analytics (DB)", async () => {
		const invOwner = { userId: USER_B };
		const selectChain = chainable([invOwner]);
		mockDb.select.mockReturnValue(selectChain);

		const result = (await (getAnalyticsFn as CallableFunction)({
			token: "token-a",
			invitationId: "inv-b-1",
		})) as { error: string };

		expect(result.error).toBe("Access denied");
	});
});

// ---------------------------------------------------------------------------
// Authentication boundary tests
// ---------------------------------------------------------------------------

describe("authentication boundary", () => {
	test("empty token is rejected", async () => {
		// Endpoints with token in their Zod schema reject empty tokens at validation
		// or the handler rejects access when requireAuth detects the invalid token
		const invResult = await (getInvitation as CallableFunction)({
			invitationId: "inv-1",
			token: "",
		}).catch((err: Error) => ({ error: err.message }));
		expect((invResult as { error: string }).error).toBeTruthy();

		const analyticsResult = await (getAnalyticsFn as CallableFunction)({
			token: "",
			invitationId: "inv-1",
		}).catch((err: Error) => ({ error: err.message }));
		expect((analyticsResult as { error: string }).error).toBeTruthy();
	});

	test("invalid token is rejected by requireAuth", async () => {
		mockedRequireAuth.mockRejectedValue(
			new Error("Invalid or expired session"),
		);

		await expect(
			(getInvitation as CallableFunction)({
				invitationId: "inv-1",
				token: "invalid-jwt",
			}),
		).rejects.toThrow("Invalid or expired session");

		await expect(
			(updateInvitationFn as CallableFunction)({
				invitationId: "inv-1",
				token: "invalid-jwt",
				title: "X",
			}),
		).rejects.toThrow("Invalid or expired session");

		await expect(
			(deleteInvitationFn as CallableFunction)({
				invitationId: "inv-1",
				token: "invalid-jwt",
			}),
		).rejects.toThrow("Invalid or expired session");
	});
});
