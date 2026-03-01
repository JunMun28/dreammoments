---
status: pending
priority: p2
issue_id: "019"
tags: [code-review, reliability, polling, living-portrait]
dependencies: []
---

# Unbounded Polling in Happy Path

## Problem Statement
The `pollVideoStatus` function caps error retries at 60 attempts, but the success-path polling (status === "processing") has no maximum. If fal.ai returns "processing" indefinitely (a plausible stuck-job scenario), the client polls the server forever at 5-second intervals.

## Findings
- `src/components/editor/hooks/useLivingPortrait.ts:135-138` — No max attempt check on processing status
- `src/components/editor/hooks/useLivingPortrait.ts:140-151` — Error path capped at 60 attempts
- Indefinite polling wastes server resources and provides no timeout feedback to user

## Proposed Solutions
### Option 1: Add max attempt to processing path (Recommended)
Cap at 120 attempts (~10 minutes at 5s intervals). Show timeout error.
- Effort: Small
- Risk: Low

## Recommended Action
Add `if (attempt >= 120)` timeout check in the processing branch.

## Acceptance Criteria
- [ ] Polling times out after a maximum number of attempts
- [ ] User sees a clear timeout error message
- [ ] Polling cleanup occurs on timeout

## Work Log
- 2026-03-01: Identified during code review (kieran-typescript-reviewer + security-sentinel agents)
