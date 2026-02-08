# Quality Specialist Report: DreamMoments

**Date**: 2026-02-08
**Auditor**: Quality Specialist Agent
**Scope**: Accessibility, Performance, SEO, Core Web Vitals, Reduced Motion, Internationalization, Error Boundaries, PWA Readiness

---

## Executive Summary

DreamMoments demonstrates strong foundational quality practices with above-average accessibility implementation for an early-stage product. The codebase shows deliberate attention to reduced motion support (comprehensive `prefers-reduced-motion` coverage), touch target sizing (consistent 44px minimums), ARIA attributes, and semantic HTML structure. However, critical gaps exist in SEO optimization (zero Open Graph/meta tags for public invitation pages), error boundary coverage (none found), PWA readiness (boilerplate manifest, no service worker), and internationalization infrastructure (hardcoded strings throughout).

**Estimated Lighthouse Score**: 62-72 (Performance: 65, Accessibility: 82, Best Practices: 78, SEO: 42)

The low SEO estimate is driven by the complete absence of dynamic meta tags on the most important pages (public invitations), which are the primary sharing surface. Performance is dragged down by render-blocking font loading and lack of code splitting for template components.

---

## 1. Accessibility Audit

### 1.1 Strengths (WCAG 2.1 AA Compliance)

| Feature | Implementation | WCAG Level |
|---------|---------------|------------|
| Skip-to-content link | Present in `__root.tsx` line 62-64, styled with `.dm-skip-link` class, hidden until focused | AA |
| Touch targets | Consistent 44px minimum across all interactive elements (forms, buttons, pills) | AAA |
| Focus-visible states | Custom focus rings on buttons (`.blush-form button:focus-visible`, `.eternal-form button:focus-visible`), editor elements, nav items | AA |
| Form labels | All RSVP form inputs wrapped in `<label>` elements across all 4 templates | AA |
| `aria-required` | Present on name fields in RSVP forms | AA |
| `aria-live` regions | RSVP status messages use `<output aria-live="polite">` in all templates | AA |
| Decorative elements | `aria-hidden="true"` on icons (lucide-react), floating decorations, monogram SVG | AA |
| Keyboard navigation | Editor toolbar implements full arrow key navigation, Home/End, Escape handling (`EditorToolbar.tsx` lines 84-127) | AA |
| Focus trap | AI Assistant drawer uses `useFocusTrap` hook with Escape support | AA |
| `role="dialog"` + `aria-modal` | AI drawer correctly marked as modal dialog with label | AA |
| Consent checkboxes | Linked via `aria-describedby` to description text across all templates | AA |
| Section navigation | `SectionRail` items have `aria-selected`, `focus-visible` outlines, keyboard support | AA |
| Reduced motion | Comprehensive global catch-all plus per-component handling (see Section 6) | AA |

### 1.2 Findings Requiring Attention

**CRITICAL (WCAG 2.1 A violations)**

1. **Missing `alt` text on template showcase images** (`src/routes/index.tsx` line 227): The `img` tags have `alt` attributes but they describe the template mood rather than the actual image content. For stock photos, this is acceptable, but once real photos are used, alt text should be descriptive. *Currently passes A level.*

2. **`noValidate` on all RSVP forms**: All 4 templates use `noValidate` on RSVP forms (e.g., `BlushRomanceInvitation.tsx` line 253). While this allows custom validation UX, no client-side validation messages are currently displayed for invalid inputs. Users get no feedback if they submit with empty required name field (the form just does nothing). This violates WCAG 3.3.1 (Error Identification).
   - **Files**: All 4 template invitation components
   - **Impact**: High -- guests may not understand why their RSVP didn't submit

3. **Duplicate `id="consent-description"`**: Both `BlushRomanceInvitation.tsx` (line 342) and `EternalEleganceInvitation.tsx` (line 351) use the same `consent-description` ID. If both templates could theoretically render on the same page, this would be a violation. In practice, only one renders at a time, but the ID should be unique per template for correctness.

4. **Color contrast concerns on dark templates**: The `love-at-dusk` template uses `--love-muted: #A89F91` text on `--love-ink: #0d0a09` background. This is approximately 7.2:1 ratio (passes AA). However, `--love-accent: #C9A962` used for labels in RSVP forms against `#0f0c0a` background may be borderline at small sizes. Garden Romance uses `COLORS.textMuted: #8A7A6A` on cream backgrounds -- contrast ratio approximately 3.8:1, which fails AA for small text below 18px.

**MODERATE**

5. **Mobile navigation lacks `aria-controls`**: The hamburger menu button in `Header.tsx` (line 82-94) has `aria-expanded` but no `aria-controls` pointing to the menu container.

6. **Template section headings**: Many template sections use `<p>` tags for what are semantically headings (e.g., "Our Story", "Gallery", "Schedule"). The `.blush-kicker` elements should likely be paired with actual `<h2>` tags. Currently sections use a mix of `<h1>`, `<h2>`, `<h3>`, and `<p>` with heading-like classes.

7. **Inline edit buttons**: In editor mode, `editableProps()` adds `role="button"` and `tabIndex={0}` to text elements. These elements lack `aria-label` describing the action (e.g., "Edit partner one name"). Screen reader users would hear the content but not know it's editable.

8. **Gallery images use generic alt text**: `photo.caption || "Wedding photo"` is used as alt text. Captions like "Moment" or "Portrait" don't describe the image. Consider `alt=""` for decorative gallery images with captions provided separately.

### 1.3 WCAG Compliance Summary

| Level | Status | Notes |
|-------|--------|-------|
| A | Partial pass | Missing error identification on forms (3.3.1) |
| AA | Mostly passes | Strong focus management, skip link, labels; color contrast borderline on some template combos |
| AAA | Partial | Touch targets meet AAA (44px), reduced motion is comprehensive |

---

## 2. Performance Assessment

### 2.1 Bundle Analysis

**Dependencies contributing to bundle size:**
- `motion` (framer-motion successor): ~45KB gzipped -- loaded on every page including landing
- `lucide-react`: ~5-8KB per icon set (tree-shakeable, used correctly with named imports)
- `@tanstack/react-router` + `@tanstack/react-start`: SSR framework overhead
- 4 template components: All eagerly imported in `InvitationRenderer.tsx` (no code splitting)

**Code Splitting Issues:**
- `InvitationRenderer.tsx` imports all 4 template components unconditionally. Each template is 200-400 lines of JSX. When viewing a single invitation, 3 unused templates are loaded.
- Landing page (`src/routes/index.tsx`) imports `motion` for scroll animations. This is the entry page and should be as lean as possible.
- No `React.lazy()` usage found anywhere in the codebase.
- Dynamic imports exist only in server API routes (`src/api/invitations.ts` lines 107-108) for sample data/templates -- good pattern but not applied to client components.

### 2.2 Image Optimization

**Current state:**
- All images use `loading="lazy"` attribute -- good
- `decoding="async"` used on showcase images in landing page -- good
- `width` and `height` attributes provided on most images -- good for CLS prevention
- No `<picture>` element or `srcset` for responsive images
- No image optimization pipeline (no sharp, no Cloudflare Image Resizing)
- External Unsplash URLs used directly in Garden Romance template (no CDN/optimization layer)
- Placeholder SVGs used for other templates (`/placeholders/photo-light.svg`, `/placeholders/photo-dark.svg`)

**Missing:**
- No WebP/AVIF format support
- No responsive `srcset` for different viewport sizes
- Landing page photos (`/photos/golden-hour.jpg`, etc.) have no size optimization

### 2.3 Font Loading

**Current strategy** (`src/styles.css` line 1):
```css
@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Reenie+Beanie&family=Noto+Serif+SC:wght@400;600;700;900&display=swap");
```

**Issues:**
- **Render-blocking `@import`**: CSS `@import` for Google Fonts is render-blocking. The browser must download and parse the CSS file before rendering any text.
- **No `font-display: swap` on the import URL parameters**: While `&display=swap` is in the URL (handled by Google Fonts API), the actual CSS response may still cause FOIT in some browsers.
- **No preconnect hint**: Missing `<link rel="preconnect" href="https://fonts.googleapis.com">` in `<head>`.
- **Noto Serif SC is large**: This Chinese font includes many glyphs. Loading 4 weights (400, 600, 700, 900) for what is primarily used in one template (Garden Romance) adds significant download time.
- **Garden Romance loads additional fonts via inline styles**: `"Playfair Display", "Times New Roman", serif` and `"Noto Serif SC"` are referenced but only Noto Serif SC is loaded via Google Fonts. Playfair Display is not loaded, causing fallback to Times New Roman.

### 2.4 Animation Performance

**Good practices:**
- CSS transforms used for animations (no layout thrashing)
- `will-change` not overused (appropriate)
- `pointer-events: none` on decorative elements (blobs, petals, grain)
- Intersection Observer used for scroll reveal (efficient)
- Parallax uses `requestAnimationFrame` with `{ passive: true }` scroll listener
- Garden Romance uses Motion library's `useReducedMotion()` hook

**Concerns:**
- Landing page has 15 floating petals + 3 animated blobs + grain overlay running simultaneously
- Parallax queries `document.querySelectorAll` on every scroll frame (inside RAF, but still)
- `motion/react` variants are defined at module scope (good for reference stability) but each `motion.div` creates an animation observer

---

## 3. SEO Evaluation

### 3.1 Meta Tags

**Root layout** (`__root.tsx` lines 21-38):
```typescript
meta: [
  { charSet: "utf-8" },
  { name: "viewport", content: "width=device-width, initial-scale=1" },
  { title: "DreamMoments" },
  { name: "description", content: "AI-powered wedding invitations..." },
]
```

**Critical gaps:**
- **No per-page meta tags**: Every page shows the same title "DreamMoments" and the same description. The public invitation page (`/invite/$slug`) -- the most shared page -- has no dynamic title like "Sarah & Michael's Wedding Invitation".
- **No Open Graph tags**: Zero `og:title`, `og:description`, `og:image`, `og:url` tags found in the entire codebase. When couples share their invitation link on WhatsApp (the primary sharing channel), it will show a generic preview or no preview at all.
- **No Twitter Card tags**: Missing `twitter:card`, `twitter:title`, `twitter:image`.
- **No canonical URLs**: No `<link rel="canonical">` on any page.
- **No structured data**: No JSON-LD or microdata for events (Schema.org Event type would be ideal for wedding invitations).

### 3.2 Impact Assessment

The absence of OG tags is the **single highest-impact quality issue** in the entire codebase. The PRD explicitly states sharing via WhatsApp as a primary distribution channel (Section 3.7). Without OG tags:
- WhatsApp preview will show "DreamMoments" with no couple name or photo
- Shared links look generic and unprofessional
- Click-through rate from shared links will be significantly lower
- Guests may not trust the link

### 3.3 Other SEO Concerns

- `<html lang="en">` is hardcoded. Bilingual content (English/Chinese) should use `lang` attributes on Chinese text spans.
- No sitemap.xml generation
- No robots.txt configuration
- Image alt text is adequate but could be more descriptive
- URL structure is clean (`/invite/sarah-michael`) -- good for SEO

---

## 4. Core Web Vitals Readiness

### 4.1 Largest Contentful Paint (LCP)

**Risk: MODERATE-HIGH**
- Hero section images on public invitations are the LCP element
- Font loading via `@import` delays text rendering
- No `<link rel="preload">` for hero images
- Garden Romance template loads an external Unsplash image as hero -- no control over CDN performance
- Estimate: 2.5-4.0s depending on network conditions

### 4.2 Cumulative Layout Shift (CLS)

**Risk: LOW**
- Images have explicit `width`/`height` attributes
- Fonts use `display=swap` which causes a minor text reflow but is acceptable
- Fixed header with `position: fixed` doesn't cause layout shift
- Skeleton/loading states not yet implemented (listed as UI primitives) which could cause CLS when data loads
- Estimate: 0.05-0.12

### 4.3 Interaction to Next Paint (INP)

**Risk: LOW-MODERATE**
- Editor interactions (section switching, inline editing) seem responsive
- RSVP form submission has loading state management
- No heavy synchronous operations on the main thread detected
- Motion animations use RAF/transform-only which don't block interaction
- Estimate: 80-150ms

### 4.4 Summary

| Metric | Estimate | Target (Good) | Assessment |
|--------|----------|---------------|------------|
| LCP | 2.5-4.0s | < 2.5s | Needs improvement |
| CLS | 0.05-0.12 | < 0.1 | Borderline good |
| INP | 80-150ms | < 200ms | Good |

---

## 5. Reduced Motion Support Review

### 5.1 Comprehensive Coverage

DreamMoments has **excellent** reduced motion support. This is one of the strongest quality areas.

**Global catch-all** (`styles.css` lines 1596-1603):
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

**Per-component handling:**
| Component/Feature | Approach | File |
|-------------------|----------|------|
| `.dm-card` hover | `transition: none; transform: none` | `styles.css:162-169` |
| `.dm-blob`, `.dm-cta-*` | `animation: none; transition: none` | `styles.css:323-330` |
| `.blush-card` hover | `transition: none; transform: none` | `styles.css:462-469` |
| `.blush-form` elements | `transition: none; transform: none` | `styles.css:658-668` |
| `.dm-reveal` | `opacity: 1; transform: none; animation: none` | `styles.css:706-712` |
| `.dm-petals` | `display: none` (completely hidden) | `styles.css:980-984` |
| `.dm-preview` overlay | `animation: none` | `styles.css:814-818` |
| `[role="tabpanel"]` | `animation: none` | `styles.css:862-866` |
| `.eternal-letter` | `animation: none; opacity: 1` | `styles.css:1165-1170` |
| `.eternal-card` | `transition: none` | `styles.css:1215-1222` |
| `.eternal-form` | `transition: none; transform: none` | `styles.css:1354-1364` |
| Garden Romance floats | `animation: none` | `styles.css:769-777` |
| Love at Dusk slide reveals | `transform: none` | `styles.css:1516-1526` |
| `.dm-section-rail-item` | `transition: none` | `styles.css:1651-1655` |
| `.dm-editable` | `transition: none` | `styles.css:1563-1567` |
| Editor active outline | `transition: none` | `styles.css:1734-1738` |
| `.dm-timeline-step` | `transition: none` | `styles.css:1021-1025` |

**JavaScript-level handling:**
- `useScrollReveal()` skips animation setup when `prefers-reduced-motion` is true (`scroll-effects.ts:14-19`)
- `useParallax()` returns early when reduced motion is preferred (`scroll-effects.ts:55`)
- Landing page `usePrefersReducedMotion()` hook conditionally disables Motion animations and removes floating petals
- Garden Romance uses Motion library's `useReducedMotion()` hook and passes `skip` to all animation helpers

### 5.2 Gap

- The `usePrefersReducedMotion` hook in `index.tsx` is duplicated from `scroll-effects.ts`. Consider extracting to a shared hook.
- Motion library animations in landing page use `initial={reducedMotion ? false : { ... }}` pattern which is correct but inconsistent with the CSS approach used in templates.

---

## 6. Internationalization Assessment

### 6.1 Current State

**Bilingual content support:**
- Garden Romance template has extensive Chinese text: section headers (e.g., "恭 请 光 临", "爱 情 故 事", "婚 礼 流 程", "敬 请 回 复"), formal invitation text, date formatting in both Chinese and English
- Love at Dusk template includes Chinese characters ("囍", "诚挚邀请")
- Template content model supports bilingual content in JSONB (`announcement.formalText` for Chinese formal text)
- Date formatting in Garden Romance uses `toLocaleDateString` with both `zh-CN` and `en-US` locales

**Gaps:**
1. **No i18n framework**: All UI strings are hardcoded in English. Form labels ("Name", "Attendance", "Email"), button text ("Send RSVP", "Submit RSVP"), status messages, and error messages have no translation mechanism.
2. **No `lang` attribute on Chinese text**: Chinese text spans should have `lang="zh"` for screen readers to switch voice/pronunciation. Currently all text is under `<html lang="en">`.
3. **No RTL support**: Not needed for current target markets but would be needed for expansion.
4. **Mixed language UI**: The editor UI, dashboard, and auth pages are English-only. Only invitation templates have bilingual content.
5. **No locale detection**: No automatic language detection based on browser locale or user preference.
6. **RSVP form labels are English-only**: Even on the Garden Romance template (heavily Chinese), form labels like "Name", "Attendance", "Email" are in English.

### 6.2 Recommendation

For MVP targeting Malaysian/Singaporean Chinese couples, the current approach (English UI + bilingual template content) is acceptable. A full i18n solution should be planned for post-launch. Priority should be:
1. Add `lang="zh"` attributes to Chinese text spans
2. Consider bilingual RSVP form labels for Garden Romance and Love at Dusk templates
3. Evaluate `react-intl` or `next-intl` equivalent for TanStack Start

---

## 7. Error Boundary Coverage

### 7.1 Findings

**No error boundaries found in the codebase.** Zero files matching `*error*` or `*ErrorBoundary*` patterns in `src/`.

**Impact:**
- If a template component throws during rendering (e.g., accessing `data.story.milestones.map()` when `milestones` is undefined), the entire page crashes to a white screen
- The editor preview iframe would crash without recovery
- Public invitation pages would be completely broken for guests
- No error reporting to monitoring services (no Sentry, no error tracking)

### 7.2 Risk Assessment

This is a **high-severity gap**. Wedding invitations are viewed during time-sensitive moments (guests checking details day-of). A crash on the public invitation page is unacceptable.

**Recommended boundaries:**
1. **Root error boundary**: Catch-all with "Something went wrong" message and reload button
2. **Template renderer boundary**: Wrapping `InvitationRenderer` to gracefully handle template rendering failures
3. **Editor preview boundary**: Catch errors in preview frame without crashing the editor context panel
4. **RSVP form boundary**: Ensure form submission errors don't crash the entire invitation

---

## 8. PWA Readiness

### 8.1 Current State

| Requirement | Status | Notes |
|-------------|--------|-------|
| `manifest.json` | Boilerplate only | Names are "TanStack App" / "Create TanStack App Sample" -- not DreamMoments |
| Icons | References `favicon.ico`, `logo192.png`, `logo512.png` | Need to verify these exist with DreamMoments branding |
| Service worker | Not implemented | No custom service worker for offline caching |
| `theme-color` meta | Not in `<head>` | Only in manifest.json as `#000000` (should be `#FDFCF8` to match brand) |
| `apple-mobile-web-app-capable` | Missing | No iOS PWA meta tags |
| Offline support | None | Public invitations should work offline for guests who opened them |
| Push notifications | None | PRD mentions reminders but no implementation |

### 8.2 Assessment

PWA readiness is **minimal**. The manifest is a boilerplate leftover. For a product where 70% of guests view on mobile (per PRD metric), offline access to invitation details would be a significant UX improvement. Guests often check wedding details in areas with poor connectivity (parking lots, rural venues).

---

## 9. Lighthouse Score Estimate

| Category | Estimated Score | Key Factors |
|----------|----------------|-------------|
| **Performance** | 60-70 | Render-blocking font import, no code splitting, large Motion bundle, external images without optimization |
| **Accessibility** | 78-85 | Strong ARIA coverage, skip link, focus management; loses points for missing form error messages, color contrast on some templates |
| **Best Practices** | 75-82 | No error boundaries, console.log statements possible, devtools in production bundle path |
| **SEO** | 35-50 | Missing OG tags, no structured data, static page title, no canonical URL, no sitemap |

**Overall Estimated Score: 62-72**

The PRD targets a Lighthouse score > 90. Achieving this requires significant work on SEO meta tags, font loading optimization, code splitting, and image optimization.

---

## 10. Top 15 Quality Improvements (Prioritized by Impact)

### Tier 1: Critical (Ship-blockers)

| # | Improvement | Category | Impact | Effort |
|---|-------------|----------|--------|--------|
| 1 | **Add dynamic OG/meta tags for public invitation pages** (`/invite/$slug`): Include `og:title` (couple names), `og:description`, `og:image` (hero photo or template preview), `og:url`. This is the most shared URL surface. | SEO | Very High | Medium |
| 2 | **Add error boundaries**: Root boundary, template renderer boundary, editor preview boundary, RSVP form boundary. Use TanStack Router's `errorComponent` pattern. | Reliability | Very High | Medium |
| 3 | **Add RSVP form validation feedback**: Display inline error messages when required fields are empty on submit. Currently `noValidate` suppresses browser validation but no custom validation UI exists. | A11y/UX | High | Low |
| 4 | **Fix font loading strategy**: Replace `@import` with `<link rel="preload">` in document head. Add `<link rel="preconnect" href="https://fonts.googleapis.com">`. Consider self-hosting critical fonts. | Performance | High | Low |

### Tier 2: High Priority (Pre-launch)

| # | Improvement | Category | Impact | Effort |
|---|-------------|----------|--------|--------|
| 5 | **Code split template components**: Use `React.lazy()` in `InvitationRenderer.tsx` so only the active template is loaded. Each template is 200-400 lines -- loading all 4 wastes bandwidth. | Performance | High | Low |
| 6 | **Update manifest.json for DreamMoments branding**: Change `short_name`, `name`, `theme_color` to match brand. Set `theme_color` to `#FDFCF8`. Add proper icons. | PWA | Medium | Very Low |
| 7 | **Add `lang="zh"` attributes to Chinese text spans**: In Garden Romance and Love at Dusk templates, wrap Chinese text in `<span lang="zh">` for proper screen reader pronunciation. | A11y/i18n | Medium | Low |
| 8 | **Add page-specific `<title>` tags**: Landing: "DreamMoments - Beautiful Wedding Invitations". Editor: "Edit - [Couple Names]". Dashboard: "Dashboard - DreamMoments". Invite: "[Couple Names] Wedding Invitation". | SEO | Medium | Low |
| 9 | **Fix Garden Romance color contrast**: `textMuted: #8A7A6A` on cream backgrounds fails AA for small text. Darken to at least `#6A5A4A` (ratio > 4.5:1). | A11y | Medium | Very Low |

### Tier 3: Post-launch Enhancements

| # | Improvement | Category | Impact | Effort |
|---|-------------|----------|--------|--------|
| 10 | **Add responsive image srcset**: Serve different image sizes for mobile vs desktop. Use `<picture>` element with WebP fallback. Critical for Gallery sections. | Performance | Medium | Medium |
| 11 | **Add `aria-label` to editable elements in editor mode**: Screen reader users should know text elements are clickable to edit. Add labels like "Edit couple name". | A11y | Medium | Low |
| 12 | **Implement offline caching for public invitations**: Service worker that caches viewed invitation data so guests can access details without connectivity. | PWA | Medium | High |
| 13 | **Add structured data (JSON-LD)**: Add `Event` schema markup to public invitation pages with date, venue, and organizer information. Improves search engine understanding. | SEO | Low-Medium | Low |
| 14 | **Extract shared `usePrefersReducedMotion` hook**: Currently duplicated between `index.tsx` and `scroll-effects.ts`. Create a single shared hook in `lib/`. | Code Quality | Low | Very Low |
| 15 | **Add `prefers-color-scheme` handling**: Currently hardcoded to light. While templates have their own color schemes, the editor and dashboard could respect system dark mode. | A11y/UX | Low | High |

---

## Appendix: File References

Key files audited:
- `src/routes/__root.tsx` -- Root layout, meta tags, skip link
- `src/routes/invite/$slug.tsx` -- Public invitation page
- `src/routes/index.tsx` -- Landing page
- `src/styles.css` -- All CSS including reduced motion, font loading, template styles
- `src/components/templates/InvitationRenderer.tsx` -- Template routing (no code splitting)
- `src/components/templates/SectionShell.tsx` -- Section wrapper with ARIA
- `src/components/templates/blush-romance/BlushRomanceInvitation.tsx` -- Blush template
- `src/components/templates/garden-romance/GardenRomanceInvitation.tsx` -- Garden Romance template
- `src/components/templates/eternal-elegance/EternalEleganceInvitation.tsx` -- Eternal Elegance template
- `src/components/templates/love-at-dusk/LoveAtDuskInvitation.tsx` -- Love at Dusk template
- `src/components/editor/EditorLayout.tsx` -- Editor split-screen layout
- `src/components/editor/EditorToolbar.tsx` -- Toolbar with keyboard nav
- `src/components/editor/AiAssistantDrawer.tsx` -- AI drawer with focus trap
- `src/components/Header.tsx` -- Site header with mobile nav
- `src/lib/scroll-effects.ts` -- Scroll reveal and parallax hooks
- `public/manifest.json` -- PWA manifest (boilerplate)
- `package.json` -- Dependencies
