---
status: pending
priority: p1
issue_id: "011"
tags: [code-review, security, ssrf, living-portrait]
dependencies: []
---

# SSRF: Unvalidated Image URLs Passed to fal.ai

## Problem Statement
`heroImageUrl` and `avatarImageUrl` are read from the invitation's JSONB content and passed directly to fal.ai API as `image_url` without any URL validation. Since `patchInvitationContentFn` accepts `z.unknown()` values, any authenticated user can write an arbitrary URL (e.g., `http://169.254.169.254/latest/meta-data/`) into their invitation content, then trigger avatar/animation generation to have fal.ai fetch that URL using our API credentials.

## Findings
- `src/api/ai-avatar.ts:109` — `heroImageUrl` from JSONB passed to `fal.subscribe` input
- `src/api/ai-animation.ts:103` — `avatarImageUrl` from JSONB passed to `fal.queue.submit` input
- `src/api/invitations.ts:443` — `patchInvitationContentFn` accepts `value: z.unknown()`, allowing arbitrary URL injection
- Impact: Abuse of fal.ai API credentials to probe arbitrary URLs; potential information leakage via error responses; API cost exploitation

## Proposed Solutions
### Option 1: URL allowlist validation (Recommended)
Add a helper that only allows HTTPS URLs from known domains (R2 public URL, fal.ai CDN, Unsplash).
- Pros: Simple, effective, blocks all non-allowed domains
- Cons: Must maintain allowlist
- Effort: Small
- Risk: Low

### Option 2: Validate URL scheme only (HTTPS-only)
Only require `https://` protocol, block private/internal IPs.
- Pros: More permissive for user-uploaded images from various sources
- Cons: Less restrictive, still allows probing public URLs
- Effort: Small
- Risk: Medium

## Recommended Action
Implement Option 1. Create `isAllowedImageUrl()` helper in `src/api/r2.ts` that validates against R2 public URL domain and known CDN domains. Apply before every fal.ai API call.

## Technical Details
- Affected files: `src/api/ai-avatar.ts`, `src/api/ai-animation.ts`
- New file/function: `isAllowedImageUrl()` validation helper

## Acceptance Criteria
- [ ] All image URLs passed to fal.ai are validated against an allowlist
- [ ] Non-HTTPS URLs are rejected
- [ ] Internal/private IP ranges are blocked
- [ ] Error message is user-friendly ("Invalid hero image URL")

## Work Log
- 2026-03-01: Identified during code review (security-sentinel agent)

## Resources
- Prior art: `docs/solutions/security-issues/cross-invitation-mutation-and-prototype-pollution-system-20260219.md`
- OWASP A10:2021 — Server-Side Request Forgery
