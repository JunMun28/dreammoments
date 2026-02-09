# Final Recommendation: DreamMoments Landing Page Redesign

**Author**: Product Manager
**Date**: February 2026
**Status**: APPROVED FOR IMPLEMENTATION

---

## 1. THE WINNER: Hybrid Approach -- "Cultural Editorial"

### Decision

No single proposal wins outright. The winning direction is a **hybrid of Proposal B's editorial architecture + Proposal A's typographic drama + Proposal C's cultural authenticity**, refined through the critic's lens.

### Why This Hybrid Wins (Business Case)

**For the target audience (Chinese couples, 25-35, Malaysia/Singapore):**
- These couples are digitally fluent but culturally grounded. They want something that feels *premium* and *modern* while honoring their heritage. A Canva-style tool feels generic. A traditional Chinese wedding site feels dated. The hybrid occupies the sweet spot: editorial sophistication that speaks Chinese.
- The bilingual typography (Chinese kickers alongside English headlines) creates an instant "this is for me" moment that no Western competitor (WithJoy, Zola, The Knot) can replicate.
- The price point (Free + RM49/SGD19) means we need to convert on the *first visit*. The page must communicate quality fast enough to justify even a modest payment. Editorial design signals "premium" faster than any amount of copy.

**Why it beats competitors:**
- **WithJoy / Zola / The Knot**: Western-first platforms with "Chinese wedding" as an afterthought theme. Our cultural integration is structural, not decorative.
- **Local alternatives (Paperless Post MY, Canva templates)**: Generic tools with no cultural identity. Our landing page *is* the brand differentiator.
- **Local wedding card printers going digital**: They understand Chinese weddings but lack modern web design sensibility. We bridge both worlds.

**The hybrid approach de-risks the two biggest concerns from the critique:**
1. Proposal A's cultural thinness -- solved by C's bilingual typography and cultural motifs.
2. Proposal C's conversion-killing spectacle -- solved by B's editorial restraint and safe scroll behavior.

---

## 2. CHERRY-PICKED ELEMENTS

### From Proposal A ("Cinematic Luxury") -- KEEP:
- **8.5rem hero headline** (`clamp(4rem, 10vw + 1rem, 8.5rem)`). This is the single most impactful change. Non-negotiable.
- **Horizontal scroll showcase** with parallax images and snap points. The critic calls this "the correct structural choice." Replace the static 4-column grid.
- **Magnetic CTA buttons** (desktop only, with `pointer: fine` media query). Delightful micro-interaction with proven engagement lift.
- **3D card tilt on the hero template preview** (desktop only). Creates perceived quality.
- **Crimson/gold on warm white palette strategy**. The warm neutrals are correct for the brand.
- **Floating gold particles in Final CTA** (reduced count: 4-5 particles, very subtle).
- **Counter animation on stat numbers** (GSAP CountUp, triggered on scroll).

### From Proposal B ("Botanical Editorial") -- KEEP:
- **Color-blocking section rhythm**. The alternation of distinct background colors creates memorable visual rhythm. Adapt the palette (see Section 3).
- **Clip-path section transitions**. The critic calls these "the best transitions across all three proposals." Use instead of scroll-jacking for section changes.
- **2-row asymmetric masonry grid** for the showcase section as the *mobile fallback* (when horizontal scroll is disabled).
- **Botanical SVG line-drawing system** (simplified: 6-8 SVGs, CSS `stroke-dasharray` animation instead of GSAP DrawSVG). Peonies and cloud motifs create an ownable identity.
- **Editorial grid system** (12-column with varying widths). Brings magazine-quality layout.
- **Pull-quote styling for testimonials** (Cormorant Garamond italic with decorative quotation mark).
- **Contrast ratio documentation approach**. Every color pair will have pre-validated contrast.
- **Comprehensive accessibility strategy** (aria-hidden decoratives, focus-visible states, reduced motion).

### From Proposal C ("Modern Chinese Maximalism") -- KEEP:
- **Bilingual Chinese/English kickers** ("喜事来了", "四款精选", "五步成礼", "简单定价"). This is the strongest cultural move across all proposals. Chinese characters as display art, not hidden translations.
- **Calligraphy stroke animation** in the Final CTA (scaled to 4 characters max: "爱情故事"). Triggered on scroll, not as entrance blocker.
- **Paper-cut `clip-path` section borders** (jianzhi-inspired scalloped edges). Culturally rich, technically lightweight.
- **Red envelope "Most Popular" badge** on premium pricing card. Culturally clever micro-detail.
- **Golden thread timeline** for How It Works (SVG stroke animation on scroll). More visually interesting than B's horizontal zigzag or A's overly complex sticky split.
- **Cultural pattern overlays** (lattice/cloud motifs at 4-6% opacity). Creates texture without competing with content.

### EXPLICITLY EXCLUDED:
| Element | Source | Why Excluded |
|---------|--------|-------------|
| Lenis smooth scroll | A | Overrides native scrolling, breaks accessibility, disabled on iOS anyway. Zero value for 60%+ mobile users. |
| 2.4s hongbao entrance animation | C | Destroys LCP, causes bounce. The concept is brilliant but the execution is a conversion killer. |
| Cursor gold particle trail | C | Gratuitous, distracting, performance tax. Adds no conversion value. |
| Dual-direction marquee | C | 2005 pattern that signals cheapness. Use static stats with counter animation. |
| MorphSVG botanical blooming | B | Requires $199/year GSAP Business license. Replace with opacity crossfade between bud/bloom states. |
| Horizontal zigzag timeline | B | Looks clever on paper, terrible for scanability. Use vertical with golden thread. |
| JetBrains Mono for prices | C | Monospace coding font on a wedding site is tonally wrong. Use Playfair Display for price figures. |
| Ma Shan Zheng for all Chinese | C | Recognizable as a free Google Font. Use Noto Serif SC for Chinese display text instead (already loaded, higher quality). |
| Film grain overlay | A | Performance cost for barely perceptible effect. Not worth it. |
| SplitText char-by-char reveals | A | Requires $99-$199/year GSAP Club. Replace with word-level CSS clip-path animation (free, nearly as impressive). |
| Deep emerald sections | B | Reads as "financial services." Replace with warm charcoal/dark sections using existing `--dm-dark-bg`. |
| Imperial purple section | C | Tonal whiplash is too extreme. Replace with existing dark warm tone. |
| Card 3D flip on click | C | Hides information behind interaction. Show template details on hover overlay instead. |
| Drop caps | B | Hard to implement well across browsers, easy to look broken. Not worth the risk. |

---

## 3. FINAL DESIGN SPECIFICATION

### 3.1 Color Palette

#### Primary Palette (Updated)

| Token | Hex | Usage | Contrast on --dm-bg |
|-------|-----|-------|---------------------|
| `--dm-bg` | `#FAF8F5` | Page background (warm white) | -- |
| `--dm-surface` | `#FFFFFF` | Card surfaces, elevated elements | -- |
| `--dm-surface-muted` | `#F5F2EE` | Alternating section background (ivory) | -- |
| `--dm-ink` | `#1C1917` | Primary text, headings | 15.4:1 (AAA) |
| `--dm-muted` | `#6B6560` | Secondary text, descriptions | 5.1:1 (AA) |
| `--dm-border` | `#E8E4DF` | Borders, dividers | -- |

#### Accent Colors (Refined)

| Token | Hex | Usage | Notes |
|-------|-----|-------|-------|
| `--dm-crimson` | `#C1272D` | Primary CTA, hero emphasis, cultural highlights | Keep existing |
| `--dm-crimson-hover` | `#A12025` | CTA hover, active states | Keep existing |
| `--dm-crimson-soft` | `#F9E8E8` | Light crimson tint for badges, section bg | Keep existing |
| `--dm-gold` | `#D4AF37` | **Upgraded from #B8965A**. Richer imperial gold for decorative elements, kickers, ornamental rules, 囍 watermarks | More vibrant, better contrast |
| `--dm-gold-soft` | `#F5EDD5` | Gold-tinted surfaces, pricing background | Keep existing |
| `--dm-rose` | `#C4706B` | Secondary warmth, "Nothing you don't" accent | Keep existing |
| `--dm-rose-soft` | `#F2D5D3` | Rose section background (replaces B's rose-blush) | Keep existing |

#### Section Color Strategy (NEW)

```
[WARM WHITE]   Hero                    --dm-bg
[ROSE SOFT]    Social Proof            --dm-rose-soft (warm strip, not emerald)
[WARM WHITE]   Showcase                --dm-bg
[CRIMSON SOFT] How It Works            --dm-crimson-soft (light, warm)
[WARM WHITE]   Features                --dm-bg (inside container card)
[GOLD SOFT]    Pricing                 --dm-gold-soft
[DARK]         Final CTA               --dm-dark-bg (#1C1917)
[WARM WHITE]   Footer                  --dm-bg
```

**Rationale**: The critic correctly identified that emerald reads as "financial services." We replace B's emerald blocks with our existing warm tones (rose-soft, crimson-soft, gold-soft) which are culturally appropriate (warm = celebration in Chinese aesthetics) and already defined in the codebase. The dark Final CTA section creates the dramatic contrast needed for emotional climax without the tonal whiplash of C's multiple vivid sections.

#### Usage Rules

1. **Crimson is the power color.** CTAs, hero emphasis word, cultural badges, active states. Never for body text.
2. **Gold is decorative only.** Kickers, ornamental rules, 囍 watermarks, premium elements. Never for text smaller than 18px.
3. **One dark section maximum.** Only the Final CTA uses the dark background. All other sections use warm light tones.
4. **No pure whites, no pure blacks.** Everything has warmth. `--dm-bg` (#FAF8F5) is warm. `--dm-ink` (#1C1917) is warm brown-black.
5. **Gold gradients allowed** for decorative horizontal rules: `linear-gradient(90deg, transparent, var(--dm-gold), transparent)`.

### 3.2 Typography

#### Font Stack

| Token | Family | Fallback | Usage |
|-------|--------|----------|-------|
| `--font-display` | **Playfair Display** | "Noto Serif SC", Georgia, serif | Hero headline, section titles, price values, pull-quotes |
| `--font-body` | **Inter** | "Noto Serif SC", system-ui, sans-serif | Body copy, CTAs, navigation, descriptions |
| `--font-accent` | **Cormorant Garamond** | "Noto Serif SC", Georgia, serif | Kickers, testimonial quotes, decorative sub-text |
| `--font-chinese` | **Noto Serif SC** | "Songti SC", serif | Chinese kicker text (囍, 喜事来了, 四款精选, etc.) |

**No new fonts added.** All four are already loaded in the current codebase. This keeps font weight at zero additional bytes.

#### Type Scale (UPDATED)

| Token | Size | Change from Current |
|-------|------|---------------------|
| `--text-hero` | `clamp(4rem, 10vw + 1rem, 8.5rem)` | **UP from clamp(2.75rem, 6vw + 1rem, 5rem)**. This is THE move. |
| `--text-section` | `clamp(2.25rem, 5vw + 0.5rem, 4rem)` | Up from clamp(2rem, 4vw + 0.5rem, 3.5rem) |
| `--text-subsection` | `clamp(1.5rem, 3vw + 0.25rem, 2.25rem)` | NEW. For pull-quotes, sub-headings |
| `--text-kicker` | `0.8125rem` (13px) | NEW. For section kickers (uppercase, tracked) |
| `--text-body-lg` | `clamp(1.0625rem, 0.8vw + 0.5rem, 1.25rem)` | Slight adjustment for lead paragraphs |
| `--text-body` | `1rem` | No change |
| `--text-sm` | `0.875rem` | No change |
| `--text-xs` | `0.75rem` | No change |

#### Typography Rules

1. **Hero headline at 8.5rem desktop (136px)**. This is the editorial statement. Playfair Display 700, tracking -0.035em, line-height 1.05.
2. **Section kickers always uppercase** with wide tracking (0.15em). Use Cormorant Garamond for English, Noto Serif SC for Chinese.
3. **Chinese kickers are display elements.** Rendered at 1.5-2rem, Noto Serif SC 700, positioned above the English section title. They are graphic art, not translations.
4. **Italic emphasis in Cormorant Garamond** or Playfair Display italic for emotional keywords ("remember", "Nothing you don't", "treasure").
5. **Body text line-height: 1.7.** Max line width: 65ch.

### 3.3 Layout (Section-by-Section)

#### Hero Section

```
Full viewport height (100svh). Split: 55% left / 45% right on desktop.

+------------------------------------------------------------------+
|  [Subtle radial crimson glow at center-left]                     |
|  [Botanical peony SVG, 8% opacity, partially visible right side] |
|                                                                    |
|  [Chinese badge: 囍 Made for Chinese Weddings] [AI-Powered]       |
|                                                                    |
|  Beautiful invitations                                             |
|  your guests will                   +-------------------+         |
|  remember.                          |  [Template card    |         |
|     ^^^^^^^^^ (crimson italic)      |   with 3D tilt    |         |
|                                     |   on mouse move]  |         |
|  Create a stunning digital...       |   9:16 aspect     |         |
|                                     |   rounded-3xl     |         |
|  [Create Your Invitation] [Browse]  +-------------------+         |
|                                          [Floating badge]          |
|  Free | No card | PDPA                                            |
+------------------------------------------------------------------+
```

**Key changes from current:**
- Hero headline 2x larger (8.5rem vs 5rem)
- Template card gets 3D perspective tilt on mouse move (desktop only, max 8deg)
- Radial crimson glow background for warmth
- Botanical peony SVG as background element (CSS stroke-dasharray draw on load)
- Magnetic CTA buttons (desktop only)
- Gold hairlines for trust indicator dividers

#### Social Proof Section

```
Rose-soft background (#F2D5D3). Full-width strip. Centered content.

+------------------------------------------------------------------+
|  ───── gold ornamental rule ─────                                 |
|                                                                    |
|   500+              4.9/5            < 3 min                      |
|   Couples served    Average rating   Setup time                   |
|   (counter anim)    (counter anim)   (counter anim)               |
|                                                                    |
|   "Our guests kept saying the invitation was the most beautiful   |
|    they'd ever received..."                                       |
|                  -- Wei Lin & Jun Hao                              |
|                                                                    |
|  ───── gold ornamental rule ─────                                 |
+------------------------------------------------------------------+
```

**Key choices:**
- Static stats with counter animation (NOT marquee)
- Testimonial in Cormorant Garamond italic with decorative gold quotation mark
- Gold ornamental rules (gradient: transparent -> gold -> transparent)
- Rose-soft background creates warm strip that feels celebratory

#### Showcase Section (THE WOW MOMENT)

```
Desktop: Horizontal scroll-jacking with GSAP ScrollTrigger.
Mobile: Native horizontal swipe with scroll-snap.

+------------------------------------------------------------------+
|  PINNED SECTION (100vh)                                           |
|                                                                    |
|  "四款精选" (Noto Serif SC, gold, 1.75rem)                         |
|  The Collection                                                   |
|  Four templates, crafted for Chinese weddings.                    |
|                                                                    |
|  +----------+ +----------+ +----------+ +----------+             |
|  |  [3:4]   | |  [3:4]   | |  [3:4]   | |  [3:4]   |            |
|  |  Card w/  | |  Card w/  | |  Card w/  | |  Card w/ |           |
|  |  parallax | |  parallax | |  parallax | |  parallax|           |
|  |  image   | |  image   | |  image   | |  image   |             |
|  +----------+ +----------+ +----------+ +----------+             |
|                                                                    |
|  [Progress: ---- o ---- o ---- o ---- o ----]                    |
+------------------------------------------------------------------+
```

**Key choices:**
- Horizontal scroll-jacking on desktop (GSAP ScrollTrigger pin + scrub + snap)
- Cards at 65vh height, generous padding, parallax images inside
- Chinese kicker "四款精选" above English title
- On mobile: native `scroll-snap-type: x mandatory` carousel (NO GSAP scroll-jacking)
- Progress dots synced with scroll position
- Hover: card scales 1.03, image zooms 1.05, overlay slides up from bottom revealing name + "Preview" link

#### How It Works Section

```
Crimson-soft background. Vertical timeline with golden thread.

+------------------------------------------------------------------+
|  "五步成礼" (Noto Serif SC, crimson, 1.75rem)                      |
|  From sign-up to RSVPs in five steps                              |
|                                                                    |
|       [Golden SVG Thread -- animated stroke on scroll]            |
|       |                                                            |
|   01  O──── [Sign up in seconds]                                  |
|       |     [description]                                          |
|       |                                                            |
|   02  O────          [Pick your template]                         |
|       |              [description]                                 |
|       |                                                            |
|   03  O──── [Let AI write your story]                             |
|       |                                                            |
|   04  O────          [Make it yours]                              |
|       |                                                            |
|   05  O──── [Share & track RSVPs]                                 |
+------------------------------------------------------------------+
```

**Key choices:**
- Vertical timeline (NOT horizontal zigzag -- usability over cleverness)
- Golden thread SVG with stroke-dashoffset animation on scroll (GSAP ScrollTrigger, free)
- Step numbers in Playfair Display, 2.5rem, crimson
- Cards alternate left/right of the thread on desktop, single column on mobile
- Step circle fills with crimson as thread reaches it
- Paper-cut scalloped bottom edge (CSS clip-path, 12 scallops)

#### Features Section

```
White background. Split layout inside container card.

+------------------------------------------------------------------+
|  +------------------------------------------------------------+  |
|  |  Container card (rounded-3xl, cream bg, gold-tinted border)|  |
|  |                                                              |  |
|  |  "为何选择" (Noto Serif SC, crimson, subtle)                  |  |
|  |  +-- Features (50%) --+  +-- Mockup (50%) --------+        |  |
|  |  |                    |  |  [Editor preview with   |        |  |
|  |  | Everything you     |  |   subtle perspective    |        |  |
|  |  | need. Nothing you  |  |   tilt on scroll]      |        |  |
|  |  | don't.             |  |                         |        |  |
|  |  |                    |  |                         |        |  |
|  |  | [Icon] AI-Powered  |  |                         |        |  |
|  |  | [Icon] Chinese Wed |  |                         |        |  |
|  |  | [Icon] One-Tap     |  |                         |        |  |
|  |  | [Icon] Dashboard   |  |                         |        |  |
|  |  | [Icon] Every Screen|  |                         |        |  |
|  |  +--------------------+  +-------------------------+        |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

**Key choices:**
- Keep the existing container card approach (works well)
- Add Chinese kicker above English title
- Feature icon circles get crimson-to-gold gradient border
- Mockup gets subtle 3D perspective tilt driven by scroll (GSAP, max 5deg rotateY)
- "Nothing you don't" in Cormorant Garamond italic, crimson

#### Pricing Section

```
Gold-soft background. Two cards centered.

+------------------------------------------------------------------+
|  "简单定价" (Noto Serif SC, gold, 1.75rem)                         |
|  One price. No subscriptions.                                     |
|  [MYR (Malaysia) / SGD (Singapore)]                               |
|                                                                    |
|  +-------------------+    +------------------------+              |
|  |  Free             |    | [红包 Badge: Most Pop.] |             |
|  |  RM 0             |    |  Premium                |             |
|  |  (Playfair, 4rem) |    |  RM 49 / SGD 19        |             |
|  |  [features]       |    |  (Playfair, 4rem, gold  |             |
|  |  [Get Started]    |    |   counter animation)    |             |
|  +-------------------+    |  [features]             |             |
|                            |  [Upgrade for RM49]     |             |
|                            +------------------------+              |
+------------------------------------------------------------------+
```

**Key choices:**
- Gold-soft background creates visual distinction
- Premium card has 3px gold border + crimson-to-gold gradient top bar (4px)
- Red envelope "Most Popular" badge (hongbao-styled) from Proposal C
- Price values in Playfair Display with counter animation on scroll
- Premium card elevated with subtle glow shadow
- Free card uses dashed border (intentionally understated)

#### Final CTA Section (Emotional Climax)

```
Dark background (#1C1917). Centered. Calligraphy + CTA.

+------------------------------------------------------------------+
|  [Gold ornamental rule]                                           |
|  [Giant 囍 watermark, 3% opacity, gold, 25rem]                    |
|  [4-5 floating gold particles, very subtle]                       |
|                                                                    |
|  "爱情故事" (calligraphy stroke animation, gold, 3rem)              |
|  Your love story awaits (Cormorant italic, gold)                  |
|                                                                    |
|  Create an invitation                                              |
|  your guests will treasure.                                        |
|  (Playfair Display, 4rem, cream)                                   |
|                                                                    |
|  [Create Your Invitation]                                          |
|  (Crimson CTA with gold shimmer, auto-every-4s)                   |
|                                                                    |
|  Free to start. No credit card.                                    |
|  [Gold ornamental rule]                                            |
+------------------------------------------------------------------+
```

**Key choices:**
- Calligraphy stroke animation for "爱情故事" (4 characters, SVG stroke-dashoffset, GSAP ScrollTrigger)
- Giant 囍 watermark with slow rotation (120s full rotation, barely perceptible)
- 4-5 floating gold particles (GSAP infinite tween, very subtle)
- CTA button with auto gold shimmer sweep every 4s
- Word-by-word text reveal (CSS clip-path animation, no premium plugins needed)

### 3.4 Animations (GSAP Strategy)

#### Dependencies (ZERO premium plugin cost)

| Package | Cost | Purpose |
|---------|------|---------|
| `gsap` (core) | Free | Animation engine |
| `ScrollTrigger` | Free | Scroll-driven animations, pinning |
| No Lenis | -- | Native scroll everywhere |
| No SplitText | -- | Replace with custom word-splitter utility |
| No DrawSVG | -- | Replace with CSS stroke-dasharray/dashoffset |
| No MorphSVG | -- | Replace with opacity crossfade |

**Total annual licensing cost: $0**

#### Animation Catalog (Prioritized by Impact-to-Effort)

**HIGH IMPACT, LOW EFFORT (Phase 1):**

| Animation | Technique | Where |
|-----------|-----------|-------|
| Hero text reveal | CSS clip-path word-by-word (JS splits words, CSS animates) | Hero headline |
| Counter animation | GSAP `snap` + `innerText` tween | Social Proof stats, pricing |
| Staggered entrance | GSAP ScrollTrigger batch with `y: 30, opacity: 0` | All section content |
| Gold ornamental rules | GSAP width 0% -> 100% on scroll | Social Proof, Final CTA |
| CTA shimmer | CSS `@keyframes` gold highlight sweep | Primary CTAs |
| Hover card lift | CSS `translateY(-4px)` + shadow increase | Template cards, feature items |

**HIGH IMPACT, MEDIUM EFFORT (Phase 2):**

| Animation | Technique | Where |
|-----------|-----------|-------|
| Horizontal scroll showcase | GSAP ScrollTrigger pin + scrub + snap | Showcase section (desktop) |
| Parallax images in cards | GSAP ScrollTrigger scrub `xPercent: -15` | Showcase cards |
| Golden thread stroke | CSS `stroke-dashoffset` + GSAP ScrollTrigger | How It Works timeline |
| 3D card tilt (hero) | JS mousemove + GSAP `rotateY/rotateX` | Hero template card |
| Magnetic CTA buttons | JS mousemove + GSAP with elastic ease | Primary CTAs (desktop) |
| Calligraphy stroke reveal | CSS `stroke-dashoffset` + GSAP ScrollTrigger | Final CTA Chinese text |
| Clip-path section transitions | GSAP ScrollTrigger + CSS `clip-path` | Between color-block sections |

**MEDIUM IMPACT, MEDIUM EFFORT (Phase 3):**

| Animation | Technique | Where |
|-----------|-----------|-------|
| Botanical SVG draw | CSS `stroke-dasharray/dashoffset` on scroll | Hero background, section accents |
| Floating gold particles | GSAP infinite tween with randomized y/x | Final CTA section |
| 3D perspective tilt on scroll | GSAP ScrollTrigger `rotateY` scrub | Features mockup |
| Paper-cut clip-path borders | Static CSS `clip-path: polygon(...)` | How It Works bottom edge |
| Progress dots (showcase) | JS IntersectionObserver opacity sync | Showcase section |

#### Easing Reference

| Name | Value | Usage |
|------|-------|-------|
| Default | `power3.out` | Most entrance animations |
| Dramatic | `power4.out` | Hero text reveal |
| Smooth | `power2.inOut` | Horizontal scroll snaps, ornamental rules |
| Springy | `elastic.out(1, 0.4)` | Magnetic button release, card tilt release |
| Bouncy | `back.out(1.5)` | Icon reveals |
| Linear | `none` | Scroll-scrubbed animations |

#### Reduced Motion Handling (NON-NEGOTIABLE)

All animations check `prefers-reduced-motion: reduce`:
- Text reveals: instant, no clip-path
- Scroll-driven animations: disabled, show final state
- Parallax: disabled, all layers at normal scroll speed
- Particles: hidden
- Counters: show final number immediately
- Hover effects: preserved (not scroll-based)
- Focus-visible states: preserved

### 3.5 Cultural Elements

| Element | Source Proposal | How Used | Opacity |
|---------|----------------|----------|---------|
| 囍 (Double Happiness) | A, C | Giant watermark in Final CTA (25rem), small in badges and footer | 3% (watermark), 100% (badges) |
| Peony line art (SVG) | B | Hero background, showcase card corners, footer divider | 6-10% |
| Auspicious cloud (SVG) | B, C | Final CTA background texture, behind pricing | 4-6% |
| Paper-cut border | C | Bottom edge of How It Works section | 100% (structural) |
| Chinese kickers | C | "喜事来了", "四款精选", "五步成礼", "简单定价" -- one per section | 100% (display text) |
| Gold ornamental rules | A, B | Section dividers (gradient horizontal lines) | 100% |
| Calligraphy stroke anim | C | "爱情故事" in Final CTA | 100% (animated) |

**Cultural sensitivity note**: Chinese characters are in simplified Chinese, which is the standard for Malaysian and Singaporean Chinese education. All Chinese text has English equivalents adjacent, ensuring accessibility for non-Chinese-reading users (mixed-heritage couples, English-educated Chinese Malaysians).

### 3.6 Component List (What Needs to Be Built)

#### New Components

```
src/components/landing/
  hooks/
    useGSAP.ts              -- GSAP context + ScrollTrigger init/cleanup
    useMagneticEffect.ts    -- Magnetic cursor effect (desktop, pointer:fine)
    use3DTilt.ts            -- 3D perspective tilt on mouse/scroll
    useCountUp.ts           -- Number counter animation
    useReducedMotion.ts     -- Already exists, integrate into all hooks
    useWordReveal.ts        -- Word-by-word clip-path text reveal (no SplitText)
    useStrokeDraw.ts        -- SVG stroke-dashoffset animation on scroll

  botanicals/
    Peony.tsx               -- SVG peony line art (full bloom + bud variants)
    Cloud.tsx               -- SVG auspicious cloud motif
    DoubleHappiness.tsx     -- 囍 character component (Noto Serif SC 900)
    GoldRule.tsx            -- Ornamental gold gradient horizontal rule

  ui/
    MagneticButton.tsx      -- Button wrapper with magnetic effect
    ProgressDots.tsx        -- Horizontal scroll progress indicator
    CountUpNumber.tsx       -- Animated number counter
    FloatingParticles.tsx   -- Gold particle ambient effect (Final CTA only)
    PaperCutBorder.tsx      -- CSS clip-path jianzhi-style section edge
    CalligraphyReveal.tsx   -- SVG stroke animation for Chinese characters
```

#### Refactored Components

```
  Hero.tsx                  -- Major refactor (large type, 3D card, botanicals)
  SocialProof.tsx           -- Refactor (counter animations, pull-quote styling)
  Showcase.tsx              -- Major refactor (horizontal scroll + mobile carousel)
  HowItWorks.tsx            -- Refactor (golden thread, alternating cards)
  Features.tsx              -- Moderate refactor (gradient icons, scroll tilt)
  Pricing.tsx               -- Moderate refactor (hongbao badge, counter, gold bg)
  FinalCTA.tsx              -- Major refactor (calligraphy, particles, dark bg)
  Footer.tsx                -- Minor updates (gold accents, Playfair wordmark)
  animation.ts              -- Replace with GSAP config (keep as bridge during migration)
```

**Total new components: ~15**
**Total refactored components: ~9**

---

## 4. IMPLEMENTATION ROADMAP

### Phase 1: MVP (Weeks 1-2) -- Maximum Impact

**Goal**: Ship the changes that create the biggest visual impact with the least complexity.

**Week 1:**
- [ ] Install GSAP + ScrollTrigger; create `useGSAP` hook with context cleanup
- [ ] Update CSS variables: hero type scale to 8.5rem, add gold upgrade (#D4AF37), add new section backgrounds
- [ ] Refactor Hero: oversized headline, radial glow background, improved CTA styling
- [ ] Build `CountUpNumber` component; integrate into SocialProof
- [ ] Add Chinese kickers to all section headers (static text, Noto Serif SC)
- [ ] Build `GoldRule` component; add to SocialProof and Final CTA
- [ ] Refactor SocialProof: rose-soft background, pull-quote testimonial styling

**Week 2:**
- [ ] Refactor Pricing: gold-soft background, hongbao badge, gold border on premium card, counter animation
- [ ] Refactor Final CTA: dark background, giant 囍 watermark, CTA shimmer, word-by-word text reveal
- [ ] Build `PaperCutBorder` component; add to How It Works bottom edge
- [ ] Update section backgrounds to color-blocking rhythm
- [ ] Basic GSAP ScrollTrigger entrance animations (replace Framer Motion fade-ups with staggered reveals)
- [ ] Mobile QA pass (test on Chrome Android, Safari iOS, Samsung Internet)

**Phase 1 delivers**: Dramatically improved visual impact, cultural identity, color-blocking rhythm, counter animations, and editorial typography. The page goes from B+ to A- without any complex scroll-jacking or interactive effects.

### Phase 2: Enhancement (Weeks 3-4) -- Interactive Wow

**Week 3:**
- [ ] Build horizontal scroll showcase (GSAP ScrollTrigger pin + scrub + snap)
- [ ] Build mobile showcase carousel (scroll-snap, IntersectionObserver for progress dots)
- [ ] Build `ProgressDots` component
- [ ] Build `use3DTilt` hook; integrate into hero template card (desktop only)
- [ ] Build golden thread SVG + `useStrokeDraw` hook for How It Works
- [ ] Refactor How It Works: alternating cards, golden thread animation

**Week 4:**
- [ ] Build `CalligraphyReveal` component for Final CTA ("爱情故事" SVG stroke animation)
- [ ] Build `MagneticButton` wrapper; integrate into primary CTAs (desktop only)
- [ ] Build clip-path section transitions (2-3 key transitions: into dark Final CTA, into rose SocialProof)
- [ ] Build `FloatingParticles` for Final CTA (4-5 gold particles)
- [ ] Features mockup 3D perspective tilt on scroll
- [ ] Performance audit (Lighthouse, CWV measurement)

**Phase 2 delivers**: The horizontal scroll showcase (the Awwwards moment), interactive cursor effects, calligraphy animation, golden thread, and clip-path transitions. The page goes from A- to A+.

### Phase 3: Polish (Weeks 5-6) -- Botanical Layer + Refinement

- [ ] Commission/create 6-8 botanical SVG illustrations (peony, cloud, vine)
- [ ] Build botanical components (`Peony.tsx`, `Cloud.tsx`)
- [ ] Integrate botanical SVGs with CSS stroke-dasharray draw animations
- [ ] Add botanical background to Hero (partially visible peony)
- [ ] Add cloud motifs to Final CTA and Pricing backgrounds
- [ ] Add lattice pattern overlay to showcase section (4% opacity)
- [ ] A/B test: current landing page vs redesign
- [ ] Iterate based on conversion data

### What to A/B Test

| Test | Hypothesis | Metric |
|------|-----------|--------|
| Old vs new landing page | New design increases signup conversion | Signup rate |
| Horizontal scroll vs masonry grid (showcase) | Horizontal scroll increases template preview clicks | Template preview click rate |
| With vs without Chinese kickers | Bilingual text increases trust/engagement for target audience | Time on page, scroll depth |
| CTA text: "Create Your Invitation" vs "Start Your Story" | Emotional framing increases click-through | CTA click rate |
| Hongbao badge vs standard badge (pricing) | Cultural badge increases premium conversion | Premium upgrade rate |

---

## 5. CONVERSION OPTIMIZATION

### CTA Placement Strategy

| Location | CTA Text | Type | Priority |
|----------|----------|------|----------|
| Hero (above fold) | "Create Your Invitation" | Primary (crimson) | Highest -- first action point |
| Hero (above fold) | "Browse Templates" | Secondary (outlined) | High -- alternative entry |
| Showcase (after templates) | "Preview" link on each card | Text link | Medium -- contextual |
| Pricing (premium card) | "Upgrade for RM49" | Primary (crimson) | High -- conversion point |
| Final CTA (page bottom) | "Create Your Invitation" | Primary (crimson, large, shimmer) | High -- emotional close |

**Rules:**
- Maximum 2 CTAs visible at any time (primary + secondary)
- Primary CTA always crimson. No other element uses this color as background.
- Secondary CTA always outlined with text color. Never competes visually with primary.
- Final CTA section is the emotional close -- the shimmer animation draws the eye without being obnoxious.

### Trust Signal Positioning

| Signal | Location | Rationale |
|--------|----------|-----------|
| "Free to start" | Hero trust line, Final CTA | Removes cost objection |
| "No credit card" | Hero trust line, Final CTA | Removes friction objection |
| "PDPA compliant" | Hero trust line, Footer | Addresses Malaysian/Singaporean privacy concern |
| 500+ couples stat | Social Proof | Social proof (counter animation draws attention) |
| 4.9/5 rating | Social Proof | Quality proof |
| < 3 min setup time | Social Proof | Speed proof (addresses "will this take long?" objection) |
| Testimonial quote | Social Proof | Emotional proof (real couple, specific detail) |
| "One-time payment" | Pricing subtitle | Addresses subscription fatigue |
| "Not a subscription" | Pricing premium card | Reinforces one-time model |

### Mobile-First Decisions (60%+ Traffic)

1. **No GSAP scroll-jacking on mobile** (< 768px). All ScrollTrigger pinning disabled. Native scroll always.
2. **No cursor-dependent effects on mobile**. Magnetic buttons, 3D tilt disabled. Use `:active` scale(0.97) for tactile feedback.
3. **Hero headline still bold on mobile** (4rem / 64px minimum). Never sacrifice typographic impact.
4. **CTAs are full-width on mobile**. Stacked vertically, primary above secondary. Minimum 56px height for comfortable tapping.
5. **Showcase becomes native swipe carousel** with scroll-snap. Cards at 85% viewport width, next card peeking.
6. **Chinese kickers preserved on mobile**. They are small and do not consume significant space.
7. **Botanical SVGs reduced to 50% density on mobile**. Performance and visual clarity.
8. **Calligraphy animation preserved on mobile** (4 characters is fast enough). This is the cultural moment.
9. **Floating particles reduced to 2-3 on mobile**. Performance budget.

### Page Load Performance Budget

| Metric | Target | Current Estimate |
|--------|--------|------------------|
| LCP | < 2.5s | Hero image with `fetchPriority="high"` + no entrance blocker |
| CLS | < 0.1 | No scroll-jacking CLS (pinned sections have explicit height) |
| INP | < 200ms | Magnetic button debounced at 16ms; no heavy JS on interaction |
| Total JS (landing page) | < 150KB gzipped | GSAP core (~28KB) + ScrollTrigger (~12KB) + page JS (~50KB) + React (~40KB) |
| Total images | < 400KB | 4 template previews (WebP/AVIF, lazy loaded except hero) |
| Total fonts | 0KB additional | All fonts already loaded in current codebase |
| Total SVG (botanicals) | < 40KB | 6-8 inline SVGs, compressed |
| First Contentful Paint | < 1.2s | Hero text renders immediately (no blocking animation) |

### Above-the-Fold Content Priorities

On a 1440x900 desktop viewport, the user sees:
1. **Hero headline** (largest element, immediate brand impression)
2. **Template preview card** (shows the product instantly)
3. **Primary CTA** ("Create Your Invitation" in crimson -- highest contrast)
4. **Cultural badges** (囍 + AI-Powered -- establishes identity)
5. **Trust indicators** (Free / No card / PDPA -- removes objections)

On a 390x844 mobile viewport (iPhone 14), the user sees:
1. **Cultural badges** (top of stack)
2. **Hero headline** (still large at 4rem)
3. **Subtitle** (just visible)
4. **Primary CTA** (may need to scroll slightly -- acceptable, as the headline hooks them)

---

## 6. RISK ASSESSMENT

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| GSAP ScrollTrigger horizontal scroll breaks on specific browsers | Medium | High | Test early on Safari, Firefox, Samsung Internet. Have masonry grid as fallback. Feature-flag the horizontal scroll. |
| SVG stroke animations jank on low-end Android | Medium | Medium | Use `will-change: stroke-dashoffset` only during animation. Reduce SVG path complexity. Test on Redmi Note series. |
| Clip-path transitions glitch on older Samsung Internet | Low | Medium | Test on Samsung Internet 20+. Fallback to simple opacity transitions. |
| 3D perspective transforms cause layout issues in RTL | Low | Low | Not currently supporting RTL, but use `logical properties` where possible. |
| GSAP bundle size impacts TTI | Low | Medium | Tree-shake unused GSAP features. Lazy load ScrollTrigger only when landing page route is active. |

### Conversion Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Horizontal scroll-jacking confuses older users | Medium | High | A/B test. Add a subtle scroll indicator. Ensure snap points are tight (0.2-0.4s). Provide keyboard navigation (arrow keys). |
| Color-blocking creates "end of page" illusion | Low | Medium | Ensure each color transition has visible content "peeking" from the next section. Use clip-path transitions to create continuity. |
| Chinese kickers alienate non-Chinese-reading visitors | Low | Low | English title is always the primary element. Chinese is supplementary and decorative. |
| Page feels "too designed" and not trustworthy for price-sensitive users | Low | Medium | Trust signals (free tier, no subscription, PDPA) counter this. The design communicates quality, which justifies RM49. |

### Performance Risks

| Risk | CWV Target | Mitigation |
|------|-----------|------------|
| LCP > 2.5s | LCP < 2.5s | Hero image with `fetchPriority="high"`, no entrance animation blocking content. Inline critical CSS. |
| CLS from pinned sections | CLS < 0.1 | Explicit `min-height` on showcase section before ScrollTrigger initializes. Use `invalidateOnRefresh: true`. |
| INP from mousemove handlers | INP < 200ms | Debounce magnetic/tilt calculations at 16ms. Use `will-change: transform` only during animation. |
| Frame drops on $200 Android phones | 60fps target | Max 3 concurrent ScrollTrigger instances on mobile. Disable particles. Reduce botanical density. Test on Redmi Note 12. |

### Cultural Sensitivity Considerations

1. **Simplified vs Traditional Chinese**: Use simplified Chinese (standard in Malaysia/Singapore Chinese education). Add a note in the backlog to consider Traditional Chinese for Hong Kong/Taiwan expansion.
2. **囍 character accuracy**: Ensure the double happiness character renders correctly across all fonts. Always use Noto Serif SC 900 weight.
3. **Color meaning**: Red and gold are universally auspicious in Chinese culture. No risk here.
4. **Inclusivity**: Some Chinese Malaysian couples may have non-Chinese partners. The design uses Chinese elements as cultural pride, not exclusion. English is always the primary language. The product serves "Chinese weddings" (the cultural event) not "Chinese couples" exclusively.
5. **Religious sensitivity**: Avoid explicitly Buddhist/Taoist imagery. Peonies, clouds, and double happiness are secular cultural symbols appropriate for all Chinese weddings regardless of religious background.

---

## 7. SUCCESS METRICS

### Primary KPIs (Post-Launch)

| KPI | Current Baseline | Target | Measurement |
|-----|-----------------|--------|-------------|
| Signup conversion rate (landing -> signup) | Establish baseline | +30% improvement | Analytics event tracking |
| Bounce rate | Establish baseline | -20% reduction | Analytics |
| Average scroll depth | Establish baseline | 70%+ reach pricing section | ScrollTrigger progress callback |
| Template preview click rate | Establish baseline | +50% improvement | Click tracking on showcase cards |
| Premium upgrade rate | Establish baseline | +20% improvement | Payment analytics |
| Time to first CTA click | Establish baseline | < 30 seconds | Event timing |
| Mobile conversion rate specifically | Establish baseline | +25% improvement | Mobile-segmented analytics |

### A/B Testing Plan

**Test 1 (Week of launch)**: Old landing page (control) vs. new landing page (variant)
- Metric: Signup conversion rate
- Traffic split: 50/50
- Duration: 2 weeks minimum, 1000 signups per variant for significance
- Kill criteria: If variant conversion drops > 15%, revert immediately

**Test 2 (Week 3-4)**: Showcase section -- horizontal scroll (variant A) vs. masonry grid (variant B)
- Metric: Template preview clicks, scroll completion past showcase
- Traffic split: 50/50
- Duration: 2 weeks

**Test 3 (Week 5-6)**: With Chinese kickers (variant) vs. English only (control)
- Metric: Time on page, scroll depth, signup rate
- Traffic split: 50/50
- Duration: 2 weeks

### Performance Benchmarks

| Metric | Green | Yellow | Red |
|--------|-------|--------|-----|
| LCP | < 2.0s | 2.0-2.5s | > 2.5s |
| CLS | < 0.05 | 0.05-0.1 | > 0.1 |
| INP | < 100ms | 100-200ms | > 200ms |
| Total page weight | < 800KB | 800KB-1.2MB | > 1.2MB |
| Time to Interactive | < 3.0s | 3.0-4.0s | > 4.0s |
| Lighthouse Performance Score | 90+ | 80-89 | < 80 |

### Monitoring

- Set up Real User Monitoring (RUM) for CWV from day one
- Segment by: device type (mobile/desktop), country (MY/SG), browser
- Alert if any CWV metric enters "Red" zone
- Weekly performance review for first month post-launch

---

## Summary

The "Cultural Editorial" hybrid direction takes the best of each proposal while avoiding the dangerous ideas identified by the critic:

| From | What We Take | What We Avoid |
|------|-------------|---------------|
| **Proposal A** | 8.5rem hero typography, horizontal scroll showcase, magnetic buttons, 3D card tilt, crimson/gold palette | Lenis smooth scroll, SplitText dependency, cultural thinness |
| **Proposal B** | Color-blocking rhythm, clip-path transitions, botanical SVGs, editorial grid, accessibility rigor | Emerald color, MorphSVG dependency, horizontal zigzag timeline, illustration production overhead |
| **Proposal C** | Bilingual Chinese kickers, calligraphy stroke animation, paper-cut borders, hongbao badge, cultural authenticity | 2.4s entrance animation, cursor particles, marquee ticker, Ma Shan Zheng font, JetBrains Mono, tonal whiplash |

**The result**: A landing page that is editorially sophisticated (B), typographically dramatic (A), and culturally authentic (C) -- while being accessible, performant, conversion-optimized, and buildable with zero premium plugin costs.

The target user -- a 28-year-old Chinese Malaysian bride on her lunch break, scrolling on an iPhone -- will see: bold typography that commands attention, a horizontal gallery that makes the templates feel premium, Chinese characters that say "this was made for people like me," and a clear path to creating her invitation for free.

That is the page that converts. Build it.

---

*Approved for implementation. Phase 1 begins immediately.*
