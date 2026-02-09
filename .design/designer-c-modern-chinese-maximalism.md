# Designer C: "Modern Chinese Maximalism"

## DreamMoments Landing Page Redesign Proposal

**Design Direction**: Contemporary Chinese graphic design meets maximalist web art meets unapologetic celebration
**Inspiration**: Nod Young, SenseTeam, Sagmeister & Walsh, Shang Xia's material purity blended with Shanghai Tang's chromatic fearlessness, Chen Man's fashion photography, Wang Zhihong's typographic experiments
**Core Belief**: A wedding is the most joyful, abundant, auspicious event in Chinese culture. The landing page should feel like stepping into a celebration that has already begun.

---

## 1. Color Palette

This palette is NOT subtle. It is auspicious, vivid, and intentionally maximal. Every color carries cultural weight.

### Primary Colors

| Token | Hex | Name | Usage |
|---|---|---|---|
| `--mcm-red` | `#DC2626` | Auspicious Red (吉祥红) | Primary CTA, hero accents, section backgrounds, the heartbeat of the page |
| `--mcm-red-deep` | `#B91C1C` | Deep Vermillion (朱砂) | CTA hover states, emphasis borders, depth layer |
| `--mcm-red-bright` | `#EF4444` | Bright Lucky Red (大红) | Hover glows, particle effects, energy accents |
| `--mcm-gold` | `#D4AF37` | Imperial Gold (帝金) | Headlines on dark backgrounds, ornamental strokes, badge fills, dividers |
| `--mcm-gold-light` | `#F59E0B` | Amber Gold (琥珀金) | Interactive highlights, hover trails, animated accents |
| `--mcm-gold-pale` | `#FEF3C7` | Pale Gold (淡金) | Gold-tinted surfaces, card backgrounds on red sections |

### Secondary Colors

| Token | Hex | Name | Usage |
|---|---|---|---|
| `--mcm-jade` | `#059669` | Jade Green (翡翠绿) | Success states, secondary badges, nature accents in "How It Works" |
| `--mcm-jade-light` | `#D1FAE5` | Pale Jade | Jade-tinted card backgrounds |
| `--mcm-pink` | `#EC4899` | Lucky Pink (桃花粉) | Testimonial accents, decorative elements, petal particles |
| `--mcm-pink-soft` | `#FCE7F3` | Soft Peony | Light pink surfaces |
| `--mcm-indigo` | `#312E81` | Imperial Purple (紫禁) | Deep section backgrounds, contrast panels |

### Neutral System

| Token | Hex | Usage |
|---|---|---|
| `--mcm-white` | `#FFFBF5` | Warm white — page background, breathing room between vivid sections |
| `--mcm-cream` | `#FEF7ED` | Card backgrounds in neutral sections |
| `--mcm-ink` | `#1C1917` | Body text |
| `--mcm-ink-soft` | `#44403C` | Secondary text |
| `--mcm-muted` | `#78716C` | Captions, metadata |
| `--mcm-border` | `#E7E5E4` | Subtle borders |

### Section Color Strategy

The page alternates between VIVID COLOR SECTIONS and WHITE BREATHING SPACE:

1. **Hero** -- Red-to-gold gradient explosion on warm white
2. **Social Proof** -- Warm white (breathing room)
3. **Showcase** -- Deep Imperial Purple (`#312E81`) with gold typography
4. **How It Works** -- Warm white with red accent timeline
5. **Features** -- Full Chinese Red (`#DC2626`) section with white/gold text
6. **Pricing** -- Warm white (breathing room)
7. **Final CTA** -- Black (`#1C1917`) with gold calligraphy reveal
8. **Footer** -- Warm white, minimal

This creates a RHYTHM: rest - energy - rest - energy - rest, like a heartbeat.

---

## 2. Typography

### Font Stack

| Role | Font Family | Fallback | Weight | Usage |
|---|---|---|---|---|
| **Display (EN)** | `"Playfair Display"` | `Georgia, serif` | 700, 900 | Hero headline, section headings |
| **Display (CN)** | `"Noto Serif SC"` | `"Songti SC", serif` | 700, 900 | Chinese characters (囍), cultural accent text |
| **Body** | `"Inter"` | `system-ui, sans-serif` | 400, 500, 600 | All body text, descriptions, UI elements |
| **Calligraphy Accent** | `"Ma Shan Zheng"` | `"Noto Serif SC", cursive` | 400 | Hero kicker, section labels, decorative Chinese text |
| **Monospace Accent** | `"JetBrains Mono"` | `monospace` | 400 | Step numbers in How It Works, pricing figures |

### Type Scale (8-based for auspicious numeracy)

```
--mcm-text-hero:    clamp(3.5rem, 8vw + 1rem, 8rem)     /* 56px - 128px */
--mcm-text-display: clamp(2.5rem, 5vw + 1rem, 5rem)     /* 40px - 80px */
--mcm-text-section: clamp(2rem, 4vw + 0.5rem, 3.5rem)   /* 32px - 56px */
--mcm-text-large:   clamp(1.25rem, 2vw + 0.25rem, 1.5rem)
--mcm-text-body:    1rem                                   /* 16px */
--mcm-text-small:   0.875rem                               /* 14px */
--mcm-text-xs:      0.75rem                                /* 12px */
```

The hero text is MASSIVE. This is not a whisper -- it is a declaration. `8rem` at desktop is intentional. The 囍 character in the background can scale to `24rem`.

### Typography Rules

- **Headlines** mix English display serif with Chinese calligraphic accents. Example: "Beautiful invitations" in Playfair Display 900, with "你的故事" in Ma Shan Zheng floating beside it.
- **Section kickers** always use `Ma Shan Zheng` in Chinese with English subtitle below in `Inter` uppercase tracking.
- **Line height**: Headlines at `1.0`, body at `1.7` -- extreme contrast between dense, powerful headlines and airy readable body text.
- **Letter spacing**: Headlines at `-0.04em` (very tight), body at `0` (normal), kickers at `0.18em` (very wide).

---

## 3. Layout -- Section by Section

### 3.1 Hero: "The Red Envelope Opening" (红包)

**Concept**: The hero loads as if the user is opening a digital hongbao (red envelope). The screen starts as a red field, then the content splits apart from the center -- left panel slides left, right panel slides right -- revealing the invitation showcase beneath like a gift being unwrapped.

**Layout** (Desktop):
```
+-----------------------------------------------------------+
|  [FULL RED SCREEN ON LOAD]                                |
|                                                           |
|  After 0.8s, splits into:                                |
|                                                           |
|  +--LEFT PANEL (55%)---+  +---RIGHT PANEL (45%)--------+ |
|  |                     |  |                             | |
|  | 囍 (watermark, 20rem)|  | [Template Preview Card]    | |
|  |                     |  | Floating, rotated 3deg     | |
|  | [Kicker badges]     |  | With 3D perspective tilt   | |
|  | [HERO HEADLINE]     |  | on mouse move              | |
|  | [Subtitle]          |  |                             | |
|  | [CTA buttons]       |  | [Cloud SVG animations      | |
|  | [Trust line]        |  |  floating behind card]      | |
|  |                     |  |                             | |
|  +---------------------+  +-----------------------------+ |
|                                                           |
|  [Animated lattice border at bottom of section]           |
+-----------------------------------------------------------+
```

**Asymmetry**: The left text column is 55% width, deliberately off-center. The template card on the right is rotated 3 degrees and has parallax depth -- it responds to mouse movement with CSS `perspective` and `transform: rotateX/rotateY`.

**Background layers**:
1. Warm white base
2. Radial gradient: `radial-gradient(ellipse at 30% 50%, rgba(220,38,38,0.15) 0%, transparent 60%)`
3. Scattered cloud motif SVGs at 4% opacity, slowly drifting upward (GSAP infinite tween)
4. Gold particle trail following the cursor (canvas overlay, 8% opacity)

**Content**:
- Kicker: `"喜事来了"` in Ma Shan Zheng + `"AI-Powered Wedding Invitations"` in Inter uppercase
- Headline: `"Your love story deserves to be"` (Playfair Display 900, #1C1917) + `"celebrated."` (Playfair Display 900 italic, #DC2626, on new line, 120% size)
- Subtitle: Standard body text
- CTAs: Primary red pill button with gold shimmer animation on hover; Secondary outlined button with red text

### 3.2 Social Proof: "The Red Carpet of Numbers"

**Layout**: Full-width warm white breathing section. BUT the stats are presented in a HORIZONTAL MARQUEE scroll -- an infinite ticker like a stock exchange or awards ceremony red carpet.

```
+-----------------------------------------------------------+
|                                                           |
| >>> 500+ Couples   |   4.9/5 Rating   |   < 3 Min Setup  |
|     <<<  500+ Couples   |   4.9/5 Rating   |   < 3 Min   |
|                                                           |
| [Single testimonial, large centered quote]                |
| [Red 囍 icon before and after the quote]                   |
|                                                           |
+-----------------------------------------------------------+
```

**Marquee details**: Two rows scrolling in opposite directions (left/right). Each stat is separated by a decorative `|` in gold. The numbers use `JetBrains Mono` at 700 weight, the labels use `Inter` at 400. Font size is `1.5rem`. The ticker creates ambient energy without demanding attention. Speed: 40px/sec (smooth, not frantic).

**Testimonial**: Large `Ma Shan Zheng` Chinese calligraphy quote at `2rem`, with English translation in `Cormorant Garamond` italic below. Flanked by animated 囍 symbols that pulse subtly (scale 1.0 to 1.05, 1.8s loop).

### 3.3 Showcase: "The Imperial Gallery" (殿堂)

**Concept**: This is the most visually dramatic section. Deep Imperial Purple (`#312E81`) background. Templates displayed as 3D cards that the user can DRAG to explore, like flipping through a physical photo album.

**Layout**:
```
+-----------------------------------------------------------+
| BG: #312E81 (Imperial Purple)                             |
|                                                           |
| [Section header: gold text on purple]                     |
| "四款精选" (in Ma Shan Zheng, gold, 3rem)                  |
| "Four Templates, Crafted for Celebration"                 |
|                                                           |
| +-------+  +-------+  +-------+  +-------+               |
| |       |  |       |  |       |  |       |               |
| | CARD  |  | CARD  |  | CARD  |  | CARD  |  <-- 3D       |
| | 3D    |  | 3D    |  | 3D    |  | 3D    |  perspective  |
| | FLIP  |  | FLIP  |  | FLIP  |  | FLIP  |               |
| |       |  |       |  |       |  |       |               |
| +-------+  +-------+  +-------+  +-------+               |
|                                                           |
| [Drag indicator: "Drag to explore" with animated hand]    |
|                                                           |
| [Lattice pattern (窗花) overlay at 6% opacity]             |
+-----------------------------------------------------------+
```

**3D Card Behavior**:
- Each card has `perspective: 1200px` on the container
- On hover, the card tilts toward the cursor: `transform: rotateY(Xdeg) rotateX(Ydeg)` calculated from mouse position
- On click/tap, the card does a full 3D FLIP (Y-axis 180deg, 0.8s duration) revealing the back side which shows:
  - Template name in gold calligraphy
  - 3 key features as bullet points
  - "Preview This Template" CTA button
- GSAP `ScrollTrigger` staggers the cards in from below with `rotateX(-15deg)` as they enter viewport, creating a "cards being dealt" effect

**Background texture**: The purple section has a subtle lattice window pattern (窗花) as an SVG overlay at 6% opacity. The pattern is a traditional Chinese geometric lattice -- interlocking hexagonal/octagonal shapes -- rendered as thin gold lines.

**Draggable gallery**: On mobile, the cards become a horizontal draggable carousel (GSAP Draggable). Snap points align to each card center. Momentum scrolling enabled.

### 3.4 How It Works: "The Golden Thread" (金线)

**Concept**: A vertical timeline where a literal golden thread is drawn (SVG stroke animation) as the user scrolls, connecting each step. The thread is styled as a traditional Chinese rope knot (中国结) pattern.

**Layout**:
```
+-----------------------------------------------------------+
| BG: Warm White (#FFFBF5)                                  |
|                                                           |
| "五步成礼" (Ma Shan Zheng, red, 2.5rem)                   |
| "Five Steps to Your Invitation"                           |
|                                                           |
|       [Golden SVG Thread -- animated stroke on scroll]    |
|       |                                                   |
|   [1] O---- +----------------------------+               |
|       |     | Sign up in seconds          |               |
|       |     | [description]               |               |
|       |     +----------------------------+               |
|       |                                                   |
|   [2] O----          +----------------------------+       |
|       |              | Pick your template          |       |
|       |              | [description]               |       |
|       |              +----------------------------+       |
|       |                                                   |
|   [3] O---- +----------------------------+               |
|       |     | Let AI write your story     |               |
|       ...                                                 |
+-----------------------------------------------------------+
```

**Alternating layout**: Step cards alternate left and right of the golden thread (desktop). Each step number is inside a red circle with gold border. As the golden thread reaches each circle via scroll, the circle fills with red (GSAP `fill` animation) and the corresponding card slides in from its side.

**The golden thread**: An SVG `<path>` with `stroke-dasharray` and `stroke-dashoffset` animated by GSAP ScrollTrigger. The stroke uses a gold gradient (`#D4AF37` to `#F59E0B`). At each step node, the thread forms a small decorative loop (like a simplified Chinese knot).

**Step cards**: White cards with `border-left: 4px solid #DC2626` (left-side cards) or `border-right: 4px solid #DC2626` (right-side cards). Shadow: `0 8px 32px -8px rgba(0,0,0,0.08)`. On hover, card lifts with `translateY(-4px)` and shadow deepens.

### 3.5 Features: "The Red Pavilion" (红亭)

**Concept**: FULL Chinese Red background section. This is the bold moment. Entire section is `#DC2626` with white and gold text. It feels like stepping inside a red lacquered Chinese pavilion.

**Layout**:
```
+-----------------------------------------------------------+
| BG: #DC2626 (full red)                                    |
| Paper-cut (剪纸) SVG pattern overlay at 5% opacity        |
|                                                           |
| +--LEFT (50%)----------+  +---RIGHT (50%)---------------+|
| |                      |  |                              ||
| | "为何选择 DreamMoments"|  | [Phone mockup frame]       ||
| | (gold calligraphy)   |  | White phone bezel           ||
| |                      |  | Screen shows animated        ||
| | "Everything You Need"|  | invitation preview           ||
| | (white, large serif) |  | (auto-scrolling demo)        ||
| |                      |  |                              ||
| | [Feature list]       |  | [Floating 囍 badge]          ||
| | White text, gold     |  | [Cloud SVGs drifting]        ||
| | icons in circles     |  |                              ||
| |                      |  |                              ||
| +----------------------+  +------------------------------+|
|                                                           |
| [Paper-cut decorative border at section bottom -- CSS     |
|  clip-path creating traditional jianzhi silhouette]       |
+-----------------------------------------------------------+
```

**Feature list styling**: Each feature has a gold circle icon (40x40px) with white Lucide icon inside. Title in white `Inter 600`, description in white/90 opacity `Inter 400`. Features stagger in from left with 0.08s delay each.

**Phone mockup**: A white iPhone-style frame containing an auto-playing animation of an invitation being scrolled. This is a looping CSS animation of a tall screenshot being `translateY`'d within a masked container. It demonstrates the actual product without requiring interaction.

**Paper-cut border**: The bottom edge of this section uses `clip-path: polygon(...)` or an SVG mask to create a decorative paper-cut silhouette -- a simplified jianzhi pattern of phoenixes and peonies. This replaces a flat color boundary with a culturally rich decorative transition.

### 3.6 Pricing: "Auspicious Offering" (吉祥之选)

**Layout**: Warm white background, clean and clear. The pricing cards use the existing two-card layout but with maximalist decoration.

```
+-----------------------------------------------------------+
| BG: Warm White                                            |
|                                                           |
| "简单定价" (Ma Shan Zheng, gold)                           |
| "One Price. No Subscriptions."                            |
|                                                           |
| +--FREE CARD-----------+  +--PREMIUM CARD (elevated)----+|
| | Clean, minimal       |  | GOLD BORDER (3px)           ||
| | White background     |  | Subtle gold gradient bg     ||
| |                      |  |                              ||
| | RM0                  |  | [红包 Red Envelope Badge]    ||
| | (JetBrains Mono,     |  | "Most Popular"              ||
| |  4rem, ink color)    |  |                              ||
| |                      |  | RM49 / SGD19                ||
| | [Feature list]       |  | (JetBrains Mono, gold,      ||
| |                      |  |  5rem, BOLD)                 ||
| | [Secondary CTA]      |  |                              ||
| |                      |  | [Feature list with gold      ||
| +----------------------+  |  check icons]                ||
|                           |                              ||
|                           | [Primary RED CTA with gold   ||
|                           |  shimmer on hover]           ||
|                           +------------------------------+|
|                                                           |
+-----------------------------------------------------------+
```

**Premium card details**: The premium card is visually elevated: `translateY(-16px)` relative to the free card. It has a `3px` gold border, a faint gold gradient background (`linear-gradient(135deg, #FEF3C7 0%, #FFFFFF 50%)`), and a red envelope badge at the top styled like an actual hongbao -- rounded rectangle, red background, gold text, with a small decorative flap fold at the top using CSS pseudo-elements.

**Price animation**: When the pricing section enters viewport, the price numbers count up from 0 to their final value (GSAP `snap` with `innerText` tween). Duration: 1.8s (auspicious number).

### 3.7 Final CTA: "The Calligraphy Reveal" (书法)

**Concept**: Dark section (`#1C1917`). The headline is written in REAL-TIME calligraphy animation -- each stroke of the Chinese characters appears as if being painted by an invisible brush.

**Layout**:
```
+-----------------------------------------------------------+
| BG: #1C1917 (near-black)                                  |
|                                                           |
| [Giant 囍 character, 24rem, gold, 3% opacity, centered]   |
|                                                           |
| "你的爱情故事" (gold, Ma Shan Zheng, 3rem)                  |
| SVG stroke animation: each character writes itself        |
|                                                           |
| "Create an invitation your guests will treasure."         |
| (Playfair Display, warm white, 3rem)                      |
|                                                           |
| [RED CTA BUTTON -- largest on the page]                   |
| Pulsing gold glow animation behind it                     |
|                                                           |
| "Free to start. No credit card."                          |
| (Inter, muted gold)                                       |
|                                                           |
| [Gold divider lines top and bottom]                       |
+-----------------------------------------------------------+
```

**Calligraphy animation**: The Chinese characters "你的爱情故事" (Your love story) are pre-traced as SVG paths. Each path has `stroke-dasharray` equal to its total length and `stroke-dashoffset` animated from full length to 0. GSAP ScrollTrigger fires this when the section is 40% visible. Each character takes 0.8s to draw, staggered by 0.3s. The stroke color is gold (`#D4AF37`), stroke width is 3px, and after drawing completes, the fill fades in from transparent to gold over 0.5s.

**CTA glow**: The primary CTA button has a `box-shadow` animation: `0 0 0 0 rgba(212,175,55,0.4)` pulsing outward to `0 0 40px 8px rgba(212,175,55,0)` on a 1.8s infinite loop. This creates a breathing gold aura effect.

### 3.8 Footer: "Quiet Grace"

**Layout**: Warm white, minimal. The maximalism intentionally stops here -- the footer is restrained to create contrast. One cultural touch: the DreamMoments wordmark is flanked by two tiny 囍 characters in muted gold.

```
+-----------------------------------------------------------+
| BG: Warm White                                            |
|                                                           |
| 囍  DreamMoments  囍                                       |
| "AI-powered wedding invitations"                          |
|                                                           |
| [Privacy | Terms | PDPA Compliant]                        |
|                                                           |
| [Thin gold line]                                          |
| "(c) 2026 DreamMoments"                                  |
+-----------------------------------------------------------+
```

---

## 4. Animations -- GSAP Concepts

### 4.1 The Hongbao Opening (Hero Entrance)

This is the signature animation. On page load:

```
Timeline: heroEntrance (duration: 2.4s total)

1. [0.0s] Full screen is Chinese Red (#DC2626) with a centered gold 囍
2. [0.4s] The 囍 scales up slightly (1.0 -> 1.1) and glows
3. [0.8s] The red screen SPLITS horizontally from center:
   - Left half slides left with ease: "power3.out"
   - Right half slides right with same ease
   - Behind them: the actual hero content is revealed
4. [1.2s] Left panel content fades in with stagger (0.12s per element)
5. [1.4s] Right panel (template card) scales in from 0.9 with rotateY(8deg)
6. [1.8s] Cloud SVGs begin their infinite drift animation
7. [2.0s] Cursor gold particles activate
8. [2.4s] All entrance animations complete
```

**Technical implementation**: Two absolutely positioned divs (left/right halves) with `clip-path: inset(0 50% 0 0)` and `clip-path: inset(0 0 0 50%)`. GSAP animates these to `clip-path: inset(0 100% 0 0)` and `clip-path: inset(0 0 0 100%)` respectively. Hardware-accelerated, no jank.

**Reduced motion**: For `prefers-reduced-motion`, skip the split animation entirely. Content simply fades in with `opacity: 0 -> 1` over 0.8s.

### 4.2 3D Template Cards (Showcase)

```javascript
// GSAP ScrollTrigger for card entrance
gsap.from(".template-card", {
  scrollTrigger: {
    trigger: ".showcase-section",
    start: "top 80%",
    toggleActions: "play none none none"
  },
  y: 80,
  rotateX: -15,
  opacity: 0,
  duration: 0.8,
  stagger: 0.18,
  ease: "back.out(1.2)"
});

// Mouse-follow 3D tilt (per card)
card.addEventListener("mousemove", (e) => {
  const rect = card.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width - 0.5;
  const y = (e.clientY - rect.top) / rect.height - 0.5;
  gsap.to(card, {
    rotateY: x * 12,
    rotateX: y * -8,
    duration: 0.4,
    ease: "power2.out"
  });
});

// 3D card flip on click
gsap.to(card, {
  rotateY: 180,
  duration: 0.8,
  ease: "power2.inOut"
});
```

The container needs `perspective: 1200px` and `transform-style: preserve-3d`. Card front and back are absolutely positioned with `backface-visibility: hidden`. Back face has `rotateY(180deg)` initial transform.

### 4.3 Cherry Blossom / Red Confetti Particles

A lightweight canvas-based particle system for two scenarios:

**Scenario A: Ambient petal drift (Showcase section)**
- 20-30 particles on screen at once
- Each particle is a small SVG petal shape (ellipse with slight curve)
- Colors: mix of `#EC4899` (pink), `#FCE7F3` (soft pink), `#DC2626` (red)
- Movement: gentle sinusoidal drift downward, `y += 0.5`, `x += sin(time * 0.8) * 0.3`
- Rotation: each petal rotates slowly on its Z-axis
- Opacity: fade in at top, fade out at bottom
- Triggered when Showcase section is in viewport, paused otherwise

**Scenario B: Celebration burst (CTA interaction)**
- When user clicks "Create Your Invitation" CTA, burst 80 particles from the button center
- Colors: red, gold, pink confetti rectangles
- Physics: outward velocity with gravity, rotation, fade out after 1.8s
- Uses canvas for performance, positioned as overlay above the button

### 4.4 Calligraphy Stroke Animation (Final CTA)

Each Chinese character is pre-converted to SVG `<path>` elements where each stroke is a separate path. The strokes are ordered correctly (following standard Chinese stroke order).

```javascript
const strokes = document.querySelectorAll(".calligraphy-char path");

strokes.forEach((stroke, i) => {
  const length = stroke.getTotalLength();
  gsap.set(stroke, {
    strokeDasharray: length,
    strokeDashoffset: length,
    fill: "transparent"
  });

  gsap.to(stroke, {
    scrollTrigger: {
      trigger: ".final-cta-section",
      start: "top 60%"
    },
    strokeDashoffset: 0,
    duration: 0.8,
    delay: i * 0.15,
    ease: "power2.inOut",
    onComplete: () => {
      gsap.to(stroke, {
        fill: "#D4AF37",
        stroke: "transparent",
        duration: 0.5
      });
    }
  });
});
```

### 4.5 Horizontal Marquee (Social Proof)

Two rows of stats scrolling in opposite directions, using GSAP's `to` with `repeat: -1`:

```javascript
// Row 1: scroll left
gsap.to(".marquee-row-1 .marquee-content", {
  xPercent: -50,
  duration: 24,
  ease: "none",
  repeat: -1
});

// Row 2: scroll right
gsap.to(".marquee-row-2 .marquee-content", {
  xPercent: 50,
  duration: 28, // slightly different speed for visual interest
  ease: "none",
  repeat: -1
});
```

Content is duplicated (rendered twice side by side) so the loop is seamless. Each stat item is separated by a gold `|` divider and a decorative cloud symbol.

### 4.6 Golden Thread Timeline (How It Works)

The golden thread is an SVG `<path>` that snakes vertically through the step nodes:

```javascript
const threadPath = document.querySelector(".golden-thread path");
const pathLength = threadPath.getTotalLength();

gsap.set(threadPath, {
  strokeDasharray: pathLength,
  strokeDashoffset: pathLength
});

gsap.to(threadPath, {
  scrollTrigger: {
    trigger: ".how-it-works-section",
    start: "top 70%",
    end: "bottom 40%",
    scrub: 1
  },
  strokeDashoffset: 0,
  ease: "none"
});
```

Each step node (circle) has its own ScrollTrigger that fires when the thread reaches it, filling the circle with red and sliding in the associated card.

### 4.7 Price Counter (Pricing)

```javascript
gsap.from(".price-value", {
  scrollTrigger: {
    trigger: ".pricing-section",
    start: "top 70%"
  },
  innerText: 0,
  duration: 1.8,
  snap: { innerText: 1 },
  ease: "power2.out"
});
```

### 4.8 Cursor Gold Particle Trail (Global)

A subtle, performant canvas overlay following the cursor:

- Canvas covers the full viewport, `pointer-events: none`, `z-index: 9999`
- On `mousemove`, spawn 1-2 gold particles at cursor position
- Each particle: 2-4px circle, gold color with random opacity (0.3-0.7)
- Lifetime: 0.8s with fade out
- Movement: slight upward drift + random spread
- Maximum 40 particles at once (ring buffer)
- Disabled on mobile (no cursor) and `prefers-reduced-motion`

---

## 5. Cultural Pattern System

### 5.1 Cloud Motifs (祥云 Xiangyun)

**SVG Construction**: Each cloud is built from 3-5 overlapping circles/ellipses with smooth bezier connections:

```svg
<svg viewBox="0 0 120 60" xmlns="http://www.w3.org/2000/svg">
  <path d="M20,50 Q20,30 35,25 Q30,10 50,10 Q65,5 75,15 Q90,10 100,25 Q115,30 100,50 Z"
        fill="currentColor" opacity="0.05" />
</svg>
```

**Usage**:
- Hero background: 8-12 clouds of varying sizes (40px to 200px), absolutely positioned, drifting upward at different speeds (parallax layers)
- Showcase section: 4-6 clouds behind template cards, gold color on purple background
- Section dividers: a row of 5 small clouds as decorative separators

**Animation**: GSAP infinite tween, each cloud moves `y: -30px` over 8-16 seconds (randomized), then resets. `opacity` oscillates between 0.03 and 0.06.

### 5.2 Lattice Window Pattern (窗花 Chuanghua)

**SVG Construction**: An interlocking geometric pattern of octagons and squares, inspired by traditional Chinese window lattice:

```svg
<pattern id="lattice" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
  <rect width="40" height="40" fill="none"/>
  <path d="M0,20 L8,8 L20,0 L32,8 L40,20 L32,32 L20,40 L8,32 Z"
        fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.06"/>
  <rect x="16" y="16" width="8" height="8" fill="none"
        stroke="currentColor" stroke-width="0.5" opacity="0.04"
        transform="rotate(45 20 20)"/>
</pattern>
```

**Usage**:
- Showcase section (purple): full-section overlay using the pattern in gold (`#D4AF37`)
- Features section (red): full-section overlay in white at 4% opacity
- Pricing card backgrounds: subtle pattern at 2% opacity for premium card

**Animation**: On scroll, the pattern translates slowly (`backgroundPosition` shift) creating a living texture effect.

### 5.3 Paper-Cut Art (剪纸 Jianzhi)

**SVG Construction**: Simplified paper-cut silhouettes of traditional auspicious symbols -- phoenix (凤凰), peony (牡丹), and double fish (双鱼):

```svg
<!-- Simplified peony paper-cut -->
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <path d="M100,20 C130,20 160,50 160,80 C180,70 190,100 170,120
           C190,140 170,170 140,160 C150,190 120,190 100,170
           C80,190 50,190 60,160 C30,170 10,140 30,120
           C10,100 20,70 40,80 C40,50 70,20 100,20 Z"
        fill="currentColor"/>
</svg>
```

**Usage**:
- Section transition between Features (red) and Pricing (white): `clip-path` on the red section's bottom edge uses a paper-cut outline creating a decorative, irregular border
- Hero: small paper-cut flower accents near the kicker badges
- Showcase: paper-cut phoenix silhouettes flanking the section header

**CSS clip-path approach**:
```css
.features-section {
  clip-path: polygon(
    0% 0%, 100% 0%, 100% 94%,
    95% 96%, 90% 93%, 85% 97%, 80% 94%,
    75% 96%, 70% 93%, 65% 97%, 60% 94%,
    55% 96%, 50% 98%, 45% 96%, 40% 94%,
    35% 97%, 30% 93%, 25% 96%, 20% 94%,
    15% 97%, 10% 93%, 5% 96%, 0% 94%
  );
}
```

This creates a scalloped/wave edge inspired by jianzhi patterns. More complex shapes can use an SVG `<clipPath>` with embedded paper-cut outlines.

### 5.4 Double Happiness (囍)

**Usage rules**:
- Hero watermark: 20rem, 3% opacity, positioned behind left text column
- Final CTA: 24rem, 3% opacity, centered background
- Social proof: 1rem flanking testimonial quote
- Footer: tiny (0.875rem) flanking the DreamMoments wordmark
- NEVER as a small icon in a row -- always large-scale or paired as bookends
- Font: `Noto Serif SC` weight 900 for maximum visual impact

---

## 6. Key Differentiators

### Why this stands out from ANY wedding site globally:

1. **The Hongbao Opening**: No wedding site in the world opens like a red envelope. This is a culturally specific, technically impressive first impression that instantly communicates "this was made FOR Chinese weddings, not adapted from a Western template."

2. **Calligraphy as interaction**: The SVG stroke animation in the Final CTA is not decorative text -- it is a moment of witnessing. Watching Chinese characters being written stroke-by-stroke is meditative, emotional, and deeply cultural. It transforms a CTA section from "buy our thing" to "your story deserves to be written."

3. **Cultural patterns as architecture, not decoration**: Most sites that use Chinese motifs sprinkle them as small icons or border decorations. Here, cloud motifs (祥云) ARE the background. Lattice patterns (窗花) ARE the grid overlay. Paper-cut art (剪纸) IS the section boundary. The cultural elements are load-bearing -- they define the spatial structure of the page.

4. **Color courage**: While every wedding site gravitates to pastels or minimalist white, this design LEADS with Chinese Red. A full-bleed red section (Features) is something competitors would never attempt because they are designing for "everyone." We are designing for Chinese couples who grew up surrounded by red and gold during every celebration. This is THEIR red.

5. **Maximalism with meaning**: Every bold element has cultural significance. The 8-based timing is not arbitrary -- 8 (八) is the luckiest number in Chinese culture. The gold is not generic luxury -- it is 帝金 (imperial gold). The clouds are not decorative -- they are 祥云 (auspicious clouds) that represent heavenly blessings. Every design choice is a cultural statement.

6. **Bilingual typography as first-class design element**: Chinese characters are not translations hidden in a dropdown. They are DISPLAY elements -- large, beautiful, treated as graphic art alongside English text. `Ma Shan Zheng` calligraphy creates an emotional register that English serif fonts cannot.

---

## 7. Visual Hierarchy

### Hierarchy Strategy: "Controlled Chaos"

The key to maximalism that works is INTENTIONAL hierarchy. Every section has exactly ONE focal point, despite the visual richness surrounding it.

**Hierarchy levels:**

1. **LEVEL 1 -- The Shout** (one per section): The single element the eye MUST hit first
   - Hero: The word "celebrated." in red italic at 120% hero size
   - Social Proof: The stat numbers in the marquee
   - Showcase: The template cards themselves
   - How It Works: The golden thread line
   - Features: The phone mockup on the red background
   - Pricing: The "RM49" price figure
   - Final CTA: The calligraphy being written
   - Footer: The "DreamMoments" wordmark

2. **LEVEL 2 -- The Context**: Supporting text that frames Level 1
   - Headlines, subheadlines, feature titles

3. **LEVEL 3 -- The Texture**: Decorative elements that create atmosphere without demanding attention
   - Cloud SVGs, lattice patterns, paper-cut borders, particle effects
   - These operate at 3-8% opacity -- visible in aggregate, invisible individually

**Rules to prevent chaos:**

- **One vivid background per screen viewport**: Never stack two colored sections without a white breathing section between them
- **Maximum 3 font weights visible at once**: 900 for headline, 500 for body, 400 for captions
- **Pattern elements never exceed 8% opacity**: They should feel like whispered textures, not competing decorations
- **Animations fire ONCE on scroll**: No looping animations in the main content flow (only ambient elements like clouds and particles loop)
- **White space is sacred**: Between sections, at least 128px of padding. Inside cards, generous 40-56px padding. The maximalism is in COLOR and MOTION, not in density.
- **Color saturation gradient**: Sections alternate between high-saturation (red, purple) and zero-saturation (white). This creates natural resting points for the eye.

---

## 8. Mobile Adaptation

### Philosophy: "Concentrated Power, Not Shrunken Desktop"

Mobile maximalism means intensifying the impact in a smaller frame, not spreading it thin.

### Hero (Mobile)

- **Skip the hongbao animation**: On mobile (< 768px), replace with a simpler fade-in from red tint. The split animation requires precise timing that feels less impactful on small screens.
- **Stack layout**: Full-width text block on top, template card below
- **Hero text**: `3.5rem` minimum (still bold, still commanding)
- **Template card**: Full width with 16px margins, no rotation, no parallax tilt (saves performance and avoids awkward touch interactions)
- **Cloud SVGs**: Reduce to 4 (from 8-12), larger size, slower movement

### Social Proof (Mobile)

- **Single marquee row** instead of two (saves vertical space)
- **Testimonial**: Full width, `1.5rem` font
- **Stats**: If marquee feels too busy on small screens, fall back to a static 3-column grid

### Showcase (Mobile)

- **Horizontal swipe carousel**: Cards at 85% viewport width, one visible at a time with next card peeking
- **No 3D tilt** (touch doesn't have cursor position). Instead, cards scale slightly on press (`0.98`) for tactile feedback
- **Card flip still works** on tap -- this is actually MORE satisfying on mobile
- **Purple background remains** -- this is a key color moment

### How It Works (Mobile)

- **Single column**: All cards on the left, golden thread on the far left edge
- **Cards full-width**: No alternating layout
- **Golden thread**: Still animates on scroll, but simplified path (straight vertical line with dot nodes, no decorative loops)

### Features (Mobile)

- **Red section stays full-width red** -- this is NON-NEGOTIABLE. The color impact must be preserved.
- **Stack layout**: Feature list on top, phone mockup below
- **Phone mockup**: 80% width centered, still auto-scrolling the invitation preview
- **Paper-cut bottom border**: Simplified to 8 scallops (from 24) for cleaner rendering

### Pricing (Mobile)

- **Stack cards vertically**: Premium card on top (with gold border), Free card below
- **No `translateY(-16px)` offset** -- instead, premium card gets a subtle gold shadow to elevate it
- **Price counter animation preserved** -- this works well on mobile

### Final CTA (Mobile)

- **Calligraphy animation preserved** but with fewer characters: use "爱情故事" (4 characters) instead of "你的爱情故事" (6 characters) for faster/tighter reveal
- **CTA button full-width** with 24px horizontal margins
- **囍 watermark**: 12rem (down from 24rem) to stay within viewport

### Global Mobile Optimizations

- **Cursor particles disabled** (no cursor on touch devices)
- **All GSAP animations**: `scrub` values increased for smoother mobile scrolling
- **Lattice pattern overlays**: Reduced to 3% opacity on mobile (subtle performance win)
- **Font sizes**: Hero headline minimum `3rem`, section headings minimum `2rem` -- still large, still bold
- **Touch targets**: All CTAs minimum 56px height (above standard 44px) for comfortable tapping
- **Scroll snap**: Showcase carousel uses `scroll-snap-type: x mandatory` for native-feeling card browsing

---

## 9. Wow Moments

### Wow Moment 1: "The Red Envelope Reveal"

**What happens**: The page opens as a full-screen Chinese Red surface with a gold 囍 in the center. After 0.8 seconds, the red surface SPLITS from center and slides apart like opening a hongbao, revealing the hero content beneath. The 囍 symbol dissolves into gold particles that scatter outward.

**Why it works**: This is a culturally resonant metaphor executed with technical precision. Opening a red envelope is one of the most joyful, anticipated moments in Chinese culture -- associated with weddings, Lunar New Year, and blessings. By making the page load FEEL like opening a hongbao, we tap into deep cultural memory. No other wedding site does this. The 囍 particle dissolution adds spectacle without slowing anything down.

**Technical: GSAP timeline + canvas particle system, ~3KB JS**

**Why Awwwards judges would notice**: The metaphor-to-interaction mapping. This is not a generic animation -- it is a culturally meaningful gesture translated into web interaction. Site-of-the-Day material because it demonstrates that animation can carry cultural narrative, not just aesthetic polish.

### Wow Moment 2: "The Living Calligraphy"

**What happens**: As the user scrolls to the Final CTA, Chinese characters appear on screen as if being painted by an invisible calligraphy brush. Each stroke follows the correct stroke order. The brush speed varies naturally -- faster on horizontal strokes, slower on complex turns. After each character completes, its stroke fades from gold outline to solid gold fill, as if the ink is drying.

**Why it works**: Calligraphy (书法) is one of the highest art forms in Chinese culture. Watching it happen in real-time is mesmerizing. The stroke-order accuracy shows cultural respect and attention to detail. The "ink drying" fill effect adds a layer of physical realism that bridges the digital/physical divide.

**Technical: Pre-traced SVG paths with GSAP strokeDashoffset + fill animations, ~8KB SVG + 2KB JS**

**Why Awwwards judges would notice**: They have seen text reveal animations thousands of times. They have NEVER seen culturally accurate Chinese calligraphy stroke-order animation on a commercial website. The technique (SVG stroke animation) is known -- the cultural application is unprecedented.

### Wow Moment 3: "The Imperial Gallery Flip"

**What happens**: In the Showcase section, template cards are presented on a deep purple background that feels like entering a palace gallery. Hovering a card creates a subtle 3D tilt that follows the cursor (perspective transform). Clicking/tapping a card triggers a full 3D flip, revealing the back face with template details on a gold-gradient surface. When flipping, nearby cards subtly shift outward, as if making room -- a micro-interaction borrowed from physical card manipulation.

**Why it works**: The purple + gold color scheme references imperial Chinese aesthetics (Forbidden City interiors). The 3D flip is technically satisfying and creates a tangible, physical feeling rare in web design. The "cards making room" micro-interaction adds polish that separates good animation from GREAT animation.

**Technical: CSS `perspective` + `transform-style: preserve-3d` + GSAP for flip + neighbor displacement, ~4KB JS**

**Why Awwwards judges would notice**: 3D card flips are not new. But the COMBINATION of imperial color context + cursor-following tilt + neighbor displacement + culturally themed back-face content creates a holistic experience that feels designed, not just animated.

---

## 10. Component Architecture

### React Component Tree

```
<LandingPage>
  |
  |-- <HongbaoReveal />              # Full-screen entrance animation overlay
  |     Uses: GSAP timeline, clip-path animation, canvas particles
  |     State: isRevealed (boolean, triggers unmount after animation)
  |
  |-- <CursorParticles />             # Canvas overlay for gold cursor trail
  |     Uses: requestAnimationFrame, canvas 2D
  |     Props: enabled (boolean, false on mobile/reduced-motion)
  |
  |-- <NavBar />                      # Existing nav (unchanged)
  |
  |-- <HeroSection />
  |     |-- <CulturalKicker />        # Badges: 囍, AI-Powered
  |     |-- <HeroHeadline />          # Split text with red italic emphasis
  |     |-- <CTAGroup />              # Primary + Secondary buttons
  |     |-- <TrustIndicators />       # Free, No CC, PDPA
  |     |-- <TemplateSpotlight />     # 3D-tilting template card
  |     |     Uses: useMousePosition hook + GSAP for tilt
  |     |-- <CloudBackground />       # SVG cloud motifs layer
  |           Uses: GSAP infinite tweens
  |
  |-- <SocialProofSection />
  |     |-- <InfiniteMarquee />       # Dual-row scrolling stats
  |     |     Props: direction ("left" | "right"), speed (number)
  |     |     Uses: GSAP xPercent infinite loop
  |     |-- <TestimonialBlock />      # Large quote with 囍 bookends
  |
  |-- <ShowcaseSection />
  |     |-- <SectionHeader />         # Chinese + English title
  |     |-- <TemplateGallery />       # Container with perspective
  |     |     |-- <FlipCard />        # Individual 3D flipping card (x4)
  |     |     |     Props: template, onFlip
  |     |     |     State: isFlipped (boolean)
  |     |     |     Uses: GSAP rotateY, CSS preserve-3d
  |     |     |-- <DragIndicator />   # "Drag to explore" prompt
  |     |-- <LatticeOverlay />        # SVG pattern background
  |     |-- <PetalParticles />        # Canvas cherry blossom drift
  |           Props: count (number), colors (string[])
  |
  |-- <HowItWorksSection />
  |     |-- <SectionHeader />
  |     |-- <GoldenThread />          # SVG path with scroll-driven stroke
  |     |     Uses: GSAP ScrollTrigger, strokeDashoffset
  |     |-- <TimelineStep />          # Step card (x5)
  |           Props: step, index, side ("left" | "right")
  |           Uses: GSAP ScrollTrigger for slide-in
  |
  |-- <FeaturesSection />
  |     |-- <SectionHeader />
  |     |-- <FeatureList />           # Feature items with gold circle icons
  |     |     |-- <FeatureItem />     # Individual feature row
  |     |-- <PhoneMockup />           # White phone frame with auto-scroll
  |     |     Uses: CSS translateY animation loop
  |     |-- <PaperCutBorder />        # clip-path/SVG bottom edge
  |     |-- <LatticeOverlay />        # Reused, white color on red bg
  |
  |-- <PricingSection />
  |     |-- <SectionHeader />
  |     |-- <PricingCard />           # Free tier card
  |     |-- <PricingCard />           # Premium tier card (with hongbao badge)
  |     |     |-- <HongbaoBadge />    # Red envelope "Most Popular" badge
  |     |     |-- <PriceCounter />    # GSAP number counting animation
  |     |           Uses: GSAP snap innerText
  |
  |-- <FinalCTASection />
  |     |-- <DoubleHappinessWatermark />  # Giant 囍 background
  |     |-- <CalligraphyReveal />         # SVG stroke animation
  |     |     Props: characters (string), color (string)
  |     |     Uses: GSAP strokeDashoffset + fill, ScrollTrigger
  |     |-- <CTAButton />                 # Large pulsing CTA
  |     |     Uses: CSS animation (gold glow pulse)
  |
  |-- <FooterSection />                   # Minimal, warm
```

### Shared Components / Hooks

```
src/components/landing/
  patterns/
    CloudMotif.tsx          # SVG cloud component
    LatticePattern.tsx      # SVG lattice repeating pattern
    PaperCutBorder.tsx      # clip-path / SVG mask border
    DoubleHappiness.tsx     # 囍 character with styling options

  animations/
    useGSAPScrollTrigger.ts # Hook: registers ScrollTrigger, handles cleanup
    useMousePosition.ts     # Hook: returns normalized mouse position for 3D tilt
    useReducedMotion.ts     # Hook: respects prefers-reduced-motion
    useIntersection.ts      # Hook: IntersectionObserver for lazy animation init

  shared/
    SectionHeader.tsx       # Chinese kicker + English headline + subtitle
    InfiniteMarquee.tsx     # Reusable horizontal infinite scroll
    FlipCard.tsx            # 3D flipping card primitive
    ParticleCanvas.tsx      # Reusable canvas particle system
    GoldShimmerButton.tsx   # CTA with gold hover shimmer effect
```

### Animation Configuration

```typescript
// src/components/landing/animation-config.ts

export const MCM_ANIMATION = {
  // Auspicious timing (8-based)
  duration: {
    fast: 0.4,
    normal: 0.8,     // Base duration
    slow: 1.8,       // Statement moments
    entrance: 2.4,   // Hongbao reveal total
  },

  // Easing
  ease: {
    default: "power2.out",
    dramatic: "power3.out",
    bounce: "back.out(1.2)",
    linear: "none",
  },

  // Stagger
  stagger: {
    fast: 0.08,
    normal: 0.12,
    slow: 0.18,
  },

  // ScrollTrigger defaults
  scroll: {
    start: "top 80%",
    end: "bottom 40%",
    toggleActions: "play none none none",
  },

  // Particle config
  particles: {
    cursor: { count: 40, size: [2, 4], lifetime: 0.8, color: "#D4AF37" },
    petals: { count: 25, colors: ["#EC4899", "#FCE7F3", "#DC2626"] },
    confetti: { burstCount: 80, colors: ["#DC2626", "#D4AF37", "#EC4899", "#FFFFFF"] },
  },

  // Cultural patterns
  patterns: {
    cloudOpacity: 0.05,
    latticeOpacity: 0.06,
    paperCutOpacity: 0.08,
  },
} as const;
```

### Performance Budget

| Asset | Budget | Notes |
|---|---|---|
| GSAP core + ScrollTrigger | ~45KB gzipped | Tree-shake unused plugins |
| SVG patterns (all) | ~12KB | Inline, compressed |
| Calligraphy SVG paths | ~8KB | Loaded lazily when Final CTA approaches viewport |
| Particle system JS | ~3KB | Custom lightweight, NOT a heavy library |
| Fonts (new: Ma Shan Zheng) | ~80KB | Subset to characters used (fewer than 30 unique Chinese chars) |
| Total JS delta | ~55KB gzipped | Over current Motion (Framer Motion) baseline |
| Total asset delta | ~100KB gzipped | Acceptable for the visual richness gained |

### Accessibility

- **All animations respect `prefers-reduced-motion`**: hongbao skips to instant reveal, particles disabled, scroll animations become instant-on, calligraphy shows final state without stroke animation
- **Color contrast**: All text on colored backgrounds meets WCAG AA. White text on `#DC2626` red = 4.6:1 (passes). Gold text on `#312E81` purple = 5.1:1 (passes). Gold text on `#1C1917` dark = 8.2:1 (passes).
- **Keyboard navigation**: All interactive cards are focusable. Card flip triggers on Enter/Space. Marquee pauses on focus within.
- **Screen readers**: Decorative SVG patterns have `aria-hidden="true"`. Marquee content is duplicated in a visually-hidden static list. Calligraphy characters have `aria-label` with text content.
- **No autoplay video or audio**: All motion is CSS/JS, not media playback.

---

## Summary

This proposal transforms DreamMoments from a "clean, pleasant wedding site" into a **cultural statement**. It says: your heritage is not a theme to be applied -- it is the foundation of the design itself.

The maximalism is intentional, not decorative. Every bold choice -- the red envelope opening, the calligraphy reveal, the imperial gallery, the paper-cut borders -- is rooted in specific Chinese cultural traditions. This is not "generic maximalism with Chinese motifs sprinkled on." This is a wedding site that could ONLY exist for Chinese couples, built by people who understand that Chinese weddings are not quiet, muted affairs -- they are loud, red, golden, joyful, and abundant.

The technical execution leverages GSAP (the industry standard for Awwwards-level animation), lightweight canvas particle systems, and SVG pattern engineering to deliver these cultural moments without sacrificing performance. The component architecture is clean, modular, and maps directly to the existing DreamMoments React codebase.

**The vision in one sentence**: When a Chinese couple opens DreamMoments, they should feel like they have already started celebrating.
