# V3 Proposal: Bold Minimalist
### Designer Alpha -- Swiss Design Meets Luxury Wedding

**Philosophy**: Strip everything back to its bones. Massive type, radical whitespace, precise geometry. Let content breathe at billboard scale. Then introduce cultural elements not as decoration but as *structural form* -- the 囍 is not a watermark at 3% opacity, it is a 40vw typographic event. Aurora gradients replace flat backgrounds. Spotlight follows the cursor. Cards exist in 3D space. Every section earns its scroll.

---

## 1. Color Palette

The current palette is warm but forgettable. It reads "template." The fix: push contrast harder, introduce a true black, make crimson *electric*, and add a single unexpected accent (deep indigo) for dark sections that breaks the "wedding beige" expectation.

### Primary Palette

| Token | Current | Proposed | Usage |
|-------|---------|----------|-------|
| `--dm-bg` | `#FFFAF3` | `#FAFAF8` | Page background. Cooler warm-white. Less yellow, more architectural. |
| `--dm-surface` | `#FFFFFF` | `#FFFFFF` | Card surfaces. Pure white creates stronger contrast against bg. |
| `--dm-surface-muted` | `#F5F2EE` | `#F3F2EF` | Alternating sections. Barely-there warmth. |
| `--dm-ink` | `#1A1512` | `#0A0A0A` | Near-black. Swiss design demands maximum contrast. |
| `--dm-muted` | `#6B5744` | `#57534E` | Body text. Stone gray, less brown, more neutral luxury. |
| `--dm-border` | `#E8DECE` | `#E5E2DD` | Borders. Sharper, less yellowed. |

### Accent Colors

| Token | Current | Proposed | Usage |
|-------|---------|----------|-------|
| `--dm-crimson` | `#C41E3A` | `#DC2626` | Primary CTA. Brighter, more electric red. Higher energy. |
| `--dm-crimson-deep` | `#9B1B30` | `#B91C1C` | Hover state. Still rich but more saturated. |
| `--dm-crimson-soft` | `#FDE8EC` | `#FEE2E2` | Soft bg wash. |
| `--dm-gold` | `#D4AF37` | `#CA8A04` | Gold. Deeper, less brassy, more luxe. Think Cartier, not costume. |
| `--dm-gold-warm` | `#C5943A` | `#A16207` | Gold hover/deep. |
| `--dm-gold-soft` | `#FDF5E0` | `#FEF9C3` | Gold wash bg. Lighter, more luminous. |
| `--dm-rose` | `#D46B66` | `#E11D48` | Rose. Currently muted to nothing. Push to vibrant rose-red. |
| `--dm-sage` | `#8FA68E` | `#65A30D` | Sage. Brighter, more alive. Used sparingly for success/nature. |

### New Token: Deep Section

| Token | Hex | Usage |
|-------|-----|-------|
| `--dm-void` | `#09090B` | Dark section bg. True near-black with blue undertone. |
| `--dm-void-surface` | `#18181B` | Elevated cards in dark sections. |
| `--dm-void-text` | `#FAFAFA` | Text on dark sections. |
| `--dm-void-muted` | `#A1A1AA` | Muted text on dark. |

### Aurora Gradient Tokens (New)

```css
--dm-aurora-1: radial-gradient(ellipse at 20% 50%, rgba(220, 38, 38, 0.08) 0%, transparent 50%);
--dm-aurora-2: radial-gradient(ellipse at 80% 20%, rgba(202, 138, 4, 0.06) 0%, transparent 50%);
--dm-aurora-3: radial-gradient(ellipse at 50% 80%, rgba(225, 29, 72, 0.05) 0%, transparent 50%);
```

These stack on top of section backgrounds to create depth without images.

---

## 2. Typography System

### Font Stack (Keep Existing, Reweight)

| Role | Font | Weight | Notes |
|------|------|--------|-------|
| Display / Hero | Playfair Display | 700-900 | Push to Black (900) for hero. Maximum impact. |
| Section Headings | Playfair Display | 600-700 | Semibold for sections. |
| Body | Inter | 400-500 | Clean, high legibility. |
| Accent / Kickers | Cormorant Garamond | 400 italic | Editorial flourish for taglines. |
| Chinese Display | Noto Serif SC | 700-900 | Cultural kickers, 囍, and bilingual moments. |

### Type Scale (Aggressive)

The current hero tops out at `clamp(3.5rem, 8vw + 1rem, 8.5rem)`. This is fine for normal sites. We are not building a normal site. We are building something that makes people screenshot and share.

```css
/* V3 Bold Minimalist Type Scale */
--text-hero:        clamp(4.5rem, 12vw + 1rem, 11rem);
--text-hero-accent: clamp(5rem, 14vw + 1rem, 13rem);    /* For the italic emphasis word */
--text-section:     clamp(2.5rem, 6vw + 0.5rem, 5.5rem);
--text-subsection:  clamp(1.75rem, 3vw + 0.5rem, 3rem);
--text-kicker-cn:   clamp(1.5rem, 2.5vw + 0.25rem, 2.5rem);
--text-kicker-en:   clamp(0.6875rem, 0.5vw + 0.5rem, 0.8125rem);
--text-card-title:  clamp(1.25rem, 2vw + 0.25rem, 1.75rem);
--text-lg:          clamp(1.0625rem, 1vw + 0.25rem, 1.25rem);
--text-base:        1rem;
--text-sm:          0.875rem;
--text-xs:          0.75rem;

/* Tracking */
--tracking-hero:    -0.04em;       /* Tight for massive type */
--tracking-section: -0.03em;
--tracking-kicker:  0.2em;         /* Wide for uppercase labels */
--tracking-display: -0.025em;
```

### Key Typographic Moves

1. **Hero headline at 11rem desktop**: The word "remember" in italic Playfair at `--text-hero-accent` creates a visual event. Line height 0.95 for the hero (letters nearly touching).

2. **Chinese kickers at 2.5rem**: Currently buried at small sizes. Push them to be *co-equal* with English section headings. "四款精选" at 2.5rem next to "THE COLLECTION" at 0.8125rem creates a deliberate hierarchy inversion that signals cultural confidence.

3. **Section headlines with mixed weight**: "Everything you need." in Playfair 600, followed by "Nothing you don't." in Cormorant Garamond 400 italic. Weight contrast within one headline.

---

## 3. Hero Section Design

### Layout: Full-Viewport Split with Floating 3D Card

The hero is the single most important moment. Current state: standard left-copy + right-image layout. Safe. Forgettable.

**Proposed structure:**

```
+------------------------------------------------------------------+
|  [full viewport, min-h-svh]                                       |
|                                                                    |
|  +-Aurora gradient background (3 radial layers)-+                 |
|  |                                              |                 |
|  |  [Chinese kicker: "喜事来了" at 2rem]         |                 |
|  |  [EN kicker pill: "AI-POWERED INVITATIONS"]  |                 |
|  |                                              |                 |
|  |  Beautiful invitations                       |                 |
|  |  your guests will                            |                 |
|  |  *remember.*  <-- 13rem italic, crimson      |                 |
|  |                                              |                 |
|  |  [body copy, max-w-[52ch]]                   |                 |
|  |                                              |                 |
|  |  [CTA: Moving Border Button]  [Ghost CTA]   |                 |
|  |                                              |                 |
|  |  [trust line: Free to start / No cc / 3min]  |                 |
|  |                                              |                 |
|  |           [3D FLOATING CARD]                 |                 |
|  |           [perspective tilt + hover]         |                 |
|  |           [glow underneath]                  |                 |
|  |                                              |                 |
|  +----------------------------------------------+                 |
|                                                                    |
|  [Scroll indicator: animated chevron]                              |
+------------------------------------------------------------------+
```

### Hero: Centered Layout (Not Split)

Switch from the current left-right split to a **centered editorial layout**. Copy stacks above the floating card. This is the Swiss design move: center-axis alignment with extreme whitespace.

On mobile, this naturally collapses to a single column. On desktop, the card floats below the headline with a perspective tilt, creating depth.

### Hero Background: Aurora Effect

Three stacked radial gradients that shift very subtly on scroll (GSAP ScrollTrigger, 0-2% background-position change). Creates a living, breathing background.

```tsx
// Aurora background layers
<div className="absolute inset-0" style={{
  background: `
    radial-gradient(ellipse 80% 50% at 20% 40%, rgba(220,38,38,0.07) 0%, transparent 60%),
    radial-gradient(ellipse 60% 70% at 80% 20%, rgba(202,138,4,0.05) 0%, transparent 50%),
    radial-gradient(ellipse 70% 60% at 50% 90%, rgba(225,29,72,0.04) 0%, transparent 55%)
  `
}} />
```

GSAP config for aurora movement (desktop only, killed on reduced-motion):
```ts
gsap.to('.aurora-layer', {
  backgroundPosition: '+=3% +=2%',
  duration: 8,
  repeat: -1,
  yoyo: true,
  ease: 'sine.inOut',
});
```

### Hero: 3D Floating Card

Keep the existing `use3DTilt` hook but enhance:
- Add a **radial glow** beneath the card that follows the tilt angle
- Add **glassmorphic reflection** bar at the bottom of the card (CSS only)
- Card enters with `gsap.from({ y: 60, rotateX: 15, opacity: 0 }, { duration: 1.2, ease: 'power3.out' })`
- On mobile: static card with subtle shadow, no tilt

```css
.hero-card-glow {
  position: absolute;
  bottom: -20%;
  left: 10%;
  right: 10%;
  height: 60%;
  background: radial-gradient(ellipse at center, rgba(220, 38, 38, 0.15) 0%, transparent 70%);
  filter: blur(40px);
  pointer-events: none;
  z-index: -1;
}
```

### Hero: Entrance Sequence (GSAP Timeline)

Not generic fade-ups. A choreographed sequence:

```ts
const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

heroTl
  // 1. Chinese kicker slides in from left with clip-path
  .fromTo('.hero-kicker-cn',
    { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
    { clipPath: 'inset(0 0% 0 0)', opacity: 1, duration: 0.6 }
  )
  // 2. English kicker fades
  .fromTo('.hero-kicker-en',
    { opacity: 0, x: -12 },
    { opacity: 1, x: 0, duration: 0.4 },
    '-=0.2'
  )
  // 3. Headline words reveal line-by-line with y offset
  .fromTo('.hero-line',
    { opacity: 0, y: 40 },
    { opacity: 1, y: 0, duration: 0.7, stagger: 0.12 },
    '-=0.1'
  )
  // 4. Italic accent word scales from 0.9 with color
  .fromTo('.hero-accent-word',
    { opacity: 0, scale: 0.92 },
    { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.2)' },
    '-=0.3'
  )
  // 5. Body text and CTAs fade in
  .fromTo('.hero-body, .hero-ctas',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
    '-=0.2'
  )
  // 6. Card rises from below with perspective
  .fromTo('.hero-card',
    { opacity: 0, y: 80, rotateX: 12 },
    { opacity: 1, y: 0, rotateX: 0, duration: 1.0, ease: 'power4.out' },
    '-=0.4'
  );
```

Total sequence: ~2.0s. Under the 2.0s LCP requirement because text content is visible by ~0.8s; the card image is lazy-positioned below the fold on mobile.

---

## 4. Section Layout and Transitions (All 8 Sections)

### Section Architecture

The current page has no visual rhythm. Every section is `py-24 px-6` with the same `--dm-bg` background. Monotone.

**V3 approach**: Alternate between three surface types with distinct geometric transitions between them.

| # | Section | Background | Type |
|---|---------|-----------|------|
| 1 | Hero | `--dm-bg` + aurora gradients | Light |
| 2 | Social Proof | `--dm-void` (dark) | Dark |
| 3 | Showcase | `--dm-bg` | Light |
| 4 | How It Works | `--dm-surface-muted` | Muted |
| 5 | Features | `--dm-bg` | Light |
| 6 | Pricing | `--dm-bg` + gold aurora | Light-accent |
| 7 | Final CTA | `--dm-void` (dark) | Dark |
| 8 | Footer | `--dm-bg` | Light |

### Transition: Diagonal Clip-Path Wipe

Between contrasting sections (light-to-dark, dark-to-light), use a diagonal clip-path that animates on scroll.

```css
.section-transition-diagonal {
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - 6vw), 0 100%);
}
```

The receiving section has an inverse clip to create a seamless diagonal handoff. This is controlled by GSAP ScrollTrigger scrub:

```ts
gsap.fromTo('.section-clip-enter', {
  clipPath: 'polygon(0 6vw, 100% 0, 100% 100%, 0 100%)',
}, {
  clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
  ease: 'none',
  scrollTrigger: {
    trigger: '.section-clip-enter',
    start: 'top 80%',
    end: 'top 30%',
    scrub: 0.5,
  },
});
```

### Section Padding Scale

```css
/* Vertical rhythm -- generous, editorial whitespace */
--section-py-sm:  clamp(4rem, 8vw, 8rem);      /* Compact sections (Social Proof) */
--section-py-md:  clamp(5rem, 10vw, 10rem);     /* Standard sections */
--section-py-lg:  clamp(6rem, 14vw, 14rem);     /* Hero-level sections (CTA) */
--section-px:     clamp(1.25rem, 4vw, 3rem);    /* Horizontal padding */
--max-w-content:  72rem;                         /* 1152px max content width */
--max-w-narrow:   48rem;                         /* 768px for text-heavy sections */
```

---

### Section-by-Section Breakdown

#### S1: Hero
See Section 3 above. Centered layout, aurora bg, 3D card, GSAP entrance timeline.

#### S2: Social Proof (Dark Section)

**Current**: Pink-ish bg with stats and a testimonial. Forgettable.

**V3**: Full-dark section (`--dm-void`). Stats displayed as **massive numbers** (each stat is `clamp(3rem, 8vw, 6rem)` in Playfair Display Black). Layout: three stats in a row separated by thin vertical gold lines (1px, 60% height, `--dm-gold` at 20% opacity).

Below: testimonial in Cormorant Garamond italic at `clamp(1.25rem, 2.5vw, 1.75rem)`, with a crimson left-border accent (4px solid `--dm-crimson`). Attribution in small-caps Inter.

GSAP: Stats count-up on scroll-trigger (keep existing `useCountUp` hook). Each stat has a subtle `y: 30 -> 0` with 0.15s stagger.

Transition into this section: diagonal clip-path from hero.

#### S3: Showcase (Template Gallery)

**Current**: Crimson bg with 2x2 masonry grid. The crimson bg is too monochrome.

**V3**: Return to light bg (`--dm-bg`). Templates displayed in a **horizontal scroll track** with snap points. Each template card is a tall 9:16 phone-shaped frame with rounded corners, floating in 3D space with perspective.

```
+----+  +----+  +----+  +----+
|    |  |    |  |    |  |    |
|    |  |    |  |    |  |    |
| T1 |  | T2 |  | T3 |  | T4 |
|    |  |    |  |    |  |    |
|    |  |    |  |    |  |    |
+----+  +----+  +----+  +----+
  <--- horizontal scroll, snap --->
```

Each card:
- `width: min(300px, 75vw)` on mobile, `340px` on desktop
- `border-radius: 2rem`
- `box-shadow: 0 25px 60px -12px rgba(0,0,0,0.12)`
- On hover (desktop): card lifts 8px, shadow deepens, subtle scale(1.02)
- Template name + cultural badge overlaid at bottom with glass blur

GSAP: Each card enters with a **stagger from right** as scroll position reaches the section. `x: 60 -> 0, opacity: 0 -> 1, stagger: 0.15`.

Section header: "四款精选" Chinese kicker at 2.5rem above "Four templates. One for every love story."

#### S4: How It Works (Timeline)

**Current**: Vertical timeline with gold thread SVG stroke animation. Good concept, needs amplification.

**V3**: Keep the vertical timeline but make each step a **full-width card that scales into view**. The golden thread SVG stroke-draw on scroll stays (it is excellent). Enhancement:

- Step numbers: `clamp(3rem, 5vw, 4.5rem)` in Playfair Display, `--dm-gold` at 15% opacity, positioned as large watermarks behind each card
- Cards: `bg-[var(--dm-surface)]`, `border-radius: 1.5rem`, `border: 1px solid var(--dm-border)`
- Each card enters with GSAP `scale: 0.95 -> 1, opacity: 0 -> 1, y: 40 -> 0` scrubbed to scroll position
- Active step (currently in viewport center): gold left-border highlight, step number transitions from gold-soft to gold-solid

```ts
// Per-step scroll-triggered entrance
TIMELINE_STEPS.forEach((_, i) => {
  gsap.fromTo(`.step-${i}`, {
    opacity: 0,
    y: 50,
    scale: 0.96,
  }, {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.6,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: `.step-${i}`,
      start: 'top 85%',
      end: 'top 55%',
      scrub: 0.3,
    },
  });
});
```

#### S5: Features

**Current**: Two-column layout with feature list left, phone mockup right. Wrapped in a muted card. Functional but flat.

**V3**: **Bento grid layout**. Instead of a flat list, arrange features in a 3x3 bento grid where each cell has a different size:

```
+------------------+--------+
|                  |        |
|   AI-POWERED     | RSVP   |
|   (large card,   |(small) |
|    2x1 span)     |        |
+--------+---------+--------+
|        |                  |
|WHATSAPP|  CHINESE WEDDING |
|(small) |  (large, 2x1     |
|        |   span, crimson  |
|        |   accent bg)     |
+--------+---------+--------+
|                  |        |
| DASHBOARD        | MOBILE |
| (2x1 span)      |(small) |
+------------------+--------+
```

Each bento cell:
- `border-radius: 1.5rem`
- `border: 1px solid var(--dm-border)`
- `background: var(--dm-surface)`
- Feature icon: 48x48px, centered top of cell, `color: var(--dm-crimson)`
- The "Chinese Wedding" cell gets a special treatment: `background: var(--dm-crimson-soft)`, icon is the 囍 character at 2rem

GSAP: Cards animate in with **randomized delay** (not sequential stagger, feels more organic):
```ts
gsap.fromTo('.bento-card', {
  opacity: 0,
  y: 40,
  scale: 0.95,
}, {
  opacity: 1,
  y: 0,
  scale: 1,
  duration: 0.6,
  ease: 'power2.out',
  stagger: {
    amount: 0.6,
    from: 'random',
  },
  scrollTrigger: {
    trigger: '.bento-grid',
    start: 'top 75%',
  },
});
```

#### S6: Pricing

**Current**: Two-column free/premium cards on gold-soft bg. Competent but safe.

**V3**: Keep the two-card layout but add drama:

- Premium card: **Moving border effect** (animated gradient border that rotates). See Standout Component #2 below.
- Premium card: Slight `rotateY(-2deg)` default tilt, straightens on hover (CSS transform, not GSAP).
- Price number: GSAP CountUp with custom easing (`power2.out`), triggered on scroll.
- Free card: flat, minimal. The contrast makes premium feel worth it.
- Background: light bg with subtle gold aurora gradient, not the current flat gold-soft.

#### S7: Final CTA (Dark Section)

**Current**: Dark bg with gold particles, calligraphy reveal, 囍 watermark at 3% opacity. Decent atmosphere but no standout moment.

**V3**: This section gets the **spotlight cursor effect** (see Standout Component #3). The section is `--dm-void` background. As the user moves their cursor, a radial light (200px radius, crimson-gold gradient, 10% opacity) follows, revealing a subtle lattice pattern underneath.

The 囍 character: **push to 40vw**, `--dm-gold` at 8% opacity. It should be unmistakably visible. This is not a watermark -- it is a graphic element.

CTA button: **Moving border button** with gold gradient (see Standout Component #2).

Headline: "Create an invitation your guests will *treasure.*" -- the word "treasure" uses the `--text-hero-accent` scale at `clamp(3rem, 7vw, 6rem)`, crimson italic.

GSAP entrance: the 囍 character scales from 0.8 to 1.0 and rotates from -5deg to 0deg on scroll, giving it a "settling in" feel.

```ts
gsap.fromTo('.cta-xi', {
  scale: 0.8,
  rotation: -5,
  opacity: 0,
}, {
  scale: 1,
  rotation: 0,
  opacity: 0.08,
  duration: 1.5,
  ease: 'power2.out',
  scrollTrigger: {
    trigger: '.final-cta',
    start: 'top 70%',
  },
});
```

#### S8: Footer

**Current**: Simple centered footer. Fine.

**V3**: Minimal change. Add a horizontal gold rule (`dm-gold-rule`) at the top. Increase the 囍 flanking the brand name to `1.5rem` at 40% opacity (currently 1.25rem at 60% -- up the size, reduce opacity for subtlety). Add a very subtle aurora gradient on the bg to connect it to the hero visually (bookend effect).

---

## 5. Animation Strategy

### Philosophy: No More Generic Fade-Ups

The current `animation.ts` defines exactly three motion variants: `sectionReveal` (opacity+y:24), `childReveal` (opacity+y:16), and `mockupReveal` (opacity+scale). Every section uses the same pattern. This is the #1 reason the page feels flat.

**V3 Rule**: Every section gets its *own* entrance choreography. No two sections animate the same way.

### GSAP vs Motion Split

| Use GSAP For | Use Motion (Framer) For |
|--------------|------------------------|
| Scroll-triggered animations (ScrollTrigger) | Hover states |
| Complex timelines (hero sequence) | Simple entrance animations (whileInView) |
| Scrub-linked progress (stroke-draw, clip-path) | Layout animations (AnimatePresence) |
| Counter animations | Shared layout transitions |
| Parallax effects | Button micro-interactions |

### Animation Configs by Section

```ts
// V3 Animation Presets
export const V3_GSAP = {
  // Hero entrance timeline (see Section 3)
  hero: {
    clipReveal:  { duration: 0.6, ease: 'power3.out' },
    lineReveal:  { duration: 0.7, ease: 'power3.out', stagger: 0.12 },
    accentScale: { duration: 0.8, ease: 'back.out(1.2)' },
    cardRise:    { duration: 1.0, ease: 'power4.out' },
  },

  // Section entrances (ScrollTrigger)
  sections: {
    statCountUp: { duration: 2.0, ease: 'power2.out' },
    cardStagger: { duration: 0.6, ease: 'power2.out', stagger: 0.15 },
    bentoRandom: { duration: 0.6, ease: 'power2.out', stagger: { amount: 0.6, from: 'random' } },
    timelineStep: { duration: 0.6, ease: 'power3.out', scrub: 0.3 },
    clipWipe:     { ease: 'none', scrub: 0.5 },
  },

  // Ambient (looping, low-CPU)
  ambient: {
    auroraShift:  { duration: 8, repeat: -1, yoyo: true, ease: 'sine.inOut' },
    particleFloat: { duration: 6, repeat: -1, yoyo: true, ease: 'sine.inOut' },
    xiSettle:     { duration: 1.5, ease: 'power2.out' },
  },
} as const;

// Motion (Framer) Presets
export const V3_MOTION = {
  // Hover states for cards
  cardHover: {
    scale: 1.02,
    y: -8,
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] },
  },

  // Simple whileInView for elements that don't need GSAP
  fadeInUp: {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },

  // Stagger container
  staggerContainer: {
    animate: { transition: { staggerChildren: 0.08 } },
  },
} as const;
```

### ScrollTrigger Configuration

All ScrollTrigger instances follow this pattern:
```ts
scrollTrigger: {
  trigger: element,
  start: 'top 80%',     // begins when top of element hits 80% viewport
  end: 'top 40%',       // completes when top hits 40% viewport
  scrub: 0.3,           // smooth scrub for progress-linked
  // OR
  toggleActions: 'play none none none',  // for one-shot animations
}
```

### Reduced Motion

All GSAP animations wrapped in:
```ts
if (reducedMotion) {
  gsap.set(elements, { opacity: 1, y: 0, scale: 1, rotation: 0 });
  return;
}
```

All Motion variants gated:
```tsx
initial={reducedMotion ? false : 'hidden'}
```

Global CSS catch-all already exists (good):
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 6. Standout Components (4 Signature Pieces)

### 6.1 Aurora Background

A component that renders 3-4 stacked radial gradients with optional subtle GSAP animation.

```tsx
interface AuroraBackgroundProps {
  children: React.ReactNode;
  className?: string;
  animated?: boolean;     // Enable GSAP ambient shift
  intensity?: 'subtle' | 'medium' | 'bold';
}

// Intensity maps:
// subtle:  rgba values at 0.03-0.05
// medium:  rgba values at 0.05-0.08 (default)
// bold:    rgba values at 0.08-0.12
```

CSS implementation:
```css
.aurora-bg {
  position: relative;
  isolation: isolate;
}

.aurora-bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 50% at 20% 40%, rgba(220,38,38,0.07) 0%, transparent 60%),
    radial-gradient(ellipse 60% 70% at 80% 20%, rgba(202,138,4,0.05) 0%, transparent 50%),
    radial-gradient(ellipse 70% 60% at 50% 90%, rgba(225,29,72,0.04) 0%, transparent 55%);
  pointer-events: none;
  z-index: -1;
}
```

Used in: Hero (animated), Pricing (static, gold-weighted), Final CTA (dark variant with `--dm-crimson` and `--dm-gold`).

Performance: Pure CSS gradients. No images, no canvas. GPU-composited. The GSAP animation only changes `background-position`, which is a composited property. Total cost: ~0.

### 6.2 Moving Border Button

An Aceternity UI-inspired button where the border is an animated conic gradient that rotates continuously.

```tsx
function MovingBorderButton({ children, className }: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="relative inline-flex overflow-hidden rounded-full p-[2px]">
      {/* Rotating gradient border */}
      <span
        className="absolute inset-[-200%] animate-[spin_3s_linear_infinite]"
        style={{
          background: 'conic-gradient(from 0deg, transparent 0 240deg, var(--dm-crimson) 260deg 300deg, transparent 320deg 360deg)',
        }}
      />
      {/* Inner button */}
      <span className={cn(
        'relative z-10 inline-flex items-center justify-center rounded-full px-8 py-4',
        'bg-[var(--dm-void)] text-white font-medium text-sm tracking-[0.05em]',
        'hover:bg-[var(--dm-void-surface)] transition-colors duration-300',
        className,
      )}>
        {children}
      </span>
    </div>
  );
}
```

CSS keyframe:
```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

Used for: Primary CTA in Hero, Upgrade CTA in Pricing (gold variant), CTA in Final CTA section.

Variant: Gold border for Pricing (`conic-gradient` uses `--dm-gold` instead of `--dm-crimson`).

Performance: Single CSS animation on a pseudo-element. No JS. `will-change: transform` on the gradient layer. Composited on GPU.

Reduced motion: replace with static 2px solid `--dm-crimson` border.

### 6.3 Spotlight Cursor Effect

Desktop-only (gated behind `pointer: fine` media query). A radial gradient light follows the cursor position within a section, revealing a subtle pattern underneath.

```tsx
function useSpotlight(sectionRef: RefObject<HTMLElement>, options?: {
  size?: number;       // px radius, default 250
  color?: string;      // default 'rgba(220, 38, 38, 0.08)'
  reducedMotion?: boolean;
}) {
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || options?.reducedMotion) return;

    const isDesktop = window.matchMedia('(pointer: fine)').matches;
    if (!isDesktop) return;

    const size = options?.size ?? 250;
    const color = options?.color ?? 'rgba(220, 38, 38, 0.08)';

    // Create spotlight element
    const spotlight = document.createElement('div');
    spotlight.style.cssText = `
      position: absolute;
      width: ${size * 2}px;
      height: ${size * 2}px;
      border-radius: 50%;
      background: radial-gradient(circle, ${color} 0%, transparent 70%);
      pointer-events: none;
      z-index: 1;
      opacity: 0;
      transition: opacity 0.3s ease;
      will-change: transform;
    `;
    section.style.position = 'relative';
    section.appendChild(spotlight);

    let raf: number;
    const onMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const x = e.clientX - rect.left - size;
        const y = e.clientY - rect.top - size;
        spotlight.style.transform = `translate(${x}px, ${y}px)`;
        spotlight.style.opacity = '1';
      });
    };

    const onMouseLeave = () => {
      spotlight.style.opacity = '0';
    };

    section.addEventListener('mousemove', onMouseMove);
    section.addEventListener('mouseleave', onMouseLeave);

    return () => {
      cancelAnimationFrame(raf);
      section.removeEventListener('mousemove', onMouseMove);
      section.removeEventListener('mouseleave', onMouseLeave);
      spotlight.remove();
    };
  }, [sectionRef, options?.reducedMotion, options?.size, options?.color]);
}
```

Used in: Final CTA (dark section). The spotlight reveals the lattice pattern underneath, creating a "discover" moment as users mouse over the section.

Performance: Single `requestAnimationFrame` per mousemove. `will-change: transform` on the spotlight div. No paint operations (only transform + opacity). Cost: negligible.

Mobile fallback: spotlight is disabled. The lattice pattern is visible at a static 5% opacity instead.

### 6.4 Perspective Card Stack (Showcase)

For the template showcase, cards are arranged with CSS `perspective` and slight `rotateY` offsets, creating a fanned-out deck effect.

```tsx
function PerspectiveCardStack({ templates }: { templates: Template[] }) {
  return (
    <div
      className="relative flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 -mx-6 px-6 lg:justify-center lg:overflow-visible"
      style={{ perspective: '1200px' }}
    >
      {templates.map((t, i) => {
        // Fan angle: -6, -2, 2, 6 degrees
        const angle = (i - (templates.length - 1) / 2) * 4;
        return (
          <div
            key={t.id}
            className="flex-shrink-0 snap-center"
            style={{
              transform: `rotateY(${angle}deg)`,
              transformOrigin: 'center bottom',
              transition: 'transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)',
              width: 'min(300px, 75vw)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'rotateY(0deg) translateY(-8px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = `rotateY(${angle}deg)`;
            }}
          >
            {/* Card content: 9:16 image, glass overlay, template name */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-[0_25px_60px_-12px_rgba(0,0,0,0.12)]">
              <div className="aspect-[9/16]">
                <img
                  src={t.photo}
                  alt={`${t.title} template`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
            <p className="mt-3 text-center font-display text-base font-semibold"
               style={{ color: 'var(--dm-ink)' }}>
              {t.title}
            </p>
          </div>
        );
      })}
    </div>
  );
}
```

On mobile: the perspective fan is disabled (all `rotateY(0)`), becoming a horizontal scroll with snap. This is the natural fallback and works perfectly for touch.

On desktop: the fanned cards create a striking visual. Hover straightens and lifts the card. GSAP entrance: each card slides in from `x: 80, rotateY: angle + 15` on scroll trigger.

---

## 7. Cultural Element Integration

### The Problem

Current cultural elements are invisible:
- `DoubleHappiness` at `opacity: 0.03` -- no human can see this
- `PeonyOutline` at `opacity: 0.06` -- a ghost
- `LatticeOverlay` at `opacity: 0.04` -- might as well not exist

This is cultural decoration anxiety: "we need Chinese elements but we're scared they'll look kitschy." The solution is not lower opacity. The solution is **better design integration**.

### 囍 (Double Happiness) -- Make It Structural

**Hero**: Remove the 0.03 opacity watermark. Instead, place 囍 as a **typographic element** in the kicker line. `font-size: 1.5rem`, `color: var(--dm-crimson)`, `opacity: 1.0`. It earns its place as content, not decoration.

**Final CTA**: Push 囍 to `font-size: clamp(12rem, 40vw, 28rem)`, `opacity: 0.06-0.08`, `color: var(--dm-gold)`. At this scale, even low opacity is visible and impactful. The character becomes the background graphic of the section.

**Footer**: Flanking 囍 at 1.5rem, opacity 0.5. Small, confident, purposeful.

### Peony -- Clip-Path Reveal on Scroll

Replace the static ghostly SVG with a GSAP-driven reveal. The peony SVG stays at `opacity: 0.08` (higher than current 0.06) but is revealed via `clip-path: circle()` that expands as the user scrolls.

```ts
gsap.fromTo('.peony-reveal', {
  clipPath: 'circle(0% at 50% 50%)',
}, {
  clipPath: 'circle(50% at 50% 50%)',
  ease: 'power2.out',
  scrollTrigger: {
    trigger: '.peony-reveal',
    start: 'top 70%',
    end: 'top 20%',
    scrub: 0.5,
  },
});
```

This creates a blooming effect that is:
- Free tier GSAP (clip-path is animatable by GSAP without plugins)
- Culturally meaningful (a flower blooming)
- Visually impactful (movement draws the eye even at low opacity)

### Lattice Pattern -- Spotlight Reveal

In the Final CTA (dark section), the lattice pattern sits at `opacity: 0.06` -- invisible until the cursor spotlight passes over it, revealing the geometry. This creates a "discovery moment." The lattice is always present structurally but only visible when illuminated.

On mobile where spotlight is disabled, the lattice is shown at a static `opacity: 0.04` as a background texture (unchanged from current but the dark bg makes it more visible).

### Chinese Kickers -- Big, Bold, Bilingual

Every section kicker becomes bilingual:

| Section | English Kicker | Chinese Kicker | CN Size |
|---------|---------------|----------------|---------|
| Showcase | THE COLLECTION | 四款精选 | `clamp(1.5rem, 2.5vw, 2.5rem)` |
| How It Works | THE PROCESS | 五步成礼 | `clamp(1.5rem, 2.5vw, 2.5rem)` |
| Features | WHY DREAMMOMENTS | 为何选择 | `clamp(1.5rem, 2.5vw, 2.5rem)` |
| Pricing | SIMPLE PRICING | 简单定价 | `clamp(1.5rem, 2.5vw, 2.5rem)` |
| Final CTA | YOUR MOMENT | 爱情故事 | `clamp(1.5rem, 2.5vw, 2.5rem)` |

The Chinese is displayed **above** the English kicker, in `Noto Serif SC` weight 700, `color: var(--dm-crimson)` (or `var(--dm-gold)` on dark sections). The English kicker sits below in Inter 500, 0.8125rem, uppercase tracking-wide.

This inversion -- Chinese first, larger -- is the cultural confidence move. It says "this product is FOR Chinese couples" without being a theme slapped on top.

### Paper-Cut Edges -- Keep and Enhance

The existing `PaperCutEdge` component is well-implemented. Keep it. Use it between:
- Hero -> Social Proof (inverted, dark receives)
- Showcase -> How It Works (light to muted)

Increase the scallop amplitude slightly: change `80%` to `75%` in the clip-path polygon for deeper cuts.

### Calligraphy Stroke Reveal -- Keep

The existing `CalligraphyReveal` in Final CTA is good. Keep it. Ensure it triggers on scroll, not on page load.

---

## 8. Mobile-Specific Design

### Core Principle

75-85% of traffic is mobile. Every design decision is mobile-first. Desktop is the enhancement, not the baseline.

### Mobile Type Scale

The `clamp()` expressions handle scaling, but for clarity:

| Element | 375px screen | 768px screen | 1440px screen |
|---------|-------------|-------------|---------------|
| Hero headline | 4.5rem (72px) | ~7.5rem | 11rem (176px) |
| Hero accent | 5rem (80px) | ~8.5rem | 13rem (208px) |
| Section heading | 2.5rem (40px) | ~4rem | 5.5rem (88px) |
| Chinese kicker | 1.5rem (24px) | ~2rem | 2.5rem (40px) |
| Body text | 1rem (16px) | 1.0625rem | 1.25rem (20px) |

At 375px, the hero headline at 72px is dramatically larger than the current ~56px. It will occupy 3-4 lines. This is intentional -- editorial typography *breathes* on mobile.

### Mobile Layout Adjustments

| Component | Desktop | Mobile |
|-----------|---------|--------|
| Hero | Centered, card below text | Stacked, card below fold |
| Showcase cards | Perspective fan | Horizontal scroll + snap |
| Features bento | 3-column grid | Single column stack |
| Pricing | Side-by-side | Stacked, premium first |
| Timeline | Cards with step numbers | Same, slightly smaller padding |
| Social Proof stats | Row with dividers | Stacked column |
| Spotlight cursor | Active | Disabled |
| Moving border | Active | Active (CSS-only, no perf cost) |
| Aurora animation | Active (GSAP) | Static (no GSAP animation) |
| 3D tilt | Active | Disabled |
| Diagonal clip-path | Active | Simplified to horizontal (clip-path: polygon straight line) |

### Mobile Performance Budget

| Metric | Target | Strategy |
|--------|--------|----------|
| LCP | < 2.0s | Hero text is pure CSS (no image dependency). Card image below fold. |
| CLS | < 0.05 | All type sizes use clamp (no layout shift). Images have aspect-ratio. |
| INP | < 150ms | No scroll-jacking. CTA buttons have immediate visual feedback. |
| Page weight | < 800KB | 4 template images lazy-loaded. No video. GSAP core ~30KB gzip. |
| JS | < 150KB gzip | GSAP (~30KB) + Motion (~20KB) + React (~40KB) + app (~30KB). |

### Mobile Touch Targets

All interactive elements: `min-height: 48px` (up from the current 44px on key CTAs). Padding zones around links: `min 8px` tap buffer.

### Mobile-Specific Animations

On mobile, GSAP ambient animations (aurora shift, particle float) are **disabled**. Only scroll-triggered one-shot animations play. This saves battery and CPU.

```ts
const isMobile = window.matchMedia('(max-width: 768px)').matches;

if (!isMobile && !reducedMotion) {
  // Enable ambient GSAP animations (aurora, particles)
}
```

---

## 9. References and Inspiration

### Primary References

1. **Aceternity UI** (https://ui.aceternity.com)
   - Moving border buttons, aurora backgrounds, spotlight effects
   - Their component library is the direct inspiration for Standout Components 6.1-6.3

2. **Rauno Freiberg's portfolio** (https://rauno.me)
   - Extreme whitespace, precise typography, subtle cursor interactions
   - The philosophy of "every pixel earns its place"

3. **Linear.app landing page** (https://linear.app)
   - Dark section execution with gradient overlays
   - Feature grid with bento-style variable card sizes
   - Scroll-triggered reveals that feel inevitable, not decorative

4. **Stripe Press** (https://press.stripe.com)
   - Editorial typography at scale
   - Mixing serif and sans-serif with confidence
   - Color blocking with strong section transitions

5. **Apple Product Pages** (e.g., Apple Vision Pro, MacBook Pro)
   - Scroll-driven storytelling
   - Type at massive scale that doesn't feel loud
   - Performance-first animation approach

### Cultural References

6. **MUJI** (https://www.muji.com)
   - Japanese minimalism meeting cultural identity
   - Proof that Asian design heritage + modern minimalism = premium perception

7. **Shang Xia** (Hermes x Chinese craft brand)
   - How to present Chinese cultural elements in a luxury context
   - Lattice, paper-cut, and calligraphy as structural design, not decoration

8. **Peninsula Hotel stationery**
   - Gold + crimson in a luxury context
   - How Chinese cultural motifs read as "premium" rather than "traditional"

### Technical References

9. **GSAP ScrollTrigger documentation** (https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
   - All scroll-driven animations use free-tier APIs
   - `scrub`, `pin`, `snap` are all available on the free tier

10. **Motion (Framer Motion) documentation** (https://motion.dev)
    - `whileInView`, `AnimatePresence`, `motion.div` for React integration
    - Used for hover states and simple entrance animations

---

## Implementation Priority

| Phase | Scope | Impact |
|-------|-------|--------|
| P0 (Critical) | New type scale + color palette + Aurora bg | Immediate visual upgrade |
| P1 (High) | Hero GSAP timeline + Moving border button | First-impression impact |
| P2 (High) | Section transitions (clip-path) + Dark Social Proof | Scroll rhythm |
| P3 (Medium) | Showcase perspective cards + Bento features | Section upgrades |
| P4 (Medium) | Spotlight cursor + Cultural element enhancement | Polish + delight |
| P5 (Low) | Mobile-specific animation tuning + perf optimization | Refinement |

---

## File Impact Summary

| File | Changes |
|------|---------|
| `src/styles.css` | Updated CSS custom properties (colors, type scale, aurora, moving-border keyframes) |
| `src/components/landing/animation.ts` | Complete rewrite: V3 GSAP + Motion presets |
| `src/components/landing/Hero.tsx` | Centered layout, GSAP timeline, aurora bg, moving-border CTA |
| `src/components/landing/SocialProof.tsx` | Dark section, massive stat numbers, crimson-bordered testimonial |
| `src/components/landing/Showcase.tsx` | Perspective card stack, horizontal scroll on mobile |
| `src/components/landing/HowItWorks.tsx` | Enhanced timeline with per-step GSAP scroll entrance |
| `src/components/landing/Features.tsx` | Bento grid layout, randomized GSAP entrance |
| `src/components/landing/Pricing.tsx` | Moving border on premium card, gold aurora bg |
| `src/components/landing/FinalCTA.tsx` | Spotlight cursor, 40vw 囍, moving-border CTA |
| `src/components/landing/Footer.tsx` | Minor: aurora bookend, adjusted 囍 size |
| `src/components/landing/motifs/DoubleHappiness.tsx` | No change (usage patterns change, component stays) |
| `src/components/landing/motifs/LatticeOverlay.tsx` | No change (opacity managed by parent) |
| `src/components/landing/motifs/PeonyOutline.tsx` | Add clip-path reveal support |
| `src/components/landing/hooks/use3DTilt.ts` | Add glow effect beneath card |
| `src/components/landing/hooks/useSpotlight.ts` | **New**: cursor spotlight hook |
| `src/components/landing/AuroraBackground.tsx` | **New**: reusable aurora bg component |
| `src/components/landing/MovingBorderButton.tsx` | **New**: animated gradient border button |
| `src/components/landing/PerspectiveCardStack.tsx` | **New**: fanned card showcase component |
| `src/routes/index.tsx` | Updated section composition, mobile detection |

**Estimated new code**: ~600 lines across 3 new components + animation rewrite.
**Estimated modified code**: ~800 lines across 8 existing files.
**Net page weight impact**: +2-3KB CSS, +0KB JS (GSAP already loaded, new components are lightweight).
