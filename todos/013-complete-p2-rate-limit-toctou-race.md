---
status: pending
priority: p2
issue_id: "013"
tags: [code-review, security, rate-limiting, living-portrait]
dependencies: []
---

# Rate Limit Bypass via TOCTOU Race Condition

## Problem Statement
The rate limit is a read-then-check pattern: count generations, compare against limit, then proceed with the expensive fal.ai API call before inserting the record. Two concurrent requests can both read the same count and both pass the check, allowing users to exceed the 8-generation limit.

## Findings
- `src/api/ai-avatar.ts:86-102` — Count query followed by limit check, then fal.ai call, then insert
- `src/api/ai-animation.ts:79-96` — Same pattern
- Gap between count read and record insert is seconds (fal.ai API call duration)
- Rapid concurrent requests could all read count=0 and all pass

## Proposed Solutions
### Option 1: Insert pending record first (claim-a-slot pattern) (Recommended)
Insert a "pending" record atomically before the fal.ai call, using a conditional INSERT that checks the count. Update to "completed" or delete on failure.
- Pros: Atomic, no race window
- Cons: Requires cleanup of failed pending records
- Effort: Medium
- Risk: Low

### Option 2: SELECT FOR UPDATE in transaction
Lock the count rows during the check.
- Pros: Traditional approach
- Cons: Holds locks during long fal.ai calls (bad for concurrency)
- Effort: Medium
- Risk: Medium (lock contention)

## Recommended Action
Implement Option 1 — insert a pending record first, then proceed with the API call.

## Technical Details
- Affected files: `src/api/ai-avatar.ts`, `src/api/ai-animation.ts`

## Acceptance Criteria
- [ ] Concurrent requests cannot exceed the 8-generation limit
- [ ] Failed/cancelled generations are cleaned up
- [ ] Rate limit count is accurate even under concurrent load

## Work Log
- 2026-03-01: Identified during code review (security-sentinel agent)
