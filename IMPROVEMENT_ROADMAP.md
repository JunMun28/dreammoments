# DreamMoments Improvement Roadmap

> Compiled from a multi-agent review by 7 specialists: Product Manager, UI Designer, UX Designer, Architecture Critic, Researcher, Developer, and QA Tester.
>
> **Date**: February 2026
> **Current PRD Completeness**: ~90%

---

## Tier 1: Critical Fixes (Must Fix Before Launch)

These issues block a safe, functional production launch.

### 1.1 Password Reset Vulnerability ✅ Done (Sprint 1)
- **Source**: Critic (C1)
- **Problem**: `resetPasswordFn` accepts email + new password and immediately updates the hash. No email verification token, no OTP. Anyone who knows a user's email can reset their password.
- **Fix**: Implement email-based reset flow: request sends a time-limited token via email (Resend), reset endpoint validates token before accepting new password.
- **Effort**: M | **Impact**: Critical (security)
- **Files**: `src/api/auth.ts`, `src/lib/email.ts`

### 1.2 Broken Token Refresh ✅ Done (Sprint 1)
- **Source**: Critic (C3)
- **Problem**: `getSessionFn` passes the access token to `refreshSession()`, but `refreshSession` expects a refresh token (checks `type: "refresh"`). Token refresh never works -- all sessions expire after 1 hour with no renewal.
- **Fix**: Store refresh token client-side separately, pass it to the refresh endpoint.
- **Effort**: S | **Impact**: Critical (auth breaks after 1 hour)
- **Files**: `src/api/auth.ts`, `src/lib/session.ts`, `src/lib/auth.tsx`

### 1.3 Auto-Save Never Persists to Database ✅ Done (Sprint 1)
- **Source**: Critic (H6)
- **Problem**: `useAutoSave` calls `updateInvitationContent()` from `lib/data.ts`, which only writes to localStorage. Edits are never sent to the server. If the user clears browser data, all work is lost.
- **Fix**: Auto-save should call `updateInvitationFn` (the server function) to persist to PostgreSQL. Use localStorage as an optimistic cache layer, not the source of truth.
- **Effort**: M | **Impact**: Critical (data loss)
- **Files**: `src/components/editor/hooks/useAutoSave.ts`, `src/api/invitations.ts`

### 1.4 Zero Code Splitting ✅ Done (Sprint 1)
- **Source**: Critic (C4)
- **Problem**: All 4 template components are statically imported in `InvitationRenderer.tsx`. No `React.lazy()`, no dynamic imports. The entire app ships as one bundle.
- **Fix**: Lazy-load templates with `React.lazy()` + `Suspense`. Consider route-level code splitting for editor, dashboard, and auth routes.
- **Effort**: M | **Impact**: Critical (performance, page load time)
- **Files**: `src/components/templates/InvitationRenderer.tsx`, `src/router.tsx`

### 1.5 Add E2E Tests to CI ✅ Done (Sprint 1)
- **Source**: Developer, Tester
- **Problem**: 11 Playwright spec files exist but are never run in CI. No automated regression safety net.
- **Fix**: Add Playwright step to `.github/workflows/ci.yml`. Infrastructure already exists with `process.env.CI` support.
- **Effort**: S | **Impact**: Critical (quality gate)
- **Files**: `.github/workflows/ci.yml`

### 1.6 Add `pnpm build` to CI ✅ Done (Sprint 1)
- **Source**: Developer
- **Problem**: CI runs type-check and tests but never builds. Production build failures go undetected.
- **Fix**: Add `pnpm build` step after tests.
- **Effort**: S | **Impact**: Critical (deployment safety)
- **Files**: `.github/workflows/ci.yml`

---

## Tier 2: High-Impact UX Improvements

These significantly improve the user experience and conversion.

### 2.1 Wire Up OnboardingTour ✅ Done (Sprint 2)
- **Source**: UX Designer, UI Designer
- **Problem**: `OnboardingTour.tsx` is fully built (5 steps, keyboard support, responsive, localStorage persistence) but never rendered in the editor. Additionally, 10+ `dm-onboarding-*` CSS classes are missing from `styles.css`.
- **Fix**: Import and render `OnboardingTour` in `src/routes/editor/$invitationId.tsx`. Add the missing CSS classes to `styles.css`.
- **Effort**: S | **Impact**: High (first-time user retention)
- **Files**: `src/routes/editor/$invitationId.tsx`, `src/styles.css`

### 2.2 Fix Post-Signup Redirect ✅ Done (Sprint 2)
- **Source**: UX Designer
- **Problem**: After signup, users land on an empty dashboard with no invitations. They must find "New Invitation" themselves. Adds friction to the < 5 minute target.
- **Fix**: Redirect first-time users (0 invitations) to `/editor/new` instead of `/dashboard`.
- **Effort**: S | **Impact**: High (conversion, time-to-publish)
- **Files**: `src/routes/auth/signup.tsx`, `src/routes/dashboard/index.tsx`

### 2.3 Wire Up Mobile Edit FAB ✅ Done (Sprint 2)
- **Source**: UX Designer
- **Problem**: `onOpenBottomSheet` is not passed to `EditorLayout`, so mobile users have no obvious way to open the editing bottom sheet besides tapping section pills.
- **Fix**: Pass the `onOpenBottomSheet` handler to `EditorLayout` from the editor route.
- **Effort**: S | **Impact**: High (mobile editing discoverability)
- **Files**: `src/routes/editor/$invitationId.tsx`

### 2.4 Wire Up SectionRail ✅ Done (Sprint 2)
- **Source**: UX Designer
- **Problem**: `SectionRail` component is fully built with icons, progress rings, keyboard navigation, and ARIA -- but never used in the editor.
- **Fix**: Add `sectionRail` prop to `EditorLayout` on desktop.
- **Effort**: S | **Impact**: Medium (desktop navigation for 11+ section templates)
- **Files**: `src/routes/editor/$invitationId.tsx`

### 2.5 Add Toast/Notification System
- **Source**: UX Designer, UI Designer
- **Problem**: No global notification system. Publish, delete, save, export, and AI operations all lack satisfying confirmation feedback.
- **Fix**: Create a `Toast` UI primitive and global toast context. Wire to publish, delete, export, AI apply, and error operations.
- **Effort**: M | **Impact**: High (perceived quality and responsiveness)
- **Files**: `src/components/ui/Toast.tsx` (new), various consumers

### 2.6 Add Template Preview on Selection Page
- **Source**: UX Designer
- **Problem**: Template selection shows color gradients and metadata but no visual preview. Users commit to a template blind.
- **Fix**: Add thumbnail screenshots or link to live sample invitations from the selection page.
- **Effort**: M | **Impact**: High (template choice confidence)
- **Files**: `src/routes/editor/new.tsx` (or equivalent)

### 2.7 RSVP Form Client-Side Validation ✅ Done (Sprint 2)
- **Source**: UX Designer
- **Problem**: RSVP forms use `noValidate` with no client-side checks. Name can be empty, guest count unconstrained.
- **Fix**: Add required field validation and guest count min/max before submission.
- **Effort**: S | **Impact**: Medium (data quality)
- **Files**: Template RSVP components in `src/components/templates/*/`

### 2.8 RSVP Confirmation Experience
- **Source**: UX Designer
- **Problem**: After RSVP submission, users only see small text "RSVP received." No celebratory moment, no summary, no edit option.
- **Fix**: Show a confirmation modal with submitted details, success animation, and option to update response.
- **Effort**: M | **Impact**: Medium (guest satisfaction)
- **Files**: Template RSVP components

---

## Tier 3: Security Hardening

### 3.1 JWT Logout / Token Revocation
- **Source**: Critic (C2)
- **Problem**: Logout is a no-op. Stolen tokens remain valid for 1 hour.
- **Fix**: Implement a server-side token blocklist (DB table or Redis) checked on each `requireAuth` call. Or switch to short-lived access tokens (5 min) + opaque refresh tokens stored server-side.
- **Effort**: L | **Impact**: High (security)

### 3.2 CSRF Protection
- **Source**: Critic (H1)
- **Problem**: No CSRF tokens, no SameSite flags, no Origin checking. JWT-in-localStorage mitigates cookie-based CSRF but is XSS-vulnerable.
- **Fix**: Add CSRF token generation and validation on state-mutating endpoints. Consider SameSite cookies for session tokens.
- **Effort**: M | **Impact**: High (security)

### 3.3 Security Headers ✅ Done (Sprint 1)
- **Source**: Critic (M10)
- **Problem**: No Content-Security-Policy, X-Frame-Options, or X-Content-Type-Options headers.
- **Fix**: Configure security headers via Nitro/deployment config.
- **Effort**: S | **Impact**: Medium (security)

### 3.4 JWT Secret Enforcement in Production ✅ Done (Sprint 1)
- **Source**: Critic (M9)
- **Problem**: Short JWT secrets are silently accepted in production (length check only warns in dev).
- **Fix**: Invert the condition -- enforce minimum length in production, warn in dev.
- **Effort**: S | **Impact**: Medium (security)

### 3.5 AI Error Message Sanitization ✅ Done (Sprint 1)
- **Source**: Critic (H3)
- **Problem**: AI API errors return up to 200 chars of raw OpenAI error body, which could contain API key fragments.
- **Fix**: Return generic "AI generation failed" message; log the raw error server-side only.
- **Effort**: S | **Impact**: Medium (security)

### 3.6 Storage Filename Sanitization ✅ Done (Sprint 1)
- **Source**: Critic (M11)
- **Problem**: Current regex allows `../` in filenames, enabling potential path traversal.
- **Fix**: Use `path.basename()` and strip directory separators.
- **Effort**: S | **Impact**: Medium (security)

---

## Tier 4: New Features (Competitive Parity + Differentiation)

Based on competitor research (Xamiya, Joy, Paperless Post, ClickInvitation, Dream Fox).

### 4.1 Angpow / Digital Red Packet QR Code
- **Source**: Researcher
- **Problem**: #1 missing feature for Chinese MY/SG market. Xamiya already has it.
- **What**: QR code linking to DuitNow (MY) / PayNow (SG) for digital cash gifts.
- **Effort**: M | **Impact**: High (market fit, cultural need)

### 4.2 Dynamic OG Images for WhatsApp Sharing
- **Source**: Researcher
- **Problem**: In MY/SG, invitations are shared via WhatsApp. Beautiful preview cards drive viral sharing.
- **What**: Generate per-invitation OG images with couple names, date, and template preview. Serve via a dynamic image endpoint.
- **Effort**: M | **Impact**: High (viral growth)

### 4.3 Maps Integration (Waze + Google Maps) ✅ Done (Sprint 2)
- **Source**: Researcher
- **Problem**: Table-stakes feature all regional competitors have. Waze is dominant in MY/SG.
- **What**: Add Waze and Google Maps deep links to the venue section of all templates.
- **Effort**: S | **Impact**: High (user expectation)

### 4.4 Add-to-Calendar Buttons ✅ Done (Sprint 2)
- **Source**: Researcher
- **Problem**: Table-stakes feature. Every competitor offers it.
- **What**: Use `add-to-calendar-button` npm package. Support Google, Apple, Outlook, Yahoo. Auto timezone.
- **Effort**: S | **Impact**: High (user expectation)

### 4.5 Live Countdown Widget
- **Source**: Researcher
- **Problem**: Multiple competitors offer this. High perceived value.
- **What**: Real-time countdown to wedding date displayed on invitation. Template already has a "countdown" section type defined.
- **Effort**: S | **Impact**: Medium (engagement)

### 4.6 Envelope-Opening Animation
- **Source**: Researcher
- **Problem**: Paperless Post's signature feature. Would add premium feel.
- **What**: Animated envelope that "opens" when guest first visits the invitation URL.
- **Effort**: L | **Impact**: Medium (premium perception)

### 4.7 Background Music / Audio
- **Source**: Researcher
- **Problem**: Very common in regional competitors (Xamiya). Couples want their "song."
- **What**: Audio player with autoplay option (respecting browser policies), play/pause toggle.
- **Effort**: M | **Impact**: Medium (emotional engagement)

### 4.8 PWA with Offline Support
- **Source**: Researcher
- **Problem**: No regional competitor offers this. Guests at venues often have poor connectivity.
- **What**: Service worker for offline caching of published invitation pages.
- **Effort**: M | **Impact**: Medium (differentiator)

### 4.9 Paste from Spreadsheet for Guest Import
- **Source**: Product Manager
- **Problem**: PRD specifies it but only CSV upload is implemented.
- **What**: Detect tab-separated values from clipboard paste and parse into guest rows.
- **Effort**: S | **Impact**: Low (convenience)

---

## Tier 5: Technical Debt + DX

### 5.1 Build Reusable UI Primitives
- **Source**: UI Designer
- **Problem**: No Button, Input, Modal, Toast, Badge, or Dropdown components. Everything is manually styled, leading to inconsistency.
- **What**: Extract a component library from existing patterns. Start with Button, Input, Modal, Toast.
- **Effort**: L | **Impact**: High (maintainability, consistency)

### 5.2 Remove Client-Side Bcrypt Fallback
- **Source**: Critic (H5)
- **Problem**: `src/lib/auth.tsx` imports bcryptjs in the browser bundle for a localStorage-based fallback auth system. Insecure and bloats the bundle.
- **Fix**: Remove the client-side password fallback. Require server-side auth always.
- **Effort**: M | **Impact**: High (security, bundle size)

### 5.3 Analytics SQL Aggregation
- **Source**: Critic (H7)
- **Problem**: Analytics endpoint loads ALL `invitation_views` rows into memory and processes in JS.
- **Fix**: Replace with SQL `COUNT`, `GROUP BY`, date aggregation.
- **Effort**: M | **Impact**: High (performance at scale)

### 5.4 Refactor Editor Route Monolith
- **Source**: Critic (H8)
- **Problem**: `src/routes/editor/$invitationId.tsx` is 945 lines with 6+ modals, all editor state, AI, slug validation, publish flow.
- **Fix**: Extract into focused components and hooks: `PublishDialog`, `SlugEditor`, `PreviewDialog`, etc.
- **Effort**: L | **Impact**: Medium (maintainability)

### 5.5 Fix Inconsistent Error Patterns
- **Source**: Critic (M1)
- **Problem**: Some API handlers `throw Error()`, others `return { error: "..." }`. Callers must handle both.
- **Fix**: Standardize on one pattern (recommend thrown errors caught by a global error handler).
- **Effort**: M | **Impact**: Medium (reliability)

### 5.6 Configure React Query Defaults ✅ Done (Sprint 2)
- **Source**: Critic (M4)
- **Problem**: `QueryClient` has zero configuration -- 0ms staleTime means every query refetches on mount.
- **Fix**: Set sensible defaults: `staleTime: 30_000`, `gcTime: 300_000`.
- **Effort**: S | **Impact**: Medium (performance, fewer unnecessary requests)

### 5.7 Add `.env.example` ✅ Already Done
- **Source**: Developer
- **Problem**: 12+ env vars must be discovered by reading code.
- **Fix**: Create `.env.example` with all variables documented.
- **Effort**: S | **Impact**: Medium (DX, onboarding)

### 5.8 Move `drizzle-kit` to devDependencies
- **Source**: Developer
- **Problem**: CLI-only package in runtime dependencies.
- **Fix**: Move to devDependencies in `package.json`.
- **Effort**: S | **Impact**: Low (correctness)

### 5.9 Add Vitest Coverage Reporting
- **Source**: Tester
- **Problem**: No coverage reporting configured. Cannot track coverage trends.
- **Fix**: Add `coverage` section to Vitest config, add `test:coverage` script.
- **Effort**: S | **Impact**: Medium (visibility)

### 5.10 Write API Handler Tests
- **Source**: Tester
- **Problem**: All 9 API handlers in `src/api/` have zero unit tests. E2E tests bypass the real API via localStorage mock.
- **Fix**: Write integration tests for auth, invitations, guests, and payments handlers.
- **Effort**: L | **Impact**: High (confidence in server-side logic)

### 5.11 Fix Editor Hook Tests
- **Source**: Tester
- **Problem**: `editor-hooks.test.ts` only checks `typeof === "function"`. Zero behavioral tests for `useEditorState`, `useAutoSave`, `useFieldValidation`.
- **Fix**: Switch to jsdom environment and use `@testing-library/react` for proper hook testing.
- **Effort**: M | **Impact**: High (editor reliability)

### 5.12 Add Authorization Tests
- **Source**: Tester
- **Problem**: No tests verify that user A cannot access user B's invitations/data.
- **Fix**: Write tests that attempt cross-user access on all protected endpoints.
- **Effort**: M | **Impact**: High (security)

### 5.13 Fix Garden Romance Template Colors
- **Source**: Product Manager
- **Problem**: PRD specifies forest green (#2D5A3D) but implementation uses Chinese red (#C41E3A). Category is "chinese" instead of "garden".
- **Fix**: Decide whether to align with PRD or update PRD to match implementation. If this is intentional for the MY/SG Chinese market, update the PRD.
- **Effort**: S | **Impact**: Low (PRD alignment)

### 5.14 Rich Per-Template Animations
- **Source**: Product Manager
- **Problem**: PRD describes parallax, flower bloom, monogram SVG draw, sparkle effects. Types exist but animations are basic (fadeIn, slideUp, scale).
- **Fix**: Implement the signature animations specified in PRD Section 4 for each template.
- **Effort**: XL | **Impact**: Medium (visual wow factor, differentiator)

### 5.15 Add Error Boundaries ✅ Already Done
- **Source**: UI Designer, UX Designer
- **Problem**: No React error boundaries at application or route level. Any uncaught error crashes the entire page.
- **Fix**: Add error boundaries at route level with recovery UI.
- **Effort**: S | **Impact**: Medium (resilience)

### 5.16 Add Empty State Designs
- **Source**: UI Designer
- **Problem**: Zero-data scenarios (no views, no RSVPs, no photos) show blank areas with no guidance.
- **Fix**: Design illustrated empty states with actionable messaging.
- **Effort**: M | **Impact**: Medium (polish)

### 5.17 Centralize Shadow and Z-Index Tokens
- **Source**: UI Designer
- **Problem**: Hardcoded shadow values and scattered z-index values without a token system.
- **Fix**: Add `--dm-shadow-*` and `--dm-z-*` tokens to the design system.
- **Effort**: S | **Impact**: Low (maintainability)

### 5.18 Rate Limiter for Multi-Instance Deployment
- **Source**: Critic (H2)
- **Problem**: In-memory rate limiter doesn't share state across instances.
- **Fix**: Switch to Redis-backed or DB-backed rate limiting for production.
- **Effort**: M | **Impact**: Medium (security at scale)

### 5.19 Stripe Payment Method Configuration
- **Source**: Product Manager
- **Problem**: FPX/PayNow are shown in UI but not explicitly passed to Stripe API.
- **Fix**: Pass `payment_method_types` array to the Stripe Checkout Session creation.
- **Effort**: S | **Impact**: Medium (payment reliability)

---

## Suggested Implementation Order

### Sprint 1 (Week 1-2): Security + Critical Fixes
1. Password reset email verification (1.1)
2. Fix token refresh (1.2)
3. Auto-save to database (1.3)
4. Code splitting (1.4)
5. Security headers (3.3)
6. JWT secret enforcement (3.4)
7. AI error sanitization (3.5)
8. Storage filename fix (3.6)
9. CI: add build + E2E (1.5, 1.6)

### Sprint 2 (Week 3-4): UX Quick Wins
1. Wire up OnboardingTour + CSS (2.1)
2. Fix post-signup redirect (2.2)
3. Wire up mobile FAB (2.3)
4. Wire up SectionRail (2.4)
5. RSVP validation (2.7)
6. Add-to-Calendar buttons (4.4)
7. Maps integration (4.3)
8. `.env.example` (5.7)
9. React Query defaults (5.6)
10. Error boundaries (5.15)

### Sprint 3 (Week 5-6): Features + Polish
1. Toast notification system (2.5)
2. Dynamic OG images (4.2)
3. Live countdown widget (4.5)
4. Template preview on selection (2.6)
5. RSVP confirmation experience (2.8)
6. Angpow QR code (4.1)
7. Empty state designs (5.16)

### Sprint 4 (Week 7-8): Technical Debt
1. UI primitives library (5.1)
2. Remove client-side bcrypt (5.2)
3. Analytics SQL aggregation (5.3)
4. Editor route refactor (5.4)
5. API handler tests (5.10)
6. Editor hook tests (5.11)
7. Authorization tests (5.12)
8. Vitest coverage (5.9)

### Sprint 5 (Week 9-10): Differentiation
1. Background music (4.7)
2. Envelope animation (4.6)
3. PWA offline support (4.8)
4. Rich per-template animations (5.14)
5. Token revocation (3.1)
6. CSRF protection (3.2)
7. Multi-instance rate limiter (5.18)

---

## Summary Statistics

| Category | Count |
|----------|-------|
| Critical fixes | 6 |
| UX improvements | 8 |
| Security hardening | 6 |
| New features | 9 |
| Technical debt | 19 |
| **Total items** | **48** |

| Effort | Count |
|--------|-------|
| S (Small, < 1 day) | 20 |
| M (Medium, 1-3 days) | 20 |
| L (Large, 3-5 days) | 6 |
| XL (Extra Large, 1+ week) | 2 |
