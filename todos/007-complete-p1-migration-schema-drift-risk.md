---
status: complete
priority: p1
issue_id: "007"
tags: [code-review, database, migration, operations]
dependencies: []
---

# Split Unrelated DDL from Snapshot Migration

## Problem Statement

Generated migration `0001_freezing_captain_britain.sql` includes many schema changes unrelated to invitation snapshots, including constraint/index drops and payment FK behavior changes. This is high deployment risk for a feature-scoped change.

## Findings

- Intended addition is `invitation_snapshots` table (`line 1`).
- Migration also adds `rate_limit_entries` and `token_blocklist` (`line 10`, `line 18`).
- Migration drops/recreates payment constraints and changes nullability (`line 25`, `line 31`, `line 36`).
- Migration drops old view indexes and introduces new composite index (`line 29`, `line 30`, `line 39`).
- Affected file: `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/drizzle/0001_freezing_captain_britain.sql:10`.

## Proposed Solutions

### Option 1: Regenerate focused migration only for snapshots

**Approach:** Reset/realign Drizzle metadata and regenerate migration containing only snapshot table + related FK/index.

**Pros:**
- Small, auditable migration
- Minimizes production blast radius

**Cons:**
- Requires metadata cleanup discipline
- May defer previously intended drift fixes

**Effort:** Small

**Risk:** Low

---

### Option 2: Keep all DDL but split into explicit migrations

**Approach:** Separate snapshot migration from infra/schema-drift migration, each with clear rollout notes.

**Pros:**
- Preserves pending schema updates
- Improves deploy sequencing and rollback clarity

**Cons:**
- More migration files and review overhead
- Requires explicit migration plan in PR

**Effort:** Medium

**Risk:** Medium

---

### Option 3: Accept current migration with deployment playbook

**Approach:** Ship as-is but add strict pre/post checks, lock-step rollout, and rollback instructions.

**Pros:**
- Fastest path

**Cons:**
- Highest operational risk
- Harder to reason about failures

**Effort:** Small

**Risk:** High

## Recommended Action


## Technical Details

**Affected files:**
- `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/drizzle/0001_freezing_captain_britain.sql`
- `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/drizzle/meta/0001_snapshot.json`
- `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/drizzle/meta/_journal.json`

**Related components:**
- Drizzle migration pipeline
- Payments FK semantics
- Analytics indexing

**Database changes (if any):**
- Yes, multiple unrelated DDL statements currently bundled

## Resources

- Review target: current branch `codex/canvas-editor-phase1`

## Acceptance Criteria

- [ ] Snapshot feature migration isolated or explicitly split from unrelated DDL
- [ ] Any non-snapshot DDL justified in review notes and tested
- [ ] Migration can run safely on current production state
- [ ] Rollback path documented

## Work Log

### 2026-02-19 - Initial Discovery

**By:** Codex

**Actions:**
- Compared new migration content against expected feature scope.
- Flagged unrelated table creation, constraint rewrites, and index churn.

**Learnings:**
- Current migration likely reflects accumulated schema drift, not just this feature.

### 2026-02-19 - Resolution

**By:** Codex

**Actions:**
- Rewrote `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/drizzle/0001_freezing_captain_britain.sql` to only include `invitation_snapshots` DDL.
- Rebuilt `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/drizzle/meta/0001_snapshot.json` from `0000` snapshot + `invitation_snapshots` table metadata.
- Verified migration artifact no longer contains unrelated payments/index/rate-limit statements.

**Learnings:**
- Drift-heavy generated migrations should be split or constrained before merge to avoid hidden operational risk.

## Notes

- Treat as merge-blocking until scope is clarified or split.
