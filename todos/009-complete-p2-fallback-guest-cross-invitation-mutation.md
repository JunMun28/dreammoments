---
status: complete
priority: p2
issue_id: "009"
tags: [code-review, authorization, api]
dependencies: []
---

# Scope Guest Mutations by Invitation in Fallback Paths

## Problem Statement

New fallback implementations for guest deletion/bulk updates mutate guests by `guestId` only. Unlike DB path, they do not enforce `(guestId, invitationId)` scope, so wrong-invitation records can be mutated in fallback mode.

## Findings

- `deleteGuestFn` fallback calls `localDeleteGuest(data.guestId)` without invitation check.
- `bulkUpdateGuestsFn` fallback loops `localUpdateGuest(guestId, fields)` without invitation check.
- DB path correctly scopes by invitation in SQL `WHERE` clause.
- Affected code: `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/api/guests.ts:587` and `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/api/guests.ts:676`.

## Proposed Solutions

### Option 1: Add invitation-scoped local helpers

**Approach:** Introduce `updateGuestInInvitation(invitationId, guestId, patch)` and `deleteGuestInInvitation(invitationId, guestId)`; use these in fallback server paths.

**Pros:**
- Mirrors DB authorization semantics
- Reusable for all fallback mutations

**Cons:**
- Requires small data-layer API expansion

**Effort:** Small

**Risk:** Low

---

### Option 2: Verify guest ownership before each fallback mutation

**Approach:** Fetch guest list for invitation and only mutate if `guestId` exists in that invitation.

**Pros:**
- No new helper APIs required
- Explicit checks near mutation callsites

**Cons:**
- Duplicated logic across endpoints

**Effort:** Small

**Risk:** Low

---

### Option 3: Remove fallback mutation behavior

**Approach:** Return explicit service-unavailable error when DB is absent for protected write endpoints.

**Pros:**
- Eliminates split-brain auth behavior
- Stronger correctness guarantees

**Cons:**
- Worse local/dev ergonomics

**Effort:** Medium

**Risk:** Medium

## Recommended Action


## Technical Details

**Affected files:**
- `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/api/guests.ts`
- `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/lib/data.ts`

**Related components:**
- Guest management APIs
- localStorage fallback authorization parity

**Database changes (if any):**
- No

## Resources

- Review target: current branch `codex/canvas-editor-phase1`

## Acceptance Criteria

- [ ] Fallback delete/update operations enforce invitation scope
- [ ] Tests cover wrong-invitation guest IDs in fallback paths
- [ ] Behavior matches DB path semantics for same inputs
- [ ] No regressions in existing guest API tests

## Work Log

### 2026-02-19 - Initial Discovery

**By:** Codex

**Actions:**
- Compared DB and fallback mutation paths in new guest endpoints.
- Identified scope checks present in DB path but absent in fallback path.

**Learnings:**
- Authorization parity between DB and fallback paths is currently inconsistent.

### 2026-02-19 - Resolution

**By:** Codex

**Actions:**
- Added invitation-scoped fallback helpers in `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/lib/data.ts`: `updateGuestInInvitation` and `deleteGuestInInvitation`.
- Updated `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/api/guests.ts` fallback paths (`updateGuestFn`, `deleteGuestFn`, `bulkUpdateGuestsFn`) to use invitation-scoped helpers.
- Added regression tests in `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/tests/api-guests.test.ts` for wrong-invitation guest IDs.

**Learnings:**
- Fallback and DB mutation semantics should match to avoid hidden authorization gaps during local/degraded operation.

## Notes

- Fallback mode may be non-production, but parity gaps increase risk and debugging complexity.
