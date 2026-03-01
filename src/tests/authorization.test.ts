import { beforeEach, describe, expect, test, vi } from "vitest";

/**
 * Cross-user authorization tests.
 *
 * These tests verify that user A cannot access user B's resources,
 * even with a valid Clerk session. The key boundary is the
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
	requireAuth: vi.fn().mockResolvedValue({
		userId: "user-a",
		user: {
			id: "user-a",
			clerkId: "clerk_test_a",
			email: "usera@example.com",
			name: "User A",
			plan: "free",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		},
	}),
}));

vi.mock("@/lib/rate-limit", () => ({
	authRateLimit: vi.fn(() => ({ allowed: true, remaining: 4, resetAt: 0 })),
	rsvpRateLimit: vi.fn(() => ({ allowed: true, remaining: 9, resetAt: 0 })),
	createDbRateLimiter: vi.fn(() =>
		vi.fn(async () => ({ allowed: true, remaining: 9, resetAt: 0 })),
	),
}));

vi.mock("@/lib/slug", () => ({
	generateSlug: vi.fn((base: string) => base.toLowerCase()),
	slugify: vi.fn((s: string) => s.toLowerCase()),
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
import { requireAuth } from "@/lib/server-auth";

const mockedGetDbOrNull = vi.mocked(getDbOrNull);
const mockedRequireAuth = vi.mocked(requireAuth);

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
	mockedGetDbOrNull.mockReturnValue(
		mockDb as unknown as ReturnType<typeof getDbOrNull>,
	);
	// User A is authenticated
	mockedRequireAuth.mockResolvedValue({
		userId: USER_A,
		user: {
			id: USER_A,
			clerkId: "clerk_test_a",
			email: "usera@example.com",
			name: "User A",
			plan: "free",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		},
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
		})) as { error: string };

		expect(result.error).toContain("not found or access denied");
	});

	test("User A cannot update User B's invitation (DB)", async () => {
		const existing = { userId: USER_B };
		const selectChain = chainable([existing]);
		mockDb.select.mockReturnValue(selectChain);

		const result = (await (updateInvitationFn as CallableFunction)({
			invitationId: "inv-b-1",
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
		})) as { error: string };

		expect(result.error).toBe("Access denied");
	});

	test("User A cannot publish User B's invitation (DB)", async () => {
		const invitation = { ...USER_B_INVITATION };
		const selectChain = chainable([invitation]);
		mockDb.select.mockReturnValue(selectChain);

		const result = (await (publishInvitationFn as CallableFunction)({
			invitationId: "inv-b-1",
		})) as { error: string };

		expect(result.error).toBe("Access denied");
	});

	test("User A cannot view User B's guest list (DB)", async () => {
		const invitation = { userId: USER_B };
		const selectChain = chainable([invitation]);
		mockDb.select.mockReturnValue(selectChain);

		const result = (await (listGuestsFn as CallableFunction)({
			invitationId: "inv-b-1",
		})) as { error: string };

		expect(result.error).toBe("Access denied");
	});

	test("User A cannot export User B's guests (DB)", async () => {
		const invitation = { userId: USER_B };
		const selectChain = chainable([invitation]);
		mockDb.select.mockReturnValue(selectChain);

		const result = (await (exportGuestsCsvFn as CallableFunction)({
			invitationId: "inv-b-1",
		})) as { error: string };

		expect(result.error).toBe("Access denied");
	});

	test("User A cannot import guests to User B's invitation (DB)", async () => {
		const invitation = { userId: USER_B };
		const selectChain = chainable([invitation]);
		mockDb.select.mockReturnValue(selectChain);

		const result = (await (importGuestsFn as CallableFunction)({
			invitationId: "inv-b-1",
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
			invitationId: "inv-b-1",
		})) as { error: string };

		expect(result.error).toBe("Access denied");
	});
});

// ---------------------------------------------------------------------------
// Authentication boundary tests
// ---------------------------------------------------------------------------

describe("authentication boundary", () => {
	test("unauthenticated request is rejected by requireAuth", async () => {
		// With Clerk, requireAuth() throws when no valid session exists
		mockedRequireAuth.mockRejectedValue(
			new Error("Authentication required"),
		);

		await expect(
			(getInvitation as CallableFunction)({
				invitationId: "inv-1",
			}),
		).rejects.toThrow("Authentication required");

		await expect(
			(getAnalyticsFn as CallableFunction)({
				invitationId: "inv-1",
			}),
		).rejects.toThrow("Authentication required");
	});

	test("expired session is rejected by requireAuth", async () => {
		mockedRequireAuth.mockRejectedValue(
			new Error("Authentication required"),
		);

		await expect(
			(getInvitation as CallableFunction)({
				invitationId: "inv-1",
			}),
		).rejects.toThrow("Authentication required");

		await expect(
			(updateInvitationFn as CallableFunction)({
				invitationId: "inv-1",
				title: "X",
			}),
		).rejects.toThrow("Authentication required");

		await expect(
			(deleteInvitationFn as CallableFunction)({
				invitationId: "inv-1",
			}),
		).rejects.toThrow("Authentication required");
	});
});
