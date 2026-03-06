# Clerk Auth Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the hand-rolled JWT/bcrypt/Google OAuth auth system with Clerk managed authentication using `@clerk/tanstack-react-start`.

**Architecture:** Clerk handles all authentication (sign-in, sign-up, session management, Google OAuth). Server functions use `auth()` from Clerk instead of manual JWT verification. A "just-in-time" pattern syncs Clerk users to the existing `users` DB table on first API call. All auth routes and custom auth UI are deleted; Clerk's Account Portal handles the sign-in/sign-up flow.

**Tech Stack:** `@clerk/tanstack-react-start`, Drizzle ORM, TanStack Start, TanStack Router, TanStack Query

---

### Task 1: Install Clerk SDK and configure environment

**Files:**
- Modify: `package.json`
- Modify: `.env.local`

**Step 1: Install Clerk SDK**

Run: `pnpm add @clerk/tanstack-react-start`

**Step 2: Remove old auth dependencies**

Run: `pnpm remove bcryptjs jose @types/bcryptjs`

**Step 3: Add Clerk keys to `.env.local`**

Add these two lines to `.env.local`:

```
CLERK_PUBLISHABLE_KEY=pk_test_dGhhbmtmdWwtd29sZi04MS5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_7LwnjVihmeulokusNIRiz1HatLumSxn3CJaNSXBIzx
```

**Step 4: Verify install**

Run: `pnpm exec tsc --noEmit` (may have errors from removed deps — that's expected, we fix those next)

**Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml .env.local
git commit -m "chore: install @clerk/tanstack-react-start, remove bcryptjs/jose"
```

---

### Task 2: Database schema migration — add clerkId, drop auth columns/tables

**Files:**
- Modify: `src/db/schema.ts:14-24` (users table)
- Modify: `src/db/schema.ts:134-163` (drop passwordResetTokens, tokenBlocklist)
- Modify: `src/lib/types.ts:1-17` (User interface)

**Step 1: Update users table schema**

In `src/db/schema.ts`, replace the `users` table definition (lines 14-24) with:

```typescript
export const users = pgTable("users", {
	id: uuid("id").defaultRandom().primaryKey(),
	clerkId: varchar("clerk_id", { length: 255 }).notNull().unique(),
	email: varchar("email", { length: 255 }).notNull(),
	name: varchar("name", { length: 255 }),
	avatarUrl: text("avatar_url"),
	plan: varchar("plan", { length: 20 }).default("free"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

Changes: Added `clerkId` (unique, not null). Removed `passwordHash`, `authProvider`. Removed unique constraint on `email` (Clerk manages uniqueness).

**Step 2: Remove passwordResetTokens and tokenBlocklist tables**

Delete the `passwordResetTokens` table definition (lines 134-150) and `tokenBlocklist` table definition (lines 152-163) from `src/db/schema.ts`.

**Step 3: Update User interface**

In `src/lib/types.ts`, replace the `User` interface and remove `AuthProvider` type:

```typescript
export type PlanTier = "free" | "premium";
export type InvitationStatus = "draft" | "published" | "archived";
export type AttendanceStatus = "attending" | "not_attending" | "undecided";
export type PaymentStatus = "pending" | "succeeded" | "failed";
export type DeviceType = "mobile" | "tablet" | "desktop";

export interface User {
	id: string;
	clerkId: string;
	email: string;
	name?: string;
	avatarUrl?: string;
	plan: PlanTier;
	createdAt: string;
	updatedAt: string;
}
```

**Step 4: Generate migration**

Run: `pnpm db:generate`

This will generate a new migration file in `drizzle/`. Review it to ensure it:
- Adds `clerk_id` column
- Drops `password_hash` and `auth_provider` columns
- Drops `password_reset_tokens` and `token_blocklist` tables

**Step 5: Run migration**

Run: `pnpm db:push`

**Step 6: Commit**

```bash
git add src/db/schema.ts src/lib/types.ts drizzle/
git commit -m "feat(auth): update schema for Clerk — add clerkId, drop auth tables"
```

---

### Task 3: Add Clerk middleware (`start.ts`)

**Files:**
- Create: `src/start.ts`

**Step 1: Create `src/start.ts`**

```typescript
import { clerkMiddleware } from "@clerk/tanstack-react-start/server";
import { createStart } from "@tanstack/react-start";

export const startInstance = createStart(() => ({
	requestMiddleware: [clerkMiddleware()],
}));
```

**Step 2: Commit**

```bash
git add src/start.ts
git commit -m "feat(auth): add Clerk middleware via start.ts"
```

---

### Task 4: Rewrite `requireAuth` to use Clerk

**Files:**
- Modify: `src/lib/server-auth.ts` (complete rewrite)

**Step 1: Rewrite `src/lib/server-auth.ts`**

Replace the entire file with:

```typescript
import { auth, clerkClient } from "@clerk/tanstack-react-start/server";
import { eq } from "drizzle-orm";
import { getDbOrNull, schema } from "@/db/index";
import type { User } from "./types";

/**
 * Verify the Clerk session and return the authenticated user from DB.
 * Creates a DB record on first encounter (just-in-time sync).
 */
export async function requireAuth(): Promise<{ userId: string; user: User }> {
	const { userId: clerkUserId } = await auth();
	if (!clerkUserId) {
		throw new Error("Authentication required");
	}

	const db = getDbOrNull();
	if (!db) throw new Error("Database connection required");

	// Look up existing user by Clerk ID
	const [existing] = await db
		.select()
		.from(schema.users)
		.where(eq(schema.users.clerkId, clerkUserId));

	if (existing) {
		return {
			userId: existing.id,
			user: dbRowToUser(existing),
		};
	}

	// First encounter — create user from Clerk profile
	const clerkUser = await clerkClient().users.getUser(clerkUserId);
	const email =
		clerkUser.emailAddresses.find(
			(e) => e.id === clerkUser.primaryEmailAddressId,
		)?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

	if (!email) throw new Error("No email found on Clerk user");

	const [created] = await db
		.insert(schema.users)
		.values({
			clerkId: clerkUserId,
			email,
			name:
				[clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
				undefined,
			avatarUrl: clerkUser.imageUrl || undefined,
			plan: "free",
		})
		.returning();

	return {
		userId: created.id,
		user: dbRowToUser(created),
	};
}

function dbRowToUser(row: typeof schema.users.$inferSelect): User {
	return {
		id: row.id,
		clerkId: row.clerkId,
		email: row.email,
		name: row.name ?? undefined,
		avatarUrl: row.avatarUrl ?? undefined,
		plan: (row.plan as "free" | "premium") ?? "free",
		createdAt: row.createdAt.toISOString(),
		updatedAt: row.updatedAt.toISOString(),
	};
}
```

**Step 2: Verify types compile**

Run: `pnpm exec tsc --noEmit` (expect errors in files still importing old auth — that's fine, we fix those next)

**Step 3: Commit**

```bash
git add src/lib/server-auth.ts
git commit -m "feat(auth): rewrite requireAuth to use Clerk auth()"
```

---

### Task 5: Strip `token` parameter from all server functions and hooks

This is the largest task. Every server function currently takes `token` as input and passes it to `requireAuth(data.token)`. With Clerk, `requireAuth()` reads from the request context (cookies), so the `token` parameter must be removed everywhere.

**Files:**
- Modify: `src/api/invitations.ts` — remove `token` from all schemas and handler calls
- Modify: `src/api/guests.ts` — same
- Modify: `src/api/ai.ts` — same
- Modify: `src/api/ai-animation.ts` — same
- Modify: `src/api/ai-avatar.ts` — same
- Modify: `src/api/payments.ts` — same
- Modify: `src/api/analytics.ts` — same
- Modify: `src/api/storage.ts` — same
- Modify: `src/hooks/useInvitations.ts` — remove all token passing
- Modify: `src/lib/validation.ts` — remove token from validation schemas

**Step 1: Update all API files**

In every API file listed above, make these changes:

1. Change `requireAuth(data.token)` → `requireAuth()` (no arguments)
2. Remove `token: z.string().min(1, ...)` from all zod schemas
3. Remove `token` from `inputValidator` type annotations
4. Remove the `import { ... } from "@/lib/auth-cookies"` and `import { verifySession } from "./session"` if present

Example pattern — in `src/api/invitations.ts`:

Before:
```typescript
const getInvitationsSchema = z.object({
	token: z.string().min(1, "Token is required"),
});
// ...
.inputValidator((data: { token: string }) => parseInput(getInvitationsSchema, data))
.handler(async ({ data }) => {
	const { userId } = await requireAuth(data.token);
```

After:
```typescript
const getInvitationsSchema = z.object({});
// ...
.inputValidator((data: Record<string, never>) => parseInput(getInvitationsSchema, data))
.handler(async () => {
	const { userId } = await requireAuth();
```

For schemas that have fields besides `token`, just remove the `token` field:

Before:
```typescript
const checkSlugSchema = z.object({
	token: z.string().min(1, "Token is required"),
	slug: z.string().min(1, "Slug is required"),
	invitationId: z.string().optional(),
});
```

After:
```typescript
const checkSlugSchema = z.object({
	slug: z.string().min(1, "Slug is required"),
	invitationId: z.string().optional(),
});
```

**Step 2: Update `src/hooks/useInvitations.ts`**

Remove all token management:

1. Delete the `TOKEN_KEY` constant and `getToken()` function (lines 24-29)
2. In every hook, remove `const token = getToken()` and `if (!token)` guards
3. Remove `token` from all `{ data: { ... } }` objects passed to server functions
4. Remove `enabled: !!token` from query options (or replace with `true`)

Example pattern:

Before:
```typescript
export function useInvitations() {
	const token = getToken();
	return useQuery({
		queryKey: invitationKeys.all,
		queryFn: async () => {
			if (!token) return [];
			const result = await getInvitations({ data: { token } });
			// ...
		},
		enabled: !!token,
	});
}
```

After:
```typescript
export function useInvitations() {
	return useQuery({
		queryKey: invitationKeys.all,
		queryFn: async () => {
			const result = await getInvitations({ data: {} });
			// ...
		},
	});
}
```

For mutations, remove `token` from data objects:

Before:
```typescript
const result = await createInvitationFn({ data: { token, templateId } });
```

After:
```typescript
const result = await createInvitationFn({ data: { templateId } });
```

**Step 3: Update validation schemas**

In `src/lib/validation.ts`, remove `token` from any schemas that include it (e.g. `createInvitationSchema`, `updateInvitationSchema`, etc.).

**Step 4: Verify types compile**

Run: `pnpm exec tsc --noEmit`

**Step 5: Commit**

```bash
git add src/api/ src/hooks/ src/lib/validation.ts
git commit -m "feat(auth): remove token param from all server functions and hooks"
```

---

### Task 6: Replace `AuthProvider` with `ClerkProvider` in root route

**Files:**
- Modify: `src/routes/__root.tsx`

**Step 1: Update imports and provider**

In `src/routes/__root.tsx`:

1. Replace `import { AuthProvider } from "../lib/auth"` with `import { ClerkProvider } from "@clerk/tanstack-react-start"`
2. In `RootDocument`, replace `<AuthProvider>` with `<ClerkProvider>`
3. Update CSP header to allow Clerk domains

Replace the CSP string (line 42) with:

```typescript
"Content-Security-Policy":
	"default-src 'self'; script-src 'self' 'unsafe-inline' https://*.clerk.accounts.dev; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https: https://img.clerk.com; connect-src 'self' https://*.clerk.accounts.dev https://api.clerk.com; frame-src https://*.clerk.accounts.dev; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
```

**Step 2: Commit**

```bash
git add src/routes/__root.tsx
git commit -m "feat(auth): replace AuthProvider with ClerkProvider in root"
```

---

### Task 7: Update Header component to use Clerk

**Files:**
- Modify: `src/components/Header.tsx`

**Step 1: Rewrite Header**

Replace `useAuth()` from custom auth with Clerk hooks and components:

```typescript
import { SignInButton, SignedIn, SignedOut, UserButton, useUser } from "@clerk/tanstack-react-start";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusTrap } from "./editor/hooks/useFocusTrap";

const navItems = [
	{ label: "Templates", hash: "templates" },
	{ label: "How it works", hash: "process" },
	{ label: "Pricing", hash: "pricing" },
];

export default function Header() {
	const [open, setOpen] = useState(false);
	const { user } = useUser();
	const hamburgerRef = useRef<HTMLButtonElement>(null);
	const menuRef = useRef<HTMLDivElement>(null);

	const closeMenu = useCallback(() => {
		setOpen(false);
		hamburgerRef.current?.focus();
	}, []);

	useFocusTrap(menuRef, {
		enabled: open,
		onEscape: closeMenu,
	});

	useEffect(() => {
		document.body.style.overflow = open ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [open]);

	return (
		<header className="fixed inset-x-0 top-0 z-50 border-b border-dm-border/50 bg-dm-bg/80 backdrop-blur-xl">
			<div className="mx-auto w-full max-w-[1320px] px-6 py-4 lg:px-12">
				<div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
					<Link
						to="/"
						className="font-heading text-[1.65rem] font-semibold leading-none tracking-tight text-dm-ink"
					>
						DreamMoments
					</Link>

					<nav
						aria-label="Main navigation"
						className="hidden items-center justify-center gap-8 text-[11px] uppercase tracking-[0.22em] text-dm-muted md:flex"
					>
						{navItems.map((item) => (
							<Link
								key={item.label}
								to="/"
								hash={item.hash}
								className="dm-nav-link inline-flex items-center min-h-[44px] leading-none transition-colors duration-300 hover:text-dm-ink"
							>
								{item.label}
							</Link>
						))}
					</nav>

					<div className="flex items-center justify-end gap-2">
						<div className="hidden items-center gap-2 md:flex">
							<SignedOut>
								<SignInButton mode="redirect">
									<button
										type="button"
										className="rounded-full inline-flex items-center justify-center border border-dm-border bg-dm-surface/60 px-4 py-2 text-xs font-semibold leading-none text-dm-ink"
									>
										Sign in
									</button>
								</SignInButton>
								<Link
									to="/editor/new"
									search={{ template: "double-happiness" }}
									className="rounded-full inline-flex items-center justify-center bg-dm-ink px-5 py-2.5 text-sm font-semibold leading-none text-white shadow-[0_4px_20px_-2px_rgba(0,0,0,0.12)]"
								>
									Start Free Trial
								</Link>
							</SignedOut>
							<SignedIn>
								{user?.publicMetadata?.plan === "free" || !user?.publicMetadata?.plan ? (
									<Link
										to="/upgrade"
										className="rounded-full inline-flex items-center justify-center border border-dm-peach/40 bg-dm-surface px-4 py-2 text-xs font-semibold leading-none text-dm-ink"
									>
										Upgrade
									</Link>
								) : null}
								<Link
									to="/dashboard"
									className="rounded-full inline-flex items-center justify-center bg-dm-ink px-5 py-2.5 text-sm font-semibold leading-none text-white shadow-[0_4px_20px_-2px_rgba(0,0,0,0.12)]"
								>
									Open App
								</Link>
								<UserButton />
							</SignedIn>
						</div>
						<button
							ref={hamburgerRef}
							type="button"
							onClick={() => setOpen((prev) => !prev)}
							className="rounded-full border border-dm-border bg-dm-surface/60 p-3 text-dm-ink md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dm-peach focus-visible:ring-offset-2"
							aria-label="Toggle navigation"
							aria-expanded={open}
						>
							{open ? (
								<X aria-hidden="true" size={18} />
							) : (
								<Menu aria-hidden="true" size={18} />
							)}
						</button>
					</div>
				</div>
			</div>
			{/* Mobile menu - same pattern with SignedIn/SignedOut */}
			{open && (
				<>
					<div
						className="fixed inset-0 top-[65px] bg-black/30 backdrop-blur-sm md:hidden"
						onClick={closeMenu}
						aria-hidden="true"
					/>
					<div
						ref={menuRef}
						role="dialog"
						aria-modal="true"
						className="relative border-t border-dm-border bg-dm-bg md:hidden"
					>
						<div className="mx-auto flex max-w-[1320px] flex-col gap-3 px-6 py-4 text-sm text-dm-muted">
							{navItems.map((item) => (
								<Link
									key={item.label}
									to="/"
									hash={item.hash}
									className="dm-nav-link inline-flex items-center min-h-[44px] text-[11px] uppercase tracking-[0.22em] leading-none transition-colors duration-300 hover:text-dm-ink"
									onClick={closeMenu}
								>
									{item.label}
								</Link>
							))}
							<SignedIn>
								<Link
									to="/dashboard"
									className="rounded-full inline-flex items-center justify-center bg-dm-ink px-4 py-2 text-center text-sm font-semibold leading-none text-white"
									onClick={closeMenu}
								>
									Open App
								</Link>
							</SignedIn>
							<SignedOut>
								<Link
									to="/editor/new"
									search={{ template: "double-happiness" }}
									className="rounded-full inline-flex items-center justify-center bg-dm-ink px-4 py-2 text-center text-sm font-semibold leading-none text-white"
									onClick={closeMenu}
								>
									Start Free Trial
								</Link>
								<SignInButton mode="redirect">
									<button
										type="button"
										className="rounded-full inline-flex items-center justify-center border border-dm-border px-4 py-2 text-xs font-semibold leading-none text-dm-ink"
										onClick={closeMenu}
									>
										Sign in
									</button>
								</SignInButton>
							</SignedOut>
						</div>
					</div>
				</>
			)}
		</header>
	);
}
```

Note: For the `plan` check in the Header, we rely on `user?.publicMetadata?.plan`. Later, you can create a custom hook `useDbUser()` that fetches the DB user via a server function if you need DB fields on the client. For now, the Header just needs to show/hide based on signed-in state.

**Step 2: Commit**

```bash
git add src/components/Header.tsx
git commit -m "feat(auth): rewrite Header with Clerk SignedIn/SignedOut/UserButton"
```

---

### Task 8: Update all client routes that use `useAuth()`

**Files:**
- Modify: `src/routes/dashboard/index.tsx` — replace `useAuth()` with `useUser()` / `useAuth()`
- Modify: `src/routes/dashboard/$invitationId/index.tsx` — same
- Modify: `src/routes/editor/new.tsx` — same
- Modify: `src/routes/editor/canvas/$invitationId.tsx` — same
- Modify: `src/routes/invite/$slug.tsx` — same
- Modify: `src/routes/upgrade/index.tsx` — same
- Modify: `src/routes/upgrade/success.tsx` — same

**Step 1: Apply the pattern to each file**

In every file above:

1. Replace `import { useAuth } from "../../lib/auth"` (or relative path variant) with:
   ```typescript
   import { useAuth, useUser } from "@clerk/tanstack-react-start"
   ```

2. Replace `const { user, loading } = useAuth()` with:
   ```typescript
   const { isLoaded, isSignedIn } = useAuth()
   const { user: clerkUser } = useUser()
   ```

3. Replace `if (loading)` with `if (!isLoaded)`

4. Replace `if (!user)` with `if (!isSignedIn)` — and for redirects to login, use:
   ```typescript
   if (isLoaded && !isSignedIn) return <Navigate to="/" />
   ```

5. Where `user.plan` is checked, note that the DB user plan is not directly available from Clerk. For now, remove plan checks from client routes or fetch via a server function. The plan check mostly appears in:
   - Dashboard (to show upgrade CTA) — can be fetched as part of the dashboard data loader
   - Upgrade page — can fetch from server

6. Where `token` was destructured (e.g., `src/routes/editor/canvas/$invitationId.tsx`), remove it entirely — tokens are no longer passed to API calls.

7. Where `refreshUser` was called (e.g., `src/routes/upgrade/success.tsx`), remove it — Clerk handles session refresh automatically.

**Step 2: Verify types compile**

Run: `pnpm exec tsc --noEmit`

**Step 3: Commit**

```bash
git add src/routes/
git commit -m "feat(auth): migrate all client routes from useAuth to Clerk hooks"
```

---

### Task 9: Delete old auth files

**Files:**
- Delete: `src/api/auth.ts`
- Delete: `src/lib/auth.tsx`
- Delete: `src/lib/session.ts`
- Delete: `src/lib/auth-cookies.ts`
- Delete: `src/lib/auth-errors.ts`
- Delete: `src/lib/auth-redirect.ts`
- Delete: `src/routes/auth/login.tsx`
- Delete: `src/routes/auth/signup.tsx`
- Delete: `src/routes/auth/callback.tsx`
- Delete: `src/routes/auth/reset.tsx`

**Step 1: Delete files**

```bash
rm src/api/auth.ts
rm src/lib/auth.tsx
rm src/lib/session.ts
rm src/lib/auth-cookies.ts
rm src/lib/auth-errors.ts
rm src/lib/auth-redirect.ts
rm src/routes/auth/login.tsx
rm src/routes/auth/signup.tsx
rm src/routes/auth/callback.tsx
rm src/routes/auth/reset.tsx
```

**Step 2: Remove any remaining imports of deleted files**

Search for and remove any remaining imports:
- `from "@/api/auth"` or `from "../../api/auth"`
- `from "@/lib/auth"` or `from "../../lib/auth"`
- `from "@/lib/session"`
- `from "@/lib/auth-cookies"`
- `from "@/lib/auth-errors"`
- `from "@/lib/auth-redirect"`

**Step 3: Verify types compile**

Run: `pnpm exec tsc --noEmit`

**Step 4: Commit**

```bash
git add -A
git commit -m "chore(auth): delete old custom auth files (replaced by Clerk)"
```

---

### Task 10: Update tests

**Files:**
- Modify: `src/tests/api-invitations.test.ts`
- Modify: `src/tests/api-guests.test.ts`
- Modify: `src/tests/api-payments.test.ts`
- Modify: `src/tests/api-ai.test.ts`
- Modify: `src/tests/api-analytics.test.ts`
- Modify: `src/tests/authorization.test.ts`
- Modify: `src/tests/lib-server-auth.test.ts`

**Step 1: Update test mocks**

All tests that mock `requireAuth` need to be updated. The old pattern mocked the JWT verification; the new pattern should mock the Clerk `auth()` function.

Mock pattern:

```typescript
vi.mock("@clerk/tanstack-react-start/server", () => ({
	auth: vi.fn().mockResolvedValue({ userId: "clerk_test_user_id" }),
	clerkClient: vi.fn().mockReturnValue({
		users: {
			getUser: vi.fn().mockResolvedValue({
				id: "clerk_test_user_id",
				emailAddresses: [{ id: "email_1", emailAddress: "test@example.com" }],
				primaryEmailAddressId: "email_1",
				firstName: "Test",
				lastName: "User",
				imageUrl: null,
			}),
		},
	}),
}));
```

Also update any test that passes `token` in test data — remove the `token` field.

**Step 2: Rewrite `lib-server-auth.test.ts`**

This test should now verify the JIT user creation pattern:
- When `auth()` returns a userId and user exists in DB → returns existing user
- When `auth()` returns a userId but user doesn't exist → creates user via `clerkClient().users.getUser()`
- When `auth()` returns no userId → throws "Authentication required"

**Step 3: Run tests**

Run: `pnpm test --run`

**Step 4: Commit**

```bash
git add src/tests/
git commit -m "test(auth): update all test mocks for Clerk auth"
```

---

### Task 11: Clean up — verify full build and lint

**Step 1: Run pre-commit checks**

```bash
pnpm check                  # Biome lint + format
pnpm exec tsc --noEmit      # TypeScript type check
pnpm test --run             # Unit tests
pnpm build                  # Production build
```

**Step 2: Fix any remaining issues**

Common issues to watch for:
- Stale imports of deleted files
- `token` still referenced somewhere
- `authProvider` referenced in queries or components
- CSP blocking Clerk iframes/scripts (check browser console)

**Step 3: Final commit**

```bash
git add -A
git commit -m "chore(auth): complete Clerk migration — all checks passing"
```

---

### Task 12: Smoke test in browser

**Step 1: Start dev server**

Run: `pnpm dev`

**Step 2: Verify these flows work**

1. Visit `http://localhost:3000` — landing page loads without errors
2. Click "Sign in" — redirects to Clerk Account Portal
3. Sign in with Google — creates account, redirects back
4. Visit `/dashboard` — shows user's invitations (or empty state)
5. Create a new invitation — works without token errors
6. Click UserButton avatar — shows Clerk account management dropdown
7. Sign out via UserButton — returns to landing page
8. Check browser console for CSP violations or errors
