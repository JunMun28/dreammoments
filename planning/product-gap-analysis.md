# DreamMoments Product Gap Analysis

> PRD v1.0 vs Current Implementation
> Date: 2026-02-08
> Author: Product Manager (AI-assisted review)

---

## Executive Summary

DreamMoments has strong foundational implementation across editor, templates, auth, and RSVP. The core editing experience is ~90% complete with impressive depth (10 hooks, keyboard shortcuts, inline editing, mobile bottom sheet). However, there are **5 critical gaps** that block a credible launch: real payment processing, analytics dashboard, WhatsApp/QR sharing, image storage reliability, and the publish flow UX. An estimated 3-4 weeks of focused work would close the MVP gaps; another 2-3 weeks would add high-conversion features.

---

## 1. Critical PRD Gaps That Block Launch

### 1.1 Payments: Mock Only (BLOCKER)

**PRD Requirement**: Stripe integration with card, FPX (MY), PayNow (SG), GrabPay payment methods. Webhook handling for payment success. Premium feature gating.

**Current State**: The `/upgrade` route (`src/routes/upgrade.tsx`) is entirely mock -- it calls `recordPayment()` and `updateUserPlan()` locally with no Stripe API calls. The payment table schema exists in the DB but is never written to by Stripe. No checkout session creation, no webhook handler, no redirect flow.

**Gap**:
- No Stripe SDK integration (no `@stripe/stripe-js` or server-side `stripe` package)
- No checkout session creation endpoint
- No webhook endpoint for `payment_intent.succeeded`
- No FPX / PayNow / GrabPay payment method configuration
- Premium feature gating works locally but has no server-verified payment status
- No receipt/confirmation email

**Impact**: Cannot monetize. Zero revenue. The free-to-paid funnel is the primary business model.

**Effort**: **L** (5-8 days) -- Stripe integration, webhook handler, feature gating, payment method config, testing

---

### 1.2 Analytics: Minimal Dashboard (BLOCKER for Premium Value)

**PRD Requirement**: Views over time (line chart), RSVP rate, unique visitors, views by day with period filter (7d/30d/all), device breakdown.

**Current State**:
- `src/routes/dashboard/$invitationId/index.tsx` shows basic counts (views, RSVPs, attending, pending)
- A rudimentary SVG with dots for "views by day" exists but is not a proper chart
- Device mix (mobile/desktop) is shown as a text line
- No period filtering (7d/30d/all)
- No unique visitor deduplication logic
- The `getAnalytics()` function reads from localStorage, not from the server API

**Gap**:
- No proper chart library (missing recharts, chart.js, or similar)
- No server-side analytics aggregation endpoint (PRD Section 8.4 `GET /api/invitations/:id/analytics` not implemented as a server function)
- No period-based filtering
- Analytics data is read from localStorage `getAnalytics()`, not from the DB `invitation_views` table
- No "recent responses" list

**Impact**: Premium tier offers "Full analytics" as a key differentiator. Without it, there is no visible premium value beyond custom slug.

**Effort**: **M** (3-5 days) -- Analytics server endpoint, chart component, period filters, connect to DB views table

---

### 1.3 Sharing: WhatsApp Pre-format and QR Code (PARTIAL)

**PRD Requirement**: Copy link, WhatsApp share (pre-formatted message), QR code download.

**Current State**: `ShareModal.tsx` actually implements all three:
- Copy link via `navigator.clipboard.writeText()`
- WhatsApp share via `wa.me` URL with pre-formatted message including couple names and date
- QR code via external API (`api.qrserver.com`) with download link

**Gap** (minor):
- QR code is generated via external third-party API (privacy concern, availability risk)
- No QR code customization (logo, colors matching template)
- WhatsApp message could be richer (include RSVP prompt, not just the link)
- No share tracking (which channel drives views)
- Share modal lacks focus trap and proper dialog semantics (no `role="dialog"`, no `aria-modal`)

**Impact**: Functional but could be more polished. Low launch risk.

**Effort**: **S** (1-2 days) -- Self-hosted QR generation, enhanced WhatsApp message, share analytics

---

### 1.4 Image Storage: DataURL Fallback (CONCERN)

**PRD Requirement**: Cloudflare R2 for image storage.

**Current State**: `src/lib/storage.ts` checks for `VITE_R2_UPLOAD_URL` and `VITE_R2_PUBLIC_BASE_URL` env vars. If not set, falls back to base64 DataURL stored in the invitation JSONB content field.

**Gap**:
- DataURL images bloat the JSONB content field (a single photo can be 500KB+ as base64)
- No image optimization (resize, compress, WebP conversion)
- R2 upload has no error handling, no retry, no size limits
- No image deletion when invitations are deleted (R2 orphans)
- Gallery section with multiple photos will cause significant content bloat without R2

**Impact**: Performance will degrade rapidly with image-heavy invitations. Gallery feature is effectively broken for production use without R2.

**Effort**: **M** (3-4 days) -- R2 configuration, image optimization pipeline, size limits, cleanup

---

### 1.5 Publish Flow UX (INCOMPLETE)

**PRD Requirement**: Click "Publish" -> upgrade prompt -> Stripe checkout -> success -> share modal with link, WhatsApp, QR.

**Current State**:
- Publish button in editor triggers upgrade dialog for free users
- "Continue Free" publishes with random slug
- "Upgrade" navigates to `/upgrade` (mock Stripe)
- After upgrade, there is no automatic redirect back to the invitation
- No publish confirmation with share modal
- The `handleShare()` function navigates to dashboard with `?share=true` but the dashboard doesn't check this param to auto-open share modal

**Gap**:
- Post-publish share modal doesn't auto-open
- No "Congratulations, your invitation is live!" celebration moment
- No link preview of the published URL
- No publish status indicator in editor toolbar

**Impact**: The "signup to shareable link in 5 minutes" flow is broken at the finish line. Users publish but don't get a clear path to share.

**Effort**: **S** (1-2 days) -- Post-publish flow, auto-open share modal, celebration UI

---

## 2. Features That Would Most Improve Conversion

Ranked by expected impact on the free-to-paid conversion funnel:

### 2.1 Real Stripe Payment Integration
**Impact**: HIGH -- Without this, there is literally zero revenue.
**Conversion lever**: Direct monetization.

### 2.2 Compelling Premium Value Display
**Impact**: HIGH -- Users need to see what they're paying for.
**What's needed**: Side-by-side free vs premium comparison, analytics preview, custom URL preview, AI generations counter showing "5/5 used, upgrade for 100 more".
**Effort**: S

### 2.3 Publish Celebration + Share Flow
**Impact**: HIGH -- This is the moment of highest emotional engagement. A seamless publish -> celebrate -> share flow drives viral distribution.
**Effort**: S

### 2.4 Template Showcase on Landing Page
**Impact**: MEDIUM-HIGH -- The landing page shows 3 templates (garden-romance, love-at-dusk, blush-romance) but:
- Does NOT show Eternal Elegance (4th template)
- Template cards link to `/invite/{id}-sample` (sample view) which works
- No live template preview with animations on the landing page itself
- PRD specifies "Full-page sections, one template per section" with scroll-triggered animations
**Effort**: M

### 2.5 OG / Social Meta Tags with Dynamic Images
**Impact**: MEDIUM -- When couples share their invitation link, the preview card matters enormously for click-through. Currently uses a static `/og-default.svg` for all invitations.
**What's needed**: Dynamic OG image generation per invitation (couple names, date, template colors).
**Effort**: M

### 2.6 Analytics Dashboard for Premium
**Impact**: MEDIUM -- Justifies the premium price. Couples want to track who has viewed and responded.
**Effort**: M

---

## 3. Quick Wins vs Big Lifts

### Quick Wins (< 1 day each)

| Item | Description | Effort |
|------|-------------|--------|
| **Publish celebration** | After publish, show confetti/animation + auto-open share modal | 0.5d |
| **AI usage counter in editor** | Show "3/5 AI generations used" badge near AI button | 0.5d |
| **Premium comparison modal** | Enhance upgrade dialog with feature comparison table | 0.5d |
| **Share modal a11y** | Add `role="dialog"`, `aria-modal`, focus trap to ShareModal | 0.5d |
| **Invitation status badge** | Show draft/published status in editor toolbar | 0.25d |
| **WhatsApp message enhancement** | Add RSVP prompt and emojis to share message | 0.25d |
| **Dashboard empty state** | Better empty state with template previews instead of plain text | 0.5d |
| **4th template on landing** | Add Eternal Elegance to the landing page showcase grid | 0.5d |
| **Copy link toast feedback** | Show "Link copied!" toast after clipboard write | 0.25d |
| **Meta description for landing** | Add proper OG tags and meta description to index route | 0.25d |

### Medium Lifts (1-3 days each)

| Item | Description | Effort |
|------|-------------|--------|
| **Analytics dashboard** | Chart library + server endpoint + period filters | 3d |
| **Self-hosted QR code** | Replace external API with `qrcode` npm package | 1d |
| **Image optimization** | Sharp-based resize/compress on upload, WebP output | 2d |
| **Dynamic OG images** | Server-side OG image generation per invitation | 2d |
| **Guest import paste** | Paste from spreadsheet with auto-column detection (PRD 3.5) | 2d |
| **Dashboard search/filters** | Add search bar and status filter to invitation list | 1.5d |
| **RSVP email notifications** | Send email to couple when new RSVP is submitted | 2d |
| **Reduced motion support** | Audit all animations, ensure prefers-reduced-motion works everywhere | 1d |

### Big Lifts (4+ days each)

| Item | Description | Effort |
|------|-------------|--------|
| **Stripe integration** | Full payment flow: checkout, webhooks, premium gating | 5-8d |
| **R2 production setup** | Cloudflare R2 bucket, upload worker, CDN, cleanup | 3-5d |
| **Template versioning** | Snapshot templates at publish time, fallback rendering | 4-5d |
| **Error monitoring** | Sentry setup, source maps, error boundaries | 2-3d |
| **Deployment pipeline** | Vercel/production deployment, env config, CI/CD | 3-4d |
| **SEO + landing page** | Full-page template sections with scroll animations per PRD | 5-7d |

---

## 4. Prioritized Feature Backlog

### P0 -- Must Have for MVP Launch

| # | Feature | Gap Description | Effort | Dependency |
|---|---------|----------------|--------|------------|
| 1 | **Stripe payment integration** | Mock-only payment blocks all revenue | XL | None |
| 2 | **R2 image storage setup** | DataURL fallback breaks gallery feature at scale | L | None |
| 3 | **Publish + share flow** | Post-publish UX is broken; no celebration, no auto-share | S | None |
| 4 | **Analytics server endpoint** | Analytics reads localStorage, not DB | M | None |
| 5 | **Production deployment** | No deployment pipeline exists | L | #1, #2 |
| 6 | **Error monitoring (Sentry)** | No error visibility in production | M | #5 |
| 7 | **Image optimization** | No resize/compress; images bloat storage and slow loading | M | #2 |

### P1 -- Should Have for Launch Quality

| # | Feature | Gap Description | Effort | Dependency |
|---|---------|----------------|--------|------------|
| 8 | **Premium value display** | Upgrade prompt doesn't justify RM49/SGD19 | S | None |
| 9 | **Analytics charts** | No proper visualization; SVG dots inadequate | M | #4 |
| 10 | **Dynamic OG images** | All invitations share same generic preview image | M | #5 |
| 11 | **Self-hosted QR code** | External API dependency for QR generation | S | None |
| 12 | **Share modal a11y** | Missing dialog semantics, focus trap, ESC handler | S | None |
| 13 | **Dashboard search + filter** | PRD specifies but not implemented | S | None |
| 14 | **RSVP email notifications** | PRD implies; missing entirely | M | #5 |
| 15 | **Landing page template showcase** | Only 3 of 4 templates shown; no full-page scroll sections | M | None |

### P2 -- Nice to Have Post-Launch

| # | Feature | Gap Description | Effort | Dependency |
|---|---------|----------------|--------|------------|
| 16 | **AI style override UI** | AI can generate style overrides but no UI to apply/preview them | M | None |
| 17 | **Template versioning** | No snapshot on publish; updates could break old invitations | L | None |
| 18 | **Guest import paste from spreadsheet** | PRD specifies auto-detect columns from paste | M | None |
| 19 | **RSVP update flow** | Guests cannot update their RSVP after submission (PRD 5.2) | M | None |
| 20 | **Guest account for reminders** | PRD specifies optional signup for event reminders | L | #14 |
| 21 | **Bulk operations on dashboard** | Select multiple invitations for archive/delete | S | None |
| 22 | **Undo/redo depth indicator** | Show undo stack depth (PRD says "last 20 actions") | S | None |
| 23 | **GSAP scroll animations** | PRD specifies GSAP ScrollTrigger; current uses Motion | L | None |

---

## 5. Recommended MVP Launch Scope

### What to Include (MVP)

1. **Editor**: Ship as-is. It is 90%+ complete and very capable.
2. **Templates**: Ship all 4. They exceed the PRD requirement of 3.
3. **Auth**: Ship as-is. Email + Google OAuth + JWT is complete.
4. **RSVP**: Ship as-is. Form submission, guest list, CSV export, dietary summary, manual add -- all working.
5. **AI Assistant**: Ship as-is. 6 generation types, drawer UI, usage limits -- exceeds PRD.
6. **Stripe Payments**: Must implement before launch. Block 5-8 days.
7. **R2 Image Storage**: Must configure for production. Block 3-5 days.
8. **Publish + Share Flow**: Fix the post-publish UX. Block 1-2 days.
9. **Analytics Server Endpoint**: Connect analytics to DB instead of localStorage. Block 3-5 days.
10. **Production Deployment**: Vercel/domain setup. Block 3-4 days.

### What to Defer (Post-Launch v1.1)

- Dynamic OG images (can launch with static OG)
- RSVP email notifications (couples check dashboard manually initially)
- AI style override UI (AI content generation is sufficient for launch)
- Template versioning (low risk in v1.0 since templates are stable)
- Guest import paste-from-spreadsheet (CSV import is enough)
- Dashboard bulk operations
- GSAP animations (Motion library works fine)

### What to Cut Entirely

- Guest accounts for reminders (over-engineered for MVP)
- Full-page landing page sections per template (current showcase grid is sufficient)
- Password-protected invitations (PRD explicitly says "no password for MVP")

---

## 6. Implementation Gap Matrix

| PRD Feature | Section | Status | Gap Severity |
|-------------|---------|--------|-------------|
| Template selection (3 templates) | 3.1 | EXCEEDS (4 templates) | None |
| Split-screen editor | 3.2 | Complete | None |
| Mobile tap-to-edit | 3.2 | Complete (bottom sheet) | None |
| Live preview sync | 3.2 | Complete | None |
| Sample data pre-fill | 3.2 | Complete | None |
| Field validation | 3.2 | Complete (real-time) | None |
| Auto-save (30s) | 3.2 | Complete | None |
| Undo/Redo (20 actions) | 3.2 | Complete | None |
| AI content generation | 3.3 | Complete (6 types) | None |
| AI style adjustment | 3.3 | Partial (backend only) | Low -- no UI |
| AI auto-translation | 3.3 | Complete | None |
| AI floating button | 3.3 | Complete (drawer UI) | None |
| AI usage limits | 3.3 | Complete (free: 5, paid: 100) | None |
| Section show/hide | 3.4 | Complete | None |
| RSVP guest form | 3.5 | Complete | None |
| RSVP guest list with filters | 3.5 | Complete | None |
| RSVP dietary summary | 3.5 | Complete | None |
| RSVP CSV export | 3.5 | Complete | None |
| RSVP search | 3.5 | Complete | None |
| RSVP manual add | 3.5 | Complete | None |
| Guest CSV import | 3.5 | Complete (premium-gated) | None |
| Guest paste from spreadsheet | 3.5 | Missing | Medium |
| Dashboard invitation list | 3.6 | Complete | None |
| Dashboard RSVP overview | 3.6 | Complete (basic) | Low |
| Dashboard analytics | 3.6 | Partial (no charts/trends) | High |
| Dashboard settings | 3.6 | Complete (slug, publish/unpublish) | None |
| Share: copy link | 3.7 | Complete | None |
| Share: WhatsApp | 3.7 | Complete | None |
| Share: QR code | 3.7 | Complete (external API) | Low |
| Auth: Google OAuth | 3.8 | Complete | None |
| Auth: Email/password | 3.8 | Complete | None |
| Payments: Stripe | 9.1 | Mock only | CRITICAL |
| Payments: FPX | 9.1 | Mock only | CRITICAL |
| Payments: PayNow | 9.1 | Mock only | CRITICAL |
| Scroll animations | 6.3 | Partial (Motion, not GSAP) | Low |
| Reduced motion | 6.3 | Partial (landing page only) | Medium |
| Template versioning | 6.4 | Schema exists, no snapshot logic | Medium |
| Image storage (R2) | 6.1 | Fallback to DataURL | High |
| Error monitoring | 10 | Missing | Medium |
| Production deployment | 10 | Missing | CRITICAL |

---

## 7. Risk Assessment

### High Risk
- **No revenue path**: Payment integration is the single biggest risk. Without it, the product cannot sustain development.
- **Image scaling**: DataURL storage will cause production performance issues at scale. Must be resolved before launch.

### Medium Risk
- **localStorage fallback pattern**: The entire data layer has a `if (db) { ... } else { localStorage }` pattern. This works for development but is fragile. If `DATABASE_URL` is misconfigured in production, data silently falls back to server memory (lost on restart).
- **No error monitoring**: Production issues will be invisible without Sentry or equivalent.
- **Template drift**: Without versioning snapshots, a template code change could break previously published invitations.

### Low Risk
- **4th template**: Having 4 templates instead of 3 is a positive deviation.
- **Motion vs GSAP**: The Motion library provides adequate animations. GSAP migration is optional.
- **Missing guest paste import**: CSV import covers the same use case, just less convenient.

---

## 8. Competitive Readiness Score

| Dimension | Score (1-5) | Notes |
|-----------|-------------|-------|
| Template quality | 4.5 | Exceeds expectation with 4 premium templates |
| Editor UX | 4.0 | Excellent desktop experience; mobile is good but has edge cases |
| AI features | 4.0 | Comprehensive content generation; style override UI missing |
| RSVP management | 4.0 | Full feature set including import/export/dietary |
| Sharing | 3.5 | All channels present; QR uses external API |
| Analytics | 2.0 | Barely functional; no charts, no trends, no server data |
| Payments | 0.0 | Non-functional; mock only |
| Production readiness | 1.5 | No deployment, no monitoring, no image CDN |
| **Overall** | **3.0** | Strong product, not yet launch-ready |

---

## 9. Recommended Sprint Plan

### Sprint 1 (Week 1-2): Revenue + Infrastructure
- Stripe integration (XL)
- R2 image storage configuration (L)
- Image optimization pipeline (M)

### Sprint 2 (Week 3): Analytics + Polish
- Analytics server endpoint + chart library (M)
- Publish celebration + share flow fix (S)
- Premium value display enhancement (S)
- Share modal accessibility (S)

### Sprint 3 (Week 4): Launch Prep
- Production deployment to Vercel (L)
- Sentry error monitoring (M)
- Dynamic OG images (M)
- Landing page: add 4th template (S)
- End-to-end testing of full publish flow (M)

**Estimated time to MVP launch: 4 weeks of focused development.**
