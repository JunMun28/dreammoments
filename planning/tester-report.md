# DreamMoments Testing Strategy Report

**Date**: 2026-02-08
**Author**: QA Tester (automated analysis)
**Status**: Complete

---

## Executive Summary

DreamMoments has a **solid foundation** of E2E tests (11 spec files with ~50+ test cases) and a **modest set** of unit tests (7 test files). The existing tests cover the core happy paths across authentication, editor, dashboard, invite/RSVP, landing page, routing, and upgrade flows. However, there are **significant gaps** in unit test coverage for business logic, API handlers, validation, and utility functions. The E2E suite is well-structured with good test utilities, seed data management, and cross-browser/cross-viewport support. The primary risk areas are: **no unit tests for any API handler or core library module**, **no test coverage for the store/state management layer**, and **limited negative/error path testing**.

### Key Metrics

| Metric | Current | Target |
|--------|---------|--------|
| E2E spec files | 11 | 15-18 |
| E2E test cases | ~50 | ~90 |
| Unit test files | 7 | 25-30 |
| Unit test cases | ~15 | ~100+ |
| Browser coverage | 3 (Chromium, WebKit/iPhone, Android/Pixel) | 3 (adequate) |
| Viewport coverage | 6 responsive breakpoints tested | 6 (adequate) |
| Accessibility testing | axe-core integrated (4 scans) | 8-10 scans |
| API handler unit tests | 0 | 5 (one per handler) |
| Utility function unit tests | 1 (auth-redirect) | 8-10 |

---

## Current Test Coverage Audit

### E2E Test Inventory

| File | Tests | Coverage Area | Quality |
|------|-------|---------------|---------|
| `editor.spec.ts` | 10 | Layout, sections, fields, validation, undo/redo, autosave, beforeunload, preview, publish, AI panel, inline edit | Strong |
| `editor-keyboard.spec.ts` | 7 | Cmd+Z/Y/S/P, bracket navigation, ? help dialog | Good |
| `editor-gestures.spec.ts` | 3 | Swipe, drag on bottom sheet (mobile-only) | Fair (skipped on Chromium) |
| `editor-responsive.spec.ts` | 12 | 6 viewports x 2 tests (initial load + preview mode) with visual regression screenshots | Strong |
| `editor-mobile.spec.ts` | 5 | Bottom sheet, section nav, AI on mobile, inline edit | Good |
| `editor-accessibility.spec.ts` | 7 | axe-core scans (4), focus trap validation (3) | Strong |
| `auth.spec.ts` | 4 | Login success/invalid/unknown, Google OAuth, signup validation, password reset | Good |
| `dashboard.spec.ts` | 4 | Auth guard, empty state, list + actions (share/WhatsApp/preview/edit), delete confirm | Good |
| `invite.spec.ts` | 4 | Sample render, live view + hidden sections, RSVP submit, RSVP errors (guest limit + rate limit) | Good |
| `landing.spec.ts` | 5 | Hero, skip link, header unauth/auth, nav anchors, mobile nav | Good |
| `routing.spec.ts` | 4 | Smoke tests unauth/auth, editor/new redirect, callback redirect | Adequate |
| `upgrade.spec.ts` | 1 | Upgrade flow with currency selection and payment | Adequate |

**Total E2E tests: ~66 test cases across 11 spec files**

### E2E Test Infrastructure

| Component | Status | Notes |
|-----------|--------|-------|
| Test utilities (`utils.ts`) | Mature | Seed store builder, localStorage seeding, browser API stubs, store hydration waiting |
| Gesture helpers (`helpers/gestures.ts`) | Good | Touch event simulation for swipe/drag |
| Accessibility helpers (`helpers/accessibility.ts`) | Good | axe-core integration via `@axe-core/playwright` |
| Test fixtures | Minimal | Only `sample.png` for image upload testing |
| Playwright config | Well-configured | 3 projects (Chromium, WebKit/iPhone, Pixel 5), trace/video/screenshot on failure, fullyParallel, CI retries |

### Unit Test Inventory

| File | Tests | Coverage Area | Quality |
|------|-------|---------------|---------|
| `src/templates/templates.test.ts` | 3 | Template registry count, section IDs, design tokens | Basic |
| `src/tests/invite.test.tsx` | 1 | Love at Dusk renders 11 sections (SSR) | Basic |
| `src/tests/routes.test.tsx` | 1 | ShareModal renders share link (SSR) | Basic |
| `src/tests/templates-ui.test.tsx` | 1 | All templates render correct visible sections | Good |
| `src/tests/header.test.tsx` | 1 | Header nav links alignment and content | Basic |
| `src/tests/auth-redirect.test.ts` | 5 | Redirect sanitization, query parsing, location building | Strong |
| `src/tests/landing.test.tsx` | 3 | Landing page hero, collection cards, feature pills | Good |

**Total unit tests: ~15 test cases across 7 files**

### Vitest Configuration Assessment

- Environment: `node` (not `jsdom`) -- this means component tests use `renderToString` (SSR) rather than full DOM rendering
- E2E tests correctly excluded from Vitest runs
- No coverage reporting configured
- No `@testing-library/react` render-based tests despite the dependency being installed

---

## Critical Paths Without Coverage

### P0 - Must Have (Business-Critical)

1. **API Handlers (all 5 files)** - Zero unit tests
   - `src/api/auth.ts` - Login, signup, password hashing, session management
   - `src/api/invitations.ts` - CRUD operations, publish flow, slug generation
   - `src/api/guests.ts` - RSVP management, guest import/export
   - `src/api/public.ts` - Public invitation access, view tracking
   - `src/api/ai.ts` - AI generation, usage limits, content application

2. **Store/State Management** - Zero unit tests
   - `src/lib/store.ts` - Core application state, CRUD operations
   - `src/lib/storage.ts` - LocalStorage persistence layer

3. **Validation Logic** - Zero unit tests
   - `src/lib/validation.ts` - Zod schemas for all user inputs

4. **Session Management** - Zero unit tests
   - `src/lib/session.ts` - JWT handling with `jose`

5. **Slug Generation** - Zero unit tests
   - `src/lib/slug.ts` - URL slug creation and collision handling

### P1 - Should Have (UX-Critical)

6. **Editor Hooks** - Zero unit tests
   - `useEditorState.ts` - Core editor state management
   - `useAutoSave.ts` - 30-second auto-save logic
   - `useFieldValidation.ts` - Real-time field validation
   - `useAiAssistant.ts` - AI generation flow
   - `useInlineEdit.ts` - Inline editing state
   - `useKeyboardShortcuts.ts` - Keyboard shortcut handling
   - `useFocusTrap.ts` - Focus management
   - `useFormScrollSpy.ts` - Scroll-based section detection
   - `usePreviewScroll.ts` - Preview scroll synchronization

7. **AI Integration** - Zero unit tests
   - `src/lib/ai.ts` - AI client, prompt building, response parsing

8. **Template Content Building** - Minimal unit tests
   - `src/data/sample-invitation.ts` - Used in tests but never tested directly

### P2 - Nice to Have

9. **Utility Functions** - Partial coverage
   - `src/lib/utils.ts` - `cn()` helper (no tests)
   - `src/lib/scroll-effects.ts` - Scroll animation utilities (no tests)
   - `src/lib/data.ts` - Data helpers (no tests)

10. **Component Unit Tests** - Very minimal
    - No tests for any editor component (FieldRenderer, ContextPanel, EditorToolbar, etc.)
    - No tests for template-specific components
    - No tests for UI primitives (LoadingSpinner, Skeleton)

---

## Testing Priority Matrix

### HIGH Priority (Weeks 1-2)

| Item | Type | Effort | Risk if Untested |
|------|------|--------|------------------|
| Validation schemas (Zod) | Unit | 2-3 hours | Data corruption, security bypass |
| Slug generation + collision handling | Unit | 1-2 hours | Broken share links, duplicate URLs |
| Auth redirect sanitization (expand) | Unit | 1 hour | Open redirect vulnerability |
| Store CRUD operations | Unit | 3-4 hours | Data loss, state corruption |
| Session/JWT handling | Unit | 2-3 hours | Auth bypass, token expiry issues |
| API auth handler | Unit | 3-4 hours | Account takeover, credential issues |
| RSVP E2E: dietary options, plus-ones edge cases | E2E | 2-3 hours | Guest management failures |
| Editor auto-save reliability | E2E | 2 hours | Data loss |

### MEDIUM Priority (Weeks 3-4)

| Item | Type | Effort | Risk if Untested |
|------|------|--------|------------------|
| API invitation handler | Unit | 3-4 hours | CRUD failures |
| API guest handler | Unit | 3-4 hours | RSVP failures |
| API AI handler + usage limits | Unit | 2-3 hours | Overuse, billing issues |
| useEditorState hook | Unit | 3-4 hours | Editor state bugs |
| useAutoSave hook | Unit | 2-3 hours | Save timing issues |
| useFieldValidation hook | Unit | 2 hours | Bad validation feedback |
| Template rendering edge cases | Unit | 2-3 hours | Broken invitations |
| Dashboard analytics display | E2E | 2 hours | Incorrect metrics |
| Multi-template editor testing | E2E | 3-4 hours | Template-specific bugs |

### LOW Priority (Weeks 5-6)

| Item | Type | Effort | Risk if Untested |
|------|------|--------|------------------|
| Scroll effects utilities | Unit | 1-2 hours | Animation glitches |
| cn() utility | Unit | 30 min | CSS class conflicts |
| UI primitive components | Unit | 1-2 hours | Rendering issues |
| Editor component snapshots | Unit | 2-3 hours | Visual regressions |
| Performance benchmarks | Perf | 3-4 hours | Slow load times |
| CSV import/export | E2E | 2-3 hours | Data format issues |

---

## Recommended Test Scenarios

### Editor (Highest Priority)

**E2E - Additional scenarios needed:**
1. Multi-template editing: Test all 4 templates (love-at-dusk, blush-romance, garden-romance, eternal-elegance) in editor
2. Section reordering persistence: Verify section visibility toggles persist across page reload
3. Concurrent editing: Open editor in two tabs and verify no data corruption
4. Large content handling: Fill all sections with maximum-length content
5. Image upload failure: Test with invalid file types, oversized files
6. Auto-save conflict: Modify content and navigate away before auto-save completes
7. Undo/redo across sections: Make changes in multiple sections, verify undo stack spans sections
8. Editor with no template: Navigate to editor with invalid invitation ID

**Unit tests needed:**
1. `useEditorState`: Initial state, field updates, section switching, undo/redo stack
2. `useAutoSave`: Timer behavior, dirty detection, save trigger, error recovery
3. `useFieldValidation`: Required fields, format validation, error clearing
4. `useInlineEdit`: Open/close, value commit, cancel behavior
5. `useKeyboardShortcuts`: Event handling, modifier key detection, input field suppression
6. `useFocusTrap`: Trap activation, tab cycling, escape handling

### RSVP System

**E2E - Additional scenarios needed:**
1. RSVP with all dietary options selected
2. RSVP update flow (guest returns to change response)
3. RSVP with very long message text
4. RSVP form validation: empty name, negative guest count, future deadline
5. Dashboard RSVP stats accuracy: Verify counts match actual guest records
6. RSVP from multiple guests on same invitation

**Unit tests needed:**
1. Guest count calculation with plus-ones
2. Dietary summary aggregation
3. RSVP deadline enforcement
4. Rate limiting logic

### Templates

**E2E - Additional scenarios needed:**
1. All 4 templates render correctly on mobile viewport
2. Template switching in editor preserves content where field names match
3. Section visibility toggles work per-template
4. Template-specific animations fire (or gracefully degrade with reduced-motion)

**Unit tests needed:**
1. All template configs pass schema validation
2. Section field definitions match expected types
3. Design tokens are complete (no missing color/font values)
4. Sample content builder produces valid data for every template
5. Template versioning: Snapshot matches current config

### AI Assistant

**E2E - Additional scenarios needed:**
1. AI generation for each task type (tagline, schedule, FAQ, story, translate)
2. AI regenerate flow: Generate, reject, regenerate
3. AI generation with empty prompt
4. AI limit enforcement at exact boundary (4th vs 5th generation for free tier)
5. AI content application: Verify generated content replaces existing content correctly

**Unit tests needed:**
1. Prompt template construction with context variables
2. AI response parsing and content extraction
3. Usage counter increment/decrement
4. Tier limit checking (free vs premium)
5. Error handling for AI API failures

### Authentication

**E2E - Additional scenarios needed:**
1. Session expiry handling: Token expires while using app
2. OAuth callback with malformed state parameter
3. Login with special characters in email/password
4. Concurrent login from multiple tabs
5. Logout flow: Verify session cleared and redirected

**Unit tests needed:**
1. Password hashing and comparison
2. JWT creation with correct claims
3. JWT verification and expiry checking
4. OAuth state parameter encoding/decoding
5. Session token rotation

### Dashboard

**E2E - Additional scenarios needed:**
1. Dashboard with many invitations (10+): scrolling, pagination
2. Dashboard invitation status transitions: draft -> published -> archived
3. Dashboard analytics: verify view counts, RSVP rates display correctly
4. Dashboard search/filter functionality (if implemented)
5. Dashboard with mixed free/premium invitations

### Landing Page

**E2E - Additional scenarios needed:**
1. Template showcase scroll animations fire on all browsers
2. CTA buttons navigate to correct auth pages with redirect params
3. Pricing section displays correct tier information
4. Mobile layout: all sections accessible via scroll

---

## Edge Cases and Error Scenarios

### Data Edge Cases
1. Empty invitation content (all fields blank)
2. Maximum length strings in all text fields
3. Unicode/emoji characters in names, messages, venues
4. Chinese characters in bilingual content fields
5. Special characters in slugs (spaces, punctuation, Unicode)
6. Zero guests RSVP scenario
7. 500+ guests on single invitation
8. Invitation with all sections hidden
9. Invitation with all sections visible

### Error Scenarios
1. Network failure during auto-save
2. Network failure during AI generation
3. Network failure during RSVP submission
4. LocalStorage full (5MB limit)
5. LocalStorage unavailable (private browsing in some browsers)
6. Invalid JSON in localStorage (data corruption)
7. Browser back/forward navigation during editor operations
8. Page refresh with unsaved changes (beforeunload already partially tested)
9. Multiple rapid form submissions (debouncing)
10. Race condition: Two auto-saves trigger simultaneously

### Security Edge Cases
1. XSS in user-generated content (names, messages, FAQ answers)
2. CSRF in RSVP form submission
3. Open redirect in auth callback
4. Slug enumeration/guessing
5. Rate limiting bypass attempts
6. JWT manipulation (expired, malformed, wrong signature)

### Browser-Specific Edge Cases
1. Safari ITP blocking localStorage in iframes
2. Firefox strict tracking protection blocking analytics
3. Chrome memory pressure during large gallery rendering
4. Mobile Safari address bar resize affecting viewport calculations
5. Android keyboard pushing viewport up during form input

---

## Mobile Testing Strategy

### Current Coverage
- **Good**: 3 Playwright projects cover Chromium (desktop), WebKit (iPhone 13), and Android (Pixel 5)
- **Good**: 6 responsive viewport tests in `editor-responsive.spec.ts`
- **Good**: Mobile-specific editor tests in `editor-mobile.spec.ts`
- **Good**: Gesture/touch tests in `editor-gestures.spec.ts`
- **Fair**: Mobile nav toggle test in `landing.spec.ts`

### Gaps and Recommendations

1. **Add iPad/tablet testing**: The responsive tests cover iPad sizes but only in the editor. Add tablet tests for dashboard, invite view, and landing page.

2. **Real device testing**: Playwright touch event simulation has limitations (acknowledged in test comments). Consider BrowserStack or Sauce Labs integration for real device testing on:
   - iPhone 14/15 (Safari)
   - Samsung Galaxy S23 (Chrome)
   - iPad Air (Safari)

3. **Mobile-specific scenarios to add**:
   - Portrait/landscape orientation switching during editing
   - Keyboard appearance/dismissal during form input
   - Pull-to-refresh behavior (if applicable)
   - Bottom sheet scroll vs page scroll conflict
   - Safe area inset handling (notch devices)
   - Share sheet native integration (WhatsApp deep link)

4. **Visual regression mobile tests**: Extend screenshot comparison to:
   - All 4 templates on mobile viewport
   - RSVP form on mobile
   - Dashboard on mobile
   - Auth pages on mobile

---

## Performance Testing Recommendations

### Current State
- `web-vitals` package is installed but no performance test harness exists
- No Lighthouse CI integration
- No load testing for concurrent RSVP submissions

### Recommendations

1. **Lighthouse CI Integration**
   - Add `@lhci/cli` to devDependencies
   - Run Lighthouse on: landing page, invite view, editor, dashboard
   - Gate on: Performance > 90, Accessibility > 95, Best Practices > 90
   - Run in CI on every PR

2. **Core Web Vitals Monitoring**
   - Add E2E tests that measure LCP, FID, CLS using the installed `web-vitals` package
   - Target: LCP < 2.5s, FID < 100ms, CLS < 0.1

3. **Bundle Size Monitoring**
   - Track JS bundle size per-route using `vite-bundle-analyzer` or similar
   - Alert on significant increases (> 10KB per PR)

4. **Template Rendering Performance**
   - Benchmark template rendering time for each template
   - Test with 50+ gallery photos
   - Test with long love story timelines (20+ milestones)
   - Verify scroll animations maintain 60fps

5. **Load Testing (pre-launch)**
   - Simulate 100 concurrent RSVP submissions
   - Verify database handles 1000+ invitation views simultaneously
   - Test with 500+ guests per invitation

---

## CI/CD Pipeline Recommendations

### Current Pipeline
- No CI/CD configuration files detected (no `.github/workflows/`, no `vercel.json` test configuration)

### Recommended Pipeline

```yaml
# .github/workflows/test.yml structure
name: Test Suite

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  lint:
    # Biome lint + format check
    - pnpm check

  unit-tests:
    # Vitest with coverage
    - pnpm test -- --coverage
    # Coverage threshold enforcement (aim for 60% initially, grow to 80%)

  e2e-tests:
    # Playwright tests across 3 browsers
    - pnpm test:e2e
    # Upload trace/video artifacts on failure
    # Upload visual regression screenshots

  lighthouse:
    # Lighthouse CI on key pages
    - Landing page
    - Sample invitation view
    - Editor (with seeded data)

  type-check:
    # TypeScript strict check
    - npx tsc --noEmit
```

### Pipeline Stages

1. **Pre-commit (local)**: `pnpm check` (lint + format via Biome)
2. **PR opened**: Unit tests + type check + lint (fast, < 2 min)
3. **PR review**: E2E tests (slower, 5-10 min, can be parallelized)
4. **Pre-merge**: Full suite (unit + E2E + Lighthouse)
5. **Post-merge to main**: Visual regression baseline update

### Artifact Management
- Store Playwright traces/videos for failed tests (7-day retention)
- Store visual regression screenshots as CI artifacts
- Store coverage reports and trend over time

---

## Estimated Effort for Comprehensive Coverage

### Phase 1: Foundation (2-3 days)

| Task | Hours |
|------|-------|
| Add Vitest coverage configuration | 1 |
| Unit tests for `src/lib/validation.ts` | 3 |
| Unit tests for `src/lib/slug.ts` | 2 |
| Unit tests for `src/lib/store.ts` | 4 |
| Unit tests for `src/lib/session.ts` | 3 |
| Expand auth-redirect tests | 1 |
| Set up CI/CD pipeline (basic) | 3 |
| **Subtotal** | **17** |

### Phase 2: API & Business Logic (3-4 days)

| Task | Hours |
|------|-------|
| Unit tests for `src/api/auth.ts` | 4 |
| Unit tests for `src/api/invitations.ts` | 4 |
| Unit tests for `src/api/guests.ts` | 4 |
| Unit tests for `src/api/public.ts` | 3 |
| Unit tests for `src/api/ai.ts` | 3 |
| Unit tests for `src/lib/ai.ts` | 3 |
| Unit tests for `src/lib/storage.ts` | 2 |
| **Subtotal** | **23** |

### Phase 3: Editor Hooks (2-3 days)

| Task | Hours |
|------|-------|
| Unit tests for `useEditorState` | 4 |
| Unit tests for `useAutoSave` | 3 |
| Unit tests for `useFieldValidation` | 2 |
| Unit tests for `useAiAssistant` | 3 |
| Unit tests for `useInlineEdit` | 2 |
| Unit tests for `useKeyboardShortcuts` | 2 |
| Unit tests for `useFocusTrap` | 2 |
| **Subtotal** | **18** |

### Phase 4: E2E Expansion (3-4 days)

| Task | Hours |
|------|-------|
| Multi-template editor E2E tests | 4 |
| RSVP edge cases E2E | 3 |
| AI assistant full flow E2E | 3 |
| Dashboard analytics E2E | 2 |
| Auth edge cases E2E | 2 |
| Mobile template rendering E2E | 3 |
| Landing page interactions E2E | 2 |
| Error scenario E2E tests | 4 |
| **Subtotal** | **23** |

### Phase 5: Performance & Polish (2-3 days)

| Task | Hours |
|------|-------|
| Lighthouse CI integration | 3 |
| Core Web Vitals E2E measurement | 3 |
| Bundle size monitoring | 2 |
| Visual regression baseline for all templates | 3 |
| CI/CD pipeline finalization | 3 |
| **Subtotal** | **14** |

### Total Estimated Effort

| Phase | Hours | Days (8h/day) |
|-------|-------|---------------|
| Phase 1: Foundation | 17 | 2-3 |
| Phase 2: API & Business Logic | 23 | 3 |
| Phase 3: Editor Hooks | 18 | 2-3 |
| Phase 4: E2E Expansion | 23 | 3 |
| Phase 5: Performance & Polish | 14 | 2 |
| **Total** | **95** | **12-14** |

---

## Configuration Observations and Recommendations

### Playwright Config
- **Good**: 3 browser projects with appropriate device profiles
- **Good**: Trace, video, and screenshot retention on failure
- **Good**: fullyParallel enabled for speed
- **Improvement**: Add `--shard` support for CI parallelization across multiple runners
- **Improvement**: Consider adding a Firefox project for broader coverage
- **Improvement**: Add `testIdAttribute: 'data-testid'` for consistent test selectors

### Vitest Config
- **Issue**: Environment is `node`, not `jsdom`. Component tests use `renderToString` which only tests SSR output, not interactive behavior
- **Improvement**: Switch to `environment: 'jsdom'` for component tests, or create separate test config for SSR vs interactive tests
- **Improvement**: Add coverage configuration:
  ```ts
  coverage: {
    provider: 'v8',
    reporter: ['text', 'html', 'lcov'],
    thresholds: { lines: 60, functions: 60, branches: 60 },
    include: ['src/lib/**', 'src/api/**', 'src/components/editor/hooks/**'],
  }
  ```
- **Note**: `@testing-library/react` and `@testing-library/dom` are installed as devDependencies but not used in any tests. These should be leveraged for proper component testing with user interaction simulation.

### Test Data Management
- **Good**: Well-structured seed store builder with comprehensive test data
- **Good**: Separation of test users (free vs premium)
- **Improvement**: Add factory functions for generating randomized test data (fuzzing)
- **Improvement**: Add test data for all 4 templates (currently seeds all 4 but only actively tests love-at-dusk in most specs)

---

## Summary of Top Recommendations

1. **Immediately**: Add unit tests for `validation.ts`, `slug.ts`, and `store.ts` -- these are the highest-risk business logic with zero coverage
2. **This week**: Set up CI/CD pipeline with Biome lint + Vitest + Playwright
3. **Next sprint**: Add Vitest coverage reporting and set initial thresholds at 60%
4. **Next sprint**: Switch Vitest environment to `jsdom` and use `@testing-library/react` for component tests
5. **Before launch**: Complete Phase 1-3 (foundation + API + hooks) to reach ~60% unit test coverage on critical paths
6. **Before launch**: Add Lighthouse CI to prevent performance regressions
7. **Ongoing**: Expand E2E tests per-feature as new features land
