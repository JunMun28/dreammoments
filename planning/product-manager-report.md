# DreamMoments - Product Manager Gap Analysis Report

**Date**: 2026-02-08
**PRD Version**: 1.0 (February 2026)
**Codebase Commit**: 58ac25e (main)

---

## Executive Summary

DreamMoments has made strong progress across the PRD's 7-phase roadmap. The foundation (Phase 1) is essentially complete, and the editor experience (Phase 2) is the most developed area, with a sophisticated split-screen editor, auto-save, undo/redo, and AI assistant integration. All four templates are implemented (exceeding the PRD's three), and the RSVP system and dashboard are functional. However, critical revenue-blocking features -- real Stripe payment integration, production image storage (Cloudflare R2), and GSAP-powered cinematic animations -- remain unimplemented. The "5 minutes to publish" goal is achievable today for a basic invitation, but the lack of a polished onboarding wizard and image upload pipeline creates friction.

**Overall PRD Completion: ~62%**

Key wins:
- 4 templates (PRD specified 3) -- ahead of plan
- Full editor with undo/redo, AI assistant, inline editing, mobile support
- Complete RSVP pipeline: submit, filter, export CSV, import, manual add
- Solid dashboard with analytics, dietary summary, device breakdown, settings

Key gaps:
- No real Stripe integration (mock checkout only)
- No production image storage (local data URLs only)
- Animations use Motion (not GSAP ScrollTrigger as PRD specified)
- No bilingual support / auto-translation in template UI
- Password login partially broken (no password_hash column in DB)

---

## Implementation Status by PRD Phase

### Phase 1: Foundation (Week 1-2) -- 85% Complete

| Task | PRD Spec | Status | Notes |
|------|----------|--------|-------|
| 1.1 TanStack Start + Tailwind | Initialize project | DONE | React 19, Vite 7, TW4 |
| 1.2 Neon DB + Drizzle | Database setup | DONE | Drizzle ORM, getDbOrNull fallback |
| 1.3 Database schema | 6 tables | DONE | users, invitations, guests, invitation_views, ai_generations, payments |
| 1.4 Google OAuth | Primary auth | DONE | Full OAuth flow with callback |
| 1.5 Email/password auth | Fallback auth | PARTIAL | Signup works; login broken for DB users (no password_hash column) |
| 1.6 Auth UI | Login/signup pages | DONE | Login, signup, reset, callback routes |
| 1.7 Cloudflare R2 | Image storage | PARTIAL | Storage module exists but falls back to data URLs. No actual R2 integration. |
| 2.1 TemplateConfig types | TypeScript interfaces | DONE | Full type system: TemplateConfig, SectionConfig, FieldConfig, DesignTokens |
| 2.2 Section architecture | Component system | DONE | SectionShell + per-template invitation components |
| 2.3-2.8 Template sections | Hero, Gallery, etc. | DONE | All section types implemented per template |
| 2.9 GSAP ScrollTrigger | Scroll animations | NOT DONE | Using Motion (framer-motion) instead of GSAP |
| 2.10 Entrance animations | Section animations | PARTIAL | Motion-based fade/slide animations on landing; template animations vary |

### Phase 2: Editor Experience (Week 3-4) -- 80% Complete

| Task | PRD Spec | Status | Notes |
|------|----------|--------|-------|
| 3.1 Split-screen editor | Desktop layout | DONE | EditorLayout with grid columns, section rail, context panel |
| 3.2 Dynamic SectionForm | Context-aware forms | DONE | ContextPanel + FieldRenderer with section-specific fields |
| 3.3 Live preview sync | Scroll-sync editing | DONE | usePreviewScroll + useFormScrollSpy hooks |
| 3.4 Sample data pre-fill | Realistic examples | DONE | buildSampleContent() per template |
| 3.5 Mobile editing | Tap-to-edit interface | DONE | MobileBottomSheet, MobileSectionNav, MobileAllSectionsPanel |
| 3.6 Auto-save | Draft persistence | DONE | useAutoSave hook |
| 3.7 Undo/Redo | 20-action history | DONE | useEditorState with history/future stacks, 20-item limit |
| 3.8 Image upload | R2 integration | PARTIAL | ImageUploadField UI exists; no real R2 upload, uses data URLs |
| 3.9 Image optimization | Resize/compress | NOT DONE | No client-side image processing |
| 4.1 Preview mode | Full-screen preview | DONE | LayoutToggle with mobile/web preview |
| 4.2 Publish flow | Publishing pipeline | DONE | publishInvitationFn with template snapshot |
| 4.3 Slug generation | Unique slugs | DONE | generateSlug with collision avoidance |
| 4.4 Public route | /invite/$slug | DONE | InviteScreen with template rendering |
| 4.5 Share modal | Link, WhatsApp, QR | DONE | ShareModal with all three sharing methods |
| 4.6 Template versioning | Lock on publish | DONE | templateSnapshot JSONB saved at publish time |
| 4.7 Mobile preview toggle | In-editor | DONE | LayoutToggle component |

### Phase 3: RSVP System (Week 5-6) -- 75% Complete

| Task | PRD Spec | Status | Notes |
|------|----------|--------|-------|
| 5.1 RSVP form | Guest-facing form | DONE | Per-template RSVP sections |
| 5.2 Guests table | Database | DONE | Full schema with attendance, dietary, message |
| 5.3 RSVP submission API | Public endpoint | DONE | submitRsvpFn with validation |
| 5.4 Confirmation message | Post-submit | PARTIAL | Basic text status, no animation |
| 5.5 Guest accounts | Optional signup | NOT DONE | No guest account creation |
| 5.6 RSVP update flow | Via email link | NOT DONE | No update mechanism for submitted RSVPs |
| 6.1 Guest table with filters | RSVP dashboard | DONE | Filter by attendance, search by name |
| 6.2 Dietary summary | Aggregated view | DONE | getDietarySummary function |
| 6.3 CSV export | Download guest list | DONE | exportGuestsCsvFn |
| 6.4 CSV import | Bulk import | DONE | importGuestsFn with column mapping UI |
| 6.5 Search + manual entry | Dashboard features | DONE | Search input + addGuest form |
| 6.6 Plus-one tracking | Guest counts | DONE | guestCount field, total calculation |

### Phase 4: AI Features (Week 7-8) -- 70% Complete

| Task | PRD Spec | Status | Notes |
|------|----------|--------|-------|
| 7.1 Kimi K2.5 API client | AI provider | CHANGED | Uses OpenAI-compatible API (configurable via AI_API_URL env var), not Kimi specifically |
| 7.2 Prompt templates | System prompts | DONE | 6 types: schedule, faq, story, tagline, translate, style |
| 7.3 AI generation endpoint | Server function | DONE | generateAiContentFn with response parsing |
| 7.4 Schedule generator | Timeline creation | DONE | JSON-structured timeline output |
| 7.5 FAQ generator | FAQ creation | DONE | JSON-structured FAQ output |
| 7.6 Love story generator | Story milestones | DONE | JSON-structured milestone output |
| 7.7 AI usage tracking | Per-invitation | PARTIAL | ai_generations_used column exists; enforcement not implemented |
| 8.1 AI floating button | Per-section trigger | DONE | aiTaskType on FieldConfig, magic button in FieldRenderer |
| 8.2 Prompt input | Text interface | DONE | AiAssistantDrawer with task selector pills |
| 8.3 Apply/Regenerate | Suggestion flow | DONE | AiSuggestionCard with Apply button |
| 8.4 Style adjustment | Color/animation | DONE | "style" AI type generates CSS custom property overrides |
| 8.5 Auto-translation | Chinese/English | PARTIAL | "translate" AI type exists but no in-template bilingual toggle |
| 8.6 AI limits UI | Generation counter | DONE | "X generations remaining" badge in drawer footer |

### Phase 5: Remaining Templates (Week 9-10) -- 100% Complete (Exceeded)

| Task | PRD Spec | Status | Notes |
|------|----------|--------|-------|
| 9.1-9.5 Garden Romance | Template + animations | DONE | gardenRomanceTemplate + GardenRomanceInvitation component |
| 10.1-10.5 Eternal Elegance | Template + animations | DONE | eternalEleganceTemplate + EternalEleganceInvitation component |
| BONUS: Blush Romance | Not in PRD | DONE | Extra template exceeding PRD scope |

### Phase 6: Payments & Polish (Week 11-12) -- 30% Complete

| Task | PRD Spec | Status | Notes |
|------|----------|--------|-------|
| 11.1 Stripe account | Payment setup | NOT DONE | No Stripe SDK integration |
| 11.2 Products/prices | Stripe config | NOT DONE | Pricing defined in code but no Stripe product IDs |
| 11.3 Checkout flow | Payment processing | MOCK ONLY | /upgrade route simulates payment via localStorage |
| 11.4 FPX (MY) | Payment method | NOT DONE | Listed in mock UI only |
| 11.5 PayNow (SG) | Payment method | NOT DONE | Listed in mock UI only |
| 11.6 Webhook handler | Payment success | NOT DONE | No Stripe webhooks |
| 11.7 Premium gating | Feature restrictions | PARTIAL | plan field on users; CSV import gated; slug edit gated |
| 12.1 Dashboard layout | Main dashboard | DONE | My Invitations grid |
| 12.2 Invitation list | Card views | DONE | With template name, status, quick actions |
| 12.3 Basic analytics | Views, RSVP rate | DONE | totalViews, rsvpRate, viewsByDay chart, device mix |
| 12.4 Invitation settings | Settings panel | DONE | Status, slug, publish/unpublish |
| 12.5 Landing page | Template showcase | DONE | Hero, Showcase, Timeline, Features, Footer |
| 12.6 Performance opt | Load times | PARTIAL | lazy loading on images, but no code splitting strategy |
| 12.7 Accessibility audit | Reduced motion | DONE | usePrefersReducedMotion, focus-visible, ARIA labels |
| 12.8 Mobile responsive | Cross-device | DONE | Mobile layout, bottom sheets, responsive grids |

### Phase 7: Launch Prep (Week 13) -- 40% Complete

| Task | PRD Spec | Status | Notes |
|------|----------|--------|-------|
| 13.1 E2E testing | End-to-end tests | DONE | 11 Playwright spec files covering auth, editor, dashboard, invite |
| 13.2 Security audit | Security review | PARTIAL | Input validation via Zod; JWT auth; but no rate limiting, CSRF protection |
| 13.3 Error monitoring | Sentry setup | NOT DONE | No error monitoring service |
| 13.4 Sample invitations | Demo content | DONE | buildSampleContent per template, `-sample` slug routes |
| 13.5 Help documentation | User guides | NOT DONE | No help docs |
| 13.6 Analytics service | Plausible/Posthog | NOT DONE | No third-party analytics |
| 13.7 Domain setup | dreammoments.app | NOT DONE | No production domain |
| 13.8 Production deploy | Vercel deployment | NOT DONE | No deployment config |

---

## Feature Gap Analysis

### Critical Gaps (Revenue/Launch Blockers)

| Feature | PRD Priority | Current State | Impact | Effort |
|---------|-------------|---------------|--------|--------|
| Stripe integration | P0 | Mock only | Blocks all revenue | High (2-3 days) |
| Cloudflare R2 storage | P1 | Data URL fallback | Photos break at scale, huge page sizes | Medium (1-2 days) |
| Password hash in DB | P1 | Missing column | Email login broken for DB users | Low (0.5 day) |
| Production deployment | P0 | Not configured | No live product | Medium (1-2 days) |

### Important Gaps (User Experience)

| Feature | PRD Priority | Current State | Impact | Effort |
|---------|-------------|---------------|--------|--------|
| GSAP scroll animations | P0 | Motion-only | Less cinematic than PRD vision | High (3-5 days) |
| Image optimization | P1 | Not implemented | Large uploads, slow loads | Medium (1-2 days) |
| Bilingual template toggle | P1 | AI translate only | Manual process for Chinese content | Medium (2-3 days) |
| RSVP confirmation animation | P0 | Basic text | Weak guest experience | Low (0.5 day) |
| AI usage enforcement | P0 | Counter only | Free users get unlimited AI | Low (0.5 day) |
| Rate limiting | P0 | None | Abuse risk for AI and RSVP endpoints | Medium (1-2 days) |

### Nice-to-Have Gaps

| Feature | PRD Priority | Current State | Impact | Effort |
|---------|-------------|---------------|--------|--------|
| Guest account creation | P2 | Not implemented | Minor; reminders not supported | Low (1 day) |
| RSVP update via email link | P2 | Not implemented | Guests can't change RSVP | Medium (1-2 days) |
| Error monitoring (Sentry) | P1 | Not implemented | Blind to production errors | Low (0.5 day) |
| Analytics service | P1 | Not implemented | No user behavior insights | Low (0.5 day) |
| Help documentation | P2 | Not implemented | Higher support load | Low (1 day) |

---

## Implemented Features NOT in PRD

The following features were built but not specified in the PRD:

1. **Blush Romance template** (4th template) -- The PRD specifies 3 templates. This extra template adds variety and is a positive addition.

2. **Keyboard shortcuts** (useKeyboardShortcuts hook) -- Ctrl+Z/Y for undo/redo, Ctrl+S for save, Escape to close panels. Not in PRD but excellent for power users.

3. **Section progress indicator** (ProgressIndicator, useSectionProgress) -- Visual completion tracking per section. Not in PRD but aids the "5 minutes" goal.

4. **Inline edit overlay** (InlineEditOverlay, useInlineEdit) -- Click-to-edit directly on the preview. PRD mentioned "mobile tap-to-edit" but this extends to desktop.

5. **Focus trap and accessibility hooks** (useFocusTrap, skip-to-content) -- Exceeds PRD accessibility requirements.

6. **Privacy Policy and Terms of Service pages** -- Legal compliance pages not in PRD but necessary for launch.

7. **Demo user auto-creation** (/editor/new) -- Bypasses login for testing; useful for development but needs cleanup before production.

8. **Device breakdown analytics** (getDeviceBreakdown) -- Mobile vs desktop view tracking, beyond PRD's basic analytics spec.

9. **Editor improvement plan document** (EDITOR_IMPROVEMENT_PLAN.md) -- Internal planning artifact.

---

## "5 Minutes to Publish" Goal Assessment

**Current estimated time: 7-10 minutes** for a basic invitation.

### Friction Points

| Step | Time | Friction |
|------|------|----------|
| Sign up (Google) | 30s | Low -- one-click OAuth works |
| Template selection | 30s | Low -- clear showcase page |
| Navigate to editor | 15s | Medium -- /editor/new creates invitation but requires login first |
| Edit hero (names, date) | 60s | Low -- pre-filled samples help |
| Edit announcement | 60s | Low -- text fields |
| Toggle off unwanted sections | 30s | Low -- toggle switches |
| Upload photos | 120s+ | HIGH -- data URL approach is slow, no drag-and-drop |
| Preview | 30s | Low |
| Publish | 30s | Low |
| **Total** | **~7 min** | |

### Recommendations to Reach 5 Minutes

1. **Skip photo upload for MVP flow** -- Make gallery/hero photos optional with placeholder imagery
2. **Onboarding wizard** -- Guide users through only essential fields (names, date, venue) first
3. **One-click "Use Template" -> auth -> editor** -- Reduce steps between landing and editing
4. **Smart defaults** -- Pre-fill more content using AI on first load (schedule, FAQ)
5. **Drag-and-drop image upload** -- Reduce image upload friction

---

## Prioritized Feature Backlog

### Tier 1: Must-Have for Launch

| # | Feature | Effort | Business Impact |
|---|---------|--------|-----------------|
| 1 | Stripe checkout integration | 2-3 days | Revenue enablement |
| 2 | Cloudflare R2 image upload | 1-2 days | Core functionality |
| 3 | Fix password_hash DB column | 0.5 day | Auth completeness |
| 4 | AI usage enforcement (limit free tier) | 0.5 day | Revenue protection |
| 5 | Production deployment (Vercel) | 1-2 days | Launch blocker |
| 6 | Rate limiting (API endpoints) | 1 day | Security |
| 7 | Image optimization (resize/compress) | 1 day | Performance |

### Tier 2: High-Priority Post-Launch

| # | Feature | Effort | Business Impact |
|---|---------|--------|-----------------|
| 8 | GSAP ScrollTrigger animations | 3-5 days | Visual differentiation |
| 9 | Bilingual template toggle | 2-3 days | Target market fit |
| 10 | Error monitoring (Sentry) | 0.5 day | Operational health |
| 11 | Analytics service (Posthog) | 0.5 day | Product insights |
| 12 | Onboarding wizard flow | 2-3 days | Conversion improvement |
| 13 | RSVP confirmation animation | 0.5 day | Guest experience |

### Tier 3: Growth Features

| # | Feature | Effort | Business Impact |
|---|---------|--------|-----------------|
| 14 | RSVP update via email link | 1-2 days | Guest convenience |
| 15 | Guest reminder emails | 2-3 days | RSVP rate improvement |
| 16 | Custom domain support | 2-3 days | Premium feature |
| 17 | Help documentation | 1 day | Support reduction |
| 18 | Template analytics (which sections viewed) | 1-2 days | Product insight |

---

## Top 5 Recommendations

### 1. Integrate Stripe Payments (HIGHEST PRIORITY)

**Why**: Zero revenue without it. The mock checkout is useful for development but blocks the entire monetization strategy.

**Scope**: Set up Stripe account, create MYR/SGD products, implement Checkout Sessions, add webhook handler for payment.succeeded, gate premium features properly.

**Risk**: FPX and PayNow require Stripe's regional payment method support which may need additional Stripe account configuration.

### 2. Ship Cloudflare R2 Image Storage

**Why**: Current data URL approach stores entire images as base64 strings in localStorage/JSONB. This will break with more than 2-3 photos per invitation and creates massive page sizes.

**Scope**: Configure R2 bucket, implement presigned upload URLs, add image optimization pipeline (sharp or browser-side canvas resize), update ImageUploadField to show upload progress.

### 3. Fix Authentication Completeness

**Why**: Email/password login is broken for database-backed users (no password_hash column). This affects the "fallback auth" flow for users who don't have Google accounts.

**Scope**: Add password_hash column to users table via Drizzle migration, update signup to store hash, update login to verify.

### 4. Deploy to Production

**Why**: Cannot validate the product with real users without a live deployment.

**Scope**: Configure Vercel project, set up environment variables, configure Neon production database, set up domain (dreammoments.app), configure Google OAuth redirect URIs.

### 5. Enforce AI Generation Limits

**Why**: The AI usage counter exists in the UI but is never enforced. Free-tier users can generate unlimited AI content, undermining the premium value proposition.

**Scope**: Check ai_generations_used against tier limits before calling AI API, increment counter on successful generation, show upgrade prompt when limit reached.

---

## Risk Assessment

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Data URL storage hitting localStorage limits | High | High | Prioritize R2 integration |
| AI API costs scaling with usage | Medium | Medium | Enforce per-tier limits; use cheaper model for simple tasks |
| Password auth vulnerability (no hash storage) | High | High | Add password_hash column immediately |
| No error monitoring in production | Medium | High | Add Sentry before launch |
| Animation library mismatch (Motion vs GSAP) | Low | Medium | Motion works well; GSAP migration is optional |

### Product Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| "5-minute" promise unachievable with photos | Medium | High | Make photos optional; optimize upload flow |
| Bilingual gap for Chinese-speaking market | High | High | Prioritize translate feature and Chinese template defaults |
| No guest reminder system reduces RSVP rates | Medium | Medium | Plan for post-launch email integration |
| Mock payment flow shipped accidentally | Medium | High | Feature flag the upgrade route; add Stripe check |
| Free tier too generous (unlimited AI) | High | Medium | Enforce limits before launch |

### Market Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Competitors with more templates | Medium | Medium | Quality over quantity; focus on animation differentiation |
| Price sensitivity in MY market (RM49) | Medium | Medium | Consider RM29 introductory pricing |
| WhatsApp sharing limitations | Low | Low | QR code as backup; consider Telegram support |

---

## Summary Metrics

| Metric | Value |
|--------|-------|
| PRD Phases | 7 |
| Overall Completion | ~62% |
| Phase 1 (Foundation) | 85% |
| Phase 2 (Editor) | 80% |
| Phase 3 (RSVP) | 75% |
| Phase 4 (AI) | 70% |
| Phase 5 (Templates) | 100%+ |
| Phase 6 (Payments) | 30% |
| Phase 7 (Launch) | 40% |
| Templates Implemented | 4 (PRD: 3) |
| Routes Implemented | 14 |
| API Endpoints | 5 modules |
| E2E Test Files | 11 |
| Launch Blockers | 5 |
| Estimated Time to Launch-Ready | 2-3 weeks |

---

*Report generated by Product Manager analysis of PRD.md vs codebase at commit 58ac25e.*
