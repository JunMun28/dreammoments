---
title: "feat: Redesign Desktop Canvas Editor Layout with Sidebar Inspector"
type: feat
status: completed
date: 2026-02-24
brainstorm: docs/brainstorms/2026-02-17-canvas-editor-reimagine-brainstorm.md
detail_level: more
---

# feat: Redesign Desktop Canvas Editor Layout with Sidebar Inspector

## Overview ✨
Redesign desktop canvas editor UI to a clean 3-column workspace:
- left: page/nav thumbnails rail
- center: editable invitation canvas
- right: inspector sidebar

Core interaction: when user clicks/selects an element on canvas, editing controls for that element appear in the right sidebar.

This plan uses brainstorm context from `2026-02-17-canvas-editor-reimagine-brainstorm.md`, but scope here is focused desktop UX refactor, not full architecture rewrite.

## Problem Statement / Motivation
Current desktop canvas editor is hard to use and visually unbalanced:
- single narrow centered layout (`max-w-[480px]`) does not use desktop space well
- editing controls are mostly canvas-anchored/popover style, not stable desktop inspector
- workflow feels mobile-first on desktop, causing friction for design/detail work

Evidence in current code:
- `src/components/canvas/CanvasEditor.tsx:596` fixed mobile-height canvas viewport style
- `src/components/canvas/CanvasToolbar.tsx:70` sticky top toolbar for all breakpoints
- `src/components/canvas/CanvasEditor.tsx:745` mobile-only bottom action bar

## Proposed Solution
Adopt a desktop-first editor shell while preserving existing store + route wiring.

### Layout
- Desktop (`>=1024px`): 3-column grid
  - left rail: page/section navigation + quick jumps
  - center: canvas viewport (primary interaction area)
  - right sidebar: block inspector (content/style/layout controls)
- Mobile/tablet (`<1024px`): keep existing bottom-sheet behavior patterns.

### Interaction model
- Click block on canvas -> set selection in store -> open/populate right inspector.
- Change inspector value -> update selected block in store -> canvas updates immediately.
- Click empty canvas/Escape -> clear selection -> inspector shows empty state.
- Multi-select behavior (phase 1 assumption): show shared controls only (position, spacing, alignment), hide unsupported fields.

### Component reuse direction
- reuse `src/components/editor/EditorLayout.tsx` desktop+bottom-sheet mechanics
- reuse `src/components/editor/ContextPanel.tsx` shell behavior for inspector frame
- reuse/adapt `src/components/editor/SectionRail.tsx` for left navigation rail
- keep canvas document state source in `src/lib/canvas/store.ts`

### Pseudo structure
#### src/components/canvas/DesktopCanvasEditorLayout.tsx
```tsx
<EditorLayout
  sectionRail={<SectionRail ... />}
  preview={<CanvasViewport ... />}
  contextPanel={<BlockInspectorPanel selectedBlockIds={selectedBlockIds} ... />}
/>
```

## Technical Considerations
- Architecture impact: medium (UI composition refactor, store integration points unchanged).
- Performance:
  - preserve drag/resize smoothness; inspector updates must not trigger heavy rerenders
  - debounce expensive inspector-driven writes when needed
- Accessibility:
  - keyboard nav between rail/canvas/sidebar
  - visible focus states for selected block + active inspector controls
  - clear empty state text when no selection
- Security: no new auth/data-privacy/payment risk.

Institutional gotchas to preserve (`docs/solutions/ui-bugs/interaction-publish-regressions-canvas-editor-20260217.md`):
- keep pointer lifecycle on same target for drag/resize
- do not break stable drag delta math
- keep canonical publish/save mutation path and stable store identity

## Acceptance Criteria
- [x] Desktop viewport (`>=1024px`) shows left rail + center canvas + right inspector layout.
- [x] Canvas remains centered and scroll behavior is stable (no overlapping rails/panels).
- [x] Selecting a text block opens inspector with text controls for that block.
- [x] Selecting an image block opens inspector with image/layout controls for that block.
- [x] Deselecting block (canvas background/Escape) shows inspector empty state.
- [x] Multi-select shows shared controls only; unsupported controls are hidden/disabled.
- [x] Inspector edits apply live to selected block(s) and persist via existing save flow.
- [x] Mobile/tablet flow remains functional using existing bottom-sheet pattern.
- [x] Existing undo/redo and keyboard shortcuts still work after layout refactor.
- [x] Existing drag/resize behavior stays deterministic (no overshoot/pointer-loss regression).
- [x] No auth/ownership regression in editor route load guards.
- [x] Added/updated tests cover selection->inspector sync, deselection, responsive fallback.

## Success Metrics
- Desktop editing task completion time decreases (baseline vs. after change) for common tasks: select, edit text, adjust style.
- Fewer user misclicks/context switches when editing block properties.
- No increase in canvas interaction regressions (drag/resize/publish/autosave).

## Dependencies & Risks
Dependencies:
- define inspector field mapping per block type (text/image/group/multi-select)
- align left rail content source (sections vs page thumbnails) with current document model

Risks:
- refactor can accidentally break drag/resize event flows
- sidebar updates can create render thrash during fast interactions
- desktop layout can drift from mobile behavior if breakpoints not explicit

Mitigations:
- preserve existing pointer hooks and event contracts
- add focused regression tests for drag/resize + inspector sync
- enforce explicit responsive breakpoints and reuse existing layout primitives

## SpecFlow Analysis (Incorporated)
User flows covered:
- desktop happy path: load -> select block -> edit in sidebar -> persist
- deselection path: clear selection -> inspector empty state
- responsive fallback path: desktop grid to mobile bottom-sheet behavior
- failure path: invalid ownership/failed load preserves route guard behavior

Gaps resolved in this plan:
- explicit desktop breakpoint strategy
- explicit inspector empty/multi-select behavior
- explicit test expectations for selection and responsive transitions

Assumptions captured for implementation phase:
- left rail starts from existing section rail model
- multi-select inspector is limited to shared fields in phase 1

## AI-Era Notes
- Research support used: `repo-research-analyst`, `learnings-researcher`, `spec-flow-analyzer` style passes.
- Human review still required for visual fidelity, interaction polish, and regression test scope.

## References & Research
### Internal References
- `docs/brainstorms/2026-02-17-canvas-editor-reimagine-brainstorm.md`
- `src/routes/editor/canvas/$invitationId.tsx:3`
- `src/routes/editor/canvas/$invitationId.tsx:69`
- `src/components/canvas/CanvasEditor.tsx:356`
- `src/components/canvas/CanvasEditor.tsx:596`
- `src/components/canvas/CanvasEditor.tsx:745`
- `src/components/canvas/CanvasToolbar.tsx:70`
- `src/lib/canvas/store.ts:32`
- `src/lib/canvas/store.ts:329`
- `src/components/editor/EditorLayout.tsx:15`
- `src/components/editor/EditorLayout.tsx:74`
- `src/components/editor/SectionRail.tsx:91`
- `src/components/editor/ContextPanel.tsx:30`
- `docs/solutions/ui-bugs/interaction-publish-regressions-canvas-editor-20260217.md:21`
- `docs/solutions/ui-bugs/interaction-publish-regressions-canvas-editor-20260217.md:79`

### External Research Decision
Skipped. Reason: low-risk local UI architecture change with strong in-repo patterns and recent institutional learnings already covering relevant failure modes.

## Post-Deploy Monitoring & Validation
- **What to monitor/search**
  - Logs: client errors in editor canvas interactions and inspector updates.
  - Metrics: desktop editor engagement + save/publish success rate.
- **Validation checks (manual + automated)**
  - Selection to inspector sync on text/image/multi-select.
  - Drag/resize regression smoke checks.
  - Responsive transition checks at desktop/tablet/mobile breakpoints.
- **Expected healthy behavior**
  - Desktop layout stable; selecting block reliably opens matching inspector controls.
- **Failure signal(s) / rollback trigger**
  - Increased editor runtime errors, broken selection sync, or drag/resize regressions.
- **Validation window & owner**
  - Window: first 24-48h after deploy.
  - Owner: editor frontend owner.
