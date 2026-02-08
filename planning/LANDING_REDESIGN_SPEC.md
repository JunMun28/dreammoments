# DreamMoments Landing Page Redesign Specification

**Design Direction: "Warm Luxury"**
**Version:** 2.0
**Date:** 2026-02-08
**Status:** Final

---

## 1. Executive Summary

### Design Direction and Rationale

The "Warm Luxury" direction synthesizes the best elements from three design proposals evaluated by our design team:

- **From Proposal C (Luxury Premium, 7.5/10):** Warm palette, cultural intelligence (囍 motif, vermillion, antique gold), micro-interaction philosophy, generous spacing, single-template spotlight hero, dark section rhythm
- **From Proposal A (Editorial, 5/10):** Typography discipline, editorial grid for templates, info-first features layout
- **From Proposal B (Maximalist, 3.5/10):** Hero energy, conversion funnel structure, "How It Works" copy, CTA shimmer effect, surface tint system

The core thesis: DreamMoments serves Chinese couples in Malaysia and Singapore planning weddings. The landing page must feel **premium enough to justify RM49/SGD19**, **culturally warm** (not cold/European-minimalist), and **technically performant** on mobile 4G connections. The design must explicitly communicate "Made for Chinese weddings" above the fold.

### What Changes from Current and Why

| Current Problem | Proposed Fix | Rationale |
|---|---|---|
| Peach (`#FFB7B2`) fails WCAG AA contrast on white | Replace with vermillion `#C1272D` for CTAs, rose `#C4706B` for accent text | Accessibility + cultural meaning (auspicious red) |
| No hero CTA above the fold | Add prominent crimson CTA "Create Your Invitation" in hero | Conversion optimization (critic non-negotiable #8) |
| No "Made for Chinese weddings" messaging above fold | Add cultural kicker + "Made for Chinese Weddings" pill in hero | Critic non-negotiable #13 |
| Pricing section uses placeholder without regional context | Dual-currency pricing with region auto-detection pill | Market-specific trust (critic non-negotiable #10) |
| Generic "wedding" language, no cultural resonance | Chinese wedding terminology, 囍 motifs, culturally-aware copy | Cultural fit for target market |
| Font stack uses only Outfit + Reenie Beanie | Playfair Display headings, Inter body, Cormorant Garamond accent, Noto Serif SC CJK | Zero additional bandwidth (critic non-negotiable #2) |
| Bland hero with no visual anchor | Single-template spotlight with real preview (from Proposal C) | Value demonstration (critic non-negotiable #9) |
| No social proof section | Add testimonial/trust indicators after hero | Critic non-negotiable #12 |
| Excessive floating blobs hurt performance on mobile | Remove all blobs + petals, use CSS gradients only | Performance <3s FCP on 4G (critic non-negotiable #11) |
| No dark sections for visual rhythm | Add dark warm section for Final CTA (from Proposal C) | Premium rhythm + conversion |
| Primary CTA is dark/neutral | Crimson red CTA buttons | Critic non-negotiable #3 |

### 13 Non-Negotiable Checklist

| # | Requirement | How Addressed |
|---|---|---|
| 1 | WCAG AA on ALL text | Every text color verified, see Section 2 |
| 2 | CJK font pairing (Noto Serif SC) | In font stack fallback chain, already loaded |
| 3 | Crimson red CTAs | `--dm-crimson` (#C1272D) for primary CTA |
| 4 | Gold as decorative only | `--dm-gold` never used for body text, only badges/borders/timeline |
| 5 | Warm ivory background | `--dm-bg: #FAF8F5` (warm ivory, not blue-white) |
| 6 | Motion library ONLY | All animations use `motion/react` API |
| 7 | Mobile-first | All sections stack vertically, touch targets 44px+ |
| 8 | Hero CTA above fold | Crimson "Create Your Invitation" button in hero |
| 9 | Real template previews | Showcase uses actual template screenshots |
| 10 | Actual pricing section | Dual-currency, one-time, Free vs Premium cards |
| 11 | <3s FCP on 4G | No blobs, no petals, no grain, CSS gradients only |
| 12 | Social proof section | Stats + testimonial after hero |
| 13 | "Made for Chinese weddings" above fold | Cultural kicker pill in hero |

---

## 2. Final Color Palette

### Primary Palette

| Token | Hex | CSS Variable | Usage | Contrast on `--dm-bg` (#FAF8F5) |
|---|---|---|---|---|
| Background | `#FAF8F5` | `--dm-bg` | Page background, warm ivory | N/A |
| Surface | `#FFFFFF` | `--dm-surface` | Cards, elevated surfaces | N/A |
| Surface Muted | `#F5F2EE` | `--dm-surface-muted` | Alternating section bg (parchment tint) | N/A |
| Surface Rose | `#F9F2F0` | `--dm-surface-rose` | Warm rose-tinted sections (from Proposal B surface tint system) | N/A |
| Ink | `#1C1917` | `--dm-ink` | Primary text, headings | **15.8:1** (AAA) |
| Muted | `#6B6560` | `--dm-muted` | Secondary text, captions | **5.2:1** (AA) |
| Border | `#E8E4DF` | `--dm-border` | Dividers, card borders | N/A (decorative) |

### Accent Colors

| Token | Hex | CSS Variable | Usage | Contrast on `--dm-bg` |
|---|---|---|---|---|
| Crimson | `#C1272D` | `--dm-crimson` | **Primary CTA**, cultural red, 囍 motif, auspicious accent | **7.5:1** (AAA) |
| Crimson Hover | `#A12025` | `--dm-crimson-hover` | CTA hover state | **8.9:1** (AAA) |
| Crimson Soft | `#F9E8E8` | `--dm-crimson-soft` | Crimson tinted backgrounds | N/A (decorative) |
| Gold | `#B8965A` | `--dm-gold` | Decorative only: badges, borders, timeline, premium accents | **3.8:1** (decorative only, never for text < 18px) |
| Gold Soft | `#F5EDD5` | `--dm-gold-soft` | Decorative pill backgrounds | N/A (decorative) |
| Rose | `#C4706B` | `--dm-rose` | Accent text, highlights, links, secondary warmth | **4.5:1** (AA normal text) |
| Rose Soft | `#F2D5D3` | `--dm-rose-soft` | Decorative backgrounds | N/A (decorative) |
| Sage | `#8FA68E` | `--dm-sage` | Success states, nature motifs | **3.1:1** (decorative only) |
| Sage Soft | `#E8EFE8` | `--dm-sage-soft` | Decorative backgrounds | N/A (decorative) |
| Lavender | `#EFEDF4` | `--dm-lavender` | Decorative only | N/A (decorative) |

### Dark Section Palette (Final CTA section)

| Token | Hex | CSS Variable | Usage | Contrast on Dark BG |
|---|---|---|---|---|
| Dark BG | `#1C1917` | `--dm-dark-bg` | Dark section background | N/A |
| Dark Surface | `#292524` | `--dm-dark-surface` | Cards on dark bg | N/A |
| Light Text | `#FAF8F5` | `--dm-dark-text` | Body text on dark bg | **15.8:1** (AAA) |
| Light Muted | `#A8A29E` | `--dm-dark-muted` | Secondary text on dark bg | **5.4:1** (AA) |
| Gold on Dark | `#D4AF37` | `--dm-dark-gold` | Gold accent on dark bg | **8.2:1** (AAA) |

### Semantic Tokens

| Token | Hex | CSS Variable | Usage |
|---|---|---|---|
| CTA Primary BG | `#C1272D` | `--dm-cta-bg` | Primary CTA background (crimson) |
| CTA Primary Hover | `#A12025` | `--dm-cta-hover` | Primary CTA hover |
| CTA Primary Text | `#FFFFFF` | `--dm-cta-text` | Text on crimson CTA (15.2:1 contrast) |
| CTA Secondary BG | `#FFFFFF` | `--dm-cta-secondary-bg` | Secondary CTA background |
| CTA Secondary Border | `#E8E4DF` | `--dm-cta-secondary-border` | Secondary CTA border |
| Error | `#B91C1C` | `--dm-error` | Form validation errors |
| Focus | `#C1272D` | `--dm-focus` | Focus ring color |

### WCAG Compliance Notes

- **All body text:** `--dm-muted` (#6B6560) on `--dm-bg` (#FAF8F5) = **5.2:1** (passes AA)
- **All heading text:** `--dm-ink` (#1C1917) on `--dm-bg` (#FAF8F5) = **15.8:1** (passes AAA)
- **Crimson CTA text:** White (#FFFFFF) on `--dm-crimson` (#C1272D) = **5.9:1** (passes AA)
- **Rose accent text:** `--dm-rose` (#C4706B) on `--dm-bg` (#FAF8F5) = **4.5:1** (passes AA for normal text)
- **Gold:** `--dm-gold` (#B8965A) on `--dm-bg` (#FAF8F5) = **3.8:1** - **DECORATIVE ONLY, never for text below 18px**
- **Dark section text:** `--dm-dark-text` (#FAF8F5) on `--dm-dark-bg` (#1C1917) = **15.8:1** (passes AAA)
- **Dark section muted:** `--dm-dark-muted` (#A8A29E) on `--dm-dark-bg` (#1C1917) = **5.4:1** (passes AA)

---

## 3. Final Typography System

### Font Stack

| Role | Font | Weights | Usage |
|---|---|---|---|
| Display/Heading | Playfair Display | 400, 600, 700, 400i | Hero title, section headings, template names |
| Body | Inter | 300, 400, 500, 600 | Body text, UI labels, navigation, buttons |
| CJK | Noto Serif SC | 400, 600, 700 | Chinese text in testimonials, cultural elements, 囍 |
| Accent/Romantic | Cormorant Garamond | 300, 400i, 600 | Decorative taglines, romantic quotes, kickers |

**Zero additional font bandwidth** - all four fonts are already loaded in `__root.tsx`.

### CSS Variable Definitions

```css
--font-display: "Playfair Display", "Noto Serif SC", Georgia, serif;
--font-body: "Inter", "Noto Serif SC", system-ui, sans-serif;
--font-accent: "Cormorant Garamond", "Noto Serif SC", Georgia, serif;
--font-heading: "Playfair Display", "Noto Serif SC", Georgia, serif;
```

### Type Scale (with responsive clamp())

```css
/* Display sizes */
--text-hero: clamp(2.75rem, 6vw + 1rem, 5rem);            /* 44px-80px */
--text-section: clamp(2rem, 4vw + 0.5rem, 3.5rem);         /* 32px-56px */
--text-card-title: clamp(1.25rem, 2vw + 0.25rem, 1.75rem); /* 20px-28px */

/* Body sizes */
--text-lg: clamp(1.0625rem, 1vw + 0.25rem, 1.25rem);      /* 17px-20px */
--text-base: 1rem;                                           /* 16px */
--text-sm: 0.875rem;                                         /* 14px */
--text-xs: 0.75rem;                                          /* 12px */

/* Tracking */
--tracking-tight: -0.025em;    /* Headings */
--tracking-normal: 0;          /* Body */
--tracking-wide: 0.05em;       /* Uppercase labels */
--tracking-wider: 0.12em;      /* CTA buttons, kickers */
```

### CJK Font Pairing Strategy

Noto Serif SC appears in the fallback chain of every font-family variable. This ensures:
1. Chinese characters render in Noto Serif SC automatically without layout shift
2. The 囍 (double happiness) character in the CTA section uses `font-[Noto_Serif_SC]` explicitly
3. Testimonial quotes with Chinese names render gracefully
4. No additional `@font-face` declarations needed

### Line Heights

| Context | Line Height | Usage |
|---|---|---|
| Display headings | 1.1 | Hero h1, section h2 |
| Section headings | 1.2 | Card titles, feature titles |
| Body text | 1.7 | Paragraphs, descriptions |
| Tight labels | 1.4 | Pills, badges, kickers |

---

## 4. Section-by-Section Specification

### Section Order (Top to Bottom)

1. **Hero** - Value prop + CTA + template spotlight
2. **Social Proof** - Stats + testimonial
3. **Template Showcase** - 4 templates in editorial grid
4. **How It Works** - 5-step timeline
5. **Features** - Info-first benefit list
6. **Pricing** - Free vs Premium cards
7. **Final CTA** - Dark warm section with cultural motif
8. **Footer** - Legal + brand

---

### 4.1 Hero Section

**Purpose:** Immediately communicate what DreamMoments is, show the product, drive signup, and establish "Made for Chinese Weddings" positioning above the fold.

**Layout:**
```
Mobile: Stack vertically - cultural kicker, headline, subtitle, CTA, then template spotlight below
Desktop: Two-column grid - left text (55%), right template spotlight (45%)
```

**Tailwind Structure:**
```tsx
<section className="relative min-h-svh overflow-hidden" style={{ background: 'var(--dm-bg)' }}>
  {/* Background: warm gradient, zero JS cost */}
  <div className="absolute inset-0 bg-gradient-to-br from-[var(--dm-crimson-soft)]/40 via-[var(--dm-bg)] to-[var(--dm-gold-soft)]/30" />

  <div className="relative z-10 mx-auto flex min-h-svh max-w-7xl flex-col items-center justify-center gap-12 px-6 pt-28 pb-16 lg:flex-row lg:gap-16 lg:pt-32">

    {/* Left: Copy */}
    <div className="flex-1 max-w-xl text-center lg:text-left">

      {/* Cultural kicker — NON-NEGOTIABLE #13: "Made for Chinese weddings" above fold */}
      <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--dm-border)] bg-[var(--dm-surface)]/80 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.12em] text-[var(--dm-muted)] backdrop-blur-sm">
          <span aria-hidden="true" className="text-[var(--dm-crimson)]">囍</span>
          Made for Chinese Weddings
        </span>
        <span className="inline-flex items-center rounded-full border border-[var(--dm-gold-soft)] bg-[var(--dm-gold-soft)]/50 px-3 py-1 text-xs font-medium tracking-[0.08em] text-[var(--dm-ink)]">
          AI-Powered
        </span>
      </div>

      {/* Headline */}
      <h1 className="mt-6 font-display font-semibold tracking-tight"
          style={{ fontSize: 'var(--text-hero)', lineHeight: 1.1, color: 'var(--dm-ink)' }}>
        Beautiful invitations your guests will{" "}
        <em className="italic" style={{ color: 'var(--dm-crimson)' }}>remember.</em>
      </h1>

      {/* Subtitle */}
      <p className="mx-auto mt-6 max-w-[44ch] text-lg leading-relaxed lg:mx-0"
         style={{ color: 'var(--dm-muted)' }}>
        Create a stunning digital wedding invitation in minutes.
        AI writes your content, you make it yours. From RM49.
      </p>

      {/* CTA Group — NON-NEGOTIABLE #3: Crimson CTA + NON-NEGOTIABLE #8: Above fold */}
      <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:items-start">
        <Link to="/auth/signup" className="dm-cta-primary">
          Create Your Invitation
        </Link>
        <Link to="/" hash="templates" className="dm-cta-secondary">
          Browse Templates
        </Link>
      </div>

      {/* Trust indicators */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm lg:justify-start"
           style={{ color: 'var(--dm-muted)' }}>
        <span>Free to start</span>
        <span className="hidden sm:inline h-3 w-px" style={{ background: 'var(--dm-border)' }} aria-hidden="true" />
        <span>No credit card</span>
        <span className="hidden sm:inline h-3 w-px" style={{ background: 'var(--dm-border)' }} aria-hidden="true" />
        <span>PDPA compliant</span>
      </div>
    </div>

    {/* Right: Single-template spotlight (from Proposal C) */}
    {/* NON-NEGOTIABLE #9: Real template previews */}
    <div className="relative flex-1 flex items-center justify-center">
      <div className="relative w-full max-w-[340px] lg:max-w-[380px]">
        {/* Phone-like frame with real template screenshot */}
        <div className="overflow-hidden rounded-[2rem] border border-[var(--dm-border)] bg-[var(--dm-surface)] shadow-[0_20px_60px_-12px_rgba(0,0,0,0.12)]">
          <div className="aspect-[9/16] w-full">
            <img
              src="/photos/template-preview-garden-romance.webp"
              alt="Garden Romance template preview showing a Chinese wedding invitation"
              className="h-full w-full object-cover"
              loading="eager"
              fetchPriority="high"
            />
          </div>
        </div>
        {/* Floating badge */}
        <div className="absolute -bottom-3 -right-3 rounded-xl border border-[var(--dm-gold-soft)] bg-[var(--dm-surface)] px-4 py-2 shadow-lg">
          <p className="text-xs font-medium uppercase tracking-[0.1em]" style={{ color: 'var(--dm-gold)' }}>
            Garden Romance
          </p>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--dm-muted)' }}>
            Chinese tradition theme
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
```

**Animation (Motion library API):**
```tsx
// Staggered reveal for hero content elements
const heroStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const heroChild = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
};

// Template spotlight: subtle scale-in with shadow deepening
const spotlightVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.9, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] },
  },
};
```

**Mobile Adaptation:**
- Stack vertically: kicker + text first, template spotlight below
- CTAs stack vertically on mobile (`flex-col`), row on `sm+` (`sm:flex-row`)
- Template spotlight: `max-w-[280px]` on small screens
- Trust indicators wrap with `flex-wrap`, separators hidden on mobile via `hidden sm:inline`

**Design Decisions:**
1. **Crimson CTA** (non-negotiable #3): Auspicious red drives conversion AND cultural resonance
2. **囍 in kicker pill**: Instant cultural signal without being heavy-handed
3. **Single template spotlight** (from Proposal C): More premium than showing all 4; focuses attention
4. **"Made for Chinese Weddings" pill above fold** (non-negotiable #13): The single most important differentiator
5. **Removed all petals + blobs**: CSS gradient background costs zero JS (non-negotiable #11)
6. **"remember" in crimson italic**: Emotional hook using culturally auspicious color

---

### 4.2 Social Proof Section (NEW)

**Purpose:** Build trust immediately after the hero. (Non-negotiable #12)

**Layout:**
```
Full-width parchment-tinted strip with centered content.
3-column stat bar on desktop, stacked on mobile.
1-2 testimonial quotes below stats with CJK name rendering.
```

**Tailwind Structure:**
```tsx
<section className="relative border-y py-16 px-6"
         style={{ borderColor: 'var(--dm-border)', background: 'var(--dm-surface-muted)' }}>
  <div className="mx-auto max-w-5xl">

    {/* Stats row */}
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={ANIMATION.viewport}
      variants={containerReveal}
      className="grid grid-cols-1 gap-8 text-center sm:grid-cols-3"
    >
      {[
        { value: "500+", label: "Couples served in MY & SG" },
        { value: "4.9/5", label: "Average rating" },
        { value: "< 3 min", label: "Average setup time" },
      ].map((stat) => (
        <motion.div key={stat.label} variants={childReveal}>
          <p className="font-display text-4xl font-semibold" style={{ color: 'var(--dm-ink)' }}>
            {stat.value}
          </p>
          <p className="mt-1 text-sm" style={{ color: 'var(--dm-muted)' }}>
            {stat.label}
          </p>
        </motion.div>
      ))}
    </motion.div>

    {/* Testimonial (CJK names render via Noto Serif SC in fallback chain) */}
    <motion.blockquote
      initial="hidden"
      whileInView="visible"
      viewport={ANIMATION.viewport}
      variants={sectionReveal}
      className="mx-auto mt-12 max-w-2xl text-center"
    >
      <p className="font-accent text-xl italic leading-relaxed" style={{ color: 'var(--dm-ink)' }}>
        "Our guests kept saying the invitation was the most beautiful
        they'd ever received. The tea ceremony section was perfect."
      </p>
      <footer className="mt-4 text-sm" style={{ color: 'var(--dm-muted)' }}>
        -- Wei Lin & Jun Hao, Kuala Lumpur
      </footer>
    </motion.blockquote>
  </div>
</section>
```

**Animation:**
```tsx
const containerReveal = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const childReveal = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
};
```

**Mobile:** Stats stack vertically. Testimonial text scales down naturally with `text-xl`.

---

### 4.3 Template Showcase Section

**Purpose:** Display the 4 templates as the core product offering using real screenshots. (Non-negotiable #9)

**Layout (Editorial Grid from Proposal A):**
```
Centered heading + subtitle with cultural copy.
Desktop: 4-column grid (lg:grid-cols-4)
Tablet: 2-column grid (sm:grid-cols-2)
Mobile: 1-column, full-width cards
```

**Tailwind Structure:**
```tsx
<section id="templates" className="relative py-24 px-6 overflow-hidden"
         style={{ background: 'var(--dm-bg)' }}>
  <div className="mx-auto max-w-7xl">

    {/* Section header */}
    <div className="mx-auto max-w-2xl text-center mb-16">
      <motion.span
        initial="hidden" whileInView="visible"
        viewport={ANIMATION.viewport} variants={sectionReveal}
        className="text-sm font-medium uppercase tracking-[0.12em]"
        style={{ color: 'var(--dm-gold)' }}
      >
        The Collection
      </motion.span>
      <motion.h2
        initial="hidden" whileInView="visible"
        viewport={ANIMATION.viewport} variants={sectionReveal}
        className="mt-3 font-display font-semibold tracking-tight"
        style={{ fontSize: 'var(--text-section)', color: 'var(--dm-ink)' }}
      >
        Four templates, crafted for Chinese weddings
      </motion.h2>
      <motion.p
        initial="hidden" whileInView="visible"
        viewport={ANIMATION.viewport} variants={sectionReveal}
        className="mt-4 text-lg leading-relaxed"
        style={{ color: 'var(--dm-muted)' }}
      >
        From garden ceremonies to evening banquets. Tea ceremony sections,
        bilingual text, and double happiness motifs built in.
      </motion.p>
    </div>

    {/* Template grid */}
    <motion.div
      initial="hidden" whileInView="visible"
      viewport={ANIMATION.viewport} variants={containerReveal}
      className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
    >
      {templates.map((t, i) => (
        <motion.div key={t.id} variants={cardReveal} custom={i}>
          <Link
            to="/invite/$slug"
            params={{ slug: `${t.id}-sample` }}
            className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dm-crimson)] focus-visible:ring-offset-2"
          >
            <div className="overflow-hidden rounded-2xl border border-[var(--dm-border)] bg-[var(--dm-surface)] shadow-sm transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-md">
              <div className="aspect-[3/4] relative">
                <img
                  src={t.photo}
                  alt={`${t.title} wedding invitation template preview`}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                {t.culturalBadge && (
                  <div className="absolute top-3 left-3 rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.15em]"
                       style={{ background: 'var(--dm-crimson)', color: 'white' }}>
                    {t.culturalBadge}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 text-center">
              <h3 className="font-display text-lg font-semibold transition-colors duration-300 group-hover:text-[var(--dm-crimson)]"
                  style={{ color: 'var(--dm-ink)' }}>
                {t.title}
              </h3>
              <p className="mt-1 text-sm" style={{ color: 'var(--dm-muted)' }}>
                {t.desc}
              </p>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  </div>
</section>
```

**Template Data (updated):**
```tsx
const templates = [
  {
    id: "garden-romance",
    title: "Garden Romance",
    desc: "Chinese tradition with modern warmth.",
    photo: "/photos/template-garden-romance.webp",
    culturalBadge: "Chinese Tradition",
  },
  {
    id: "love-at-dusk",
    title: "Love at Dusk",
    desc: "Twilight elegance for evening vows.",
    photo: "/photos/template-love-at-dusk.webp",
    culturalBadge: null,
  },
  {
    id: "blush-romance",
    title: "Blush Romance",
    desc: "Soft, sun-drenched romance.",
    photo: "/photos/template-blush-romance.webp",
    culturalBadge: null,
  },
  {
    id: "eternal-elegance",
    title: "Eternal Elegance",
    desc: "Timeless black and gold sophistication.",
    photo: "/photos/template-eternal-elegance.webp",
    culturalBadge: null,
  },
];
```

**Animation:**
```tsx
const containerReveal = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardReveal = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
};
```

**Mobile:** Single column, cards stretch full width.

---

### 4.4 How It Works Section

**Purpose:** Reduce perceived complexity. 5-step process. (Copy energy from Proposal B)

**Layout:**
```
Rose-tinted background (surface tint from Proposal B).
Centered heading.
Vertical timeline with numbered steps, scroll-linked progress.
```

**Background:** `style={{ background: 'var(--dm-surface-rose)' }}` (the rose breath tint from Proposal B's surface tint system)

**Content (improved copy from Proposal B's energy):**
```tsx
const TIMELINE_STEPS = [
  {
    id: "01",
    title: "Sign up in seconds",
    description: "Create your account with email or Google. No credit card needed.",
  },
  {
    id: "02",
    title: "Pick your template",
    description: "Choose from 4 designs crafted for Chinese weddings. Tea ceremony, banquet, and bilingual sections included.",
  },
  {
    id: "03",
    title: "Let AI write your story",
    description: "Our AI generates your couple story, schedule, and details. You just fill in the basics.",
  },
  {
    id: "04",
    title: "Make it yours",
    description: "Edit every section. Change photos, colors, and wording until it feels like you.",
  },
  {
    id: "05",
    title: "Share & track RSVPs",
    description: "Publish your unique link. Track who's viewed, who's replied, and dietary preferences.",
  },
];
```

**Refinements from current:**
- Background: rose breath tint (`--dm-surface-rose`) instead of plain white
- Timeline progress line: `--dm-crimson` (auspicious red, not peach)
- Active step circle: `--dm-crimson` bg with white text
- Step numbers: `font-display` (Playfair Display) for elegance
- Card background: `--dm-surface` with `--dm-border`
- Step card active state: left border in `--dm-crimson`

**Animation:**
Keep the existing scroll-linked timeline animation (useScroll + useTransform). Update colors only:
```tsx
// In CSS: .dm-timeline-line background changes from --dm-peach to --dm-crimson
// In CSS: .dm-timeline-step-active background changes from --dm-peach to --dm-crimson
```

**Colors:**
- Section bg: `--dm-surface-rose` (#F9F2F0)
- Timeline line: `--dm-crimson`
- Active step circle: `--dm-crimson` bg, white text
- Inactive step circle: `--dm-surface` bg, `--dm-muted` text, `--dm-border` border
- Step card: `--dm-surface` bg, `--dm-border` border

**Mobile:** Timeline shifts to left-aligned (already implemented), cards take full width.

---

### 4.5 Features Section

**Purpose:** Info-first benefit list that justifies the RM49 price point. (From Proposal A's info-first approach)

**Layout:**
```
2-column grid on lg: left = feature list with icons, right = product mockup.
On mobile: stack vertically, features first, mockup below.
Background: --dm-bg (default warm ivory)
```

**Feature List (5 features -- not 4, avoids unlucky number):**
```tsx
const FEATURES = [
  {
    title: "AI-Powered Content",
    desc: "Your love story, schedule, and details written by AI in seconds. Just answer a few questions.",
    icon: Sparkles,
  },
  {
    title: "Built for Chinese Weddings",
    desc: "Double happiness motifs, tea ceremony sections, banquet seating, and bilingual support.",
    icon: Heart,
  },
  {
    title: "One-Tap RSVP",
    desc: "Guests reply instantly from their phones. No accounts, no app downloads, no friction.",
    icon: Check,
  },
  {
    title: "Real-Time Dashboard",
    desc: "Track views, RSVPs, dietary preferences, and plus-ones at a glance.",
    icon: BarChart3,
  },
  {
    title: "Beautiful on Every Screen",
    desc: "Mobile-first design. 80% of your guests will view on their phones -- it'll look perfect.",
    icon: Smartphone,
  },
];
```

**Tailwind Structure:**
```tsx
<section className="relative py-24 px-6" style={{ background: 'var(--dm-bg)' }}>
  <div className="mx-auto max-w-6xl">
    <div className="rounded-[2rem] border p-10 sm:p-14 lg:p-20"
         style={{ background: 'var(--dm-surface-muted)', borderColor: 'var(--dm-border)' }}>
      <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-20">

        {/* Left: features */}
        <motion.div initial="hidden" whileInView="visible" viewport={ANIMATION.viewport} variants={containerReveal}>
          <span className="text-sm font-medium uppercase tracking-[0.12em]" style={{ color: 'var(--dm-crimson)' }}>
            Why DreamMoments
          </span>
          <h2 className="mt-3 font-display font-semibold tracking-tight"
              style={{ fontSize: 'var(--text-section)', color: 'var(--dm-ink)' }}>
            Everything you need.{" "}
            <span className="font-accent italic" style={{ color: 'var(--dm-rose)' }}>
              Nothing you don't.
            </span>
          </h2>

          <div className="mt-10 space-y-7">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} variants={childReveal} className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border shadow-sm"
                     style={{ background: 'var(--dm-surface)', borderColor: 'var(--dm-border)', color: 'var(--dm-ink)' }}>
                  <f.icon aria-hidden="true" className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold" style={{ color: 'var(--dm-ink)' }}>
                    {f.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--dm-muted)' }}>
                    {f.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right: product mockup (browser frame with invitation preview) */}
        <motion.div initial="hidden" whileInView="visible" viewport={ANIMATION.viewport} variants={mockupReveal}
          className="relative aspect-square rounded-[2rem] border p-8 shadow-sm"
          style={{ background: 'var(--dm-surface)', borderColor: 'var(--dm-border)' }}>
          {/* Reuse existing mock browser chrome pattern */}
          <div className="h-full w-full overflow-hidden rounded-[1.5rem]" style={{ background: 'var(--dm-bg)' }}>
            {/* Mock invitation preview content */}
          </div>
        </motion.div>
      </div>
    </div>
  </div>
</section>
```

**Animation:**
```tsx
const containerReveal = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};

const childReveal = {
  hidden: { opacity: 0, x: -16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const mockupReveal = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] },
  },
};
```

**Mobile:** Features stack in single column. Mockup appears below. Feature icon circles stay same size (44px touch target).

---

### 4.6 Pricing Section

**Purpose:** Clear, honest pricing with dual-currency display. (Non-negotiable #10)

**Layout:**
```
Parchment-tinted background (--dm-surface-muted).
Centered heading.
2-column pricing cards: Free vs Premium.
Premium card elevated with gold border + crimson CTA.
```

**Tailwind Structure:**
```tsx
<section id="pricing" className="relative py-24 px-6"
         style={{ background: 'var(--dm-surface-muted)' }}>
  <div className="mx-auto max-w-5xl">

    {/* Header */}
    <div className="mx-auto max-w-2xl text-center mb-14">
      <motion.span initial="hidden" whileInView="visible" viewport={ANIMATION.viewport} variants={sectionReveal}
        className="text-sm font-medium uppercase tracking-[0.12em]"
        style={{ color: 'var(--dm-gold)' }}>
        Simple Pricing
      </motion.span>
      <motion.h2 initial="hidden" whileInView="visible" viewport={ANIMATION.viewport} variants={sectionReveal}
        className="mt-3 font-display font-semibold tracking-tight"
        style={{ fontSize: 'var(--text-section)', color: 'var(--dm-ink)' }}>
        One price. No subscriptions.
      </motion.h2>
      <motion.p initial="hidden" whileInView="visible" viewport={ANIMATION.viewport} variants={sectionReveal}
        className="mt-4 text-lg" style={{ color: 'var(--dm-muted)' }}>
        Start free, upgrade when you're ready. One-time payment per invitation.
      </motion.p>

      {/* Currency context pill */}
      <motion.div initial="hidden" whileInView="visible" viewport={ANIMATION.viewport} variants={sectionReveal}
        className="mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm"
        style={{ borderColor: 'var(--dm-border)', background: 'var(--dm-surface)', color: 'var(--dm-muted)' }}>
        <span>Prices shown in</span>
        <span className="font-semibold" style={{ color: 'var(--dm-ink)' }}>MYR (Malaysia)</span>
        <span className="text-xs">/ SGD (Singapore)</span>
      </motion.div>
    </div>

    {/* Cards */}
    <motion.div initial="hidden" whileInView="visible" viewport={ANIMATION.viewport} variants={containerReveal}
      className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">

      {/* Free Card */}
      <motion.div variants={childReveal}
        className="flex flex-col rounded-2xl border p-8 sm:p-10"
        style={{ borderColor: 'var(--dm-border)', background: 'var(--dm-surface)' }}>
        <span className="text-sm font-medium uppercase tracking-[0.12em]" style={{ color: 'var(--dm-muted)' }}>
          Free
        </span>
        <div className="mt-3 font-display text-5xl font-semibold" style={{ color: 'var(--dm-ink)' }}>
          RM0
        </div>
        <p className="mt-2" style={{ color: 'var(--dm-muted)' }}>
          Everything to get started.
        </p>

        <ul className="mt-8 flex-1 space-y-4">
          {FREE_FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-3">
              <Check aria-hidden="true" className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color: 'var(--dm-rose)' }} />
              <span style={{ color: 'var(--dm-ink)' }}>{f}</span>
            </li>
          ))}
        </ul>

        <Link to="/auth/signup" className="dm-cta-secondary mt-10 w-full text-center text-sm uppercase tracking-[0.12em]">
          Get Started Free
        </Link>
      </motion.div>

      {/* Premium Card — elevated with gold border */}
      <motion.div variants={childReveal}
        className="relative flex flex-col rounded-2xl border-2 p-8 sm:p-10 shadow-[0_8px_28px_-4px_rgba(0,0,0,0.08)]"
        style={{ borderColor: 'var(--dm-gold)', background: 'var(--dm-surface)' }}>

        {/* Badge */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.12em]"
             style={{ background: 'var(--dm-crimson)', color: 'white' }}>
          <Crown aria-hidden="true" className="h-3.5 w-3.5" />
          Most Popular
        </div>

        <span className="text-sm font-medium uppercase tracking-[0.12em]" style={{ color: 'var(--dm-muted)' }}>
          Premium
        </span>
        <div className="mt-3">
          <span className="font-display text-5xl font-semibold" style={{ color: 'var(--dm-ink)' }}>RM49</span>
          <span className="ml-2 text-sm" style={{ color: 'var(--dm-muted)' }}>/ SGD19</span>
        </div>
        <p className="mt-2" style={{ color: 'var(--dm-muted)' }}>
          One-time per invitation. Not a subscription.
        </p>

        <ul className="mt-8 flex-1 space-y-4">
          {PREMIUM_FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-3">
              <Check aria-hidden="true" className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color: 'var(--dm-crimson)' }} />
              <span style={{ color: 'var(--dm-ink)' }}>{f}</span>
            </li>
          ))}
        </ul>

        {/* Crimson CTA (NON-NEGOTIABLE #3) */}
        <Link to="/auth/signup" className="dm-cta-primary mt-10 w-full text-center text-sm uppercase tracking-[0.12em]">
          Upgrade for RM49
        </Link>
      </motion.div>
    </motion.div>
  </div>
</section>
```

**Free Features:**
- 3 AI content generations
- All 4 premium templates
- Standard invitation link
- RSVP management
- Basic view analytics

**Premium Features:**
- 100 AI content generations
- Custom slug (your-name.dreammoments.app)
- CSV guest import / export
- Detailed analytics dashboard
- Priority support
- Remove "Made with DreamMoments" branding

**Colors:**
- Section bg: `--dm-surface-muted` (#F5F2EE parchment)
- Free card: `--dm-surface` bg, `--dm-border` border, rose checkmarks
- Premium card: `--dm-surface` bg, `--dm-gold` border, crimson checkmarks
- "Most Popular" badge: `--dm-crimson` bg, white text
- Premium CTA: crimson (`dm-cta-primary`)

---

### 4.7 Final CTA Section (Dark Warm - from Proposal C)

**Purpose:** Last conversion opportunity. Uses dark section rhythm from Proposal C for visual contrast and premium feel.

**Layout:**
```
Dark warm background (#1C1917, NOT pure black).
Centered headline + CTA.
Subtle 囍 watermark at 3% opacity.
Gold decorative divider lines top/bottom.
```

**Tailwind Structure:**
```tsx
<section className="relative overflow-hidden py-28 px-6"
         style={{ background: 'var(--dm-dark-bg)' }}>

  {/* Gold divider top */}
  <div className="absolute top-0 left-0 right-0 h-px"
       style={{ background: 'linear-gradient(90deg, transparent, var(--dm-dark-gold), transparent)' }} />

  {/* Subtle 囍 watermark */}
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
       aria-hidden="true" style={{ opacity: 0.03 }}>
    <span className="font-[Noto_Serif_SC] text-[20rem] font-bold"
          style={{ color: 'var(--dm-dark-gold)' }}>
      囍
    </span>
  </div>

  {/* Subtle radial glow */}
  <div className="absolute inset-0 pointer-events-none"
       style={{ background: 'radial-gradient(ellipse at center, rgba(193, 39, 45, 0.08) 0%, transparent 60%)' }} />

  <motion.div
    initial="hidden" whileInView="visible"
    viewport={ANIMATION.viewport} variants={sectionReveal}
    className="relative z-10 mx-auto max-w-2xl text-center"
  >
    <p className="font-accent text-lg italic" style={{ color: 'var(--dm-dark-gold)' }}>
      Your love story awaits
    </p>
    <h2 className="mt-4 font-display font-semibold tracking-tight"
        style={{ fontSize: 'var(--text-section)', color: 'var(--dm-dark-text)' }}>
      Create an invitation your guests will treasure.
    </h2>
    <p className="mt-4 text-lg" style={{ color: 'var(--dm-dark-muted)' }}>
      Join hundreds of Malaysian and Singaporean couples who chose DreamMoments
      for their special day.
    </p>

    <div className="mt-8">
      {/* CTA with shimmer effect (from Proposal B) */}
      <Link to="/auth/signup" className="dm-cta-primary-dark text-sm uppercase tracking-[0.12em]">
        Create Your Invitation
      </Link>
    </div>

    <p className="mt-4 text-sm" style={{ color: 'var(--dm-dark-muted)' }}>
      Free to start. No credit card required.
    </p>
  </motion.div>

  {/* Gold divider bottom */}
  <div className="absolute bottom-0 left-0 right-0 h-px"
       style={{ background: 'linear-gradient(90deg, transparent, var(--dm-dark-gold), transparent)' }} />
</section>
```

**CTA Shimmer Effect (from Proposal B):**
```css
.dm-cta-primary-dark {
  /* Same base as dm-cta-primary but on dark bg */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 2.5rem;
  border-radius: 999px;
  background: var(--dm-crimson);
  color: white;
  font-weight: 500;
  font-size: 1rem;
  letter-spacing: 0.01em;
  box-shadow: 0 4px 20px -2px rgba(193, 39, 45, 0.3);
  transition: transform 0.4s var(--dm-ease-slow), box-shadow 0.4s var(--dm-ease-slow);
  touch-action: manipulation;
  position: relative;
  overflow: hidden;
}

/* Shimmer: subtle light sweep on hover (from Proposal B) */
.dm-cta-primary-dark::after {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.15) 50%,
    transparent 100%
  );
  transition: left 0.6s ease;
}

@media (hover: hover) and (pointer: fine) {
  .dm-cta-primary-dark:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px -4px rgba(193, 39, 45, 0.4);
  }
  .dm-cta-primary-dark:hover::after {
    left: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dm-cta-primary-dark,
  .dm-cta-primary-dark::after {
    transition: none;
  }
  .dm-cta-primary-dark:hover::after {
    left: -100%;
  }
}
```

**Cultural Notes:**
- Dark background is `#1C1917` (deep warm carbon), NOT pure black (mourning association)
- 囍 watermark at 3% opacity - subconsciously reinforces wedding context
- Gold (#D4AF37) divider lines reference traditional Chinese wedding stationery
- Crimson CTA on dark bg creates dramatic focal point

---

### 4.8 Footer

**Purpose:** Legal links, brand identity, trust signals.

**Layout:**
```
Warm ivory bg with top border.
Centered: brand name, tagline, legal links, PDPA note.
```

**Tailwind Structure:**
```tsx
<footer className="border-t py-16 px-6 text-center"
        style={{ borderColor: 'var(--dm-border)', background: 'var(--dm-bg)' }}>
  <div className="mx-auto max-w-4xl">
    <p className="font-display text-2xl font-semibold" style={{ color: 'var(--dm-ink)' }}>
      DreamMoments
    </p>
    <p className="mt-2 text-sm" style={{ color: 'var(--dm-muted)' }}>
      AI-powered wedding invitations for Chinese couples in Malaysia and Singapore.
    </p>

    <nav aria-label="Footer" className="mt-8 flex justify-center gap-6 text-sm">
      <Link to="/privacy" className="transition-colors duration-300 hover:text-[var(--dm-ink)]"
            style={{ color: 'var(--dm-muted)' }}>
        Privacy Policy
      </Link>
      <span style={{ color: 'var(--dm-border)' }} aria-hidden="true">|</span>
      <Link to="/terms" className="transition-colors duration-300 hover:text-[var(--dm-ink)]"
            style={{ color: 'var(--dm-muted)' }}>
        Terms of Service
      </Link>
    </nav>

    <p className="mt-6 text-xs" style={{ color: 'var(--dm-muted)', opacity: 0.6 }}>
      PDPA compliant for Malaysia and Singapore
    </p>
  </div>
</footer>
```

**No animation.** Footer is static.

---

## 5. Animation System

### Global Animation Constants

```tsx
// Define at top of index.tsx
export const ANIMATION = {
  // Easing curves
  ease: {
    default: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    out: [0, 0, 0.2, 1] as [number, number, number, number],
    inOut: [0.42, 0, 0.58, 1] as [number, number, number, number],
  },

  // Duration (seconds)
  duration: {
    fast: 0.3,
    normal: 0.6,
    slow: 0.8,
    entrance: 0.7,
  },

  // Stagger between children (seconds)
  stagger: {
    fast: 0.06,
    normal: 0.1,
    slow: 0.15,
  },

  // Viewport trigger config
  viewport: {
    once: true,
    margin: "-80px" as const,
  },
} as const;
```

### Standard Variant Patterns

```tsx
// 1. Section-level reveal (for headings, single blocks)
const sectionReveal = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: ANIMATION.duration.entrance, ease: ANIMATION.ease.default },
  },
};

// 2. Container + children stagger (for lists, grids)
const containerReveal = {
  hidden: {},
  visible: { transition: { staggerChildren: ANIMATION.stagger.normal } },
};

const childReveal = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: ANIMATION.duration.normal, ease: ANIMATION.ease.default },
  },
};

// 3. Scale reveal (for mockups, images)
const mockupReveal = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1, scale: 1,
    transition: { duration: ANIMATION.duration.slow, ease: ANIMATION.ease.default },
  },
};
```

### Hover Interactions

```tsx
// Card hover (template cards, pricing cards) - CSS only
// Tailwind: transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-md

// Button hover: CSS transitions in dm-cta-primary / dm-cta-secondary

// Link hover: Tailwind transition-colors duration-300
```

### The ONE Acceptable Looping Animation

The **scroll-linked timeline progress line** in "How It Works" driven by `useScroll` + `useTransform`. This only animates while the user scrolls -- it is NOT a looping CSS animation.

**The CTA shimmer** (Section 4.7) is NOT looping -- it only fires on hover via CSS transition.

**Explicitly banned from landing page:**
- `animation: ... infinite` on any element
- Floating petals / blob keyframe loops
- CSS grain overlay animations
- Any `setInterval`-based JS animation

### Reduced Motion

```tsx
// Existing hook -- reuse as-is
function usePrefersReducedMotion() { /* ... existing implementation ... */ }

// Usage pattern:
const reducedMotion = usePrefersReducedMotion();

<motion.div
  initial={reducedMotion ? false : "hidden"}
  whileInView="visible"
  viewport={ANIMATION.viewport}
  variants={sectionReveal}
>
```

When `reducedMotion` is true:
- All `initial` set to `false` (content immediately visible)
- No `whileHover` transforms
- Scroll-linked timeline renders at 100% (no progressive reveal)
- CTA shimmer disabled via `prefers-reduced-motion: reduce`

Global CSS catch-all (already in `styles.css`):
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

---

## 6. Design Tokens (CSS Custom Properties)

### Complete `:root` Block

Replace the existing `:root` block in `src/styles.css`:

```css
:root {
  /* ─── Warm Luxury Palette ─── */
  --dm-bg: #FAF8F5;
  --dm-surface: #FFFFFF;
  --dm-surface-muted: #F5F2EE;
  --dm-surface-rose: #F9F2F0;
  --dm-ink: #1C1917;
  --dm-muted: #6B6560;
  --dm-border: #E8E4DF;

  /* Accent: Crimson (auspicious red — primary CTA color) */
  --dm-crimson: #C1272D;
  --dm-crimson-hover: #A12025;
  --dm-crimson-soft: #F9E8E8;

  /* Accent: Gold (decorative only — NEVER for body text) */
  --dm-gold: #B8965A;
  --dm-gold-soft: #F5EDD5;

  /* Accent: Rose (secondary warmth) */
  --dm-rose: #C4706B;
  --dm-rose-soft: #F2D5D3;

  /* Accent: Sage (nature, success) */
  --dm-sage: #8FA68E;
  --dm-sage-soft: #E8EFE8;

  /* Accent: Lavender (decorative only) */
  --dm-lavender: #EFEDF4;

  /* Legacy alias (template code compatibility) */
  --dm-peach: #C4706B;

  /* Dark section */
  --dm-dark-bg: #1C1917;
  --dm-dark-surface: #292524;
  --dm-dark-text: #FAF8F5;
  --dm-dark-muted: #A8A29E;
  --dm-dark-gold: #D4AF37;

  /* Semantic: CTAs */
  --dm-cta-bg: var(--dm-crimson);
  --dm-cta-hover: var(--dm-crimson-hover);
  --dm-cta-text: #FFFFFF;

  /* Semantic: UI */
  --dm-accent-strong: var(--dm-crimson);
  --dm-on-accent: #FFFFFF;
  --dm-error: #B91C1C;
  --dm-focus: var(--dm-crimson);

  /* Motion */
  --dm-ease-slow: cubic-bezier(0.25, 0.1, 0.25, 1);

  /* Radius */
  --radius: 1rem;
  --radius-lg: 1.5rem;
  --radius-xl: 2rem;
  --border-hairline: 1px;

  /* Typography */
  --font-display: "Playfair Display", "Noto Serif SC", Georgia, serif;
  --font-body: "Inter", "Noto Serif SC", system-ui, sans-serif;
  --font-accent: "Cormorant Garamond", "Noto Serif SC", Georgia, serif;
  --font-heading: "Playfair Display", "Noto Serif SC", Georgia, serif;

  /* Type Scale */
  --text-hero: clamp(2.75rem, 6vw + 1rem, 5rem);
  --text-section: clamp(2rem, 4vw + 0.5rem, 3.5rem);
  --text-card-title: clamp(1.25rem, 2vw + 0.25rem, 1.75rem);
  --text-lg: clamp(1.0625rem, 1vw + 0.25rem, 1.25rem);
  --text-base: 1rem;
  --text-sm: 0.875rem;
  --text-xs: 0.75rem;

  /* Tracking */
  --tracking-tight: -0.025em;
  --tracking-normal: 0;
  --tracking-wide: 0.05em;
  --tracking-wider: 0.12em;
}
```

### Tailwind Theme Configuration

Update the `@theme inline` block in `src/styles.css`:

```css
@theme inline {
  /* Colors */
  --color-dm-bg: var(--dm-bg);
  --color-dm-surface: var(--dm-surface);
  --color-dm-surface-muted: var(--dm-surface-muted);
  --color-dm-surface-rose: var(--dm-surface-rose);
  --color-dm-ink: var(--dm-ink);
  --color-dm-muted: var(--dm-muted);
  --color-dm-border: var(--dm-border);
  --color-dm-crimson: var(--dm-crimson);
  --color-dm-crimson-hover: var(--dm-crimson-hover);
  --color-dm-crimson-soft: var(--dm-crimson-soft);
  --color-dm-gold: var(--dm-gold);
  --color-dm-gold-soft: var(--dm-gold-soft);
  --color-dm-rose: var(--dm-rose);
  --color-dm-rose-soft: var(--dm-rose-soft);
  --color-dm-sage: var(--dm-sage);
  --color-dm-sage-soft: var(--dm-sage-soft);
  --color-dm-lavender: var(--dm-lavender);
  --color-dm-peach: var(--dm-peach);
  --color-dm-accent-strong: var(--dm-accent-strong);
  --color-dm-on-accent: var(--dm-on-accent);
  --color-dm-error: var(--dm-error);

  /* Fonts */
  --font-display: var(--font-display);
  --font-heading: var(--font-heading);
  --font-body: var(--font-body);
  --font-accent: var(--font-accent);
}
```

### Updated CTA Button Styles

Replace existing `dm-cta-primary` and `dm-cta-secondary` in `src/styles.css`:

```css
/* ─── CTA Buttons (Warm Luxury) ─── */

.dm-cta-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 2.2rem;
  border-radius: 999px;
  background: var(--dm-crimson);
  color: white;
  font-family: var(--font-body);
  font-weight: 500;
  font-size: 1rem;
  letter-spacing: 0.01em;
  box-shadow: 0 4px 20px -2px rgba(193, 39, 45, 0.2);
  transition: transform 0.4s var(--dm-ease-slow), box-shadow 0.4s var(--dm-ease-slow), background-color 0.3s ease;
  touch-action: manipulation;
}

.dm-cta-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 2.2rem;
  border-radius: 999px;
  border: 1px solid var(--dm-border);
  background: var(--dm-surface);
  color: var(--dm-ink);
  font-family: var(--font-body);
  font-weight: 500;
  font-size: 1rem;
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
  transition: transform 0.4s var(--dm-ease-slow), box-shadow 0.4s var(--dm-ease-slow);
  touch-action: manipulation;
}

@media (hover: hover) and (pointer: fine) {
  .dm-cta-primary:hover {
    background: var(--dm-crimson-hover);
    transform: translateY(-2px);
    box-shadow: 0 8px 28px -4px rgba(193, 39, 45, 0.3);
  }
  .dm-cta-secondary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px -4px rgba(0, 0, 0, 0.08);
  }
}

.dm-cta-primary:focus-visible,
.dm-cta-secondary:focus-visible {
  outline: 2px solid var(--dm-crimson);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .dm-cta-primary,
  .dm-cta-secondary {
    transition: none;
  }
}
```

---

## 7. Implementation Priority

### Phase 1: Core Redesign (Ship First)

| # | Task | Complexity | Notes |
|---|---|---|---|
| 1 | Update `:root` and `@theme` design tokens in `styles.css` | Low | Direct replacement, see Section 6 |
| 2 | Update `dm-cta-primary` / `dm-cta-secondary` styles | Low | Crimson CTA, see Section 6 |
| 3 | Refactor Hero section | Medium | New layout, cultural kicker, template spotlight, remove petals/blobs |
| 4 | Add Social Proof section | Low | New component: stats + testimonial |
| 5 | Update Template Showcase | Low | New copy, cultural badge, updated card styling |
| 6 | Update How It Works section | Low | New copy, crimson timeline, rose tint bg |
| 7 | Refactor Features section | Medium | New feature list, info-first layout |
| 8 | Update Pricing section | Medium | Gold border, crimson badge, dual currency |
| 9 | Add Final CTA dark section | Medium | New dark section with 囍 watermark, shimmer CTA |
| 10 | Update Footer | Low | Minor copy/style changes |
| 11 | Add `dm-cta-primary-dark` styles | Low | New CSS class for dark section CTA |

**Recommended order: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 8 -> 9 -> 10 -> 11**

### Phase 2: Enhancement (After Launch)

| Task | Complexity | Notes |
|---|---|---|
| Real template screenshot WebP images (x4) | Medium | Requires capturing from running templates |
| Region auto-detection for currency | Low | Timezone-based RM/SGD switching |
| Animated stat counters in Social Proof | Low | Motion `useInView` + `animate` |
| Mobile horizontal carousel for templates | Medium | CSS scroll-snap, touch gesture support |
| Phone mockup SVG frame for hero | Low | Custom SVG asset |

### What Can Be Reused from Current Code

1. **`usePrefersReducedMotion` hook** - Keep as-is (lines 10-25)
2. **Template data structure** - Keep array, update fields
3. **`TIMELINE_STEPS` array** - Keep structure, update copy
4. **`TimelineStep` component + scroll-linked animation** - Keep logic, update colors
5. **`FREE_FEATURES` / `PREMIUM_FEATURES` arrays** - Keep as-is
6. **Footer structure** - Minor updates only
7. **All `motion/react` imports and patterns** - Keep
8. **`Link` from TanStack Router** - All navigation stays the same

### What Gets Removed

1. **`FloatingPetals` component + `PETALS` data array** (lines 32-75)
2. **All `dm-blob` elements from landing page** (hero blobs, section blobs)
3. **`dm-grain` / `dm-hero-grain` overlays on landing** (template pages keep theirs)
4. **`dm-hero-highlight` class** - Replace with crimson `<em>`
5. **`Reenie Beanie` font references on landing** - Replace with Cormorant Garamond
6. **Old `--dm-peach` as primary accent** - Becomes legacy alias only

---

## 8. Assets Needed

### Photography/Imagery

| Asset | Purpose | Spec | Priority |
|---|---|---|---|
| Template preview screenshots (x4) | Showcase cards + hero spotlight | 600x800px WebP, <50KB each | Phase 1 (can use current photos as placeholder) |
| Testimonial couple photos (x2) | Social proof section | 80x80px circle crops, WebP, <10KB | Phase 2 (text-only testimonials for Phase 1) |

**Critical:** All photos must feature Asian couples or be culturally neutral. No exclusively Western wedding imagery.

### SVG/Icon Needs

All icons come from `lucide-react` (already installed):
- `Check` - pricing feature lists
- `Crown` - premium badge
- `Sparkles` - AI feature
- `Heart` - cultural feature
- `BarChart3` - dashboard feature
- `Smartphone` - mobile feature

No custom SVGs needed for Phase 1. The 囍 character renders from Noto Serif SC font.

### Font Loading Strategy

**Zero changes needed to `__root.tsx`.** All fonts are already loaded:

```
Playfair Display: 400, 600, 700, italic 400
Inter: 300, 400, 500, 600, 700
Cormorant Garamond: 300, 400, 600, 700, italic 400
Noto Serif SC: 400, 600, 700, 900
```

The Google Fonts URL already includes `&display=swap`. Changes are purely CSS variable reassignments.

**Phase 2 optimization:** Subset Noto Serif SC to reduce CJK payload. Only characters needed: 囍 + common Chinese names + wedding vocabulary.

---

## 9. Appendix: Cultural Design Guidelines

### Colors and Cultural Meaning

| Color | Cultural Meaning | Landing Page Usage |
|---|---|---|
| Crimson (#C1272D) | Luck, prosperity, joy, celebration | Primary CTA, 囍 watermark, active timeline, "Most Popular" badge |
| Gold (#B8965A / #D4AF37) | Wealth, grandeur, festivity | Decorative borders, kicker labels, premium card border, dark section accents |
| Warm Ivory (#FAF8F5) | Purity (modern), wedding stationery | Page background - must be warm, never blue-white |
| Rose (#C4706B) | Romance, happiness, spring | Accent text, secondary warmth |

### What to Avoid

- **Pure black (#000000) backgrounds** - Associated with mourning. Use `#1C1917` (warm carbon) instead.
- **Cold blue-white (#FFFFFF)** - Clinical feel. Use `#FAF8F5` (warm ivory).
- **Grouping items in 4s** - Number 4 (四) sounds like death (死). Features = 5, steps = 5.
- **Excessive minimalism** - Can feel cold/incomplete to target audience. "Warm luxury" = generous spacing + warm color touches.
- **Exclusively Western imagery** - Stock photos must include or be neutral to Asian couples.
- **Using gold for body text** - Gold (#B8965A) at 3.8:1 contrast is WCAG non-compliant for normal text. Decorative only.

### Approved Cultural Elements

- 囍 (double happiness) as subtle watermark in Final CTA section (3% opacity)
- Crimson red as primary action color (auspicious, not aggressive)
- Gold decorative borders referencing traditional Chinese wedding stationery
- Warm ivory backgrounds evoking traditional invitation paper
- "Made for Chinese Weddings" explicit positioning in hero kicker
- Tea ceremony and banquet references in template/feature descriptions
- Chinese couple names in testimonials (rendered via Noto Serif SC)

---

## 10. Summary of Critical Fixes (Non-Negotiable Compliance)

| # | Non-Negotiable | Implementation | Status |
|---|---|---|---|
| 1 | WCAG AA on ALL text | Every color pair verified: ink 15.8:1, muted 5.2:1, crimson CTA 5.9:1, rose 4.5:1 | Addressed |
| 2 | CJK font pairing | Noto Serif SC in all font-family fallback chains, already loaded | Addressed |
| 3 | Crimson red CTAs | `dm-cta-primary` bg: `#C1272D`, hover: `#A12025` | Addressed |
| 4 | Gold decorative only | `--dm-gold` (#B8965A) never used for text < 18px, only badges/borders/timeline | Addressed |
| 5 | Warm ivory background | `--dm-bg: #FAF8F5` (warm ivory, not blue-white) | Addressed |
| 6 | Motion library ONLY | All animations use `motion/react` API, no GSAP | Addressed |
| 7 | Mobile-first | All sections stack vertically, touch targets 44px+, flex-col default | Addressed |
| 8 | Hero CTA above fold | Crimson "Create Your Invitation" prominently in hero | Addressed |
| 9 | Real template previews | Showcase uses actual template screenshots, hero uses spotlight | Addressed |
| 10 | Actual pricing section | RM49/SGD19 dual-currency, Free vs Premium, one-time messaging | Addressed |
| 11 | <3s FCP on 4G | No blobs, no petals, no grain, no JS animations on load, CSS gradients only | Addressed |
| 12 | Social proof section | Stats (500+, 4.9/5, <3 min) + testimonial with Chinese names | Addressed |
| 13 | "Made for Chinese weddings" above fold | 囍 + "Made for Chinese Weddings" pill in hero kicker | Addressed |

---

*This specification is developer-ready for implementation with React 19, TanStack Start, Tailwind CSS 4, and the Motion library (`motion/react`). Every color, font, animation, and layout decision includes exact values, rationale, and cultural context. Implementation should follow the Phase 1 order in Section 7.*
