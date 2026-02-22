---
status: complete
priority: p2
issue_id: "008"
tags: [code-review, security, api, ai]
dependencies: []
---

# Enforce Ownership When Marking AI Generation Accepted

## Problem Statement

`applyAiResultFn` marks AI generations as accepted using only `generationId`. It does not verify the generation belongs to the same invitation/user, allowing cross-invitation state mutation if an ID is known.

## Findings

- DB path updates `ai_generations` with `where id = generationId` only.
- No invitation/user scope check in update query.
- local fallback mirrors same unscope via `localMarkAiGenerationAccepted(generationId)`.
- Affected code: `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/api/ai.ts:521`.

## Proposed Solutions

### Option 1: Scope update by invitation ID

**Approach:** Add `and(eq(schema.aiGenerations.id, generationId), eq(schema.aiGenerations.invitationId, data.invitationId))`.

**Pros:**
- Minimal patch
- Aligns with invitation ownership checks already in handler

**Cons:**
- Does not explicitly verify user ownership on generation if invitation linkage is later changed

**Effort:** Small

**Risk:** Low

---

### Option 2: Verify generation ownership before update

**Approach:** Read generation row first, verify invitation/user, then update.

**Pros:**
- Strong explicit authorization
- Better error responses (`generation not found` vs no-op)

**Cons:**
- Extra query

**Effort:** Small

**Risk:** Low

---

### Option 3: Remove `generationId` mutation from this endpoint

**Approach:** Keep content-apply endpoint pure; move acceptance state update into dedicated endpoint.

**Pros:**
- Clearer endpoint responsibilities
- Easier auditing and testing

**Cons:**
- API surface grows
- Caller needs extra request

**Effort:** Medium

**Risk:** Medium

## Recommended Action


## Technical Details

**Affected files:**
- `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/api/ai.ts`

**Related components:**
- AI generation history
- Invitation ownership controls

**Database changes (if any):**
- No

## Resources

- Review target: current branch `codex/canvas-editor-phase1`

## Acceptance Criteria

- [ ] `applyAiResultFn` only marks accepted generations for the same invitation
- [ ] Unauthorized or mismatched generation IDs do not mutate data
- [ ] Unit tests cover mismatch case (different invitation generation)
- [ ] Existing apply flow remains functional

## Work Log

### 2026-02-19 - Initial Discovery

**By:** Codex

**Actions:**
- Reviewed acceptance update query in new `applyAiResultFn`.
- Confirmed missing invitation scoping in both DB and fallback paths.

**Learnings:**
- Ownership checks on invitation are not sufficient when secondary IDs are independently writable.

### 2026-02-19 - Resolution

**By:** Codex

**Actions:**
- Scoped AI generation acceptance update in `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/api/ai.ts` by both `generationId` and `invitationId`.
- Updated fallback path to call `markAiGenerationAccepted(generationId, invitationId)` for consistent scope.
- Added test assertion in `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/tests/api-ai.test.ts` validating invitation-scoped fallback call.

**Learnings:**
- Secondary resource updates in composite handlers need explicit ownership constraints, not implied context.

## Notes

- Important integrity issue; should be fixed before relying on generation acceptance for analytics/product logic.
