# DreamMoments Code Review Report

**Reviewer**: Code Quality Reviewer (Automated)
**Date**: 2026-02-08
**Scope**: Full codebase review across all modules

---

## Executive Summary

DreamMoments is an early-stage wedding invitation SaaS with a well-structured frontend architecture and a pragmatic approach to iterative development. The codebase demonstrates good understanding of React 19 patterns, sensible component decomposition, and a robust accessibility foundation. However, there are **critical security issues** in the authentication layer (password hashing not persisted to the database, hardcoded JWT secret fallback), significant **type safety gaps** from excessive `as` casts on JSONB fields, and a **dual data layer** (localStorage fallback + PostgreSQL) that creates substantial code duplication and maintenance burden. The editor route file at 725 lines is the largest complexity hotspot and would benefit from extraction. Overall, the project is in a solid position for a pre-launch product, with the auth/security issues being the highest priority items to address before any production deployment.

---

## Code Quality Scorecard

| Aspect                      | Score | Notes |
|-----------------------------|-------|-------|
| **Architecture & Structure** | 7/10  | Clean separation of concerns; file-based routing well-utilized; dual data layer adds complexity |
| **React Patterns**           | 8/10  | Proper hooks usage, good component decomposition, appropriate memoization |
| **TypeScript Usage**         | 6/10  | Strong base types, but excessive `as` casts bypass safety; JSONB fields weakly typed |
| **Security**                 | 4/10  | Critical auth gaps: no password column in DB, hardcoded JWT fallback, no CSRF, no rate limiting on server |
| **Error Handling**           | 6/10  | Consistent error return pattern in API, but many silent `catch {}` blocks swallow context |
| **Accessibility**            | 8/10  | Skip link, ARIA labels, focus traps, focus-visible states, semantic HTML -- strong foundation |
| **Performance**              | 7/10  | Appropriate lazy loading, memoization; some potential for unnecessary re-renders in editor |
| **Code Duplication**         | 5/10  | Major duplication between DB and localStorage paths in every API handler |
| **Testing**                  | 6/10  | Good E2E coverage; unit tests exist but are sparse for business logic and hooks |
| **Maintainability**          | 6/10  | Generally readable; editor route is too large; deep type casts hinder refactoring |

**Overall: 6.3/10** -- Solid early-stage codebase with addressable issues.

---

## Security Review Findings

### CRITICAL

1. **No password hash column in database** (`src/api/auth.ts:218-223`)
   The `signupFn` hashes the password but never stores it in the database. The `loginFn` with a DB connection always returns: `"Password verification unavailable for this account."` This means email/password login is completely broken when PostgreSQL is available. The users table schema (`src/db/schema.ts`) has no `passwordHash` column.

2. **Hardcoded JWT secret fallback** (`src/lib/session.ts:8`)
   `getJwtSecret()` falls back to `"dev-secret-change-in-production"`. While there is a `console.warn` in production, the code does **not throw** -- it silently uses the insecure secret. Any attacker who reads the source can forge valid JWTs.

3. **Image upload has no authentication or validation** (`src/lib/storage.ts:6-18`)
   The `uploadImage` function sends a raw `PUT` to the R2 upload URL with no auth token, no file size limit, no MIME type validation, and no filename sanitization. The key is constructed from `Date.now()` + the raw `file.name`, which could contain path traversal characters.

### HIGH

4. **No CSRF protection on server functions** (`src/api/auth.ts`, `src/api/invitations.ts`, etc.)
   All mutation endpoints use `createServerFn({ method: "POST" })` but there is no CSRF token or origin checking. While TanStack Start may provide some protection via `fetch` same-origin, this should be explicitly verified.

5. **No rate limiting on server-side authentication** (`src/api/auth.ts:94-181`)
   The `signupFn` and `loginFn` have no rate limiting. The client-side localStorage fallback has rate limiting (`src/lib/data.ts:260-288`) but the actual server endpoints do not, making them vulnerable to brute-force attacks.

6. **Stateless JWT logout is a no-op** (`src/api/auth.ts:270-277`)
   Logout only clears the client-side token. There is no server-side token blocklist. A stolen token remains valid for up to 7 days.

### MEDIUM

7. **SSL configuration uses `rejectUnauthorized: false`** (`src/db/index.ts:45-48`)
   In production mode, the database connection uses `{ rejectUnauthorized: false }`, which disables certificate validation and is vulnerable to MITM attacks.

8. **No input sanitization on AI prompts** (`src/api/ai.ts:232-316`)
   User-provided prompts are sent directly to the LLM API with no length validation, content filtering, or injection prevention. The `prompt` field in the Zod schema has no `.max()` constraint.

---

## React Patterns Review

### Strengths

- **Clean component decomposition**: Editor components are well-separated -- `EditorLayout`, `ContextPanel`, `FieldRenderer`, `EditorPreviewFrame` each have a single responsibility.
- **Custom hooks are well-extracted**: `useEditorState`, `useAutoSave`, `useAiAssistant`, `useFocusTrap`, `useKeyboardShortcuts`, `useInlineEdit`, `usePreviewScroll` -- each encapsulates a distinct concern.
- **Proper `useCallback` and `useMemo`** usage in hooks and the editor route, preventing unnecessary re-renders.
- **Accessibility-first approach**: The `useFocusTrap` hook correctly re-queries focusable elements on each Tab press to handle dynamic content. `MobileBottomSheet` includes focus restoration.

### Issues

- **Editor route is a 725-line god component** (`src/routes/editor/$invitationId.tsx`). It manages 15+ pieces of state, 10+ handlers, and 5+ dialog overlays. This should be broken into smaller sub-components or use a reducer pattern.
- **Stale closure risk in `useKeyboardShortcuts`** (`src/components/editor/hooks/useKeyboardShortcuts.ts:85`): The `actions` object is in the dependency array, but since it's a new object on every render, the effect re-subscribes on every render. The `actions` should be wrapped in a ref.
- **`useAutoSave` save is synchronous** (`src/components/editor/hooks/useAutoSave.ts:32-39`): `saveNow` calls `updateInvitationContent` and `setInvitationVisibility` (localStorage operations) synchronously and immediately sets `"saved"` status. When the backend is PostgreSQL, this should be async with proper error handling.
- **Duplicated focus trap logic**: `MobileBottomSheet` (`src/components/editor/MobileBottomSheet.tsx:168-211`) reimplements focus trapping inline instead of using the existing `useFocusTrap` hook.

---

## TypeScript Usage Assessment

### Strengths

- Well-defined domain types in `src/lib/types.ts` -- `InvitationContent`, `Invitation`, `Guest`, etc. are comprehensive.
- Template configuration types in `src/templates/types.ts` provide good structure for the template system.
- Zod schemas in `src/lib/validation.ts` align with TypeScript types for runtime validation.

### Issues

- **Excessive `as` casts** (35+ instances across the codebase): JSONB columns from Drizzle return `Record<string, unknown>`, leading to chains like `(draft[sectionId as keyof InvitationContent] as Record<string, unknown>)?.[...]` in `ContextPanel.tsx:106-127`. This defeats TypeScript's safety guarantees.
- **Input validators don't validate** (`src/api/auth.ts:96-97`, `src/api/ai.ts:224-231`): Several `inputValidator` callbacks simply return the data unchanged (`(data: { ... }) => data`) instead of using Zod schemas. This means the runtime type checking is skipped for auth and AI endpoints.
- **`Record<string, unknown>` overuse**: API handlers use `Record<string, unknown>` for update fields (`src/api/invitations.ts:193`, `src/api/guests.ts:243`) instead of Drizzle's typed update objects, losing compile-time safety.
- **Content type mismatch**: `InvitationContent` is a deeply nested interface, but the database stores it as JSONB. There is no runtime validation when reading content back from the database.

---

## Accessibility Audit

### Strengths

- **Skip-to-content link** in `__root.tsx:62` with `dm-skip-link` class.
- **Focus-visible states** applied consistently via `focus-visible:outline-none focus-visible:ring-2` pattern.
- **ARIA labels** on all buttons: AI buttons, close buttons, toggle switches, drag handles.
- **`role="dialog"` and `aria-modal="true"`** on all modal/drawer components.
- **Focus traps** on dialogs via `useFocusTrap` hook with Escape key handling and focus restoration.
- **`aria-live="polite"`** on error messages for screen reader announcements.
- **Keyboard navigation** in `SectionShell` for editor mode (Enter/Space activation).
- **`prefers-reduced-motion`** respected in `MobileBottomSheet`.

### Issues

- **Missing `aria-describedby` for field errors** (`src/components/editor/FieldRenderer.tsx:150-154`): Error messages use `<output>` with `aria-live`, but the associated input does not have `aria-describedby` pointing to the error, so screen readers may not associate the error with the field.
- **Drag handle accessibility** (`src/components/editor/MobileBottomSheet.tsx:411-419`): The drag handle button says "Drag to resize or dismiss" but touch-only drag gestures are not accessible to keyboard or switch users. No keyboard alternative is provided for resizing between snap points.
- **Missing landmark roles** in editor: The preview area and context panel lack `role="region"` with `aria-label` to help screen reader users navigate.
- **Color contrast untested**: CSS custom properties (`--dm-muted`, `--dm-border`) define colors but there's no evidence of contrast ratio testing.

---

## Error Handling Review

### Strengths

- **Consistent error return pattern**: API handlers return `{ error: "message" }` on failure rather than throwing, enabling graceful client-side handling.
- **AI generation timeout handling** (`src/api/ai.ts:247-248, 306-311`): 30-second timeout with AbortController, proper abort error detection.
- **Graceful DB fallback**: Every API handler checks `getDbOrNull()` and falls back to localStorage operations.
- **Zod validation in input validators**: Most endpoints validate input before processing.

### Issues

- **Silent error swallowing** in auth: Multiple `catch {}` blocks with no error logging or user feedback (`src/lib/auth.tsx:111, 175, 209, 233`). When server functions fail, the fallback silently activates without informing the user that they're in degraded mode.
- **`beforeunload` event handler** (`src/components/editor/hooks/useAutoSave.ts:53-56`): Only shows browser dialog but doesn't attempt to save. A save attempt should be made (e.g., `navigator.sendBeacon`).
- **No error boundary**: The root layout (`__root.tsx`) has no React error boundary. Unhandled rendering errors will crash the entire app.
- **`uploadImage` silent failure** (`src/lib/storage.ts:6-18`): The R2 upload `fetch` does not check `response.ok`. A failed upload will silently return an invalid URL.

---

## Biome Configuration & Formatting Review

### Configuration (`biome.json`)

The Biome config is sensible:
- **Indentation**: Tabs (consistent with CLAUDE.md conventions)
- **Quote style**: Double quotes (consistent with CLAUDE.md)
- **Linter**: Recommended rules enabled
- **Import organization**: Enabled via `assist.actions.source.organizeImports`
- **Scope**: Only `src/` files, with `routeTree.gen.ts` and `styles.css` excluded (correct -- these are generated)

### Observations

- **`vcs.enabled: false`**: Biome is not integrated with git for change-based linting. Enabling `vcs.enabled: true` with `useIgnoreFile: true` would respect `.gitignore` patterns automatically.
- **No explicit line width**: The default 80-character line width is used. Some template component files have long Tailwind class strings that may wrap awkwardly. Consider setting `lineWidth: 100` or `120` for this project's style.
- **`biome-ignore` comments are used appropriately**: Found in `SectionShell.tsx:61` (lint/a11y exception with explanation), `MobileBottomSheet.tsx:375` (keyboard handler explained), and `$invitationId.tsx:246` (exhaustive deps with justification). All include rationale comments, which is good practice.
- **No CSS/JSON formatting**: Biome is only configured for JS/TS. CSS formatting relies on Tailwind/Prettier or manual consistency. This is fine given the project uses Tailwind CSS 4 with the Vite plugin.

### Verdict

The Biome configuration is clean and appropriate. The codebase is consistently formatted -- tabs, double quotes, and import organization are uniform across all reviewed files. No formatting violations were observed.

---

## Drizzle ORM Query Patterns Review

### Strengths

- **Proper use of `.returning()`**: All insert and update operations use `.returning()` to get the created/updated rows, avoiding extra SELECT queries.
- **Index definitions** (`src/db/schema.ts:50-53, 76-78, 93-97, 114-116`): Appropriate indexes on foreign keys (`userId`, `invitationId`) and lookup columns (`slug`, `viewedAt`). The unique constraint on `email` and `slug` prevents duplicates at the DB level.
- **Cascade deletes** configured correctly: `invitations.userId` references `users.id` with `onDelete: "cascade"`, and `guests.invitationId` references `invitations.id` with `onDelete: "cascade"`. This prevents orphaned records.
- **Schema uses UUID primary keys**: `uuid("id").defaultRandom().primaryKey()` on all tables -- correct for a distributed system that may need to merge data.
- **Connection pooling** (`src/db/index.ts:29-50`): Pool configuration with configurable max connections, idle timeout, and connection timeout via environment variables.

### Issues

- **N+1 query risk in `publishInvitationFn`** (`src/api/invitations.ts:329-332`): Fetches ALL slugs from the invitations table (`SELECT slug FROM invitations`) to check for uniqueness. This scans the entire table. A better approach: use `INSERT ... ON CONFLICT` or check uniqueness with a targeted query.
- **No transactions for multi-step operations**: `publishInvitationFn` (`src/api/invitations.ts:304-365`) performs a SELECT, then a slug generation, then an UPDATE. These are not wrapped in a transaction, creating a race condition where two concurrent publishes could generate the same slug.
- **Ownership verification repeats the same pattern 12+ times**: Every handler does `SELECT userId FROM invitations WHERE id = ? -> check userId match`. This should be extracted into a shared `verifyOwnership(db, invitationId, userId)` helper.
- **No LIMIT on single-row queries**: Queries like `db.select().from(schema.invitations).where(eq(...))` for single-record lookups don't use `.limit(1)`. While the `WHERE` clause on a unique column should return at most one row, adding `.limit(1)` is defensive and communicates intent.
- **`getInvitations` uses no pagination** (`src/api/invitations.ts:30-47`): `SELECT * FROM invitations WHERE userId = ? ORDER BY updatedAt DESC` fetches all invitations for a user with no `LIMIT` or cursor. As users create more invitations, this query will return increasingly large result sets.
- **Update fields built as `Record<string, unknown>`** (`src/api/invitations.ts:193-202`, `src/api/guests.ts:243-257`): Using untyped record objects for `.set()` loses Drizzle's compile-time column validation. Should use Drizzle's typed partial update pattern.
- **Missing `updatedAt` trigger**: The schema has `updatedAt` columns with `defaultNow()`, but there is no database-level trigger to auto-update on changes. Application code manually sets `updatedAt: new Date()` in every update handler, which is error-prone if forgotten.

---

## Code Duplication Analysis

### Major Duplication: DB + localStorage Fallback Pattern

Every API handler in `src/api/` follows this pattern:

```typescript
const db = getDbOrNull();
if (db) {
  // ~20-40 lines of Drizzle code
} else {
  // ~5-20 lines of localStorage fallback
}
```

This creates:
- **~400 lines of duplicated logic** across `auth.ts` (556 lines), `invitations.ts` (437 lines), `guests.ts` (433 lines), `public.ts` (138 lines)
- Every new feature must be implemented twice
- Ownership verification logic is repeated 12+ times across handlers

### Other Duplication

- **Focus trap implementation**: Exists in both `useFocusTrap.ts` and inline in `MobileBottomSheet.tsx`.
- **`editableProps` helper**: Defined inside `BlushRomanceInvitation.tsx` but likely identical across all 4 template components.
- **CSV export logic**: Duplicated between `src/api/guests.ts:396-417` and `src/lib/data.ts:351-366`.
- **Section visibility logic**: Built in `createInvitation` in both `src/api/invitations.ts:123-128` and `src/lib/data.ts:105-107`.
- **Field blur validation**: Duplicated inline in `$invitationId.tsx` at lines 427-435 and 471-485.

---

## Top 15 Specific Issues

| # | Severity | File:Line | Issue |
|---|----------|-----------|-------|
| 1 | CRITICAL | `src/db/schema.ts` (entire file) | No `passwordHash` column on `users` table. Email/password auth stores hash nowhere. |
| 2 | CRITICAL | `src/lib/session.ts:8` | Hardcoded `"dev-secret-change-in-production"` JWT secret used in production if env var missing. Should throw. |
| 3 | CRITICAL | `src/lib/storage.ts:8-10` | Image upload: no file size limit, no MIME validation, no filename sanitization. Path traversal via `file.name`. |
| 4 | HIGH | `src/api/auth.ts:96-97` | `inputValidator` passes data through without Zod validation, unlike other endpoints. |
| 5 | HIGH | `src/api/auth.ts:218-223` | `loginFn` always returns error for DB users: `"Password verification unavailable"`. Email login is broken with PostgreSQL. |
| 6 | HIGH | `src/lib/auth.tsx:111` | Empty `catch {}` silently swallows session restoration errors with no logging. |
| 7 | HIGH | `src/db/index.ts:45` | `ssl: { rejectUnauthorized: false }` in production disables certificate verification. |
| 8 | MEDIUM | `src/routes/editor/$invitationId.tsx` (entire file) | 725-line component with 15+ state variables. Extract dialogs, handlers, and sub-layouts. |
| 9 | MEDIUM | `src/components/editor/ContextPanel.tsx:106-127` | Deeply nested `as` casts to find array keys. Fragile and unreadable. Needs typed accessor. |
| 10 | MEDIUM | `src/components/editor/hooks/useKeyboardShortcuts.ts:85` | `actions` object in dependency array creates new subscription every render. Use refs. |
| 11 | MEDIUM | `src/components/editor/hooks/useAutoSave.ts:32-39` | Synchronous save with localStorage; does not work with async DB operations. |
| 12 | MEDIUM | `src/components/editor/MobileBottomSheet.tsx:168-211` | Re-implements focus trap instead of using existing `useFocusTrap` hook. |
| 13 | MEDIUM | `src/api/ai.ts:224-231` | AI input validator does no validation. No prompt length limit. |
| 14 | LOW | `src/routes/__root.tsx` (entire file) | No React error boundary. Unhandled errors crash entire app with no recovery. |
| 15 | LOW | `src/components/editor/FieldRenderer.tsx:150-154` | Error `<output>` not linked to input via `aria-describedby`. |

---

## Recommended Refactoring Priorities

### Priority 1: Security (Pre-launch Blockers)

1. **Add `passwordHash` column to users table** and update `signupFn`/`loginFn` to store/verify passwords in the database.
2. **Make JWT secret required in production** -- `getJwtSecret()` should throw if `JWT_SECRET` is not set and `NODE_ENV=production`.
3. **Add file upload validation** -- enforce file size limits (e.g., 5MB), whitelist MIME types (image/*), sanitize filenames.
4. **Add Zod validation to auth and AI input validators** -- replace pass-through validators with proper schemas.
5. **Implement server-side rate limiting** on auth endpoints.

### Priority 2: Architecture (Next Sprint)

6. **Extract editor route into sub-components** -- move preview overlay, upgrade dialog, slug dialog, shortcuts dialog into separate files. Use a `useEditorDialogs` hook.
7. **Unify the data access layer** -- create a repository pattern that abstracts DB vs localStorage, eliminating duplication in all API handlers.
8. **Add React error boundary** in root layout to catch and display errors gracefully.

### Priority 3: Type Safety (Ongoing)

9. **Create typed accessors for JSONB content** -- replace `as Record<string, unknown>` casts with runtime-validated helpers (e.g., `getInvitationContent(row): InvitationContent`).
10. **Add Zod schemas for database content validation** -- validate JSONB data when reading from the database.

### Priority 4: Testing (Ongoing)

11. **Add unit tests for business logic** -- `useEditorState`, `useAutoSave`, `useAiAssistant` hooks are untested.
12. **Add unit tests for utility functions** -- `slug.ts`, `data.ts`, `session.ts` have zero unit tests.
13. **Test auth flows** -- both email/password and Google OAuth paths need integration tests.

### Priority 5: Code Quality (Low Priority)

14. **Deduplicate focus trap** -- make `MobileBottomSheet` use `useFocusTrap` hook.
15. **Extract `editableProps` helper** -- share across all 4 template invitation components.
16. **Replace inline error handling in `storage.ts`** -- check `response.ok` on upload, add proper error messages.

---

## Summary

The codebase is well-organized for an early-stage SaaS product with thoughtful UI/UX patterns and strong accessibility foundations. The most urgent work is fixing the authentication security gaps (password storage, JWT secret enforcement, file upload validation) before any production deployment. The dual data layer is the largest source of code smell and should be unified into a repository pattern. The editor route's complexity is manageable but should be decomposed soon to maintain velocity. TypeScript strictness should be improved by replacing `as` casts with runtime-validated accessors.
