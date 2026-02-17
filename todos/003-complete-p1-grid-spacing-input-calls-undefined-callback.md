---
status: complete
priority: p1
issue_id: "003"
tags: [code-review, canvas, ui, quality]
dependencies: []
---

# Grid Spacing Input Calls Undefined Callback

## Problem Statement

Canvas toolbar renders a grid spacing input that calls `onSpacingChange`, but this callback is declared in props type and never destructured in function arguments. Changing the grid input throws at runtime.

## Findings

- `onSpacingChange` is referenced in input onChange: `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/components/canvas/CanvasToolbar.tsx:147`.
- `onSpacingChange` exists in prop type interface: `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/components/canvas/CanvasToolbar.tsx:66`.
- `onSpacingChange` is missing in the function param destructuring list: `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/components/canvas/CanvasToolbar.tsx:28`.
- This creates a runtime `ReferenceError` when user edits grid size.

## Proposed Solutions

### Option 1: Add `onSpacingChange` to destructured props

**Approach:** Include `onSpacingChange` in function parameters and keep current caller.

**Pros:** One-line fix, no API changes.

**Cons:** None.

**Effort:** Small

**Risk:** Low

---

### Option 2: Route spacing through `onDesignTokenChange`

**Approach:** Remove separate callback and reuse token update handler.

**Pros:** Fewer props.

**Cons:** Blurs number-vs-string handling.

**Effort:** Small

**Risk:** Low

## Recommended Action

Implemented Option 1. Added missing `onSpacingChange` to toolbar prop destructuring.

## Technical Details

**Affected files:**
- `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/components/canvas/CanvasToolbar.tsx`

## Resources

- **Related callsite:** `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/components/canvas/CanvasEditor.tsx:523`

## Acceptance Criteria

- [x] Changing grid input no longer throws.
- [x] Snap grid spacing updates in editor behavior.
- [x] Canvas tests pass.

## Work Log

### 2026-02-17 - Review Finding Created

**By:** Codex

**Actions:**
- Compared prop type vs function parameter destructuring.
- Traced runtime callback path from input to editor.

**Learnings:**
- Biome checks do not catch missing destructured props used inside closures.

### 2026-02-17 - Fix Implemented

**By:** Codex

**Actions:**
- Added `onSpacingChange` in `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/components/canvas/CanvasToolbar.tsx`.
- Added spacing interaction test in `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/components/canvas/CanvasEditor.test.tsx`.
- Ran `pnpm check` and `pnpm test` (pass).

**Learnings:**
- Prop type presence is not enough; missing destructure still fails at runtime.

## Notes

- Merge-blocking due immediate runtime error in toolbar interaction.
