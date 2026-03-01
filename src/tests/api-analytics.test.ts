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
	schema: {
		invitations: { id: "id", userId: "user_id" },
		invitationViews: {
			id: "id",
			invitationId: "invitation_id",
			viewedAt: "viewed_at",
			visitorHash: "visitor_hash",
			deviceType: "device_type",
			referrer: "referrer",
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

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { getAnalyticsFn } from "@/api/analytics";
import { getDbOrNull } from "@/db/index";
import { requireAuth } from "@/lib/server-auth";

const mockedGetDbOrNull = vi.mocked(getDbOrNull);
const mockedRequireAuth = vi.mocked(requireAuth);

beforeEach(() => {
	vi.clearAllMocks();
	mockedGetDbOrNull.mockReturnValue(
		mockDb as unknown as ReturnType<typeof getDbOrNull>,
	);
	mockedRequireAuth.mockResolvedValue({ userId: "user-a" });
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("getAnalyticsFn", () => {
	test("returns analytics from DB", async () => {
		// Ownership check
		const invOwner = { userId: "user-a" };
		const selectOwnerChain = chainable([invOwner]);

		// Total views
		const totalViewsChain = chainable([{ value: 200 }]);
		// Unique views
		const uniqueViewsChain = chainable([{ value: 80 }]);
		// Views by day
		const viewsByDayChain = chainable([{ date: "2024-01-01", count: 50 }]);
		// Device breakdown
		const deviceChain = chainable([
			{ deviceType: "mobile", count: 60 },
			{ deviceType: "desktop", count: 120 },
		]);
		// Top referrers
		const referrerChain = chainable([{ referrer: "instagram.com", count: 30 }]);
		// RSVP summary
		const rsvpChain = chainable([
			{ attendance: "attending", count: 10 },
			{ attendance: "not_attending", count: 3 },
		]);

		mockDb.select
			.mockReturnValueOnce(selectOwnerChain)
			.mockReturnValueOnce(totalViewsChain)
			.mockReturnValueOnce(uniqueViewsChain)
			.mockReturnValueOnce(viewsByDayChain)
			.mockReturnValueOnce(deviceChain)
			.mockReturnValueOnce(referrerChain)
			.mockReturnValueOnce(rsvpChain);

		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = (await (getAnalyticsFn as CallableFunction)({
			token: "valid-token",
			invitationId: "inv-1",
			period: "7d",
		})) as {
			totalViews: number;
			uniqueViews: number;
			rsvpSummary: { attending: number; notAttending: number; total: number };
			deviceBreakdown: { mobile: number; desktop: number };
			topReferrers: Array<{ referrer: string; count: number }>;
		};

		expect(result.totalViews).toBe(200);
		expect(result.uniqueViews).toBe(80);
		expect(result.rsvpSummary.attending).toBe(10);
		expect(result.rsvpSummary.notAttending).toBe(3);
		expect(result.rsvpSummary.total).toBe(13);
		expect(result.deviceBreakdown.mobile).toBe(60);
		expect(result.deviceBreakdown.desktop).toBe(120);
		expect(result.topReferrers).toHaveLength(1);
		expect(result.topReferrers[0].referrer).toBe("instagram.com");
	});

	test("denies access for wrong user (DB path)", async () => {
		const invOwner = { userId: "user-b" };
		const selectChain = chainable([invOwner]);
		mockDb.select.mockReturnValue(selectChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = (await (getAnalyticsFn as CallableFunction)({
			token: "valid-token",
			invitationId: "inv-1",
		})) as { error: string };

		expect(result.error).toBe("Access denied");
	});

	test("invitation not found (DB path)", async () => {
		const selectChain = chainable([]);
		mockDb.select.mockReturnValue(selectChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = (await (getAnalyticsFn as CallableFunction)({
			token: "valid-token",
			invitationId: "inv-nonexistent",
		})) as { error: string };

		expect(result.error).toContain("Invitation not found");
	});
});
