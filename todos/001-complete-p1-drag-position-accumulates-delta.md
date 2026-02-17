---
status: complete
priority: p1
issue_id: "001"
tags: [code-review, canvas, interaction, quality]
dependencies: []
---

# Drag Position Accumulates Delta And Overshoots

## Problem Statement

Canvas drag computes delta from pointer-down, but also reuses a continuously-updated origin. This compounds movement and causes overshoot/acceleration while dragging.

## Findings

- `useDragBlock` calculates `deltaX/deltaY` from initial pointer (`startPointerRef`) then adds it to `getOrigin()` each move: `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/components/canvas/hooks/useDragBlock.ts:103` and `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/components/canvas/hooks/useDragBlock.ts:121`.
- `CanvasEditor` updates `livePositionRef.current` on every preview, so `getOrigin()` is not stable: `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/components/canvas/CanvasEditor.tsx:255`.
- Net effect: second move adds full delta on top of already-moved origin, producing larger-than-pointer movement.

## Proposed Solutions

### Option 1: Capture fixed drag origin on pointerdown

**Approach:** Store initial block position in a dedicated ref during pointerdown; always compute preview from that fixed origin plus pointer delta.

**Pros:** Correct math, minimal change, predictable.

**Cons:** Need small hook refactor.

**Effort:** Small

**Risk:** Low

---

### Option 2: Switch to incremental deltas between move events

**Approach:** Track previous pointer position and apply incremental delta each move.

**Pros:** Works with mutable origin.

**Cons:** More state bookkeeping and edge handling.

**Effort:** Medium

**Risk:** Medium

## Recommended Action

Implemented Option 1. Capture stable drag origin on pointerdown and compute preview from `startOrigin + pointerDelta`.

## Technical Details

**Affected files:**
- `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/components/canvas/hooks/useDragBlock.ts`
- `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/components/canvas/CanvasEditor.tsx`

## Resources

- **Plan context:** `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/docs/plans/2026-02-17-feat-canvas-editor-reimagine-plan.md`

## Acceptance Criteria

- [x] Block tracks pointer 1:1 during drag without acceleration.
- [x] Manual test: long drag in both axes ends exactly where pointer indicates.
- [x] Existing canvas interaction tests pass.

## Work Log

### 2026-02-17 - Review Finding Created

**By:** Codex

**Actions:**
- Traced drag math in hook and editor integration.
- Identified compounding delta path with exact line references.

**Learnings:**
- Drag math must use a stable origin per pointerdown.

### 2026-02-17 - Fix Implemented

**By:** Codex

**Actions:**
- Added `startOriginRef` capture + stable delta math in `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/components/canvas/hooks/useDragBlock.ts`.
- Added regression test `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/components/canvas/hooks/useDragBlock.test.tsx`.
- Ran `pnpm check` and `pnpm test` (pass).

**Learnings:**
- Drag preview must never use mutable preview position as origin when delta is from initial pointer.

## Notes

- Blocks core editor interaction; treat as merge-blocking.
