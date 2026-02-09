# V3 Proposal Gamma: Cultural Futurist

## DreamMoments Landing Page Redesign -- "Neon Dynasty"

**Designer**: Gamma -- Cultural Futurist
**Direction**: Chinese visual culture as the FUTURE. Not heritage, not nostalgia -- aspiration. Shanghai Fashion Week meets Singapore tech. Shang Xia meets GENTLE MONSTER. Neon-stroke calligraphy, geometric lattice architecture, electric vermillion on deep ink. A wedding invitation platform that looks like it was designed by someone who goes to Art Basel Hong Kong, not someone who Googled "Chinese wedding decorations."

**Core Thesis**: Chinese cultural elements are not decoration. They are not a theme you apply. They are the ARCHITECTURE of this page. Every section is structurally defined by a Chinese visual motif rendered at maximum confidence. The 囍 glows. The lattice builds walls. The ink washes reveal. The paper-cut carves space. These elements are bold, visible, Instagram-worthy, and unapologetically modern.

**Inspiration**: GENTLE MONSTER flagship stores (Seoul/Shanghai), Shang Xia by Hermes, Angel Chen runway collections, Chen Man's editorial photography, Wang Zhihong's typographic experiments, NOWNESS China editorial design, Singapore's National Gallery rebranding, Shanghai Tang x contemporary art collaborations, Muccia Prada x AMO's 2024 Beijing installation.

---

## 1. Color Palette -- "Electric Ceremony"

This is NOT grandmother's tablecloth. This is a palette that belongs on a Shanghai Fashion Week runway backstage wall. Every color is pulled from Chinese cultural significance but pushed into contemporary intensity.

### Primary Palette

| Token | Hex | Name | Cultural Reference | Usage |
|-------|-----|------|-------------------|-------|
| `--cf-vermillion` | `#E63946` | Electric Vermillion (电朱) | Vermillion cinnabar, the pigment of imperial seals and temple gates -- pushed brighter, more electric | Primary CTA, hero accent, section highlights, the heartbeat |
| `--cf-vermillion-deep` | `#B5202E` | Deep Cinnabar (朱砂深) | Cinnabar stone before grinding | CTA hover, emphasis borders, active states |
| `--cf-vermillion-neon` | `#FF4D5A` | Neon Red (霓虹红) | Neon signs of Hong Kong/Shanghai nightlife | Glow effects, border animations, hover states |
| `--cf-vermillion-soft` | `#FDE8EA` | Blush Cinnabar (朱砂粉) | Morning light on red lacquer | Light tint backgrounds, badge fills |
| `--cf-coral` | `#FF6B6B` | Coral Pink (珊瑚粉) | South China Sea coral, prosperity | Secondary accent, decorative gradients, social proof |
| `--cf-champagne` | `#F5E6D3` | Champagne Silk (丝绸香槟) | Raw silk before dyeing | Card backgrounds, breathing sections, premium surface |
| `--cf-gold` | `#D4AF37` | Imperial Gold (帝金) | Forbidden City roof tiles | Decorative strokes, kickers, ornamental elements |
| `--cf-gold-electric` | `#FFD700` | Electric Gold (电金) | Gold under spotlight, not sunlight | Neon glow on 囍, hover shimmer, animated accents |
| `--cf-gold-pale` | `#FDF5E0` | Pale Gold Wash (淡金) | Diluted gold ink on rice paper | Gold-tinted surfaces, pricing section bg |

### Dark Foundation

| Token | Hex | Name | Usage |
|-------|-----|------|-------|
| `--cf-ink` | `#0D0D0D` | True Ink (墨黑) | Dark section backgrounds -- deep, rich, not warm-brown but pure ink black. This is calligraphy ink, not coffee. |
| `--cf-ink-warm` | `#1A1714` | Warm Ink (暖墨) | Body text on light backgrounds |
| `--cf-ink-mid` | `#2D2D2D` | Mid Ink (中墨) | Elevated surfaces on dark backgrounds |
| `--cf-ink-soft` | `#6B6B6B` | Soft Ink (淡墨) | Secondary text, captions |
| `--cf-surface` | `#FAFAF8` | Rice Paper (宣纸) | Page background -- cooler than current warm white, closer to actual rice paper |
| `--cf-surface-warm` | `#F5F0E8` | Aged Paper (旧纸) | Alternating section background |

### Accent Colors

| Token | Hex | Name | Usage |
|-------|-----|------|-------|
| `--cf-jade` | `#00B894` | Electric Jade (翡翠) | Success states, "step complete" indicators, nature accents |
| `--cf-indigo` | `#1A1A3E` | Midnight Indigo (靛蓝) | Showcase section background -- deeper and cooler than purple, like a Shanghai midnight sky |
| `--cf-indigo-light` | `#2D2D5E` | Twilight Indigo | Elevated cards on indigo background |

### Section Color Strategy -- "Voltage Rhythm"

The page alternates between HIGH VOLTAGE and QUIET CHARGE sections. Like breathing. Like a heartbeat. Like the rhythm of a lion dance drum.

```
1. [RICE PAPER]     Hero                 --cf-surface + vermillion/gold gradients
2. [CHAMPAGNE]      Social Proof         --cf-champagne (warm breathing strip)
3. [MIDNIGHT]       Showcase             --cf-indigo (dramatic gallery -- the WOW)
4. [RICE PAPER]     How It Works         --cf-surface (clean, scannable)
5. [VERMILLION]     Features             --cf-vermillion (full bleed RED -- the PUNCH)
6. [RICE PAPER]     Pricing              --cf-surface + --cf-gold-pale cards
7. [TRUE INK]       Final CTA            --cf-ink (calligraphy reveal -- the CLOSE)
8. [RICE PAPER]     Footer               --cf-surface (quiet exit)
```

### Gradient Recipes

```css
/* Hero ambient glow -- vermillion energy radiating from center-left */
--cf-gradient-hero: radial-gradient(
  ellipse at 35% 45%,
  rgba(230, 57, 70, 0.14) 0%,
  transparent 55%
), radial-gradient(
  ellipse at 70% 25%,
  rgba(212, 175, 55, 0.08) 0%,
  transparent 50%
);

/* Neon glow for 囍 character */
--cf-glow-neon: 0 0 20px rgba(255, 77, 90, 0.4),
                0 0 40px rgba(255, 77, 90, 0.2),
                0 0 80px rgba(255, 77, 90, 0.1);

/* Gold glow for decorative elements */
--cf-glow-gold: 0 0 15px rgba(255, 215, 0, 0.3),
                0 0 30px rgba(255, 215, 0, 0.15),
                0 0 60px rgba(255, 215, 0, 0.08);

/* Vermillion-to-coral gradient for section backgrounds */
--cf-gradient-vermillion: linear-gradient(
  135deg,
  #E63946 0%,
  #FF6B6B 100%
);

/* Indigo depth gradient */
--cf-gradient-indigo: linear-gradient(
  180deg,
  #1A1A3E 0%,
  #0D0D2A 100%
);
```

---

## 2. Typography -- Chinese Characters as HERO Elements

### Font Stack

| Role | Font Family | Fallback | Weight | Usage |
|------|------------|----------|--------|-------|
| **Display (CN)** | `"Noto Serif SC"` | `"Songti SC", serif` | 700, 900 | **THE HERO FONT.** Section kickers, giant background characters, 囍 component, all Chinese display text. This is the star. |
| **Display (EN)** | `"Playfair Display"` | `Georgia, serif` | 700, 900 | Hero headline, section titles, pull-quotes, price values |
| **Body** | `"Outfit"` | `system-ui, sans-serif` | 400, 500, 600 | All body text, CTAs, navigation, descriptions |
| **Editorial Accent** | `"Cormorant Garamond"` | `Georgia, serif` | 400i, 600 | Testimonial quotes, emotional emphasis text, sub-kickers |

**No new fonts.** All four are already loaded. Zero additional byte cost.

### Type Scale -- "Billboard Impact"

```css
--cf-text-hero:      clamp(4.5rem, 12vw + 1rem, 9rem);    /* 72px-144px -- MASSIVE */
--cf-text-chinese:   clamp(3rem, 8vw + 0.5rem, 6rem);     /* 48px-96px -- Chinese display characters */
--cf-text-section:   clamp(2.5rem, 5vw + 0.5rem, 4.5rem); /* 40px-72px */
--cf-text-subsection: clamp(1.5rem, 3vw + 0.25rem, 2.5rem);
--cf-text-kicker:    0.8125rem;                             /* 13px -- uppercase, tracked wide */
--cf-text-body-lg:   clamp(1.0625rem, 0.8vw + 0.5rem, 1.25rem);
--cf-text-body:      1rem;                                   /* 16px */
--cf-text-sm:        0.875rem;
--cf-text-xs:        0.75rem;
```

### The Chinese Character Strategy

Chinese characters are not translations. They are not subtitles. They are **DESIGN ELEMENTS** -- treated with the same reverence and scale as a fashion brand treats its logo.

**Rule 1: Chinese characters appear at DISPLAY scale.**
- Section kickers: `2-3rem` in Noto Serif SC 700
- Background watermarks: `12-20rem` -- visible, textural, NOT invisible at 3%
- Hero accent: `6rem` -- a standalone design moment

**Rule 2: Chinese and English text exist as PARALLEL NARRATIVES, not translation pairs.**
- Chinese kicker says something poetic/cultural (e.g., "喜事来了" = "joy arrives")
- English headline says something practical/persuasive (e.g., "Beautiful invitations your guests will remember")
- They complement each other, not duplicate each other

**Rule 3: Every section has a Chinese anchor.**

| Section | Chinese Kicker | Size | Font | Color |
|---------|---------------|------|------|-------|
| Hero | 喜事来了 ("Joy arrives") | `2rem` on mobile, `2.5rem` on desktop | Noto Serif SC 700 | `--cf-vermillion` |
| Social Proof | 口碑 ("Word of mouth") | `1.75rem` | Noto Serif SC 700 | `--cf-gold` |
| Showcase | 四款精选 ("Four curated picks") | `2rem` | Noto Serif SC 700 | `--cf-gold-electric` on indigo bg |
| How It Works | 五步成礼 ("Five steps to ceremony") | `2rem` | Noto Serif SC 700 | `--cf-vermillion` |
| Features | 为何选择 ("Why choose") | `2rem` | Noto Serif SC 700 | `--cf-gold` on vermillion bg |
| Pricing | 简单定价 ("Simple pricing") | `1.75rem` | Noto Serif SC 700 | `--cf-gold` |
| Final CTA | 爱情故事 ("Love story") | `3rem` with calligraphy stroke animation | Noto Serif SC 900 | `--cf-gold-electric` on ink bg |

### Typography Rules

1. **Hero headline at 9rem desktop (144px).** This is a billboard. Playfair Display 700, tracking -0.04em, line-height 1.0. Mobile minimum: 4.5rem (72px).
2. **Section kickers are DUAL-LINE: Chinese above, English below.** Chinese in Noto Serif SC 700 at display scale. English in Outfit 500, uppercase, letter-spacing 0.15em, at kicker scale. The Chinese is the emotional anchor; the English is the functional label.
3. **Body text line-height: 1.75.** Max line width: 60ch. Generous, readable, magazine-quality.
4. **Italic emphasis in Cormorant Garamond.** For emotional keywords ("remember", "treasure", "yours").
5. **Letter-spacing hierarchy**: Headlines at -0.04em (tight, powerful). Body at 0. Kickers at 0.15em (wide, editorial).

---

## 3. Hero Section -- "Neon Gate" (霓虹门)

### Concept

The hero is a gate. Not a metaphorical gate -- a VISUAL gate. The geometric lattice pattern frames the content like a Chinese moon gate (月亮门), rendered in thin gold lines at bold opacity. The 囍 character doesn't whisper in the background at 3% opacity -- it GLOWS with a neon-edge treatment, visible, proud, Instagram-worthy.

### Layout (Desktop 1440px+)

```
+------------------------------------------------------------------------+
|                                                                          |
|  [GEOMETRIC LATTICE PATTERN -- bold gold strokes, 15% opacity,           |
|   covering full background as architectural frame]                       |
|                                                                          |
|  [Radial vermillion glow: center-left, 14% opacity]                     |
|  [Radial gold glow: top-right, 8% opacity]                              |
|                                                                          |
|  +--LEFT (55%)---------------------------+  +--RIGHT (45%)----------+   |
|  |                                       |  |                       |   |
|  |  ┌──────────────────────────────┐     |  |   [NEON-GLOW 囍]      |   |
|  |  │ 喜事来了                      │     |  |   Positioned as       |   |
|  |  │ (Noto Serif SC, 2.5rem,      │     |  |   massive background  |   |
|  |  │  vermillion, visible)        │     |  |   behind template     |   |
|  |  └──────────────────────────────┘     |  |   card, 18rem,        |   |
|  |                                       |  |   12% opacity with    |   |
|  |  [囍 Made for Chinese Weddings]       |  |   neon-glow shadow    |   |
|  |  [AI-Powered]  <- badges              |  |                       |   |
|  |                                       |  |  +--TEMPLATE CARD--+  |   |
|  |  Beautiful invitations                |  |  | 3D perspective   |  |   |
|  |  your guests will                     |  |  | tilt on hover    |  |   |
|  |  remember.  <- 9rem, vermillion ital  |  |  | 9:16 aspect      |  |   |
|  |                                       |  |  | Floating gently  |  |   |
|  |  Create a stunning digital wedding    |  |  | (CSS animation)  |  |   |
|  |  invitation in minutes...             |  |  +------------------+  |   |
|  |                                       |  |                       |   |
|  |  [Create Your Invitation] [Browse]    |  |  [Floating badge:     |   |
|  |                                       |  |   "RM49 one-time"]    |   |
|  |  Free | No card | PDPA               |  |                       |   |
|  +---------------------------------------+  +-----------------------+   |
|                                                                          |
|  [Gold lattice line -- full-width divider at section bottom]            |
+------------------------------------------------------------------------+
```

### Layout (Mobile < 768px)

```
+-------------------------------+
|                               |
| [Lattice pattern, 10% opacity|
|  scaled for mobile]          |
|                               |
| 喜事来了                       |
| (Noto Serif SC, 2rem, vermil)|
|                               |
| [囍 badge] [AI-Powered badge]|
|                               |
| Beautiful                     |
| invitations                   |
| your guests                   |
| will remember.                |
| (4.5rem, tight leading)      |
|                               |
| Create a stunning digital...  |
|                               |
| [Create Your Invitation]      |
| [Browse Templates]            |
|                               |
| Free | No card | PDPA         |
|                               |
| +--TEMPLATE CARD (90% w)---+ |
| | No tilt, no rotation      | |
| | Clean centered display    | |
| | 囍 glow behind card at    | |
| | 10% opacity, 10rem        | |
| +---------------------------+ |
|                               |
+-------------------------------+
```

### Hero Technical Specifications

**Geometric Lattice Background:**
- Full-viewport SVG pattern overlay
- Pattern: interlocking octagonal/diamond lattice inspired by Chinese window screens (窗花)
- Stroke: `--cf-gold` at `strokeWidth: 0.8px`
- Opacity: `15%` on desktop, `10%` on mobile -- VISIBLE, architectural, NOT invisible
- Covers entire hero section as a structural grid

**Neon-Glow 囍:**
- Font: Noto Serif SC, weight 900
- Size: `18rem` on desktop, `10rem` on mobile
- Color: `--cf-vermillion-neon` (`#FF4D5A`)
- Opacity: `12%` on desktop, `8%` on mobile
- Position: behind template card, centered vertically
- Glow CSS:
```css
.neon-xi {
  color: #FF4D5A;
  opacity: 0.12;
  text-shadow:
    0 0 20px rgba(255, 77, 90, 0.6),
    0 0 40px rgba(255, 77, 90, 0.3),
    0 0 80px rgba(255, 77, 90, 0.15),
    0 0 120px rgba(255, 77, 90, 0.08);
  animation: neon-pulse 4s ease-in-out infinite;
}

@keyframes neon-pulse {
  0%, 100% { opacity: 0.12; }
  50% { opacity: 0.16; }
}
```
- Reduced motion: static, no pulse animation

**Radial Gradients:**
- Center-left vermillion: `radial-gradient(ellipse at 35% 45%, rgba(230,57,70,0.14) 0%, transparent 55%)`
- Top-right gold: `radial-gradient(ellipse at 70% 25%, rgba(212,175,55,0.08) 0%, transparent 50%)`

**3D Template Card (Desktop Only):**
- Container: `perspective: 1200px`
- Max rotation: 6deg on both axes
- Implementation: existing `use3DTilt` hook
- Floating animation: `translateY` oscillating 0px to -8px, 6s ease-in-out infinite
- Shadow: `0 20px 60px -12px rgba(0,0,0,0.15)`
- Border: `1px solid rgba(212,175,55,0.2)` (subtle gold frame)
- Border-radius: `1.5rem` (rounded-3xl)

**Cultural Kicker:**
- "喜事来了" in Noto Serif SC 700, `2.5rem`, color `--cf-vermillion`, positioned above badges
- This is the FIRST text element the eye hits. It is not tiny. It is not muted. It is a declaration.

**Headline:**
- "Beautiful invitations your guests will" in Playfair Display 700, `9rem` desktop / `4.5rem` mobile
- "remember." on new line, Playfair Display 700 italic, color `--cf-vermillion`, 110% of base size
- Line-height: 1.0
- Letter-spacing: -0.04em

**CTA Buttons:**
- Primary: `background: --cf-vermillion`, `color: white`, `border-radius: 999px`, `padding: 1rem 2.5rem`, `font: Outfit 600`
- Hover: `background: --cf-vermillion-deep`, gold shimmer sweep animation (CSS `@keyframes shimmer-sweep`)
- Secondary: `border: 1.5px solid --cf-vermillion`, `color: --cf-vermillion`, transparent background
- Both: `min-height: 52px`, `font-size: 1rem`

**Shimmer sweep CSS:**
```css
@keyframes shimmer-sweep {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

.dm-cta-primary:hover {
  background-image: linear-gradient(
    110deg,
    transparent 25%,
    rgba(255, 215, 0, 0.15) 37%,
    rgba(255, 215, 0, 0.25) 50%,
    rgba(255, 215, 0, 0.15) 63%,
    transparent 75%
  );
  background-size: 200% 100%;
  animation: shimmer-sweep 1.5s ease-in-out;
}
```

---

## 4. Section Layout and Transitions

### 4.1 Social Proof -- "The Silk Scroll" (丝绸卷轴)

**Background**: `--cf-champagne` (`#F5E6D3`)
**Concept**: A warm breathing strip that feels like unrolling a silk scroll. Gold ornamental rules at top and bottom. Stats and testimonial presented with editorial confidence.

```
+------------------------------------------------------------------------+
|  ─── gold ornamental rule (gradient: transparent -> gold -> transparent) |
|                                                                          |
|  口碑 (Noto Serif SC, 1.75rem, gold)                                     |
|  TRUSTED BY COUPLES (Outfit 500, 0.8125rem, tracking 0.15em, soft ink)  |
|                                                                          |
|  [500+]              [4.9/5]             [< 3 min]                      |
|  Couples served      Average rating      Setup time                     |
|  (counter animation) (counter animation)  (counter animation)           |
|                                                                          |
|  [Large testimonial in Cormorant Garamond italic, 1.5rem]              |
|  Decorative gold " quotation mark at 4rem, 20% opacity, left-aligned   |
|  "Our guests kept saying the invitation was the most beautiful          |
|   they'd ever received..."                                              |
|                 -- Wei Lin & Jun Hao, Kuala Lumpur                       |
|                                                                          |
|  ─── gold ornamental rule ───                                           |
+------------------------------------------------------------------------+
```

**Stats:**
- Numbers: Playfair Display 700, `3rem`, color `--cf-ink-warm`
- Labels: Outfit 400, `0.875rem`, color `--cf-ink-soft`
- Counter animation: GSAP `snap` + `innerText` tween, 1.5s duration, `power2.out`
- Triggered by ScrollTrigger at `top 75%`

**Transition IN**: Clip-path reveal from center outward
```css
/* Initial state */
clip-path: inset(0 50%);

/* Animated to */
clip-path: inset(0 0%);
/* GSAP ScrollTrigger, 0.8s, power3.out */
```

### 4.2 Showcase -- "The Midnight Gallery" (午夜画廊)

**Background**: `--cf-indigo` (`#1A1A3E`) -- deep midnight blue, not purple
**Concept**: Walking into a contemporary art gallery at night. Template cards are illuminated specimens on dark walls. The lattice pattern becomes the gallery's architectural framework.

```
+------------------------------------------------------------------------+
|  BG: --cf-indigo with gradient to darker at bottom                      |
|  [LATTICE OVERLAY -- gold, 10% opacity, full section]                   |
|                                                                          |
|  四款精选 (Noto Serif SC, 2rem, --cf-gold-electric)                      |
|  THE COLLECTION (Outfit 500, 0.8125rem, tracking 0.15em, white/60%)    |
|  Four templates, crafted for Chinese weddings.                          |
|  (Outfit 400, --cf-surface/70%)                                         |
|                                                                          |
|  Desktop: Horizontal scroll-jacking (GSAP ScrollTrigger pin)           |
|  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐                   |
|  │ CARD    │  │ CARD    │  │ CARD    │  │ CARD    │                     |
|  │ 65vh    │  │ 65vh    │  │ 65vh    │  │ 65vh    │                     |
|  │ height  │  │ height  │  │ height  │  │ height  │                     |
|  │         │  │         │  │         │  │         │                     |
|  │ Image   │  │ Image   │  │ Image   │  │ Image   │                     |
|  │ parallax│  │ parallax│  │ parallax│  │ parallax│                     |
|  │         │  │         │  │         │  │         │                     |
|  │ [Name]  │  │ [Name]  │  │ [Name]  │  │ [Name]  │                     |
|  │ [Desc]  │  │ [Desc]  │  │ [Desc]  │  │ [Desc]  │                     |
|  │ [Link]  │  │ [Link]  │  │ [Link]  │  │ [Link]  │                     |
|  └─────────┘  └─────────┘  └─────────┘  └─────────┘                   |
|                                                                          |
|  [Progress: ---- o ---- o ---- o ---- o ----]                          |
|  (gold dots, active dot scales to 1.5x)                                |
+------------------------------------------------------------------------+
```

**Card Styling:**
- Background: `--cf-ink-mid` (`#2D2D2D`)
- Border: `1px solid rgba(212, 175, 55, 0.15)` -- subtle gold frame
- Border-radius: `1.25rem`
- Shadow: `0 8px 40px -12px rgba(0,0,0,0.4)`
- Hover: scale 1.02, border brightens to `rgba(212,175,55,0.35)`, shadow deepens
- Card name: Playfair Display 600, white, `1.25rem`
- Card description: Outfit 400, `white/70%`, `0.875rem`
- "Preview" link: Outfit 500, `--cf-gold-electric`, underline on hover

**Lattice Overlay on Indigo:**
- Same `LatticeOverlay` component but with:
  - color: `--cf-gold` (`#D4AF37`)
  - opacity: `10%` -- BOLD, visible, architectural
  - This is not subtle. The lattice is the WALLS of the gallery.

**Mobile Adaptation:**
- Native horizontal swipe with `scroll-snap-type: x mandatory`
- Cards at 85vw, next card peeking at 15%
- No horizontal scroll-jacking (native scroll only)
- Lattice reduced to 6% opacity

**Transition IN**: Ink wash reveal -- the section fades in with a left-to-right gradient mask

```css
/* Ink wash mask animation */
.showcase-section {
  mask-image: linear-gradient(to right, black 0%, transparent 0%);
  /* GSAP animates the gradient stop from 0% to 100% */
}
```

GSAP implementation:
```javascript
gsap.to(".showcase-section", {
  scrollTrigger: {
    trigger: ".showcase-section",
    start: "top 85%",
    toggleActions: "play none none none"
  },
  maskImage: "linear-gradient(to right, black 100%, transparent 100%)",
  duration: 1.2,
  ease: "power2.inOut"
});
```

### 4.3 How It Works -- "The Golden Thread" (金线)

**Background**: `--cf-surface` (rice paper white)
**Concept**: An SVG golden thread that draws itself as the user scrolls, connecting each step. Clean, scannable, with Chinese cultural refinement in the details.

```
+------------------------------------------------------------------------+
|  BG: --cf-surface                                                        |
|                                                                          |
|  五步成礼 (Noto Serif SC, 2rem, --cf-vermillion)                         |
|  FROM SIGN-UP TO RSVPs (Outfit 500, kicker scale, soft ink)             |
|  Five steps to your invitation.                                          |
|                                                                          |
|       [Golden SVG Thread -- stroke-dashoffset animated on scroll]       |
|       │                                                                  |
|  01   ●──── ┌──────────────────────────────────────┐                    |
|       │     │ Sign up in seconds                    │                    |
|       │     │ Free account, no credit card needed.  │                    |
|       │     └──────────────────────────────────────┘                    |
|       │                                                                  |
|  02   ●────          ┌──────────────────────────────┐                   |
|       │              │ Pick your template             │                  |
|       │              │ Four designs for Chinese...     │                  |
|       │              └──────────────────────────────┘                   |
|       │                                                                  |
|  03   ●──── ┌──────────────────────────────────────┐                    |
|       │     │ Let AI write your story                │                   |
|       │     │ Answer a few questions, AI does rest.  │                   |
|       │     └──────────────────────────────────────┘                    |
|       │                                                                  |
|  04   ●────          ┌──────────────────────────────┐                   |
|       │              │ Make it yours                   │                  |
|       │              │ Customize colors, photos, text. │                  |
|       │              └──────────────────────────────┘                   |
|       │                                                                  |
|  05   ●──── ┌──────────────────────────────────────┐                    |
|             │ Share & track RSVPs                    │                    |
|             │ WhatsApp sharing, real-time dashboard. │                   |
|             └──────────────────────────────────────┘                    |
+------------------------------------------------------------------------+
```

**Golden Thread:**
- SVG `<path>` with decorative curves between nodes (not straight -- gentle S-curves)
- Stroke: `linear-gradient(#D4AF37, #FFD700)` (gold to electric gold)
- Stroke width: `2px`
- `stroke-dasharray` = total path length
- `stroke-dashoffset` animated from full length to 0 via GSAP ScrollTrigger scrub
- Scrub range: section `top 70%` to section `bottom 40%`

**Step Nodes:**
- Unfilled circles: `36px` diameter, `2px` stroke in `--cf-gold`
- As thread reaches each node: fill transitions to `--cf-vermillion` over 0.3s
- Step number: Playfair Display 700, `2rem`, `--cf-vermillion`

**Step Cards:**
- Background: `--cf-surface` (white)
- Border: `1px solid --cf-border` + `border-left: 3px solid --cf-vermillion` (left cards) or `border-right: 3px solid --cf-vermillion` (right cards)
- Shadow: `0 4px 24px -8px rgba(0,0,0,0.06)`
- Hover: `translateY(-3px)`, shadow deepens
- Title: Outfit 600, `1.125rem`, `--cf-ink-warm`
- Description: Outfit 400, `0.9375rem`, `--cf-ink-soft`
- Padding: `2rem 2.5rem`

**Paper-Cut Bottom Edge:**
```css
.how-it-works-section {
  clip-path: polygon(
    0% 0%, 100% 0%, 100% 95%,
    96% 97%, 92% 94%, 88% 97.5%, 84% 94.5%,
    80% 97%, 76% 94%, 72% 97.5%, 68% 94.5%,
    64% 97%, 60% 94%, 56% 97.5%, 52% 94.5%,
    48% 97%, 44% 94%, 40% 97.5%, 36% 94.5%,
    32% 97%, 28% 94%, 24% 97.5%, 20% 94.5%,
    16% 97%, 12% 94%, 8% 97.5%, 4% 94.5%,
    0% 97%
  );
}
```
This creates a scalloped paper-cut (剪纸) edge that is the STRUCTURAL BORDER, not a decoration at 3% opacity.

**Mobile:**
- Single column, all cards left-aligned
- Thread simplified to straight vertical line with dot nodes
- Step cards full-width, no alternating
- Paper-cut edge simplified to 12 scallops

### 4.4 Features -- "The Red Pavilion" (红亭)

**Background**: `--cf-vermillion` FULL BLEED. The entire section is electric vermillion.
**Concept**: Walking into a red lacquered pavilion. This is the BOLD moment. The moment where competitors would play it safe and we don't.

```
+------------------------------------------------------------------------+
|  BG: --cf-vermillion (full bleed #E63946)                               |
|  [Chinese paper-cut SVG overlay -- white, 5% opacity]                   |
|                                                                          |
|  +--LEFT (50%)------------------------+  +--RIGHT (50%)-------------+  |
|  |                                    |  |                           |  |
|  |  为何选择 (gold, 2rem)              |  |  [Phone mockup frame]     |  |
|  |  WHY DREAMMOMENTS                  |  |  White bezel, rounded     |  |
|  |                                    |  |  Screen shows auto-       |  |
|  |  Everything you need.              |  |  scrolling invitation     |  |
|  |  Nothing you don't.               |  |  preview (CSS translateY  |  |
|  |  (Playfair Display, white, 3rem)  |  |  loop inside masked      |  |
|  |  "Nothing" in Cormorant italic    |  |  container)              |  |
|  |                                    |  |                           |  |
|  |  [gold circle] AI-Powered Content |  |  [Neon 囍 badge floating  |  |
|  |  [gold circle] Chinese Weddings   |  |   near phone, gold glow]  |  |
|  |  [gold circle] One-Tap RSVP       |  |                           |  |
|  |  [gold circle] Angpao QR Code     |  |                           |  |
|  |  [gold circle] WhatsApp Share     |  |                           |  |
|  |  [gold circle] Real-Time Dashboard|  |                           |  |
|  |                                    |  |                           |  |
|  |  (white text, gold icons)         |  |                           |  |
|  +------------------------------------+  +---------------------------+  |
|                                                                          |
|  [Paper-cut clip-path bottom edge -- white scallops into next section]  |
+------------------------------------------------------------------------+
```

**Feature List Styling:**
- Icon circles: `44px`, background `--cf-gold`, white Lucide icon inside (`20px`)
- Title: Outfit 600, white, `1.0625rem`
- Description: Outfit 400, `rgba(255,255,255,0.85)`, `0.9375rem`
- Stagger entrance: 0.1s per item, `y: 20px, opacity: 0`
- Hover: icon circle scales 1.1, `box-shadow: 0 0 0 4px rgba(255,215,0,0.3)` (gold ring)

**Color Contrast on Red:**
- White text on `#E63946`: contrast ratio 4.53:1 (passes WCAG AA for large text, and body text at these sizes)
- Gold `#D4AF37` on `#E63946`: contrast ratio 2.8:1 -- **USE ONLY for large decorative text (kickers, 2rem+), never for body text**
- White `#FAFAF8` on `#E63946`: 4.55:1 -- passes AA

**Paper-Cut SVG Overlay:**
- A simplified jianzhi pattern (paper-cut flowers and birds)
- Color: white
- Opacity: `5%`
- Inline SVG, `~4KB`
- `pointer-events: none`, `aria-hidden: true`

**Mobile:**
- Stack: feature list on top, phone mockup below at 75vw centered
- Full-width vermillion background PRESERVED -- non-negotiable
- Paper-cut bottom edge simplified to 8 scallops

### 4.5 Pricing -- "The Red Envelope Offering" (红包)

**Background**: `--cf-surface` with premium card having `--cf-gold-pale` background
**Concept**: Clean, clear pricing with one culturally clever detail: the premium card's badge is styled as a miniature red envelope (红包).

```
+------------------------------------------------------------------------+
|  BG: --cf-surface                                                        |
|                                                                          |
|  简单定价 (Noto Serif SC, 1.75rem, --cf-gold)                            |
|  ONE PRICE. NO SUBSCRIPTIONS. (Outfit 500, kicker)                      |
|  [MYR / SGD toggle]                                                     |
|                                                                          |
|  +---FREE CARD-----------+    +---PREMIUM CARD (elevated)------------+  |
|  | --cf-surface bg       |    | --cf-gold-pale bg                    |  |
|  | dashed border         |    | 3px solid --cf-gold border           |  |
|  |                       |    |                                      |  |
|  | Free                  |    | ┌─RED ENVELOPE BADGE──────────────┐  |  |
|  | RM 0                  |    | │ Most Popular          (hongbao) │  |  |
|  | (Playfair, 3.5rem)    |    | └────────────────────────────────┘  |  |
|  |                       |    |                                      |  |
|  | [feature list]        |    | Premium                              |  |
|  |                       |    | RM 49 / SGD 19                       |  |
|  | [Get Started Free]    |    | (Playfair 700, 3.5rem, --cf-gold,    |  |
|  | (secondary CTA)       |    |  counter animation)                  |  |
|  +------------------------+   |                                      |  |
|                                | [feature list with gold checks]     |  |
|                                |                                      |  |
|                                | [Upgrade for RM49]                   |  |
|                                | (primary vermillion CTA + shimmer)  |  |
|                                +--------------------------------------+  |
+------------------------------------------------------------------------+
```

**Red Envelope Badge:**
```css
.hongbao-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--cf-vermillion);
  color: white;
  padding: 0.5rem 1.25rem;
  border-radius: 0.5rem;
  font-family: "Outfit", sans-serif;
  font-weight: 600;
  font-size: 0.8125rem;
  letter-spacing: 0.05em;
  position: relative;
}

/* Envelope flap detail */
.hongbao-badge::before {
  content: "";
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 6px;
  background: var(--cf-vermillion-deep);
  border-radius: 0 0 4px 4px;
  clip-path: polygon(10% 0, 90% 0, 100% 100%, 0% 100%);
}

/* Gold clasp circle */
.hongbao-badge::after {
  content: "囍";
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 20px;
  background: var(--cf-gold);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Noto Serif SC", serif;
  font-size: 0.5rem;
  font-weight: 900;
  color: white;
}
```

**Price Counter Animation:**
```javascript
gsap.from(".price-value", {
  scrollTrigger: {
    trigger: ".pricing-section",
    start: "top 70%"
  },
  innerText: 0,
  duration: 1.5,
  snap: { innerText: 1 },
  ease: "power2.out"
});
```

**Premium Card Elevation:**
- `translateY(-12px)` relative to free card on desktop
- `box-shadow: 0 12px 48px -12px rgba(212,175,55,0.2)` (gold tinted shadow)
- Mobile: stack vertically, premium on top, no translateY, gold shadow preserved

### 4.6 Final CTA -- "The Calligraphy Seal" (书法印)

**Background**: `--cf-ink` (`#0D0D0D`) -- true ink black
**Concept**: The emotional close. Dark, dramatic, intimate. Like the final brushstroke on a calligraphy scroll. The Chinese characters "爱情故事" are written stroke-by-stroke as the user scrolls to this section. A giant neon-glow 囍 breathes slowly in the background.

```
+------------------------------------------------------------------------+
|  BG: --cf-ink (#0D0D0D)                                                 |
|                                                                          |
|  [Gold ornamental rule -- top]                                           |
|                                                                          |
|  [Giant 囍 -- 22rem, gold-electric, 5% opacity, NEON GLOW,             |
|   centered, slow rotation: 180s full cycle]                             |
|                                                                          |
|  爱情故事                                                                |
|  (Noto Serif SC 900, 3rem, --cf-gold-electric,                          |
|   SVG calligraphy stroke animation on scroll)                           |
|                                                                          |
|  Your love story awaits.                                                 |
|  (Cormorant Garamond italic, 1.25rem, --cf-gold/80%)                   |
|                                                                          |
|  Create an invitation                                                    |
|  your guests will treasure.                                              |
|  (Playfair Display 700, 3.5rem, --cf-surface)                          |
|                                                                          |
|  [Create Your Invitation]                                                |
|  (Large vermillion CTA with gold glow pulse)                            |
|                                                                          |
|  Free to start. No credit card.                                          |
|  (Outfit 400, --cf-ink-soft)                                            |
|                                                                          |
|  [Gold ornamental rule -- bottom]                                        |
+------------------------------------------------------------------------+
```

**Giant Neon-Glow 囍:**
- Size: `22rem` on desktop, `12rem` on mobile
- Color: `--cf-gold-electric` (`#FFD700`)
- Opacity: `5%`
- Glow:
```css
.final-cta-xi {
  color: #FFD700;
  opacity: 0.05;
  text-shadow:
    0 0 30px rgba(255, 215, 0, 0.4),
    0 0 60px rgba(255, 215, 0, 0.2),
    0 0 120px rgba(255, 215, 0, 0.1);
  animation: slow-rotate 180s linear infinite;
}

@keyframes slow-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```
- Reduced motion: no rotation, static

**CTA Gold Glow Pulse:**
```css
.final-cta-button {
  background: var(--cf-vermillion);
  color: white;
  padding: 1.125rem 3rem;
  border-radius: 999px;
  font-family: "Outfit", sans-serif;
  font-weight: 600;
  font-size: 1.125rem;
  min-height: 56px;
  animation: gold-pulse 3s ease-in-out infinite;
}

@keyframes gold-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.4);
  }
  50% {
    box-shadow: 0 0 30px 6px rgba(212, 175, 55, 0);
  }
}
```

**Contrast on Ink Black:**
- `--cf-surface` (`#FAFAF8`) on `#0D0D0D`: 19.5:1 (AAA)
- `--cf-gold-electric` (`#FFD700`) on `#0D0D0D`: 12.8:1 (AAA)
- `--cf-gold` (`#D4AF37`) on `#0D0D0D`: 8.4:1 (AAA)

### 4.7 Footer -- "Quiet Seal" (静印)

**Background**: `--cf-surface`
**Concept**: The maximalism stops. Restrained, minimal, like the quiet moment after a celebration. One cultural touch: 囍 flanking the wordmark.

```
+------------------------------------------------------------------------+
|  BG: --cf-surface                                                        |
|                                                                          |
|  ─── thin gold hairline ───                                              |
|                                                                          |
|  囍  DreamMoments  囍                                                     |
|  (囍 in Noto Serif SC, 0.875rem, --cf-gold, 40% opacity)               |
|  (DreamMoments in Playfair Display 600, 1.25rem)                        |
|                                                                          |
|  AI-powered wedding invitations                                          |
|  for Chinese couples in Malaysia & Singapore.                            |
|  (Outfit 400, --cf-ink-soft, 0.875rem)                                  |
|                                                                          |
|  Privacy  |  Terms  |  PDPA Compliant                                    |
|                                                                          |
|  (c) 2026 DreamMoments. All rights reserved.                            |
|  (Outfit 400, --cf-ink-soft/50%, 0.75rem)                               |
+------------------------------------------------------------------------+
```

---

## 5. Animation Strategy

### 5.0 Philosophy

Every animation has a CULTURAL REASON. We don't animate because we can. We animate because the motion carries meaning.

| Animation | Cultural Metaphor | Why It Works |
|-----------|------------------|-------------|
| Ink wash reveals | Chinese ink painting (水墨画) -- content appears like ink spreading on paper | Connects the digital experience to one of the oldest Chinese art forms |
| Calligraphy stroke | Chinese calligraphy (书法) -- strokes drawn in correct order | Shows cultural respect and literacy; mesmerizing to watch |
| Paper-fold transitions | Chinese paper folding (折纸) -- sections unfold like paper art | Creates depth and dimensionality in section transitions |
| Neon glow pulse | Shanghai/Hong Kong neon signs -- the modern Chinese urban landscape | Bridges traditional motifs (囍) with contemporary Asian identity |
| Golden thread draw | Red string of fate (红线) -- connecting soulmates | The timeline literally draws the thread that connects the steps to love |
| Floating gentle motion | Lantern floating (放天灯) -- gentle upward drift | Template card floats gently, suggesting weightlessness and aspiration |

### 5.1 Ink Wash Reveals (Section Transitions)

Used between major sections. Content appears as if ink is spreading across rice paper from left to right.

**Implementation** (no GSAP DrawSVG needed -- CSS mask + GSAP):

```javascript
// Ink wash reveal for a section
const inkWashReveal = (sectionEl) => {
  gsap.fromTo(sectionEl, {
    clipPath: "inset(0 100% 0 0)",
    opacity: 0.3
  }, {
    clipPath: "inset(0 0% 0 0)",
    opacity: 1,
    duration: 1.0,
    ease: "power2.inOut",
    scrollTrigger: {
      trigger: sectionEl,
      start: "top 80%",
      toggleActions: "play none none none"
    }
  });
};
```

**Used on**: Showcase section, Features section, Final CTA section

**Reduced motion**: instant opacity fade, no clip-path animation

### 5.2 Calligraphy Stroke Animation (Final CTA)

The characters "爱情故事" are pre-traced as SVG paths where each stroke is a separate `<path>`. Strokes are ordered correctly per Chinese stroke order (横竖撇捺).

**Implementation** (GSAP free tier, no DrawSVG):

```javascript
const calligraphyReveal = () => {
  const strokes = document.querySelectorAll(".calligraphy-char path");

  strokes.forEach((stroke, i) => {
    const length = stroke.getTotalLength();

    // Set initial state
    gsap.set(stroke, {
      strokeDasharray: length,
      strokeDashoffset: length,
      fill: "transparent",
      stroke: "#FFD700",
      strokeWidth: 2.5
    });

    // Animate stroke drawing
    gsap.to(stroke, {
      scrollTrigger: {
        trigger: ".final-cta-section",
        start: "top 55%",
        toggleActions: "play none none none"
      },
      strokeDashoffset: 0,
      duration: 0.6,
      delay: i * 0.12,
      ease: "power2.inOut",
      onComplete: () => {
        // After drawing, fill in the character
        gsap.to(stroke, {
          fill: "#FFD700",
          stroke: "transparent",
          duration: 0.4,
          ease: "power1.out"
        });
      }
    });
  });
};
```

**SVG asset**: Pre-traced paths for 4 characters, ~6KB inline SVG. Each character has 8-15 strokes. Total: ~45 paths.

**Reduced motion**: Show final state immediately (filled characters, no stroke animation)

### 5.3 Paper-Fold Section Transitions

The paper-fold effect makes sections appear as if they are being unfolded from the center, like opening a folded invitation.

**Implementation** (CSS transform + GSAP):

```javascript
// Paper-fold reveal for section content
const paperFoldReveal = (containerEl) => {
  gsap.from(containerEl, {
    scrollTrigger: {
      trigger: containerEl,
      start: "top 80%",
      toggleActions: "play none none none"
    },
    rotateX: -8,
    transformOrigin: "top center",
    opacity: 0,
    y: 30,
    duration: 0.9,
    ease: "power3.out"
  });
};
```

**Used on**: How It Works cards, Feature items, Pricing cards

**Reduced motion**: simple fade-in

### 5.4 Neon Glow Breathing (囍 Characters)

The 囍 characters in the hero and final CTA have a breathing neon glow -- their opacity and text-shadow intensity pulse gently, mimicking the flicker of real neon signage.

**Implementation** (pure CSS, zero JS):

```css
@keyframes neon-breathe {
  0%, 100% {
    opacity: 0.12;
    text-shadow:
      0 0 20px rgba(255, 77, 90, 0.5),
      0 0 40px rgba(255, 77, 90, 0.25),
      0 0 80px rgba(255, 77, 90, 0.12);
  }
  50% {
    opacity: 0.18;
    text-shadow:
      0 0 25px rgba(255, 77, 90, 0.65),
      0 0 50px rgba(255, 77, 90, 0.35),
      0 0 100px rgba(255, 77, 90, 0.18);
  }
}

/* For gold variant in Final CTA */
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

@media (prefers-reduced-motion: reduce) {
  .neon-xi,
  .final-cta-xi {
    animation: none !important;
  }
}
```

### 5.5 Lattice Pattern Scroll Drift

The geometric lattice background in the Hero and Showcase sections drifts slowly on scroll, creating a living texture.

**Implementation** (GSAP ScrollTrigger):

```javascript
gsap.to(".lattice-overlay svg", {
  scrollTrigger: {
    trigger: ".lattice-overlay",
    start: "top bottom",
    end: "bottom top",
    scrub: 1
  },
  y: -40,
  ease: "none"
});
```

This is subtle -- 40px of movement over the full section scroll. It creates a parallax depth effect that makes the lattice feel like it exists on a separate plane from the content.

**Reduced motion**: disabled, lattice is static

### 5.6 Template Card Floating (Hero)

The template card in the hero section floats gently, as if suspended by invisible strings -- like a lantern.

**Implementation** (pure CSS):

```css
@keyframes gentle-float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-6px) rotate(0.3deg); }
  66% { transform: translateY(-3px) rotate(-0.2deg); }
}

.hero-template-card {
  animation: gentle-float 6s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .hero-template-card {
    animation: none;
  }
}
```

### 5.7 Gold Ornamental Rule Draw

The gold horizontal rules in Social Proof and Final CTA sections draw themselves from center outward.

```javascript
gsap.fromTo(".gold-rule", {
  scaleX: 0,
  transformOrigin: "center center"
}, {
  scaleX: 1,
  duration: 0.8,
  ease: "power2.out",
  scrollTrigger: {
    trigger: ".gold-rule",
    start: "top 85%",
    toggleActions: "play none none none"
  }
});
```

### 5.8 Counter Animations

All statistics (500+, 4.9/5, < 3 min, RM 49) animate from 0 to their final value when scrolled into view.

```javascript
gsap.from(".counter-value", {
  scrollTrigger: {
    trigger: ".counter-container",
    start: "top 75%"
  },
  innerText: 0,
  duration: 1.5,
  snap: { innerText: 1 },
  ease: "power2.out"
});
```

### 5.9 Staggered Section Entrances

Every section's content elements stagger in from below:

```javascript
gsap.from(".section-content > *", {
  scrollTrigger: {
    trigger: ".section-content",
    start: "top 80%",
    toggleActions: "play none none none"
  },
  y: 30,
  opacity: 0,
  duration: 0.7,
  stagger: 0.1,
  ease: "power3.out"
});
```

### Animation Configuration Object

```typescript
export const CF_ANIMATION = {
  duration: {
    fast: 0.4,
    normal: 0.7,
    slow: 1.0,
    reveal: 1.2,     // Ink wash reveals
    calligraphy: 0.6, // Per-stroke duration
  },
  ease: {
    default: "power3.out",
    dramatic: "power4.out",
    smooth: "power2.inOut",
    springy: "elastic.out(1, 0.4)",
    linear: "none",
  },
  stagger: {
    fast: 0.08,
    normal: 0.1,
    slow: 0.15,
    calligraphy: 0.12,
  },
  scroll: {
    start: "top 80%",
    toggleActions: "play none none none" as const,
  },
  neon: {
    breatheDuration: "4s",
    glowIntensity: { hero: 0.12, finalCta: 0.05 },
    pulseRange: { min: 0.12, max: 0.18 },
  },
  lattice: {
    opacity: { desktop: 0.15, mobile: 0.10 },
    scrollDrift: 40, // px
  },
  cultural: {
    xiOpacity: { hero: 0.12, finalCta: 0.05, footer: 0.4 },
    xiSize: { hero: "18rem", finalCta: "22rem", mobile: { hero: "10rem", finalCta: "12rem" } },
    latticeOpacity: { hero: 0.15, showcase: 0.10, mobile: 0.06 },
    paperCutScallops: { desktop: 24, mobile: 12 },
    calligraphyChars: 4, // "爱情故事"
  },
} as const;
```

---

## 6. Standout Components (3-4)

### Component 1: Neon-Glow 囍 (NeonDoubleHappiness)

**What it is**: The 囍 character rendered at massive scale with a genuine neon-sign glow effect. Not a subtle watermark. Not a ghost at 3% opacity. A VISIBLE, breathing, glowing cultural symbol.

**Why it's a differentiator**: No wedding website on the planet has a neon-glow Chinese character as a design element. This bridges the traditional (囍 as the most recognizable Chinese wedding symbol) with the contemporary (neon aesthetics of modern Asian urban culture). It says: "Chinese culture is the future, not the past."

**Technical specification**:

```tsx
interface NeonDoubleHappinessProps {
  size: string;          // e.g., "18rem"
  variant: "vermillion" | "gold";
  opacity: number;       // Base opacity before glow
  breathe?: boolean;     // Enable breathing animation
  className?: string;
}

// Vermillion variant glow layers:
// Layer 1 (close):  rgba(255, 77, 90, 0.5) at 20px blur
// Layer 2 (mid):    rgba(255, 77, 90, 0.25) at 40px blur
// Layer 3 (far):    rgba(255, 77, 90, 0.12) at 80px blur
// Layer 4 (ambient):rgba(255, 77, 90, 0.06) at 120px blur

// Gold variant glow layers:
// Layer 1 (close):  rgba(255, 215, 0, 0.35) at 30px blur
// Layer 2 (mid):    rgba(255, 215, 0, 0.18) at 60px blur
// Layer 3 (far):    rgba(255, 215, 0, 0.08) at 120px blur
```

**Usage locations:**
1. **Hero**: 18rem, vermillion variant, 12% opacity, behind template card, breathing
2. **Final CTA**: 22rem, gold variant, 5% opacity, centered, slow-rotating + breathing
3. **Pricing premium badge**: 0.5rem inside hongbao badge, gold, 100% opacity, static

**Performance**: Pure CSS text-shadow. No canvas, no WebGL, no JS for the glow. The breathing is a CSS animation. Cost: ~0 bytes JS, negligible GPU.

### Component 2: Geometric Lattice Hero Background (LatticeArchitecture)

**What it is**: A full-viewport SVG pattern of interlocking octagonal/diamond shapes inspired by traditional Chinese window screens (窗花), rendered at BOLD opacity (15% on desktop) as the architectural framework of the hero section.

**Why it's a differentiator**: Most sites that use Chinese patterns apply them as tiny, invisible textures at 2-4% opacity. We use the lattice as ARCHITECTURE -- it defines the visual space the way actual lattice windows define physical space in Chinese gardens. It is visible, structural, and unmistakably Chinese.

**Technical specification**:

```tsx
interface LatticeArchitectureProps {
  color: string;       // Hex color for stroke
  opacity: number;     // 0.15 for hero, 0.10 for showcase
  strokeWidth?: number; // Default 0.8
  patternSize?: number; // Default 60 (px per tile)
  className?: string;
  drift?: boolean;     // Enable scroll-drift parallax
}
```

**SVG Pattern (enhanced from existing LatticeOverlay):**
```svg
<pattern id="lattice-architecture" width="60" height="60" patternUnits="userSpaceOnUse">
  <!-- Primary octagonal frame -->
  <path d="M30 0 L42 12 L42 48 L30 60 L18 48 L18 12 Z"
        fill="none" stroke="currentColor" stroke-width="0.8" />
  <!-- Connecting bridges -->
  <path d="M0 30 L12 18 L18 18 M42 18 L48 18 L60 30 L48 42 L42 42 M18 42 L12 42 L0 30"
        fill="none" stroke="currentColor" stroke-width="0.8" />
  <!-- Inner diamond detail -->
  <rect x="24" y="24" width="12" height="12"
        fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.6"
        transform="rotate(45 30 30)" />
  <!-- Corner nodes -->
  <circle cx="30" cy="0" r="1.5" fill="currentColor" opacity="0.3" />
  <circle cx="0" cy="30" r="1.5" fill="currentColor" opacity="0.3" />
  <circle cx="60" cy="30" r="1.5" fill="currentColor" opacity="0.3" />
  <circle cx="30" cy="60" r="1.5" fill="currentColor" opacity="0.3" />
</pattern>
```

**Usage locations:**
1. **Hero section**: gold color, 15% opacity, full viewport, scroll-drift enabled
2. **Showcase section**: gold color on indigo bg, 10% opacity, full section
3. **NOT used elsewhere** -- the lattice is reserved for high-impact sections to maintain its visual power

### Component 3: Ink Wash Section Transition (InkWashReveal)

**What it is**: A section entrance animation where content is revealed with a left-to-right gradient mask, as if ink is spreading across rice paper. The mask edge is slightly feathered, creating a soft, organic reveal that references Chinese ink wash painting (水墨画).

**Why it's a differentiator**: Every competitor uses the same fade-up + slide-up entrance animation. The ink wash reveal is culturally specific, visually distinctive, and creates a MOMENT of anticipation as the content is unveiled.

**Technical specification**:

```tsx
interface InkWashRevealProps {
  children: React.ReactNode;
  direction?: "left" | "right" | "center"; // Direction of reveal
  delay?: number;
  className?: string;
}

// Implementation uses CSS clip-path animated by GSAP:
// Initial: clip-path: inset(0 100% 0 0)  -- fully hidden from right
// Final:   clip-path: inset(0 0% 0 0)    -- fully revealed
// The feathered edge is achieved by combining with a gradient opacity mask

// GSAP config:
// duration: 1.2s
// ease: "power2.inOut"
// ScrollTrigger: start "top 80%"
```

**Usage locations:**
1. **Showcase section entrance**: left-to-right reveal on scroll
2. **Features section entrance**: right-to-left reveal (variation)
3. **Final CTA section entrance**: center-outward reveal (clip-path from center)

**Reduced motion**: instant opacity fade, no mask animation

### Component 4: Chinese Paper-Cut Edge (PaperCutEdge)

**What it is**: A CSS `clip-path` applied to the bottom edge of sections, creating a decorative scalloped border inspired by Chinese paper-cut art (剪纸). This is not a flat rectangle-to-rectangle section break -- it is a culturally rich, structurally visible edge that transforms the page's vertical rhythm.

**Why it's a differentiator**: Section boundaries are the most overlooked design element on the web. Every site uses flat horizontal breaks. The paper-cut edge makes the section boundary ITSELF a cultural statement. The scalloped profile references one of China's most beloved folk arts (a UNESCO intangible cultural heritage).

**Technical specification**:

```tsx
interface PaperCutEdgeProps {
  position: "top" | "bottom";
  scallops: number;       // 24 on desktop, 12 on mobile
  depth: number;          // How deep the scallops cut (% of section height)
  color: string;          // Color of the section using this edge
  className?: string;
}
```

**CSS clip-path generation** (24 scallops):
```css
/* Generated dynamically based on scallop count */
.paper-cut-bottom {
  clip-path: polygon(
    0% 0%, 100% 0%, 100% 94%,
    /* Each scallop is a peak-valley pair */
    96% 96.5%, 92% 93.5%, 88% 97%, 84% 93.5%,
    80% 96.5%, 76% 93.5%, 72% 97%, 68% 93.5%,
    64% 96.5%, 60% 93.5%, 56% 97%, 52% 93.5%,
    48% 96.5%, 44% 93.5%, 40% 97%, 36% 93.5%,
    32% 96.5%, 28% 93.5%, 24% 97%, 20% 93.5%,
    16% 96.5%, 12% 93.5%, 8% 97%, 4% 93.5%,
    0% 96.5%
  );
  padding-bottom: 4rem; /* Extra space for the scallops */
}
```

**Usage locations:**
1. **How It Works section**: bottom edge, rice paper colored scallops
2. **Features section (red)**: bottom edge, vermillion scallops transitioning into white pricing section
3. The effect is that the red section doesn't end flat -- it ends with a decorative paper-cut profile

---

## 7. Cultural Element Integration -- THE THESIS

### The Problem with Cultural Elements on 99% of "Chinese Wedding" Sites

They treat Chinese culture as **decoration**: a 囍 icon at 3% opacity, a red color swatch, maybe a lantern emoji. These elements are apologetic -- they whisper. They say: "We're a modern tech product, but we also kind of do Chinese stuff."

**This is wrong.** Chinese visual culture is one of the richest, most visually distinctive design traditions on Earth. It doesn't need to whisper. It doesn't need to be a 3%-opacity watermark. It needs to be the HEADLINE.

### The Cultural Futurist Manifesto

1. **Chinese culture is not the past. It is the future.** Shanghai, Singapore, Shenzhen -- these are the most forward-looking cities on Earth. Their visual culture is neon and silk, brutalist concrete and calligraphy, AR filters and red envelopes. Our design should reflect this: traditional motifs rendered with futuristic confidence.

2. **Opacity is confidence.** A 囍 at 3% opacity says "we're embarrassed to be Chinese." A 囍 at 12% with neon glow says "we're proud to be Chinese." Every cultural element on this page has an opacity that communicates confidence, not apology.

3. **Cultural elements are structural, not decorative.** The lattice is the hero's architecture. The paper-cut is the section boundary. The calligraphy is the closing argument. The golden thread is the narrative backbone. These are not sprinkled on top -- they ARE the design.

4. **Bilingual is not translation -- it is parallel narrative.** The Chinese text says something culturally resonant (喜事来了 = "joy arrives"). The English text says something practically persuasive ("Beautiful invitations your guests will remember"). Together they create a richer communication than either language alone.

### Cultural Element Inventory

| Element | Where | Opacity/Visibility | Size | Color | Cultural Meaning |
|---------|-------|-------------------|------|-------|-----------------|
| 囍 Neon Glow (hero) | Behind template card | 12% + neon glow | 18rem | `--cf-vermillion-neon` | Double happiness -- the most universal Chinese wedding symbol, rendered as a modern neon sign |
| 囍 Neon Glow (final CTA) | Centered background | 5% + neon glow | 22rem | `--cf-gold-electric` | Same symbol, gold on black, slow rotation -- meditative, closing the emotional arc |
| 囍 Text (badges) | Hero kicker badge | 100% | 1rem | `--cf-vermillion` | Functional use in badge, full opacity, clearly readable |
| 囍 Text (footer) | Flanking wordmark | 40% | 0.875rem | `--cf-gold` | Quiet bookend, restrained after the boldness above |
| Lattice Pattern (hero) | Full hero background | 15% desktop / 10% mobile | 60px tiles | `--cf-gold` | 窗花 window screens -- defines space in Chinese gardens, here defines digital space |
| Lattice Pattern (showcase) | Full section background | 10% desktop / 6% mobile | 60px tiles | `--cf-gold` on indigo | Gallery architecture, imperial aesthetic |
| Paper-Cut Edge (How It Works) | Section bottom edge | 100% structural | 24 scallops desktop | Section bg color | 剪纸 paper-cut art -- UNESCO heritage, folk art elevated to structural design |
| Paper-Cut Edge (Features) | Section bottom edge | 100% structural | 24 scallops desktop | `--cf-vermillion` | Same folk art, bold red execution |
| Paper-Cut SVG (Features) | Section overlay | 5% | Full section | White | 剪纸 flowers as ambient texture on red background |
| Golden Thread (How It Works) | Vertical timeline | 100% animated | 2px stroke | Gold gradient | 红线 red thread of fate -- connects soulmates, here connects steps |
| Calligraphy Stroke (Final CTA) | "爱情故事" text | 100% animated | 3rem | `--cf-gold-electric` | 书法 calligraphy -- one of the four arts of the Chinese scholar |
| Chinese Kickers (all sections) | Section headers | 100% display | 1.75-2.5rem | Vermillion or gold | Bilingual narrative -- Chinese as display art, not hidden subtitle |
| Gold Ornamental Rules | Section dividers | 100% | Full-width | `--cf-gold` gradient | Imperial gold as divider -- references scroll paintings |
| Red Envelope Badge (pricing) | Premium card | 100% | Badge size | `--cf-vermillion` | 红包 hongbao -- the universal gesture of giving and blessing in Chinese culture |

### What Makes This Instagram-Worthy

1. **The neon 囍 is a SCREENSHOT MOMENT.** Users will screenshot the hero and share it because the neon glow on the cultural symbol is visually novel. It exists at the intersection of traditional Chinese culture and Cyberpunk aesthetics -- a combination nobody else has attempted for a wedding product.

2. **The lattice background is a TEXTURE STORY.** It photographs beautifully in screen grabs because geometric patterns always do. The gold-on-rice-paper and gold-on-midnight combinations are Instagram-ready color palettes.

3. **The calligraphy reveal is a VIDEO MOMENT.** The stroke-by-stroke animation is inherently cinematic. Users will screen-record it. It is the kind of micro-interaction that gets shared on design Twitter/threads.

4. **The full-red section is UNFORGETTABLE.** Most wedding sites avoid full-bleed color. A section that is entirely electric vermillion with white and gold text is so visually distinct that it becomes a brand memory. It also photographs spectacularly for portfolio/social sharing.

---

## 8. Mobile-Specific Design

### Philosophy: "Concentrated Voltage"

Mobile is not "desktop but smaller." Mobile is "desktop but DENSER." The cultural elements don't disappear -- they concentrate. The 囍 doesn't shrink to nothing -- it goes from 18rem to 10rem, still bold, still glowing.

### Mobile Breakpoints

```css
/* Mobile first */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md -- layout shift to desktop */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

### Section-by-Section Mobile Specs

#### Hero (Mobile < 768px)
- **Stack layout**: full-width text block, then template card below
- **Chinese kicker**: "喜事来了" at `2rem` (still bold, not demoted to 0.75rem)
- **Hero headline**: `4.5rem` (72px) -- still massive by mobile standards. Most mobile hero text is 2-2.5rem. We're at 4.5rem. This is intentional.
- **Line-height**: 1.0 on headline (tight, editorial, bold)
- **Template card**: 90% viewport width, centered, no 3D tilt (touch devices), no rotation
- **囍 glow**: 10rem, behind card, 8% opacity + reduced glow layers (2 layers instead of 4 for GPU performance)
- **Lattice**: 10% opacity (down from 15%), `patternSize: 50` (slightly smaller tiles for mobile)
- **CTA buttons**: full-width, stacked vertically, primary above secondary, min-height 52px
- **Floating card animation**: preserved (pure CSS, no performance concern)

#### Social Proof (Mobile)
- **Stats**: 3-column grid (not marquee, not vertical list)
- **Numbers**: `2.5rem` (still large)
- **Testimonial**: Full width, `1.25rem`, Cormorant Garamond italic
- **Gold rules**: preserved, full width

#### Showcase (Mobile)
- **Native horizontal swipe** with `scroll-snap-type: x mandatory`
- **Cards**: 85vw width, next card peeking at 15%
- **No GSAP scroll-jacking** (native scroll only)
- **Card height**: 55vh
- **Progress dots**: shown below carousel
- **Lattice**: 6% opacity
- **Indigo background**: preserved -- this color moment is non-negotiable on mobile

#### How It Works (Mobile)
- **Single column**: all cards full-width, left-aligned
- **Golden thread**: simplified to straight vertical line with dot nodes (no S-curves)
- **Thread still animates on scroll** (simpler path = smoother on mobile)
- **Paper-cut edge**: 12 scallops (down from 24)
- **Step numbers**: `1.75rem` (slightly smaller)

#### Features (Mobile)
- **Stack layout**: feature list on top, phone mockup below
- **Phone mockup**: 75vw centered, auto-scroll preserved
- **VERMILLION BACKGROUND PRESERVED** -- non-negotiable. This is the bold moment. It must exist on mobile.
- **Paper-cut bottom edge**: 8 scallops
- **Paper-cut SVG overlay**: 3% opacity (down from 5%)

#### Pricing (Mobile)
- **Stack vertically**: premium card on top, free card below
- **Premium card**: full-width, gold border preserved, gold shadow preserved
- **No `translateY(-12px)` offset** on mobile
- **Price counter**: preserved
- **Hongbao badge**: preserved, centered

#### Final CTA (Mobile)
- **囍**: 12rem (down from 22rem), still with neon glow but 2 layers instead of 3
- **Calligraphy**: preserved but "爱情故事" at `2.5rem` (down from 3rem)
- **CTA button**: full-width, 56px height
- **Headline**: `2.5rem` (down from 3.5rem)

### Global Mobile Rules

| Rule | Value | Rationale |
|------|-------|-----------|
| Min touch target | 52px height | Exceeds 44px standard for comfortable tapping |
| CTA button width | Full-width with 24px margins | Easy to tap with thumb |
| Font minimum (body) | 16px | No zoom needed |
| Font minimum (headline) | 4.5rem (hero) / 2rem (sections) | Still editorial impact on mobile |
| Lattice opacity | 10% hero, 6% showcase | Reduced for GPU, still visible |
| 囍 glow layers | 2 (instead of 4) | GPU budget |
| Neon breathe animation | Preserved on mobile | Pure CSS, negligible cost |
| Calligraphy animation | Preserved on mobile | Signature moment, worth the cost |
| 3D tilt effects | Disabled | No cursor on touch devices |
| Horizontal scroll-jacking | Disabled | Native scroll only on mobile |
| Floating card animation | Preserved | Pure CSS, no performance concern |
| Paper-cut scallop count | 8-12 (down from 24) | Simpler rendering |

### Mobile Performance Budget

| Asset | Budget |
|-------|--------|
| LCP | < 2.0s (hero text renders immediately) |
| CLS | < 0.05 (no layout shift from scroll-jacking) |
| INP | < 150ms (no expensive touch handlers) |
| Total page weight | < 800KB |
| GSAP core + ScrollTrigger | ~40KB gzipped |
| SVG assets (all) | ~15KB inline |
| Font delta | 0KB (existing fonts) |
| Template images | ~300KB (WebP, lazy except hero) |

---

## 9. References and Inspiration

### Shanghai Fashion Brands

| Brand | What We Take | URL/Reference |
|-------|-------------|---------------|
| **Shang Xia** (by Hermes) | Material confidence -- Chinese craft elevated to luxury status. Their website uses generous white space with bold cultural objects. We take the confidence. | shangxia.com |
| **Angel Chen** | Electric color remixing of Chinese motifs. Her runway shows feature neon reds, electric blues, and traditional silhouettes made futuristic. We take the neon-meets-heritage approach. | angelchen.co |
| **Shanghai Tang** | The original "Chinese luxury" brand. Their use of mandarin collar silhouettes and bold red/gold palettes proved Chinese aesthetics can be premium, not touristy. We take the palette confidence. | shanghaitang.com |

### Singapore/Southeast Asian Design

| Reference | What We Take |
|-----------|-------------|
| **National Gallery Singapore rebrand** | Bilingual design as a first-class element -- Chinese and English coexisting as parallel display text, not translations |
| **Love, Bonito** | Singapore fashion brand that successfully bridges Asian cultural identity with contemporary e-commerce design |
| **GENTLE MONSTER** (Seoul, with Shanghai/Singapore flagships) | Retail installation art as web design inspiration -- immersive, theatrical, unapologetic about being BOLD |

### Modern Chinese Design References

| Reference | What We Take |
|-----------|-------------|
| **Nod Young** (graphic designer, Beijing) | Chinese typography as pure graphic art -- characters at massive scale, mixed with contemporary grid systems |
| **Wang Zhihong** (typographer, Taipei) | Experimental Chinese typographic layouts that prove Chinese characters can be as visually dynamic as any Latin type treatment |
| **Chen Man** (photographer, Beijing) | The aesthetic of making Chinese subjects look futuristic rather than nostalgic -- this is our thesis in visual form |
| **SenseTeam** (design studio, Shenzhen) | Chinese visual culture remixed for tech brands -- proving that cultural elements and modern design are not opposites |

### Design Award References

| Site/Project | Technique We Adapt |
|-------------|-------------------|
| **stripe.com** | Scroll-triggered horizontal card gallery with parallax (our Showcase section) |
| **linear.app** | Neon glow effects on dark backgrounds (our Final CTA section) |
| **Rauno Freiberg's personal site** | Typography at editorial scale with restrained animation (our Hero approach) |
| **Apple product pages** | GSAP ScrollTrigger pinning with scrub for horizontal galleries (our Showcase implementation) |
| **Aesop.com** | Editorial restraint mixed with bold moments -- sections breathe between intensity (our voltage rhythm) |

### Color Palette Inspiration

| Source | Palette Influence |
|--------|-----------------|
| **Shanghai Bund at night** | Electric vermillion neon signs against dark ink sky -- hero palette |
| **Chinese New Year red envelopes** | Vermillion + gold as the definitive Chinese celebratory palette |
| **Singapore Chinatown mid-autumn** | Gold lanterns creating a warm glow on dark streets -- Final CTA palette |
| **Forbidden City at dusk** | Deep indigo sky behind gold roof tiles -- Showcase section palette |
| **Chinese ink painting (水墨画)** | The contrast between rice paper white and true ink black -- our surface/ink contrast |

---

## 10. Visual Hierarchy Summary

### The Three Layers

**Layer 1 -- THE SHOUT** (one per section, demands attention):

| Section | Shout Element |
|---------|--------------|
| Hero | "remember." in vermillion italic at 9rem |
| Social Proof | Counter numbers animating up |
| Showcase | Template cards on midnight gallery |
| How It Works | Golden thread drawing itself |
| Features | Full vermillion section background |
| Pricing | "RM 49" counter in gold |
| Final CTA | Calligraphy stroke animation "爱情故事" |

**Layer 2 -- THE NARRATIVE** (supports Layer 1):
- Section titles, subtitles, feature descriptions
- Chinese kickers providing cultural context
- CTA buttons providing action paths

**Layer 3 -- THE TEXTURE** (creates atmosphere):
- Lattice pattern (15% / 10% opacity)
- Neon 囍 glow (12% / 5% opacity)
- Paper-cut SVG overlay (5% opacity)
- Gold ornamental rules
- Radial gradient glows

### Rules to Prevent Chaos

1. **One vivid background per viewport**: Indigo (Showcase) and Vermillion (Features) are never visible simultaneously at rest.
2. **Maximum 3 font families visible at once**: Noto Serif SC for Chinese kicker + Playfair Display for headline + Outfit for body.
3. **Texture elements below 15% opacity**: The lattice is the boldest at 15%, everything else is lower. They create atmosphere, not noise.
4. **Animations fire ONCE on scroll**: No looping animations in main content (only the neon breathe and card float loop, and those are ambient/background).
5. **White space between intensity**: Minimum 120px section padding. Rice paper breathing sections between every intense section.
6. **Color alternation**: NEVER stack two vivid sections adjacent. Always: vivid -> neutral -> vivid.

---

## 11. Accessibility

### Color Contrast Validation

| Foreground | Background | Ratio | Level |
|-----------|-----------|-------|-------|
| White (#FAFAF8) on Vermillion (#E63946) | 4.55:1 | AA |
| White (#FAFAF8) on Ink (#0D0D0D) | 19.5:1 | AAA |
| Gold (#FFD700) on Ink (#0D0D0D) | 12.8:1 | AAA |
| Gold (#D4AF37) on Ink (#0D0D0D) | 8.4:1 | AAA |
| Gold (#D4AF37) on Indigo (#1A1A3E) | 5.3:1 | AA |
| White (#FAFAF8) on Indigo (#1A1A3E) | 14.2:1 | AAA |
| Ink (#1A1714) on Surface (#FAFAF8) | 16.1:1 | AAA |
| Ink-soft (#6B6B6B) on Surface (#FAFAF8) | 4.7:1 | AA |
| Gold (#D4AF37) on Vermillion (#E63946) | 2.8:1 | **DECORATIVE ONLY** (kickers 2rem+) |

### Reduced Motion

Every single animation checks `prefers-reduced-motion: reduce`:
- Neon breathe: static, no pulse
- Calligraphy: shows final state (filled characters)
- Ink wash reveals: instant opacity, no clip-path
- Golden thread: shows fully drawn state
- Card float: static
- Counter animations: show final number
- Stagger entrances: instant visibility
- Lattice drift: static

### Keyboard Navigation

- All interactive cards are focusable with `tabIndex={0}`
- Card click actions trigger on Enter/Space
- Skip-to-content link preserved
- Focus-visible ring: `3px solid --cf-vermillion`, offset `2px`

### Screen Readers

- All decorative SVGs (lattice, paper-cut, clouds): `aria-hidden="true"`, `role="presentation"`
- 囍 characters: `aria-hidden="true"` (decorative), or `aria-label="double happiness"` (when in badges)
- Chinese kickers: English equivalent in `aria-label` for screen readers
- Calligraphy SVG: `aria-label="Love Story"` on the container

### Cultural Sensitivity

- Simplified Chinese (standard for Malaysia/Singapore education)
- All Chinese text has adjacent English -- no information is Chinese-only
- 囍, peonies, clouds, lattice, paper-cut are secular cultural symbols appropriate for all Chinese weddings regardless of religious background
- Red and gold are universally auspicious in Chinese culture -- no risk of negative connotation

---

## 12. Performance Budget

| Asset | Size (gzipped) | Notes |
|-------|----------------|-------|
| GSAP core | ~28KB | Tree-shaken |
| ScrollTrigger | ~12KB | Lazy-loaded on landing page route |
| Calligraphy SVG paths | ~6KB | Inline, loaded with Final CTA |
| Lattice/Paper-cut SVGs | ~4KB | Inline, compressed |
| Paper-cut overlay SVG | ~3KB | Inline |
| All font delta | 0KB | Existing fonts |
| Template images (4) | ~300KB | WebP/AVIF, lazy except hero |
| Total JS delta (over current) | ~40KB gzipped | GSAP replaces some Motion animations |
| Total page weight target | < 750KB | Under 800KB constraint |

| Metric | Target |
|--------|--------|
| LCP | < 2.0s |
| CLS | < 0.05 |
| INP | < 150ms |
| FCP | < 1.2s |
| Total blocking time | < 200ms |
| Lighthouse Performance | 90+ |

### Critical Rendering Path

1. Hero text (Chinese kicker + headline + CTA) renders FIRST -- no animation blocks content
2. Lattice pattern is inline SVG -- renders with HTML
3. 囍 glow is CSS text-shadow -- renders with CSS
4. Template card image has `fetchPriority="high"` and `loading="eager"`
5. GSAP + ScrollTrigger loaded async, initializes after hero is visible
6. Calligraphy SVG paths loaded lazily when Final CTA approaches viewport (IntersectionObserver)
7. All below-fold images are `loading="lazy"`

---

## Summary

### The Vision in One Sentence

When a Chinese couple opens DreamMoments, they should see their culture rendered with the same confidence, craft, and contemporary energy that GENTLE MONSTER brings to retail or Angel Chen brings to fashion -- and think, "Finally, a wedding product that treats Chinese culture like the FUTURE, not the past."

### What Competitors Will Never Do

1. **They will never put a neon-glow 囍 at 18rem in their hero.** They are designing for "everyone." We are designing for Chinese couples who grew up with 囍 on every wedding invitation their parents received.

2. **They will never make a full-bleed vermillion section.** They think red is "too much." We know that a Chinese wedding without red is not a Chinese wedding.

3. **They will never render Chinese calligraphy stroke-by-stroke.** They think Chinese characters are "translation text." We know calligraphy is one of the four arts of the Chinese scholar (琴棋书画).

4. **They will never use a geometric lattice at 15% opacity as architectural structure.** They think Chinese patterns are decoration. We know that 窗花 (window screens) literally define the space of Chinese gardens and residences.

5. **They will never put Chinese text at 2.5rem above their English headlines.** They think Chinese is the subtitle. We think Chinese is the headline.

### The Differentiator Stack

| Layer | What | Competitors |
|-------|------|-------------|
| Color | Electric Vermillion + Midnight Indigo | Pastel pink + generic white |
| Typography | Noto Serif SC at display scale, 9rem hero | Generic serif, 3rem hero |
| Cultural | Neon 囍, lattice architecture, paper-cut edges, calligraphy animation | 囍 icon at 3% opacity |
| Animation | Ink wash reveals, golden thread, calligraphy strokes | Fade up + slide up |
| Structure | Cultural elements AS architecture | Cultural elements AS decoration |

**Build this and Chinese couples will screenshot it, share it, and feel proud.** That is the conversion that matters.
