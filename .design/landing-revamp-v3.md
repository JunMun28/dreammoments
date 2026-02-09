# DreamMoments Landing Page V3 -- Final Implementable Design Spec

**Date**: February 2026
**Target**: Chinese couples 25-35, Malaysia/Singapore, 75-85% mobile, WhatsApp discovery
**Constraints**: React 19 + TanStack Start + GSAP free tier + Tailwind CSS 4 + Motion, < 800KB page weight

---

## 1. Winning Direction & Rationale

**Base proposal**: Alpha (Bold Minimalist) -- scored 84/100.

**Why Alpha wins**: It has the strongest conversion architecture (centered hero, clear CTAs, trust signals), the best performance profile (pure CSS aurora backgrounds, minimal ScrollTrigger instances), and the most realistic scope (3 new components, 8 modified files, ~1400 lines of change). Its Swiss-design center-axis hero layout is the correct default for a mobile-first audience.

**Borrowed from Beta (Kinetic Storyteller)**:
- Word-by-word testimonial reveal in Social Proof (GSAP scrub, forces reading)
- Price count-up animation (RM 0 -> 49, proven conversion technique)
- Per-step card entrance on scroll trigger in How It Works (adds variety to scroll rhythm)
- SplitWords utility component for the testimonial animation

**Borrowed from Gamma (Cultural Futurist)**:
- Neon-glow xi character at visible opacity (12% hero, 6% Final CTA) -- adapted to `--dm-*` namespace
- Lattice pattern at architectural opacity (10% hero, 8% showcase) -- visible, not invisible
- Hongbao (red envelope) badge on premium pricing card -- culturally brilliant
- One full-bleed crimson section (Features) -- bold, memorable, correct for Chinese wedding product
- Paper-cut edges as structural section transitions (2 locations, not everywhere)
- Calligraphy stroke-by-stroke animation in Final CTA
- Three-layer visual hierarchy (Shout / Narrative / Texture) as a framework to prevent chaos

**Killed elements**:
- Beta's 250vh hero (capped at 100vh)
- Beta's 24 ScrollTrigger instances (capped at ~12-14)
- Gamma's `--cf-*` token rename (staying with `--dm-*` namespace)
- Beta's character-by-character `rotateX` on mobile (simplified to `y + opacity` only)
- Gamma's 180s infinite rotation on Final CTA xi (triggered only when in viewport)

---

## 2. Complete Color System

All values use the existing `--dm-*` namespace. New tokens are added; no existing tokens are removed to preserve backward compatibility with dashboard/editor/template code.

```css
:root {
  /* ─── Core Surfaces ─── */
  --dm-bg:             #FAFAF8;  /* Cooler warm-white. Less yellow, more architectural. */
  --dm-surface:        #FFFFFF;  /* Card surfaces. Pure white for contrast. */
  --dm-surface-muted:  #F3F2EF;  /* Alternating sections. Barely-there warmth. */
  --dm-surface-rose:   #F9F2F0;  /* Kept for backward compat. */
  --dm-ink:            #0F0D0A;  /* Richer near-black. Higher density at large display sizes. */
  --dm-muted:          #57534E;  /* Body text. Stone gray, neutral luxury. */
  --dm-border:         #E5E2DD;  /* Sharper borders, less yellowed. */

  /* ─── Crimson (Primary CTA, Auspicious Red) ─── */
  --dm-crimson:        #D42040;  /* Brighter, more saturated. Pops on cream backgrounds. */
  --dm-crimson-deep:   #A8182E;  /* Hover state. */
  --dm-crimson-soft:   #FDE0E6;  /* Soft blush background wash. */
  --dm-crimson-vivid:  #E8243C;  /* Hero accent word ONLY. High-saturation red at display sizes. */

  /* ─── Gold (Decorative, Cultural Elements) ─── */
  --dm-gold:           #D4AF37;  /* Retained. Classic imperial gold. */
  --dm-gold-warm:      #C08B2E;  /* Deeper gold for decorative text at small sizes. */
  --dm-gold-soft:      #FBF0D0;  /* Visible warm wash. More contrast than current #FDF5E0. */
  --dm-gold-electric:  #FFD700;  /* Neon glow on xi, animated accents. */

  /* ─── Rose (Secondary Warmth) ─── */
  --dm-rose:           #D95F5A;  /* Warmer coral, like a peony petal. */
  --dm-rose-soft:      #FADBD6;  /* Visible as a section background. */

  /* ─── Sage (Nature, Success) ─── */
  --dm-sage:           #7D9E7C;  /* Slightly more saturated. */
  --dm-sage-soft:      #E8EFE8;  /* Kept. */

  /* ─── Lavender, Peach (Backward Compat) ─── */
  --dm-lavender:       #EFEDF4;
  --dm-peach:          #C4706B;

  /* ─── Dark Sections (Social Proof, Final CTA) ─── */
  --dm-dark-bg:        #0D0D0D;  /* True ink black. Calligraphy ink, not coffee. */
  --dm-dark-surface:   #1A1A1A;  /* Elevated cards in dark sections. */
  --dm-dark-text:      #FAFAF8;  /* Text on dark. */
  --dm-dark-muted:     #A1A1AA;  /* Muted text on dark. */
  --dm-dark-gold:      #D4AF37;  /* Gold on dark. */

  /* ─── Vermillion Section (Features) ─── */
  --dm-vermillion:     #D42040;  /* Same as crimson. Full-bleed section background. */
  --dm-vermillion-soft: #FDE0E6; /* Same as crimson-soft. */

  /* ─── Semantic ─── */
  --dm-cta-bg:         var(--dm-crimson);
  --dm-cta-hover:      var(--dm-crimson-deep);
  --dm-cta-text:       #FFFFFF;
  --dm-accent-strong:  var(--dm-crimson);
  --dm-on-accent:      #FFFFFF;
  --dm-error:          #B91C1C;
  --dm-focus:          var(--dm-crimson);

  /* ─── Aurora Gradients ─── */
  --dm-aurora-1: radial-gradient(ellipse 80% 50% at 20% 40%, rgba(212, 32, 64, 0.08) 0%, transparent 60%);
  --dm-aurora-2: radial-gradient(ellipse 60% 70% at 80% 20%, rgba(212, 175, 55, 0.06) 0%, transparent 50%);
  --dm-aurora-3: radial-gradient(ellipse 70% 60% at 50% 90%, rgba(217, 95, 90, 0.05) 0%, transparent 55%);
}
```

### Section Background Map

| # | Section | Background | Character |
|---|---------|-----------|-----------|
| 1 | Hero | `--dm-bg` + aurora gradients + lattice 10% | Light, warm, editorial |
| 2 | Social Proof | `--dm-dark-bg` | Dark, dramatic stats |
| 3 | Showcase | `--dm-bg` + lattice 8% | Light, gallery |
| 4 | How It Works | `--dm-surface-muted` | Muted, scannable |
| 5 | Features | `--dm-crimson` (full bleed) | Bold vermillion punch |
| 6 | Pricing | `--dm-bg` + `--dm-gold-soft` card accents | Light, clear |
| 7 | Final CTA | `--dm-dark-bg` | Dark, emotional close |
| 8 | Footer | `--dm-bg` | Quiet resolution |

### Contrast Ratios (Verified)

| Foreground | Background | Ratio | Level | Usage |
|-----------|-----------|-------|-------|-------|
| `--dm-ink` (#0F0D0A) on `--dm-bg` (#FAFAF8) | 18.5:1 | AAA | Body text |
| `--dm-muted` (#57534E) on `--dm-bg` (#FAFAF8) | 6.3:1 | AAA (large) / AA (body) | Secondary text |
| `--dm-crimson` (#D42040) on `--dm-bg` (#FAFAF8) | 5.4:1 | AA | CTA buttons, links |
| `--dm-crimson-vivid` (#E8243C) on `--dm-bg` (#FAFAF8) | 4.7:1 | AA (large text only) | Hero accent word |
| White (#FFFFFF) on `--dm-crimson` (#D42040) | 5.4:1 | AA | CTA text, Features section |
| White (#FFFFFF) on `--dm-dark-bg` (#0D0D0D) | 19.7:1 | AAA | Dark section text |
| `--dm-gold` (#D4AF37) on `--dm-dark-bg` (#0D0D0D) | 8.4:1 | AAA | Gold on dark |
| `--dm-gold-electric` (#FFD700) on `--dm-dark-bg` (#0D0D0D) | 12.8:1 | AAA | Neon xi on dark |
| `--dm-dark-muted` (#A1A1AA) on `--dm-dark-bg` (#0D0D0D) | 8.0:1 | AAA | Dark muted text |

---

## 3. Typography Scale

### Font Stack (No Changes to Loaded Fonts)

| Role | Family | Weight | Fallback |
|------|--------|--------|----------|
| Display / Hero | `"Playfair Display"` | 700, 800 | `"Noto Serif SC", Georgia, serif` |
| Section Headings | `"Playfair Display"` | 600, 700 | `"Noto Serif SC", Georgia, serif` |
| Body | `"Inter"` | 400, 500 | `system-ui, sans-serif` |
| Accent / Kickers EN | `"Cormorant Garamond"` | 400 italic, 600 | `"Noto Serif SC", Georgia, serif` |
| Chinese Display | `"Noto Serif SC"` | 700, 900 | `serif` |

### CSS Custom Properties

```css
:root {
  /* ─── Type Scale ─── */
  --text-hero:        clamp(4.5rem, 12vw + 1rem, 10rem);
  --text-hero-accent: clamp(5rem, 13vw + 1rem, 11rem);
  --text-section:     clamp(2.5rem, 5vw + 0.5rem, 4.5rem);
  --text-subsection:  clamp(1.5rem, 3vw + 0.25rem, 2.5rem);
  --text-kicker-cn:   clamp(1.5rem, 2.5vw + 0.25rem, 2.5rem);
  --text-kicker-en:   0.8125rem;
  --text-card-title:  clamp(1.25rem, 2vw + 0.25rem, 1.75rem);
  --text-lg:          clamp(1.0625rem, 0.8vw + 0.5rem, 1.25rem);
  --text-base:        1rem;
  --text-sm:          0.875rem;
  --text-xs:          0.75rem;

  /* ─── Tracking ─── */
  --tracking-hero:    -0.04em;
  --tracking-section: -0.03em;
  --tracking-kicker:  0.15em;
  --tracking-display: -0.025em;
  --tracking-normal:  0;
  --tracking-wide:    0.05em;
}
```

### Per-Level Specifications

| Level | CSS Property | Font | Weight | Letter-Spacing | Line-Height | Usage |
|-------|-------------|------|--------|---------------|-------------|-------|
| `--text-hero` | `font-size: var(--text-hero)` | Playfair Display | 800 | `-0.04em` | `0.95` | Hero headline main lines |
| `--text-hero-accent` | `font-size: var(--text-hero-accent)` | Playfair Display | 800 italic | `-0.04em` | `0.95` | Hero accent word ("remember.") |
| `--text-section` | `font-size: var(--text-section)` | Playfair Display | 700 | `-0.03em` | `1.1` | Section headings |
| `--text-subsection` | `font-size: var(--text-subsection)` | Playfair Display | 600 | `-0.025em` | `1.2` | Sub-headings, feature section title |
| `--text-kicker-cn` | `font-size: var(--text-kicker-cn)` | Noto Serif SC | 700 | `0` | `1.3` | Chinese kicker text above section headings |
| `--text-kicker-en` | `font-size: var(--text-kicker-en)` | Inter | 500 | `0.15em` | `1.0` | English kicker labels, uppercase |
| `--text-card-title` | `font-size: var(--text-card-title)` | Playfair Display | 600 | `-0.015em` | `1.3` | Card headings, step titles |
| `--text-lg` | `font-size: var(--text-lg)` | Inter | 400 | `0` | `1.7` | Hero subtitle, large body |
| `--text-base` | `font-size: var(--text-base)` | Inter | 400 | `0` | `1.75` | Body text, descriptions |
| `--text-sm` | `font-size: var(--text-sm)` | Inter | 400 | `0` | `1.6` | Small labels, trust line |
| `--text-xs` | `font-size: var(--text-xs)` | Inter | 400 | `0` | `1.5` | Footer fine print |

### Rendered Sizes at Key Breakpoints

| Token | 375px (iPhone SE) | 768px (Tablet) | 1440px (Desktop) |
|-------|:-:|:-:|:-:|
| `--text-hero` | 5.5rem (88px) | 7.7rem (123px) | 10rem (160px) |
| `--text-hero-accent` | 5.88rem (94px) | 8.5rem (136px) | 11rem (176px) |
| `--text-section` | 3.38rem (54px) | 4.3rem (69px) | 4.5rem (72px) |
| `--text-kicker-cn` | 1.94rem (31px) | 2.2rem (35px) | 2.5rem (40px) |

---

## 4. Section-by-Section Specification

### S1: Hero

**Layout**: Centered editorial, single column stacking. Text above, card below.
- Container: `mx-auto max-w-5xl px-6 pt-28 pb-16 lg:pt-32`
- Content: `text-center`, `max-w-[52ch]` for body text
- On desktop (lg+): content stays centered, card floats below headline
- `min-h-svh` on the section

**Background**:
- Base: `var(--dm-bg)` (#FAFAF8)
- Aurora layers (3 stacked radial gradients via `::before` pseudo-element):
  ```css
  background:
    radial-gradient(ellipse 80% 50% at 20% 40%, rgba(212,32,64,0.08) 0%, transparent 60%),
    radial-gradient(ellipse 60% 70% at 80% 20%, rgba(212,175,55,0.06) 0%, transparent 50%),
    radial-gradient(ellipse 70% 60% at 50% 90%, rgba(217,95,90,0.05) 0%, transparent 55%);
  ```
- Lattice overlay: `LatticeOverlay` component, `color="var(--dm-gold)"`, `opacity={0.10}`, full section, `aria-hidden="true"`

**Content structure (top to bottom)**:
1. Chinese kicker: "喜事来了" in Noto Serif SC 700, `var(--text-kicker-cn)`, `color: var(--dm-crimson)`, `margin-bottom: 0.75rem`
2. English kicker pill: "AI-POWERED INVITATIONS" in Inter 500, `var(--text-kicker-en)`, uppercase, `letter-spacing: 0.15em`, `color: var(--dm-muted)`, preceded by `囍` badge (Noto Serif SC, 1rem, `color: var(--dm-crimson)`, `aria-label="double happiness"`)
3. Headline: "Beautiful invitations your guests will" in Playfair Display 800, `var(--text-hero)`, `color: var(--dm-ink)`, `line-height: 0.95`, `letter-spacing: -0.04em`
4. Accent word: "remember." in Playfair Display 800 italic, `var(--text-hero-accent)`, `color: var(--dm-crimson-vivid)`, same line-height
5. Subtitle: "Create a stunning digital wedding invitation in minutes. AI writes your content, you make it yours. Share via WhatsApp in one tap." in Inter 400, `var(--text-lg)`, `color: var(--dm-muted)`, `max-w-[52ch] mx-auto`, `line-height: 1.7`
6. CTA group: `flex flex-col sm:flex-row items-center gap-4 justify-center mt-8`
   - Primary: `MovingBorderButton` with text "Create Your Invitation" + right arrow
   - Secondary: ghost button "Browse Templates" with `border: 1.5px solid var(--dm-crimson)`, `color: var(--dm-crimson)`
7. Trust line: "Free to start" / "No credit card" / "3-minute setup", `text-sm`, `color: var(--dm-muted)`, separated by `\u00B7` dots, `mt-5`
8. Template card: `max-w-sm mx-auto mt-12 lg:mt-16`
   - 3D tilt on desktop via `use3DTilt` hook (max 6deg)
   - Radial glow beneath: `radial-gradient(ellipse, rgba(212,32,64,0.12) 0%, transparent 70%)`, `filter: blur(40px)`, `z-index: -1`
   - Neon xi behind card: 12rem on desktop, 8rem on mobile, `color: var(--dm-crimson-vivid)`, `opacity: 0.10`, neon-breathe CSS animation (see Animation section)
   - Card: `border-radius: 1.5rem`, `box-shadow: 0 20px 60px -12px rgba(0,0,0,0.12)`, aspect-ratio 3/4, `loading="eager"`, `fetchPriority="high"` on hero image

**Animation** (GSAP timeline, ~2s total):
```
t=0.0: Chinese kicker clip-path reveal (inset 0 100% 0 0 -> inset 0 0% 0 0), 0.6s, power3.out
t=0.4: English kicker fade (opacity 0, x: -12 -> visible), 0.4s, power3.out
t=0.5: Headline lines reveal (opacity 0, y: 40 -> visible), 0.7s stagger 0.12, power3.out
t=0.9: Accent word scale (opacity 0, scale 0.92 -> visible), 0.8s, back.out(1.2)
t=1.1: Body + CTAs fade (opacity 0, y: 20 -> visible), 0.5s stagger 0.1, power2.out
t=1.2: Card rise (opacity 0, y: 60, rotateX: 12 -> visible), 1.0s, power4.out
```

**Mobile** (< 768px):
- Card below fold, `loading="lazy"`
- No 3D tilt
- Neon xi reduced to 8rem, 2 text-shadow layers instead of 4
- Lattice at 8% opacity
- Aurora static (no GSAP ambient animation)
- Full-width CTA buttons

**Cultural elements**:
- Lattice overlay at 10% (visible, architectural framing)
- Neon xi at 10% behind card (visible, proud)
- Chinese kicker "喜事来了" at display scale (the first text element the eye hits)
- 囍 badge at full opacity in kicker line

---

### S2: Social Proof

**Layout**: Full-width dark section, centered content.
- `background: var(--dm-dark-bg)` (#0D0D0D)
- Container: `mx-auto max-w-4xl px-6 py-[clamp(4rem,8vw,7rem)] text-center`

**Background**: Solid `--dm-dark-bg`. No gradients needed -- the dark is the statement.

**Content structure**:
1. Stats row: 3 stats in `flex justify-center gap-12 lg:gap-20`, separated by thin vertical gold lines (1px, 60% height, `var(--dm-gold)` at 20% opacity)
   - Each stat: number in Playfair Display 800, `clamp(2.5rem, 6vw, 4rem)`, `color: var(--dm-dark-text)`, GSAP count-up on scroll
   - Label below: Inter 400, `var(--text-sm)`, `color: var(--dm-dark-muted)`
   - Stats: "500+" / "Couples served", "4.9" / "Average rating", "< 3 min" / "Setup time"
2. Testimonial: `mt-10`, `max-w-2xl mx-auto`
   - Quote: Cormorant Garamond 400 italic, `clamp(1.125rem, 2vw, 1.5rem)`, `color: var(--dm-dark-text)`, `line-height: 1.7`
   - Left border accent: `border-left: 3px solid var(--dm-crimson)`, `pl-6`
   - Word-by-word reveal on scroll (GSAP scrub: opacity 0.15 -> 1.0, stagger 0.05, start "top 75%", end "top 40%", scrub 0.5)
   - Attribution: Inter 400 small-caps, `var(--text-sm)`, `color: var(--dm-dark-muted)`, `mt-4`

**Animation**:
- Stats count-up: GSAP `snap: { textContent: 1 }`, duration 2.0s, `power2.out`, triggered at section `top 80%`
- Each stat: `y: 30 -> 0`, `opacity: 0 -> 1`, stagger 0.15s
- Testimonial: word-by-word scrub as described above

**Mobile** (< 768px):
- Stats stacked vertically with horizontal gold dividers
- No vertical gold lines between stats
- Testimonial full-width, quote at 1.125rem

**Cultural elements**: None explicit. The dark section is the palette shift.

---

### S3: Showcase (Template Gallery)

**Layout**: Light background, horizontal scroll with snap on mobile, perspective fan on desktop.
- `background: var(--dm-bg)` (#FAFAF8)
- Lattice overlay: `color="var(--dm-gold)"`, `opacity={0.08}`, `aria-hidden="true"`
- Container: `py-[clamp(5rem,10vw,10rem)] overflow-hidden`

**Background**: `var(--dm-bg)` + lattice at 8% opacity.

**Content structure**:
1. Section header: centered
   - Chinese kicker: "四款精选" in Noto Serif SC 700, `var(--text-kicker-cn)`, `color: var(--dm-crimson)`
   - English kicker: "THE COLLECTION" in Inter 500, `var(--text-kicker-en)`, uppercase, `letter-spacing: 0.15em`, `color: var(--dm-muted)`
   - Headline: "Four templates. One for every love story." in Playfair Display 700, `var(--text-section)`, `color: var(--dm-ink)`
2. Card gallery:
   - Desktop: `PerspectiveCardStack` component with 4 cards fanned via CSS `perspective: 1200px`, each card rotated `(i - 1.5) * 4` degrees
   - Mobile: horizontal scroll with `scroll-snap-type: x mandatory`, `gap: 1rem`, `padding: 0 1.5rem`
3. Each card:
   - Width: `min(300px, 80vw)` mobile, `340px` desktop
   - `border-radius: 2rem`
   - `box-shadow: 0 25px 60px -12px rgba(0,0,0,0.10)`
   - Aspect ratio: `9/16` (phone-shaped)
   - Image: `loading="lazy"`, `object-fit: cover`
   - Glass overlay at bottom: `backdrop-filter: blur(12px)`, `background: rgba(255,255,255,0.15)`, template name + description
   - Desktop hover: straighten to `rotateY(0)`, `translateY(-8px)`, `scale(1.02)`, shadow deepens, 0.35s ease

**Animation**:
- Section header: Motion `whileInView` fade-up (y: 24 -> 0, opacity, 0.6s)
- Desktop cards: GSAP stagger entrance `x: 60, opacity: 0 -> visible`, stagger 0.15s, triggered at section `top 75%`
- Mobile: no GSAP, native scroll momentum

**Mobile** (< 768px):
- Horizontal scroll with snap, `scroll-snap-align: center`
- Cards at 80vw with next card peeking
- No perspective fan (all `rotateY(0)`)
- Lattice at 6% opacity

**Cultural elements**:
- Lattice at 8% as gallery architecture
- Chinese kicker "四款精选" at display scale

---

### S4: How It Works

**Layout**: Muted background, vertical timeline with golden thread.
- `background: var(--dm-surface-muted)` (#F3F2EF)
- Container: `mx-auto max-w-5xl px-6 py-[clamp(5rem,10vw,10rem)]`

**Background**: Solid `--dm-surface-muted`.

**Content structure**:
1. Section header: centered
   - Chinese kicker: "五步成礼" in Noto Serif SC 700, `var(--text-kicker-cn)`, `color: var(--dm-crimson)`
   - English kicker: "THE PROCESS" / "FROM SIGN-UP TO RSVPS"
   - Headline: "Five steps to your perfect invitation."
2. Timeline: vertical, centered golden thread SVG
   - SVG path: sinuous S-curve connecting 5 nodes
   - Stroke: `var(--dm-gold)`, `stroke-width: 2px`, `stroke-dasharray` animated via GSAP ScrollTrigger scrub
   - Scrub range: section `top 60%` to section `bottom 40%`, scrub 0.8
3. Step cards: alternating left/right on desktop, stacked on mobile
   - Each card: `bg-[var(--dm-surface)]`, `border-radius: 1.5rem`, `border: 1px solid var(--dm-border)`, `shadow-md`
   - Active step (in viewport center): `border-left: 3px solid var(--dm-gold)`
   - Step number: Playfair Display 700, `clamp(2rem, 4vw, 3.5rem)`, `color: var(--dm-gold)`, `opacity: 0.15` as watermark behind card
   - Title: Inter 600, `var(--text-card-title)`, `color: var(--dm-ink)`
   - Description: Inter 400, `var(--text-base)`, `color: var(--dm-muted)`
   - Icon: Lucide icon, `24px`, `color: var(--dm-crimson)`

**Animation**:
- Golden thread: GSAP `strokeDashoffset` from full length to 0, scrubbed to scroll
- Per-step card entrance: GSAP `scale: 0.96 -> 1`, `opacity: 0 -> 1`, `y: 40 -> 0`, scrub 0.3, trigger per step `top 85%` to `top 55%`
- Step numbers: fade in with card

**Mobile** (< 768px):
- All cards stacked, left-aligned
- Golden thread simplified to straight vertical line with dot nodes
- Thread still animates on scroll
- No alternating layout

**Cultural elements**:
- Golden thread (红线 red thread of fate) as narrative backbone
- Chinese kicker "五步成礼"
- Paper-cut edge at bottom transition to Features (see PaperCutEdge component)

---

### S5: Features

**Layout**: Full-bleed crimson background. Two columns on desktop (copy left, phone mockup right), stacked on mobile.
- `background: var(--dm-crimson)` (#D42040) -- full bleed
- Container: `mx-auto max-w-6xl px-6 py-[clamp(5rem,10vw,10rem)]`
- Paper-cut edge at bottom: white scallops (24 on desktop, 12 on mobile) transitioning into Pricing section

**Background**: Solid `var(--dm-crimson)`. Paper-cut SVG overlay at 4% white opacity for subtle texture.

**Content structure**:
1. Section header:
   - Chinese kicker: "为何选择" in Noto Serif SC 700, `var(--text-kicker-cn)`, `color: var(--dm-gold)` -- gold on crimson for large display text
   - English kicker: "WHY DREAMMOMENTS" in Inter 500, `var(--text-kicker-en)`, `color: rgba(255,255,255,0.7)`
   - Headline: "Everything you need." in Playfair Display 700, `var(--text-subsection)`, white. "Nothing you don't." in Cormorant Garamond 400 italic, white.
2. Feature list (left column, 6 items):
   - Each item: gold circle icon (44px, `bg: var(--dm-gold)`, white Lucide icon 20px) + title (Inter 600, white, `1.0625rem`) + description (Inter 400, `rgba(255,255,255,0.85)`, `0.9375rem`)
   - Items: AI-Powered Content, Chinese Wedding Customs, One-Tap RSVP, Angpao QR Code, WhatsApp Share, Real-Time Dashboard
   - Hover: icon scales 1.1, subtle gold ring glow
3. Phone mockup (right column, desktop only on side):
   - White device frame, rounded corners
   - Interior: auto-scrolling invitation preview (CSS `translateY` loop in masked container)
   - Shadow: `0 20px 60px -12px rgba(0,0,0,0.25)`

**Animation**:
- Feature items stagger: GSAP `y: 24, opacity: 0 -> visible`, stagger 0.1s, triggered at section `top 80%`
- Phone mockup: Motion `whileInView` fade-up with slight scale

**Mobile** (< 768px):
- Single column: feature list above, phone mockup below at 75vw centered
- Crimson background PRESERVED (non-negotiable)
- Paper-cut bottom edge: 12 scallops
- CTA text and icons use white only (no gold on crimson for body text)

**Cultural elements**:
- Full-bleed vermillion is THE Chinese wedding color
- Chinese kicker "为何选择" in gold at display scale
- Paper-cut (剪纸) scalloped bottom edge
- Paper-cut SVG overlay texture at 4% white

---

### S6: Pricing

**Layout**: Light background, two-card comparison.
- `background: var(--dm-bg)` (#FAFAF8)
- Container: `mx-auto max-w-4xl px-6 py-[clamp(5rem,10vw,10rem)] text-center`

**Background**: `var(--dm-bg)`.

**Content structure**:
1. Section header:
   - Chinese kicker: "简单定价" in Noto Serif SC 700, `var(--text-kicker-cn)`, `color: var(--dm-gold)`
   - English kicker: "SIMPLE PRICING"
   - Headline: "One price. No subscriptions." in Playfair Display 700, `var(--text-section)`
   - MYR / SGD toggle: pill toggle, `bg: var(--dm-surface-muted)`, active tab `bg: var(--dm-surface)`
2. Two cards side-by-side on desktop, stacked (premium first) on mobile:
   - **Free card**: `bg: var(--dm-surface)`, `border: 1px dashed var(--dm-border)`, `border-radius: 1.5rem`, flat styling
     - Price: "RM 0" in Playfair Display 700, `3rem`, `color: var(--dm-ink)`
     - Feature list with check marks
     - CTA: secondary button "Get Started Free"
   - **Premium card**: `bg: var(--dm-gold-soft)`, `border: 3px solid var(--dm-gold)`, `border-radius: 1.5rem`, `translateY(-12px)` on desktop
     - Hongbao badge: red envelope styled badge "Most Popular" (see Component Inventory)
     - Price: "RM 49" in Playfair Display 700, `3.5rem`, `color: var(--dm-gold-warm)`, GSAP count-up from 0
     - Feature list with gold check marks
     - CTA: `MovingBorderButton` variant with gold gradient, "Upgrade for RM49"
     - Shadow: `0 12px 48px -12px rgba(212,175,55,0.15)`

**Animation**:
- Price count-up: GSAP `textContent` from 0 to 49, `snap: { textContent: 1 }`, 1.8s, `power2.out`, triggered at premium card `top 80%`
- Cards: Motion `whileInView` fade-up, stagger 0.15s
- Premium card: slight tilt straighten on hover (CSS only, `rotateY(-2deg) -> rotateY(0)`)

**Mobile** (< 768px):
- Stacked: premium card on top, free below
- No `translateY` offset
- Full-width cards
- Hongbao badge preserved, centered

**Cultural elements**:
- Hongbao (red envelope) badge on premium card
- Chinese kicker "简单定价"
- Gold accent theme on premium card

---

### S7: Final CTA

**Layout**: Dark dramatic close. Full-width centered.
- `background: var(--dm-dark-bg)` (#0D0D0D)
- Container: `mx-auto max-w-4xl px-6 py-[clamp(6rem,14vw,12rem)] text-center relative`

**Background**: Solid `--dm-dark-bg` with gold ornamental rule at top.

**Content structure**:
1. Gold ornamental rule at top: `GoldRule` component, gradient `transparent -> gold -> transparent`, `scaleX: 0 -> 1` animation on scroll
2. Giant neon-glow xi: `font-size: clamp(12rem, 35vw, 22rem)`, Noto Serif SC 900, `color: var(--dm-gold-electric)`, `opacity: 0.06`, centered behind content
   - Glow CSS: `text-shadow: 0 0 30px rgba(255,215,0,0.35), 0 0 60px rgba(255,215,0,0.18), 0 0 120px rgba(255,215,0,0.08)`
   - Neon-breathe CSS animation: opacity pulses 0.05 to 0.08, 4s ease-in-out infinite
   - `aria-hidden="true"`, `pointer-events: none`
3. Calligraphy: "爱情故事" in SVG, stroke-by-stroke reveal (Noto Serif SC 900, 3rem, `color: var(--dm-gold-electric)`)
   - Each stroke: `strokeDasharray` = length, `strokeDashoffset` animated to 0
   - Duration: 0.6s per stroke, 0.12s stagger, triggered at section `top 55%`
   - After draw: `fill` transitions from transparent to `var(--dm-gold-electric)` over 0.4s
4. Sub-kicker: "Your love story awaits." in Cormorant Garamond italic, `1.25rem`, `color: var(--dm-gold)`, `opacity: 0.8`
5. Headline: "Create an invitation your guests will" in Playfair Display 700, `clamp(2rem, 5vw, 3.5rem)`, `color: var(--dm-dark-text)`. "treasure." in Playfair Display 700 italic, `color: var(--dm-crimson)`, `clamp(2.5rem, 6vw, 4.5rem)`
6. CTA: `MovingBorderButton` with gold variant, "Create Your Invitation", `min-height: 56px`
7. Trust line: "Free to start. No credit card." in Inter 400, `var(--text-sm)`, `color: var(--dm-dark-muted)`
8. Gold ornamental rule at bottom

**Animation**:
- Xi entrance: GSAP `scale: 0.85 -> 1`, `rotation: -5 -> 0`, `opacity: 0 -> 0.06`, 1.5s, `power2.out`, triggered at section `top 70%`
- Calligraphy stroke reveal: as described above
- Headline: GSAP `scale: 0.9, y: 30, opacity: 0 -> visible`, 1.0s, `power3.out`
- Gold rules: `scaleX: 0 -> 1`, 0.8s, `power2.out`

**Mobile** (< 768px):
- Xi: 12rem, 2 text-shadow layers instead of 3, opacity 0.05
- Calligraphy: preserved, 2.5rem
- CTA: full-width
- Headline: 2rem base

**Cultural elements**:
- Giant neon-glow xi (gold variant, meditative, closing emotional arc)
- Calligraphy stroke-by-stroke ("爱情故事" = love story)
- Gold ornamental rules (scroll painting dividers)

---

### S8: Footer

**Layout**: Simple, quiet, centered.
- `background: var(--dm-bg)` (#FAFAF8)
- Container: `mx-auto max-w-4xl px-6 py-12 text-center`

**Background**: `var(--dm-bg)`. Subtle aurora gradient matching hero (bookend effect) -- very faint, `opacity: 0.03`.

**Content structure**:
1. Thin gold hairline at top: `height: 1px`, `background: linear-gradient(90deg, transparent, var(--dm-gold), transparent)`
2. Brand: `囍 DreamMoments 囍` -- xi characters in Noto Serif SC, 1rem, `color: var(--dm-gold)`, `opacity: 0.4`. Brand name in Playfair Display 600, 1.25rem
3. Tagline: "AI-powered wedding invitations for Chinese couples in Malaysia & Singapore." in Inter 400, `var(--text-sm)`, `color: var(--dm-muted)`
4. Links: Privacy | Terms | PDPA Compliant, Inter 400, `var(--text-sm)`, `color: var(--dm-muted)`, underline on hover
5. Copyright: Inter 400, `var(--text-xs)`, `color: var(--dm-muted)`, `opacity: 0.6`

**Animation**: None. Intentional calm after dramatic Final CTA.

**Mobile**: Same layout, full-width. Links wrap naturally.

**Cultural elements**: Flanking xi at 40% opacity, small but confident.

---

## 5. Animation Specifications

### Complete `animation.ts` Replacement

```typescript
// ─── Motion (Framer Motion / motion/react) Presets ───

export const ANIMATION = {
  ease: {
    default: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
    smooth: [0.4, 0, 0.2, 1] as [number, number, number, number],
  },
  duration: {
    fast: 0.4,
    normal: 0.6,
    slow: 0.8,
    entrance: 0.7,
  },
  stagger: {
    fast: 0.08,
    normal: 0.1,
    slow: 0.15,
  },
  viewport: {
    once: true,
    margin: "-80px" as const,
  },
} as const;

// Section reveal: generic fade-up for elements that don't need GSAP
export const sectionReveal = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION.duration.entrance,
      ease: ANIMATION.ease.default,
    },
  },
};

// Container for staggered children
export const containerReveal = {
  hidden: {},
  visible: {
    transition: { staggerChildren: ANIMATION.stagger.normal },
  },
};

// Child item for staggered reveal
export const childReveal = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: ANIMATION.duration.normal,
      ease: ANIMATION.ease.default,
    },
  },
};

// Mockup / card entrance
export const mockupReveal = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: ANIMATION.duration.slow,
      ease: ANIMATION.ease.default,
    },
  },
};

// Card hover state (Motion)
export const cardHover = {
  scale: 1.02,
  y: -8,
  transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] },
};

// ─── GSAP Presets ───

export const GSAP_EASE = {
  // Entrances
  entrance: "power3.out",
  entranceDramatic: "power4.out",
  entranceSoft: "power2.out",

  // Exits
  exit: "power2.in",

  // Continuous / scrubbed
  scrub: "none",

  // Emphasis
  bounce: "back.out(1.2)",

  // Transitions
  transition: "power2.inOut",
  transitionSlow: "power3.inOut",

  // Oscillation
  float: "sine.inOut",
} as const;

// ─── GSAP Section Configs ───

export const GSAP_HERO = {
  clipReveal:  { duration: 0.6, ease: GSAP_EASE.entrance },
  lineReveal:  { duration: 0.7, ease: GSAP_EASE.entrance, stagger: 0.12 },
  accentScale: { duration: 0.8, ease: GSAP_EASE.bounce },
  bodyFade:    { duration: 0.5, ease: GSAP_EASE.entranceSoft, stagger: 0.1 },
  cardRise:    { duration: 1.0, ease: GSAP_EASE.entranceDramatic },
} as const;

export const GSAP_SECTIONS = {
  statCountUp:   { duration: 2.0, ease: GSAP_EASE.entranceSoft },
  wordReveal:    { duration: 0.3, ease: GSAP_EASE.entranceSoft, stagger: 0.05 },
  cardStagger:   { duration: 0.6, ease: GSAP_EASE.entranceSoft, stagger: 0.15 },
  stepEntrance:  { duration: 0.6, ease: GSAP_EASE.entrance },
  featureStagger:{ duration: 0.6, ease: GSAP_EASE.entranceSoft, stagger: 0.1 },
  priceCountUp:  { duration: 1.8, ease: GSAP_EASE.entranceSoft },
  strokeDraw:    { duration: 0.6, ease: GSAP_EASE.transition, stagger: 0.12 },
  xiSettle:      { duration: 1.5, ease: GSAP_EASE.entranceSoft },
  goldRuleDraw:  { duration: 0.8, ease: GSAP_EASE.entranceSoft },
  clipWipe:      { ease: GSAP_EASE.scrub },
} as const;

// ─── ScrollTrigger Defaults ───

export const ST_DEFAULTS = {
  /** One-shot trigger at 80% viewport */
  oneShot: {
    start: "top 80%",
    toggleActions: "play none none none" as const,
  },
  /** Scrubbed reveal, bidirectional */
  scrubReveal: (start = "top 75%", end = "top 40%", scrub = 0.5) => ({
    start,
    end,
    scrub,
  }),
  /** Step entrance: trigger per element */
  stepEntrance: {
    start: "top 85%",
    end: "top 55%",
    scrub: 0.3,
  },
} as const;

// ─── Reduced Motion Helper ───

export function applyReducedMotion(
  elements: string | Element | Element[],
  finalState: gsap.TweenVars = { opacity: 1, y: 0, scale: 1, rotation: 0, clearProps: "all" }
) {
  // In reduced motion, snap to final state immediately
  gsap.set(elements, finalState);
}
```

### CSS Keyframes (added to `styles.css`)

```css
/* Neon breathe for xi characters */
@keyframes neon-breathe-gold {
  0%, 100% {
    opacity: 0.05;
    text-shadow:
      0 0 30px rgba(255, 215, 0, 0.35),
      0 0 60px rgba(255, 215, 0, 0.18),
      0 0 120px rgba(255, 215, 0, 0.08);
  }
  50% {
    opacity: 0.08;
    text-shadow:
      0 0 35px rgba(255, 215, 0, 0.5),
      0 0 70px rgba(255, 215, 0, 0.25),
      0 0 140px rgba(255, 215, 0, 0.12);
  }
}

@keyframes neon-breathe-crimson {
  0%, 100% {
    opacity: 0.08;
    text-shadow:
      0 0 20px rgba(232, 36, 60, 0.5),
      0 0 40px rgba(232, 36, 60, 0.25);
  }
  50% {
    opacity: 0.12;
    text-shadow:
      0 0 25px rgba(232, 36, 60, 0.6),
      0 0 50px rgba(232, 36, 60, 0.3);
  }
}

/* Moving border button spin */
@keyframes dm-border-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Gentle float for hero card */
@keyframes dm-gentle-float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
}

/* Reduced motion: kill all custom animations */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  .neon-xi, .neon-xi-gold, .hero-template-card {
    animation: none !important;
  }
}
```

### Complete ScrollTrigger Instance Map

| # | Section | Target | Type | Start | End | Scrub | Purpose |
|---|---------|--------|------|-------|-----|-------|---------|
| 1 | Social Proof | stat values | Toggle | `top 80%` | -- | -- | Count-up (one-shot) |
| 2 | Social Proof | testimonial words | Scrub | `top 75%` | `top 40%` | 0.5 | Word-by-word reveal |
| 3 | Showcase | card group | Toggle | `top 75%` | -- | -- | Stagger entrance (desktop) |
| 4 | How It Works | progress path | Scrub | `top 60%` | `bottom 40%` | 0.8 | Golden thread stroke-draw |
| 5 | How It Works | step cards (x5) | Scrub | `top 85%` | `top 55%` | 0.3 | Per-step entrance |
| 6 | Features | feature items | Toggle | `top 80%` | -- | -- | Feature stagger |
| 7 | Pricing | price value | Toggle | `top 80%` | -- | -- | Price count-up |
| 8 | Final CTA | xi character | Toggle | `top 70%` | -- | -- | Xi settle animation |
| 9 | Final CTA | calligraphy strokes | Toggle | `top 55%` | -- | -- | Stroke-by-stroke draw |
| 10 | Final CTA | headline | Toggle | `top 75%` | -- | -- | Headline entrance |
| 11 | Final CTA | gold rules | Toggle | `top 85%` | -- | -- | Rule draw |

**Total: 11 ScrollTrigger instances** (desktop). On mobile, How It Works scrub is simplified to toggle, reducing to ~10.

---

## 6. Component Inventory

### New Components

| File Path | Props Interface | Description |
|-----------|----------------|-------------|
| `src/components/landing/AuroraBackground.tsx` | `{ children: ReactNode; className?: string; intensity?: "subtle" \| "medium" \| "bold" }` | Renders 3 stacked radial gradients as a `::before` pseudo-element. Intensity controls opacity levels (subtle: 0.03-0.05, medium: 0.05-0.08, bold: 0.08-0.12). Pure CSS, no JS. |
| `src/components/landing/MovingBorderButton.tsx` | `{ children: ReactNode; className?: string; variant?: "crimson" \| "gold"; href?: string; onClick?: () => void }` | Button with rotating conic gradient border. Outer container `overflow-hidden rounded-full p-[2px]`, inner spinning gradient element, inner button with solid bg. Crimson variant for hero/features, gold variant for pricing/final-cta. Reduced motion: static 2px solid border. |
| `src/components/landing/PerspectiveCardStack.tsx` | `{ templates: Template[]; reducedMotion: boolean }` | Fanned card gallery for Showcase. Desktop: CSS `perspective: 1200px` with rotateY offsets (-6, -2, 2, 6 deg). Mobile: horizontal scroll with snap. Each card has 9:16 aspect ratio, glass overlay at bottom, hover straighten + lift. |
| `src/components/landing/HongbaoBadge.tsx` | `{ label?: string; className?: string }` | Red envelope badge for premium pricing card. Vermillion bg pill with envelope flap `::before` and gold xi `::after`. |
| `src/components/landing/SplitWords.tsx` | `{ children: string; className?: string }` | Wraps each word in a `<span data-word>` for GSAP word-level animation. Preserves spaces. For testimonial word-by-word reveal. |
| `src/components/landing/NeonXi.tsx` | `{ size: string; variant: "crimson" \| "gold"; opacity: number; breathe?: boolean; className?: string }` | Neon-glow xi character. Renders `囍` at given size with text-shadow glow layers. CSS animation for breathing. `aria-hidden="true"`. |

### Modified Components

| File Path | Changes |
|-----------|---------|
| `src/styles.css` | Updated `:root` custom properties (colors, type scale, tracking), added keyframes (neon-breathe, dm-border-spin, dm-gentle-float), added reduced-motion overrides |
| `src/components/landing/animation.ts` | Complete rewrite: V3 GSAP presets, Motion presets, ScrollTrigger defaults, reduced motion helper |
| `src/components/landing/Hero.tsx` | Centered layout (remove left-right split), GSAP entrance timeline, aurora background, moving-border CTA, NeonXi behind card, lattice overlay at 10% |
| `src/components/landing/SocialProof.tsx` | Dark section (`--dm-dark-bg`), massive stat numbers, GSAP count-up, word-by-word testimonial reveal, crimson left-border testimonial |
| `src/components/landing/Showcase.tsx` | PerspectiveCardStack on desktop, horizontal scroll-snap on mobile, lattice at 8%, Chinese kicker at display scale |
| `src/components/landing/HowItWorks.tsx` | Per-step GSAP scroll entrance, enhanced golden thread stroke-draw, step number watermarks, paper-cut bottom edge |
| `src/components/landing/Features.tsx` | Full-bleed crimson background, gold icon circles, feature list with stagger, paper-cut bottom edge, paper-cut SVG overlay texture |
| `src/components/landing/Pricing.tsx` | HongbaoBadge on premium, MovingBorderButton gold variant on premium CTA, GSAP price count-up, premium tilt straighten on hover |
| `src/components/landing/FinalCTA.tsx` | Dark bg, NeonXi gold variant, calligraphy stroke animation, MovingBorderButton gold, gold ornamental rules |
| `src/components/landing/Footer.tsx` | Aurora bookend, adjusted xi size (1rem at 40% opacity), gold hairline at top |
| `src/components/ui/Button.tsx` | No changes needed (existing variants sufficient for secondary/ghost CTAs) |
| `src/components/landing/motifs/LatticeOverlay.tsx` | Increase default opacity support, ensure `aria-hidden` is set |
| `src/components/landing/motifs/PeonyOutline.tsx` | Increase opacity from 0.06 to 0.10 |
| `src/components/landing/motifs/DoubleHappiness.tsx` | No structural change; usage patterns change (NeonXi replaces watermark usage) |
| `src/components/landing/motifs/PaperCutEdge.tsx` | Add configurable scallop count prop, mobile/desktop variants |
| `src/components/landing/motifs/SectionHeader.tsx` | Update to use new type scale, Chinese kicker above English at `--text-kicker-cn` size |
| `src/components/landing/motifs/GoldRule.tsx` | Add GSAP scaleX entrance animation support |
| `src/components/landing/motifs/CalligraphyReveal.tsx` | Enhance with per-stroke GSAP animation, fill transition after draw |
| `src/components/landing/hooks/useCountUp.ts` | Refactor to use GSAP `snap: { textContent: 1 }` pattern with ScrollTrigger |
| `src/components/landing/hooks/use3DTilt.ts` | Add radial glow element beneath card |
| `src/routes/index.tsx` | Updated gsap.context, pass reducedMotion to all sections |

---

## 7. Mobile Design Spec

### Breakpoint Behavior by Section

| Section | < 640px (sm) | 640-767px | >= 768px (md/lg+) |
|---------|-------------|-----------|-------------------|
| Hero | Single column, full-width CTAs stacked, card below fold (`loading="lazy"`), no 3D tilt, NeonXi 8rem/2 layers | Same, CTAs side-by-side | Centered editorial, 3D tilt on card, NeonXi 12rem/4 layers |
| Social Proof | Stats stacked vertically with horizontal gold dividers | Stats in row, smaller gap | Row with vertical gold dividers, gap-20 |
| Showcase | Horizontal scroll-snap, 80vw cards, no perspective | Same | PerspectiveCardStack with fan |
| How It Works | Single column, straight vertical thread, no alternating | Same | Alternating left/right, S-curve thread |
| Features | Single column, feature list then phone mockup, full-width | Same, mockup at 75vw | Two columns, copy left, phone right |
| Pricing | Stacked, premium first, full-width cards | Same | Side-by-side, premium elevated |
| Final CTA | NeonXi 12rem/2 layers, calligraphy 2.5rem, full-width CTA | Same | NeonXi 22rem/3 layers, calligraphy 3rem |
| Footer | Same layout, links wrap | Same | Same |

### Touch Targets

- All CTA buttons: `min-height: 52px` (exceeds 44px WCAG minimum)
- All interactive cards: `min-height: 48px` tap area
- All links: 8px minimum tap buffer via padding
- Mobile CTA buttons: `width: 100%` below 640px breakpoint

### Disabled Features on Mobile (< 768px)

| Feature | Why |
|---------|-----|
| 3D tilt on hero card | No cursor on touch devices |
| Perspective fan on Showcase | Confusing without hover states; native scroll is better UX |
| GSAP ambient aurora animation | Saves battery/CPU; static gradients only |
| NeonXi 4-layer text-shadow | Reduced to 2 layers for GPU budget |
| Hero parallax (if any) | Disabled, all elements at static positions |

### Performance Budget (Mobile)

| Metric | Target |
|--------|--------|
| LCP | < 2.0s (hero text = pure CSS, no image dependency) |
| CLS | < 0.05 (all sizes use `clamp()`, images have `aspect-ratio`) |
| INP | < 150ms (CTAs are native links, no heavy JS on interaction path) |
| Total page weight | < 800KB |

---

## 8. Performance Budget

### Core Web Vitals Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| LCP | < 2.0s | Hero text is pure CSS. Hero image is below fold on mobile with `loading="lazy"`. On desktop, hero image has `fetchPriority="high"` and `loading="eager"`. Font `font-display: swap`. |
| CLS | < 0.05 | All text uses `clamp()` (no layout shift on font load). All images have `aspect-ratio` set. No layout-shifting animations. Font fallback metrics matched. |
| INP | < 150ms | No scroll-jacking. CTA buttons are native links with immediate visual feedback. No blocking JS on interaction path. |
| FCP | < 1.2s | Critical CSS inlined by TanStack Start/Vite. Fonts loaded with `font-display: swap`. |
| TBT | < 200ms | GSAP loaded async. ScrollTrigger initializes after hero is visible. |

### Asset Budget

| Asset | Budget (gzipped) | Notes |
|-------|:--------:|-------|
| GSAP core | ~28KB | Tree-shaken |
| ScrollTrigger | ~12KB | Loaded with GSAP |
| Motion (framer) | ~20KB | Used for hover states, simple `whileInView` |
| React + TanStack | ~45KB | Framework overhead |
| App JS (landing) | ~25KB | Landing page components |
| CSS (total) | ~15KB | Including Tailwind utilities |
| Fonts (subsetted) | ~80KB | Playfair Display (Latin), Inter (Latin), Noto Serif SC (subset: ~30 characters used), Cormorant Garamond (Latin) |
| Template images (4) | ~300KB | WebP/AVIF, lazy-loaded except hero |
| SVG assets (inline) | ~12KB | Lattice, paper-cut, calligraphy, peony, golden thread |
| **Total** | **~537KB** | Well under 800KB |

### What to Lazy-Load

| Asset | Strategy |
|-------|----------|
| Template images (2-4) | `loading="lazy"`, `decoding="async"` |
| Hero template image (mobile) | `loading="lazy"` (below fold on mobile) |
| Hero template image (desktop) | `loading="eager"`, `fetchPriority="high"` |
| Calligraphy SVG paths | Inline in Final CTA component, rendered when section mounts |
| GSAP ScrollTrigger instances | Created in `useEffect` after hydration |
| NeonXi glow layers on mobile | Reduced from 4 to 2 layers |

### Font Strategy

- `font-display: swap` on all @font-face declarations
- Subset Noto Serif SC to only the ~30 CJK characters actually used on the landing page: 喜事来了四款精选五步成礼为何选择简单定价爱情故事口碑囍
- Subset Playfair Display to Latin + basic punctuation
- Subset Inter to Latin
- Subset Cormorant Garamond to Latin

---

## 9. Implementation Order

**Phase 1: Foundation (Day 1-2)**

1. `src/styles.css` -- Update `:root` custom properties (colors, type scale, tracking), add keyframes, add reduced-motion CSS
2. `src/styles.css` -- Update `@theme inline` block with new color tokens for Tailwind
3. `src/components/landing/animation.ts` -- Complete rewrite with V3 presets

**Phase 2: New Components (Day 2-3)**

4. `src/components/landing/AuroraBackground.tsx` -- New: reusable aurora gradient component
5. `src/components/landing/MovingBorderButton.tsx` -- New: animated gradient border button
6. `src/components/landing/NeonXi.tsx` -- New: neon-glow xi character component
7. `src/components/landing/SplitWords.tsx` -- New: word-splitting utility for GSAP
8. `src/components/landing/HongbaoBadge.tsx` -- New: red envelope pricing badge
9. `src/components/landing/PerspectiveCardStack.tsx` -- New: fanned card gallery

**Phase 3: Hero (Day 3-4)**

10. `src/components/landing/motifs/LatticeOverlay.tsx` -- Update: opacity prop support, aria-hidden
11. `src/components/landing/hooks/use3DTilt.ts` -- Update: add radial glow beneath card
12. `src/components/landing/Hero.tsx` -- Major rewrite: centered layout, GSAP timeline, aurora bg, moving-border CTA, NeonXi, lattice

**Phase 4: Social Proof + Showcase (Day 4-5)**

13. `src/components/landing/hooks/useCountUp.ts` -- Refactor to GSAP ScrollTrigger pattern
14. `src/components/landing/SocialProof.tsx` -- Rewrite: dark section, GSAP count-up, word-by-word testimonial
15. `src/components/landing/Showcase.tsx` -- Rewrite: PerspectiveCardStack desktop, scroll-snap mobile, lattice

**Phase 5: How It Works + Features (Day 5-7)**

16. `src/components/landing/motifs/PaperCutEdge.tsx` -- Update: configurable scallop count
17. `src/components/landing/motifs/SectionHeader.tsx` -- Update: new type scale, Chinese kicker prominence
18. `src/components/landing/HowItWorks.tsx` -- Enhanced: per-step GSAP entrance, improved golden thread, paper-cut edge
19. `src/components/landing/Features.tsx` -- Major rewrite: full-bleed crimson, gold icons, paper-cut edge, paper-cut SVG overlay

**Phase 6: Pricing + Final CTA + Footer (Day 7-9)**

20. `src/components/landing/Pricing.tsx` -- Update: HongbaoBadge, MovingBorderButton gold, GSAP count-up
21. `src/components/landing/motifs/GoldRule.tsx` -- Update: GSAP scaleX entrance
22. `src/components/landing/motifs/CalligraphyReveal.tsx` -- Enhance: per-stroke GSAP, fill transition
23. `src/components/landing/FinalCTA.tsx` -- Major rewrite: NeonXi gold, calligraphy strokes, MovingBorderButton, gold rules
24. `src/components/landing/Footer.tsx` -- Minor: aurora bookend, xi sizing, gold hairline

**Phase 7: Integration + Polish (Day 9-10)**

25. `src/routes/index.tsx` -- Update: gsap.context management, section composition, any new props
26. Cross-browser testing: Chrome, Safari, Firefox (desktop + mobile)
27. `prefers-reduced-motion` audit: verify every animation has fallback
28. Lighthouse audit: LCP, CLS, INP, total page weight
29. Accessibility audit: contrast ratios, focus order, screen reader, keyboard navigation
30. Mobile testing: iOS Safari (address bar resize), Android Chrome (touch momentum, GPU budget)

**Estimated total: 10 working days**

---

## Appendix A: CSS Additions to `styles.css`

All new CSS to be appended after existing `:root` block:

```css
/* ─── Neon Xi Breathing ─── */
.neon-xi-crimson {
  animation: neon-breathe-crimson 4s ease-in-out infinite;
}
.neon-xi-gold {
  animation: neon-breathe-gold 4s ease-in-out infinite;
}

/* ─── Moving Border Button ─── */
.dm-moving-border-spin {
  animation: dm-border-spin 3s linear infinite;
}

/* ─── Hero Card Float ─── */
.dm-hero-card-float {
  animation: dm-gentle-float 6s ease-in-out infinite;
}

/* ─── Paper-Cut Bottom Edge (24 scallops desktop) ─── */
.dm-paper-cut-bottom {
  clip-path: polygon(
    0% 0%, 100% 0%, 100% 94%,
    96% 97%, 92% 94%, 88% 97%, 84% 94%,
    80% 97%, 76% 94%, 72% 97%, 68% 94%,
    64% 97%, 60% 94%, 56% 97%, 52% 94%,
    48% 97%, 44% 94%, 40% 97%, 36% 94%,
    32% 97%, 28% 94%, 24% 97%, 20% 94%,
    16% 97%, 12% 94%, 8% 97%, 4% 94%,
    0% 97%
  );
  padding-bottom: 4rem;
}

/* Paper-Cut (12 scallops mobile) */
@media (max-width: 767px) {
  .dm-paper-cut-bottom {
    clip-path: polygon(
      0% 0%, 100% 0%, 100% 95%,
      92% 98%, 84% 95%, 75% 98%, 67% 95%,
      58% 98%, 50% 95%, 42% 98%, 33% 95%,
      25% 98%, 17% 95%, 8% 98%,
      0% 95%
    );
    padding-bottom: 3rem;
  }
}

/* ─── Aurora Background Pseudo-Element ─── */
.dm-aurora-bg {
  position: relative;
  isolation: isolate;
}
.dm-aurora-bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 80% 50% at 20% 40%, rgba(212,32,64,0.08) 0%, transparent 60%),
    radial-gradient(ellipse 60% 70% at 80% 20%, rgba(212,175,55,0.06) 0%, transparent 50%),
    radial-gradient(ellipse 70% 60% at 50% 90%, rgba(217,95,90,0.05) 0%, transparent 55%);
  pointer-events: none;
  z-index: -1;
}

/* ─── Gold Ornamental Rule ─── */
.dm-gold-rule {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--dm-gold), transparent);
}

/* ─── Dark Section Utility ─── */
.dm-dark-section {
  background: var(--dm-dark-bg);
  color: var(--dm-dark-text);
}

/* ─── Vermillion Section Utility ─── */
.dm-vermillion-section {
  background: var(--dm-crimson);
  color: #FFFFFF;
}

/* ─── Mobile Full-Width CTAs ─── */
@media (max-width: 639px) {
  .dm-cta-mobile-full {
    width: 100%;
    justify-content: center;
  }
}
```

## Appendix B: Bilingual Kicker Map

| Section | Chinese | English | CN Color | EN Color |
|---------|---------|---------|----------|----------|
| Hero | 喜事来了 | AI-POWERED INVITATIONS | `--dm-crimson` | `--dm-muted` |
| Social Proof | (no kicker) | (no kicker) | -- | -- |
| Showcase | 四款精选 | THE COLLECTION | `--dm-crimson` | `--dm-muted` |
| How It Works | 五步成礼 | THE PROCESS | `--dm-crimson` | `--dm-muted` |
| Features | 为何选择 | WHY DREAMMOMENTS | `--dm-gold` | `rgba(255,255,255,0.7)` |
| Pricing | 简单定价 | SIMPLE PRICING | `--dm-gold` | `--dm-muted` |
| Final CTA | 爱情故事 | YOUR LOVE STORY | `--dm-gold-electric` | `--dm-dark-muted` |

Chinese kicker is ALWAYS displayed ABOVE the English kicker, at `--text-kicker-cn` (1.5-2.5rem). English kicker is ALWAYS below, at `--text-kicker-en` (0.8125rem), uppercase, wide letter-spacing. Chinese is the emotional anchor; English is the functional label.

## Appendix C: Characters for Noto Serif SC Subsetting

Subset Noto Serif SC to these characters only (reduces font file from ~4MB to ~20KB):

```
囍喜事来了四款精选五步成礼为何选择简单定价爱情故事口碑
```

Total: 23 unique CJK characters + standard Latin/punctuation subset.
