---
status: pending
priority: p2
issue_id: "020"
tags: [code-review, database, migration, living-portrait]
dependencies: []
---

# Migration DEFAULT 'pending' Incorrect for Existing Completed Rows

## Problem Statement
The migration adds `status varchar(20) DEFAULT 'pending'` to `ai_generations`. Existing rows represent completed text-generation requests (AI assistant for schedule, FAQ, story, etc.) with `accepted = true`. These will read as `status = 'pending'` despite being finished work. This is semantically incorrect and a latent data integrity issue.

## Findings
- `drizzle/0003_flippant_black_crow.sql:1` — `DEFAULT 'pending'` applied to all existing rows
- `src/db/seed.ts:322-356` — Seed data inserts with `accepted: true` but no `status` field
- `src/api/ai.ts:435-440` — `listAiGenerationsFn` returns all columns including `status`
- Currently no UI renders the `status` field for old generations, but it's a latent issue

## Proposed Solutions
### Option 1: Remove DEFAULT, set status explicitly on insert (Recommended)
Change column to `status varchar(20)` (no default). Both `generateAvatarFn` and `submitAnimationFn` already explicitly set `status` on insert. Old rows get `NULL` (meaning "pre-status-tracking").
- Pros: Semantically correct, no backfill needed
- Cons: Requires regenerating migration
- Effort: Small
- Risk: Low

### Option 2: Add backfill UPDATE
Keep the default but add `UPDATE ai_generations SET status = 'completed' WHERE accepted = true AND external_job_id IS NULL`.
- Pros: Fixes existing rows
- Cons: More migration complexity
- Effort: Small
- Risk: Low

## Recommended Action
Option 1 — remove the DEFAULT and update seed data to set `status: "completed"` explicitly.

## Acceptance Criteria
- [ ] Existing rows have `status = NULL` (not 'pending')
- [ ] New living-portrait rows have explicit `status` values
- [ ] Seed data includes `status: "completed"` for existing entries

## Work Log
- 2026-03-01: Identified during code review (data-migration-expert agent)
