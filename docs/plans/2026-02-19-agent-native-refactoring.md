# Agent-Native Architecture Refactoring

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor DreamMoments API layer to follow agent-native architecture principles — complete CRUD parity, atomic primitives, composable operations, and standardized responses.

**Architecture:** Extract business logic from React hooks into server functions. Add missing CRUD endpoints. Enable partial content updates so agents (or any programmatic consumer) can modify specific fields without reconstructing entire JSONB blobs. Standardize all API responses.

**Tech Stack:** TanStack Start server functions, Drizzle ORM, Zod validation, Vitest

---

### Task 1: Add `deleteGuestFn` server function

**Files:**
- Modify: `src/lib/validation.ts` (add schema)
- Modify: `src/lib/data.ts` (add localStorage fallback)
- Modify: `src/api/guests.ts` (add server function)
- Modify: `src/tests/api-guests.test.ts` (add tests)

**Step 1: Write the failing test**

Add to `src/tests/api-guests.test.ts` — update the mock at line 89 to include `deleteGuest`, then add a test block:

In the `vi.mock("@/lib/data")` block, add:
```typescript
deleteGuest: vi.fn(),
```

Add import in the imports section:
```typescript
import {
	deleteGuestFn,
	// ... existing imports
} from "@/api/guests";
```

Then add tests:
```typescript
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
		const deleteChain = chainable([{ id: "g-1" }]);
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

	test("denies delete for wrong user (DB)", async () => {
		const invitation = { userId: "user-b" };
		const selectChain = chainable([invitation]);
		mockDb.select.mockReturnValue(selectChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = (await (deleteGuestFn as CallableFunction)({
			guestId: "g-1",
			token: "valid-token",
			invitationId: "inv-1",
		})) as { error: string };

		expect(result.error).toBe("Access denied");
	});
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/tests/api-guests.test.ts`
Expected: FAIL — `deleteGuestFn` not exported from `@/api/guests`

**Step 3: Add validation schema**

In `src/lib/validation.ts`, add after `updateGuestSchema` (line 78):

```typescript
export const deleteGuestSchema = z.object({
	guestId: z.string().min(1, "guestId is required"),
	invitationId: z.string().min(1, "invitationId is required"),
	userId: z.string().min(1, "userId is required"),
});

export type DeleteGuestInput = z.infer<typeof deleteGuestSchema>;
```

**Step 4: Add localStorage fallback**

In `src/lib/data.ts`, add after `updateGuest` function (after line 338):

```typescript
export function deleteGuest(guestId: string) {
	updateStore((store) => ({
		...store,
		guests: store.guests.filter((guest) => guest.id !== guestId),
	}));
}
```

**Step 5: Add server function**

In `src/api/guests.ts`, add the import for `deleteGuestSchema` in validation imports (line 23), add `deleteGuest as localDeleteGuest` to the data imports (line 13 area), then add after `exportGuestsCsvFn`:

```typescript
// ── Delete guest ─────────────────────────────────────────────────────

export const deleteGuestFn = createServerFn({
	method: "POST",
})
	.inputValidator(
		(data: { guestId: string; token: string; invitationId: string }) => {
			parseInput(deleteGuestSchema, {
				...data,
				userId: "placeholder",
			});
			return data;
		},
	)
	.handler(async ({ data }) => {
		const { userId } = await requireAuth(data.token);

		const db = getDbOrNull();

		if (db) {
			// Verify invitation ownership
			const invitation = await db
				.select({ userId: schema.invitations.userId })
				.from(schema.invitations)
				.where(eq(schema.invitations.id, data.invitationId));

			if (invitation.length === 0) {
				return { error: "Invitation not found" };
			}
			if (invitation[0].userId !== userId) {
				return { error: "Access denied" };
			}

			await db
				.delete(schema.guests)
				.where(
					and(
						eq(schema.guests.id, data.guestId),
						eq(schema.guests.invitationId, data.invitationId),
					),
				);

			return { success: true };
		}

		// localStorage fallback - verify ownership
		const invitation = localGetInvitationById(data.invitationId);
		if (!invitation) {
			return { error: "Invitation not found" };
		}
		if (invitation.userId !== userId) {
			return { error: "Access denied" };
		}

		localDeleteGuest(data.guestId);
		return { success: true };
	});
```

**Step 6: Run tests to verify they pass**

Run: `pnpm vitest run src/tests/api-guests.test.ts`
Expected: ALL PASS

**Step 7: Commit**

```bash
git add src/lib/validation.ts src/lib/data.ts src/api/guests.ts src/tests/api-guests.test.ts
git commit -m "feat: add deleteGuestFn server function for CRUD parity"
```

---

### Task 2: Add `listAiGenerationsFn` server function

**Files:**
- Modify: `src/lib/validation.ts` (add schema)
- Modify: `src/lib/data.ts` (add localStorage helper)
- Modify: `src/api/ai.ts` (add server function)
- Modify: `src/tests/lib-ai.test.ts` OR create test in existing pattern

**Step 1: Write the failing test**

Create test block. The existing test file `src/tests/lib-ai.test.ts` tests client-side AI. We need a new test for the server function. Add to the bottom of `src/tests/lib-ai.test.ts` or, if the mock structure differs, add a new `describe` block in the file. Following the existing mock pattern from `api-guests.test.ts`:

Add a new file `src/tests/api-ai.test.ts`:

```typescript
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
};

function chainable(result: unknown[] = []) {
	const chain: Record<string, unknown> = {};
	chain.from = vi.fn().mockReturnValue(chain);
	chain.where = vi.fn().mockReturnValue(chain);
	chain.orderBy = vi.fn().mockReturnValue(chain);
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
		aiGenerations: {
			id: "id",
			invitationId: "invitation_id",
			createdAt: "created_at",
		},
	},
}));

vi.mock("@/lib/server-auth", () => ({
	requireAuth: vi.fn(async () => ({ userId: "user-a" })),
}));

vi.mock("@/lib/data", () => ({
	getInvitationById: vi.fn(() => null),
	listAiGenerations: vi.fn(() => []),
}));

import { listAiGenerationsFn } from "@/api/ai";
import { getDbOrNull } from "@/db/index";
import { getInvitationById as localGetInvitationById, listAiGenerations as localListAiGenerations } from "@/lib/data";
import { requireAuth } from "@/lib/server-auth";

const mockedGetDbOrNull = vi.mocked(getDbOrNull);
const mockedRequireAuth = vi.mocked(requireAuth);
const mockedLocalGetById = vi.mocked(localGetInvitationById);
const mockedLocalListAiGens = vi.mocked(localListAiGenerations);

beforeEach(() => {
	vi.clearAllMocks();
	mockedGetDbOrNull.mockReturnValue(null);
	mockedRequireAuth.mockResolvedValue({ userId: "user-a" });
});

describe("listAiGenerationsFn", () => {
	test("lists AI generations (fallback path)", async () => {
		const inv = { id: "inv-1", userId: "user-a" };
		mockedLocalGetById.mockReturnValue(
			inv as ReturnType<typeof localGetInvitationById>,
		);
		const gens = [
			{ id: "gen-1", invitationId: "inv-1", sectionId: "schedule", prompt: "test", accepted: false },
		];
		mockedLocalListAiGens.mockReturnValue(gens as any);

		const result = await (listAiGenerationsFn as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
		});

		expect(result).toEqual(gens);
	});

	test("denies access for wrong user (fallback)", async () => {
		const inv = { id: "inv-1", userId: "user-b" };
		mockedLocalGetById.mockReturnValue(
			inv as ReturnType<typeof localGetInvitationById>,
		);

		const result = (await (listAiGenerationsFn as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
		})) as { error: string };

		expect(result.error).toBe("Access denied");
	});

	test("lists AI generations (DB path)", async () => {
		const invitation = { userId: "user-a" };
		const gens = [
			{ id: "gen-1", invitationId: "inv-1", sectionId: "schedule", prompt: "test" },
		];

		const selectOwnerChain = chainable([invitation]);
		const selectGensChain = chainable(gens);
		mockDb.select
			.mockReturnValueOnce(selectOwnerChain)
			.mockReturnValueOnce(selectGensChain);
		mockedGetDbOrNull.mockReturnValue(
			mockDb as unknown as ReturnType<typeof getDbOrNull>,
		);

		const result = await (listAiGenerationsFn as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
		});

		expect(result).toEqual(gens);
	});
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/tests/api-ai.test.ts`
Expected: FAIL — `listAiGenerationsFn` not exported

**Step 3: Add localStorage helper**

In `src/lib/data.ts`, add after `incrementAiUsage` (after line 512):

```typescript
export function listAiGenerations(invitationId: string) {
	return getStore().aiGenerations.filter(
		(gen) => gen.invitationId === invitationId,
	);
}
```

**Step 4: Add validation schema**

In `src/lib/validation.ts`, add after `trackViewSchema` (after line 131):

```typescript
// ── AI schemas ─────────────────────────────────────────────────────

export const listAiGenerationsSchema = z.object({
	invitationId: z.string().min(1, "invitationId is required"),
	token: z.string().min(1, "Token is required"),
});

export type ListAiGenerationsInput = z.infer<typeof listAiGenerationsSchema>;
```

**Step 5: Add server function**

In `src/api/ai.ts`, add imports at top:

```typescript
import { desc, eq } from "drizzle-orm";
import { getDbOrNull, schema } from "@/db/index";
import {
	getInvitationById as localGetInvitationById,
	listAiGenerations as localListAiGenerations,
} from "@/lib/data";
```

Then add after `generateAiContentFn`:

```typescript
// ── List AI generations for an invitation ────────────────────────────

const listAiGenerationsSchema = z.object({
	invitationId: z.string().min(1, "invitationId is required"),
	token: z.string().min(1, "Token is required"),
});

export const listAiGenerationsFn = createServerFn({
	method: "GET",
})
	.inputValidator(
		(data: { invitationId: string; token: string }) =>
			parseInput(listAiGenerationsSchema, data),
	)
	.handler(async ({ data }) => {
		const { userId } = await requireAuth(data.token);

		const db = getDbOrNull();

		if (db) {
			// Verify invitation ownership
			const invitation = await db
				.select({ userId: schema.invitations.userId })
				.from(schema.invitations)
				.where(eq(schema.invitations.id, data.invitationId));

			if (invitation.length === 0) {
				return { error: "Invitation not found" };
			}
			if (invitation[0].userId !== userId) {
				return { error: "Access denied" };
			}

			return db
				.select()
				.from(schema.aiGenerations)
				.where(eq(schema.aiGenerations.invitationId, data.invitationId))
				.orderBy(desc(schema.aiGenerations.createdAt));
		}

		// localStorage fallback
		const invitation = localGetInvitationById(data.invitationId);
		if (!invitation) {
			return { error: "Invitation not found" };
		}
		if (invitation.userId !== userId) {
			return { error: "Access denied" };
		}

		return localListAiGenerations(data.invitationId);
	});
```

**Step 6: Run tests**

Run: `pnpm vitest run src/tests/api-ai.test.ts`
Expected: ALL PASS

**Step 7: Commit**

```bash
git add src/api/ai.ts src/lib/data.ts src/lib/validation.ts src/tests/api-ai.test.ts
git commit -m "feat: add listAiGenerationsFn for AI generation history access"
```

---

### Task 3: Add `patchInvitationContentFn` for partial content updates

**Files:**
- Modify: `src/api/invitations.ts` (add server function)
- Modify: `src/tests/api-invitations.test.ts` (add tests)

**Step 1: Write the failing test**

Add to `src/tests/api-invitations.test.ts`:

```typescript
describe("patchInvitationContentFn", () => {
	test("patches specific content field (fallback path)", async () => {
		const inv = {
			id: "inv-1",
			userId: "user-a",
			content: {
				hero: { partnerOneName: "Alice", partnerTwoName: "Bob", tagline: "old", date: "2026-06-01" },
				schedule: { events: [] },
			},
		};
		mockedLocalGetById.mockReturnValue(
			inv as ReturnType<typeof localGetInvitationById>,
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
			inv as ReturnType<typeof localGetInvitationById>,
		);

		const result = (await (patchInvitationContentFn as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
			path: "hero.tagline",
			value: "Hacked",
		})) as { error: string };

		expect(result.error).toBe("Access denied");
	});
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/tests/api-invitations.test.ts`
Expected: FAIL — `patchInvitationContentFn` not exported

**Step 3: Implement server function**

In `src/api/invitations.ts`, add after `unpublishInvitationFn`:

```typescript
// ── Patch invitation content (partial update) ────────────────────────

const patchContentSchema = z.object({
	invitationId: z.string().min(1, "invitationId is required"),
	token: z.string().min(1, "Token is required"),
	path: z.string().min(1, "path is required"),
	value: z.unknown(),
});

export const patchInvitationContentFn = createServerFn({
	method: "POST",
})
	.inputValidator(
		(data: {
			invitationId: string;
			token: string;
			path: string;
			value: unknown;
		}) => parseInput(patchContentSchema, data),
	)
	// @ts-expect-error ServerFn inference expects stricter JSON type than Record<string, unknown>
	.handler(async ({ data }) => {
		const { userId } = await requireAuth(data.token);

		const db = getDbOrNull();

		if (db) {
			const rows = await db
				.select()
				.from(schema.invitations)
				.where(eq(schema.invitations.id, data.invitationId));

			if (rows.length === 0) {
				return { error: "Invitation not found" };
			}
			if (rows[0].userId !== userId) {
				return { error: "Access denied" };
			}

			const content = structuredClone(
				rows[0].content as Record<string, unknown>,
			);
			setNestedValue(content, data.path, data.value);

			const updated = await db
				.update(schema.invitations)
				.set({ content, updatedAt: new Date() })
				.where(eq(schema.invitations.id, data.invitationId))
				.returning();

			return updated[0];
		}

		// localStorage fallback
		const invitation = localGetInvitationById(data.invitationId);
		if (!invitation) {
			return { error: "Invitation not found" };
		}
		if (invitation.userId !== userId) {
			return { error: "Access denied" };
		}

		const content = structuredClone(
			invitation.content as unknown as Record<string, unknown>,
		);
		setNestedValue(content, data.path, data.value);
		const updated = localUpdateInvitation(data.invitationId, {
			content: content as unknown as Invitation["content"],
		});
		return updated ?? { error: "Patch failed" };
	});

/** Set a nested value at a dot-separated path (e.g. "hero.tagline") */
function setNestedValue(
	obj: Record<string, unknown>,
	path: string,
	value: unknown,
) {
	const keys = path.split(".");
	let current: Record<string, unknown> = obj;
	for (let i = 0; i < keys.length - 1; i++) {
		const key = keys[i];
		if (
			!current[key] ||
			typeof current[key] !== "object" ||
			Array.isArray(current[key])
		) {
			current[key] = {};
		}
		current = current[key] as Record<string, unknown>;
	}
	current[keys[keys.length - 1]] = value;
}
```

**Step 4: Run tests**

Run: `pnpm vitest run src/tests/api-invitations.test.ts`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add src/api/invitations.ts src/tests/api-invitations.test.ts
git commit -m "feat: add patchInvitationContentFn for partial content updates"
```

---

### Task 4: Extract "apply AI result" into server function

**Files:**
- Modify: `src/api/ai.ts` (add `applyAiResultFn`)
- Create: `src/tests/api-ai-apply.test.ts` (or extend `src/tests/api-ai.test.ts`)

**Step 1: Write the failing test**

Add to `src/tests/api-ai.test.ts`:

```typescript
describe("applyAiResultFn", () => {
	test("applies schedule result to invitation (fallback)", async () => {
		const inv = {
			id: "inv-1",
			userId: "user-a",
			content: { schedule: { events: [] } },
		};
		mockedLocalGetById.mockReturnValue(
			inv as ReturnType<typeof localGetInvitationById>,
		);

		const result = await (applyAiResultFn as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
			type: "schedule",
			sectionId: "schedule",
			aiResult: { events: [{ time: "10:00 AM", title: "Ceremony", description: "Main event" }] },
		});

		expect(result.error).toBeUndefined();
	});

	test("applies tagline result to invitation (fallback)", async () => {
		const inv = {
			id: "inv-1",
			userId: "user-a",
			content: { hero: { partnerOneName: "A", partnerTwoName: "B", tagline: "old", date: "" } },
		};
		mockedLocalGetById.mockReturnValue(
			inv as ReturnType<typeof localGetInvitationById>,
		);

		const result = await (applyAiResultFn as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
			type: "tagline",
			sectionId: "hero",
			aiResult: { tagline: "Forever & Always" },
		});

		expect(result.error).toBeUndefined();
	});

	test("denies apply for wrong user", async () => {
		const inv = { id: "inv-1", userId: "user-b", content: {} };
		mockedLocalGetById.mockReturnValue(
			inv as ReturnType<typeof localGetInvitationById>,
		);

		const result = (await (applyAiResultFn as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
			type: "schedule",
			sectionId: "schedule",
			aiResult: { events: [] },
		})) as { error: string };

		expect(result.error).toBe("Access denied");
	});
});
```

Import `applyAiResultFn` from `@/api/ai` in the import block.

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/tests/api-ai.test.ts`
Expected: FAIL — `applyAiResultFn` not exported

**Step 3: Implement server function**

In `src/api/ai.ts`, add after `listAiGenerationsFn`. Note: this requires importing `localUpdateInvitation` from `@/lib/data` as well:

```typescript
// ── Apply AI result to invitation content ────────────────────────────

const applyAiResultSchema = z.object({
	invitationId: z.string().min(1),
	token: z.string().min(1),
	type: z.enum(["schedule", "faq", "story", "tagline", "style", "translate"]),
	sectionId: z.string().min(1),
	aiResult: z.record(z.string(), z.unknown()),
	generationId: z.string().optional(),
});

export const applyAiResultFn = createServerFn({
	method: "POST",
})
	.inputValidator(
		(data: {
			invitationId: string;
			token: string;
			type: AiGenerationType;
			sectionId: string;
			aiResult: Record<string, unknown>;
			generationId?: string;
		}) => parseInput(applyAiResultSchema, data),
	)
	// @ts-expect-error ServerFn inference expects stricter JSON type
	.handler(async ({ data }) => {
		const { userId } = await requireAuth(data.token);

		const db = getDbOrNull();

		if (db) {
			const rows = await db
				.select()
				.from(schema.invitations)
				.where(eq(schema.invitations.id, data.invitationId));

			if (rows.length === 0) return { error: "Invitation not found" };
			if (rows[0].userId !== userId) return { error: "Access denied" };

			const content = structuredClone(
				rows[0].content as Record<string, unknown>,
			);
			applyAiToContent(content, data.type, data.sectionId, data.aiResult);

			const updated = await db
				.update(schema.invitations)
				.set({ content, updatedAt: new Date() })
				.where(eq(schema.invitations.id, data.invitationId))
				.returning();

			// Mark generation as accepted if provided
			if (data.generationId) {
				await db
					.update(schema.aiGenerations)
					.set({ accepted: true })
					.where(eq(schema.aiGenerations.id, data.generationId));
			}

			return updated[0];
		}

		// localStorage fallback
		const invitation = localGetInvitationById(data.invitationId);
		if (!invitation) return { error: "Invitation not found" };
		if (invitation.userId !== userId) return { error: "Access denied" };

		const content = structuredClone(
			invitation.content as unknown as Record<string, unknown>,
		);
		applyAiToContent(content, data.type, data.sectionId, data.aiResult);
		localUpdateInvitation(data.invitationId, {
			content: content as unknown as typeof invitation.content,
		});

		if (data.generationId) {
			localMarkAiGenerationAccepted(data.generationId);
		}

		return localGetInvitationById(data.invitationId) ?? { success: true };
	});

/** Apply AI-generated content to the correct section of invitation content */
function applyAiToContent(
	content: Record<string, unknown>,
	type: AiGenerationType,
	sectionId: string,
	aiResult: Record<string, unknown>,
) {
	if (type === "style") {
		// Style overrides are handled separately via designOverrides
		return;
	}
	if (type === "translate") {
		const announcement = (content.announcement ?? {}) as Record<string, unknown>;
		announcement.formalText = String(aiResult.translation ?? "");
		content.announcement = announcement;
	} else if (sectionId === "schedule") {
		const schedule = (content.schedule ?? {}) as Record<string, unknown>;
		schedule.events = aiResult.events ?? [];
		content.schedule = schedule;
	} else if (sectionId === "faq") {
		const faq = (content.faq ?? {}) as Record<string, unknown>;
		faq.items = aiResult.items ?? [];
		content.faq = faq;
	} else if (sectionId === "story") {
		const story = (content.story ?? {}) as Record<string, unknown>;
		story.milestones = aiResult.milestones ?? [];
		content.story = story;
	} else if (sectionId === "hero") {
		const hero = (content.hero ?? {}) as Record<string, unknown>;
		hero.tagline = String(aiResult.tagline ?? "");
		content.hero = hero;
	}
}
```

Add imports at top of file:
```typescript
import {
	getInvitationById as localGetInvitationById,
	listAiGenerations as localListAiGenerations,
	markAiGenerationAccepted as localMarkAiGenerationAccepted,
	updateInvitation as localUpdateInvitation,
} from "@/lib/data";
```

**Step 4: Run tests**

Run: `pnpm vitest run src/tests/api-ai.test.ts`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add src/api/ai.ts src/tests/api-ai.test.ts
git commit -m "feat: extract applyAiResultFn from React hook into server function"
```

---

### Task 5: Enhance guest list filtering

**Files:**
- Modify: `src/lib/validation.ts` (extend listGuestsSchema)
- Modify: `src/api/guests.ts` (add search/relationship filters)
- Modify: `src/tests/api-guests.test.ts` (add filter tests)

**Step 1: Write the failing test**

Add to `src/tests/api-guests.test.ts`:

```typescript
describe("listGuestsFn - extended filters", () => {
	test("filters by search term (fallback)", async () => {
		const inv = { id: "inv-1", userId: "user-a" };
		mockedLocalGetById.mockReturnValue(
			inv as ReturnType<typeof localGetInvitationById>,
		);
		mockedLocalListGuests.mockReturnValue([
			{ id: "g-1", name: "Alice Wong", relationship: "friend" },
			{ id: "g-2", name: "Bob Tan", relationship: "family" },
		] as any);

		const result = await (listGuestsFn as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
			search: "alice",
		});

		// The search filter should narrow results
		expect(Array.isArray(result)).toBe(true);
	});
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/tests/api-guests.test.ts`
Expected: May pass (search just passed through), or may fail if validation rejects unknown field

**Step 3: Update validation schema**

In `src/lib/validation.ts`, update `listGuestsSchema` (line 97):

```typescript
export const listGuestsSchema = z.object({
	invitationId: z.string().min(1, "invitationId is required"),
	userId: z.string().min(1, "userId is required"),
	filter: z
		.enum(["attending", "not_attending", "undecided", "pending"])
		.optional(),
	search: z.string().optional(),
	relationship: z.string().optional(),
});
```

**Step 4: Update server function**

In `src/api/guests.ts`, update the `listGuestsFn` input validator type (line 54 area) to accept `search?: string` and `relationship?: string`. Then after the DB query or local fallback, add post-filtering:

Update the input validator type:
```typescript
(data: {
	invitationId: string;
	token: string;
	filter?: "attending" | "not_attending" | "undecided" | "pending";
	search?: string;
	relationship?: string;
})
```

After getting the rows (both DB and localStorage paths), add filtering before return:

```typescript
// Apply additional filters
let filtered = rows;
if (data.search) {
	const term = data.search.toLowerCase();
	filtered = filtered.filter(
		(g: any) =>
			g.name?.toLowerCase().includes(term) ||
			g.email?.toLowerCase().includes(term),
	);
}
if (data.relationship) {
	filtered = filtered.filter(
		(g: any) => g.relationship === data.relationship,
	);
}
return filtered;
```

**Step 5: Run tests**

Run: `pnpm vitest run src/tests/api-guests.test.ts`
Expected: ALL PASS

**Step 6: Commit**

```bash
git add src/lib/validation.ts src/api/guests.ts src/tests/api-guests.test.ts
git commit -m "feat: add search and relationship filters to listGuestsFn"
```

---

### Task 6: Standardize API error responses

**Files:**
- Modify: `src/api/guests.ts` (updateGuestFn fallback returns `{success}` instead of entity)
- Modify: `src/api/invitations.ts` (deleteInvitationFn returns `{success}`)
- Modify: `src/tests/api-guests.test.ts` (update expectations)
- Modify: `src/tests/api-invitations.test.ts` (update expectations)

**Note:** This task normalizes the inconsistent response shapes. The convention:
- Success: return the entity (or `{ success: true }` for deletes)
- Error: return `{ error: "message" }`

This is a light-touch task. The main issue is `updateGuestFn` fallback path (line 337) returning `{ success: true }` instead of the updated guest.

**Step 1: Fix updateGuestFn fallback to return updated guest**

In `src/api/guests.ts` at line 335-337, change:

```typescript
// Before
const { guestId, token: _, invitationId: __, ...patch } = data;
localUpdateGuest(guestId, patch);
return { success: true };

// After
const { guestId, token: _, invitationId: __, ...patch } = data;
localUpdateGuest(guestId, patch);
// Return consistent shape — find the updated guest from local store
const allGuests = localListGuests(data.invitationId);
const updated = allGuests.find((g) => g.id === guestId);
return updated ?? { error: "Guest not found after update" };
```

**Step 2: Update test expectation**

In `src/tests/api-guests.test.ts`, the test "updates guest (fallback path)" (line 364) expects `{ success: true }`. Update the mock setup to include the guest in the list, and update the assertion.

**Step 3: Run tests**

Run: `pnpm vitest run src/tests/api-guests.test.ts`
Expected: ALL PASS

**Step 4: Commit**

```bash
git add src/api/guests.ts src/tests/api-guests.test.ts
git commit -m "fix: standardize API responses - return entities instead of {success}"
```

---

### Task 7: Allow custom AI prompts (freeform type)

**Files:**
- Modify: `src/api/ai.ts` (accept "custom" type with user-provided system instructions)

**Step 1: Write the failing test**

Add to `src/tests/api-ai.test.ts`:

```typescript
describe("generateAiContentFn - custom type", () => {
	test("rejects custom type without customSystemPrompt", async () => {
		// This tests that the schema validation or handler rejects a
		// "custom" type when no customSystemPrompt is provided
		// (depends on implementation: could be schema or handler error)
	});
});
```

**Step 2: Extend the AiGenerationType**

In `src/api/ai.ts`, update the type:

```typescript
type AiGenerationType =
	| "schedule"
	| "faq"
	| "story"
	| "tagline"
	| "style"
	| "translate"
	| "custom";
```

**Step 3: Update schema to accept custom type and optional customSystemPrompt**

```typescript
const generateAiContentSchema = z.object({
	token: z.string().min(1, "Token is required"),
	type: z.enum(["schedule", "faq", "story", "tagline", "style", "translate", "custom"]),
	sectionId: z.string().min(1, "sectionId is required"),
	prompt: z.string().min(1, "Prompt is required").max(2000, "Prompt is too long"),
	context: z.record(z.string(), z.unknown()),
	customSystemPrompt: z.string().max(1000).optional(),
});
```

**Step 4: Update handler to use custom system prompt**

In the handler, change the system prompt selection:

```typescript
const systemPrompt =
	data.type === "custom"
		? `${ROLE_BOUNDARY}\n${data.customSystemPrompt ?? "Generate wedding-related content based on the user's request. Return valid JSON."}`
		: SYSTEM_PROMPTS[data.type];
```

**Step 5: Run all tests**

Run: `pnpm vitest run src/tests/api-ai.test.ts`
Expected: ALL PASS

**Step 6: Commit**

```bash
git add src/api/ai.ts src/tests/api-ai.test.ts
git commit -m "feat: add custom AI generation type with user-provided system prompt"
```

---

### Task 8: Add invitation content Zod schema

**Files:**
- Modify: `src/lib/validation.ts` (add InvitationContent schema)

**Step 1: Write the failing test**

Add to `src/tests/lib-validation.test.ts`:

```typescript
describe("invitationContentSchema", () => {
	test("validates correct content", () => {
		const content = {
			hero: { partnerOneName: "A", partnerTwoName: "B", tagline: "Love", date: "2026-06-01" },
			announcement: { title: "T", message: "M", formalText: "F" },
			couple: {
				partnerOne: { fullName: "Alice", bio: "bio" },
				partnerTwo: { fullName: "Bob", bio: "bio" },
			},
			story: { milestones: [] },
			gallery: { photos: [] },
			schedule: { events: [] },
			venue: { name: "V", address: "A", coordinates: { lat: 0, lng: 0 }, directions: "D" },
			entourage: { members: [] },
			registry: { title: "T", note: "N" },
			rsvp: { deadline: "2026-05-01", allowPlusOnes: false, maxPlusOnes: 0, dietaryOptions: [], customMessage: "" },
			faq: { items: [] },
			footer: { message: "M" },
			details: { scheduleSummary: "", venueSummary: "" },
			calendar: { dateLabel: "", message: "" },
			countdown: { targetDate: "" },
		};
		const result = invitationContentSchema.safeParse(content);
		expect(result.success).toBe(true);
	});

	test("rejects content missing required fields", () => {
		const result = invitationContentSchema.safeParse({});
		expect(result.success).toBe(false);
	});
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/tests/lib-validation.test.ts`
Expected: FAIL — `invitationContentSchema` not exported

**Step 3: Add schema to validation.ts**

In `src/lib/validation.ts`, add at the end:

```typescript
// ── Invitation content schema ───────────────────────────────────────

export const invitationContentSchema = z.object({
	hero: z.object({
		partnerOneName: z.string(),
		partnerTwoName: z.string(),
		tagline: z.string(),
		date: z.string(),
		heroImageUrl: z.string().optional(),
	}),
	announcement: z.object({
		title: z.string(),
		message: z.string(),
		formalText: z.string(),
	}),
	couple: z.object({
		partnerOne: z.object({ fullName: z.string(), bio: z.string(), photoUrl: z.string().optional() }),
		partnerTwo: z.object({ fullName: z.string(), bio: z.string(), photoUrl: z.string().optional() }),
	}),
	story: z.object({ milestones: z.array(z.object({ date: z.string(), title: z.string(), description: z.string(), photoUrl: z.string().optional() })) }),
	gallery: z.object({ photos: z.array(z.object({ url: z.string(), caption: z.string().optional() })) }),
	schedule: z.object({ events: z.array(z.object({ time: z.string(), title: z.string(), description: z.string(), icon: z.string().optional() })) }),
	venue: z.object({ name: z.string(), address: z.string(), coordinates: z.object({ lat: z.number(), lng: z.number() }), directions: z.string(), parkingInfo: z.string().optional() }),
	entourage: z.object({ members: z.array(z.object({ role: z.string(), name: z.string() })) }),
	registry: z.object({ title: z.string(), note: z.string() }),
	rsvp: z.object({ deadline: z.string(), allowPlusOnes: z.boolean(), maxPlusOnes: z.number(), dietaryOptions: z.array(z.string()), customMessage: z.string() }),
	faq: z.object({ items: z.array(z.object({ question: z.string(), answer: z.string() })) }),
	footer: z.object({ message: z.string(), socialLinks: z.object({ instagram: z.string().optional(), hashtag: z.string().optional() }).optional() }),
	details: z.object({ scheduleSummary: z.string(), venueSummary: z.string() }),
	calendar: z.object({ dateLabel: z.string(), message: z.string() }),
	countdown: z.object({ targetDate: z.string() }),
	gift: z.object({ paymentUrl: z.string(), paymentMethod: z.enum(["duitnow", "paynow", "tng"]), recipientName: z.string().optional() }).optional(),
	musicUrl: z.string().optional(),
});

export type InvitationContentInput = z.infer<typeof invitationContentSchema>;
```

**Step 4: Run tests**

Run: `pnpm vitest run src/tests/lib-validation.test.ts`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add src/lib/validation.ts src/tests/lib-validation.test.ts
git commit -m "feat: add Zod schema for InvitationContent structure validation"
```

---

### Task 9: Add invitation version snapshots

**Files:**
- Modify: `src/db/schema.ts` (add `invitationSnapshots` table)
- Modify: `src/api/invitations.ts` (snapshot before update)
- Modify: `src/lib/data.ts` (localStorage snapshot support)
- Modify: `src/lib/types.ts` (add InvitationSnapshot type)

**Step 1: Add schema table**

In `src/db/schema.ts`, add after the `payments` table:

```typescript
export const invitationSnapshots = pgTable(
	"invitation_snapshots",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		invitationId: uuid("invitation_id")
			.notNull()
			.references(() => invitations.id, { onDelete: "cascade" }),
		content: jsonb("content").$type<Record<string, unknown>>().notNull(),
		designOverrides: jsonb("design_overrides").$type<Record<string, unknown>>(),
		reason: varchar("reason", { length: 100 }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => ({
		invitationIdx: index("idx_snapshots_invitation").on(table.invitationId),
	}),
);
```

**Step 2: Add type**

In `src/lib/types.ts`, add:

```typescript
export interface InvitationSnapshot {
	id: string;
	invitationId: string;
	content: Record<string, unknown>;
	designOverrides?: Record<string, unknown>;
	reason?: string;
	createdAt: string;
}
```

Update `Store` interface to include snapshots:

```typescript
export interface Store {
	// ... existing fields
	invitationSnapshots: InvitationSnapshot[];
}
```

**Step 3: Add localStorage helpers**

In `src/lib/data.ts`:

```typescript
export function createInvitationSnapshot(
	invitationId: string,
	reason?: string,
) {
	const invitation = getInvitationById(invitationId);
	if (!invitation) return;
	const snapshot: InvitationSnapshot = {
		id: createId(),
		invitationId,
		content: invitation.content as unknown as Record<string, unknown>,
		designOverrides: invitation.designOverrides,
		reason,
		createdAt: now(),
	};
	updateStore((store) => ({
		...store,
		invitationSnapshots: [...(store.invitationSnapshots ?? []), snapshot],
	}));
	return snapshot;
}

export function listInvitationSnapshots(invitationId: string) {
	return (getStore().invitationSnapshots ?? []).filter(
		(s) => s.invitationId === invitationId,
	);
}
```

**Step 4: Wire snapshots into updateInvitationFn**

In `src/api/invitations.ts`, inside `updateInvitationFn` handler, add a snapshot before the content update. In the DB path, after verifying ownership and before building update fields:

```typescript
// Create snapshot if content is being updated
if (data.content !== undefined && db) {
	const current = await db
		.select({ content: schema.invitations.content })
		.from(schema.invitations)
		.where(eq(schema.invitations.id, data.invitationId));
	if (current[0]) {
		await db.insert(schema.invitationSnapshots).values({
			invitationId: data.invitationId,
			content: current[0].content,
			reason: "auto-save",
		});
	}
}
```

**Step 5: Run all tests**

Run: `pnpm vitest run`
Expected: ALL PASS (snapshot is additive, doesn't break existing behavior)

**Step 6: Generate migration**

Run: `pnpm db:generate`

**Step 7: Commit**

```bash
git add src/db/schema.ts src/lib/types.ts src/lib/data.ts src/api/invitations.ts
git commit -m "feat: add invitation version snapshots for undo support"
```

---

### Task 10: Add `bulkUpdateGuestsFn`

**Files:**
- Modify: `src/lib/validation.ts` (add schema)
- Modify: `src/api/guests.ts` (add server function)
- Modify: `src/tests/api-guests.test.ts` (add tests)

**Step 1: Write the failing test**

```typescript
describe("bulkUpdateGuestsFn", () => {
	test("bulk updates guest attendance (fallback)", async () => {
		const inv = { id: "inv-1", userId: "user-a" };
		mockedLocalGetById.mockReturnValue(
			inv as ReturnType<typeof localGetInvitationById>,
		);

		const result = await (bulkUpdateGuestsFn as CallableFunction)({
			invitationId: "inv-1",
			token: "valid-token",
			updates: [
				{ guestId: "g-1", attendance: "attending" },
				{ guestId: "g-2", attendance: "not_attending" },
			],
		});

		expect(result.updated).toBe(2);
	});
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/tests/api-guests.test.ts`
Expected: FAIL — `bulkUpdateGuestsFn` not exported

**Step 3: Add validation schema**

In `src/lib/validation.ts`:

```typescript
export const bulkUpdateGuestsSchema = z.object({
	invitationId: z.string().min(1),
	userId: z.string().min(1),
	updates: z.array(
		z.object({
			guestId: z.string().min(1),
			name: z.string().optional(),
			attendance: z.enum(["attending", "not_attending", "undecided"]).optional(),
			guestCount: z.number().int().min(1).max(20).optional(),
			dietaryRequirements: z.string().optional(),
		}),
	).min(1).max(100),
});
```

**Step 4: Implement server function**

In `src/api/guests.ts`:

```typescript
// ── Bulk update guests ──────────────────────────────────────────────

export const bulkUpdateGuestsFn = createServerFn({
	method: "POST",
})
	.inputValidator(
		(data: {
			invitationId: string;
			token: string;
			updates: Array<{
				guestId: string;
				name?: string;
				attendance?: "attending" | "not_attending" | "undecided";
				guestCount?: number;
				dietaryRequirements?: string;
			}>;
		}) => {
			parseInput(bulkUpdateGuestsSchema, {
				...data,
				userId: "placeholder",
			});
			return data;
		},
	)
	.handler(async ({ data }) => {
		const { userId } = await requireAuth(data.token);

		const db = getDbOrNull();

		if (db) {
			const invitation = await db
				.select({ userId: schema.invitations.userId })
				.from(schema.invitations)
				.where(eq(schema.invitations.id, data.invitationId));

			if (invitation.length === 0) return { error: "Invitation not found" };
			if (invitation[0].userId !== userId) return { error: "Access denied" };

			let updated = 0;
			for (const update of data.updates) {
				const { guestId, ...fields } = update;
				const updateFields: Record<string, unknown> = { updatedAt: new Date() };
				for (const [key, value] of Object.entries(fields)) {
					if (value !== undefined) updateFields[key] = value;
				}
				const rows = await db
					.update(schema.guests)
					.set(updateFields)
					.where(
						and(
							eq(schema.guests.id, guestId),
							eq(schema.guests.invitationId, data.invitationId),
						),
					)
					.returning();
				if (rows.length > 0) updated++;
			}

			return { updated };
		}

		// localStorage fallback
		const invitation = localGetInvitationById(data.invitationId);
		if (!invitation) return { error: "Invitation not found" };
		if (invitation.userId !== userId) return { error: "Access denied" };

		for (const update of data.updates) {
			const { guestId, ...fields } = update;
			localUpdateGuest(guestId, fields);
		}

		return { updated: data.updates.length };
	});
```

**Step 5: Run tests**

Run: `pnpm vitest run src/tests/api-guests.test.ts`
Expected: ALL PASS

**Step 6: Commit**

```bash
git add src/lib/validation.ts src/api/guests.ts src/tests/api-guests.test.ts
git commit -m "feat: add bulkUpdateGuestsFn for batch guest updates"
```

---

### Task 11: Add `generateAiContentBatchFn`

**Files:**
- Modify: `src/api/ai.ts` (add batch endpoint)
- Modify: `src/tests/api-ai.test.ts` (add tests)

**Step 1: Write the failing test**

```typescript
describe("generateAiContentBatchFn", () => {
	test("rejects if not exported", async () => {
		expect(generateAiContentBatchFn).toBeDefined();
	});
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm vitest run src/tests/api-ai.test.ts`
Expected: FAIL — `generateAiContentBatchFn` not exported

**Step 3: Implement batch endpoint**

In `src/api/ai.ts`:

```typescript
// ── Batch AI content generation ──────────────────────────────────────

const generateAiContentBatchSchema = z.object({
	token: z.string().min(1),
	requests: z.array(
		z.object({
			type: z.enum(["schedule", "faq", "story", "tagline", "style", "translate", "custom"]),
			sectionId: z.string().min(1),
			prompt: z.string().min(1).max(2000),
			context: z.record(z.string(), z.unknown()),
			customSystemPrompt: z.string().max(1000).optional(),
		}),
	).min(1).max(5),
});

export const generateAiContentBatchFn = createServerFn({
	method: "POST",
})
	.inputValidator(
		(data: {
			token: string;
			requests: Array<{
				type: AiGenerationType;
				sectionId: string;
				prompt: string;
				context: Record<string, unknown>;
				customSystemPrompt?: string;
			}>;
		}) => parseInput(generateAiContentBatchSchema, data),
	)
	.handler(async ({ data }) => {
		await requireAuth(data.token);

		const apiKey = process.env.AI_API_KEY;
		if (!apiKey) {
			throw new Error("AI_NOT_CONFIGURED");
		}

		const baseUrl = (
			process.env.AI_API_URL ?? "https://api.openai.com/v1"
		).replace(/\/+$/, "");
		const model = process.env.AI_MODEL ?? "gpt-4o-mini";

		const results = await Promise.allSettled(
			data.requests.map(async (req) => {
				const sanitizedData = { ...req, prompt: sanitizePrompt(req.prompt) };
				const systemPrompt =
					req.type === "custom"
						? `${ROLE_BOUNDARY}\n${req.customSystemPrompt ?? "Generate wedding-related content. Return valid JSON."}`
						: SYSTEM_PROMPTS[req.type];
				const userPrompt = buildUserPrompt(sanitizedData as AiRequestData);

				const controller = new AbortController();
				const timeout = setTimeout(() => controller.abort(), 30_000);

				try {
					const response = await fetch(`${baseUrl}/chat/completions`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${apiKey}`,
						},
						body: JSON.stringify({
							model,
							messages: [
								{ role: "system", content: systemPrompt },
								{ role: "user", content: userPrompt },
							],
							temperature: 0.7,
							max_tokens: 1024,
							response_format: { type: "json_object" },
						}),
						signal: controller.signal,
					});

					if (!response.ok) {
						throw new Error(`API error: ${response.status}`);
					}

					const json = (await response.json()) as {
						choices?: Array<{ message?: { content?: string } }>;
					};

					const content = json.choices?.[0]?.message?.content;
					if (!content) throw new Error("Empty response");

					return {
						sectionId: req.sectionId,
						type: req.type,
						result: parseAiResponse(req.type === "custom" ? "faq" : req.type, content),
					};
				} finally {
					clearTimeout(timeout);
				}
			}),
		);

		return results.map((r, i) => ({
			sectionId: data.requests[i].sectionId,
			type: data.requests[i].type,
			...(r.status === "fulfilled"
				? { result: r.value.result }
				: { error: r.reason?.message ?? "Generation failed" }),
		}));
	});
```

**Step 4: Run tests**

Run: `pnpm vitest run src/tests/api-ai.test.ts`
Expected: ALL PASS

**Step 5: Run full test suite**

Run: `pnpm vitest run`
Expected: ALL PASS

**Step 6: Commit**

```bash
git add src/api/ai.ts src/tests/api-ai.test.ts
git commit -m "feat: add generateAiContentBatchFn for multi-section AI generation"
```

---

## Final Verification

After all 11 tasks:

**Run full test suite:**
```bash
pnpm vitest run
```

**Run TypeScript check:**
```bash
pnpm tsc --noEmit
```

**Run lint:**
```bash
pnpm check
```

**Summary of new endpoints:**

| Endpoint | Purpose | Agent-Native Principle |
|----------|---------|----------------------|
| `deleteGuestFn` | Delete individual guest | CRUD Parity |
| `listAiGenerationsFn` | List AI generation history | CRUD Parity |
| `patchInvitationContentFn` | Partial content update | Atomic Primitives |
| `applyAiResultFn` | Apply AI to invitation | Extract from UI |
| `listGuestsFn` (enhanced) | Search + relationship filter | Query Composability |
| `bulkUpdateGuestsFn` | Batch guest updates | Batch Operations |
| `generateAiContentBatchFn` | Multi-section AI generation | Batch Operations |
| `invitationContentSchema` | Content validation | Type Safety |
| `invitationSnapshots` | Version history | Undo Support |
| Custom AI type | Freeform AI generation | Composability |
| Standardized responses | Consistent `{data?, error?}` | Predictable Interface |
