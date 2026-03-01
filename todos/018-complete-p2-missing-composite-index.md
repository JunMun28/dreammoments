---
status: pending
priority: p2
issue_id: "018"
tags: [code-review, performance, database, living-portrait]
dependencies: []
---

# Missing Composite Index for Rate-Limit Query

## Problem Statement
The rate-limit count query filters on three columns (`invitation_id`, `section_id`, `accepted`) but only has a single-column index on `invitation_id`. PostgreSQL will use the index to narrow by invitation_id, then sequentially filter on the remaining two predicates.

## Findings
- `src/api/ai-avatar.ts:86-95` — `WHERE invitation_id = ? AND section_id IN (...) AND accepted = true`
- `src/api/ai-animation.ts:80-89` — Same query
- Current indexes: `idx_ai_invitation` on `(invitation_id)` only
- Query runs on every avatar/animation generation request

## Proposed Solutions
### Option 1: Add composite index (Recommended)
```sql
CREATE INDEX idx_ai_living_portrait_rate ON ai_generations(invitation_id, section_id, accepted);
```
- Pros: Index-only scan, O(1) performance
- Cons: Minor write overhead for index maintenance
- Effort: Small
- Risk: Low

## Recommended Action
Add composite index in a new migration.

## Acceptance Criteria
- [ ] Composite index covers `(invitation_id, section_id, accepted)`
- [ ] Rate-limit query uses index-only scan (verify with EXPLAIN)

## Work Log
- 2026-03-01: Identified during code review (performance-oracle agent)
