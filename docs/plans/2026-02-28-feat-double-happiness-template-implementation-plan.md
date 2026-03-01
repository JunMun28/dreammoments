---
title: "feat: Add Double Happiness wedding invitation template"
type: feat
status: active
date: 2026-02-28
design: docs/plans/2026-02-28-feat-double-happiness-template-design.md
---

# feat: Add Double Happiness (囍临门) Wedding Invitation Template

## Overview

Add a 5th wedding invitation template — "Double Happiness" (囍临门) — a festive Chinese red & gold design targeting Singapore/Malaysia Chinese couples. The template reuses existing infrastructure (SectionShell, CountdownWidget, AngpowQRCode, scroll reveal, inline editing) with zero new dependencies.

**Design document:** `docs/plans/2026-02-28-feat-double-happiness-template-design.md`

## Problem Statement

DreamMoments has 4 templates. The 2 Chinese-style ones (Garden Romance, Love at Dusk) are cinematic/dark. There is no festive red & gold template — the most culturally important style for Chinese weddings in Singapore/Malaysia. Research on hunbei.com confirmed this gap: the top Chinese templates (60-90w+ likes) are photo-heavy, bilingual, mobile-first, and feature calendar countdowns.

## Proposed Solution

Create a new template following existing architecture patterns exactly. 9 sections, 3 fonts (no new web fonts beyond what Noto Serif SC already provides), 2 animation types (both pre-existing), full RSVP form, bilingual `lang` attributes, WCAG AA contrast compliance.

**Files to create (4):**
1. `src/templates/double-happiness.ts`
2. `src/components/templates/double-happiness/DoubleHappinessInvitation.tsx`
3. `src/components/templates/double-happiness/double-happiness.css`
4. `public/img/template-double-happiness.png`

**Files to modify (5):**
5. `src/templates/index.ts`
6. `src/components/templates/InvitationRenderer.tsx`
7. `src/templates/templates.test.ts`
8. `src/routes/editor/new.tsx`
9. `src/data/sample-invitation.ts`

## Technical Approach

### Architecture

No architectural changes. The template plugs into the existing `TemplateConfig` → `InvitationRenderer` → `SectionShell` pipeline. All 9 sections use existing `SectionType` values. No schema changes, no new API endpoints, no new database tables.

### Key Decisions (from deepened design document)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Section count | 9 (not 11) | Merged Greeting→Announcement, dropped Calendar grid |
| CalendarCountdown | Reuse `CountdownWidget` | Saves ~200-300 LOC, tested, accessible |
| Fonts | 3 (Noto Serif SC, Inter, Noto Sans SC) | 3-slot DesignTokens type, no 4th font download |
| Animations | 2 (scroll reveal, stagger) | Both pre-existing, no particles/shimmer |
| Map providers | Google Maps only | Works cross-platform, no decision paralysis |
| CSS architecture | `COLORS` constant + scoped CSS classes | Matches Garden Romance pattern |
| Lunar date | User-entered text field | No conversion library needed |
| RSVP form | Full field set | Matches existing `RsvpPayload` type contract |

### Implementation Phases

---

#### Phase 1: Template Config & Registry (Foundation)

Create the TemplateConfig and wire it into the registry so the template is selectable (even before the component renders).

##### Task 1.1: Create `src/templates/double-happiness.ts`

```typescript
// src/templates/double-happiness.ts
import type { TemplateConfig } from "./types";

export const doubleHappinessTemplate: TemplateConfig = {
  id: "double-happiness",
  name: "Double Happiness",
  nameZh: "囍临门",
  description: "Festive Chinese red & gold wedding invitation with bilingual content, photo gallery, and digital angpow.",
  category: "chinese",
  version: "1.0.0",
  aiConfig: {
    defaultTone: "romantic",
    culturalContext: "chinese",
  },
  tokens: {
    colors: {
      primary: "#C8102E",      // auspicious red
      secondary: "#8B1A1A",    // deep festive red
      accent: "#D4A843",       // gold
      background: "#FFF8F0",   // warm cream
      text: "#2B1216",         // dark maroon
      muted: "#8B7355",        // secondary text
    },
    typography: {
      headingFont: "'Noto Serif SC', 'Songti SC', Georgia, serif",
      bodyFont: "Inter, 'Noto Sans SC', system-ui, sans-serif",
      accentFont: "'Noto Serif SC', 'Songti SC', serif",
    },
    animations: {
      scrollTriggerOffset: 100,
      defaultDuration: 0.6,
      easing: "easeOutCubic",
    },
  },
  sections: [
    // 9 sections with fields — see Phase 1.1 details below
  ],
};
```

**Section config details (9 sections):**

Each section needs `id`, `type`, `defaultVisible`, `fields[]`, and optional `notes`. Field definitions determine what appears in the editor panel.

| Section | id | type | defaultVisible | Key fields |
|---------|-----|------|---------------|------------|
| Hero | `hero` | `hero` | true | partnerOneName, partnerTwoName, date, lunarDate (new text field), tagline, heroImage |
| Announcement | `announcement` | `announcement` | true | title, message, formalText |
| Couple | `couple` | `couple` | true | bridePhoto, groomPhoto, brideName, groomName, brideBio, groomBio |
| Story | `story` | `story` | true | milestones (list type) |
| Gallery | `gallery` | `gallery` | true | photos (list type) |
| Countdown | `countdown` | `countdown` | true | (reads from hero.date — no unique fields) |
| Schedule | `schedule` | `schedule` | true | events (list type) |
| Venue | `venue` | `venue` | true | name, address, coordinates, directions, parkingInfo |
| RSVP | `rsvp` | `rsvp` | true | deadline, maxGuests, dietaryOptions, allowPlusOnes, maxPlusOnes |
| Gift | `gift` | `gift` | **false** | paymentUrl, paymentMethod, recipientName |
| Footer | `footer` | `footer` | true | message, socialLinks |

Follow the exact `FieldConfig` shape from `love-at-dusk.ts` for consistency.

##### Task 1.2: Register in `src/templates/index.ts`

Add import + array entry + named re-export:

```typescript
import { doubleHappinessTemplate } from "./double-happiness";

export const templates = [
  blushRomanceTemplate,
  loveAtDuskTemplate,
  gardenRomanceTemplate,
  eternalEleganceTemplate,
  doubleHappinessTemplate,  // NEW
];

export {
  blushRomanceTemplate,
  loveAtDuskTemplate,
  gardenRomanceTemplate,
  eternalEleganceTemplate,
  doubleHappinessTemplate,  // NEW
};
```

##### Task 1.3: Update `src/templates/templates.test.ts`

Change `toBe(4)` → `toBe(5)`:

```typescript
test("includes five templates", () => {
  expect(templates.length).toBe(5);
});
```

##### Task 1.4: Add to `src/components/templates/InvitationRenderer.tsx`

Add entry to `templateImports` map:

```typescript
"double-happiness": () => import("./double-happiness/DoubleHappinessInvitation"),
```

##### Task 1.5: Add sample content in `src/data/sample-invitation.ts`

Add an `if (templateId === "double-happiness")` block in `buildSampleContent()`:

```typescript
if (templateId === "double-happiness") {
  base.hero.tagline = "囍临门 · 永结同心";
  base.hero.partnerOneName = "王小明";
  base.hero.partnerTwoName = "李小红";
  base.announcement.title = "我们结婚啦";
  base.announcement.message = "亲爱的家人朋友们，我们诚挚地邀请您来参加我们的婚礼。";
  base.announcement.formalText = "Dear Family & Friends, we cordially invite you to celebrate our union.";
  base.footer.message = "感谢您的祝福，期待与您在婚礼相见。\nThank you for your blessings. We look forward to celebrating with you.";
}
```

##### Task 1.6: Add preview image entry in `src/routes/editor/new.tsx`

Add to `templatePreviewImages`:

```typescript
"double-happiness": "/img/template-double-happiness.png",
```

**Note:** The actual image can be a placeholder initially — `TemplateCard` falls back to a CSS gradient if the image fails to load.

**Phase 1 success criteria:**
- [ ] `pnpm test` passes (template count test updated)
- [ ] Template appears in editor template picker at `/editor/new`
- [ ] `InvitationRenderer` can lazy-load the component (will show fallback until Phase 3)

---

#### Phase 2: CSS Theme

##### Task 2.1: Create `src/components/templates/double-happiness/double-happiness.css`

```css
/* ─── Double Happiness Template (囍临门) ─── */

/* Root wrapper scopes all template styles */
.double-happiness {
  --dh-red: #C8102E;
  --dh-gold: #D4A843;
  --dh-cream: #FFF8F0;
  --dh-dark: #2B1216;
  --dh-deep-red: #8B1A1A;
  --dh-gold-light: #F5E6C8;
  --dh-muted: #8B7355;
}

/* ── Section alternation ── */
.dh-section-cream { background-color: var(--dh-cream); }
.dh-section-dark  { background-color: var(--dh-deep-red); color: #FFF8F0; }
.dh-section-white { background-color: #FFFFFF; }

/* ── Gold decorative divider (non-text, 3:1 contrast is sufficient) ── */
.dh-gold-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(212, 168, 67, 0.5), transparent);
}

/* ── Blockquote accent (announcement section) ── */
.dh-blockquote {
  border-left: 3px solid var(--dh-gold);
  padding-left: 1.5rem;
}

/* ── Timeline vertical line ── */
.dh-timeline-line {
  width: 2px;
  background: linear-gradient(180deg, var(--dh-gold), var(--dh-red), var(--dh-gold));
}

/* ── Timeline dot ── */
.dh-timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: var(--dh-red);
  border: 2px solid var(--dh-gold);
}

/* ── Photo frame ── */
.dh-photo-frame {
  border: 1px solid rgba(212, 168, 67, 0.3);
  box-shadow: 0 2px 8px rgba(43, 18, 22, 0.08);
}

/* ── RSVP form focus indicators on festive backgrounds ── */
.double-happiness input:focus-visible,
.double-happiness select:focus-visible,
.double-happiness textarea:focus-visible {
  outline: 2px solid #FFFFFF;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(200, 16, 46, 0.5);
}

/* ── 囍 watermark ── */
.dh-xi-watermark {
  font-size: 12rem;
  color: rgba(212, 168, 67, 0.08);
  pointer-events: none;
  user-select: none;
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .double-happiness * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Phase 2 success criteria:**
- [ ] CSS file follows `dh-` prefix convention
- [ ] Root `.double-happiness` class scopes all variables
- [ ] Custom focus indicators for forms
- [ ] Respects `prefers-reduced-motion`

---

#### Phase 3: Template Component — Core Structure

##### Task 3.1: Create `src/components/templates/double-happiness/DoubleHappinessInvitation.tsx`

Build the complete template component. Follow `GardenRomanceInvitation.tsx` structure exactly.

**Component skeleton:**

```typescript
// src/components/templates/double-happiness/DoubleHappinessInvitation.tsx
import { Link } from "@tanstack/react-router";
import { type CSSProperties, useId, useRef, useState } from "react";
import { useScrollReveal } from "../../../lib/scroll-effects";
import { AddToCalendarButton } from "../../ui/AddToCalendarButton";
import { LoadingSpinner } from "../../ui/LoadingSpinner";
import AngpowQRCode from "../AngpowQRCode";
import { CountdownWidget } from "../CountdownWidget";
import { makeEditableProps, parseAttendance } from "../helpers";
import { RsvpConfirmation, type RsvpConfirmationProps } from "../RsvpConfirmation";
import SectionShell from "../SectionShell";
import type { TemplateInvitationProps } from "../types";
import "./double-happiness.css";

const COLORS = {
  red: "#C8102E",
  gold: "#D4A843",
  cream: "#FFF8F0",
  dark: "#2B1216",
  deepRed: "#8B1A1A",
  goldLight: "#F5E6C8",
  muted: "#8B7355",
} as const;

const headingFont: CSSProperties = {
  fontFamily: "'Noto Serif SC', 'Songti SC', Georgia, serif",
};

const bodyFont: CSSProperties = {
  fontFamily: "Inter, 'Noto Sans SC', system-ui, sans-serif",
};

const accentFont: CSSProperties = {
  fontFamily: "'Noto Serif SC', 'Songti SC', serif",
  fontWeight: 700,
};

export default function DoubleHappinessInvitation({
  content,
  hiddenSections,
  mode = "public",
  onSectionSelect,
  onAiClick,
  onInlineEdit,
  onRsvpSubmit,
  rsvpStatus,
}: TemplateInvitationProps) {
  useScrollReveal();
  const consentDescriptionId = useId();
  const data = content;
  const editableProps = makeEditableProps(mode, onInlineEdit);

  // RSVP state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false); // double-submit guard
  const [submitError, setSubmitError] = useState("");
  const [rsvpData, setRsvpData] = useState<RsvpConfirmationProps | null>(null);

  // ... section render functions and main return
}
```

**Section implementation order (each as a `<SectionShell>` block):**

1. **Hero** — Full-bleed photo bg, dark overlay, 囍 watermark, couple names, date, lunar date, AddToCalendarButton
2. **Announcement** — Cream bg, bilingual greeting with `lang` attributes, gold blockquote border
3. **Couple** — Side-by-side portraits, bilingual labels
4. **Story** — Staggered timeline with gold line, red dots, circular photos
5. **Gallery** — 2-column CSS grid, featured photo at top, white frames
6. **Countdown** — `<CountdownWidget targetDate={data.hero.date} />`, date display
7. **Schedule** — Event cards with red left border, time in gold
8. **Venue** — Name, address, Google Maps button, parking info
9. **RSVP** — Full form (name, email, attendance, guests, dietary, message, consent), `useRef` double-submit guard
10. **Gift** — `<AngpowQRCode>` conditional on `data.gift`, gold border card
11. **Footer** — Bilingual thank you, 囍 motif, social links if present

**Key patterns to follow (from Required Component Patterns Checklist):**

```typescript
// Editable fields use editableProps helper
<h1
  {...editableProps("hero.partnerOneName", "dh-couple-name")}
  style={accentFont}
>
  {data.hero.partnerOneName}
</h1>

// Sections use SectionShell with hiddenSections
<SectionShell
  sectionId="hero"
  mode={mode}
  hidden={hiddenSections?.hero}
  onSelect={onSectionSelect}
  onAiClick={onAiClick}
  className="dh-section-cream"
>
  {/* content */}
</SectionShell>

// Reveal elements use data-reveal + dm-reveal classes
<div data-reveal className="dm-reveal" style={{ transitionDelay: "0.1s" }}>
  {/* animated content */}
</div>

// Gift section is conditional
{data.gift && (
  <SectionShell sectionId="gift" ...>
    <AngpowQRCode
      paymentUrl={data.gift.paymentUrl}
      paymentMethod={data.gift.paymentMethod}
      recipientName={data.gift.recipientName}
    />
  </SectionShell>
)}

// AddToCalendarButton hidden in editor
{mode !== "editor" && (
  <AddToCalendarButton date={data.hero.date} title={...} />
)}

// RSVP form with useRef double-submit guard
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (!onRsvpSubmit || submittingRef.current) return;
  submittingRef.current = true;
  setIsSubmitting(true);
  try {
    const formData = new FormData(e.currentTarget);
    await onRsvpSubmit({
      name: formData.get("name") as string,
      attendance: parseAttendance(formData.get("attendance")),
      guestCount: Number(formData.get("guestCount")) || 1,
      dietaryRequirements: (formData.get("dietary") as string) || undefined,
      message: (formData.get("message") as string) || undefined,
      email: (formData.get("email") as string) || undefined,
    });
    setRsvpData({ name: formData.get("name") as string, ... });
  } catch {
    setSubmitError("Something went wrong. Please try again.");
  } finally {
    submittingRef.current = false;
    setIsSubmitting(false);
  }
};
```

**Bilingual accessibility patterns:**

```tsx
// Root wrapper sets primary language
<div className="double-happiness" style={bodyFont} lang="zh-Hans">

// English passages marked explicitly
<p lang="en">Dear Family & Friends</p>

// Bilingual labels
<span lang="zh-Hans">新娘</span>{" / "}
<span lang="en">THE BRIDE</span>

// Decorative elements hidden from screen readers
<span className="dh-xi-watermark" aria-hidden="true">囍</span>

// Alt text in primary language
<img alt="新郎新娘合照" ... />
```

**Phase 3 success criteria:**
- [ ] All 11 sections render with sample data (9 visible + gift hidden + footer)
- [ ] `useScrollReveal()` called at top
- [ ] `makeEditableProps` used on all editable text
- [ ] `SectionShell` wraps every section with correct `sectionId`
- [ ] `data-reveal` + `dm-reveal` on all reveal elements
- [ ] RSVP form has full field set with consent checkbox
- [ ] `useRef` guard prevents RSVP double-submit
- [ ] Bilingual `lang` attributes on all sections
- [ ] Decorative 囍 elements have `aria-hidden="true"` or `alt=""`
- [ ] `AddToCalendarButton` hidden in editor mode
- [ ] Hero image has `fetchpriority="high"`
- [ ] Gallery images have `onError` fallback to placeholder

---

#### Phase 4: Visual Polish & Testing

##### Task 4.1: Create placeholder preview thumbnail

Create `public/img/template-double-happiness.png` — a 600x400 screenshot or placeholder.

##### Task 4.2: Run lint and format

```bash
pnpm check   # Biome lint + format
```

Fix any issues.

##### Task 4.3: Run unit tests

```bash
pnpm test
```

Verify:
- Template count test passes (`toBe(5)`)
- No regressions in existing template tests

##### Task 4.4: Manual verification

- [ ] Visit `/editor/new` — "Double Happiness" appears in template picker
- [ ] Click template — editor loads with sample data
- [ ] Visit `/invite/<slug>-double-happiness-sample` — public view renders
- [ ] Scroll through all 9 sections on mobile viewport (375px)
- [ ] Scroll animations fire correctly
- [ ] RSVP form submits successfully
- [ ] Inline editing works in editor mode (click text to edit)
- [ ] Section visibility toggles work (hide/show sections)
- [ ] Countdown shows correct remaining time
- [ ] Color contrast is readable (no gold text on red)

---

## Acceptance Criteria

### Functional Requirements

- [ ] Template renders correctly on mobile (375px) and desktop
- [ ] All 9 visible sections display with sample data
- [ ] Gift/Angpow section hidden by default, visible when toggled
- [ ] Countdown shows correct date and live timer (existing CountdownWidget)
- [ ] Photo slots accept user uploads via editor
- [ ] RSVP form validates and submits (full field set: name, email, attendance, guests, dietary, message, consent)
- [ ] Inline editing works in editor mode (all text fields editable)
- [ ] Scroll animations fire on intersection (fade-up with stagger)
- [ ] Template selectable from `/editor/new` picker
- [ ] InvitationRenderer lazy-loads the template correctly
- [ ] Sample invitation renders at `/invite/<slug>-double-happiness-sample`

### Non-Functional Requirements

- [ ] WCAG AA color contrast on all text/background combinations
- [ ] No gold text on red backgrounds (2.66:1 — fails ALL WCAG levels)
- [ ] Bilingual `lang` attributes (zh-Hans primary, en for English passages)
- [ ] `prefers-reduced-motion` respected (all animations skip)
- [ ] `role="timer"` on countdown (not `aria-live="polite"` updating every second)
- [ ] Decorative images use `alt=""` + `aria-hidden="true"`
- [ ] RSVP form: visible labels, `aria-describedby` for errors, native elements
- [ ] Hero image: `fetchpriority="high"`, `onError` fallback
- [ ] Template JS chunk < 500KB (verify with build)

### Quality Gates

- [ ] `pnpm check` passes (Biome lint + format)
- [ ] `pnpm test` passes (all unit tests including updated template count)
- [ ] No new dependencies added to `package.json`
- [ ] RSVP double-submit prevented with `useRef` guard
- [ ] Security: hardcoded field paths for inline editing patches (no dynamic path traversal)

## Dependencies & Prerequisites

- None. All required components exist: `SectionShell`, `CountdownWidget`, `AngpowQRCode`, `RsvpConfirmation`, `LoadingSpinner`, `AddToCalendarButton`, `makeEditableProps`, `parseAttendance`, `useScrollReveal`.
- No new npm packages needed.
- No database schema changes.
- No API changes.

## Risk Analysis & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| CJK font load too slow | Medium | High | Use `font-display: swap`, limit to 2 weights (400, 700), fallback to system Songti SC |
| Gold-on-red text accidentally used | High | Medium | `COLORS` constant enforces palette. Add comment: "// NEVER use gold text on red bg (2.66:1 fails WCAG)" |
| RSVP form missing fields vs `RsvpPayload` type | Low | High | Full field set specified; `parseAttendance` helper enforces type |
| Template not lazy-loaded correctly | Low | Medium | `InvitationRenderer` fallback to love-at-dusk prevents blank page |
| Gallery images in `data-reveal` containers not loading on Safari iOS 15 | Medium | Medium | Use `fetchpriority="low"` instead of `loading="lazy"` on reveal-wrapped images |

## Institutional Learnings Applied

1. **Prototype pollution prevention** (`docs/solutions/security-issues/cross-invitation-mutation-and-prototype-pollution-system-20260219.md`): Use hardcoded field paths in `editableProps()` calls — never construct paths dynamically from user input.
2. **Canvas editor interaction patterns** (`docs/solutions/ui-bugs/interaction-publish-regressions-canvas-editor-20260217.md`): Keep store identity stable per invitationId; server mutation first for critical operations.

## Future Considerations

These are explicitly out of scope for v1 but documented for future iterations:

- **Ma Shan Zheng calligraphy font** — Can be added as 4th font if users request calligraphic names. Requires type system change to support 4th font slot.
- **Falling petal animation** — Can be added behind a feature toggle if performance permits on target devices.
- **Multiple venues** — Chinese weddings often have tea ceremony + banquet at different locations. Current data model supports only one.
- **GrabPay** — Can be added as 4th payment method in `AngpowQRCode`.
- **RSVP deadline enforcement** — Server-side check against `rsvp.deadline`. Affects all templates.
- **Post-wedding mode** — Replace RSVP + countdown with "Thank you" after wedding date. Affects all templates.

## References

### Internal References

- Design document: `docs/plans/2026-02-28-feat-double-happiness-template-design.md`
- Template types: `src/templates/types.ts` — TemplateConfig, DesignTokens, SectionConfig
- Reference template (closest): `src/templates/love-at-dusk.ts`, `src/components/templates/garden-romance/GardenRomanceInvitation.tsx`
- Shared components: `src/components/templates/CountdownWidget.tsx`, `src/components/templates/AngpowQRCode.tsx`, `src/components/templates/SectionShell.tsx`
- Helpers: `src/components/templates/helpers.ts` — `makeEditableProps`, `parseAttendance`
- Renderer: `src/components/templates/InvitationRenderer.tsx` — `templateImports` map
- Sample data: `src/data/sample-invitation.ts` — `buildSampleContent`
- Editor picker: `src/routes/editor/new.tsx` — `templatePreviewImages`

### Security Learnings

- `docs/solutions/security-issues/cross-invitation-mutation-and-prototype-pollution-system-20260219.md`
- `docs/solutions/ui-bugs/interaction-publish-regressions-canvas-editor-20260217.md`

### Accessibility Research

- WCAG contrast ratios verified: Red on cream (5.59:1 AA), Gold on dark (7.90:1 AAA), White on red (5.88:1 AA), Dark on gold-light (14.19:1 AAA), Gold on red (2.66:1 FAIL)
- Bilingual `lang` attributes per WCAG 3.1.2
- Timer ARIA: `role="timer"` with implicit `aria-live="off"` per MDN guidance
