# Double Happiness (囍临门) Template — Design Document

**Date**: 2026-02-28
**Status**: Draft (Deepened)
**Scope**: New festive Chinese red & gold wedding invitation template

## Enhancement Summary

**Deepened on:** 2026-02-28
**Research agents used:** 13 (architecture, performance, security, TypeScript, pattern recognition, simplicity, frontend races, spec flow, accessibility, repo research, learnings, frontend design, framework docs)

### Key Improvements
1. **Reduced scope from 11 sections to 9** — merged Greeting into Announcement, removed standalone Calendar grid in favor of existing CountdownWidget
2. **Eliminated CalendarCountdown component** — reuses existing CountdownWidget, saving ~200-300 LOC
3. **Fixed 7 type-system violations** — wrong section type, invalid tone, missing version, wrong directory structure, missing InvitationRenderer update, incomplete RSVP form, missing animation tokens
4. **Identified critical performance optimizations** — font splitting per template (saves 4-6MB), responsive images, lazy-loaded EnvelopeAnimation
5. **Full accessibility audit** — color contrast verified (all pairs pass WCAG AA), bilingual `lang` attributes, timer ARIA guidance, form focus indicators

### Critical Corrections Applied
- Directory: `double-happiness/` subdirectory (not flat files)
- CSS prefix: `--dh-` (not `--xi-`, matching existing name-derived convention)
- "Greeting" section renamed to use existing `announcement` type
- RSVP form expanded to full field set (attendance, dietary, message, consent)
- `defaultTone` changed from invalid "festive" to `"romantic"`
- Added `version: "1.0.0"` and `tokens.animations` block
- Added InvitationRenderer.tsx update to file list

---

## Background

Research on [hunbei.com](https://www.hunbei.com/#/recommend) — China's leading digital wedding invitation platform — revealed that the most popular templates (60-90w+ likes) share these patterns:

- **Mobile-first long scroll** pages optimized for sharing via messaging apps
- **Photo-heavy storytelling** (6–25 photos per template)
- **Bilingual Chinese + English** text throughout
- **Calendar countdown widgets** showing the wedding date
- **Conversational tone** mixed with traditional Chinese calligraphy
- **Embedded maps** for venue directions
- **Simple RSVP** (3 fields: name, phone, guest count)

DreamMoments currently has 4 templates. The 2 Chinese-style ones (Garden Romance, Love at Dusk) lean cinematic/dark. There is no festive red & gold template — the most culturally important style for Chinese weddings in Singapore/Malaysia.

## Target Audience

Singapore Chinese couples (millennials/Gen-Z) who want:
- Cultural authenticity (red & gold, 囍, lunar dates)
- Modern design sensibility (clean typography, white space)
- Photo-centric layouts to showcase professional wedding photography
- Bilingual content (Chinese + English) for multicultural guest lists

## Design

### Name & Theme

- **Name**: 囍临门 (Double Happiness at the Door)
- **English subtitle**: "Double Happiness"
- **Category**: `"chinese"`
- **Tone**: `"romantic"` (closest valid value; "festive" is not in the `defaultTone` union)
- **Cultural context**: Chinese
- **Version**: `"1.0.0"`

### Color Palette

| Token | Hex | Role | WCAG Contrast Notes |
|-------|-----|------|---------------------|
| `--dh-red` | `#C8102E` | Primary — auspicious red | 5.59:1 on cream (AA pass), 5.88:1 as bg with white text (AA pass) |
| `--dh-gold` | `#D4A843` | Accent — gold borders, icons | 7.90:1 on dark (AAA pass). Avoid on light backgrounds. |
| `--dh-cream` | `#FFF8F0` | Background — warm cream | Use with dark text only |
| `--dh-dark` | `#2B1216` | Text — dark maroon | 14.19:1 on gold-light (AAA pass) |
| `--dh-red-deep` | `#8B1A1A` | Section backgrounds — deep festive red | Verify contrast with text overlays |
| `--dh-gold-light` | `#F5E6C8` | Cards/panels — light gold surface | Excellent for body text with dark ink |
| `--dh-white` | `#FFFFFF` | Photo frames, RSVP form background | — |
| `--dh-muted` | `#8B7355` | Secondary text, timestamps | Verify 4.5:1 against background |

#### Research Insights: Color

- **CRITICAL: Gold on red FAILS all WCAG levels (2.66:1).** This is the most tempting combination for a Chinese wedding theme, and it fails every accessibility threshold. Never use gold text on red backgrounds for readable content.
- **Red on dark maroon also fails (2.97:1).** Avoid `--dh-red` text on `--dh-dark` backgrounds.
- **Gold text on light backgrounds will fail contrast.** Never use `--dh-gold` on `--dh-cream` or `--dh-white` for text.
- **Gold is safe for decorative elements** — borders, ornaments, icons (non-text contrast only needs 3:1).
- **Preferred text combinations:** Dark on gold-light (14.19:1) for body; gold on dark (7.90:1) for accents; white on red (5.88:1) for buttons/badges.
- **Non-text UI elements** (icons, borders, focus rings) require 3:1 contrast per WCAG 1.4.11.
- **Focus indicators on festive backgrounds** need custom `:focus-visible` styles (white outline + red shadow).

#### Research Insights: CSS Architecture

Follow existing pattern: define colors as a `COLORS` constant object in the component file (like Garden Romance), not as CSS custom properties. The `DesignTokens` type stores colors as plain hex strings.

```typescript
const COLORS = {
  red: "#C8102E",
  gold: "#D4A843",
  cream: "#FFF8F0",
  dark: "#2B1216",
  deepRed: "#8B1A1A",
  goldLight: "#F5E6C8",
  muted: "#8B7355",
} as const;
```

The CSS file (`double-happiness.css`) should define the root wrapper class `.double-happiness` and scoped utility classes with `dh-` prefix (e.g., `dh-section`, `dh-hero`). Use CSS custom properties only for values that need runtime theming.

### Typography

| Role | Font | Fallback | Slot |
|------|------|----------|------|
| Heading (Chinese + English) | Noto Serif SC | Songti SC, Georgia, serif | `headingFont` |
| Body | Inter, Noto Sans SC | system-ui, sans-serif | `bodyFont` |
| Calligraphy accent | Noto Serif SC (bold weight) | Songti SC, serif | `accentFont` |

#### Research Insights: Typography

- **Dropped Ma Shan Zheng.** Adding a 4th CJK web font costs ~500KB-1MB and forces a 4th font into a 3-slot type system. Noto Serif SC in bold/italic provides sufficient calligraphic character for couple names.
- **CJK font loading is the #1 performance bottleneck.** Noto Serif SC 400+700 alone is ~3-5MB. Use Google Fonts `text=` parameter for subsetting, and `font-display: swap` with fallback to system Songti SC.
- **Split fonts per template.** Do NOT load all fonts in `__root.tsx`. Only load Noto Serif SC + Inter on the Double Happiness invitation route.
- **Chinese text line-height:** Use 1.5-1.8 for readability due to character density.
- **`font-display: optional`** for decorative weights to prevent FOUT on slow connections.

### Sections (9)

*(Reduced from 11: merged Greeting into Announcement, removed standalone Calendar grid)*

#### 1. Hero (`type: "hero"`, `defaultVisible: true`)
- Full-bleed couple photo as background
- Semi-transparent dark overlay for text legibility
- Large 囍 watermark (faded gold, centered, `alt=""` — decorative)
- Couple names in heading font (Noto Serif SC bold)
- "WEDDING INVITATION" badge in gold border
- Date in both Gregorian format + lunar date text field
- `AddToCalendarButton` (hidden in editor mode: `mode !== "editor"`)

##### Research Insights: Hero
- **Lunar date:** Add a `lunarDate` text field to content. Users type "农历四月廿二" themselves — they know it (often chosen via fortune teller). No conversion library needed.
- **`fetchpriority="high"`** on hero image — it is the LCP element.
- **Dropped falling petals animation.** Performance-heavy on mobile (15 particles with infinite CSS animations causes frame drops on budget Android). The hero photo is the emotional centerpiece; particles compete for attention.
- **Image `onError` handler:** Swap to placeholder SVG if hero image fails to load.

#### 2. Announcement (`type: "announcement"`, `defaultVisible: true`)
*(Formerly "Greeting" — uses existing section type for consistency)*
- Cream background
- Conversational bilingual greeting with `lang` attributes:
  - `<p lang="zh-Hans">亲爱的家人朋友们</p>`
  - `<p lang="en">Dear Family & Friends</p>`
- Personal invitation message
- Left border accent in gold (blockquote style)
- Clean centered layout with generous white space

#### 3. Couple Introduction (`type: "couple"`, `defaultVisible: true`)
- Side-by-side layout (bride left, groom right)
- Individual portrait photos with `alt` text describing each person
- "THE BRIDE / 新娘" and "THE GROOM / 新郎" labels with `lang` attributes
- Names in heading font (Noto Serif SC bold)
- No contact buttons (privacy concern — use FAQ for logistics questions)

#### 4. Love Story Timeline (`type: "story"`, `defaultVisible: true`)
- Staggered left/right timeline layout
- 3-4 milestones, each with:
  - Small circular photo (`alt` describing the milestone)
  - Date label
  - Title + description
- Gold vertical line connecting milestones
- Red dot markers on timeline

#### 5. Gallery (`type: "gallery"`, `defaultVisible: true`)
- Photo-heavy section (6-12 photo slots)
- **Simple 2-column CSS grid** with one featured full-width photo at top
  *(Dropped overlapping layout — breaks on different screen sizes, harder to make editable)*
- Photos in white frames with subtle shadow
- Scroll-reveal animation (fade-up) using existing `data-reveal` + `dm-reveal` pattern
- Every image needs unique descriptive `alt` text
- `onError` handler to swap broken images to placeholder

##### Research Insights: Gallery
- **Do NOT use `loading="lazy"` inside `data-reveal` containers.** Older WebKit (Safari iOS 15) may not load images at `opacity: 0`. Use `fetchpriority="low"` instead, or remove `loading="lazy"` from reveal-wrapped images.
- **Responsive images:** Use `srcSet` + `sizes` when image optimization pipeline exists.
- **Use `<figure>` + `<figcaption>`** when photos have visible captions.

#### 6. Countdown (`type: "countdown"`, `defaultVisible: true`)
- **Reuses existing `CountdownWidget`** — already handles timer cleanup, tab visibility, timezone-aware calculation, and `role="timer"` accessibility.
- Displays wedding date in full format: "2025年5月20日 Saturday"
- Lunar date from hero's `lunarDate` text field displayed below
- Cream background with gold border accent

##### Research Insights: Countdown
- **Do NOT build a CalendarCountdown component.** The full month calendar grid adds zero information (guests know the date). Reusing `CountdownWidget` saves ~200-300 LOC.
- **Stop interval when past date.** Current CountdownWidget keeps ticking after countdown reaches zero — add `if (next.status !== "counting") stopInterval()`.
- **`aria-live` abuse:** Current widget has `aria-live="polite"` updating every second — must throttle to once per minute or use `role="timer"` (implicit `aria-live="off"`) with announcements only at milestones (1 day, 1 hour remaining).
- **Cache `Intl.DateTimeFormat`** — current implementation creates a new formatter every tick (~0.3ms per call on mobile).

#### 7. Schedule (`type: "schedule"`, `defaultVisible: true`)
- Wedding day timeline (2-4 events)
- Cards with:
  - Time (gold text)
  - Event title (heading font)
  - Description
  - Optional icon
- Red left border on each card
- Stagger reveal (80ms delay between items, using existing `transitionDelay` pattern)

#### 8. Venue (`type: "venue"`, `defaultVisible: true`)
- Venue name + address
- **Google Maps only** — single "Get Directions" button
  *(Dropped Waze and Apple Maps — reduces decision paralysis, Google Maps works on all platforms)*
- Static map placeholder image
- Render `venue.parkingInfo` if present (field exists in data model but not currently rendered)
- MRT/public transport note

#### 9. RSVP (`type: "rsvp"`, `defaultVisible: true`)
- Clean form on white card with high-contrast focus indicators
- **Full field set** (matching existing `RsvpPayload` type contract):
  - 姓名 / Name (required)
  - 电话/邮箱 / Phone or Email
  - 出席 / Attendance (attending/not_attending/undecided dropdown)
  - 出席人数 / Number of Guests (1 to maxPlusOnes+1)
  - 饮食要求 / Dietary Requirements
  - 留言 / Message (max 500 chars)
  - PDPA consent checkbox with link to `/privacy`
- Submit button in primary red
- `RsvpConfirmation` component for post-submit state
- Section header: 【宾客回执 / RSVP】

##### Research Insights: RSVP Security & UX
- **Double-submit race condition:** Add `useRef` guard for immediate synchronous rejection in addition to `isSubmitting` state.
- **Hardcoded field paths** for inline editing patches (documented security learning — prevents prototype pollution).
- **Always include `invitationId`** in mutations.
- **RSVP deadline:** Consider checking `rsvp.deadline` and showing "RSVP closed" message after deadline.
- **Post-wedding mode:** After wedding date, replace RSVP with "Thank you for celebrating with us" message.
- **Form accessibility:** Use native `<input>`, `<select>`, `<textarea>` elements. Visible `<label>` elements (not placeholder-only). `aria-describedby` for error messages. `aria-invalid="true"` on invalid fields. Validate on blur, not keystroke.
- **Focus indicators on festive backgrounds:**
  ```css
  input:focus-visible {
    outline: 2px solid #FFFFFF;
    outline-offset: 2px;
    box-shadow: 0 0 0 4px rgba(200, 16, 46, 0.5);
  }
  ```

#### Gift / Angpow (`type: "gift"`, `defaultVisible: false`)
- **Reuses existing `AngpowQRCode` component**
- QR code section for digital angpow/gift
- Payment method label + recipient name
- Gold border card with 囍 watermark (`alt=""` — decorative)
- Validate `paymentUrl` as HTTPS URL (security finding — prevent phishing via malicious QR codes)

#### Footer (`type: "footer"`, `defaultVisible: true`)
- Thank you message (bilingual with `lang` attributes)
- Decorative 囍 motif (`alt=""`)
- Couple names + date
- Render `footer.socialLinks` (Instagram + hashtag) if present (field exists in data model but not currently rendered)
- "Made with DreamMoments" branding

### Animations & Motion

*(Reduced from 5 to 2 — both already exist in codebase)*

| Effect | Where | Details |
|--------|-------|---------|
| Scroll reveal (fade-up) | All sections | Existing `data-reveal` + `dm-reveal` + `useScrollReveal()` pattern. 0.6s duration, 100px offset. |
| Card stagger | Gallery, schedule | 80ms `transitionDelay` between items (existing pattern from Garden Romance) |

#### Research Insights: Animations
- **Dropped falling petals:** 15 infinite CSS animations cause frame drops on budget Android (40% of MY/SG mobile users). Combined with scroll handlers, creates 20+ concurrent animations.
- **Dropped gold shimmer:** Constantly shimmering heading is distracting. Gold color alone communicates luxury.
- **`prefers-reduced-motion` support** is already built into `usePrefersReducedMotion` hook — all animations must respect it.
- **Existing `useScrollReveal` has a known issue:** It queries `document.querySelectorAll("[data-reveal]")` once on mount, missing any elements rendered after mount (Suspense, conditional sections). Consider using `<Reveal>` component wrapper as a safer alternative per-section.

### Implementation Architecture

Uses existing template patterns. Root wrapper class: `.double-happiness`.

**Files to CREATE (4):**

1. **`src/templates/double-happiness.ts`** — TemplateConfig
   - Export: `doubleHappinessTemplate`
   - Must include: `id`, `name`, `nameZh`, `description`, `category`, `sections[]`, `tokens` (with `animations` sub-object), `aiConfig` (with `defaultTone: "romantic"`, `culturalContext: "chinese"`), `version: "1.0.0"`

2. **`src/components/templates/double-happiness/DoubleHappinessInvitation.tsx`** — Main template component
   - Default export function with `TemplateInvitationProps`
   - Must include: `useScrollReveal()`, `makeEditableProps()`, `SectionShell` for every section, `CountdownWidget`, `AngpowQRCode`, `RsvpConfirmation`, `LoadingSpinner`, `AddToCalendarButton`, `parseAttendance`, `useId()` for consent `aria-describedby`, `Link` for privacy policy

3. **`src/components/templates/double-happiness/double-happiness.css`** — CSS theme
   - `.double-happiness` root class scoping all variables
   - `dh-` prefixed utility classes
   - Custom focus indicators for RSVP form on festive backgrounds

4. **`public/img/template-double-happiness.png`** — Preview thumbnail

**Files to MODIFY (5+):**

5. **`src/templates/index.ts`** — Add import + array entry for `doubleHappinessTemplate`

6. **`src/components/templates/InvitationRenderer.tsx`** — Add to `templateImports` map:
   ```typescript
   "double-happiness": () => import("./double-happiness/DoubleHappinessInvitation"),
   ```

7. **`src/templates/templates.test.ts`** — Update `expect(templates.length).toBe(4)` → `.toBe(5)`

8. **`src/routes/editor/new.tsx`** — Add entry to `templatePreviewImages` map

9. **`src/data/sample-invitation.ts`** — Add `"double-happiness"` override block in `buildSampleContent()`

### Required Component Patterns Checklist

Every template must include these patterns (from codebase analysis):

- [ ] `useScrollReveal()` call at top of component
- [ ] `makeEditableProps(mode, onInlineEdit)` for editable fields
- [ ] `SectionShell` wrapping every section
- [ ] `data-reveal` + `dm-reveal` CSS class on reveal elements
- [ ] `CountdownWidget` for countdown (not reimplemented)
- [ ] `AngpowQRCode` for gift section (conditional: `data.gift &&`)
- [ ] `RsvpConfirmation` for post-submit RSVP state
- [ ] `LoadingSpinner` during RSVP submit
- [ ] `AddToCalendarButton` in hero (hidden when `mode === "editor"`)
- [ ] `Link` from TanStack Router for privacy policy
- [ ] `useId()` for consent checkbox `aria-describedby`
- [ ] `parseAttendance` from helpers for RSVP
- [ ] `useRef` guard for RSVP double-submit prevention

### Bilingual Accessibility Requirements

- Set `lang="zh-Hans"` on the root wrapper (or per-section as appropriate)
- Wrap English passages in `<span lang="en">` or `<p lang="en">`
- Do not mix languages in a single `alt` attribute
- Use consistent bilingual labels throughout (e.g., "Submit / 提交" not sometimes "提交" and sometimes "确认")

### Singapore-Specific Adaptations

- Google Maps deep links (not Gaode/高德 maps used in China)
- Angpow QR section (digital red packet — standard in SG/MY weddings)
- Bilingual Chinese-English (not Chinese-only)
- Lunar date display as user-entered text field
- MRT/public transport note option in venue section
- Parking info rendered from `venue.parkingInfo`
- Payment methods: DuitNow, PayNow, Touch 'n Go (GrabPay as future enhancement)

### Performance Budget

| Metric | Target | Notes |
|--------|--------|-------|
| LCP | < 3s on 4G | Hero image with `fetchpriority="high"`, font subsetting |
| Total JS (template chunk) | < 500KB | Verify with `pnpm build && ls -lhS dist/assets/*.js` |
| CJK font download | < 1MB | Single font (Noto Serif SC), 2 weights max, `text=` subsetting |
| Gallery images | < 100KB each on mobile | Requires image optimization pipeline |
| Animations | 60fps on mid-range Android | No particles, no shimmer, only CSS transitions |

### Known Codebase Issues to Be Aware Of

These are pre-existing issues found by research agents. They affect all templates, not just Double Happiness, but implementers should be aware:

1. **Font bloat in `__root.tsx`:** All 10 font families loaded on every route (~6MB). Template should work correctly regardless, but split-loading is a P0 optimization.
2. **`useScrollReveal` timing:** Misses dynamically rendered elements. If any section is conditionally shown, its reveal elements won't animate.
3. **RSVP `onRsvpSubmit` typed as `void` but `await`-ed:** Type should be `Promise<void>`. Error handling in template catch blocks is dead code.
4. **Envelope animation timer race:** `openTimer.current` overwritten without clearing previous timeout.
5. **No RSVP deadline enforcement:** `rsvp.deadline` field exists but is never checked server-side.

### Success Criteria

- [ ] Template renders correctly on mobile (375px) and desktop
- [ ] All 9 sections display with sample data
- [ ] Countdown shows correct date and live timer (using existing CountdownWidget)
- [ ] Photo slots accept user uploads via editor
- [ ] RSVP form validates and submits (full field set with consent)
- [ ] Inline editing works in editor mode (using `makeEditableProps`)
- [ ] Scroll animations fire on intersection (using existing `data-reveal` system)
- [ ] Biome lint + Vitest tests pass (including updated template count)
- [ ] Accessible (keyboard navigation, screen reader, reduced motion, bilingual `lang` attributes)
- [ ] InvitationRenderer lazy-loads the template correctly
- [ ] Color contrast meets WCAG AA for all text/background combinations
- [ ] No new dependencies added (reuses CountdownWidget, AngpowQRCode, animations)
- [ ] RSVP double-submit prevented with `useRef` guard
