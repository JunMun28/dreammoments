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
	schema: {
		users: { id: "id", email: "email", plan: "plan" },
		payments: { id: "id", userId: "user_id" },
	},
}));

vi.mock("@/lib/server-auth", () => ({
	requireAuth: vi.fn(async () => ({ userId: "user-a" })),
}));

vi.mock("@/lib/stripe", () => ({
	getStripeConfig: vi.fn(() => null),
	createCheckoutSession: vi.fn(async () => ({
		id: "cs_test_123",
		url: "https://checkout.stripe.com/pay/test",
	})),
	PRICING: {
		MYR: { amountCents: 4900, label: "RM49" },
		SGD: { amountCents: 1900, label: "$19" },
	},
	verifyWebhookSignature: vi.fn(async () => true),
}));

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { createCheckoutSessionFn, getPaymentStatusFn } from "@/api/payments";
import { getDbOrNull } from "@/db/index";
import { requireAuth } from "@/lib/server-auth";
import { createCheckoutSession, getStripeConfig } from "@/lib/stripe";

const mockedGetDbOrNull = vi.mocked(getDbOrNull);
const mockedRequireAuth = vi.mocked(requireAuth);
const mockedGetStripeConfig = vi.mocked(getStripeConfig);
const mockedCreateCheckout = vi.mocked(createCheckoutSession);

beforeEach(() => {
	vi.clearAllMocks();
	mockedGetDbOrNull.mockReturnValue(
		mockDb as unknown as ReturnType<typeof getDbOrNull>,
	);
	mockedRequireAuth.mockResolvedValue({ userId: "user-a" });
	mockedGetStripeConfig.mockReturnValue(null);
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("createCheckoutSessionFn", () => {
	test("mock checkout in dev with DB", async () => {
		const updateChain = chainable([]);
		const insertChain = chainable([]);
		mockDb.update.mockReturnValue(updateChain);
		mockDb.insert.mockReturnValue(insertChain);

		const result = (await (createCheckoutSessionFn as CallableFunction)({
			token: "valid-token",
			currency: "SGD",
		})) as { url: string };

		expect(result.url).toContain("mock=true");
	});

	test("returns mock checkout when Stripe not configured", async () => {
		const updateChain = chainable([]);
		const insertChain = chainable([]);
		mockDb.update.mockReturnValue(updateChain);
		mockDb.insert.mockReturnValue(insertChain);

		const result = (await (createCheckoutSessionFn as CallableFunction)({
			token: "valid-token",
			currency: "MYR",
		})) as { url: string };

		expect(result.url).toContain("mock=true");
	});

	test("creates real Stripe checkout session", async () => {
		mockedGetStripeConfig.mockReturnValue({
			secretKey: "sk_test_123",
			webhookSecret: "whsec_test",
		});

		const dbUser = { email: "user@example.com" };
		const selectChain = chainable([dbUser]);
		mockDb.select.mockReturnValue(selectChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = (await (createCheckoutSessionFn as CallableFunction)({
			token: "valid-token",
			currency: "MYR",
		})) as { url: string };

		expect(result.url).toBe("https://checkout.stripe.com/pay/test");
		expect(mockedCreateCheckout).toHaveBeenCalled();
	});

	test("returns error when user email not found", async () => {
		mockedGetStripeConfig.mockReturnValue({
			secretKey: "sk_test_123",
			webhookSecret: "whsec_test",
		});

		const selectChain = chainable([]);
		mockDb.select.mockReturnValue(selectChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = (await (createCheckoutSessionFn as CallableFunction)({
			token: "valid-token",
			currency: "MYR",
		})) as { error: string };

		expect(result.error).toContain("Could not determine user email");
	});

	test("handles Stripe API failure gracefully", async () => {
		mockedGetStripeConfig.mockReturnValue({
			secretKey: "sk_test_123",
			webhookSecret: "whsec_test",
		});

		const dbUser = { email: "user@example.com" };
		const selectChain = chainable([dbUser]);
		mockDb.select.mockReturnValue(selectChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		mockedCreateCheckout.mockRejectedValue(new Error("Stripe API error"));

		const result = (await (createCheckoutSessionFn as CallableFunction)({
			token: "valid-token",
			currency: "MYR",
		})) as { error: string };

		expect(result.error).toContain("Failed to initialize payment");
	});

	test("denies unauthenticated users", async () => {
		await expect(
			(createCheckoutSessionFn as CallableFunction)({
				token: "",
				currency: "MYR",
			}),
		).rejects.toThrow("Token is required");
	});
});

describe("getPaymentStatusFn", () => {
	test("returns plan status from DB", async () => {
		const user = { plan: "premium" };
		const selectChain = chainable([user]);
		mockDb.select.mockReturnValue(selectChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = (await (getPaymentStatusFn as CallableFunction)({
			token: "valid-token",
		})) as { plan: string; isPremium: boolean };

		expect(result.plan).toBe("premium");
		expect(result.isPremium).toBe(true);
	});

	test("returns free plan from DB when plan is null", async () => {
		const user = { plan: null };
		const selectChain = chainable([user]);
		mockDb.select.mockReturnValue(selectChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = (await (getPaymentStatusFn as CallableFunction)({
			token: "valid-token",
		})) as { plan: string; isPremium: boolean };

		expect(result.plan).toBe("free");
		expect(result.isPremium).toBe(false);
	});

	test("returns error when user not found in DB", async () => {
		const selectChain = chainable([]);
		mockDb.select.mockReturnValue(selectChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = (await (getPaymentStatusFn as CallableFunction)({
			token: "valid-token",
		})) as { error: string };

		expect(result.error).toContain("User not found");
	});

	test("denies unauthenticated users", async () => {
		await expect(
			(getPaymentStatusFn as CallableFunction)({ token: "" }),
		).rejects.toThrow("Token is required");
	});
});
