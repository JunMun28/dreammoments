---
status: pending
priority: p2
issue_id: "021"
tags: [code-review, simplicity, duplication, living-portrait]
dependencies: []
---

# Duplicated Server-Side Helpers (configureFal, Rate Limit, Ownership)

## Problem Statement
Three patterns are copy-pasted between `ai-avatar.ts` and `ai-animation.ts`: `configureFal()` function, rate limit count query, and ownership verification query. Subtle inconsistencies exist (different error messages). Changes to rate limit logic or ownership checks must be made in both files.

## Findings
- `configureFal()`: identical in both files except error message ("AI image service" vs "AI video service")
- Rate limit query: identical SQL in both files, same `MAX_LIVING_PORTRAIT_GENERATIONS = 8` constant
- Ownership verification: identical `SELECT content FROM invitations WHERE id = ? AND userId = ?` pattern
- ~25 LOC of duplication

## Proposed Solutions
### Option 1: Extract to shared module (Recommended)
Create `src/api/ai-shared.ts` with `ensureFalConfigured()`, `checkLivingPortraitQuota(db, invitationId)`, and `verifyInvitationOwnership(db, invitationId, userId)`.
- Effort: Small
- Risk: Low

## Recommended Action
Extract shared helpers. This also addresses the singleton fal.config issue (todo 017).

## Acceptance Criteria
- [ ] Shared helpers extracted to single module
- [ ] Both API files import from shared module
- [ ] No duplicated constants (MAX_LIVING_PORTRAIT_GENERATIONS)

## Work Log
- 2026-03-01: Identified during code review (code-simplicity-reviewer agent)
