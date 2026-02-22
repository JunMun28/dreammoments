---
module: Invitation APIs
date: 2026-02-19
problem_type: security_issue
component: service_object
symptoms:
  - "Patch endpoint accepted unsafe path segments and allowed prototype pollution attempts"
  - "AI acceptance mutation could update by generationId without invitation scope"
  - "Fallback guest mutations could target guestId outside the current invitation"
  - "Generated migration bundled unrelated DDL outside invitation snapshot scope"
  - "Security parity differed between DB and fallback mutation paths"
root_cause: missing_validation
resolution_type: code_fix
severity: critical
tags: [prototype-pollution, authorization, invitation-scope, fallback-parity, migration-scope]
---

# Troubleshooting: Invitation API Hardening Bundle

## Problem
A set of API handlers trusted unscoped identifiers and paths. That enabled cross-resource mutation risk, prototype pollution risk, and high-risk migration drift in one feature stream.

## Environment
- Module: Invitation APIs
- Affected Component: server functions in invitations/ai/guests, local fallback data layer, Drizzle migration artifact
- Date: 2026-02-19

## Symptoms
- `patchInvitationContentFn` accepted `__proto__` path segments.
- `applyAiResultFn` accepted `generationId` updates without invitation ownership constraint.
- Guest fallback delete/bulk-update paths mutated by `guestId` only.
- Migration `0001_freezing_captain_britain.sql` contained unrelated tables/index/constraint churn.
- DB path and fallback path authorization behavior diverged.

## What Didn't Work
**Original implementation:**
- Path patching trusted arbitrary dot segments.
- AI acceptance update matched only generation primary key.
- Fallback guest mutations ignored invitation scope.
- Generated migration accepted as-is.

- **Why it failed:** every case skipped explicit scope validation at write-time.

## Solution
Applied 4 coordinated fixes.

**Code changes:**
```ts
// src/api/invitations.ts
const FORBIDDEN_PATH_SEGMENTS = new Set(["__proto__", "prototype", "constructor"]);
if (keys.some((key) => FORBIDDEN_PATH_SEGMENTS.has(key))) {
  throw new Error("Invalid path");
}

// src/api/ai.ts
await db.update(schema.aiGenerations).set({ accepted: true }).where(
  and(
    eq(schema.aiGenerations.id, data.generationId),
    eq(schema.aiGenerations.invitationId, data.invitationId),
  ),
);
localMarkAiGenerationAccepted(data.generationId, data.invitationId);

// src/api/guests.ts + src/lib/data.ts
const updated = localUpdateGuestInInvitation(data.invitationId, guestId, patch);
const deleted = localDeleteGuestInInvitation(data.invitationId, data.guestId);
```

```sql
-- drizzle/0001_freezing_captain_britain.sql
-- reduced to invitation_snapshots table + FK + index only
```

**Files changed:**
- `src/api/invitations.ts`
- `src/api/ai.ts`
- `src/api/guests.ts`
- `src/lib/data.ts`
- `drizzle/0001_freezing_captain_britain.sql`
- `drizzle/meta/0001_snapshot.json`
- `src/tests/api-invitations.test.ts`
- `src/tests/api-ai.test.ts`
- `src/tests/api-guests.test.ts`

## Why This Works
1. Path segment denylist blocks prototype chain keys before object mutation.
2. AI acceptance writes now require `(generationId, invitationId)` match.
3. Fallback guest writes now mirror DB-scoped authorization semantics.
4. Migration artifact now matches feature scope, removing unrelated operational risk.
5. Regression tests lock all new scope/path invariants.

## Prevention
- For any write endpoint, scope by both resource id and parent/owner id.
- Keep fallback logic authorization-equivalent to DB logic.
- Treat path-based patch APIs as hostile input; validate each segment.
- Reject drift-heavy generated migrations; keep DDL minimal and feature-scoped.
- Add tests for wrong-invitation/wrong-owner ids on every mutation endpoint.

## Verification
- `pnpm check` passed.
- `pnpm tsc --noEmit` passed.
- `pnpm vitest run src/tests/api-invitations.test.ts src/tests/api-ai.test.ts src/tests/api-guests.test.ts` passed.
- `pnpm test` still shows known pre-existing `ERR_REQUIRE_ESM` (`html-encoding-sniffer` -> `@exodus/bytes`) unrelated to these fixes.

## Related Issues
No related issues documented yet.
