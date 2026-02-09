# DreamMoments Landing Page Redesign v2 -- Final Synthesis

**Date**: February 2026
**Process**: 3 designers + 1 PM + 1 devil's advocate critic
**Status**: READY FOR REVIEW

---

## Executive Summary

After a multi-agent design review with 3 competing proposals, a product requirements analysis, and a ruthless critique, the team recommends:

**Winner: "Cultural Maximalist" (Proposal 3) as the foundation, with surgical cherry-picks from Bold Editorial (Proposal 1) and Immersive Motion (Proposal 2).**

The critic scored:
- Proposal 3 (Cultural Maximalist): **69/100** -- best cultural authenticity (19/20), strongest differentiation
- Proposal 2 (Immersive Motion): **65/100** -- best aesthetic cohesion, best showcase layout
- Proposal 1 (Bold Editorial): **59/100** -- strongest typography vision, best How It Works layout

The synthesis takes Proposal 3's cultural architecture, Proposal 2's masonry showcase grid, and Proposal 1's typographic boldness.

---

## 1. THE DIRECTION: "Cultural Editorial"

### One-Line Vision
A landing page where Chinese wedding culture is the architecture -- not decoration -- presented with editorial confidence and Awwwards-level visual quality, on a bright, celebratory light theme.

### What This Means in Practice
- **Chinese Red and Imperial Gold** are used boldly, not timidly
- **Bilingual kickers** (English-first with Chinese accent) open every section
- **Cultural motifs** (clouds, lattice, paper-cuts, peonies) are structural elements
- **Typography is dramatic** (8.5rem hero headline)
- **No dark theme** -- warm whites, rose softs, gold softs, with ONE dark section (Final CTA) for dramatic contrast
- **GSAP animations** that earn their complexity (no gratuitous motion)
- **Mobile-first** -- 75-85% of traffic arrives via WhatsApp on phones

---

## 2. COLOR PALETTE

### Primary Colors

| Token | Hex | Role |
|-------|-----|------|
| `--dm-bg` | `#FFFAF3` | Warm rice-paper white background (slightly warmer than current #FAF8F5) |
| `--dm-surface` | `#FFFFFF` | Card surfaces, elevated elements |
| `--dm-surface-muted` | `#F5F2EE` | Alternating section backgrounds |
| `--dm-ink` | `#1A1512` | Primary text -- warm brown-black (richer than current) |
| `--dm-muted` | `#6B5744` | Secondary text, captions |
| `--dm-border` | `#E8DECE` | Warm paper-edge borders |

### Accent Colors

| Token | Hex | Role | Cultural Meaning |
|-------|-----|------|-----------------|
| `--dm-crimson` | `#C41E3A` | Primary CTA, hero emphasis, bold section backgrounds | Chinese Red -- joy, celebration, good fortune |
| `--dm-crimson-deep` | `#9B1B30` | CTA hover/active states | Vermillion -- sincerity, depth |
| `--dm-crimson-soft` | `#FDE8EC` | Light tinted surfaces, hero gradient wash | Blush red -- tenderness |
| `--dm-gold` | `#D4AF37` | Decorative headlines, ornamental strokes, dividers | Imperial Gold -- prosperity, royalty (upgraded from #B8965A) |
| `--dm-gold-warm` | `#C5943A` | Secondary accents, icon fills | Warm gold -- the gold of wedding jewelry |
| `--dm-gold-soft` | `#FDF5E0` | Pricing section background, premium card surface | Pale gold -- quiet luxury |
| `--dm-rose` | `#D46B66` | Testimonial accents, secondary warmth | Peony pink -- the "king of flowers" |
| `--dm-rose-soft` | `#FBE0DE` | Social proof section background | Soft rose |

### Section Color Rhythm: "The Heartbeat"

Bold sections alternate with breathing spaces, like the rhythm of a Chinese banquet:

```
1. Hero           → Warm white (#FFFAF3) + crimson/gold radial washes
2. Social Proof   → Rose soft (#FBE0DE) -- a warm breath
3. Showcase       → Chinese Red (#C41E3A) -- THE BOLD MOMENT
4. How It Works   → Warm white (#FFFAF3) -- breathing space
5. Features       → Warm white with container card on muted surface
6. Pricing        → Gold soft (#FDF5E0) -- warm luxury
7. Final CTA      → Ink black (#1A1512) -- dramatic contrast
8. Footer         → Warm white (#FFFAF3) -- quiet resolution
```

**The heartbeat**: rest - rest - **BOLD** - rest - rest - rest - **BOLD** - rest

### Contrast Validation (WCAG AA)

| Foreground | Background | Ratio | Status |
|---|---|---|---|
| White (#FFFFFF) on Chinese Red (#C41E3A) | Red section | 4.8:1 | PASS AA (large text) |
| White (#FFFFFF) on Ink (#1A1512) | Dark section | 17.2:1 | PASS AAA |
| Gold (#D4AF37) on Ink (#1A1512) | Dark section | 7.8:1 | PASS AA |
| Ink (#1A1512) on Warm white (#FFFAF3) | Light sections | 15.6:1 | PASS AAA |
| Crimson (#C41E3A) on Warm white (#FFFAF3) | Light sections | 5.4:1 | PASS AA |

**Critical rule**: Gold text (#D4AF37) is NEVER used on red backgrounds for readable content (2.1:1 = FAIL). Gold on red is decorative only. All readable text on red is WHITE.

---

## 3. TYPOGRAPHY

### Font Stack (Zero Additional Downloads)

| Role | Font | Usage |
|------|------|-------|
| **Display** | Playfair Display 700/900 | Hero headline (8.5rem), section titles, price values |
| **Body** | Inter 400/500/600 | All body text, CTAs, navigation |
| **Accent** | Cormorant Garamond 400i/500i | Section kickers (English), testimonial quotes, romantic accent text |
| **Chinese** | Noto Serif SC 700/900 | Chinese kicker text, 囍 characters, calligraphy display |

All four fonts are already loaded in the current codebase. **Zero additional font bytes.**

### Type Scale

| Token | Value | Purpose |
|-------|-------|---------|
| `--text-hero` | `clamp(3.5rem, 8vw + 1rem, 8.5rem)` | Hero headline -- THE editorial statement (56-136px) |
| `--text-section` | `clamp(2rem, 4vw + 0.5rem, 3.5rem)` | Section English headlines |
| `--text-kicker-cn` | `clamp(1.25rem, 2vw + 0.25rem, 2rem)` | Chinese kickers -- display art |
| `--text-kicker-en` | `0.8125rem` | English kickers -- uppercase, tracked 0.15em |
| `--text-body-lg` | `clamp(1.0625rem, 1vw + 0.25rem, 1.25rem)` | Lead paragraphs, feature descriptions |
| `--text-body` | `1rem` | Standard body copy |
| `--text-sm` | `0.875rem` | Captions, trust indicators |

### Bilingual Kicker Pattern

Every section uses this hierarchy (English-first with Chinese accent, per PM guidance):

```
THE COLLECTION // 四款精选        ← English uppercase tracked + Chinese accent
Four templates, crafted for       ← Playfair Display, section size
Chinese weddings.
```

This respects English-educated primary users while providing cultural identity. Chinese characters are VISUAL ART, not required reading.

### Section Kickers

| Section | English | Chinese | Meaning |
|---------|---------|---------|---------|
| Hero | AI-POWERED WEDDING INVITATIONS | 囍 Made for Chinese Weddings | (badge format) |
| Showcase | THE COLLECTION | 四款精选 | "Four curated selections" |
| How It Works | THE PROCESS | 五步成礼 | "Five steps to ceremony" |
| Features | WHY DREAMMOMENTS | 为何选择 | "Why choose us" |
| Pricing | SIMPLE PRICING | 简单定价 | "Simple pricing" |
| Final CTA | YOUR LOVE STORY | 百年好合 | "A hundred years of harmony" |

---

## 4. SECTION-BY-SECTION DESIGN

### 4.1 Hero: "A Joyful Occasion" (喜事来了)

**Layout**: Full viewport (100svh). 55/45 split on desktop, stacked on mobile.

```
+------------------------------------------------------------------+
| BG: Warm white + radial crimson wash (12% opacity, center-left)  |
| + radial gold wash (8% opacity, top-right)                       |
| + Peony SVG line-art (6% opacity, right side, stroke-animated)   |
|                                                                    |
| [囍 Made for Chinese Weddings] [AI-Powered]  ← badges             |
|                                                                    |
| Beautiful invitations          +---------------------+            |
| your guests will               | [Template Preview]  |            |
| remember.  ← crimson italic    | 3D tilt on hover    |            |
|                                | 9:16, rounded-3xl   |            |
| Create stunning digital...     | Gold frame border    |            |
|                                +---------------------+            |
| [Create Your Invitation]       [Template name badge]              |
| [Browse Templates]                                                 |
|                                                                    |
| Free to start · No credit card · PDPA compliant                   |
+------------------------------------------------------------------+
```

**Key details**:
- Hero headline at 8.5rem desktop / 3.5rem mobile -- Playfair Display 900
- "remember." on its own line in crimson italic (Playfair Display Italic)
- Template card: 3D perspective tilt on mousemove (desktop only, max 6-8deg)
- Peony SVG line-art draws itself via CSS stroke-dasharray on page load (3s, atmospheric)
- 囍 watermark behind left column at 3% opacity, 20rem
- CTA: Crimson pill with gold shimmer sweep on hover
- **NEW content per PM**: Add "Share via WhatsApp in one tap" to subtitle

**Animation** (GSAP):
- Staggered content reveal: badges → headline words → subtitle → CTAs → trust line (total <1s)
- Template card enters from right with slight parallax lag
- NO blocking entrance animation (no envelope, no hongbao)

### 4.2 Social Proof: "Whispered Blessings"

**Layout**: Rose-soft background strip. Centered, max-width 900px.

```
+------------------------------------------------------------------+
| BG: Rose soft (#FBE0DE)                                          |
|                                                                    |
| ───── gold ornamental rule ─────                                  |
|                                                                    |
|   500+              4.9/5            < 3 min                      |
|   Couples served    Average rating   Setup time                   |
|   (Playfair 3.5rem, counter animation)                            |
|                                                                    |
|   "Our guests kept saying the invitation was the most beautiful   |
|    they'd ever received..."                                       |
|                    — Wei Lin & Jun Hao, Kuala Lumpur               |
|   (Cormorant Garamond italic, crimson decorative quotes)          |
|                                                                    |
| ───── gold ornamental rule ─────                                  |
+------------------------------------------------------------------+
```

**Key choices**:
- STATIC stats with counter animation (NOT marquee ticker -- critic was right)
- Numbers in Playfair Display, crimson color, count up on scroll-enter
- Gold ornamental gradient rules top and bottom
- Testimonial in Cormorant Garamond italic
- Restrained section -- lets the next section (Red Showcase) hit harder

### 4.3 Showcase: "The Red Gallery" (四款精选) -- THE BOLD MOMENT

This is the signature section. Full Chinese Red background. Templates on red silk.

**Desktop layout**: Asymmetric masonry grid (from Proposal 2's best idea):

```
+------------------------------------------------------------------+
| BG: Chinese Red (#C41E3A)                                        |
| Lattice pattern overlay (窗花), white, 4% opacity                 |
|                                                                    |
| THE COLLECTION // 四款精选 (gold kicker)                           |
| "Four templates. One for every love story." (white, Playfair)    |
|                                                                    |
| +--LARGE (60%)----------+ +--SMALL (35%)--+                      |
| |                        | |               |                      |
| | Garden Romance         | | Blush Romance |   (Row 1)           |
| | (3:4 aspect)           | | (1:1 aspect)  |                      |
| |                        | +---------------+                      |
| +------------------------+                                        |
|                                                                    |
| +--SMALL (35%)--+ +--LARGE (60%)----------+                      |
| |               | |                        |                      |
| | Love at Dusk  | | Eternal Elegance       |   (Row 2)           |
| | (1:1 aspect)  | | (3:4 aspect)           |                      |
| +---------------+ |                        |                      |
|                   +------------------------+                      |
|                                                                    |
| [Paper-cut scalloped bottom edge via clip-path]                   |
+------------------------------------------------------------------+
```

**Why masonry over horizontal scroll-jacking** (critic's verdict):
- All 4 templates visible with normal scrolling -- no interaction required
- No scroll confusion on mobile
- Respects the PM's "5 seconds on mobile via WhatsApp" constraint
- Still visually editorial and interesting via asymmetric sizing

**Why Chinese Red background** (cultural moat):
- No Western competitor would dare use full-bleed red
- Chinese couples instantly recognize this as THEIR color
- White template cards on red = wedding cards on red silk tablecloth
- Lattice overlay adds architectural texture at 4% opacity

**Mobile**: Cards stack single-column at 85vw with native horizontal swipe + scroll-snap

**Paper-cut bottom edge**: CSS `clip-path: polygon(...)` creates jianzhi-inspired scalloped border

**Card details**:
- White frames, rounded-2xl, generous padding
- Hover: scale(1.02) + shadow deepening + name overlay slides up
- Each card has a "Preview" link and cultural badge where relevant
- **NEW per PM**: At least one card shows bilingual Chinese/English content preview

### 4.4 How It Works: "The Golden Thread" (五步成礼)

**Layout**: Warm white background. Vertical golden thread timeline.

```
+------------------------------------------------------------------+
| BG: Warm white                                                    |
|                                                                    |
| THE PROCESS // 五步成礼 (crimson kicker)                           |
| "From sign-up to RSVPs in five steps"                             |
|                                                                    |
|       [Golden SVG thread -- stroke animation on scroll]           |
|       |                                                            |
|  01   O────  Sign up in seconds                                   |
|       |      Google or email. No credit card.                     |
|       |                                                            |
|  02   O────        Pick your template                             |
|       |            Browse the collection.                          |
|       |                                                            |
|  03   O────  Let AI write your story                              |
|       |      Bilingual content in seconds.                        |
|       |                                                            |
|  04   O────        Make it yours                                  |
|       |            Customize everything.                           |
|       |                                                            |
|  05   O────  Share & track RSVPs                                  |
|              One link. WhatsApp-ready.                             |
+------------------------------------------------------------------+
```

**Key details**:
- Golden SVG path draws via stroke-dashoffset + GSAP ScrollTrigger scrub
- Step circles fill with crimson as thread reaches them
- Cards alternate left/right on desktop, single column on mobile
- Step numbers in Playfair Display, 2.5rem, gold
- **NEW per PM**: Step 5 explicitly mentions WhatsApp sharing
- **NEW per PM**: Step 3 mentions bilingual AI content

### 4.5 Features: "Why DreamMoments" (为何选择)

**Layout**: White background. Split layout inside container card.

```
+------------------------------------------------------------------+
| +------------------------------------------------------------+   |
| | Container card (cream bg, subtle gold border)               |   |
| |                                                              |   |
| | WHY DREAMMOMENTS // 为何选择                                  |   |
| | Everything you need.                                         |   |
| | Nothing you don't. (crimson italic)                         |   |
| |                                                              |   |
| | +--Features (50%)---+  +--Mockup (50%)-----------+         |   |
| | |                    |  | [Phone mockup showing   |         |   |
| | | ✦ AI-Powered       |  |  invitation on iPhone]  |         |   |
| | |   Content          |  |                         |         |   |
| | | ✦ Built for Chinese|  | Auto-scrolling preview  |         |   |
| | |   Weddings         |  | demonstrating product   |         |   |
| | | ✦ One-Tap RSVP     |  |                         |         |   |
| | | ✦ Angpao QR Code   |  |                         |         |   |
| | | ✦ WhatsApp Sharing  |  |                         |         |   |
| | | ✦ Real-Time Dash   |  |                         |         |   |
| | +--------------------+  +-------------------------+         |   |
| +------------------------------------------------------------+   |
+------------------------------------------------------------------+
```

**Key changes from current**:
- **NEW per PM**: Angpao QR Code highlighted as a feature (differentiator!)
- **NEW per PM**: WhatsApp Sharing highlighted explicitly
- Phone mockup with auto-scrolling invitation preview (demonstrates the product)
- Mockup has subtle 3D perspective tilt driven by scroll (GSAP, desktop only)
- "Nothing you don't" in Cormorant Garamond italic, crimson
- **NEW per PM**: Add "Your parents will love it" or "Traditional enough for family, modern enough for friends" messaging

### 4.6 Pricing: "Simple Pricing" (简单定价)

```
+------------------------------------------------------------------+
| BG: Gold soft (#FDF5E0)                                          |
|                                                                    |
| SIMPLE PRICING // 简单定价 (gold kicker)                           |
| "One price. No subscriptions."                                    |
| [MYR (Malaysia) / SGD (Singapore)] ← currency toggle              |
|                                                                    |
| +---FREE-----------+    +---PREMIUM (elevated)--------+           |
| | White bg          |    | Gold-pale bg (#FDF5E0)     |           |
| | RM 0              |    | 3px gold border            |           |
| | (Playfair, 4rem)  |    | [红包 Badge: Most Popular]  |           |
| | ✓ 1 invitation    |    | RM 49 / SGD 19             |           |
| | ✓ Basic template  |    | (Playfair, 4rem, gold,     |           |
| | ✓ 50 guests       |    |  counter animation)        |           |
| | [Get Started Free]|    | ✓ Unlimited invitations    |           |
| +-------------------+    | ✓ All templates            |           |
|                          | ✓ Angpao QR code           |           |
|                          | ✓ AI content generation    |           |
|                          | ✓ Custom domain            |           |
|                          | ✓ Analytics dashboard      |           |
|                          | [Create Your Invitation]    |           |
|                          +-----------------------------+           |
|                                                                    |
| "One-time payment. Like an angpao — give once, celebrate forever."|
+------------------------------------------------------------------+
```

**Key details**:
- Hongbao-styled "Most Popular" badge (red rounded rect with gold text, decorative fold)
- Price counter animation on scroll-enter
- Premium card elevated with gold glow shadow
- **NEW per PM**: "Like an angpao" copy connects pricing to culture
- **NEW per PM**: Angpao QR code listed as premium feature

### 4.7 Final CTA: "A Hundred Years of Harmony" (百年好合)

```
+------------------------------------------------------------------+
| BG: Ink black (#1A1512)                                          |
| [Cloud motif overlay, gold, 4% opacity]                          |
| [囍 watermark, 16rem, gold, 3% opacity, centered]                |
|                                                                    |
| 百年好合                                                           |
| (Calligraphy stroke animation -- draws stroke by stroke)          |
| (Noto Serif SC 900, gold, 2.5rem)                                |
|                                                                    |
| "Create an invitation                                              |
|  your guests will treasure."                                       |
| (Playfair Display, 4rem, warm white)                              |
| "treasure" in crimson                                              |
|                                                                    |
| [=== Create Your Invitation — It's Free ===]                      |
| (Large crimson CTA, gold shimmer pulse every 4s)                  |
|                                                                    |
| Free to start · No credit card · Setup in under 3 minutes         |
| ───── gold ornamental rule ─────                                  |
+------------------------------------------------------------------+
```

**Calligraphy stroke animation**: 百年好合 traced as SVG paths (correct stroke order). Each stroke draws via stroke-dashoffset (0.6s per stroke, 0.12s stagger). Fill fades in after all strokes complete. Total: ~4 seconds. On `prefers-reduced-motion`: shows final state immediately.

### 4.8 Footer: Quiet Grace

```
+------------------------------------------------------------------+
| BG: Warm white                                                    |
| ───── gold ornamental rule ─────                                  |
|                                                                    |
| 囍  DreamMoments  囍  (tiny gold bookends)                        |
| "AI-powered wedding invitations for Chinese couples"              |
|                                                                    |
| Privacy · Terms · PDPA                                            |
| © 2026 DreamMoments                                               |
+------------------------------------------------------------------+
```

---

## 5. ANIMATION STRATEGY

### GSAP Setup (Zero Premium Plugins)

| Package | Size (gzipped) | Cost |
|---------|----------------|------|
| gsap core | ~24KB | Free |
| ScrollTrigger | ~12KB | Free |
| **Total** | **~36KB** | **$0/year** |

**No SplitText, no DrawSVG, no MorphSVG, no Lenis.**

### Animation Catalog

**Phase 1 (High Impact, Low Effort):**

| Animation | Technique | Section |
|-----------|-----------|---------|
| Hero text stagger | CSS clip-path + GSAP stagger (word-level) | Hero |
| Counter animation | GSAP `snap` + `textContent` tween | Social Proof, Pricing |
| Entrance reveals | GSAP ScrollTrigger batch, `y:30, opacity:0` | All sections |
| Gold rules | GSAP `scaleX: 0→1`, transform-origin: center | Social Proof, Final CTA |
| CTA shimmer | CSS `@keyframes` gold gradient sweep | Primary CTAs |
| Card hover lift | CSS `translateY(-4px)` + shadow transition | Template cards |

**Phase 2 (High Impact, Medium Effort):**

| Animation | Technique | Section |
|-----------|-----------|---------|
| Golden thread | CSS stroke-dashoffset + GSAP ScrollTrigger scrub | How It Works |
| 3D card tilt | JS mousemove → GSAP rotateX/Y (desktop, pointer:fine) | Hero template card |
| Calligraphy reveal | CSS stroke-dashoffset + GSAP ScrollTrigger | Final CTA |
| Section transitions | GSAP ScrollTrigger + CSS clip-path | Between color sections |
| Peony SVG draw | CSS stroke-dasharray animation on load | Hero background |
| Floating particles | GSAP infinite tween, randomized position | Final CTA (4-5 gold dots) |

### Reduced Motion (Non-Negotiable)

When `prefers-reduced-motion: reduce`:
- All scroll-driven animations: disabled, show final state
- Text reveals: instant opacity transition (0.3s)
- Counters: show final number immediately
- Calligraphy: shows completed characters
- Parallax: disabled
- Particles: hidden
- Hover effects: preserved (not scroll-based)
- Focus states: preserved

### Mobile Adaptations

- **No GSAP ScrollTrigger pinning** on mobile (<768px)
- **No cursor effects** (3D tilt, magnetic buttons) -- use `:active` scale(0.97)
- **Simpler easing** (`power2.out` instead of `back.out`)
- **Reduced scrub lag** (`scrub: 0.3` instead of `scrub: 0.8`)
- **Showcase**: Native scroll-snap carousel, not GSAP
- **Particles**: Reduced to 2-3 on mobile
- **Botanical SVGs**: 50% density on mobile

---

## 6. CULTURAL MOTIF SYSTEM

| Element | Implementation | Where Used | Opacity |
|---------|---------------|------------|---------|
| 囍 Double Happiness | Noto Serif SC 900, CSS positioned | Hero watermark (20rem), Final CTA (16rem), Footer bookends | 3% (watermarks), 100% (badges) |
| Auspicious Clouds (祥云) | Inline SVG, interlocking bezier curves | Final CTA background, cloud dividers between sections | 4-6% |
| Window Lattice (窗花) | SVG `<pattern>`, geometric octagons | Showcase red section texture | 4% |
| Paper-Cut Border (剪纸) | CSS `clip-path: polygon(...)` | Showcase bottom edge, Final CTA top edge | 100% (structural) |
| Peony Line Art (牡丹) | SVG stroke, stroke-dasharray animation | Hero background | 6% |
| Gold Ornamental Rules | CSS gradient (transparent→gold→transparent) | Social Proof, Final CTA borders | 100% |
| Calligraphy (百年好合) | SVG paths, stroke-dashoffset animation | Final CTA | 100% (animated) |
| Hongbao Badge (红包) | CSS component, red rounded rect + gold text | Pricing "Most Popular" badge | 100% |

**Rule**: Decorative elements never exceed 6% opacity. They are felt in aggregate but invisible individually.

---

## 7. CRITICAL CONTENT GAPS (Identified by PM, Missed by All Designers)

These MUST be addressed in the final implementation:

| Gap | Solution | Section |
|-----|----------|---------|
| **WhatsApp sharing** | "Share via WhatsApp in one tap" in hero subtitle + Step 5 of How It Works | Hero, How It Works |
| **Live example link** | "See a live invitation" ghost button in Showcase section | Showcase |
| **Angpao QR code** | Listed as premium feature in Features + Pricing | Features, Pricing |
| **Bilingual preview** | At least one Showcase template card shows both English + Chinese text | Showcase |
| **Parent-facing messaging** | "Traditional enough for family, modern enough for friends" in Features | Features |
| **Product demo** | Auto-scrolling phone mockup in Features section | Features |
| **Comparison table** | Consider adding below Pricing: "vs. Print Invitations (RM500+), vs. Canva (no RSVP), vs. Western platforms (no Chinese)" | Pricing |
| **Device mockup** | Phone frame showing invitation in Features section | Features |

---

## 8. PERFORMANCE BUDGET

| Metric | Target | Strategy |
|--------|--------|----------|
| LCP | < 2.0s | No blocking entrance animation. Hero image fetchPriority="high". Inline critical CSS. |
| INP | < 150ms | Debounce mousemove handlers at 16ms. will-change only during animation. |
| CLS | < 0.05 | Explicit dimensions on all images. min-height on sections before JS init. |
| Total page weight | < 800KB | |
| JS (animations) | < 50KB gzipped | GSAP core (24KB) + ScrollTrigger (12KB) + custom (~10KB) |
| Images | < 400KB | WebP/AVIF with fallbacks, lazy load below fold |
| Fonts | 0KB additional | All fonts already loaded |
| SVGs (cultural motifs) | < 20KB | Inline, compressed, geometric (not complex illustrations) |

---

## 9. IMPLEMENTATION PHASES

### Phase 1: Foundation (Week 1-2) -- B+ → A-

- Install GSAP + ScrollTrigger, create `useGSAP` hook
- Update CSS variables (8.5rem hero type, gold upgrade, section colors)
- Refactor Hero (oversized headline, radial glows, badge styling, staggered reveal)
- Build CountUp component, integrate into Social Proof
- Add bilingual kickers to all sections
- Build GoldRule component
- Refactor Social Proof (rose-soft bg, pull-quote styling)
- Refactor Pricing (gold-soft bg, hongbao badge, gold border)
- Refactor Final CTA (dark bg, 囍 watermark, CTA shimmer)
- Update section backgrounds to color rhythm
- Replace Framer Motion fade-ups with GSAP staggered entrance reveals
- Mobile QA pass

### Phase 2: Cultural Architecture (Week 3-4) -- A- → A

- Build Chinese Red Showcase section with masonry grid
- Build lattice pattern overlay component
- Build paper-cut clip-path borders
- Build golden thread SVG + stroke animation for How It Works
- Build 3D card tilt for hero template (desktop)
- Build calligraphy stroke reveal for Final CTA
- Build auto-scrolling phone mockup for Features
- Add WhatsApp, angpao QR, parent messaging content
- Performance audit (Lighthouse, CWV)

### Phase 3: Polish (Week 5-6) -- A → A+

- Create/commission botanical SVGs (peony, cloud)
- Integrate SVG stroke-draw animations
- Add floating gold particles in Final CTA
- Build clip-path section transitions
- Add "See live example" link in Showcase
- Consider comparison table below Pricing
- A/B test: old page vs new page
- Iterate based on conversion data

---

## 10. WHAT MAKES THIS IMPOSSIBLE TO COPY

1. **Cultural architecture, not decoration.** Section rhythm mirrors a Chinese banquet. Lattice patterns are the grid. Paper-cuts are the borders. Cloud motifs are the dividers. Remove the culture and the page literally breaks.

2. **The Red Gallery.** No Western competitor will commit an entire section to Chinese Red. It is our competitive moat.

3. **Bilingual typography as design.** Chinese kickers are visual architecture. Removing them would visually break the page. This is not a language toggle.

4. **Calligraphy as ceremony.** Watching 百年好合 being written stroke-by-stroke is not a text animation -- it is a cultural moment. No Western competitor would build this.

5. **Angpao badge + "Like an angpao" copy.** Locally specific to MY/SG. Not generic Chinese -- specifically Malaysian/Singaporean Chinese.

---

## Summary

The "Cultural Editorial" direction takes the Cultural Maximalist's authentic Chinese architecture, applies the Bold Editorial's typographic confidence, uses the Immersive Motion's best layout idea (masonry grid), and addresses every gap the PM and critic identified.

**The test**: When a Chinese Malaysian couple opens this on WhatsApp in a Grab car, within 5 seconds they should think:

1. "This is beautiful." (8.5rem typography, warm radial glows)
2. "This is for us." (囍 badge, Chinese kicker, red/gold palette)
3. "I can do this right now." (Clear CTA, "Free to start", "<3 min setup")

That is the page that converts. Build it.
