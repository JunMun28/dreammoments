# DreamMoments - Consolidated Planning Team Report

> **9 agents** analyzed the codebase against the PRD on Feb 8, 2026.
> Individual reports are in this `planning/` directory.

---

## Overall Assessment

| Metric | Value |
|--------|-------|
| PRD Implementation | ~62% complete |
| Code Quality Score | 6.3/10 |
| Estimated Lighthouse | 62-72 (target: >90) |
| Critical Security Issues | 3 |
| Launch Blockers | 5 |
| Estimated Time to Launch | 2-3 weeks |
| Test Coverage | E2E decent (66 cases), unit tests sparse (15 cases) |

---

## Top Priority: Launch Blockers (P0)

These **must** be fixed before any public launch:

| # | Issue | Source | Effort |
|---|-------|--------|--------|
| 1 | **`password_hash` column missing** from users DB table -- email login is broken | Developer, Reviewer | Small |
| 2 | **No image storage backend** -- Cloudflare R2 not integrated, falls back to base64 in localStorage | Developer, PM | Medium |
| 3 | **Hardcoded JWT secret fallback** -- doesn't throw in production, security vulnerability | Reviewer | Small |
| 4 | **Stripe payments entirely mocked** -- no real payment processing | PM, Critics | Large |
| 5 | **Zero OG/meta tags on public invitation pages** -- WhatsApp shares show no preview | Quality Specialist | Medium |

---

## Critical Security Issues

| Issue | Risk | Fix |
|-------|------|-----|
| No password hash in DB | Email login broken/insecure | Add `password_hash` column, implement bcrypt |
| JWT secret fallback to hardcoded value | Token forgery in production | Throw error if `JWT_SECRET` env var missing |
| Image upload has no auth/size/MIME validation | Unauthenticated uploads, storage abuse | Add auth middleware, file size limits, MIME checks |
| No rate limiting on public endpoints | DDoS, brute force attacks | Add rate limiting middleware |
| SSL certificate validation disabled | MITM attacks | Remove `NODE_TLS_REJECT_UNAUTHORIZED=0` |

---

## Quick Wins (High Impact, Low Effort)

| # | Improvement | Impact | Effort | Source |
|---|-------------|--------|--------|--------|
| 1 | **Load template fonts** (12+ missing fonts in one CSS line) | Transforms all template visual quality | 1 hour | UI Designer |
| 2 | **Add OG meta tags** to public invitation pages | WhatsApp sharing actually works | 4 hours | Quality Specialist |
| 3 | **Add error boundaries** | Prevents white screens for wedding guests | 2 hours | Quality, UX |
| 4 | **Fix render-blocking font @import** | Faster first paint | 1 hour | Quality Specialist |
| 5 | **Add sample data placeholders** to editor fields | Better onboarding UX | 2 hours | UI Designer |
| 6 | **Fix mobile preview toggle** (currently hardcoded to "web") | Mobile preview works | 2 hours | UX Designer |

---

## Feature Gap Analysis (PRD vs Implementation)

### By Phase

| Phase | Description | Completion | Key Gaps |
|-------|-------------|------------|----------|
| 1 | Foundation & Auth | ~75% | password_hash, R2 storage |
| 2 | Editor Experience | ~80% | Server-side auto-save, undo/redo |
| 3 | RSVP System | ~75% | Guest import, RSVP update flow |
| 4 | AI Features | ~60% | Server-side tracking, apply/reject flow |
| 5 | Templates | 100%+ | 4 built (PRD planned 3), but Garden Romance diverges from spec |
| 6 | Payments & Polish | ~30% | Stripe mock-only, no premium gating |
| 7 | Launch Prep | ~20% | No error monitoring, no analytics, no production deploy |

### Extra Features (Not in PRD)
- 4th template (Blush Romance)
- Keyboard shortcuts in editor
- Section progress indicator
- Inline edit overlay
- Privacy/Terms pages

---

## Architecture Findings

### Strengths
- Well-decomposed editor hook system (10+ single-responsibility hooks)
- Clean API layer with Zod validation
- Configuration-driven template system (partially)
- Good accessibility foundation (skip links, ARIA, focus traps, reduced motion)
- AI integration is provider-agnostic with mock fallback

### Weaknesses
- **Dual data layer** (DB + localStorage) creates ~400 lines of duplicated logic
- **Editor route is 725 lines** -- needs decomposition
- **Template configs define tokens but rendering hardcodes values** -- config-rendering disconnect
- **Auto-save only to localStorage**, not to server -- data loss risk
- **35+ unsafe `as` casts** on JSONB fields
- **N+1 query risk** in slug uniqueness check
- **Race condition** on publish (slug generation without transaction)
- **`nitro` pinned to nightly builds** (`npm:nitro-nightly@latest`)

---

## Market & Competitive Intelligence

### Key Findings
- **No direct competitor** combines cinematic animations + AI + bilingual EN/ZH in MY/SG
- **Joy.com offers more for free** than DreamMoments' paid tier -- value proposition needs strengthening
- **TAM**: ~85,000 Chinese weddings/year in MY+SG, ~USD 150M globally
- **RM49/SGD19 is competitive** vs local competitors (RM100-250+)
- **WhatsApp is 90%+ distribution** -- dynamic OG images are a must-have

### Recommended Differentiators
1. Cinematic scroll animations (already partially built)
2. AI bilingual content generation (partially built)
3. Digital angpow/hongbao QR integration (unoccupied niche)
4. WhatsApp-native sharing with dynamic OG previews
5. Under-5-minute self-serve creation

---

## UX Friction Points (Top 10)

| # | Issue | Severity |
|---|-------|----------|
| 1 | Landing-to-editor CTA bypasses auth via demo user | Critical |
| 2 | No onboarding for first-time editors | High |
| 3 | Mobile preview toggle non-functional | High |
| 4 | RSVP confirmation is plain text, no visual feedback | High |
| 5 | Mobile editor shows ALL sections at once (overwhelming) | High |
| 6 | AI assistant has no prompt suggestions or regenerate | High |
| 7 | No floating RSVP button for guest view | Medium |
| 8 | No global error boundary | High |
| 9 | Dashboard has no visual previews of invitations | Medium |
| 10 | No publish celebration overlay | Low |

---

## Testing Gaps

| Area | E2E | Unit | Gap |
|------|-----|------|-----|
| Editor | 11 specs | 0 | Unit tests for all 9 editor hooks |
| API handlers | 0 | 0 | All 5 API handler files untested |
| Validation schemas | 0 | 0 | Critical business logic untested |
| Session/JWT | 0 | 0 | Auth logic untested |
| Store/state | 0 | 0 | State management untested |
| Templates | via E2E | 0 | Template rendering unit tests |
| **Estimated effort for comprehensive coverage**: **~95 hours (12-14 days)** |

---

## Product Risk Assessment

**Overall Risk Level: MODERATE-HIGH**

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Joy.com free tier undercuts paid value | High | High | Differentiate on cinematic quality + bilingual AI |
| "Forever free hosting" unsustainable | High | Medium | 12-month archival for free tier |
| Solo dev + 13-week roadmap too ambitious | High | High | Ruthlessly prioritize: editor + 2 templates + RSVP + share |
| Neon DB reliability for wedding-critical events | Medium | Low | Add caching layer, consider fallback |
| Template-only approach limits customization | Medium | Medium | Add color/font customization before more templates |
| Nitro nightly dependency instability | Medium | Medium | Pin to stable release |

### "Kill These" (Not Worth Building Now)
- Undo/redo depth (beyond basic)
- AI style adjustment
- Guest account creation
- Full analytics charts
- Template versioning/snapshot (premature)

### "Double Down On"
- WhatsApp sharing experience
- Mobile editing UX
- Cinematic viewing on mid-range phones
- Bilingual Chinese content (true moat)
- RSVP experience

---

## Recommended Action Plan

### Week 1: Security & Infrastructure (Must-do)
1. Add `password_hash` column to users table
2. Fix JWT secret to throw if missing in production
3. Add auth/size/MIME validation to image uploads
4. Add rate limiting to public endpoints
5. Load all template fonts (quick win)
6. Add error boundaries

### Week 2: Core UX & Sharing
1. Add OG meta tags for WhatsApp previews
2. Fix landing-to-editor CTA flow (remove demo bypass)
3. Implement server-side auto-save
4. Fix mobile preview toggle
5. Add RSVP confirmation animation
6. Add floating RSVP button

### Week 3: Payments & Launch
1. Integrate real Stripe payments (FPX + PayNow + card)
2. Implement premium feature gating
3. Set up Cloudflare R2 for image storage
4. Add first-time editor onboarding
5. Production deployment
6. Set up error monitoring (Sentry)

### Week 4: Polish & Testing
1. Add critical unit tests (validation, auth, store)
2. Upgrade Love at Dusk animations to Motion library
3. Add AI prompt suggestions
4. Performance optimization (code splitting, lazy loading)
5. PWA manifest fix
6. End-to-end launch testing

---

## Individual Reports

| Report | File | Size |
|--------|------|------|
| Product Manager | `product-manager-report.md` | 20 KB |
| Researcher | `researcher-report.md` | 26 KB |
| UI Designer | `ui-designer-report.md` | 30 KB |
| UX Designer | `ux-designer-report.md` | 33 KB |
| Developer | `developer-report.md` | 24 KB |
| Code Reviewer | `reviewer-report.md` | 22 KB |
| Critics | `critics-report.md` | 25 KB |
| Tester | `tester-report.md` | 24 KB |
| Quality Specialist | `quality-specialist-report.md` | 26 KB |
| **Total** | **9 reports** | **~230 KB** |
