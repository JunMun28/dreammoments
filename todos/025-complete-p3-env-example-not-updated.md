---
status: pending
priority: p3
issue_id: "025"
tags: [code-review, documentation, deployment, living-portrait]
dependencies: []
---

# .env.example Not Updated with New Environment Variables

## Problem Statement
Six new environment variables (`FAL_KEY`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_PUBLIC_URL`) are required for the Living Portrait feature but are not documented in `.env.example`. Developers setting up local environments won't know these are needed.

## Findings
- `src/api/r2.ts:8-14` — Reads 5 R2 env vars
- `src/api/ai-avatar.ts:40` / `src/api/ai-animation.ts:37` — Reads `FAL_KEY`
- `.env.example` — Not updated
- Existing `.env.example` references different R2 vars (`VITE_R2_UPLOAD_URL`, `VITE_R2_PUBLIC_BASE_URL`) from prior integration

## Proposed Solutions
Add all 6 new env vars to `.env.example` with comments.
- Effort: Small
- Risk: Low

## Work Log
- 2026-03-01: Identified during code review (deployment-verification-agent)
