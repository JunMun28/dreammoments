---
status: pending
priority: p1
issue_id: "012"
tags: [code-review, security, performance, living-portrait]
dependencies: []
---

# No File Size Limit on fal.ai Downloads (Memory DoS)

## Problem Statement
Generated images and videos from fal.ai are downloaded entirely into Node.js process memory via `Buffer.from(await response.arrayBuffer())` with no size limit. AI-generated videos from Kling v2.1 Pro can be 10-50MB. Under concurrent load, this can cause OOM crashes.

## Findings
- `src/api/ai-avatar.ts:130` — `Buffer.from(await imageResponse.arrayBuffer())` — no size guard
- `src/api/ai-animation.ts:212` — `Buffer.from(await videoResponse.arrayBuffer())` — no size guard
- At 5 concurrent video generations: 50-250 MB heap allocation for buffering alone
- At 50 concurrent: 500 MB - 2.5 GB — potential OOM on constrained servers

## Proposed Solutions
### Option 1: Add size guard before buffering (Recommended for v1)
Check `Content-Length` header and reject oversized responses. Still buffers, but prevents unbounded allocation.
- Pros: Simple, quick to implement
- Cons: Still buffers the full file in memory
- Effort: Small
- Risk: Low

### Option 2: Streaming transfer with @aws-sdk/lib-storage
Use `Upload` from `@aws-sdk/lib-storage` to stream directly from fal.ai to R2, computing hash incrementally.
- Pros: Constant memory regardless of file size, scales to any concurrency
- Cons: More complex, requires content-addressed key workaround (two-phase upload or post-upload rename)
- Effort: Medium
- Risk: Medium

## Recommended Action
Implement Option 1 now (size guard), track Option 2 as a follow-up optimization.

## Technical Details
- Affected files: `src/api/ai-avatar.ts`, `src/api/ai-animation.ts`
- Suggested limits: 10 MB for images, 100 MB for videos

## Acceptance Criteria
- [ ] Image downloads reject responses over 10 MB
- [ ] Video downloads reject responses over 100 MB
- [ ] Size is checked via Content-Length header before buffering
- [ ] Post-download size check as fallback (in case header is missing)
- [ ] User-friendly error message on rejection

## Work Log
- 2026-03-01: Identified during code review (security-sentinel + performance-oracle agents)

## Resources
- OWASP A04:2021 — Insecure Design
