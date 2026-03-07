# E2E User Story Tests Design

**Date:** 2026-03-05
**Status:** Approved

## Context

DreamMoments recently migrated from custom auth to Clerk. The existing E2E tests in `tests/e2e/` use an obsolete localStorage-based `Store` pattern. This design replaces and extends those tests with Clerk-aware E2E tests covering all critical user stories.

## Infrastructure Changes

### 1. Clerk Testing Integration

Install `@clerk/testing` and create a global setup that obtains testing tokens via `clerkSetup()`. Tests use `setupClerkTestingToken()` + `clerk.signIn()` to authenticate without interacting with Clerk UI.

**Files:**
- `tests/e2e/global.setup.ts` — calls `clerkSetup()`, signs in test users, saves storage state
- `tests/e2e/utils.ts` — updated with Clerk-aware helpers, DB seed utilities
- `playwright.config.ts` — add setup project dependency

**Environment variables required:**
- `CLERK_PUBLISHABLE_KEY` (existing)
- `CLERK_SECRET_KEY` (existing)
- `E2E_CLERK_USER_USERNAME` — test user email
- `E2E_CLERK_USER_PASSWORD` — test user password

### 2. Test Database Seeding

Use Drizzle ORM to seed/clean the test database directly. Each test suite uses `beforeAll`/`afterAll` hooks to insert and clean fixture data. A shared `tests/e2e/fixtures/seed.ts` module provides reusable seed functions.

### 3. Playwright Config Updates

- Add `setup-auth` project that runs `global.setup.ts` first
- All spec projects depend on `setup-auth`
- Storage state persisted to `tests/e2e/.auth/user.json`

## Test Suites

### Suite 1: Landing & Navigation (`landing.spec.ts`)
- Hero section renders with CTA buttons
- Theme toggle switches light/dark
- Navigation anchors scroll to sections
- Template preview overlay opens/closes
- Primary CTA navigates to `/editor/new`
- Footer renders with social links
- FAQ accordion expand/collapse

### Suite 2: Authentication (`auth.spec.ts`)
- Unauthenticated → redirected from protected routes
- Sign in via Clerk → lands on dashboard
- Signed-in user sees name/avatar in header
- Sign-out clears session
- OAuth callback redirects to intended destination

### Suite 3: Template Selection (`template-selection.spec.ts`)
- `/editor/new` shows template grid
- Template cards show name, preview, description
- Click template opens preview modal
- "Use this template" creates invitation → redirects to editor
- Created invitation visible in dashboard

### Suite 4: Dashboard Management (`dashboard.spec.ts`)
- List of invitations sorted by date
- Status badges (Draft/Published)
- Empty state when no invitations
- Share modal with copyable link
- WhatsApp share URL
- Preview button
- Edit button → canvas editor
- Delete confirmation flow (confirm + cancel)

### Suite 5: Canvas Editor (`editor.spec.ts`)
- Section rail and content panel load
- Section switching
- Visibility toggle
- Text field editing
- Image upload
- Undo/redo
- Autosave indicator
- Preview mode
- Unsaved changes prompt (beforeunload)

### Suite 6: Publishing & Sharing (`publish-share.spec.ts`)
- Free user publishes with auto-slug
- Premium user customizes slug
- Published invitation accessible at `/invite/{slug}`
- Share modal with correct URL
- Copy-to-clipboard
- Unpublish makes invitation inaccessible
- Duplicate slug error

### Suite 7: Public Invitation View (`invite-view.spec.ts`)
- All visible sections render (hero, announcement, couple, story, gallery, schedule, venue, rsvp, faq, footer)
- Hidden sections not rendered
- Bilingual titles
- Countdown timer
- Venue map placeholder
- Gallery photos
- Non-existent slug → error

### Suite 8: RSVP Submission (`rsvp.spec.ts`)
- RSVP form accessible
- Submit with name + attendance
- Plus-one count
- Dietary requirements
- Optional message
- Confirmation screen
- Duplicate prevention (localStorage)
- Edit RSVP
- Validation errors on required fields

### Suite 9: Upgrade & Payment (`upgrade.spec.ts`)
- Pricing page for MYR/SGD
- Currency selector
- Stripe checkout initiation
- Success page after payment
- User plan updates to premium

### Suite 10: Route Guards & Navigation (`routing.spec.ts`)
- Public routes accessible without auth
- Protected routes redirect to sign-in
- Authenticated access to all routes
- Deep link preservation after auth redirect
- 404 for non-existent routes
- Browser back/forward navigation

### Suite 11: Mobile Experience (`mobile.spec.ts`)
- Responsive landing hero
- Dashboard cards stack on mobile
- Editor bottom sheet on section tap
- AI assistant as bottom sheet
- RSVP form usable on mobile
- Hamburger menu navigation

## Dependencies

- `@clerk/testing` (new dev dependency)
- Existing: `@playwright/test`, `drizzle-orm`

## Out of Scope

- Visual regression tests (existing editor-responsive.spec.ts covers this)
- Performance/load testing
- Accessibility scans (existing editor-accessibility.spec.ts covers this)
- AI content generation E2E (requires external API mocking)
