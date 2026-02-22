---
status: complete
priority: p1
issue_id: "006"
tags: [code-review, security, api]
dependencies: []
---

# Block Prototype Pollution in patchInvitationContentFn

## Problem Statement

`patchInvitationContentFn` accepts an arbitrary dot-path and writes it into a plain object without segment validation. Special keys like `__proto__`, `prototype`, and `constructor` can mutate object prototypes, creating server-side prototype pollution.

## Findings

- Untrusted `path` from request is used directly in `setNestedValue`.
- `current[key] = {}` and then `current = current[key]` allows traversal into `__proto__` chain.
- Confirmed via repro that `"__proto__.x"` sets `({}).x` globally.
- Affected code: `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/api/invitations.ts:619` and `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/api/invitations.ts:634`.

## Proposed Solutions

### Option 1: Denylist dangerous segments

**Approach:** Reject any path segment equal to `__proto__`, `prototype`, or `constructor` before mutation.

**Pros:**
- Fast, minimal patch
- Keeps current API contract

**Cons:**
- Still allows arbitrary key writes beyond expected schema
- Requires careful maintenance of blocked keys

**Effort:** Small

**Risk:** Low

---

### Option 2: Whitelist allowed paths

**Approach:** Only allow known invitation content paths (or section-based allowed prefixes) and reject all others.

**Pros:**
- Strongest safety and schema control
- Prevents malformed/unexpected structure writes

**Cons:**
- More implementation effort
- Requires path registry maintenance as schema evolves

**Effort:** Medium

**Risk:** Low

---

### Option 3: Safe setter utility + schema validation

**Approach:** Replace custom setter with hardened utility that treats objects as own-properties only, then validate full content against schema after patch.

**Pros:**
- Defense-in-depth
- Catches malformed output early

**Cons:**
- Extra runtime cost
- Larger refactor

**Effort:** Medium

**Risk:** Medium

## Recommended Action


## Technical Details

**Affected files:**
- `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/api/invitations.ts`

**Related components:**
- Server function input handling
- Invitation content mutation path

**Database changes (if any):**
- No

## Resources

- Review target: current branch `codex/canvas-editor-phase1`

## Acceptance Criteria

- [ ] `patchInvitationContentFn` rejects dangerous path segments (`__proto__`, `prototype`, `constructor`)
- [ ] Add tests asserting malicious paths are rejected
- [ ] Normal safe paths still patch successfully
- [ ] `pnpm tsc --noEmit`, `pnpm check`, and target tests pass

## Work Log

### 2026-02-19 - Initial Discovery

**By:** Codex

**Actions:**
- Reviewed new partial patch endpoint implementation.
- Traced `path` handling to custom `setNestedValue`.
- Reproduced pollution behavior with a Node snippet.

**Learnings:**
- Current setter is vulnerable to prototype pollution in its present form.

### 2026-02-19 - Resolution

**By:** Codex

**Actions:**
- Added safe path validation with forbidden segment checks in `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/api/invitations.ts`.
- Hardened nested setter to reject dangerous segments and avoid unsafe object traversal.
- Added test coverage for malicious path rejection in `/Users/wongjunmun/Developer/tanstack_projects/dreammoments/src/tests/api-invitations.test.ts`.

**Learnings:**
- Path-based patch APIs require strict segment validation before any object mutation.

## Notes

- This is merge-blocking due security impact on shared runtime state.
