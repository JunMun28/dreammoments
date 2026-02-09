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
	isProduction: vi.fn(() => false),
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

vi.mock("@/lib/data", () => ({
	getAnalytics: vi.fn(() => ({
		totalViews: 100,
		uniqueVisitors: 50,
		viewsByDay: [
			{ date: "2024-01-01", views: 10 },
			{ date: "2024-01-02", views: 20 },
		],
	})),
	getDeviceBreakdown: vi.fn(() => ({
		mobile: 30,
		desktop: 50,
		tablet: 20,
	})),
	getInvitationById: vi.fn(() => null),
	listGuests: vi.fn(() => [
		{ id: "g-1", attendance: "attending" },
		{ id: "g-2", attendance: "not_attending" },
		{ id: "g-3", attendance: null },
	]),
}));

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { getAnalyticsFn } from "@/api/analytics";
import { getDbOrNull, isProduction } from "@/db/index";
import { getInvitationById as localGetInvitationById } from "@/lib/data";
import { requireAuth } from "@/lib/server-auth";

const mockedGetDbOrNull = vi.mocked(getDbOrNull);
const mockedIsProduction = vi.mocked(isProduction);
const mockedRequireAuth = vi.mocked(requireAuth);
const mockedLocalGetById = vi.mocked(localGetInvitationById);

beforeEach(() => {
	vi.clearAllMocks();
	mockedGetDbOrNull.mockReturnValue(null);
	mockedIsProduction.mockReturnValue(false);
	mockedRequireAuth.mockResolvedValue({ userId: "user-a" });
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("getAnalyticsFn", () => {
	test("returns aggregated data (fallback path)", async () => {
		const inv = { id: "inv-1", userId: "user-a" };
		mockedLocalGetById.mockReturnValue(
			inv as ReturnType<typeof localGetInvitationById>,
		);

		const result = (await (getAnalyticsFn as CallableFunction)({
			token: "valid-token",
			invitationId: "inv-1",
			period: "30d",
		})) as {
			totalViews: number;
			uniqueViews: number;
			rsvpSummary: {
				attending: number;
				notAttending: number;
				pending: number;
				total: number;
			};
			viewsByDay: Array<{ date: string; count: number }>;
			deviceBreakdown: { mobile: number; desktop: number; tablet: number };
			topReferrers: Array<{ referrer: string; count: number }>;
		};

		expect(result.totalViews).toBe(100);
		expect(result.uniqueViews).toBe(50);
		expect(result.rsvpSummary.attending).toBe(1);
		expect(result.rsvpSummary.notAttending).toBe(1);
		expect(result.rsvpSummary.pending).toBe(1);
		expect(result.rsvpSummary.total).toBe(3);
		expect(result.viewsByDay).toHaveLength(2);
		expect(result.deviceBreakdown.mobile).toBe(30);
		expect(result.deviceBreakdown.desktop).toBe(50);
		expect(result.topReferrers).toEqual([]);
	});

	test("denies access for wrong user (fallback)", async () => {
		const inv = { id: "inv-1", userId: "user-b" };
		mockedLocalGetById.mockReturnValue(
			inv as ReturnType<typeof localGetInvitationById>,
		);

		const result = (await (getAnalyticsFn as CallableFunction)({
			token: "valid-token",
			invitationId: "inv-1",
		})) as { error: string };

		expect(result.error).toBe("Access denied");
	});

	test("returns error for nonexistent invitation (fallback)", async () => {
		mockedLocalGetById.mockReturnValue(
			null as unknown as ReturnType<typeof localGetInvitationById>,
		);

		const result = (await (getAnalyticsFn as CallableFunction)({
			token: "valid-token",
			invitationId: "inv-nonexistent",
		})) as { error: string };

		expect(result.error).toContain("Invitation not found");
	});

	test("throws in production without DB", async () => {
		mockedIsProduction.mockReturnValue(true);

		await expect(
			(getAnalyticsFn as CallableFunction)({
				token: "valid-token",
				invitationId: "inv-1",
			}),
		).rejects.toThrow("Database required in production");
	});

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

	test("defaults period to 30d", async () => {
		const inv = { id: "inv-1", userId: "user-a" };
		mockedLocalGetById.mockReturnValue(
			inv as ReturnType<typeof localGetInvitationById>,
		);

		const result = (await (getAnalyticsFn as CallableFunction)({
			token: "valid-token",
			invitationId: "inv-1",
		})) as { totalViews: number };

		// Should not throw, and should return data
		expect(result.totalViews).toBeDefined();
	});
});
