---
status: pending
priority: p3
issue_id: "026"
tags: [code-review, security, auth, living-portrait]
dependencies: []
---

# localStorage Token Should Use AuthContext

## Problem Statement
`BlockInspectorSidebar.tsx` reads the auth token directly from `localStorage` in the render path instead of using the existing `AuthContext`. This bypasses centralized auth, is fragile for SSR, and exposes the token in React DevTools.

## Findings
- `src/components/canvas/BlockInspectorSidebar.tsx:159-164` — Direct `window.localStorage.getItem("dm-auth-token")` in render
- Existing `AuthContext` already manages this token
- Token should be passed as a prop from the parent (like `invitationId` already is)

## Proposed Solutions
Pass `token` from the parent component via `useAuth()` context, following the same pattern as `invitationId`.
- Effort: Small
- Risk: Low

## Work Log
- 2026-03-01: Identified during code review (security-sentinel + kieran-typescript-reviewer agents)
