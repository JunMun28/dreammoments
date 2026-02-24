---
status: complete
priority: p1
issue_id: "010"
tags: [canvas-editor, desktop-layout, sidebar-inspector, ui]
dependencies: []
---

# Desktop Canvas Sidebar Inspector

## Problem Statement
Desktop canvas editor layout is mobile-like and unclear. Need 3-column desktop workspace and block inspector in right sidebar on selection.

## Findings
- `CanvasEditor` is centered single column with `max-w-[480px]`.
- Block editing controls currently in floating `BlockToolbar` near selected block.
- Existing store already tracks `selectedBlockIds` and editing state.

## Proposed Solutions
### Option 1: Minimal desktop shell + new canvas inspector (chosen)
Pros: fast, low risk, reuses store/actions. Cons: custom panel logic.

### Option 2: Full reuse of legacy `EditorLayout`/`ContextPanel`
Pros: shared shell. Cons: incompatible data model, slower integration.

## Recommended Action
Implement option 1 now:
- Add desktop 3-column shell in `CanvasEditor`
- Add left section rail from canvas block section ids
- Add right `BlockInspectorSidebar` for selected blocks
- Keep mobile flow unchanged
- Add/update tests for selection -> sidebar, deselection state, multi-select shared controls

## Technical Details
Affected files:
- `src/components/canvas/CanvasEditor.tsx`
- `src/components/canvas/BlockInspectorSidebar.tsx` (new)
- `src/components/canvas/BlockToolbar.tsx`
- `src/components/canvas/CanvasEditor.test.tsx`
- `docs/plans/2026-02-24-feat-desktop-canvas-sidebar-inspector-plan.md`

## Acceptance Criteria
- [x] Desktop shows left rail + center canvas + right inspector
- [x] Selecting text/image block shows sidebar controls
- [x] Deselect shows empty inspector state
- [x] Multi-select shows shared controls only
- [x] Mobile flow still works
- [x] Tests pass

## Work Log
### 2026-02-24 - Start implementation

**By:** Codex

**Actions:**
- Created execution todo
- Confirmed branch + scope decisions
- Read canvas/editor files and tests

**Learnings:**
- Existing store + tests already cover selection/edit signals, so sidebar integration can be incremental.

### 2026-02-24 - Complete implementation

**By:** Codex

**Actions:**
- Added desktop 3-column shell in `src/components/canvas/CanvasEditor.tsx`
- Added `CanvasSectionRail` + `BlockInspectorSidebar` components
- Moved block editing fields from floating toolbar into sidebar inspector
- Added canvas editor tests for image inspector, empty state, and shared controls
- Ran lint + full tests (`pnpm lint`, `pnpm test`)
- Captured browser screenshots with `agent-browser`

**Learnings:**
- Keeping store/actions unchanged reduced risk while replacing desktop layout shell.
- LocalStorage APIs can be unavailable in test/runtime environments; safe token access helpers prevent false failures.
