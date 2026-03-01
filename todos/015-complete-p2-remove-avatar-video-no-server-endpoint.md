---
status: pending
priority: p2
issue_id: "015"
tags: [code-review, agent-native, r2-storage, living-portrait]
dependencies: []
---

# Remove Avatar/Video: No Server Endpoint + R2 Storage Orphans

## Problem Statement
"Remove avatar" and "Remove video" actions are UI-only — they clear content fields via `onChange` callbacks flowing through auto-save debounce. No R2 storage cleanup occurs. This creates: (1) orphaned R2 objects accumulating storage cost, (2) no agent-native parity for removal actions, (3) removal dependent on 2-second auto-save timer (closing browser may lose the removal).

Additionally, video re-generation in `generateAvatarFn` does not clean up the dependent video from R2 when the avatar changes.

## Findings
- `src/components/editor/hooks/useLivingPortrait.ts:197-204` — `removeAvatar` only calls `onChange`, no server call
- `src/components/editor/hooks/useLivingPortrait.ts:206-214` — `removeVideo` only calls `onChange`, no server call
- `src/api/ai-avatar.ts:135-141` — Cleans up previous avatar on re-generation, but NOT the dependent video
- `src/api/ai-animation.ts` — No cleanup of previous video on re-animation
- R2 orphans accumulate at `avatars/{invitationId}/` and `animations/{invitationId}/` with no cleanup path

## Proposed Solutions
### Option 1: Create dedicated server functions (Recommended)
Add `removeAvatarFn` and `removeAnimationFn` server functions that verify ownership, delete from R2, and patch invitation content atomically.
- Pros: Atomic, agent-callable, proper R2 cleanup
- Cons: Two new server functions
- Effort: Medium
- Risk: Low

### Option 2: Add R2 cleanup to existing patch endpoint
Hook into `patchInvitationContentFn` to detect avatar/video URL changes and clean up R2.
- Pros: No new endpoints
- Cons: Couples storage logic to generic patch endpoint, harder to maintain
- Effort: Medium
- Risk: Medium

## Recommended Action
Implement Option 1. Also add video cleanup to `generateAvatarFn` when avatar changes.

## Acceptance Criteria
- [ ] `removeAvatarFn` server function: verifies ownership, deletes avatar + dependent video from R2, patches content
- [ ] `removeAnimationFn` server function: verifies ownership, deletes video from R2, patches content
- [ ] UI removal buttons call new server functions directly (not auto-save)
- [ ] `generateAvatarFn` cleans up old video from R2 when avatar changes
- [ ] Re-animation cleans up old video from R2

## Work Log
- 2026-03-01: Identified during code review (agent-native-reviewer agent)
