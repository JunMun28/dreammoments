---
status: pending
priority: p2
issue_id: "022"
tags: [code-review, performance, database, living-portrait]
dependencies: []
---

# Sequential DB Queries in Polling Endpoint (Should Be JOIN)

## Problem Statement
`getAnimationStatusFn` makes two sequential DB queries on every poll (every 2-5 seconds): (1) get the generation record, (2) verify ownership via invitation. Over a typical video generation session (~60 polls), this totals 120 database queries for what is a status check.

## Findings
- `src/api/ai-animation.ts:143-163` — Two sequential queries per poll
- Polling interval: 2s (first 15 attempts) then 5s
- Typical session: ~60 polls = 120 queries

## Proposed Solutions
### Option 1: Single JOIN query (Recommended)
Combine into one query: `SELECT job.*, inv.userId FROM ai_generations job JOIN invitations inv ON ...`
- Pros: Halves DB load during polling
- Cons: Slightly more complex query
- Effort: Small
- Risk: Low

## Recommended Action
Implement the JOIN query.

## Acceptance Criteria
- [ ] Status check uses single JOIN query instead of two sequential queries
- [ ] Ownership still verified correctly

## Work Log
- 2026-03-01: Identified during code review (performance-oracle agent)
