---
status: pending
priority: p2
issue_id: "014"
tags: [code-review, typescript, type-safety, living-portrait]
dependencies: []
---

# Unsafe Type Assertions on JSONB Data and External API Responses

## Problem Statement
Multiple cascading `as` casts bypass TypeScript's type system throughout the feature. JSONB content from the database is cast without runtime validation, external fal.ai API responses are blindly cast to expected shapes, and the useLivingPortrait hook casts `Record<string, unknown>` parameters. If data doesn't match expectations, failures are silent.

## Findings
- `src/api/ai-avatar.ts:75-77` — `content as Record<string, unknown>`, `hero as Record<string, unknown>`, `heroImageUrl as string`
- `src/api/ai-animation.ts:71-73` — Same cascading cast pattern
- `src/api/ai-avatar.ts:117` — `result as { images?: Array<{ url: string }> }` — blind cast on fal.ai response
- `src/api/ai-animation.ts:193` — `result as { video?: { url: string } }` — blind cast on fal.ai response
- `src/components/editor/hooks/useLivingPortrait.ts:33-37` — Four `as` casts on `heroData` parameter
- `src/components/editor/hooks/useLivingPortrait.ts:66-68, 113-116, 175-177` — Server function return values cast without narrowing
- `src/components/canvas/BlockInspectorSidebar.tsx:187-191` — Four `as` casts on block.content

## Proposed Solutions
### Option 1: Runtime type guards + typed interfaces (Recommended)
Create `parseHeroFromContent()` helper with `typeof` guards for JSONB. Type `heroData` as a proper interface. Add Zod schemas for fal.ai response shapes.
- Pros: Catches runtime mismatches, reusable, testable
- Cons: More code
- Effort: Medium
- Risk: Low

### Option 2: Zod schemas for all external boundaries
Full Zod parsing at every boundary (DB read, API response, hook params).
- Pros: Maximum safety
- Cons: Heavier, more verbose
- Effort: Large
- Risk: Low

## Recommended Action
Implement Option 1 — focused runtime guards at the two critical boundaries (JSONB reads and fal.ai responses).

## Technical Details
- Affected files: `src/api/ai-avatar.ts`, `src/api/ai-animation.ts`, `src/components/editor/hooks/useLivingPortrait.ts`, `src/components/canvas/BlockInspectorSidebar.tsx`

## Acceptance Criteria
- [ ] No cascading `as` casts on JSONB content — use runtime `typeof` guards
- [ ] External API responses validated before use
- [ ] `heroData` parameter typed with a proper interface
- [ ] Server function return values narrowed with type guards, not `as` casts

## Work Log
- 2026-03-01: Identified during code review (kieran-typescript-reviewer agent)
