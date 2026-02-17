---
status: complete
priority: p1
issue_id: "005"
tags: [code-review, canvas, api, reliability]
dependencies: []
---

# Editor Publish Bypasses Server Publish API

## Problem Statement

Canvas editor publish button calls local store publish helper only. It does not call server publish function, so DB-backed environments can show published state locally without persisting real publish status/slug/template snapshot.

## Findings

- Canvas editor publish handler calls `publishInvitation` from local data module: `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/components/canvas/CanvasEditor.tsx:466`.
- Local `publishInvitation` mutates client store only: `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/lib/data.ts:203`.
- Server publish path exists in API (`publishInvitationFn`) and includes DB updates + template snapshot: `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/api/invitations.ts:372`.
- Current editor route never invokes that server function on publish action.

## Proposed Solutions

### Option 1: Use `publishInvitationFn` from editor and fallback locally on failure

**Approach:** Wire editor publish button to server function with auth token, then sync local store from response.

**Pros:** Correct persistence, consistent with dashboard behavior.

**Cons:** Requires async state handling/loading/toast.

**Effort:** Medium

**Risk:** Low

---

### Option 2: Remove publish action from editor until server wiring done

**Approach:** Hide/disable publish button in editor and route users to dashboard publish flow.

**Pros:** Prevents false-success state.

**Cons:** Reduced UX convenience.

**Effort:** Small

**Risk:** Low

## Recommended Action

Implemented Option 1. Canvas publish now calls `publishInvitationFn` with auth token, syncs local store from response, fallback to local publish on failure/no token.

## Technical Details

**Affected files:**
- `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/components/canvas/CanvasEditor.tsx`
- `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/lib/data.ts`
- `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/api/invitations.ts`

## Resources

- **Plan acceptance item:** publish flow from canvas editor.

## Acceptance Criteria

- [x] Publish from editor persists status/slug/template snapshot in DB path.
- [x] Publish success/failure shown correctly in UI.
- [x] Public invite loader reflects editor publish immediately after success.

## Work Log

### 2026-02-17 - Review Finding Created

**By:** Codex

**Actions:**
- Traced publish action from toolbar handler to data/API layers.
- Confirmed editor path bypasses server publish function.

**Learnings:**
- Local optimistic publish without server sync is unsafe for production routes.

### 2026-02-17 - Fix Implemented

**By:** Codex

**Actions:**
- Added server publish call + response patching in `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/components/canvas/CanvasEditor.tsx`.
- Added publish-path regression test in `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/components/canvas/CanvasEditor.test.tsx`.
- Ran `pnpm check` and `pnpm test` (pass).

**Learnings:**
- Editor actions that impact public routes must use canonical server mutation path first.

## Notes

- Merge-blocking for production correctness.
