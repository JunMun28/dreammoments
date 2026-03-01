# Apply Wedding Template Design Rules — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor the Double Happiness template and shared template infrastructure to conform to the wedding template design rules (`docs/plans/2026-03-01-wedding-template-design-rules.md`), making it easy to create new templates that follow the same patterns.

**Architecture:** Extract shared template primitives (CSS custom properties, section title component, mobile container) into reusable infrastructure. Then update the Double Happiness template section-by-section to match the design rules precisely. Each section is an independent task that can be verified visually and by tests.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, CSS custom properties, Vitest

---

## Prerequisites

- Read the design rules: `docs/plans/2026-03-01-wedding-template-design-rules.md`
- Existing template: `src/components/templates/double-happiness/DoubleHappinessInvitation.tsx`
- Existing CSS: `src/components/templates/double-happiness/double-happiness.css`
- Template config: `src/templates/double-happiness.ts`
- Types: `src/components/templates/types.ts`, `src/lib/types.ts`
- Test file: `src/tests/templates-ui.test.tsx`

---

### Task 1: Standardize CSS Custom Properties

Rename template-scoped CSS custom properties to use the standard `--t-` prefix from the design rules (section 11). This makes every template use a consistent token interface.

**Files:**
- Modify: `src/components/templates/double-happiness/double-happiness.css`
- Modify: `src/components/templates/double-happiness/DoubleHappinessInvitation.tsx`

**Step 1: Update CSS custom properties to standard prefix**

In `double-happiness.css`, rename all `--dh-*` variables to `--t-*` and add `--t-bg-alt`:

```css
.double-happiness {
  --t-primary: #c8102e;
  --t-secondary: #8b1a1a;
  --t-accent: #d4a843;
  --t-bg: #fff8f0;
  --t-text: #2b1216;
  --t-muted: #8b7355;
  --t-bg-alt: #ffffff;
  --t-accent-light: #f5e6c8;
}
```

Update all CSS references from `var(--dh-*)` to `var(--t-*)`.

**Step 2: Update the JS COLORS object to read from CSS vars**

In `DoubleHappinessInvitation.tsx`, keep the `COLORS` const as-is (it's used in inline styles where CSS vars aren't ideal). No change needed here — the CSS vars are for the CSS file, the JS const is for inline styles. Both should have matching values.

**Step 3: Run tests to verify nothing broke**

Run: `pnpm test -- --run src/tests/templates-ui.test.tsx`
Expected: PASS

**Step 4: Commit**

```bash
git add src/components/templates/double-happiness/double-happiness.css
git commit -m "refactor: standardize template CSS custom properties to --t-* prefix"
```

---

### Task 2: Add Mobile-First Container Constraint

The design rules specify a max-width of 430px on desktop for the overall template wrapper, centered. Currently the template has no max-width constraint on the outer container.

**Files:**
- Modify: `src/components/templates/double-happiness/double-happiness.css`

**Step 1: Add mobile-first container styles**

Add to `double-happiness.css`:

```css
/* ── Mobile-first container ── */
.double-happiness {
  max-width: 430px;
  margin-left: auto;
  margin-right: auto;
  overflow-x: hidden;
}

@media (min-width: 431px) {
  .double-happiness {
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.08);
  }
}
```

**Step 2: Verify hero still works full-bleed within the container**

Run: `pnpm dev` and check `localhost:3000` invitation preview.
The hero photo should fill the 430px container edge-to-edge. The outer page should show a neutral background.

**Step 3: Run tests**

Run: `pnpm test -- --run src/tests/templates-ui.test.tsx`
Expected: PASS

**Step 4: Commit**

```bash
git add src/components/templates/double-happiness/double-happiness.css
git commit -m "feat: add 430px mobile-first container constraint to template"
```

---

### Task 3: Create Shared SectionTitle Component

The design rules define a bilingual section title pattern used by every section: Chinese label (small, spaced) above English heading (large, accent font). Extract this into a reusable component.

**Files:**
- Create: `src/components/templates/SectionTitle.tsx`
- Test: `src/tests/templates-ui.test.tsx` (add assertion)

**Step 1: Write a test for the SectionTitle component**

Add to `src/tests/templates-ui.test.tsx`:

```tsx
import { renderToString } from "react-dom/server";
import SectionTitle from "../components/templates/SectionTitle";

describe("SectionTitle", () => {
  test("renders bilingual title with correct lang attributes", () => {
    const html = renderToString(
      <SectionTitle zhLabel="爱 情 故 事" enHeading="Our Story" />
    );
    expect(html).toContain("爱 情 故 事");
    expect(html).toContain("Our Story");
    expect(html).toContain('lang="en"');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `pnpm test -- --run src/tests/templates-ui.test.tsx`
Expected: FAIL — SectionTitle module not found

**Step 3: Implement SectionTitle**

Create `src/components/templates/SectionTitle.tsx`:

```tsx
import type { CSSProperties } from "react";

interface SectionTitleProps {
  zhLabel: string;
  enHeading: string;
  primaryColor?: string;
  darkColor?: string;
  headingFont?: CSSProperties;
  accentFont?: CSSProperties;
  className?: string;
}

export default function SectionTitle({
  zhLabel,
  enHeading,
  primaryColor = "#C8102E",
  darkColor = "#2B1216",
  headingFont = { fontFamily: "'Noto Serif SC', 'Songti SC', Georgia, serif" },
  accentFont = { fontFamily: "'Noto Serif SC', 'Songti SC', serif", fontWeight: 700 },
  className = "",
}: SectionTitleProps) {
  return (
    <div className={`text-center ${className}`}>
      <p
        data-reveal
        className="dm-reveal text-sm tracking-[0.5em]"
        style={{ ...headingFont, color: primaryColor }}
      >
        {zhLabel}
      </p>
      <h2
        data-reveal
        className="dm-reveal mt-3 text-4xl sm:text-5xl"
        style={{ ...accentFont, color: darkColor }}
        lang="en"
      >
        {enHeading}
      </h2>
    </div>
  );
}
```

**Step 4: Run tests to verify they pass**

Run: `pnpm test -- --run src/tests/templates-ui.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/templates/SectionTitle.tsx src/tests/templates-ui.test.tsx
git commit -m "feat: add reusable bilingual SectionTitle component"
```

---

### Task 4: Refactor Hero Section

Update the hero section to match design rules section 2.1. Key changes: ensure content hierarchy follows the spec (kicker → names → tagline → pills), verify spacing/sizing values.

**Files:**
- Modify: `src/components/templates/double-happiness/DoubleHappinessInvitation.tsx` (hero section, lines ~98-204)

**Step 1: Review current hero against design rules**

The current hero already largely follows the rules. Verify these specific values match:
- Kicker: 12px, uppercase, tracking 0.5em, gold-light ✓
- Names: accent font, 36px mobile / 60px desktop → currently `text-4xl sm:text-6xl` ✓
- Tagline: heading font, 18px, gold-light → currently `text-lg` ✓
- Date/venue pills: rounded capsules, white/90% → currently rounded-full with border ✓

The hero is already compliant. Only tweak if spacing values differ.

**Step 2: Verify the hero has `min-h-[100svh]`**

Current: `min-h-[100svh]` ✓ — already correct.

**Step 3: Run tests**

Run: `pnpm test -- --run src/tests/templates-ui.test.tsx`
Expected: PASS

**Step 4: Commit (only if changes were made)**

```bash
git commit -m "refactor: align hero section with design rules"
```

---

### Task 5: Refactor Couple Section with SectionTitle

Replace the inline bilingual title in the Couple section with the new `SectionTitle` component.

**Files:**
- Modify: `src/components/templates/double-happiness/DoubleHappinessInvitation.tsx` (couple section, lines ~290-411)

**Step 1: Import and use SectionTitle**

Replace the existing couple section title markup:

```tsx
// Before:
<div className="text-center">
  <p data-reveal className="dm-reveal text-sm tracking-[0.5em]"
     style={{ ...headingFont, color: COLORS.red }}>
    新 郎 新 娘
  </p>
  <h2 data-reveal className="dm-reveal mt-3 text-4xl sm:text-5xl"
      style={{ ...accentFont, color: COLORS.dark }} lang="en">
    The Couple
  </h2>
</div>

// After:
<SectionTitle
  zhLabel="新 郎 新 娘"
  enHeading="The Couple"
  primaryColor={COLORS.red}
  darkColor={COLORS.dark}
  headingFont={headingFont}
  accentFont={accentFont}
/>
```

**Step 2: Run tests**

Run: `pnpm test -- --run src/tests/templates-ui.test.tsx`
Expected: PASS

**Step 3: Commit**

```bash
git add src/components/templates/double-happiness/DoubleHappinessInvitation.tsx
git commit -m "refactor: use SectionTitle in couple section"
```

---

### Task 6: Refactor All Remaining Sections with SectionTitle

Apply the `SectionTitle` component to all other sections that have the bilingual title pattern: Story, Gallery, Schedule, Venue, RSVP, Gift, and Footer decorative title.

**Files:**
- Modify: `src/components/templates/double-happiness/DoubleHappinessInvitation.tsx`

**Step 1: Replace section titles**

For each section, replace the inline title with `SectionTitle`:

| Section | zhLabel | enHeading |
|---------|---------|-----------|
| Announcement | `诚 挚 邀 请` | (uses custom title, keep inline) |
| Story | `爱 情 故 事` | `Our Story` |
| Gallery | `甜 蜜 瞬 间` | `Gallery` |
| Schedule | `婚 礼 流 程` | `Schedule` |
| Venue | `婚 礼 地 点` | `Venue` |
| RSVP | (dark bg variant, keep inline for different styling) | |
| Gift | `礼 金 祝 福` | `Digital Angpow` |

Skip Announcement (has unique layout with title field) and RSVP (different bg/color scheme) — these keep their inline titles.

**Step 2: Run tests**

Run: `pnpm test -- --run src/tests/templates-ui.test.tsx`
Expected: PASS

**Step 3: Commit**

```bash
git add src/components/templates/double-happiness/DoubleHappinessInvitation.tsx
git commit -m "refactor: use SectionTitle across all template sections"
```

---

### Task 7: Add Scroll-Reveal CSS Classes

The design rules specify a standard reveal animation (section 5.1). Currently the template uses `data-reveal` + `dm-reveal` + `is-visible`/`is-hidden` classes from `useScrollReveal()`. Ensure the CSS for these classes matches the design rules values.

**Files:**
- Modify: `src/components/templates/double-happiness/double-happiness.css`

**Step 1: Check current dm-reveal CSS**

Search for `dm-reveal` CSS definitions. These may be in a global stylesheet.

**Step 2: Add/verify reveal animation CSS in template CSS**

Add to `double-happiness.css` if not already globally defined:

```css
/* ── Scroll reveal animation (design rules §5.1) ── */
.double-happiness .dm-reveal {
  opacity: 0;
  transform: translate3d(0, 30px, 0);
  transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

.double-happiness .dm-reveal.is-visible {
  opacity: 1;
  transform: translate3d(0, 0, 0);
}

.double-happiness .dm-reveal.is-hidden {
  opacity: 0;
  transform: translate3d(0, 30px, 0);
}
```

**Step 3: Run tests**

Run: `pnpm test -- --run src/tests/templates-ui.test.tsx`
Expected: PASS

**Step 4: Commit**

```bash
git add src/components/templates/double-happiness/double-happiness.css
git commit -m "feat: add standard scroll-reveal animation CSS per design rules"
```

---

### Task 8: Standardize Spacing Values

Audit all section padding values against the design rules spacing system (section 4). Update any that don't match.

**Files:**
- Modify: `src/components/templates/double-happiness/DoubleHappinessInvitation.tsx`

**Step 1: Audit current spacing**

Design rules specify:
- Section padding-y: `py-16` (64px) to `py-24` (96px)
- Section padding-x: `px-6` (24px) to `px-10` (40px)
- Section title to content: `mt-14` (56px)

Current values in template — check each `SectionShell` className:
- Countdown: `px-6 py-16 sm:px-10` ✓
- Announcement: `px-6 py-24 sm:px-10` ✓
- Couple: `px-6 py-24 sm:px-10` ✓
- Story: `px-6 py-24 sm:px-10` ✓
- Gallery: `px-6 py-24 sm:px-10` ✓
- Schedule: `px-6 py-24 sm:px-10` ✓
- Venue: `px-6 py-24 sm:px-10` ✓
- RSVP: `px-6 py-24 sm:px-10` ✓
- Gift: `px-6 py-24 sm:px-10` ✓
- Footer: `px-6 pb-20 pt-16 sm:px-10` — slightly asymmetric, acceptable for footer

All spacing already matches. Mark as verified.

**Step 2: Run tests**

Run: `pnpm test -- --run src/tests/templates-ui.test.tsx`
Expected: PASS

**Step 3: Commit (only if changes were made)**

```bash
git commit -m "refactor: standardize section spacing per design rules"
```

---

### Task 9: Add CountdownWidget Styling to Template CSS

The CountdownWidget uses generic CSS classes (`countdown-widget`, `countdown-value`, etc.). Add template-scoped styling to match design rules section 2.2 (number size 32-40px, label 10-12px uppercase).

**Files:**
- Modify: `src/components/templates/double-happiness/double-happiness.css`

**Step 1: Add countdown styling**

```css
/* ── Countdown styling (design rules §2.2) ── */
.double-happiness .countdown-widget {
  text-align: center;
}

.double-happiness .countdown-units {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.double-happiness .countdown-unit {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 4rem;
}

.double-happiness .countdown-value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.2;
  color: var(--t-text);
}

.double-happiness .countdown-label {
  font-size: 0.625rem;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  color: var(--t-muted);
  margin-top: 0.25rem;
}

.double-happiness .countdown-separator {
  font-size: 1.5rem;
  color: var(--t-accent);
  font-weight: 300;
  align-self: flex-start;
  margin-top: 0.25rem;
}

.double-happiness .countdown-message {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--t-text);
}

.double-happiness .countdown-timezone {
  font-size: 0.625rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--t-muted);
  margin-top: 1rem;
}
```

**Step 2: Run tests**

Run: `pnpm test -- --run src/tests/templates-ui.test.tsx`
Expected: PASS

**Step 3: Visually verify**

Run: `pnpm dev`, check countdown renders with correct sizes.

**Step 4: Commit**

```bash
git add src/components/templates/double-happiness/double-happiness.css
git commit -m "feat: add countdown widget styling per design rules"
```

---

### Task 10: Write Template Design Rules Conformance Test

Add a test that checks the template's CSS file contains the required `--t-*` custom properties and the template component renders all expected `data-section` attributes.

**Files:**
- Modify: `src/tests/templates-ui.test.tsx`

**Step 1: Write conformance tests**

```tsx
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("design rules conformance", () => {
  test("template CSS defines all required --t-* custom properties", () => {
    const css = readFileSync(
      resolve(__dirname, "../components/templates/double-happiness/double-happiness.css"),
      "utf-8",
    );
    const requiredTokens = [
      "--t-primary",
      "--t-secondary",
      "--t-accent",
      "--t-bg",
      "--t-text",
      "--t-muted",
      "--t-bg-alt",
    ];
    for (const token of requiredTokens) {
      expect(css).toContain(token);
    }
  });

  test("template renders sections in expected order", () => {
    const Template = DoubleHappinessInvitation;
    const html = renderToString(
      <Template content={buildSampleContent("double-happiness")} />,
    );
    const sectionOrder = [...html.matchAll(/data-section="([^"]+)"/g)].map(
      (m) => m[1],
    );
    expect(sectionOrder[0]).toBe("hero");
    expect(sectionOrder).toContain("rsvp");
    expect(sectionOrder).toContain("footer");
    // Hero should come before RSVP
    expect(sectionOrder.indexOf("hero")).toBeLessThan(
      sectionOrder.indexOf("rsvp"),
    );
  });

  test("template has reduced motion CSS", () => {
    const css = readFileSync(
      resolve(__dirname, "../components/templates/double-happiness/double-happiness.css"),
      "utf-8",
    );
    expect(css).toContain("prefers-reduced-motion");
  });
});
```

**Step 2: Run tests**

Run: `pnpm test -- --run src/tests/templates-ui.test.tsx`
Expected: PASS

**Step 3: Commit**

```bash
git add src/tests/templates-ui.test.tsx
git commit -m "test: add design rules conformance tests for templates"
```

---

### Task 11: Visual Review & Final Cleanup

Do a full visual review of the template at all breakpoints and clean up any remaining inconsistencies.

**Step 1: Run dev server**

Run: `pnpm dev`

**Step 2: Check mobile viewport (375px)**

Open browser at `localhost:3000/invite/<slug>` with mobile viewport:
- [ ] Hero fills viewport height, photo is edge-to-edge
- [ ] Content centered within 430px max-width
- [ ] All sections alternate backgrounds (cream/white/cream/dark)
- [ ] Scroll reveals work smoothly
- [ ] Text is readable at all sizes
- [ ] RSVP form is usable on mobile
- [ ] Music player button is visible and tappable

**Step 3: Check desktop viewport (1440px)**

- [ ] Template is centered, max-width 430px with subtle shadow
- [ ] Background page visible on either side
- [ ] All proportions look correct

**Step 4: Run full test suite**

Run: `pnpm test -- --run`
Expected: All tests PASS

**Step 5: Commit any final tweaks**

```bash
git add -A
git commit -m "chore: final visual cleanup after design rules application"
```

---

## Summary of Changes

| Task | What | Files |
|------|------|-------|
| 1 | Standardize CSS custom properties | CSS |
| 2 | Add 430px mobile container | CSS |
| 3 | Create SectionTitle component | New component + test |
| 4 | Verify hero section | TSX (may be no-op) |
| 5 | Refactor couple section | TSX |
| 6 | Refactor all remaining sections | TSX |
| 7 | Add scroll-reveal CSS | CSS |
| 8 | Audit spacing values | TSX (may be no-op) |
| 9 | Add countdown styling | CSS |
| 10 | Add conformance tests | Test |
| 11 | Visual review & cleanup | All |

Total: ~11 tasks, mostly CSS and minor TSX refactors. The template is already well-built — this plan mostly standardizes naming and extracts reusable patterns.
