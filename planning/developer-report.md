# DreamMoments Technical Architecture Assessment

**Date**: 2026-02-08
**Assessor**: Developer Agent
**Scope**: Full codebase review against PRD v1.0

---

## Executive Summary

DreamMoments has a solid foundational architecture built on modern React 19 + TanStack Start with a well-structured dual-layer data system (PostgreSQL via Drizzle ORM + localStorage fallback). The codebase demonstrates good separation of concerns, type safety via TypeScript strict mode, and thoughtful editor UX patterns including undo/redo, auto-save, keyboard shortcuts, and responsive layouts.

**Key Strengths:**
- Configuration-driven template system aligning with PRD architecture
- Clean API layer using TanStack Start server functions with Zod validation
- Dual-persistence model (DB + localStorage) enabling graceful offline/no-DB development
- Comprehensive editor hook architecture with single-responsibility hooks
- Accessibility groundwork (skip links, ARIA labels, focus traps, keyboard navigation)

**Key Risks:**
- Password hash column missing from the database schema (login broken for DB-backed email auth)
- No GSAP integration -- scroll animations use Motion library only, which falls short of PRD's "cinematic" animation vision
- Template components are hardcoded React components, not fully configuration-driven as PRD specifies
- Auto-save only persists to localStorage, not to the server database
- No Cloudflare R2 storage integration (image uploads are client-side only)
- No Stripe payment integration
- No rate limiting on public RSVP/view endpoints
- JWT secret fallback to insecure default in development

---

## Architecture Overview

### Current vs PRD Target

| Aspect | PRD Spec | Current Implementation | Gap |
|--------|----------|----------------------|-----|
| Framework | TanStack Start | TanStack Start + Vite 7 + Nitro SSR | Aligned |
| Styling | Tailwind CSS | Tailwind CSS 4 via Vite plugin | Aligned |
| Animations | GSAP + Motion | Motion only | Medium gap |
| Database | Neon (Postgres) | PostgreSQL + Drizzle ORM | Aligned (Neon ready) |
| ORM | Drizzle | Drizzle 0.45 | Aligned |
| Auth | Better Auth / Lucia | Custom JWT + bcrypt (jose) | Diverged -- simpler but less robust |
| Storage | Cloudflare R2 | Client-side only (`lib/storage.ts`) | Major gap |
| AI Provider | Kimi K2.5 (Moonshot) | OpenAI-compatible API (configurable) | Flexible, good |
| Payments | Stripe | Schema only, no integration | Major gap |
| Hosting | Vercel | Not configured | Not assessed |

### Project Structure

The actual project structure closely matches the PRD's specification with some notable improvements:

```
src/
  api/              # 5 server function modules (auth, invitations, guests, public, ai)
  routes/           # 14 route files covering auth, dashboard, editor, invite, landing
  components/
    editor/         # 20+ components + 10 hooks -- rich editor architecture
    templates/      # 4 template renderers + InvitationRenderer router
    landing/        # Landing page sections
    share/          # Share modal
    ui/             # Shared primitives
  templates/        # 4 template configs + types
  lib/              # 12 utility modules (auth, ai, session, validation, store, etc.)
  db/               # Schema, connection, seed
  data/             # Sample invitation data
```

**Good**: Editor hooks are decomposed into single-responsibility modules (useAutoSave, useEditorState, useAiAssistant, useInlineEdit, useKeyboardShortcuts, usePreviewScroll, useFormScrollSpy, useFocusTrap, useMediaQuery, useSectionProgress, useFieldValidation). This is excellent architecture.

**Concern**: The main editor route file (`src/routes/editor/$invitationId.tsx`) is 725 lines and acts as a mega-orchestrator. While the hooks help, the render logic is complex with many local states and handlers.

---

## Database Schema Assessment

### Schema vs PRD (Section 7)

The Drizzle schema in `src/db/schema.ts` covers all 6 PRD-specified tables:

| Table | PRD Fields | Implementation | Notes |
|-------|-----------|---------------|-------|
| `users` | 7 columns | 8 columns (+`plan`) | `plan` added, `password_hash` **missing** |
| `invitations` | 15 columns | 16 columns (+`invitedCount`) | Good coverage |
| `guests` | 12 columns | 13 columns | Aligned |
| `invitation_views` | 5 columns | 6 columns (+`deviceType`) | Good addition |
| `ai_generations` | 6 columns | 6 columns | Aligned |
| `payments` | 8 columns | 8 columns | Aligned |

### Critical Issues

1. **Missing `password_hash` column on `users` table**: The PRD doesn't explicitly mention it, but the auth implementation comments acknowledge this gap. Email+password login with a real database returns `"Password verification unavailable for this account"` (line 223 of `src/api/auth.ts`). This is a blocking issue for production.

2. **No migration files in repository**: The `drizzle/` output directory is not evident. Migrations need to be generated and versioned.

### Index Coverage

All PRD-specified indexes are implemented:
- `idx_invitations_user` (userId)
- `idx_invitations_slug` (slug, unique constraint)
- `idx_guests_invitation` (invitationId)
- `idx_views_invitation` (invitationId)
- `idx_views_date` (viewedAt)
- `idx_ai_invitation` (invitationId) -- added beyond PRD

### JSONB Typing

The schema uses `.$type<>()` for JSONB column typing, which provides compile-time safety. However, `content` is typed as `Record<string, unknown>` rather than the more specific `InvitationContent` interface. This means the DB layer loses type information that must be re-asserted at the API boundary via casts.

---

## API Implementation Status

### Server Function Architecture

All APIs use TanStack Start's `createServerFn()` pattern with:
- Input validation via Zod schemas
- Dual-path: PostgreSQL when available, localStorage fallback otherwise
- Ownership verification on mutation endpoints

| API Category | PRD Endpoints | Implemented | Gap |
|-------------|--------------|-------------|-----|
| Invitations CRUD | 5 endpoints | 6 (+ unpublish) | Exceeds PRD |
| RSVP/Guests | 4 endpoints | 5 (+ updateGuest) | Exceeds PRD |
| AI | 3 endpoints | 1 (unified generate) | Simplified, adequate |
| Analytics | 2 endpoints | 1 (trackView only) | Missing `GET analytics` |
| Public | 2 endpoints | 2 | Aligned |
| Auth | N/A in API spec | 5 (signup, login, logout, session, google) | Complete |

### Security Observations

**Good:**
- Zod validation on all inputs
- Ownership verification before mutations
- RSVP checks invitation published status before accepting
- Guest count limit enforcement
- Google OAuth token exchange on server side
- Passwords hashed with bcrypt cost 12

**Concerning:**
- No rate limiting on any endpoint (RSVP submission, AI generation, view tracking)
- Public RSVP endpoint lacks CAPTCHA or bot protection
- JWT logout is a no-op (stateless JWT with no revocation mechanism)
- `visitorHash` for view tracking uses `btoa(userAgent + timestamp)` which is predictable and not a true fingerprint
- AI API key is validated for presence but error messages could leak configuration details
- No CSRF protection (TanStack Start server functions may handle this, but not explicitly verified)

---

## Template System Review

### Configuration Architecture

The template type system (`src/templates/types.ts`) closely matches the PRD's `TemplateConfig` interface:

```typescript
TemplateConfig {
  id, name, nameZh, description, category
  sections: SectionConfig[]
  tokens: DesignTokens
  aiConfig: { defaultTone, culturalContext }
  version: string
}
```

**4 templates implemented** (PRD specifies 3):
1. `blush-romance` (extra, not in PRD)
2. `love-at-dusk` (PRD: Love at Dusk)
3. `garden-romance` (PRD: Garden Romance)
4. `eternal-elegance` (PRD: Eternal Elegance)

### Template Rendering Gap

The PRD envisions templates as "configuration-driven, not hardcoded React components." The current implementation is **partially configuration-driven**:

- **Configuration-driven**: Section definitions, field configs, design tokens, visibility toggles are all data-driven from `TemplateConfig`.
- **Hardcoded components**: Each template has its own React component (`BlushRomanceInvitation.tsx`, `LoveAtDuskInvitation.tsx`, etc.) selected by `InvitationRenderer.tsx` via if-else chain. Section rendering within templates appears to be template-specific JSX, not a universal section renderer.

This is a pragmatic trade-off -- fully configuration-driven templates would require a generic section renderer that handles all animation and layout variants, which is complex. But it means adding new templates requires new React components, not just new config files.

### Section Coverage

| Section Type | PRD Love at Dusk | Implemented | Notes |
|-------------|-----------------|-------------|-------|
| hero | Yes | Yes | |
| announcement | Yes | Yes | |
| couple | Yes | Yes | |
| story | Yes | Yes | |
| gallery | Yes | Yes | |
| schedule | Yes | Yes | |
| venue | Yes | Yes | |
| entourage | Yes | Yes | |
| registry | Yes | Yes (default hidden) | |
| rsvp | Yes | Yes | |
| footer | Yes | Yes | |

All 11 sections from Love at Dusk are present. Extra section types (`calendar`, `countdown`, `details`, `extra`) are defined in the type system for other templates.

### Template Versioning

The PRD specifies version-locking templates at publish time with a snapshot fallback mechanism. This is **partially implemented**:

- `templateVersion` is stored on invitations
- `templateSnapshot` is populated at publish time (full template config as JSONB)
- Missing: No rendering fallback logic that uses snapshot when current version is incompatible
- Missing: No migration mechanism for non-breaking updates

---

## Editor Architecture Deep-Dive

### State Management

The editor uses a well-decomposed hook architecture:

```
useEditorState       -- Draft content, undo/redo (20-level), field changes, section visibility
useAutoSave          -- 30-second interval save, beforeunload warning, save status
useAiAssistant       -- AI panel state, generation, apply results
useInlineEdit        -- Click-to-edit text overlay state
usePreviewScroll     -- Preview pane scroll-to-section
useFormScrollSpy     -- Mobile form scroll spy for active section
useKeyboardShortcuts -- Cmd+Z/Y, Cmd+S, Cmd+P, [/] panel toggle
useFocusTrap         -- Dialog focus containment
useMediaQuery        -- Responsive breakpoint detection
useSectionProgress   -- Per-section completion percentage
useFieldValidation   -- Per-field validation (required, date format, email)
```

### Undo/Redo

- Implemented as an in-memory history stack (last 20 states) + future stack (20 states)
- Uses `structuredClone` for immutable state transitions
- Triggered on every `handleFieldChange` call
- Works correctly for all field types including nested paths

**Concern**: History stores full content snapshots. With complex invitation content, this creates 20 deep clones in memory. For MVP this is fine, but a diff-based approach would be more memory-efficient at scale.

### Auto-Save

- 30-second interval via `setInterval`
- Saves to **localStorage only** (calls `updateInvitationContent` and `setInvitationVisibility` from `lib/data.ts`)
- Does NOT save to the PostgreSQL database via server functions
- `beforeunload` warning for unsaved changes
- Save status indicator (saved/saving/unsaved)

**Critical Gap**: The auto-save does not persist to the server. If a user uses the DB-backed path, their edits are only saved locally and would be lost on a different device/browser. The `updateInvitationFn` server function exists but is not called by auto-save.

### Layout System

`EditorLayout` provides:
- Desktop: 3-column grid (optional section rail + preview + context panel) with collapsible panel
- Mobile/Tablet: Stacked layout with toolbar, preview, pill bar, and bottom sheet
- Responsive breakpoints via `useMediaQuery`
- Bottom sheet with snap points (30%, 60%, 95%)
- Panel collapse/expand with keyboard shortcut ([/])

### Inline Editing

- Click-to-edit overlay for text fields in the preview
- Positioned popover on desktop, bottom bar on mobile
- State managed by `useInlineEdit` hook
- Saves back to draft via `setValueByPath`

---

## AI Integration Assessment

### Architecture

The AI system has 3 layers:

1. **Client hook** (`useAiAssistant`): Panel state, generation flow, apply results
2. **Client library** (`lib/ai.ts`): Tries server function, falls back to mock data
3. **Server function** (`api/ai.ts`): OpenAI-compatible API call with system prompts

### Strengths

- **Provider-agnostic**: Uses OpenAI-compatible API format with configurable `AI_API_URL`, `AI_MODEL`, and `AI_API_KEY` env vars. Works with any OpenAI-compatible provider (not locked to Kimi K2.5 as PRD suggests).
- **Mock fallback**: When AI is not configured, mock data is returned silently. Excellent for development.
- **Structured output**: Requests `response_format: { type: "json_object" }` and parses/validates responses per type.
- **6 generation types**: schedule, faq, story, tagline, style, translate -- covers all PRD requirements.
- **Cultural context**: System prompts include Malaysian/Singaporean Chinese wedding context (tea ceremony, ang pao, etc.).
- **Usage tracking**: AI generation count tracked per invitation, with plan-based limits.

### Gaps

- **No server-side AI generation record**: `useAiAssistant` calls `recordAiGeneration()` and `incrementAiUsage()` from `lib/data.ts` (localStorage), not from server functions. DB-backed path doesn't track AI generations.
- **No apply endpoint**: PRD specifies `POST /api/ai/apply` to persist accepted generations. Current implementation applies directly to draft state client-side.
- **30-second timeout**: May be too short for complex generations on slower providers.
- **No streaming**: Full response required before display. Streaming would improve perceived performance.

---

## Auth & Security Review

### Authentication Flow

Two auth paths implemented:

1. **Server-backed (JWT)**: Email/password signup/login, Google OAuth, session verification via jose JWT
2. **localStorage fallback**: In-memory user store, bcrypt password hashing, used when DATABASE_URL is not set

Both paths sync to localStorage for legacy compatibility.

### Security Assessment

| Aspect | Status | Notes |
|--------|--------|-------|
| Password hashing | Good | bcrypt cost 12 |
| JWT signing | Adequate | HS256 via jose, 7-day expiry, auto-refresh within 1 day |
| JWT secret | Risk | Falls back to `"dev-secret-change-in-production"` with console warning |
| Google OAuth | Good | Server-side token exchange, no client secret exposure |
| Session revocation | Missing | Stateless JWT, no deny list. Logout is client-side only |
| CSRF | Unclear | TanStack Start server functions use POST, but no explicit CSRF tokens |
| XSS | Low risk | React's JSX escaping, no `dangerouslySetInnerHTML` observed |
| SQL injection | Protected | Drizzle ORM parameterized queries |
| Input validation | Good | Zod schemas on all API inputs |
| Authorization | Good | Ownership checks on all mutation endpoints |
| Rate limiting | Missing | No rate limiting on any endpoint |
| CORS | Default | Not explicitly configured |

### Password Storage Gap

The `users` table has no `password_hash` column. Signup stores the hash nowhere in the DB path (the hash is computed but only the user record without it is inserted). Login returns a hardcoded error message. This is a **blocker for production email+password auth**.

---

## Performance Assessment

### Code Splitting

- **Route-based splitting**: TanStack Router's file-based routing provides automatic code splitting per route.
- **Template components**: All 4 template invitation components are imported eagerly in `InvitationRenderer.tsx`. These should be lazy-loaded since only one is active at a time.
- **DevTools**: Properly gated behind `import.meta.env.DEV`.
- **bcryptjs**: Dynamically imported in `auth.tsx` fallback functions (good).

### Bundle Concerns

- `motion` library included (relatively heavy for animations)
- No GSAP (lighter than feared -- but PRD requires it)
- `lucide-react` for icons (tree-shakeable)
- `zod` v4 included (modern, lighter than v3)
- No image optimization library

### Lazy Loading Opportunities

1. **Template components**: `InvitationRenderer` should use `React.lazy()` + `Suspense` for template components
2. **AI assistant drawer**: Could be lazy-loaded since it's not always visible
3. **Bottom sheet / mobile components**: Could be lazy-loaded for desktop-only users
4. **Dashboard components**: Not assessed (out of scope for editor focus)

### Rendering Performance

- `structuredClone` on every field change creates deep copies -- adequate for current data sizes
- `useMemo` used appropriately for derived state (pillSections, hiddenSections)
- Preview frame likely re-renders on every draft change -- memoization of template components would help
- No `React.memo` or `useMemo` observed on template section components

### Missing Optimizations

- No `prefers-reduced-motion` support (PRD section 6.3 requires it)
- No image lazy loading / optimization
- No web worker for heavy computation
- No service worker for offline support
- No resource hints (preconnect, prefetch)

---

## Technical Debt Inventory

### High Priority

1. **Password hash column missing from DB schema** -- blocks email auth in production
2. **Auto-save doesn't persist to server** -- data loss risk for DB-backed users
3. **No rate limiting** -- abuse vector on public endpoints
4. **No image storage backend** -- `lib/storage.ts` is client-side only
5. **JWT secret insecure default** -- risk in production deployment

### Medium Priority

6. **Template components not lazy-loaded** -- bundle size impact
7. **No GSAP integration** -- scroll animations below PRD quality bar
8. **No analytics GET endpoint** -- dashboard cannot display view/RSVP stats from server
9. **AI generation not tracked server-side** -- usage limits not enforced for DB users
10. **No `prefers-reduced-motion` support** -- accessibility gap
11. **InvitationRenderer uses if-else chain** -- not extensible for new templates
12. **Editor route file is 725 lines** -- could benefit from decomposition

### Low Priority

13. **No template versioning fallback logic** -- snapshot stored but not used for rendering
14. **Visitor hash is predictable** -- not a true unique visitor identifier
15. **No CSV export as downloadable file** -- returns CSV string, not a file download
16. **Store type uses `sessions: Record<string, string>` but actual shape has `currentUserId`** -- type mismatch
17. **Dual persistence logic duplicated across API files** -- could be abstracted into a repository pattern
18. **No error boundary in editor** -- crashes would lose unsaved work

---

## Top 10 Architectural Improvements

### 1. Add `password_hash` Column to Users Schema

**Priority**: P0 (Blocker)
**Effort**: Small

Add a `password_hash` text column to `users` table. Update signup to store it, login to verify it. Remove the comment-based acknowledgment of this gap.

### 2. Implement Server-Side Auto-Save

**Priority**: P0 (Data Integrity)
**Effort**: Medium

Make `useAutoSave` call `updateInvitationFn` server function when database is available. Debounce to avoid excessive server calls. Keep localStorage save as immediate backup.

### 3. Implement Image Storage with Cloudflare R2

**Priority**: P0 (Core Feature)
**Effort**: Medium

Create R2 client in `lib/storage/r2.ts`. Implement presigned URL upload flow. Add image optimization (resize, WebP conversion) either client-side or via Cloudflare Image Transformations.

### 4. Add Rate Limiting to Public Endpoints

**Priority**: P1 (Security)
**Effort**: Small

Implement sliding-window rate limiting on RSVP submission (e.g., 10 per minute per IP), view tracking (100 per hour per IP), and AI generation (plan-based limits enforced server-side).

### 5. Lazy-Load Template Components

**Priority**: P1 (Performance)
**Effort**: Small

Replace static imports in `InvitationRenderer` with `React.lazy()` + `Suspense`. Use a template registry map instead of if-else chain for extensibility.

```typescript
const templateRegistry = {
  'love-at-dusk': lazy(() => import('./love-at-dusk/LoveAtDuskInvitation')),
  'garden-romance': lazy(() => import('./garden-romance/GardenRomanceInvitation')),
  // ...
};
```

### 6. Integrate GSAP for Scroll Animations

**Priority**: P1 (Product Quality)
**Effort**: Large

Add GSAP + ScrollTrigger for cinematic scroll effects as PRD specifies. Keep Motion for UI transitions. Implement `prefers-reduced-motion` support as PRD section 6.3 requires.

### 7. Implement Analytics API Endpoint

**Priority**: P1 (Dashboard Feature)
**Effort**: Small

Add `GET /api/invitations/:id/analytics` endpoint that aggregates invitation_views data. Return total views, unique visitors, RSVP rate, and views-by-day series.

### 8. Abstract Dual-Persistence into Repository Layer

**Priority**: P2 (Architecture Quality)
**Effort**: Medium

Create a repository interface for each entity (InvitationRepository, GuestRepository, etc.) that abstracts the DB vs localStorage decision. Reduces code duplication across 5 API files and makes testing easier.

### 9. Decompose Editor Route

**Priority**: P2 (Maintainability)
**Effort**: Medium

Extract from `$invitationId.tsx`:
- Dialog components (preview, upgrade, slug, shortcuts) into separate components
- Handler functions into a `useEditorHandlers` hook
- Guard/loading logic into a wrapper component

### 10. Implement Stripe Payment Integration

**Priority**: P2 (Monetization)
**Effort**: Large

Create Stripe checkout session endpoint, webhook handler, and premium feature gating. Schema already supports payments table. Add FPX (Malaysia) and PayNow (Singapore) payment methods.

---

## Recommended Tech Stack Adjustments

### Keep (Well-Chosen)

- **TanStack Start + Router**: Excellent DX, file-based routing works well
- **Drizzle ORM**: Lightweight, type-safe, good PostgreSQL support
- **Tailwind CSS 4**: Rapid UI development, Vite plugin integration
- **jose for JWT**: Lightweight, standards-compliant
- **Zod v4**: Input validation on API boundaries
- **Motion**: Good for UI transitions and micro-interactions
- **Biome**: Fast linter/formatter, good DX

### Add

| Library | Purpose | Rationale |
|---------|---------|-----------|
| GSAP + ScrollTrigger | Cinematic scroll animations | PRD requirement, Motion insufficient |
| @aws-sdk/client-s3 or Cloudflare R2 SDK | Image storage | No storage backend currently |
| Stripe SDK | Payments | PRD requirement |
| rate-limiter-flexible or similar | Rate limiting | Security requirement |
| React Error Boundary | Editor crash recovery | Prevent data loss |
| sharp or @cloudflare/images | Image optimization | Performance requirement |

### Consider Replacing

| Current | Proposed | Rationale |
|---------|----------|-----------|
| Custom JWT auth | Better Auth or Lucia | More robust session management, token revocation, OAuth providers |
| In-memory fallback store | IndexedDB (via idb) | More persistent than localStorage, better for large data |
| structuredClone for undo | Immer patches | More memory-efficient undo/redo with structural sharing |

### Remove/Reduce

- `class-variance-authority`: Not observed in use across reviewed files. If unused, remove.
- `tw-animate-css`: If GSAP is added, animation utilities may be redundant.

---

## Summary

DreamMoments has a well-architected foundation with thoughtful patterns in the editor system, clean API boundaries, and a pragmatic dual-persistence model. The primary gaps are in production readiness: missing password storage, server-side auto-save, image storage, payment integration, and rate limiting. The template system works but diverges from the PRD's fully configuration-driven vision. The AI integration is flexible and well-abstracted with a good mock fallback. Addressing the top 5 improvements (password hash, server auto-save, image storage, rate limiting, lazy loading) would bring the application to production-ready status for the core editor flow.
