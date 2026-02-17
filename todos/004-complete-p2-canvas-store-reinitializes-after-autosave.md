---
status: complete
priority: p2
issue_id: "004"
tags: [code-review, canvas, architecture, state-management]
dependencies: []
---

# Canvas Store Reinitializes After Autosave

## Problem Statement

Editor store instance is recreated when `initialDocument` prop identity changes. Autosave updates invitation content in global store, which feeds back as a new parsed document object from route, causing store reset risk (selection/undo/context loss).

## Findings

- Editor store is created with `useMemo(..., [initialDocument])`: `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/components/canvas/CanvasEditor.tsx:368`.
- Route re-parses invitation content with `asCanvasDocument`, yielding new object identity: `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/routes/editor/canvas/$invitationId.tsx:19`.
- Autosave writes content back into global invitation store on every save: `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/components/canvas/hooks/useCanvasAutoSave.ts:47`.
- Combined flow can recreate editor store and reset ephemeral state/undo history.

## Proposed Solutions

### Option 1: Keep store instance stable via `useRef`

**Approach:** Initialize store once, then call `store.getState().setDocument(...)` when external document truly changes (id/version check).

**Pros:** Preserves undo stack and selection across autosave.

**Cons:** Requires explicit sync guard logic.

**Effort:** Medium

**Risk:** Medium

---

### Option 2: Stop feeding autosave writes back into route source during active editing

**Approach:** Isolate editor-local document source from global invitation updates until unload/publish.

**Pros:** Eliminates loop.

**Cons:** Bigger data-flow refactor.

**Effort:** Large

**Risk:** Medium

## Recommended Action

Implemented Option 1 (stable store identity). Store now initializes once per `invitationId`, preventing reset on `initialDocument` identity churn.

## Technical Details

**Affected files:**
- `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/components/canvas/CanvasEditor.tsx`
- `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/components/canvas/hooks/useCanvasAutoSave.ts`
- `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/routes/editor/canvas/$invitationId.tsx`

## Resources

- **Plan context:** `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/docs/plans/2026-02-17-feat-canvas-editor-reimagine-plan.md`

## Acceptance Criteria

- [x] Autosave does not reset selection/editing state.
- [x] Undo history survives autosave cycles.
- [x] No duplicate store initialization in normal edit flow.

## Work Log

### 2026-02-17 - Review Finding Created

**By:** Codex

**Actions:**
- Traced document lifecycle across route, editor, autosave, and store update paths.
- Identified reinitialization coupling via prop identity.

**Learnings:**
- Stable store identity is required for predictable temporal undo behavior.

### 2026-02-17 - Fix Implemented

**By:** Codex

**Actions:**
- Replaced `useMemo([initialDocument])` with `useRef`-backed one-time-per-invitation store init in `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/components/canvas/CanvasEditor.tsx`.
- Added regression case for prop refresh stability in `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/components/canvas/CanvasEditor.test.tsx`.
- Ran `pnpm check` and `pnpm test` (pass).

**Learnings:**
- Prop identity churn from autosave feedback loops can invalidate temporal state unexpectedly.

## Notes

- Important correctness/UX issue; not immediate crash but high user impact.
