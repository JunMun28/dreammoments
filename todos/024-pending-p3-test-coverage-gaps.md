---
status: pending
priority: p3
issue_id: "024"
tags: [code-review, testing, living-portrait]
dependencies: []
---

# Test Coverage Gaps for Living Portrait Feature

## Problem Statement
The only test change is adding `"living-portrait"` to valid field types. No tests exist for: `useLivingPortrait` hook (success, failure, polling, cleanup), `HeroMedia` component (fallback cascade, reduced-motion, video gating), or server functions (mocked fal.ai responses, R2 uploads, rate limiting).

## Findings
- `src/tests/templates-index.test.ts` — Only test change in entire PR
- `useLivingPortrait` hook — highly testable with mock server functions
- `HeroMedia` — testable for fallback behavior and reduced-motion
- Server functions — testable with mocked fal.ai and DB

## Proposed Solutions
Add unit tests for:
1. `useLivingPortrait` hook: generation flow, error handling, polling lifecycle, cleanup on unmount
2. `HeroMedia`: fallback cascade, reduced-motion respect, video cross-fade
3. Server function input validation and error paths (with mocked externals)
- Effort: Medium
- Risk: Low

## Work Log
- 2026-03-01: Identified during code review (kieran-typescript-reviewer agent)
