# Wedding Template Visual Overhaul — Modern Bold

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign all 4 wedding templates with bold, distinctive color palettes, creative typography, geometric Art Deco motifs, and rich Motion animations — eliminating the generic "safe wedding template" look.

**Architecture:** Each template gets a complete visual overhaul: new color tokens (config + CSS + component COLORS object), new Google Fonts, redesigned hero sections with signature animations, unique section dividers/decorative elements, and template-specific particle presets. Leverages existing `animations.tsx` components (Reveal, Stagger, Parallax, DrawPath, ParticleField, Shimmer) and adds new animation components. All animations are S-tier (compositor-only: transform, opacity, clipPath).

**Tech Stack:** React, TypeScript, Tailwind CSS v4, Motion (motion/react), Swiper.js, lucide-react, CSS custom properties.

**Existing animation infrastructure (already built — use these):**
- `Reveal` — scroll-triggered fade-in with direction variants (up/left/right/scale/blur)
- `Stagger` — sequential child reveals with configurable interval
- `Parallax` — scroll-driven Y offset using `useScroll` + `useTransform`
- `DrawPath` — SVG path drawing animation via stroke-dashoffset
- `ParticleField` — CSS particle system with presets (petalRain, goldDust, starlight, snowfall, lanterns)
- `Shimmer` — gold shimmer sweep overlay

**Motion rules (from skill):**
- Import from `motion/react` in client components
- Prefer `transform` string for WAAPI (S-tier)
- Use springs for physical motion: `type: "spring", bounce: 0.15, visualDuration: 0.6`
- Wedding sites = softer curves, slightly longer durations
- All decorative animations must respect `useReducedMotion()`

---

## Phase 1: Shared Animation Components

### Task 1: Add new animation components to animations.tsx

**Files:**
- Modify: `src/components/templates/animations.tsx`

**Step 1: Add ClipReveal component**

A section-transition animation that reveals content via animated clipPath. Used for hero reveals and section wipes.

```tsx
interface ClipRevealProps {
  children: ReactNode;
  shape?: "diagonal" | "circle" | "curtain" | "inset";
  delay?: number;
  duration?: number;
  className?: string;
}

export function ClipReveal({
  children,
  shape = "inset",
  delay = 0,
  duration = 1.2,
  className = "",
}: ClipRevealProps) {
  const shouldReduce = useReducedMotion();

  const clips: Record<string, { from: string; to: string }> = {
    diagonal: {
      from: "polygon(0 0, 0 0, 0 100%, 0 100%)",
      to: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
    },
    circle: {
      from: "circle(0% at 50% 50%)",
      to: "circle(75% at 50% 50%)",
    },
    curtain: {
      from: "inset(0 50% 0 50%)",
      to: "inset(0 0% 0 0%)",
    },
    inset: {
      from: "inset(10% 10% 10% 10%)",
      to: "inset(0% 0% 0% 0%)",
    },
  };

  if (shouldReduce) {
    return <div className={className}>{children}</div>;
  }

  const { from, to } = clips[shape];

  return (
    <motion.div
      className={className}
      initial={{ clipPath: from, opacity: 0.3 }}
      whileInView={{ clipPath: to, opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        clipPath: { duration, ease: [0.16, 1, 0.3, 1], delay },
        opacity: { duration: duration * 0.5, delay },
      }}
    >
      {children}
    </motion.div>
  );
}
```

**Step 2: Add LetterboxReveal component**

Cinematic letterbox bars that slide open to reveal hero content.

```tsx
interface LetterboxRevealProps {
  children: ReactNode;
  barColor?: string;
  className?: string;
}

export function LetterboxReveal({
  children,
  barColor = "#0A1628",
  className = "",
}: LetterboxRevealProps) {
  const shouldReduce = useReducedMotion();

  if (shouldReduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {children}
      {/* Top bar */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 top-0 z-20"
        style={{ backgroundColor: barColor, height: "50%" }}
        initial={{ y: 0 }}
        animate={{ y: "-100%" }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      />
      {/* Bottom bar */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20"
        style={{ backgroundColor: barColor, height: "50%" }}
        initial={{ y: 0 }}
        animate={{ y: "100%" }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      />
    </div>
  );
}
```

**Step 3: Add SplitText component**

Names enter from opposite sides with spring physics.

```tsx
interface SplitTextProps {
  left: string;
  right: string;
  separator?: string;
  className?: string;
  separatorClassName?: string;
}

export function SplitText({
  left,
  right,
  separator = "·",
  className = "",
  separatorClassName = "",
}: SplitTextProps) {
  const shouldReduce = useReducedMotion();

  if (shouldReduce) {
    return (
      <div className={className}>
        <span>{left}</span>
        <span className={separatorClassName}>{separator}</span>
        <span>{right}</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <motion.span
        className="inline-block"
        initial={{ opacity: 0, transform: "translateX(-40px)" }}
        whileInView={{ opacity: 1, transform: "translateX(0)" }}
        viewport={{ once: true }}
        transition={{ type: "spring", bounce: 0.2, visualDuration: 0.7, delay: 0.5 }}
      >
        {left}
      </motion.span>
      <motion.span
        className={`inline-block ${separatorClassName}`}
        initial={{ opacity: 0, transform: "scale(0)" }}
        whileInView={{ opacity: 1, transform: "scale(1)" }}
        viewport={{ once: true }}
        transition={{ type: "spring", bounce: 0.3, visualDuration: 0.5, delay: 0.9 }}
      >
        {separator}
      </motion.span>
      <motion.span
        className="inline-block"
        initial={{ opacity: 0, transform: "translateX(40px)" }}
        whileInView={{ opacity: 1, transform: "translateX(0)" }}
        viewport={{ once: true }}
        transition={{ type: "spring", bounce: 0.2, visualDuration: 0.7, delay: 0.6 }}
      >
        {right}
      </motion.span>
    </div>
  );
}
```

**Step 4: Add new particle presets**

Add to `PARTICLE_PRESETS`:

```tsx
copperDust: {
  count: 20,
  color: "rgba(232, 118, 75, 0.4)",
  shape: "sparkle",
  drift: "up",
},
inkDrops: {
  count: 6,
  color: "rgba(12, 12, 12, 0.3)",
  shape: "circle",
  drift: "down",
},
emberGlow: {
  count: 14,
  color: "rgba(194, 87, 26, 0.5)",
  shape: "sparkle",
  drift: "float",
},
```

Also add `"copperDust" | "inkDrops" | "emberGlow"` to the `ParticlePreset` type.

**Step 5: Verify**

Run: `pnpm check --write && pnpm exec tsc --noEmit`

**Step 6: Commit**

```bash
git add src/components/templates/animations.tsx
git commit -m "feat: add ClipReveal, LetterboxReveal, SplitText animation components

- ClipReveal: diagonal/circle/curtain/inset clipPath reveals
- LetterboxReveal: cinematic bars that slide apart
- SplitText: names enter from opposite sides with spring physics
- New particle presets: copperDust, inkDrops, emberGlow
- All animations respect prefers-reduced-motion"
```

---

## Phase 2: Double Happiness → "Midnight Opulence"

### Task 2: Update Double Happiness color tokens and typography

**Files:**
- Modify: `src/templates/double-happiness.ts` (tokens only)
- Modify: `src/components/templates/double-happiness/double-happiness.css` (CSS variables)
- Modify: `src/components/templates/double-happiness/DoubleHappinessInvitation.tsx` (COLORS object + font stacks)

**Changes to template config (`double-happiness.ts`):**

```typescript
tokens: {
  colors: {
    primary: "#E8764B",    // Electric copper
    secondary: "#0A1628",  // Midnight navy
    accent: "#C9A96E",     // Antique brass
    background: "#FAF7F2", // Warm ivory
    text: "#0A1628",       // Midnight navy
    muted: "#64748B",      // Cool slate
  },
  typography: {
    headingFont: "'Cinzel', 'Noto Serif SC', Georgia, serif",
    bodyFont: "'Josefin Sans', 'Noto Sans SC', sans-serif",
    accentFont: "'Cinzel', 'Noto Serif SC', serif",
  },
  // ...
}
```

**Changes to CSS variables (`double-happiness.css`):**

```css
.double-happiness {
  --t-primary: #E8764B;
  --t-secondary: #0A1628;
  --t-accent: #C9A96E;
  --t-bg: #FAF7F2;
  --t-text: #0A1628;
  --t-muted: #64748B;
  --t-bg-alt: #ffffff;
  --t-accent-light: #E8DFD0;
  --t-accent-deep: #B8862D;
  --t-accent-glow: rgba(201, 169, 110, 0.15);
}
```

Also update `.dh-section-dark` to use midnight navy, `.dh-gold-shimmer` keyframe to use brass/copper tones, and all `rgba(176,125,98,...)` / `rgba(197,168,128,...)` references in CSS to match new palette.

**Changes to COLORS object in TSX:**

```typescript
const COLORS = {
  primary: "#E8764B",
  accent: "#C9A96E",
  cream: "#FAF7F2",
  dark: "#0A1628",
  espresso: "#0A1628",
  accentLight: "#E8DFD0",
  muted: "#64748B",
} as const;
```

Update font stacks:
```typescript
const headingFont: CSSProperties = {
  fontFamily: "'Cinzel', 'Noto Serif SC', Georgia, serif",
};
const bodyFont: CSSProperties = {
  fontFamily: "'Josefin Sans', 'Noto Sans SC', system-ui, sans-serif",
};
const accentFont: CSSProperties = {
  fontFamily: "'Cinzel', 'Noto Serif SC', serif",
  fontWeight: 700,
};
```

Also update inline gradient/shadow colors throughout the component (search for `#3A2E2A`, `#B07D62`, `rgba(176,125,98`, `rgba(197,168,128`, `rgba(58,46,42`).

**Step: Verify**

Run: `pnpm check --write && pnpm exec tsc --noEmit && pnpm test --run`

**Step: Commit**

```bash
git add src/templates/double-happiness.ts src/components/templates/double-happiness/
git commit -m "feat: redesign Double Happiness as Midnight Opulence

- Electric copper + midnight navy + antique brass palette
- Cinzel + Josefin Sans typography (Art Deco DNA)
- Updated all CSS variables and inline color references"
```

---

### Task 3: Add Motion animations and Art Deco motifs to Double Happiness

**Files:**
- Modify: `src/components/templates/double-happiness/DoubleHappinessInvitation.tsx`
- Modify: `src/components/templates/double-happiness/double-happiness.css`

**Step 1: Replace static hero with animated hero**

Import new animation components:
```tsx
import { ClipReveal, LetterboxReveal, Parallax, ParticleField, Reveal, SplitText, Stagger, DrawPath, Shimmer } from "../animations";
```

Replace the current hero content with:
- `LetterboxReveal` wrapping the entire hero (midnight navy bars)
- `Parallax` on the background photo (speed 0.3)
- `SplitText` for couple names (enter from opposite sides)
- `ParticleField preset="copperDust"` in hero background
- `Shimmer` on the 囍 watermark

**Step 2: Replace `data-reveal` / `dm-reveal` with Motion `Reveal` components**

Throughout the template, replace:
```tsx
<div data-reveal className="dm-reveal ...">
```
with:
```tsx
<Reveal direction="up" delay={0.1}>
```

Use `Stagger` for lists (timeline milestones, schedule events, gallery photos).

**Step 3: Add Art Deco sunburst divider SVG**

Add a new SVG path for Art Deco fan/chevron dividers. Use `DrawPath` component to animate them on scroll:

```tsx
<DrawPath
  d="M0,50 L25,20 L50,50 L75,20 L100,50"
  stroke={COLORS.accent}
  strokeWidth={1}
  width={200}
  height={60}
  duration={1.5}
  className="mx-auto"
/>
```

Replace the existing `.dh-divider-luxury` dividers with these animated Art Deco dividers.

**Step 4: Add CSS keyframes for new effects**

In `double-happiness.css`:
- Art Deco sunburst background pattern (CSS repeating-conic-gradient on hero)
- Copper shimmer animation (background-position sweep)
- Timeline dot spring pulse (scale keyframe)

**Step 5: Verify**

Run: `pnpm check --write && pnpm exec tsc --noEmit && pnpm test --run`

**Step 6: Commit**

```bash
git add src/components/templates/double-happiness/
git commit -m "feat: add Motion animations and Art Deco motifs to Double Happiness

- LetterboxReveal hero with Parallax background
- SplitText couple names with spring physics
- Copper dust particles in hero
- Art Deco sunburst DrawPath dividers
- Replace data-reveal with Motion Reveal/Stagger components"
```

---

## Phase 3: Romantic Cinematic → "Noir Rosé"

### Task 4: Redesign Romantic Cinematic colors, fonts, and animations

**Files:**
- Modify: `src/templates/romantic-cinematic.ts`
- Modify: `src/components/templates/romantic-cinematic/romantic-cinematic.css`
- Modify: `src/components/templates/romantic-cinematic/RomanticCinematicInvitation.tsx`

**New tokens:**

```typescript
colors: {
  primary: "#C2566B",    // Vivid rosewood
  secondary: "#1A1225",  // Deep aubergine
  accent: "#DDD5E9",     // Frosted lavender
  background: "#F8F5F0", // Warm parchment
  text: "#1A1225",
  muted: "#7A6E85",      // Dusty violet
}
typography: {
  headingFont: "'Bodoni Moda', 'Noto Serif SC', Georgia, serif",
  bodyFont: "'Jost', 'Noto Sans SC', sans-serif",
  accentFont: "'Bodoni Moda', 'Noto Serif SC', serif",
}
```

**CSS variables, COLORS object, font stacks:** Update all to match above (same pattern as Task 2).

**Animation changes:**
- Hero: `ClipReveal shape="curtain"` — curtain splits apart to reveal hero photo
- Names: massive Bodoni Moda (`text-5xl sm:text-7xl`), fade-in with `Reveal direction="blur"`
- Film-grain overlay: keep existing CSS animation but increase grain intensity
- Section transitions: use `Reveal direction="up"` with 0.9s duration (slower, cinematic feel)
- Gallery: film-strip aesthetic — add slight `rotate` CSS class on Swiper slides
- Dividers: double-line SVG with center diamond, animated with `DrawPath`
- Particles: `ParticleField preset="starlight"` in hero (white sparkles, lavender tint)

**New CSS additions:**
- `.rc-film-strip` — 2px rosewood borders top/bottom on gallery slides
- `.rc-diamond-divider` — center diamond ornament between double lines
- Section rhythm: `.rc-section-aubergine` (dark aubergine bg, light text), `.rc-section-parchment`, `.rc-section-white`

**Step: Verify + Commit**

```bash
git add src/templates/romantic-cinematic.ts src/components/templates/romantic-cinematic/
git commit -m "feat: redesign Romantic Cinematic as Noir Rosé

- Vivid rosewood + deep aubergine + frosted lavender palette
- Bodoni Moda + Jost typography
- Curtain clipPath hero reveal, blur fade-ins
- Starlight particles, film-strip gallery, diamond dividers"
```

---

## Phase 4: Classical Chinese → "Crimson Ink"

### Task 5: Redesign Classical Chinese colors, fonts, and animations

**Files:**
- Modify: `src/templates/classical-chinese.ts`
- Modify: `src/components/templates/classical-chinese/classical-chinese.css`
- Modify: `src/components/templates/classical-chinese/ClassicalChineseInvitation.tsx`

**New tokens:**

```typescript
colors: {
  primary: "#D4380D",    // Vermillion-orange
  secondary: "#0C0C0C",  // True obsidian
  accent: "#B8860B",     // Burnished brass
  background: "#F5F0E8", // Aged parchment
  text: "#0C0C0C",
  muted: "#6B5E50",      // Warm umber
}
typography: {
  headingFont: "'Cormorant', 'Noto Serif SC', Georgia, serif",
  bodyFont: "'DM Sans', 'Noto Sans SC', sans-serif",
  accentFont: "'Cormorant', 'Noto Serif SC', serif",
}
```

**Animation changes:**
- Hero: full obsidian background, giant 囍 animated with `DrawPath` (SVG stroke-dasharray draw over 2.5s), then fill fades to vermillion
- Names: vertical layout (CSS `writing-mode: vertical-rl` for Chinese names), slide up with `ClipReveal shape="inset"`
- Seal stamp: red circle "stamp" drops in on couple section with spring bounce (use `Reveal direction="scale"`)
- Section transitions: `Reveal direction="up"` but with slight `skewY` transform on timeline cards
- Ink drip particles: `ParticleField preset="inkDrops"` on hero
- Dividers: brush stroke SVG using `DrawPath` (organic, rough path data)
- High contrast sections: obsidian (#0C0C0C) alternating with parchment (#F5F0E8)

**New CSS additions:**
- `.cc-section-obsidian` — true black bg with parchment text
- `.cc-ink-texture` — subtle paper texture background via CSS repeating gradient
- `.cc-seal` — circular vermillion stamp with slight rotation
- `.cc-brush-divider` — brush stroke horizontal divider

**Step: Verify + Commit**

```bash
git add src/templates/classical-chinese.ts src/components/templates/classical-chinese/
git commit -m "feat: redesign Classical Chinese as Crimson Ink

- Vermillion + obsidian + burnished brass palette
- Cormorant + DM Sans typography
- SVG ink-brush 囍 draw animation, seal stamp reveal
- Ink drop particles, brush stroke dividers, high-contrast sections"
```

---

## Phase 5: Botanical Garden → "Terra Botanica"

### Task 6: Redesign Botanical Garden colors, fonts, and animations

**Files:**
- Modify: `src/templates/botanical-garden.ts`
- Modify: `src/components/templates/botanical-garden/botanical-garden.css`
- Modify: `src/components/templates/botanical-garden/BotanicalGardenInvitation.tsx`

**New tokens:**

```typescript
colors: {
  primary: "#064E3B",    // Deep emerald
  secondary: "#1C1917",  // Rich charcoal
  accent: "#C2571A",     // Burnt terracotta
  background: "#F5E6D3", // Warm sand
  text: "#1C1917",
  muted: "#6B5E50",      // Warm umber
}
typography: {
  headingFont: "'Cormorant Garamond', 'Noto Serif SC', Georgia, serif",
  bodyFont: "'Outfit', 'Noto Sans SC', sans-serif",
  accentFont: "'Cormorant Garamond', 'Noto Serif SC', serif",
}
```

**Animation changes:**
- Hero: `ClipReveal shape="diagonal"` — diagonal polygon wipe revealing hero photo
- Botanical SVG frame: `DrawPath` with vine/leaf corner paths drawing in from corners (1.5s)
- Names: oversized Cormorant Garamond, `Reveal direction="scale"` with spring bounce
- Leaf drift: `ParticleField preset="emberGlow"` — terracotta ember-like particles floating
- Cards: `Reveal direction="up"` with slight CSS rotate (-1deg → 0deg) on reveal — organic "unfurl"
- Section dividers: minimalist botanical line SVG (single leaf/branch) via `DrawPath`
- Timeline: vertical SVG line "grows" downward — use `DrawPath` with long stroke
- Gallery: `Stagger` with photos scaling in from 0.92 → 1 (bloom effect)

**New CSS additions:**
- `.bg-section-sand` — warm sand bg
- `.bg-section-sage` — subtle sage green tint (#E8F0E8)
- `.bg-section-charcoal` — rich charcoal bg with sand text
- `.bg-botanical-frame` — terracotta double-border for portrait photos
- Organic ease: 0.9s reveal duration (slightly slower than other templates)

**Step: Verify + Commit**

```bash
git add src/templates/botanical-garden.ts src/components/templates/botanical-garden/
git commit -m "feat: redesign Botanical Garden as Terra Botanica

- Deep emerald + terracotta + warm sand palette
- Cormorant Garamond + Outfit typography
- Diagonal clipPath hero reveal, botanical DrawPath frames
- Ember glow particles, organic unfurl card reveals"
```

---

## Phase 6: Final Verification

### Task 7: Full build verification, test fixes, and visual review

**Step 1: Run full check suite**

```bash
pnpm check --write
pnpm exec tsc --noEmit
pnpm test --run
pnpm build
```

**Step 2: Fix any test assertions**

Template tests may have hardcoded color values or token expectations — update to match new palettes.

**Step 3: Commit any fixes**

```bash
git commit -m "fix: update tests for new template palettes"
```
