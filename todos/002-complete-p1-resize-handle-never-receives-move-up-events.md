---
status: complete
priority: p1
issue_id: "002"
tags: [code-review, canvas, interaction, quality]
dependencies: []
---

# Resize Handle Never Receives Move/Up Events

## Problem Statement

Resize starts on one element but move/up handlers are attached to a different sibling element. Pointer capture is set on the pointerdown target, so resize move/up callbacks do not run reliably.

## Findings

- Pointerdown is attached to SelectionOverlay resize button: `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/components/canvas/SelectionOverlay.tsx:18`.
- `useResizeBlock` sets pointer capture on that button: `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/components/canvas/hooks/useResizeBlock.ts:29`.
- Move/up/cancel handlers are mounted on a different sibling div, not the captured button: `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/components/canvas/CanvasEditor.tsx:324`.
- Result: resize preview/commit path can be skipped or inconsistent.

## Proposed Solutions

### Option 1: Attach resize down/move/up/cancel to same handle element

**Approach:** Put all resize handlers on the same DOM node (the handle button).

**Pros:** Correct pointer-capture semantics, simple fix.

**Cons:** Minor component prop shape change.

**Effort:** Small

**Risk:** Low

---

### Option 2: Remove pointer capture and listen on window

**Approach:** Keep split nodes but handle move/up via window listeners.

**Pros:** Robust across cursor leaving handle.

**Cons:** More complexity and cleanup risk.

**Effort:** Medium

**Risk:** Medium

## Recommended Action

Implemented Option 1. Bound resize down/move/up/cancel to same resize handle element.

## Technical Details

**Affected files:**
- `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/components/canvas/SelectionOverlay.tsx`
- `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/components/canvas/hooks/useResizeBlock.ts`
- `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/components/canvas/CanvasEditor.tsx`

## Resources

- **Plan context:** `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/docs/plans/2026-02-17-feat-canvas-editor-reimagine-plan.md`

## Acceptance Criteria

- [x] Resize handle updates width/height continuously while dragging.
- [x] Resize commit fires on pointerup and persists size.
- [x] Keyboard/drag tests still pass.

## Work Log

### 2026-02-17 - Review Finding Created

**By:** Codex

**Actions:**
- Mapped event wiring between SelectionOverlay, hook, and editor.
- Confirmed pointer capture target mismatch.

**Learnings:**
- Pointer capture requires move/up listeners on captured target or ancestors.

### 2026-02-17 - Fix Implemented

**By:** Codex

**Actions:**
- Added move/up/cancel props to `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/components/canvas/SelectionOverlay.tsx`.
- Routed all resize pointer handlers via handle in `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/components/canvas/CanvasEditor.tsx`.
- Added interaction regression in `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/components/canvas/CanvasEditor.test.tsx`.
- Ran `pnpm check` and `pnpm test` (pass).

**Learnings:**
- Split-node pointer handling breaks easily under pointer-capture.

## Notes

- Merge-blocking because core resize workflow is affected.
