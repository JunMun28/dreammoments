# DreamMoments Unified Improvement Roadmap

> **Synthesized from 7 expert reviews** | Date: 2026-02-08
> Product Manager | UX Designer | UI Designer | Senior Developer | QA Tester | Competitive Researcher | Critical Review Panel

---

## 1. Executive Summary

DreamMoments is a well-conceived product targeting an underserved niche (Chinese couples in Malaysia/Singapore) with genuine differentiators: cinematic scroll animations, AI content generation with bilingual EN/ZH support, and local-market pricing. The editor experience is ~90% complete and impressively crafted with 10+ custom hooks, keyboard shortcuts, accessibility foundations, and responsive design.

However, the product is **not launch-ready**. Seven independent reviews converge on the same diagnosis: the hardest 30% of the work -- payments, email, deployment, security hardening, and data persistence -- remains untouched.

### Readiness Scores Across Reviews

| Reviewer | Score | Key Concern |
|----------|-------|-------------|
| Product Manager | 3.0/5 | Payment mock, no deployment |
| UX Designer | 6.5/10 | Broken user flows, mobile editing undiscoverable |
| UI Designer | 3.5/5 | Template typography disconnect, contrast failures |
| Senior Developer | 6/10 | Security vulnerabilities, localStorage as DB |
| QA Tester | -- | 8 critical findings, zero unit tests |
| Competitive Researcher | -- | Blue ocean opportunity but must ship fast |
| Critical Review Panel | 3/10 | "Impressive prototype, not a product" |

### Consensus Launch Readiness: 3/10

**Critical path to a credible beta**: 4-5 weeks of focused development (see Section 6).

---

## 2. P0: Launch Blockers

These items are existential. Without them, the product cannot function as a business. All must be completed before ANY launch.

### P0-01: Make PostgreSQL Mandatory in Production

| Field | Value |
|-------|-------|
| **Description** | Every API handler uses `getDbOrNull()` with localStorage fallback. In production, localStorage means data is per-browser, guests cannot see published invitations, and all data is lost on browser clear. Remove the localStorage fallback from server functions; require `DATABASE_URL` in production. |
| **Sources** | Senior Developer (1.2), Critical Review (2), Product Manager (7.2) |
| **Effort** | M (2-3 days) |
| **Impact** | Critical |
| **Dependencies** | None |
| **Category** | Infrastructure |

### P0-02: Fix Password Reset Vulnerability

| Field | Value |
|-------|-------|
| **Description** | `resetPasswordFn` accepts email + new password with NO verification (no email token, no OTP). Anyone can reset any user's password by knowing their email. Implement email-based verification token flow. |
| **Sources** | Senior Developer (7.4) |
| **Effort** | L (3-4 days) |
| **Impact** | Critical |
| **Dependencies** | P0-07 (Email service) |
| **Category** | Security |

### P0-03: Implement Stripe Payment Integration

| Field | Value |
|-------|-------|
| **Description** | Payment is 100% mocked. No Stripe SDK, no checkout session, no webhook handler, no payment verification. Implement: Stripe Checkout, webhook for `payment_intent.succeeded`, premium feature gating with server-verified status. Start with card payments; FPX/PayNow can follow. |
| **Sources** | Product Manager (1.1), Critical Review (2), All reviews |
| **Effort** | XL (5-8 days) |
| **Impact** | Critical |
| **Dependencies** | P0-01 (DB required) |
| **Category** | Business |

### P0-04: Route Auto-Save Through Server Database

| Field | Value |
|-------|-------|
| **Description** | `useAutoSave` writes only to localStorage, never to the server. Users editing on one device cannot see changes from another. Route `updateInvitationContent` through the server function to write to PostgreSQL. Reduce interval from 30s to 2-3s (debounced). |
| **Sources** | Senior Developer (1.2, 2.1), UX Designer (1.4), Critical Review (2) |
| **Effort** | M (2-3 days) |
| **Impact** | Critical |
| **Dependencies** | P0-01 (DB required) |
| **Category** | Infrastructure |

### P0-05: Add Rate Limiting to Auth & Public Endpoints

| Field | Value |
|-------|-------|
| **Description** | No rate limiting on `loginFn`, `signupFn`, `resetPasswordFn`, or `submitRsvpFn`. Attackers can brute-force passwords or flood invitations with fake RSVPs. Implement per-IP rate limiting. |
| **Sources** | Senior Developer (7.5, 7.6), Critical Review (2) |
| **Effort** | M (1-2 days) |
| **Impact** | Critical |
| **Dependencies** | None |
| **Category** | Security |

### P0-06: Production Deployment Pipeline

| Field | Value |
|-------|-------|
| **Description** | No CI/CD, no deployment config, no staging environment. Set up: Vercel deployment, GitHub Actions CI with lint + test, environment variable management, domain setup. |
| **Sources** | Product Manager (1.5), Critical Review (5), Product Manager (5) |
| **Effort** | L (3-4 days) |
| **Impact** | Critical |
| **Dependencies** | P0-01, P0-03 |
| **Category** | Infrastructure |

### P0-07: Basic Email Infrastructure

| Field | Value |
|-------|-------|
| **Description** | Zero email infrastructure exists. No signup confirmation, no RSVP notification, no password reset emails. Integrate a transactional email service (Resend recommended -- free for <3K emails/month). Implement: signup confirmation, password reset token email, RSVP notification to couple. |
| **Sources** | Critical Review (2) |
| **Effort** | M (2-3 days) |
| **Impact** | Critical |
| **Dependencies** | None |
| **Category** | Infrastructure |

### P0-08: Pin Nitro to Stable Version

| Field | Value |
|-------|-------|
| **Description** | `nitro: "npm:nitro-nightly@latest"` uses nightly builds of the SSR server. No stability guarantees, could break on any install, no security audit trail. Pin to a specific stable version. |
| **Sources** | Senior Developer (10.1) |
| **Effort** | S (< 1 hour) |
| **Impact** | Critical |
| **Dependencies** | None |
| **Category** | Infrastructure |

### P0-09: Fix Color Contrast WCAG Failures

| Field | Value |
|-------|-------|
| **Description** | Four color contrast failures identified: (1) Peach `#FFB7B2` on beige in landing hero and Blush template (~2.1:1, needs 3:1+), (2) Eternal Elegance gold `#C9A962` on white (~2.4:1), (3) Garden Romance gold `#D4AF37` on ivory (~2.2:1), (4) Blush tagline peach on white. Darken text colors or restrict light colors to decorative use only. |
| **Sources** | QA Tester (C-04, C-05, C-06), UI Designer (7) |
| **Effort** | S (< 1 day) |
| **Impact** | Critical |
| **Dependencies** | None |
| **Category** | UI |

### P0-10: Apply Template-Specific Typography

| Field | Value |
|-------|-------|
| **Description** | 3 of 4 templates (Blush Romance, Eternal Elegance, Love at Dusk) render with Outfit font instead of their declared fonts (Cormorant Garamond, Didot/Bodoni, Playfair Display). Only Garden Romance applies its own typography. This destroys the value proposition of multiple templates -- they look typographically identical. Scope each template's CSS custom properties or use inline styles. |
| **Sources** | UI Designer (8.2), Critical Review (3) |
| **Effort** | M (2-3 days) |
| **Impact** | Critical |
| **Dependencies** | None |
| **Category** | UI |

---

## 3. P1: Launch Critical

Needed for a credible beta launch with the first 10 users. Not existential but required for trust and usability.

### P1-01: Fix Publish + Share Flow

| Field | Value |
|-------|-------|
| **Description** | After clicking "Continue Free", the invitation publishes silently with no confirmation, no share URL, no next step. The `?share=true` query param is set but never read. Implement: post-publish celebration UI, auto-open share modal with URL/WhatsApp/QR, clear status indicator. |
| **Sources** | UX Designer (2.1), Product Manager (1.5) |
| **Effort** | S (1-2 days) |
| **Impact** | High |
| **Dependencies** | None |
| **Category** | UX |

### P1-02: Add Landing Page Hero CTA

| Field | Value |
|-------|-------|
| **Description** | The landing page hero has no call-to-action button. The CTA styles (`.dm-cta-primary`) exist in CSS but are never rendered. Users must scroll to the template showcase to find entry points. Add "Create Your Invitation" button linking to signup/template selection. |
| **Sources** | UX Designer (2.1), UI Designer (4.1), QA Tester |
| **Effort** | S (< 0.5 day) |
| **Impact** | High |
| **Dependencies** | None |
| **Category** | UX |

### P1-03: Build Template Selection Flow

| Field | Value |
|-------|-------|
| **Description** | No `/templates` page exists. New users from dashboard hit "Create Invitation" which links to `/editor/new` -- a route that does not exist. Build a template picker page or modal with all 4 templates, live previews, and "Use This Template" CTAs. |
| **Sources** | UX Designer (2.1) |
| **Effort** | M (2-3 days) |
| **Impact** | High |
| **Dependencies** | None |
| **Category** | UX |

### P1-04: Make Mobile Editing Discoverable

| Field | Value |
|-------|-------|
| **Description** | On mobile, the editor loads with only the preview visible. No button or CTA opens the bottom sheet. Users must tap preview sections (which have no tap affordance). Add a floating "Edit" FAB or auto-open the bottom sheet at 30% on first load. Also: tapping a pill on the external bar should open the bottom sheet. |
| **Sources** | UX Designer (3.1, 3.2) |
| **Effort** | M (1-2 days) |
| **Impact** | High |
| **Dependencies** | None |
| **Category** | UX |

### P1-05: Add Inline Editing Visual Affordances

| Field | Value |
|-------|-------|
| **Description** | Preview text is inline-editable but has no visual indication (no hover state, no pencil icon, no dashed underline). Users must guess they can click. Add hover states to editable text elements in templates. |
| **Sources** | UX Designer (1.3) |
| **Effort** | M (1-2 days) |
| **Impact** | High |
| **Dependencies** | None |
| **Category** | UX |

### P1-06: Use Human-Readable Section Labels

| Field | Value |
|-------|-------|
| **Description** | Section pills and headers show raw IDs ("hero", "rsvp", "faq") instead of display names ("Welcome Header", "Guest RSVP", "FAQ"). Add a `displayName` field to `SectionConfig` or maintain a label map. |
| **Sources** | UX Designer (1.2, 1.5) |
| **Effort** | S (< 1 day) |
| **Impact** | High |
| **Dependencies** | None |
| **Category** | UX |

### P1-07: Validate Input on All Server Functions

| Field | Value |
|-------|-------|
| **Description** | `signupFn` and `generateAiContentFn` have pass-through input validators that accept any data. `guests.ts` correctly uses Zod. Extend Zod validation to all server functions (auth, AI, invitations). |
| **Sources** | Senior Developer (3.1) |
| **Effort** | S (< 1 day) |
| **Impact** | High |
| **Dependencies** | None |
| **Category** | Security |

### P1-08: JWT Security Hardening

| Field | Value |
|-------|-------|
| **Description** | JWT stored in localStorage (XSS-vulnerable), 7-day expiry with no refresh rotation, no revocation/blocklist. `logoutFn` is a server-side no-op. Implement: httpOnly cookie storage OR short-lived access tokens (15 min) + refresh token rotation. Add JWT_SECRET length validation. Use random ephemeral secret in dev instead of hardcoded string. |
| **Sources** | Senior Developer (7.1, 7.2, 7.3), Critical Review (2) |
| **Effort** | L (2-3 days) |
| **Impact** | High |
| **Dependencies** | None |
| **Category** | Security |

### P1-09: Error Monitoring (Sentry)

| Field | Value |
|-------|-------|
| **Description** | No error monitoring exists. Production issues will be invisible. Set up Sentry free tier with source maps, error boundaries, and alert notifications. |
| **Sources** | Product Manager (6), Critical Review (5) |
| **Effort** | S (< 1 day) |
| **Impact** | High |
| **Dependencies** | P0-06 (Deployment) |
| **Category** | Infrastructure |

### P1-10: Cloudflare R2 Image Storage

| Field | Value |
|-------|-------|
| **Description** | Images fall back to base64 DataURLs stored in JSONB, which bloats the database (500KB+ per image). Configure R2 bucket, upload endpoint, CDN URL, and image size/type validation. Add client-side validation (max 10MB, JPEG/PNG/WebP only). |
| **Sources** | Product Manager (1.4), Critical Review (2) |
| **Effort** | L (3-4 days) |
| **Impact** | High |
| **Dependencies** | P0-06 (Deployment) |
| **Category** | Infrastructure |

### P1-11: Analytics Server Endpoint

| Field | Value |
|-------|-------|
| **Description** | Analytics reads from localStorage, not from the `invitation_views` DB table. No charts, no trends, no period filtering. Implement `GET /api/invitations/:id/analytics` reading from DB, add a chart library, period filters (7d/30d/all). |
| **Sources** | Product Manager (1.2, 4) |
| **Effort** | M (3-4 days) |
| **Impact** | High |
| **Dependencies** | P0-01 (DB required) |
| **Category** | Feature |

### P1-12: Fix Landing Page Pricing Section

| Field | Value |
|-------|-------|
| **Description** | The footer has `id="pricing"` but contains zero pricing information. Users clicking "Pricing" in nav see a decorative footer. This is trust-breaking. Add actual pricing comparison (Free vs Premium) or rename the section. |
| **Sources** | UI Designer (4.5) |
| **Effort** | M (1-2 days) |
| **Impact** | High |
| **Dependencies** | None |
| **Category** | UX |

### P1-13: Add Auto-Save Error Handling

| Field | Value |
|-------|-------|
| **Description** | Auto-save has no try/catch. If localStorage is full (QuotaExceededError) or DB write fails, save silently fails and `setSaveStatus("saved")` never executes. Add error handling, display persistent error banner. Also handle image upload errors inline. |
| **Sources** | QA Tester (EH-01, EH-03), Senior Developer (8.1) |
| **Effort** | S (< 1 day) |
| **Impact** | High |
| **Dependencies** | None |
| **Category** | UX |

### P1-14: Add ShareModal Accessibility

| Field | Value |
|-------|-------|
| **Description** | ShareModal has no `role="dialog"`, no `aria-modal`, no focus trap, and no Escape key handler. Add all dialog semantics. |
| **Sources** | UX Designer (8), QA Tester (SR-03), Product Manager (12) |
| **Effort** | S (< 0.5 day) |
| **Impact** | High |
| **Dependencies** | None |
| **Category** | UX |

### P1-15: Commit Database Migrations

| Field | Value |
|-------|-------|
| **Description** | No migration files committed to version control. Run `pnpm db:generate` and commit. Add migration execution to CI/CD. |
| **Sources** | Senior Developer (4.1) |
| **Effort** | S (< 0.5 day) |
| **Impact** | High |
| **Dependencies** | None |
| **Category** | Infrastructure |

### P1-16: Add First-Time Editor Onboarding

| Field | Value |
|-------|-------|
| **Description** | Users enter the editor with no guidance. Add a 3-5 step walkthrough on first editor visit: preview area, section editing, AI assistant, publish flow. Store completion in localStorage. |
| **Sources** | UX Designer (6.1) |
| **Effort** | M (2-3 days) |
| **Impact** | Medium |
| **Dependencies** | None |
| **Category** | UX |

---

## 4. P2: Post-Launch Sprint 1 (First 2 Weeks After Beta)

Quick wins and polish items to improve the experience for early users.

### P2-01: Premium Value Display Enhancement

| Field | Value |
|-------|-------|
| **Description** | Upgrade prompt does not justify RM49/SGD19. Add side-by-side free vs. premium comparison, analytics preview, AI generations counter ("5/5 used, upgrade for 100 more"). |
| **Sources** | Product Manager (2.2) |
| **Effort** | S (< 1 day) |
| **Impact** | High |
| **Category** | Feature |

### P2-02: Dynamic OG Meta Images

| Field | Value |
|-------|-------|
| **Description** | All invitations share the same static `/og-default.svg`. WhatsApp previews (the primary sharing channel) look generic. Generate per-invitation OG images with couple names, date, and template colors. |
| **Sources** | Product Manager (2.5), Competitive Researcher (4.3) |
| **Effort** | M (2-3 days) |
| **Impact** | High |
| **Category** | Feature |

### P2-03: Self-Hosted QR Code Generation

| Field | Value |
|-------|-------|
| **Description** | QR codes use external `api.qrserver.com` (privacy concern, availability risk). Replace with `qrcode` npm package for self-hosted generation. |
| **Sources** | Product Manager (1.3) |
| **Effort** | S (< 1 day) |
| **Impact** | Medium |
| **Category** | Infrastructure |

### P2-04: Replace `window.confirm()` in Dashboard Delete

| Field | Value |
|-------|-------|
| **Description** | Dashboard delete uses native `window.confirm()`, breaking the elegant design language. Replace with a styled confirmation dialog consistent with the rest of the UI. |
| **Sources** | UX Designer (2.3), QA Tester (SR-04) |
| **Effort** | S (< 1 day) |
| **Impact** | Medium |
| **Category** | UX |

### P2-05: Fix Completion Ring Color-Only Indicators

| Field | Value |
|-------|-------|
| **Description** | `.dm-completion-ring` uses green/yellow/gray dots (color-only, WCAG 1.4.1 failure). Replace with checkmark icon for complete, no icon for partial. `aria-label` already includes completion text. |
| **Sources** | QA Tester (C-01) |
| **Effort** | S (< 1 day) |
| **Impact** | High |
| **Category** | UI |

### P2-06: Add "Continue to Next Section" CTA

| Field | Value |
|-------|-------|
| **Description** | After completing fields in a section, no prompt guides users to the next section. Add a "Continue to [Next Section]" button at the bottom of each section's field list. |
| **Sources** | UX Designer (1.5) |
| **Effort** | S (< 1 day) |
| **Impact** | Medium |
| **Category** | UX |

### P2-07: Desktop SectionPillBar Keyboard Navigation

| Field | Value |
|-------|-------|
| **Description** | Desktop pill bar lacks roving tabindex and arrow key navigation (MobileSectionNav has it). Add matching keyboard handling. |
| **Sources** | UX Designer (1.5), QA Tester (K-04) |
| **Effort** | S (< 1 day) |
| **Impact** | Medium |
| **Category** | UX |

### P2-08: Elevate Blush Romance Template

| Field | Value |
|-------|-------|
| **Description** | Underwhelming hero (0.3 opacity arch barely visible), color monotony, spacing issues. Strengthen hero visual frame, add section dividers, fix kicker spacing. |
| **Sources** | UI Designer (2.1) |
| **Effort** | M (2-3 days) |
| **Impact** | Medium |
| **Category** | UI |

### P2-09: Elevate Love at Dusk Template

| Field | Value |
|-------|-------|
| **Description** | Visually repetitive sections (same card pattern everywhere), tiny gallery images (h-32), small partner names (text-sm). Add section dividers, vary card treatments, increase gallery and name sizes. |
| **Sources** | UI Designer (2.4) |
| **Effort** | M (2-3 days) |
| **Impact** | Medium |
| **Category** | UI |

### P2-10: Add EditorPreviewFrame Accessible Label

| Field | Value |
|-------|-------|
| **Description** | The preview `<div>` has no `role` or `aria-label`. Add `role="region"` and `aria-label="Invitation preview"`. |
| **Sources** | QA Tester (SR-01) |
| **Effort** | S (< 0.5 day) |
| **Impact** | Medium |
| **Category** | UX |

### P2-11: Add 4th Template to Landing Page

| Field | Value |
|-------|-------|
| **Description** | Eternal Elegance exists but is not shown in the landing page template showcase (only 3 displayed). Add it. |
| **Sources** | UI Designer (4.2), Product Manager (2.4) |
| **Effort** | S (< 0.5 day) |
| **Impact** | Medium |
| **Category** | UI |

### P2-12: Wire Cmd+S to Force Save

| Field | Value |
|-------|-------|
| **Description** | `Cmd+S` handler is empty (`/* auto-save handles this */`). Users who instinctively press Cmd+S get no response. Wire to `saveNow()` with confirmation toast. |
| **Sources** | UX Designer (1.4) |
| **Effort** | S (< 0.5 day) |
| **Impact** | Medium |
| **Category** | UX |

### P2-13: Fix Consent Checkbox Touch Targets

| Field | Value |
|-------|-------|
| **Description** | Consent checkboxes are 18x18px, below 44x44px minimum (WCAG 2.5.8). Add padding or use custom styled checkbox. |
| **Sources** | QA Tester (C-02) |
| **Effort** | S (< 0.5 day) |
| **Impact** | Medium |
| **Category** | UI |

### P2-14: AI Prompt Injection Mitigation

| Field | Value |
|-------|-------|
| **Description** | User prompts pass directly to LLM with no sanitization. Limit prompt length, sanitize input, use structured output modes. |
| **Sources** | Senior Developer (7.7) |
| **Effort** | S (< 1 day) |
| **Impact** | Medium |
| **Category** | Security |

### P2-15: Add `required` Attribute to Editor Fields

| Field | Value |
|-------|-------|
| **Description** | Required fields show visual asterisk but lack `required` or `aria-required` on input elements. Screen readers cannot convey field requirements. |
| **Sources** | QA Tester (FL-03) |
| **Effort** | S (< 0.5 day) |
| **Impact** | Medium |
| **Category** | UX |

### P2-16: Image Size/Type Client-Side Validation

| Field | Value |
|-------|-------|
| **Description** | `handleImageUpload` does not validate file size or type before upload. Users can upload 50MB raw photos. Add checks (max 10MB, JPEG/PNG/WebP only). |
| **Sources** | QA Tester (ED-09) |
| **Effort** | S (< 0.5 day) |
| **Impact** | Medium |
| **Category** | UX |

### P2-17: Slug Validation and Uniqueness Check

| Field | Value |
|-------|-------|
| **Description** | Slug dialog accepts any text with no format validation, no uniqueness check, no reserved word check. Add regex validation, DB uniqueness check, inline error display. |
| **Sources** | QA Tester (EH-04) |
| **Effort** | S (< 1 day) |
| **Impact** | Medium |
| **Category** | Feature |

---

## 5. P3: Growth Phase (1-3 Months Post-Launch)

Features for scaling beyond initial beta users.

### P3-01: Digital Ang Pow (Red Packet) Feature

| Field | Value |
|-------|-------|
| **Description** | Digital gifting integrated into the invitation. Zero competition in SEA for Chinese couples. Could be RM29 add-on or transaction fee model. |
| **Sources** | Competitive Researcher (6.1) |
| **Effort** | XL (5+ days) |
| **Impact** | High |
| **Category** | Feature |

### P3-02: WhatsApp Business API Integration

| Field | Value |
|-------|-------|
| **Description** | WhatsApp is THE distribution channel (93-97% penetration in MY, 84% in SG). Implement WhatsApp Business API for: RSVP notifications, event reminders, richer share previews. |
| **Sources** | Competitive Researcher (4.3), Critical Review (4) |
| **Effort** | L (3-5 days) |
| **Impact** | High |
| **Category** | Feature |

### P3-03: Expand to 8-10 Templates

| Field | Value |
|-------|-------|
| **Description** | 4 templates is below credibility threshold. Add: minimalist/modern, traditional Chinese red-gold, and 2-4 more distinct styles. Each must have authentic typography. |
| **Sources** | Critical Review (3), Competitive Researcher (8.3) |
| **Effort** | XL (2-3 weeks) |
| **Impact** | High |
| **Category** | Feature |

### P3-04: Collaboration / Co-Editing

| Field | Value |
|-------|-------|
| **Description** | Weddings are planned by two people but the product has single-user auth only. Add shared invitation access (invite co-editor by email). |
| **Sources** | Critical Review (3) |
| **Effort** | XL (5+ days) |
| **Impact** | Medium |
| **Category** | Feature |

### P3-05: Full Wedding Website Upgrade Tier

| Field | Value |
|-------|-------|
| **Description** | Expand invitation into full wedding website with additional pages (travel info, accommodation, registry). Upsell at RM79/SGD29. |
| **Sources** | Competitive Researcher (6.1) |
| **Effort** | XL (1-2 weeks) |
| **Impact** | High |
| **Category** | Feature |

### P3-06: Chinese Calendar / Auspicious Date Integration

| Field | Value |
|-------|-------|
| **Description** | Date picker with Chinese calendar guidance for auspicious dates. Cultural differentiator no competitor offers. |
| **Sources** | Competitive Researcher (4.2) |
| **Effort** | M (2-3 days) |
| **Impact** | Medium |
| **Category** | Feature |

### P3-07: PWA with Offline Draft Support

| Field | Value |
|-------|-------|
| **Description** | No PWA manifest, no service worker, no offline capability. Add for mobile-first experience with camera integration for photo uploads. |
| **Sources** | Critical Review (3) |
| **Effort** | L (3-5 days) |
| **Impact** | Medium |
| **Category** | Infrastructure |

### P3-08: Unit Tests for Core Modules

| Field | Value |
|-------|-------|
| **Description** | Zero unit tests exist. Add tests for: `useEditorState` (undo/redo), `useAutoSave` (timing, error), `useFocusTrap`, `lib/validation.ts`, `lib/session.ts`, `lib/store.ts`. |
| **Sources** | Senior Developer (9.1, 9.3), QA Tester (3.3) |
| **Effort** | L (3-5 days) |
| **Impact** | High |
| **Category** | Testing |

### P3-09: E2E Tests for Full Creation Flow

| Field | Value |
|-------|-------|
| **Description** | No test covers the complete journey: signup -> create -> edit -> publish -> public view. Also missing: multi-template RSVP tests, image upload error tests, session expiry tests. |
| **Sources** | QA Tester (3.2), Senior Developer (9.2) |
| **Effort** | L (3-5 days) |
| **Impact** | High |
| **Category** | Testing |

### P3-10: Editor God Component Decomposition

| Field | Value |
|-------|-------|
| **Description** | `$invitationId.tsx` is 767 lines with 11 hooks and ~30 state pieces. Extract 4 dialog overlays into separate components. Create `EditorProvider` context. Deduplicate `onFieldBlur`. |
| **Sources** | Senior Developer (1.1), UX Designer (10) |
| **Effort** | M (2-3 days) |
| **Impact** | Medium |
| **Category** | Infrastructure |

### P3-11: Font Loading Performance Optimization

| Field | Value |
|-------|-------|
| **Description** | Single render-blocking request loads 8 font families. Lazy-load per-template fonts. Self-host critical fonts. Use `<link rel="preload">` for fonts needed on current page. |
| **Sources** | Senior Developer (6.1) |
| **Effort** | M (1-2 days) |
| **Impact** | Medium |
| **Category** | Performance |

### P3-12: Tokenize Design System (Shadows, Transitions, Radii)

| Field | Value |
|-------|-------|
| **Description** | 4+ shadow values, inconsistent transition timings, hardcoded border radii. Define `--dm-shadow-sm/md/lg`, `--dm-transition-fast/normal/slow`, `--radius-sm/md/lg/full` tokens. |
| **Sources** | UI Designer (5.1, 5.2, 1.4) |
| **Effort** | M (1-2 days) |
| **Impact** | Medium |
| **Category** | UI |

### P3-13: Referral / Viral Growth Mechanics

| Field | Value |
|-------|-------|
| **Description** | Add "Made with DreamMoments" watermark on free tier (removable on premium), "Create your own" CTA at bottom of public invitations, referral discounts. |
| **Sources** | Competitive Researcher (7.4) |
| **Effort** | M (1-2 days) |
| **Impact** | High |
| **Category** | Business |

### P3-14: RSVP Email Notifications to Couple

| Field | Value |
|-------|-------|
| **Description** | When a guest RSVPs, the couple gets no notification. They must check the dashboard manually. Send email notification on each RSVP submission. |
| **Sources** | Product Manager (14), Critical Review (2) |
| **Effort** | S (< 1 day) |
| **Impact** | Medium |
| **Dependencies** | P0-07 (Email service) |
| **Category** | Feature |

### P3-15: Save-the-Date + Thank-You Card Products

| Field | Value |
|-------|-------|
| **Description** | Pre- and post-event cards using the same template design language. Bundle at RM69/SGD25. Expands revenue per customer. |
| **Sources** | Competitive Researcher (6.1) |
| **Effort** | L (3-5 days) |
| **Impact** | Medium |
| **Category** | Business |

---

## 6. Critical Path

The minimum ordered sequence to reach a credible beta launch.

```
Week 1: Security & Infrastructure Foundation
  Day 1:   P0-08 Pin Nitro stable version                        [S]
  Day 1:   P0-09 Fix color contrast WCAG failures                [S]
  Day 1:   P1-15 Commit DB migrations                            [S]
  Day 1-2: P0-05 Add rate limiting to auth/public endpoints      [M]
  Day 1-3: P0-01 Make PostgreSQL mandatory in production         [M]
  Day 1-3: P0-07 Basic email infrastructure (Resend)             [M]
  Day 3-5: P0-04 Route auto-save through server DB               [M]

Week 2: Security & Payments
  Day 1-3: P1-08 JWT security hardening                          [L]
  Day 1-4: P0-02 Fix password reset vulnerability                [L]
  Day 1-5: P0-03 Stripe payment integration (start)              [XL]

Week 3: Payments & UX Fixes
  Day 1-3: P0-03 Stripe payment integration (complete)           [XL cont.]
  Day 1:   P1-02 Landing page hero CTA                           [S]
  Day 1:   P1-06 Human-readable section labels                   [S]
  Day 1:   P1-07 Validate all server function inputs             [S]
  Day 1:   P1-14 ShareModal accessibility                        [S]
  Day 1-2: P1-01 Fix publish + share flow                        [S]
  Day 2-3: P0-10 Apply template-specific typography              [M]

Week 4: Infrastructure & Polish
  Day 1-3: P1-10 R2 image storage setup                          [L]
  Day 1-3: P0-06 Production deployment pipeline                  [L]
  Day 1:   P1-09 Sentry error monitoring                         [S]
  Day 1:   P1-13 Auto-save error handling                        [S]
  Day 2-4: P1-03 Template selection flow                         [M]
  Day 3-4: P1-04 Mobile editing discoverability                  [M]

Week 5: Final Polish & Launch
  Day 1-3: P1-11 Analytics server endpoint                       [M]
  Day 1-2: P1-12 Landing page pricing section                    [M]
  Day 1-2: P1-05 Inline editing visual affordances               [M]
  Day 3:   P1-16 First-time editor onboarding                    [M start]
  Day 4-5: End-to-end testing of full flow
  Day 5:   Beta launch
```

**Total estimated effort: 25-30 working days (5 weeks)**

---

## 7. Theme Summary

All items grouped by category with counts per priority level.

| Category | P0 | P1 | P2 | P3 | Total |
|----------|:---:|:---:|:---:|:---:|:-----:|
| **Security** | 2 | 2 | 1 | 0 | **5** |
| **Infrastructure** | 4 | 4 | 1 | 3 | **12** |
| **UX** | 0 | 7 | 6 | 0 | **13** |
| **UI** | 2 | 0 | 5 | 1 | **8** |
| **Feature** | 0 | 1 | 2 | 7 | **10** |
| **Business** | 1 | 0 | 0 | 2 | **3** |
| **Testing** | 0 | 0 | 0 | 2 | **2** |
| **Performance** | 0 | 0 | 0 | 1 | **1** |
| **Total** | **10** | **16** | **17** | **15** | **58** |

**Key insight**: Infrastructure and Security dominate P0 (6 of 10 items). UX dominates P1 (7 of 16 items). The editor itself is solid -- the gaps are around the editor, not in it.

---

## 8. Risk Register

| # | Risk | Probability | Impact | Mitigation |
|---|------|:-----------:|:------:|------------|
| R1 | **Canva adds RSVP management** | 60% (18mo) | Catastrophic | Deepen cultural-specific features (tea ceremony, bilingual, ang pao) that Canva will not prioritize |
| R2 | **Cannot find product-market fit before runway ends** | 40% | Fatal | Launch minimum viable immediately; validate with 10 real couples; iterate on feedback |
| R3 | **Solo developer burnout or departure** | 30% (12mo) | Fatal | Document architecture, write runbooks, automate CI/CD/monitoring, consider technical co-founder |
| R4 | **Data loss or security breach** | 25% (current arch) | Severe | Eliminate localStorage dependency, fix auth vulnerabilities, add encryption at rest, backup strategy |
| R5 | **WhatsApp subsumes the invitation use case** | 20% (24mo) | Severe | Create value beyond the invitation (analytics, guest management, event coordination) |
| R6 | **Revenue too low to sustain** | 50% (6mo) | High | Build upsell pipeline (ang pao, photo book, wedding website tier), referral discounts, consider tiered pricing |
| R7 | **Template quality does not justify RM49** | 35% | High | Fix typography disconnect (P0-10), elevate weaker templates, reach 8+ templates within 3 months |
| R8 | **Nitro nightly breaks production** | 20% (per deploy) | High | Pin to stable version immediately (P0-08) |
| R9 | **Image storage bloats database** | 70% (at scale) | Medium | Implement R2 before launch (P1-10), add client-side image validation |
| R10 | **Seasonality causes revenue troughs** | 90% | Medium | Build complementary products (save-the-dates, thank-you cards), content marketing during low seasons |

---

## 9. Quick Wins

Items that are S effort (< 1 day) with High or Critical impact. **Do these first** -- maximum return on time invested.

| # | Item | Effort | Impact | Category |
|---|------|:------:|:------:|----------|
| 1 | P0-08: Pin Nitro to stable version | S | Critical | Infrastructure |
| 2 | P0-09: Fix color contrast WCAG failures | S | Critical | UI |
| 3 | P1-02: Add landing page hero CTA | S | High | UX |
| 4 | P1-06: Human-readable section labels | S | High | UX |
| 5 | P1-07: Validate input on all server functions | S | High | Security |
| 6 | P1-09: Sentry error monitoring | S | High | Infrastructure |
| 7 | P1-13: Auto-save error handling | S | High | UX |
| 8 | P1-14: ShareModal accessibility | S | High | UX |
| 9 | P1-15: Commit database migrations | S | High | Infrastructure |
| 10 | P1-01: Fix publish + share flow | S | High | UX |

**Estimated total for all 10 quick wins: 4-5 days.** These should be the very first things implemented.

---

## 10. Recommendations

### Strategic Advice (Synthesized from All Reviews)

1. **Stop polishing the editor. Ship infrastructure.** (Critical Review, Senior Developer)
   The editor is 90%+ complete and exceeds the PRD. Every hour spent on editor refinements is an hour not spent on payments, email, deployment, and security -- the items that separate a demo from a business.

2. **The typography disconnect is the single biggest design issue.** (UI Designer)
   Three of four templates render with the same font (Outfit). Fixing this (P0-10) has outsized impact on perceived template diversity and premium quality. Garden Romance proves the team can deliver -- extend that quality to all templates.

3. **WhatsApp sharing quality is non-negotiable.** (Competitive Researcher)
   93-97% WhatsApp penetration in Malaysia. The OG image, share message formatting, and link preview quality directly determine viral coefficient. Invest in dynamic OG images (P2-02) early.

4. **The Chinese-SEA niche is a genuine blue ocean.** (Competitive Researcher)
   No competitor serves Chinese couples in Malaysia/Singapore with dedicated, culturally-aware digital invitations. This positioning is defensible. Double down on cultural features: bilingual EN/ZH, tea ceremony sections, Chinese calendar integration, and eventually Digital Ang Pow.

5. **localStorage must go before launch.** (All technical reviewers)
   This is the single most universally flagged issue. Every reviewer independently identified it. Published invitations stored in localStorage are invisible to guests. This is not a "nice to have" -- it is a fundamental product-breaking issue.

6. **Build the upsell pipeline from day one.** (Critical Review, Competitive Researcher)
   At RM49 one-time, the revenue math requires volume. Plan for: Digital Ang Pow (RM29 add-on), wedding website upgrade (RM79), save-the-date + thank-you bundle (RM69). Show "coming soon" features in the dashboard.

7. **Validate with 10 real couples before building more.** (Critical Review)
   The hardest question is not "can we build it?" but "do couples want it enough to pay?" Launch an imperfect beta, get real couples using it, and let their feedback drive priorities.

8. **Security is not optional for a wedding product.** (Senior Developer)
   Wedding invitations contain sensitive personal data (names, addresses, phone numbers, dietary restrictions that reveal religion). The password reset vulnerability (P0-02) and JWT issues (P1-08) must be fixed before any real user data enters the system.

9. **Testing investment should follow infrastructure.** (QA Tester, Senior Developer)
   Unit tests for editor hooks are important but less urgent than infrastructure items. Write E2E tests for the full creation-to-share flow first (P3-09), then unit tests for core modules (P3-08).

10. **Embrace the lifestyle business model -- or pivot.** (Critical Review)
    At ~50K addressable Chinese weddings/year in MY/SG with 1% capture, this generates ~RM7,350/year. This is fine as a lifestyle business with upsells, but the PRD's 13-week ambitious scope does not match this reality. Either narrow scope and ship fast, or find a growth vector (Digital Ang Pow, wedding planner enterprise tier) that changes the economics.

---

## Appendix: Source Cross-Reference

Each review and where its key findings appear in this roadmap.

| Review | Key Findings | Roadmap Items |
|--------|-------------|---------------|
| **Product Manager** | Payment mock, analytics localStorage, publish flow, R2 storage, deployment | P0-03, P1-11, P1-01, P1-10, P0-06 |
| **UX Designer** | No hero CTA, mobile editing hidden, publish silently, inline edit no affordance, section labels | P1-02, P1-04, P1-01, P1-05, P1-06 |
| **UI Designer** | Template typography disconnect, peach contrast, no CTA, pricing section fake | P0-10, P0-09, P1-02, P1-12 |
| **Senior Developer** | Password reset vuln, localStorage DB, JWT issues, no rate limiting, Nitro nightly | P0-02, P0-01, P1-08, P0-05, P0-08 |
| **QA Tester** | Contrast failures, missing error handling, zero unit tests, creation flow untested | P0-09, P1-13, P3-08, P3-09 |
| **Competitive Researcher** | WhatsApp critical, Digital Ang Pow opportunity, bilingual differentiator | P2-02, P3-01, P0-10 |
| **Critical Review** | localStorage not viable, payment 0%, no email, stop polishing editor | P0-01, P0-03, P0-07, Rec #1 |

---

*This roadmap synthesizes findings from 7 independent expert reviews. All effort estimates assume a single developer. Parallelism with additional contributors would significantly compress the timeline.*

*Last updated: 2026-02-08*
