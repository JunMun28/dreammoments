# DreamMoments - Architecture & Code Quality Review

**Reviewer**: Senior Developer
**Date**: 2026-02-08
**Scope**: Full codebase architecture, quality, security, and production readiness

---

## Executive Summary

DreamMoments is a well-structured TanStack Start application with a clear domain model and solid use of modern React patterns. However, several critical and high-severity issues must be addressed before production deployment. The most significant concerns are: (1) the dual-storage architecture (localStorage + PostgreSQL) creates data integrity risks and maintenance burden; (2) the editor route is a monolithic 767-line component that's difficult to test and maintain; (3) security gaps in JWT handling, input validation bypass, and missing rate limiting; (4) the auto-save mechanism is synchronous and writes only to localStorage, not to the server.

**Overall Score: 6/10** -- Solid prototype with good foundations but not production-ready.

---

## 1. Architecture

### 1.1 God Component Problem

**Severity: High**
**Location**: `src/routes/editor/$invitationId.tsx` (767 lines, 11 hooks, ~30 state pieces)

The `EditorScreen` component is the largest and most complex in the codebase. It orchestrates 11 custom hooks, manages over 30 state variables and refs, contains inline handler definitions, and renders multiple dialogs with focus traps.

**Issues**:
- Extremely difficult to unit test in isolation
- Any change risks breaking unrelated features
- Hooks are composed at the top level but their interactions create implicit coupling (e.g., `draftRef` is shared between `useEditorState` and `useAutoSave`)
- Conditional returns (`if (!user) return...`) after hook calls are correct for hook ordering but create a long preamble before the actual render
- Duplicate `onFieldBlur` logic exists for both desktop `ContextPanel` (line 468-477) and mobile `MobileAllSectionsPanel` (line 513-528) -- identical validation code copy-pasted

**Recommended Fix**:
- Extract dialog components (`PreviewDialog`, `UpgradeDialog`, `SlugDialog`, `ShortcutsDialog`) into separate files
- Create an `EditorProvider` context that holds the composed state from all hooks, reducing prop drilling
- Deduplicate `onFieldBlur` into a shared handler function
- **Effort**: Medium (2-3 days)

### 1.2 Dual-Storage Architecture (localStorage + PostgreSQL)

**Severity: Critical**
**Location**: Every `src/api/*.ts` file, `src/lib/store.ts`, `src/lib/data.ts`

Every server function follows this pattern:
```
const db = getDbOrNull();
if (db) { /* PostgreSQL path */ }
// Fallback: localStorage/in-memory store
```

This means:
- Every feature must be implemented twice (DB + local), doubling maintenance effort
- The localStorage store (`src/lib/store.ts`) has no data integrity guarantees, no transactions, and no concurrent access safety
- The `useAutoSave` hook (line 35-36 in `useAutoSave.ts`) calls `updateInvitationContent` and `setInvitationVisibility` which write to **localStorage only**, never to the server database
- A user editing on one device won't see changes from another device
- There's no conflict resolution strategy

**Recommended Fix**:
- Pick one storage strategy per environment: require DATABASE_URL in production, allow localStorage only in local dev
- Add a `if (!db) throw new Error("Database required")` guard in production
- Route auto-save through the server function `updateInvitationFn` rather than directly to localStorage
- **Effort**: High (3-5 days)

### 1.3 Separation of Concerns

**Severity: Medium**
**Location**: `src/lib/data.ts` (referenced throughout but not directly read -- inferred from imports)

The `src/lib/data.ts` module appears to be a large "God module" that exports functions like `getCurrentUser`, `createUser`, `updateInvitation`, `publishInvitation`, `submitRsvp`, etc. This mixes:
- Client-side localStorage CRUD
- User session management (`getCurrentUser`, `setCurrentUserId`)
- Invitation lifecycle management
- Guest/RSVP operations
- Analytics tracking

**Recommended Fix**:
- Split into domain-specific modules: `lib/users.ts`, `lib/invitations.ts`, `lib/guests.ts`, `lib/analytics.ts`
- **Effort**: Medium (1-2 days)

---

## 2. State Management

### 2.1 Race Condition: Auto-Save vs. Sync

**Severity: High**
**Location**: `src/components/editor/hooks/useAutoSave.ts:32-39`, `src/routes/editor/$invitationId.tsx:289-294`

The auto-save runs every 30 seconds via `setInterval` (line 43) and reads from `draftRef.current`. Meanwhile, the invitation sync effect (line 289-294) resets the draft when `invitation?.id` changes:

```ts
useEffect(() => {
    if (!invitation) return;
    editor.setDraft(invitation.content);
    ...
}, [invitation?.id, template?.sections[0]?.id]);
```

If auto-save triggers right as a new invitation loads, it could overwrite the new invitation's content with the old draft. The `lastSavedVersionRef` would be stale.

**Recommended Fix**:
- Reset `lastSavedVersionRef` when invitation ID changes
- Add a debounce to auto-save rather than a fixed interval
- Make auto-save async and send to server, not just localStorage
- **Effort**: Medium (1 day)

### 2.2 `useStore` Causes Full Re-renders

**Severity: Medium**
**Location**: `src/lib/store.ts:50-64`

The `useStore` hook stores the entire `Store` object in state and re-renders on every `dm-store` event regardless of which part of the store changed. The selector function runs after re-render, not to prevent it.

```ts
export function useStore<T>(selector: (store: Store) => T) {
    const [store, setStoreState] = useState<Store>(() => getStore());
    // ... listens to ALL store changes
    return selector(store);
}
```

This means every component using `useStore` re-renders whenever **any** store data changes (users, invitations, guests, payments, etc.).

**Recommended Fix**:
- Use `useSyncExternalStore` with a proper selector comparison, or switch to Zustand/Jotai for efficient subscriptions
- Alternatively, memoize with `useRef` to compare previous selector output
- **Effort**: Low (half day)

### 2.3 Undo/Redo History Uses structuredClone

**Severity: Low**
**Location**: `src/components/editor/hooks/useEditorState.ts:78-100`

The history stores up to 20 full copies of `InvitationContent` (line 79: `prev.slice(-19)`) and the future stores up to 20 more. Each state change triggers a `structuredClone` in `setValueByPath` (line 36). For large invitation content with images (base64), this could consume significant memory.

**Recommended Fix**:
- Consider operational transforms or diff-based undo instead of full snapshots
- Or cap content size to prevent memory bloat
- **Effort**: Medium (2 days) -- low priority

---

## 3. API Layer

### 3.1 Input Validators Are Pass-Through

**Severity: High**
**Location**: `src/api/auth.ts:96-97`, `src/api/ai.ts:225-232`

The input validators in `signupFn` and `generateAiContentFn` do **not** actually validate. They accept the typed data and return it unchanged:

```ts
// auth.ts:96
.inputValidator(
    (data: { email: string; password: string; name?: string }) => data,
)
```

This means any JavaScript caller can bypass TypeScript's type system and send malformed data. The TypeScript types only enforce at compile time, not at runtime. While the handler does some validation (e.g., email regex, password length), it's inconsistent -- the `signupFn` validates inside the handler, but the `generateAiContentFn` only checks for a token.

In contrast, `src/api/guests.ts` correctly uses Zod schemas in `inputValidator`.

**Recommended Fix**:
- Use Zod schemas in all input validators, not just some
- Replace pass-through validators in `auth.ts` and `ai.ts` with proper Zod schemas
- **Effort**: Low (half day)

### 3.2 Error Return Types Are Inconsistent

**Severity: Medium**
**Location**: All `src/api/*.ts` files

Some endpoints throw errors, others return `{ error: string }`. Callers must handle both patterns:

```ts
// Throws (ai.ts:277)
throw new Error("AI service is busy...");

// Returns error object (guests.ts:57-58)
return { error: "Invitation not found" };

// Returns success object (auth.ts:281)
return { success: true };
```

This inconsistency makes client-side error handling fragile. The caller in `src/lib/ai.ts` has a try-catch around `generateAiContentFn` (line 31-51), but `src/lib/auth.tsx` checks for `"error" in result` (line 162).

**Recommended Fix**:
- Standardize on a single error pattern: either always throw (let TanStack Start handle it) or always return discriminated union types
- Create a shared `ApiResult<T> = { data: T } | { error: string }` type
- **Effort**: Medium (1 day)

### 3.3 Missing `userId: "placeholder"` Pattern

**Severity: Medium**
**Location**: `src/api/guests.ts:38`, `src/api/invitations.ts:98`, and others

Multiple API functions pass `userId: "placeholder"` to Zod validation because the real userId isn't known until after `requireAuth()`:

```ts
const result = listGuestsSchema.safeParse({
    invitationId: data.invitationId,
    userId: "placeholder",  // <-- not the real user ID
    filter: data.filter,
});
```

This defeats the purpose of the schema validation for the `userId` field.

**Recommended Fix**:
- Split schemas into "input" (what the client sends) and "internal" (with userId from auth)
- Remove `userId` from client-facing schemas; add it in the handler after authentication
- **Effort**: Low (1 day)

---

## 4. Database

### 4.1 No Database Migrations in Version Control

**Severity: High**
**Location**: Project root (no `drizzle/` migration directory found in git status)

While the project has `pnpm db:generate` and `pnpm db:migrate` scripts, there's no evidence of committed migration files. In production, schema changes need deterministic, versioned migrations.

**Recommended Fix**:
- Run `pnpm db:generate` and commit the resulting migration files
- Add migration execution to CI/CD pipeline
- **Effort**: Low (half day)

### 4.2 JSONB Columns Without Schema Validation

**Severity: Medium**
**Location**: `src/db/schema.ts:40-43`

The `content`, `sectionVisibility`, `designOverrides`, and `templateSnapshot` columns are typed as `jsonb` with `.$type<Record<string, unknown>>()`. This provides TypeScript types but zero runtime validation at the database level.

Malformed JSON could be inserted and would only cause errors when read and rendered. The `content` column is especially critical -- it drives the entire template rendering.

**Recommended Fix**:
- Add Zod validation in the API layer before writing to JSONB columns
- Consider a content schema that matches `InvitationContent` type
- **Effort**: Medium (1-2 days)

### 4.3 Connection Pool Module-Level Side Effect

**Severity: Medium**
**Location**: `src/db/index.ts:53-68`

The database connection pool is created at **module load time** via a top-level `if` block. This means:
- The pool is created even if no database query ever executes
- Error handling is limited to a `pool.on("error")` listener
- If `DATABASE_URL` is misconfigured, the error may not surface until the first query

```ts
if (isServer && poolConfig) {
    pool = new Pool(poolConfig);
    pool.on("error", (err) => { ... });
}
```

**Recommended Fix**:
- Use lazy initialization: create the pool on first `getDb()` call
- Add connection verification in a startup hook
- **Effort**: Low (half day)

---

## 5. Type Safety

### 5.1 Excessive `as` Type Assertions

**Severity: Medium**
**Location**: Throughout the codebase

Numerous unsafe type assertions bypass TypeScript's type checking:

- `src/routes/editor/$invitationId.tsx:244`: `(invitation?.designOverrides ?? {}) as Record<string, string>`
- `src/api/invitations.ts:144`: `content as unknown as Record<string, unknown>`
- `src/lib/auth.tsx:97`: `result.user as User`
- `src/api/ai.ts:211`: `parsed.cssVars as Record<string, string>`
- `src/components/editor/hooks/useAiAssistant.ts:115`: `result as Record<string, unknown>`

Each `as` assertion is a potential runtime type mismatch that TypeScript can't catch.

**Recommended Fix**:
- Use Zod's `parse()` or `safeParse()` at boundaries where data shapes are uncertain
- Replace `as unknown as X` double-assertions with proper type narrowing
- **Effort**: Medium (1-2 days)

### 5.2 Template Type System Is Well-Designed

**Severity: N/A (Positive Finding)**
**Location**: `src/templates/types.ts`

The template configuration types (`TemplateConfig`, `SectionConfig`, `FieldConfig`) are well-structured with clear discriminated unions for section types and field types. The `FieldAiTaskType` mapping is clean. This is one of the strongest typed parts of the codebase.

---

## 6. Performance

### 6.1 Google Fonts Loading Blocks Render

**Severity: Medium**
**Location**: `src/routes/__root.tsx:52`

A single `<link rel="stylesheet">` loads **8 font families** in one request:
```
Outfit, Reenie Beanie, Noto Serif SC, Cormorant Garamond, Lato,
Sacramento, Pinyon Script, Playfair Display, Inter
```

This is a render-blocking resource. Even with `display=swap`, the stylesheet fetch blocks initial paint.

**Recommended Fix**:
- Only load fonts needed for the current template (lazy-load per template)
- Use `<link rel="preload">` for critical fonts, load others async
- Self-host fonts to eliminate third-party dependency
- **Effort**: Medium (1 day)

### 6.2 No Lazy Loading for Editor Components

**Severity: Medium**
**Location**: `src/routes/editor/$invitationId.tsx:16-57`

The editor imports ~20 components eagerly at the top of the file. Components like `AiAssistantDrawer`, `InlineEditOverlay`, `MobileAllSectionsPanel`, and all dialog overlays are only conditionally rendered but always loaded.

**Recommended Fix**:
- Use `React.lazy()` for drawer/dialog components that aren't visible on initial load
- Bundle split the AI assistant separately since it includes AI prompt logic
- **Effort**: Low (half day)

### 6.3 `structuredClone` on Every Field Change

**Severity: Low**
**Location**: `src/components/editor/hooks/useEditorState.ts:36`

`setValueByPath` calls `structuredClone(content)` on every keystroke (via `handleFieldChange`). For typical invitation content this is fine, but if content includes large base64 image strings or deeply nested objects, this could become noticeable.

**Recommended Fix**:
- Consider Immer for immutable updates instead of full clones
- Or debounce field changes before committing to the undo stack
- **Effort**: Low (half day)

---

## 7. Security

### 7.1 JWT Token Stored in localStorage

**Severity: High**
**Location**: `src/lib/auth.tsx:20-32`

JWT tokens are stored in `localStorage` under key `dm-auth-token`. This is vulnerable to XSS attacks -- any injected script can read `localStorage.getItem("dm-auth-token")` and exfiltrate the token.

```ts
const TOKEN_KEY = "dm-auth-token";
function getStoredToken(): string | null {
    return window.localStorage.getItem(TOKEN_KEY);
}
```

**Recommended Fix**:
- Use `httpOnly` cookies for JWT storage (set via the server function's response headers)
- If localStorage must be used, implement token rotation and short expiry (current: 7 days is too long for localStorage)
- **Effort**: High (2-3 days)

### 7.2 No JWT Revocation / Blocklist

**Severity: High**
**Location**: `src/api/auth.ts:276-283`

The logout function is a no-op on the server:
```ts
export const logoutFn = createServerFn({ method: "POST" }).handler(
    async (): Promise<{ success: boolean }> => {
        return { success: true };
    },
);
```

A stolen token remains valid for the full 7-day expiry. There's no way to force-logout a compromised session.

**Recommended Fix**:
- Implement a Redis-backed token blocklist
- Or use short-lived access tokens (15 min) + refresh token rotation
- **Effort**: High (2-3 days)

### 7.3 Dev-Only Secret Fallback

**Severity: High**
**Location**: `src/lib/session.ts:9-15`

```ts
if (!secret) {
    if (process.env.NODE_ENV === "production") {
        throw new Error("[Session] FATAL: JWT_SECRET is required in production.");
    }
    return new TextEncoder().encode("dev-secret-change-in-production");
}
```

While this correctly throws in production, the hardcoded dev secret means **all dev JWTs are signed with the same key**. If NODE_ENV is accidentally not set to "production" in deployment, all sessions share a known secret.

**Recommended Fix**:
- Add a startup check that verifies `JWT_SECRET` length >= 32 characters
- Use a random ephemeral secret in dev instead of a hardcoded one
- **Effort**: Low (1 hour)

### 7.4 Password Reset Requires No Verification

**Severity: Critical**
**Location**: `src/api/auth.ts:568-614`

The `resetPasswordFn` accepts an email and new password with **no verification** (no email token, no OTP, no current password check):

```ts
export const resetPasswordFn = createServerFn({ method: "POST" })
    .inputValidator((data: { email: string; password: string }) => data)
    .handler(async ({ data }): Promise<{ success: boolean } | AuthError> => {
        // ... directly updates the password
        await db.update(schema.users)
            .set({ passwordHash, updatedAt: new Date() })
            .where(eq(schema.users.id, row.id));
        return { success: true };
    });
```

**Anyone can reset any user's password by knowing their email address.**

**Recommended Fix**:
- Implement email verification flow: send a time-limited token to the user's email, require that token for reset
- Or require current password for password change (separate from "forgot password")
- **Effort**: High (2-3 days) -- **Must fix before production**

### 7.5 No Rate Limiting on Authentication Endpoints

**Severity: High**
**Location**: `src/api/auth.ts` (all endpoints)

There's no rate limiting on `loginFn`, `signupFn`, or `resetPasswordFn`. An attacker can brute-force passwords or spam account creation.

**Recommended Fix**:
- Add rate limiting middleware (e.g., per-IP limits via Redis or in-memory with `Map`)
- Implement account lockout after N failed login attempts
- Add CAPTCHA for signup
- **Effort**: Medium (1-2 days)

### 7.6 RSVP Endpoint Has No Rate Limiting

**Severity: Medium**
**Location**: `src/api/guests.ts:108-204`

The `submitRsvpFn` is public (no auth required) and has no rate limiting. An attacker could flood an invitation with fake RSVPs.

**Recommended Fix**:
- Add per-IP rate limiting
- Consider CAPTCHA for public RSVP submissions
- The `visitorKey` exists but is client-generated and trivially spoofable
- **Effort**: Medium (1 day)

### 7.7 AI Prompt Injection

**Severity: Medium**
**Location**: `src/api/ai.ts:97-130`

User prompts are passed directly to the LLM without sanitization:

```ts
function buildUserPrompt(data: AiRequestData): string {
    return `${data.prompt}${contextSection}`;
}
```

A malicious user could craft prompts that override system instructions or extract sensitive information from the system prompt.

**Recommended Fix**:
- Sanitize/escape user input before including in prompts
- Use structured API features (tool use, JSON mode) to constrain outputs
- Limit prompt length (currently uncapped)
- **Effort**: Low (half day)

### 7.8 Open Redirect in Google OAuth State

**Severity: Medium**
**Location**: `src/lib/auth.tsx:135-136`

The `state` parameter in the Google OAuth flow is set to `sanitizeRedirect(redirectTo)`. Without seeing the `sanitizeRedirect` implementation, this could allow open redirects if the function doesn't properly validate the target URL.

**Recommended Fix**:
- Ensure `sanitizeRedirect` only allows relative paths or a whitelist of domains
- **Effort**: Low (verify existing implementation)

---

## 8. Error Handling

### 8.1 Silent Error Swallowing

**Severity: Medium**
**Location**: Multiple files

Several catch blocks silently swallow errors:

- `src/lib/auth.tsx:111`: `catch { /* Server function unavailable, fall back to localStorage */ }`
- `src/lib/auth.tsx:175`: `catch { return signUpWithEmailFallback(...) }`
- `src/lib/auth.tsx:209`: `catch { return signInWithEmailFallback(...) }`
- `src/lib/ai.ts:49`: `console.warn("AI generation failed, using mock data:", error)`

The auth fallback pattern is especially dangerous: if the server returns a validation error, the client silently falls back to localStorage auth which has different (weaker) validation.

**Recommended Fix**:
- Distinguish between network errors (fallback appropriate) and validation/auth errors (should surface to user)
- Add error logging/monitoring integration (Sentry, etc.)
- **Effort**: Medium (1 day)

### 8.2 Error Boundaries Exist but Are Minimal

**Severity: Low**
**Location**: `src/routes/__root.tsx:65-90`, `src/routes/editor/$invitationId.tsx:59-92`

Both root and editor routes have error components, which is good. However:
- They only show in DEV mode details
- No error reporting to a monitoring service
- No way for the user to provide context about what happened

**Recommended Fix**:
- Add error reporting service integration
- In production, show a user-friendly message with a support link
- **Effort**: Low (half day)

---

## 9. Testing

### 9.1 No Unit Tests for Server Functions

**Severity: High**
**Location**: `src/api/*.ts`

The server functions (`auth.ts`, `ai.ts`, `guests.ts`, `invitations.ts`, `public.ts`) contain critical business logic but have no unit test coverage. These are the most important code paths to test:
- Authentication flow (signup, login, OAuth)
- Authorization checks (invitation ownership)
- Input validation
- AI content parsing and fallback

**Recommended Fix**:
- Add Vitest tests for each server function, mocking the database
- Test both DB and fallback code paths
- Test validation edge cases
- **Effort**: High (3-5 days)

### 9.2 No Integration Tests for Editor

**Severity: High**
**Location**: `src/routes/editor/$invitationId.tsx`

The editor is the core feature but has no integration tests verifying:
- Auto-save triggers correctly
- Undo/redo works across field changes
- AI generation flow from prompt to applied result
- Mobile bottom sheet interactions
- Section navigation syncs between form and preview

**Recommended Fix**:
- Write Playwright E2E tests for critical editor workflows
- Add component-level integration tests with Testing Library for hook composition
- **Effort**: High (3-5 days)

### 9.3 Hook Tests Missing

**Severity: Medium**
**Location**: `src/components/editor/hooks/`

The 11 custom hooks contain complex state management logic but have no tests:
- `useEditorState`: undo/redo correctness, field path traversal
- `useAutoSave`: timing, save-on-unload behavior
- `useAiAssistant`: state machine transitions, error handling
- `useFocusTrap`: keyboard navigation correctness

**Recommended Fix**:
- Test each hook with `renderHook` from Testing Library
- **Effort**: Medium (2-3 days)

---

## 10. Dependencies

### 10.1 `nitro: "npm:nitro-nightly@latest"`

**Severity: High**
**Location**: `package.json:48`

Using `nightly` builds of a critical dependency (the SSR server) in production is extremely risky:
- No stability guarantees
- Could break on any `pnpm install`
- No security audit trail

**Recommended Fix**:
- Pin to a stable Nitro version
- If nightly features are needed, pin to a specific nightly version hash
- **Effort**: Low (immediate)

### 10.2 `drizzle-kit` Is a Dev Dependency in `dependencies`

**Severity: Low**
**Location**: `package.json:43`

`drizzle-kit` is a CLI tool for migrations and should be in `devDependencies`, not `dependencies`. It adds unnecessary weight to the production bundle.

**Recommended Fix**:
- Move `drizzle-kit` to `devDependencies`
- **Effort**: Trivial

### 10.3 Unused/Overlapping Dependencies

**Severity: Low**
**Location**: `package.json`

- `class-variance-authority` is listed but no CVA usage was found in the reviewed files
- Both `@tanstack/react-devtools` and individual devtools packages are included
- `tw-animate-css` alongside `motion` -- potential overlap in animation functionality

**Recommended Fix**:
- Audit and remove unused dependencies
- **Effort**: Low (1 hour)

---

## 11. Production Readiness Checklist

### Must Fix (Blockers)

| # | Issue | Severity | Effort |
|---|-------|----------|--------|
| 1 | Password reset requires no verification (7.4) | Critical | High |
| 2 | Dual-storage architecture needs production guard (1.2) | Critical | High |
| 3 | JWT in localStorage with no revocation (7.1, 7.2) | High | High |
| 4 | No rate limiting on auth endpoints (7.5) | High | Medium |
| 5 | Input validators are pass-through in auth/AI (3.1) | High | Low |
| 6 | Nitro nightly dependency (10.1) | High | Low |
| 7 | Auto-save writes to localStorage only, not server (1.2) | High | Medium |
| 8 | No unit tests for server functions (9.1) | High | High |
| 9 | Database migrations not in version control (4.1) | High | Low |

### Should Fix (Pre-Launch)

| # | Issue | Severity | Effort |
|---|-------|----------|--------|
| 10 | Race condition in auto-save vs sync (2.1) | High | Medium |
| 11 | Editor god component decomposition (1.1) | High | Medium |
| 12 | RSVP rate limiting (7.6) | Medium | Medium |
| 13 | AI prompt injection mitigation (7.7) | Medium | Low |
| 14 | Error handling inconsistencies (3.2, 8.1) | Medium | Medium |
| 15 | Font loading performance (6.1) | Medium | Medium |
| 16 | JSONB schema validation (4.2) | Medium | Medium |
| 17 | Editor integration tests (9.2) | High | High |

### Nice to Have (Post-Launch)

| # | Issue | Severity | Effort |
|---|-------|----------|--------|
| 18 | `useStore` re-render optimization (2.2) | Medium | Low |
| 19 | Lazy loading for editor components (6.2) | Medium | Low |
| 20 | Type assertion cleanup (5.1) | Medium | Medium |
| 21 | Undo history memory optimization (2.3) | Low | Medium |
| 22 | `data.ts` module decomposition (1.3) | Medium | Medium |
| 23 | Error monitoring integration (8.2) | Low | Low |
| 24 | Dependency cleanup (10.2, 10.3) | Low | Low |

---

## Positive Findings

1. **Template type system** (`src/templates/types.ts`): Clean, well-typed discriminated unions for template configuration. The `FieldConfig` with `aiTaskType` linkage is elegant.

2. **Server function pattern**: The `createServerFn` usage from TanStack Start provides good type safety between client and server. The pattern of `requireAuth()` as the first handler call is consistent.

3. **Accessibility**: Focus traps for all dialogs, skip-to-content link, `aria-modal` and `aria-label` attributes, `focus-visible` states. This is better than most early-stage projects.

4. **Error boundaries**: Both root and editor routes have error components with recovery actions.

5. **Hook extraction**: Complex logic is extracted into custom hooks (`useEditorState`, `useAutoSave`, `useAiAssistant`, etc.) rather than being inline. The composability is good.

6. **Session refresh**: The JWT refresh logic in `session.ts` is well-implemented -- refreshing tokens within 1 day of expiry.

7. **AI fallback**: The graceful degradation from real AI to mock content (`src/lib/ai.ts`) ensures the product works even without AI configuration.

8. **Database schema**: Proper use of UUID primary keys, foreign keys with cascade deletes, and appropriate indexes. The `invitationViews` table has a date index for analytics queries.

9. **Zod validation**: Present and well-structured for guest/RSVP operations. Just needs to be extended to auth and AI endpoints.

10. **bcrypt cost factor**: Using cost 12 for password hashing is appropriate for production.

---

## Summary of Estimated Effort

| Priority | Total Effort |
|----------|-------------|
| Must Fix (blockers) | ~10-15 dev days |
| Should Fix (pre-launch) | ~8-12 dev days |
| Nice to Have (post-launch) | ~5-7 dev days |

**Recommendation**: Address all "Must Fix" items before any production deployment. The password reset vulnerability (7.4) and dual-storage architecture (1.2) are the two most urgent items.
