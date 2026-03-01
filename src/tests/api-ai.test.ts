import { beforeEach, describe, expect, test, vi } from "vitest";

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
	update: vi.fn(),
};

function chainable(result: unknown[] = []) {
	const chain: Record<string, unknown> = {};
	chain.from = vi.fn().mockReturnValue(chain);
	chain.where = vi.fn().mockReturnValue(chain);
	chain.orderBy = vi.fn().mockReturnValue(chain);
	chain.set = vi.fn().mockReturnValue(chain);
	chain.returning = vi.fn().mockResolvedValue(result);
	// biome-ignore lint/suspicious/noThenProperty: mock Drizzle thenable chain
	chain.then = vi
		.fn()
		.mockImplementation((resolve: (v: unknown) => void) => resolve(result));
	return chain;
}

vi.mock("@/db/index", () => ({
	getDbOrNull: vi.fn(() => null),
	schema: {
		invitations: { id: "id", userId: "user_id", content: "content" },
		aiGenerations: {
			id: "id",
			invitationId: "invitation_id",
			createdAt: "created_at",
			accepted: "accepted",
		},
	},
}));

vi.mock("@/lib/server-auth", () => ({
	requireAuth: vi.fn(async () => ({ userId: "user-a" })),
}));

import {
	generateAiContentBatchFn,
	generateAiContentFn,
	listAiGenerationsFn,
} from "@/api/ai";
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

describe("listAiGenerationsFn", () => {
	test("lists AI generations (DB path)", async () => {
		const invitation = { userId: "user-a" };
		const generations = [{ id: "gen-1", invitationId: "inv-1" }];
		const selectOwnerChain = chainable([invitation]);
		const selectGenerationsChain = chainable(generations);
		mockDb.select
			.mockReturnValueOnce(selectOwnerChain)
			.mockReturnValueOnce(selectGenerationsChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = await (listAiGenerationsFn as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
		});

		expect(result).toEqual(generations);
	});
});

describe("generateAiContentFn - custom type", () => {
	test("rejects custom type without customSystemPrompt", async () => {
		await expect(
			(generateAiContentFn as CallableFunction)({
				token: "valid-token",
				type: "custom",
				sectionId: "custom",
				prompt: "Create custom wedding content",
				context: {},
			}),
		).rejects.toThrow("customSystemPrompt is required for custom type");
	});
});

describe("generateAiContentBatchFn", () => {
	test("is exported", () => {
		expect(generateAiContentBatchFn).toBeDefined();
	});

	test("returns batch results", async () => {
		const originalApiKey = process.env.AI_API_KEY;
		const fetchMock = vi.fn(async () => ({
			ok: true,
			status: 200,
			json: async () => ({
				choices: [{ message: { content: '{"tagline":"Forever"}' } }],
			}),
		}));

		process.env.AI_API_KEY = "test-key";
		vi.stubGlobal("fetch", fetchMock);

		try {
			const result = (await (generateAiContentBatchFn as CallableFunction)({
				token: "valid-token",
				requests: [
					{
						type: "tagline",
						sectionId: "hero",
						prompt: "romantic",
						context: {},
					},
				],
			})) as Array<{ result?: Record<string, unknown>; error?: string }>;

			expect(result).toHaveLength(1);
			expect(result[0].error).toBeUndefined();
			expect(result[0].result?.tagline).toBe("Forever");
		} finally {
			process.env.AI_API_KEY = originalApiKey;
			vi.unstubAllGlobals();
		}
	});
});
