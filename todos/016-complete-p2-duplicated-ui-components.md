---
status: pending
priority: p2
issue_id: "016"
tags: [code-review, simplicity, duplication, living-portrait]
dependencies: []
---

# Duplicated UI Components: LivingPortraitField ≈ LivingPortraitSection

## Problem Statement
`LivingPortraitField.tsx` (255 lines, legacy editor) and `LivingPortraitSection.tsx` (250 lines, canvas inspector) are near-identical — same hook, same UI structure (style selector, generate/animate buttons, avatar preview, progress bar, error display, a11y live region). Differences are purely cosmetic (CSS token names, sizes, border radius). Any bug fix or UX change must be made in both places.

## Findings
- `src/components/editor/LivingPortraitField.tsx` — 255 lines, uses `--dm-primary` tokens, `rounded-2xl`, `h-4` icons
- `src/components/canvas/inspector/LivingPortraitSection.tsx` — 250 lines, uses `--dm-accent-strong` tokens, `rounded-lg`, `h-3` icons
- `LivingPortraitSection` has a 15-line `handleChange` bridge that strips `hero.` prefix — the only structural difference
- ~200 LOC of duplication

## Proposed Solutions
### Option 1: Single component with variant prop (Recommended)
Refactor into one component that accepts `variant: "editor" | "inspector"` for visual differences. Move the `hero.` prefix bridging to the call site in `BlockInspectorSidebar.tsx`.
- Pros: Single source of truth, ~200 LOC saved
- Cons: Slightly more complex component API
- Effort: Medium
- Risk: Low

### Option 2: Keep duplication, add TODO
If legacy editor is being deprecated, accept the duplication with a clear TODO.
- Pros: No refactoring risk
- Cons: Maintenance burden if both UIs persist
- Effort: None
- Risk: Low (if legacy editor is deprecated soon)

## Recommended Action
If both UIs will coexist, implement Option 1. If legacy editor is being deprecated, Option 2 is acceptable.

## Acceptance Criteria
- [ ] Single Living Portrait component (or documented decision to keep both)
- [ ] All Living Portrait UX changes only need to be made once

## Work Log
- 2026-03-01: Identified during code review (code-simplicity-reviewer + kieran-typescript-reviewer agents)
