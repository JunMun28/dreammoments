---
status: pending
priority: p2
issue_id: "017"
tags: [code-review, performance, r2-storage, living-portrait]
dependencies: []
---

# S3Client and fal.config Instantiated Per Request

## Problem Statement
`getR2Client()` creates a new `S3Client` instance on every upload/delete call. `configureFal()` (duplicated in two files) calls `fal.config()` on every request. S3Client construction involves credential resolution, HTTP agent setup, and middleware initialization (10-50ms overhead per request), and prevents HTTP connection reuse.

## Findings
- `src/api/r2.ts:22-36` — `new S3Client()` on every call
- `src/api/ai-avatar.ts:39-43` — `configureFal()` duplicate
- `src/api/ai-animation.ts:36-40` — `configureFal()` duplicate (different error message)

## Proposed Solutions
### Option 1: Lazy singleton for both (Recommended)
Cache S3Client as module-level singleton. Extract `configureFal` to shared module with one-time init flag.
- Pros: Eliminates per-request overhead, enables connection reuse
- Cons: Module-level state (acceptable for server singletons)
- Effort: Small
- Risk: Low

## Recommended Action
Implement Option 1.

## Acceptance Criteria
- [ ] S3Client created once and reused across requests
- [ ] `fal.config()` called once at first use, not per-request
- [ ] `configureFal` extracted to shared module (eliminates duplication)

## Work Log
- 2026-03-01: Identified during code review (performance-oracle + code-simplicity-reviewer agents)
