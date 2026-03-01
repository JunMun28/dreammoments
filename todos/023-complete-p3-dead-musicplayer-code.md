---
status: pending
priority: p3
issue_id: "023"
tags: [code-review, simplicity, dead-code]
dependencies: []
---

# Dead MusicPlayer Code in ScenePageEngine

## Problem Statement
`TEMPLATE_MUSIC` maps every template to `null`, so `MusicPlayer` always returns `null`. 48 lines of unreachable code. Also, `videoJobId` state is exposed from `useLivingPortrait` hook but never consumed by any UI component.

## Findings
- `src/components/canvas/ScenePageEngine.tsx:406-454` — `MusicPlayer` component + `TEMPLATE_MUSIC` map, always returns null
- `src/components/editor/hooks/useLivingPortrait.ts:224` — `videoJobId` returned but never read by callers

## Proposed Solutions
Remove dead `MusicPlayer` from `ScenePageEngine.tsx` (48 LOC saved). Convert `videoJobId` to a ref (no UI depends on it, saves a re-render).
- Effort: Small
- Risk: Low

## Work Log
- 2026-03-01: Identified during code review (code-simplicity-reviewer agent)
