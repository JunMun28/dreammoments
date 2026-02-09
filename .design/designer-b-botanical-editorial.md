# DreamMoments Landing Page Redesign: "Botanical Editorial"

**Designer**: Designer B
**Direction**: Vogue/Harper's Bazaar meets botanical garden meets modern Chinese aesthetics
**Date**: February 2026

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Color Palette](#2-color-palette)
3. [Typography System](#3-typography-system)
4. [Layout System](#4-layout-system)
5. [Section-by-Section Breakdown](#5-section-by-section-breakdown)
6. [Animation System (GSAP)](#6-animation-system-gsap)
7. [Botanical Illustration System](#7-botanical-illustration-system)
8. [Key Differentiators](#8-key-differentiators)
9. [Visual Hierarchy & Reading Flow](#9-visual-hierarchy--reading-flow)
10. [Mobile Adaptation](#10-mobile-adaptation)
11. [Wow Moments](#11-wow-moments)
12. [Component Architecture](#12-component-architecture)
13. [Implementation Notes](#13-implementation-notes)

---

## 1. Design Philosophy

This design treats DreamMoments as a luxury editorial publication rather than a SaaS landing page. The core idea: **every wedding is a story worth publishing**. We borrow the language of Vogue, Harper's Bazaar, and Kinfolk magazine -- oversized serif headlines, generous whitespace, pull-quotes, drop caps, and a rigorous editorial grid -- and layer it with Chinese botanical motifs (peonies, cloud scrolls, and double happiness geometry) reimagined as modern SVG line illustrations.

The result is a page that feels like opening a beautifully designed magazine: each scroll reveals a new spread, each section uses a different color block (emerald, rose, ivory) to create a bold visual rhythm, and botanical illustrations grow and bloom as the user moves through the content.

**Core Principles:**
- **Editorial restraint**: Let whitespace breathe. Every element earns its place.
- **Cultural pride, not pastiche**: Chinese motifs are abstracted into modern geometric forms, not clip-art.
- **Magazine pacing**: Alternate between dense information spreads and full-bleed visual moments.
- **Living botanicals**: SVG illustrations feel organic and alive through scroll-triggered animations.

---

## 2. Color Palette

### Primary Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--be-ivory` | `#FFFBF0` | Primary background, body text areas |
| `--be-ivory-warm` | `#FFF8E8` | Alternate warm background for variation |
| `--be-cream` | `#F5EFE0` | Card backgrounds, secondary surfaces |
| `--be-emerald-deep` | `#1B4332` | Primary dark color, headline text, hero backgrounds |
| `--be-emerald` | `#2D6A4F` | Secondary green, borders, hover states |
| `--be-emerald-light` | `#40916C` | Accent green, botanical illustration strokes |
| `--be-emerald-mist` | `#D8F3DC` | Soft green tint for backgrounds, botanical fills |

### Accent Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--be-rose-deep` | `#9D174D` | Primary CTA buttons, emphatic accent |
| `--be-rose` | `#BE185D` | Secondary CTA, hover states, pull-quote marks |
| `--be-rose-light` | `#F472B6` | Decorative accents, botanical flower fills |
| `--be-rose-blush` | `#FDF2F8` | Rose section background tint |
| `--be-magenta-soft` | `#FCE7F3` | Badge backgrounds, soft highlights |

### Neutral Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--be-ink` | `#1A1A1A` | Body text on ivory backgrounds |
| `--be-ink-muted` | `#4A4A4A` | Secondary body text, descriptions |
| `--be-ink-subtle` | `#737373` | Tertiary text, captions, metadata |
| `--be-border` | `#E5DFD3` | Borders on ivory sections |
| `--be-border-emerald` | `#2D6A4F33` | Borders on emerald sections (20% opacity) |

### Metallic Accent

| Token | Hex | Usage |
|-------|-----|-------|
| `--be-gold` | `#B8860B` | Decorative lines, dividers, "double happiness" motif |
| `--be-gold-light` | `#DAA520` | Hover state for gold elements |
| `--be-gold-mist` | `#FDF6E3` | Gold tint for special badge backgrounds |

### Section Color Blocks

The page alternates between three distinct color blocks, creating a magazine-spread rhythm:

1. **Ivory Block** (`--be-ivory`): Hero, Showcase, Features
2. **Emerald Block** (`--be-emerald-deep` bg, `--be-ivory` text): Social Proof, Final CTA
3. **Rose Block** (`--be-rose-blush` bg): How It Works, Pricing

### Usage Rules

- **NEVER** use emerald-deep for body text on ivory (contrast ratio too low for small text; use `--be-ink` instead)
- Emerald-deep is reserved for: headlines on ivory, full-section backgrounds with ivory text, SVG strokes
- Rose-deep is the **only** CTA button color. No other element uses it as a background.
- Gold is **decorative only** -- divider lines, the double happiness symbol, and border accents. Never for text smaller than 24px.
- On emerald backgrounds, text must be `--be-ivory` or `--be-cream`. On rose-blush backgrounds, text must be `--be-ink` or `--be-ink-muted`.

---

## 3. Typography System

### Font Families

| Token | Font Stack | Role |
|-------|-----------|------|
| `--be-font-editorial` | `"Playfair Display", "Noto Serif SC", Georgia, serif` | Headlines, section titles, pull-quotes, drop caps |
| `--be-font-body` | `"Inter", "Noto Sans SC", system-ui, sans-serif` | Body text, descriptions, UI elements |
| `--be-font-accent` | `"Cormorant Garamond", "Noto Serif SC", Georgia, serif` | Kickers, labels, testimonial quotes, decorative text |
| `--be-font-chinese` | `"Noto Serif SC", "Songti SC", serif` | Chinese characters (double happiness, cultural text) |

**Why Playfair Display over Didot/Bodoni**: Playfair Display is already loaded in the current codebase, is free (Google Fonts), renders well on screens at all sizes, and has the high-contrast serif character of Didot/Bodoni without licensing issues. Its wedge serifs give it a distinctly editorial feel.

### Type Scale (Responsive via `clamp()`)

| Token | Size | Usage |
|-------|------|-------|
| `--be-text-display` | `clamp(3.5rem, 8vw + 1rem, 7rem)` | Hero headline only (one per page) |
| `--be-text-section` | `clamp(2.25rem, 5vw + 0.5rem, 4rem)` | Section headlines (H2) |
| `--be-text-subsection` | `clamp(1.5rem, 3vw + 0.25rem, 2.25rem)` | Subsection headlines (H3), pull-quotes |
| `--be-text-card` | `clamp(1.125rem, 1.5vw + 0.25rem, 1.5rem)` | Card titles, feature names |
| `--be-text-body-lg` | `clamp(1.0625rem, 0.8vw + 0.5rem, 1.25rem)` | Lead paragraphs, subtitle text |
| `--be-text-body` | `1rem` (16px) | Standard body text |
| `--be-text-sm` | `0.875rem` (14px) | Secondary text, captions |
| `--be-text-xs` | `0.75rem` (12px) | Metadata, badges, fine print |
| `--be-text-kicker` | `0.8125rem` (13px) | Section kickers, category labels |

### Typography Details

**Headlines (Playfair Display):**
- Weight: 700 (Bold) for hero, 600 (SemiBold) for sections
- Letter-spacing: `-0.03em` (tight tracking for editorial density)
- Line-height: `1.05` for display, `1.15` for section heads
- Style: Select words in *italic* for emphasis (e.g., "Beautiful invitations your guests will *treasure*")

**Kickers (Cormorant Garamond):**
- Weight: 500
- Letter-spacing: `0.15em` (wide tracking, uppercase)
- Size: `--be-text-kicker`
- Color: `--be-emerald` on ivory, `--be-gold` on emerald, `--be-rose` on rose-blush
- Always uppercase

**Body (Inter):**
- Weight: 400 for body, 500 for emphasis
- Letter-spacing: `0em` (default)
- Line-height: `1.7` for body paragraphs (generous for readability)
- Max line width: `65ch` (optimal reading measure)

**Pull-Quotes (Playfair Display Italic):**
- Size: `--be-text-subsection`
- Line-height: `1.3`
- Preceded by a large decorative quotation mark in `--be-rose` or `--be-gold`

**Drop Caps:**
- Used on the first paragraph of select sections (Features, Testimonial)
- Font: Playfair Display, 700
- Size: spans 3 lines
- Color: `--be-emerald-deep`
- Float: left, with `margin-right: 0.15em`

---

## 4. Layout System

### Grid Foundation

The page uses a **12-column editorial grid** with responsive gutters:

```
Desktop (>=1280px): 12 columns, 24px gutters, max-width 1280px, 80px side margins
Tablet (>=768px):   8 columns, 20px gutters, max-width 100%, 40px side margins
Mobile (>=0px):     4 columns, 16px gutters, max-width 100%, 20px side margins
```

### Column Configurations

Magazine layouts use varying column widths to create visual rhythm:

| Layout | Columns | Usage |
|--------|---------|-------|
| Full-bleed | 12/12 (edge-to-edge) | Color block backgrounds, hero image, botanical borders |
| Wide | 10/12 (centered) | Section content areas |
| Standard | 8/12 (centered) | Body text, feature descriptions |
| Narrow | 6/12 (centered) | Pull-quotes, testimonials, narrow text blocks |
| 2-Column Split | 5/12 + 7/12 or 7/12 + 5/12 | Feature + image pairs (asymmetric) |
| 3-Column Grid | 4/4/4 | Template showcase cards |
| Offset Grid | 3/12 offset + 6/12 content | Editorial sidebar feel for kickers |

### Vertical Spacing

| Between | Spacing |
|---------|---------|
| Sections | `clamp(6rem, 12vw, 10rem)` |
| Section header to content | `clamp(3rem, 6vw, 5rem)` |
| Content blocks within section | `clamp(2rem, 4vw, 3rem)` |
| Inline elements | `1rem - 1.5rem` |

### Section Color Blocks & Stacking Order

```
[IVORY]    Hero                 -- full viewport height
[EMERALD]  Social Proof         -- compact strip
[IVORY]    Showcase             -- generous padding, asymmetric grid
[ROSE]     How It Works         -- bold rose background
[IVORY]    Features             -- magazine spread layout
[EMERALD]  Pricing              -- dark, dramatic
[ROSE]     Final CTA            -- full-bleed rose
[IVORY]    Footer               -- clean, minimal
```

This alternation creates a clear visual rhythm -- ivory breathes, emerald commands authority, rose creates warmth.

---

## 5. Section-by-Section Breakdown

### 5.1 Hero Section

**Layout**: Full-bleed ivory background. Two-column asymmetric split (5-col text left, 7-col image right on desktop). Full viewport height (`100svh`).

**Left Column (Text)**:
- **Kicker**: `BOTANICAL EDITORIAL` in Cormorant Garamond, uppercase, `--be-emerald`, 0.15em tracking. A thin gold horizontal rule (`--be-gold`, 40px wide) precedes it.
- **Headline**: "Beautiful invitations your guests will *remember*." in Playfair Display 700, `--be-text-display`, `--be-emerald-deep`. The word "remember" is in italic `--be-rose-deep`.
- **Subtitle**: Inter 400, `--be-text-body-lg`, `--be-ink-muted`. Max-width 44ch.
- **CTA Group**: Primary button (`--be-rose-deep` bg, white text, pill shape with 9999px radius). Secondary button (transparent bg, `--be-emerald-deep` text, `--be-border` 1px border, pill shape).
- **Trust Pills**: Three items ("Free to start", "No credit card", "PDPA compliant") separated by gold dots, Inter 400 `--be-text-sm` `--be-ink-subtle`.

**Right Column (Visual)**:
- A single template preview in a tall frame (aspect ratio 9:16), with a 2px `--be-emerald` border and `border-radius: 1.5rem`.
- Behind the frame: a large, partially visible SVG peony illustration (about 60% opacity, `--be-emerald-light` stroke, no fill) that extends beyond the frame edges, creating depth.
- A floating badge below-right of the frame: template name + "Chinese tradition" label on a cream card with gold border.

**Botanical Element**: A vine illustration runs along the left edge of the viewport (vertically), rendered as thin SVG paths in `--be-emerald-light` at 15% opacity. It "grows" upward on page load via GSAP DrawSVG.

**Mobile**: Stacks to single column. Image frame above text. Headline drops to `--be-text-section` size. Vine illustration hidden.

---

### 5.2 Social Proof Section

**Layout**: Full-bleed `--be-emerald-deep` background. Color block creates a dramatic break from the ivory hero. Content in a centered 10-column layout.

**Content**:
- **Top Divider**: A thin SVG botanical border (a simplified horizontal peony vine) spans the full width at the top, stroked in `--be-gold` at 30% opacity. It draws itself in via GSAP.
- **Stats Row**: 3 stats in a row, separated by thin gold vertical dividers. Each stat: value in Playfair Display 600, `clamp(2.5rem, 4vw, 3.5rem)`, `--be-ivory`. Label below in Inter 400, `--be-text-sm`, `--be-emerald-mist`.
- **Testimonial (Pull-Quote)**: Below stats, centered within a 6-column narrow layout. A large decorative opening quote mark (`"`) in `--be-gold`, Playfair Display, about 4rem size, positioned as a visual flourish above the quote text. Quote in Cormorant Garamond italic, `--be-text-subsection`, `--be-ivory`. Attribution below in Inter 400, `--be-text-sm`, `--be-emerald-mist`, preceded by a 20px gold horizontal rule.
- **Bottom Divider**: Matching botanical border, mirrored from top.

**Mobile**: Stats stack vertically with horizontal gold dividers between them. Quote text drops one size.

---

### 5.3 Showcase (Template Gallery) Section

**Layout**: Ivory background. This is the **magazine spread** moment -- an asymmetric masonry-inspired grid that feels editorial rather than e-commerce.

**Section Header** (centered, 8-column):
- Kicker: `THE COLLECTION` in Cormorant Garamond, `--be-gold`, uppercase
- Headline: "Four templates, crafted for Chinese weddings" in Playfair Display 600, `--be-text-section`, `--be-emerald-deep`
- Subtitle: Inter 400, `--be-text-body-lg`, `--be-ink-muted`, max-width 55ch

**Template Grid** (full 12-column):

The four templates are displayed in a **2-row editorial grid** that varies card sizes to create visual interest (not a uniform 4-column grid):

```
Row 1:  [ Large Card (7 cols) ]  [ Tall Card (5 cols) ]
Row 2:  [ Medium Card (5 cols) ] [ Wide Card (7 cols)  ]
```

Each card:
- Full-bleed image with aspect ratios varying by position (3:4 for tall, 4:3 for wide, 1:1 for square)
- On hover: image zooms subtly (scale 1.03), a semi-transparent emerald overlay slides up from the bottom (30% height), revealing template name in Playfair Display and a "Preview" CTA link
- Cultural badge (if applicable): small pill in `--be-rose-deep` with white text, top-left corner
- Template name below card: Playfair Display 600, `--be-text-card`, `--be-ink`
- Description: Inter 400, `--be-text-sm`, `--be-ink-muted`

**Botanical Element**: Small peony bud illustrations (SVG, `--be-rose-light` stroke) appear at the corners where cards meet, as if peeking through the gaps. These bloom (animate from closed buds to open flowers) as the section scrolls into view.

**Mobile**: Single column, all cards use 3:4 aspect ratio. Stacked vertically with 1.5rem gap.

---

### 5.4 How It Works Section

**Layout**: Full-bleed `--be-rose-blush` background block. Content centered in a 10-column layout.

**Section Header** (centered, 8-column):
- Kicker: `THE PROCESS` in Cormorant Garamond, `--be-rose-deep`, uppercase
- Headline: "From sign-up to RSVPs in five steps" in Playfair Display 600, `--be-text-section`, `--be-ink`
- Subtitle: Inter 400, `--be-text-body-lg`, `--be-ink-muted`

**Timeline Design**:

Instead of a vertical timeline (current), use a **horizontal editorial narrative** on desktop:

- A thin horizontal line (`--be-rose-deep`, 1px) runs across the full section width, vertically centered
- 5 steps are positioned alternating above and below this line (odd steps above, even below), creating a zigzag reading pattern
- Each step is a card with:
  - Step number: Playfair Display 700, `clamp(2rem, 3vw, 3rem)`, `--be-rose-deep`, displayed as a large numeral
  - Title: Playfair Display 600, `--be-text-card`, `--be-ink`
  - Description: Inter 400, `--be-text-body`, `--be-ink-muted`
  - A small circle on the timeline line marks the position, filled `--be-rose-deep`
- The line animates (draws itself) as user scrolls through the section

**Botanical Element**: Loose petal SVGs (3-4 individual peony petals, `--be-rose-light` fill at 20% opacity) float behind the timeline, positioned at varying angles. They drift subtly with parallax on scroll.

**Mobile**: Reverts to vertical timeline (stacked cards). The horizontal line becomes vertical. Alternating layout becomes sequential. Floating petals are hidden.

---

### 5.5 Features Section

**Layout**: Ivory background. This section uses a **magazine double-spread** layout -- left page + right page.

**Left Page (5 columns)**:
- Kicker: `WHY DREAMMOMENTS` in Cormorant Garamond, `--be-emerald`, uppercase
- Headline: "Everything you need. *Nothing you don't.*" -- "Nothing you don't" in Playfair Display italic, `--be-rose-deep`
- **Feature List**: 5 features, each:
  - Icon: Rendered inside a circle with `--be-emerald-mist` background, `--be-emerald` icon color, 44px diameter
  - Title: Inter 500, `--be-text-card`, `--be-ink`
  - Description: Inter 400, `--be-text-sm`, `--be-ink-muted`
  - Staggered reveal animation (0.08s delay between each)

**Right Page (7 columns)**:
- A large product mockup showing the editor interface
- Frame: `border-radius: 1.5rem`, `--be-border` 1px border, `--be-cream` background
- Subtle depth: three stacked layers behind the main frame (offset 4px, 8px, 12px) in increasingly lighter tones, creating a "stack of pages" magazine effect
- Content inside: A simplified mock of the invitation editor with:
  - Mock toolbar at top
  - Couple name in Playfair Display
  - "We're getting married" in Inter
  - Date badge

**Botanical Element**: A large, partially visible peony illustration (just the top-right quadrant) sits behind the right-page mockup, rendered in `--be-emerald-light` stroke at 8% opacity. It subtly parallaxes (moves at 0.5x scroll speed).

**Mobile**: Stacks to single column. Mockup above features list. Feature icons shrink to 36px.

---

### 5.6 Pricing Section

**Layout**: Full-bleed `--be-emerald-deep` background. This is a dramatic shift -- like turning to a dark page in a magazine.

**Section Header** (centered, 8-column):
- Kicker: `SIMPLE PRICING` in Cormorant Garamond, `--be-gold`, uppercase
- Headline: "One price. No subscriptions." in Playfair Display 600, `--be-text-section`, `--be-ivory`
- Subtitle: Inter 400, `--be-text-body-lg`, `--be-emerald-mist`
- Currency pill: `--be-border-emerald` border, `--be-emerald` bg at 10% opacity, `--be-ivory` text

**Pricing Cards** (2 cards, centered, max-width 900px):

| Element | Free Card | Premium Card |
|---------|-----------|-------------|
| Background | `--be-ivory` with 1px `--be-border` | `--be-ivory` with 2px `--be-gold` border |
| Badge | None | `MOST POPULAR` pill, `--be-rose-deep` bg, white text, gold crown icon |
| Tier Label | `FREE` in Cormorant Garamond, `--be-ink-subtle` | `PREMIUM` in Cormorant Garamond, `--be-ink-subtle` |
| Price | `RM0` in Playfair Display 700, `--be-ink`, 3.5rem | `RM49` in Playfair Display 700, `--be-ink`, 3.5rem + `SGD19` note |
| Description | Inter 400, `--be-ink-muted` | Inter 400, `--be-ink-muted` |
| Features | Check marks in `--be-emerald`, Inter 400, `--be-ink` | Check marks in `--be-rose-deep`, Inter 400, `--be-ink` |
| CTA Button | Outlined pill, `--be-emerald-deep` text, `--be-border` border | Filled pill, `--be-rose-deep` bg, white text |
| Border radius | `1.5rem` | `1.5rem` |

Both cards float on the dark emerald background, creating strong contrast. The premium card has a subtle `box-shadow: 0 24px 64px -16px rgba(0,0,0,0.3)` for depth.

**Botanical Element**: Abstract cloud motif (xiangyun / auspicious clouds) as thin SVG line illustrations in `--be-gold` at 8% opacity, positioned in the upper corners of the section. These draw themselves in via GSAP as the section enters.

**Mobile**: Cards stack vertically. Premium card comes first (above free card).

---

### 5.7 Final CTA Section

**Layout**: Full-bleed `--be-rose-blush` background. A warm, emotional closing spread.

**Content** (centered, 6-column narrow):
- **Decorative element**: The double happiness symbol (囍) rendered as an abstract geometric pattern -- not the literal character, but a modern geometric reinterpretation using two symmetrical angular shapes. SVG, `--be-rose-deep` stroke at 10% opacity, positioned as a large watermark behind the text.
- **Kicker**: "Your love story awaits" in Cormorant Garamond italic, `--be-rose-deep`
- **Headline**: "Create an invitation your guests will *treasure*." in Playfair Display 600, `--be-text-section`, `--be-ink`. "treasure" in italic.
- **Subtitle**: Inter 400, `--be-text-body-lg`, `--be-ink-muted`
- **CTA Button**: Large pill, `--be-rose-deep` bg, white text, uppercase Inter 500
- **Trust line**: "Free to start. No credit card required." Inter 400, `--be-text-sm`, `--be-ink-subtle`

**Dividers**: Top and bottom of section have thin gold horizontal lines with a small peony motif centered on each (SVG, `--be-gold`), like an ornamental page divider in a book.

**Mobile**: Same layout (already centered/narrow). Decorative double happiness scales down.

---

### 5.8 Footer

**Layout**: Ivory background, minimal and clean. 8-column centered layout.

**Content**:
- **Logo**: "DreamMoments" in Playfair Display 600, `--be-text-subsection`, `--be-ink`
- **Tagline**: Inter 400, `--be-text-sm`, `--be-ink-muted`
- **Nav Links**: "Privacy Policy" | "Terms of Service" in Inter 400, `--be-text-sm`, `--be-ink-subtle`, separated by gold bullet points
- **PDPA Notice**: Inter 400, `--be-text-xs`, `--be-ink-subtle` at 50% opacity
- **Decorative**: A thin horizontal line (`--be-border`) with a tiny centered peony motif spans above the logo, acting as a section divider

**Mobile**: Same layout. Links stack if needed.

---

## 6. Animation System (GSAP)

### Why GSAP Over Motion (Framer Motion)

The current codebase uses `motion/react` (Framer Motion). For this redesign, I recommend **migrating to GSAP** for the landing page only because:
1. **DrawSVG plugin**: Essential for the botanical line-drawing animations
2. **ScrollTrigger scrub**: Enables smooth, scroll-linked parallax (not just threshold-based)
3. **SplitText**: Needed for character-by-character editorial text reveals
4. **MorphSVG**: For botanical bud-to-bloom transitions
5. **Performance**: GSAP is purpose-built for complex, multi-element orchestration

The rest of the app (editor, dashboard) continues using Motion. Only the landing page uses GSAP.

### Animation Concepts

#### 6.1 Editorial Text Reveal (Hero)

```
Technique: clip-path + GSAP SplitText
Trigger:   Page load (not scroll)
Duration:  1.2s total

1. Gold horizontal rule slides in from left (0.3s)
2. Kicker text fades in with letter-by-letter stagger (0.4s, 0.02s stagger)
3. Headline words reveal via clip-path: inset(0 100% 0 0) -> inset(0 0% 0 0)
   Each word staggers by 0.08s. The italic "remember" word has a 0.15s extra delay
   and reveals with a slightly different ease (back.out(1.4)) for a subtle bounce.
4. Subtitle fades in (opacity 0->1, y 20->0, 0.5s)
5. CTA buttons slide up (y 30->0, opacity 0->1, 0.3s stagger between them)
6. Trust pills fade in simultaneously (0.3s)
```

#### 6.2 Botanical Line Drawing (Throughout)

```
Technique: GSAP DrawSVG + ScrollTrigger
Trigger:   Each botanical element has its own ScrollTrigger

SVG peony illustrations are drawn with stroke-dasharray/stroke-dashoffset animation:
- Start: stroke-dashoffset = full path length (invisible)
- End: stroke-dashoffset = 0 (fully drawn)
- Duration: Tied to scroll position (scrub: 1)
- Each petal path has a slight delay (stagger: 0.05)
- Order: stems first, then leaves, then petals (outer to inner)
```

#### 6.3 Botanical Bloom (Showcase Section)

```
Technique: GSAP MorphSVG + scale + opacity
Trigger:   ScrollTrigger when showcase enters viewport

Small peony bud SVGs at card intersections:
1. Start as tight, closed bud shapes (small, compact SVG paths)
2. Morph to open flower shapes as user scrolls through
3. Simultaneously scale from 0.6 to 1.0
4. Petals rotate slightly (rotate: 15deg to 0deg)
5. Duration: scrub over ~300px of scroll
```

#### 6.4 Parallax Depth Layers (Hero + Features)

```
Technique: GSAP ScrollTrigger with scrub
Layers (back to front):
  Layer 0 (furthest): Large botanical illustration, moves at 0.3x scroll speed
  Layer 1: Section background pattern/texture, moves at 0.5x scroll speed
  Layer 2: Content, moves at 1x scroll speed (normal)
  Layer 3 (closest): Small floating botanical elements, moves at 1.2x scroll speed

This creates a natural depth effect without 3D transforms.
```

#### 6.5 Staggered Grid Reveal (Showcase Cards)

```
Technique: GSAP ScrollTrigger + stagger
Trigger:   ScrollTrigger when grid enters viewport

Cards reveal in a diagonal stagger pattern (top-left to bottom-right):
1. Each card starts: opacity 0, y 60, scale 0.95, clipPath: inset(10% 10% 10% 10%)
2. Animate to: opacity 1, y 0, scale 1, clipPath: inset(0% 0% 0% 0%)
3. Stagger: 0.12s between cards in diagonal order [0, 1, 2, 3] mapped as [0, 0.12, 0.12, 0.24]
4. Duration: 0.8s each, ease: power3.out
```

#### 6.6 Timeline Draw (How It Works)

```
Technique: GSAP DrawSVG + ScrollTrigger scrub
Trigger:   Scrolling through the How It Works section

1. The horizontal timeline line draws from left to right (scrub: 1)
2. As the line reaches each step marker, the circle fills (scale 0->1, fill opacity 0->1)
3. The corresponding card slides in from the appropriate direction:
   - Odd steps (above line): slide down (y: -40 -> 0)
   - Even steps (below line): slide up (y: 40 -> 0)
4. Step numbers count up (0 -> final number) using GSAP's snap
```

#### 6.7 Color Block Transitions

```
Technique: GSAP ScrollTrigger + clipPath
Trigger:   When transitioning between color blocks

Instead of abrupt section color changes, each color block "wipes" in:
- Ivory to Emerald: clip-path circle expands from center
- Emerald to Ivory: clip-path slides from right to left
- Ivory to Rose: clip-path slides from bottom
- This creates a page-turning, magazine-like transition feel
```

#### 6.8 Reduced Motion Handling

All animations respect `prefers-reduced-motion`:
- Text reveals: instant (no clip-path, no stagger)
- Botanical drawings: shown at final state (fully drawn)
- Parallax: disabled (all layers at normal scroll speed)
- Color transitions: instant cuts
- Hover effects: preserved (not scroll-based)

---

## 7. Botanical Illustration System

### Design Language

All botanical illustrations follow a consistent "modern line art" style:

- **Stroke-based**: 1.5px stroke width (scaled to element size), no fills (or very light fills at 5-10% opacity)
- **Organic but controlled**: Hand-drawn feel with slight irregularities, but structured enough to feel intentional
- **Monochromatic per section**: Each illustration uses a single color from the palette (emerald, rose, or gold), varied only by opacity
- **Incomplete/cropped**: Illustrations often extend beyond their containers, suggesting a larger world beyond the viewport

### SVG Element Library

#### 7.1 Peony (Mudan /牡丹) -- Primary Motif

The peony is the "queen of flowers" in Chinese culture, symbolizing prosperity and honor.

**Variations**:
- **Full bloom**: 5-layer petals, used as the hero background element and showcase bloom animation. ~200px at natural scale.
- **Side view**: Partial profile showing 3 visible petal layers. Used for card corners and dividers. ~80px.
- **Bud**: Tight, closed form. Used as the start state for bloom animations. ~40px.
- **Single petal**: Individual petal shape. Used as floating decorative elements. ~30px.

**Construction (SVG paths)**:
```svg
<!-- Simplified peony structure (5 paths per bloom) -->
<g class="be-peony" stroke="currentColor" stroke-width="1.5" fill="none">
  <path class="be-peony-center" d="M0,0 C..." /> <!-- inner petals -->
  <path class="be-peony-mid-1" d="M0,0 C..." /> <!-- middle ring 1 -->
  <path class="be-peony-mid-2" d="M0,0 C..." /> <!-- middle ring 2 -->
  <path class="be-peony-outer-1" d="M0,0 C..." /> <!-- outer ring 1 -->
  <path class="be-peony-outer-2" d="M0,0 C..." /> <!-- outer ring 2 -->
</g>
```

Each path is independently animatable for staggered drawing/blooming effects.

#### 7.2 Vine/Branch -- Connecting Element

Used as: vertical side borders (hero), horizontal dividers (social proof, footer), and connecting tissue between sections.

**Variations**:
- **Vertical vine**: 400-600px tall, used for hero left edge. Includes small leaves at branch points.
- **Horizontal garland**: 100% width, simplified vine with peony buds. Used as section dividers.
- **Corner piece**: 90-degree curve with 2-3 leaves. Used at section corners.

#### 7.3 Double Happiness (囍) -- Cultural Motif

Reimagined as a **geometric line construction** rather than the calligraphic character:
- Two symmetrical abstract angular shapes that suggest the character without being literal
- Constructed from straight lines and right angles
- Rendered at large scale (300-400px) as a background watermark
- Stroke: `--be-gold` at 8-12% opacity
- Used in: Final CTA background, pricing section corner accents

#### 7.4 Auspicious Cloud (Xiangyun / 祥云) -- Texture Element

Simplified as flowing curved lines suggesting cloud shapes:
- Used as subtle background textures on emerald sections
- 2-3 cloud shapes per section, each ~150px
- Stroke: `--be-gold` at 5-8% opacity
- Slight parallax movement on scroll

#### 7.5 Leaves -- Supporting Element

Individual leaf shapes in two styles:
- **Round leaf** (like a eucalyptus): Simple oval with center vein. ~25px.
- **Pointed leaf** (like a willow): Elongated with curved tip. ~35px.
- Used as: floating background elements, vine branch points, icon backgrounds

### Illustration Production Workflow

1. Create master illustrations in Figma/Illustrator using a consistent stroke profile
2. Export as optimized SVGs (SVGO with path simplification)
3. Each distinct path gets a unique class for GSAP targeting
4. Store as React components in `src/components/landing/botanicals/`
5. Each botanical component accepts `color`, `opacity`, `scale`, and `className` props
6. Path data is inline (no external SVG files) for animation control

---

## 8. Key Differentiators

### What makes "Botanical Editorial" stand out from generic wedding sites:

**1. It doesn't look like a wedding site.**
Most wedding invitation platforms use predictable visual language: script fonts, pastel watercolors, generic floral stock photos. Botanical Editorial borrows from high-fashion editorial design -- Vogue covers, Kinfolk spreads, Pentagram portfolios. The immediate impression is "this is a design studio" not "this is another wedding tool." This positions DreamMoments as a premium brand.

**2. Cultural motifs are structural, not decorative.**
The double happiness symbol isn't a sticker -- it's a geometric system that informs layout ratios. Peonies aren't clip art -- they're a full illustration system that grows and blooms through interaction. Cloud motifs aren't textures -- they're animated elements with parallax depth. Every Chinese cultural reference is embedded in the design system itself, making the cultural connection feel inherent rather than applied.

**3. The color-blocking creates memorable rhythm.**
Most landing pages are monotone or gradient-based. Botanical Editorial's bold alternation between ivory, emerald, and rose blocks creates a distinctive visual identity that users remember. Each section feels like turning a page in a magazine. The transitions between color blocks (using clip-path animations) make each "page turn" feel intentional and crafted.

**4. Typography does the heavy lifting.**
In a sea of sans-serif SaaS landing pages, Botanical Editorial's Playfair Display headlines, Cormorant Garamond kickers, and typographic details (drop caps, pull-quotes, wide tracking) create instant editorial authority. The typography alone communicates "this is premium" before the user reads a single word.

**5. The botanical animations are unique to wedding tech.**
No competitor has scroll-triggered botanical line-drawing animations. The combination of DrawSVG peony illustrations, bloom morphing, and parallax-layered leaves creates a nature-tech aesthetic that is genuinely novel in this space.

---

## 9. Visual Hierarchy & Reading Flow

### Editorial Reading Pattern

The page is designed to follow a **"Z-pattern on macro, F-pattern on micro"** reading flow:

**Macro (Section-to-Section):**
Each section alternates its visual "weight" to pull the eye:
```
Hero:          LEFT-heavy  (text left, image right)
Social Proof:  CENTER      (stats centered, quote centered)
Showcase:      FULL-WIDTH  (grid breaks the pattern, invites exploration)
How It Works:  CENTER      (timeline centered, zigzag breaks linear reading)
Features:      RIGHT-heavy (features left, but mockup on right draws eye)
Pricing:       CENTER      (cards centered, dramatic dark background pulls attention)
Final CTA:     CENTER      (emotional close, intimate centered layout)
```

This alternation (left, center, full, center, right, center, center) prevents the page from feeling monotonous and creates natural "breathing points."

### Hierarchy Signals (in descending priority):

1. **Size**: Display headlines (7rem) dominate each section
2. **Color contrast**: Emerald-deep on ivory, ivory on emerald-deep (maximum contrast pairs)
3. **Typographic weight**: Playfair Display Bold vs. Inter Regular creates instant hierarchy
4. **Spatial isolation**: Key elements (CTA buttons, prices, stats) are surrounded by generous whitespace
5. **Color accent**: Rose-deep is used sparingly (only CTAs and select emphatic text), so when it appears, it commands attention
6. **Animation timing**: The first element to animate in each section is the most important (headline or stat value)

### Scanability Features:

- **Kickers** (uppercase, wide-tracked, colored) act as section labels -- a scanning user can understand the page structure from kickers alone
- **Pull-quotes** break up dense content and provide scannable summary points
- **Bold stat values** (500+, 4.9/5, <3 min) are immediately graspable
- **Step numbers** in How It Works provide clear sequence markers
- **Price figures** (RM0, RM49) are the largest text on their cards

---

## 10. Mobile Adaptation

### Philosophy

On mobile, the magazine metaphor shifts from "double-page spread" to "single-page folio." The editorial quality is preserved through typography, whitespace, and color blocking, but layouts simplify to single-column.

### Breakpoints

| Breakpoint | Name | Behavior |
|-----------|------|----------|
| 0 - 639px | Mobile | Single column, reduced type scale, simplified animations |
| 640 - 1023px | Tablet | Hybrid: 2-column where useful, full editorial type scale |
| 1024px+ | Desktop | Full editorial grid, all animations, full type scale |

### Section-Specific Mobile Adaptations

**Hero**:
- Single column, text above image
- Headline: `--be-text-section` (not `--be-text-display`)
- Image frame: 280px max-width, centered
- Background vine: hidden
- CTA buttons: full-width, stacked

**Social Proof**:
- Stats: stacked vertically with horizontal gold dividers
- Quote: full width with reduced font size

**Showcase**:
- Cards: single column, uniform 3:4 aspect ratio
- Gap: 1.5rem between cards
- Bloom animations: simplified (opacity only, no morph)

**How It Works**:
- Horizontal timeline becomes vertical
- All cards aligned left (no zigzag)
- Floating petals: hidden
- Timeline line draws top-to-bottom

**Features**:
- Single column: mockup above, features below
- Mockup: full width
- Stacked pages effect: reduced to 2 layers

**Pricing**:
- Cards stack vertically, premium first
- Cards take full width (minus padding)

**Final CTA**:
- Double happiness watermark: scaled to 40% (not hidden)
- Same centered layout works naturally

### Mobile-Specific Enhancements

- **Sticky section kickers**: On mobile, the section kicker (e.g., "THE COLLECTION") sticks to the top of the viewport as the user scrolls through that section, providing context.
- **Tap targets**: All interactive elements maintain minimum 44px tap target.
- **Touch-optimized hover**: Card hover effects replaced by subtle active-state presses on mobile.
- **Reduced botanical density**: Mobile shows 50% fewer decorative SVG elements to maintain performance and reduce visual noise.

---

## 11. Wow Moments

### Wow Moment 1: "The Blooming Gallery"

**Where**: Showcase section, as template cards enter the viewport.

**What happens**: As the user scrolls the showcase into view, small SVG peony buds positioned at the intersections of the template grid begin to bloom. The tight, closed bud shapes morph into open, layered flower forms. Simultaneously, the template cards themselves reveal through diagonal staggered clip-path animations. The combined effect is of a garden coming alive around a photo gallery.

**Technical approach**:
- 3-4 peony bud SVGs positioned at `absolute` coordinates between cards
- GSAP MorphSVG morphs bud path data to bloom path data
- GSAP ScrollTrigger with `scrub: 1` ties bloom progress to scroll position
- Cards use GSAP `clipPath: inset()` animation with `stagger` in a diagonal pattern
- Total scroll distance for full effect: ~400px

**Why it wows**: The combination of organic botanical animation with geometric grid reveals creates a tension between nature and structure that feels alive and intentional. It is the kind of detail that makes Awwwards judges pause and replay.

### Wow Moment 2: "The Editorial Text Mask"

**Where**: Hero section, on page load.

**What happens**: The hero headline "Beautiful invitations your guests will *remember*" reveals through a word-by-word clip-path mask animation. Each word appears as if being typed or uncovered by an invisible sliding panel moving left to right. The italic word "remember" has a distinct treatment -- it reveals with a slight scale bounce (0.95 to 1.0) and a 0.15s delay, creating a dramatic pause that emphasizes the emotional keyword. Behind the text, the peony vine illustration draws itself from bottom to top.

**Technical approach**:
- GSAP SplitText splits headline into words
- Each word wrapped in a `span` with `overflow: hidden`
- Inner span animates `clipPath: inset(0 100% 0 0)` to `inset(0 0% 0 0)`
- The "remember" word uses `ease: "back.out(1.4)"` for the subtle bounce
- Background vine uses DrawSVG simultaneously
- Total duration: ~1.5s from page load

**Why it wows**: Editorial text reveals are a hallmark of award-winning web design. The word-level granularity, the intentional pause on "remember," and the simultaneous botanical drawing create a choreographed opening that signals: "this was designed with care."

### Wow Moment 3: "The Color Block Page Turn"

**Where**: Transitions between every major section.

**What happens**: Instead of sections simply scrolling into view, each color block transition uses a clip-path "wipe" animation that feels like turning a page in a physical magazine. When scrolling from the ivory Hero to the emerald Social Proof, the emerald background expands from a center point (like opening a book). From emerald to ivory, it slides in from the right. From ivory to rose, it rises from the bottom. Each transition takes approximately 200px of scroll.

**Technical approach**:
- Each color block section has a `position: relative` wrapper with the background color
- An inner `div` with the contrasting color uses `clipPath: circle(0% at 50% 50%)` initially
- GSAP ScrollTrigger with `scrub: 0.5` animates to `clipPath: circle(150% at 50% 50%)`
- The variation in transition shapes (circle, horizontal slide, vertical slide) prevents repetition
- `will-change: clip-path` for GPU acceleration

**Why it wows**: Section transitions are one of the most overlooked opportunities in web design. Most sites simply scroll content. The page-turn effect creates a physical, tactile sensation that makes the digital experience feel like a luxury printed artifact. It directly reinforces the magazine metaphor.

---

## 12. Component Architecture

### File Structure

```
src/components/landing/
  botanicals/
    Peony.tsx              -- Full peony SVG (bloom, bud, side-view variants)
    Vine.tsx               -- Vertical and horizontal vine SVGs
    DoubleHappiness.tsx    -- Geometric 囍 SVG interpretation
    Cloud.tsx              -- Auspicious cloud SVGs
    Leaf.tsx               -- Individual leaf SVGs
    PetalFloat.tsx         -- Floating petal particles
    BotanicalBorder.tsx    -- Horizontal peony vine border (for dividers)
    types.ts               -- Shared types (BotanicalProps interface)
  sections/
    BEHero.tsx             -- Botanical Editorial Hero
    BESocialProof.tsx      -- Social Proof with emerald block
    BEShowcase.tsx         -- Editorial template gallery
    BEHowItWorks.tsx       -- Horizontal timeline with rose block
    BEFeatures.tsx         -- Magazine spread features
    BEPricing.tsx          -- Emerald pricing block
    BEFinalCTA.tsx         -- Rose CTA with double happiness
    BEFooter.tsx           -- Minimal footer
  hooks/
    useGsapScrollTrigger.ts    -- Custom hook for GSAP ScrollTrigger setup/cleanup
    useBotanicalDraw.ts        -- Hook for botanical DrawSVG animations
    useTextReveal.ts           -- Hook for SplitText editorial reveals
    useColorBlockTransition.ts -- Hook for section color-block wipes
    useParallaxLayer.ts        -- Hook for multi-layer parallax
    useReducedMotion.ts        -- Hook for prefers-reduced-motion (existing)
  animation.ts             -- Updated constants (GSAP eases, durations, ScrollTrigger defaults)
  BotanicalEditorial.tsx   -- Main landing page compositor (renders all sections in order)
```

### Component Design Principles

**Botanical Components** (`botanicals/`):
```tsx
interface BotanicalProps {
  color?: string;        // CSS color value, defaults to currentColor
  opacity?: number;      // 0-1, defaults to 1
  scale?: number;        // Scale factor, defaults to 1
  className?: string;    // Additional classes
  animate?: boolean;     // Whether GSAP should animate this instance
  id?: string;           // Unique ID for GSAP targeting
}
```

Each botanical component renders an inline SVG with:
- All paths given unique class names for GSAP targeting
- `currentColor` for stroke color (controlled by parent via CSS `color` property)
- `aria-hidden="true"` (all botanicals are decorative)
- `pointer-events: none` to prevent interaction interference

**Section Components** (`sections/`):
```tsx
interface SectionProps {
  reducedMotion: boolean;
}
```

Each section component:
- Accepts `reducedMotion` and conditionally initializes GSAP animations
- Uses custom hooks for animation setup/teardown (useEffect cleanup)
- Uses `useRef` for GSAP DOM targeting (no querySelector)
- Is self-contained (imports its own botanical elements and animation hooks)
- Exports a named function (not default export)

**Landing Page Compositor** (`BotanicalEditorial.tsx`):
```tsx
export function BotanicalEditorial() {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    // Register GSAP plugins once
    gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, SplitText, MorphSVGPlugin);
    return () => ScrollTrigger.killAll();
  }, []);

  return (
    <main>
      <BEHero reducedMotion={reducedMotion} />
      <BESocialProof reducedMotion={reducedMotion} />
      <BEShowcase reducedMotion={reducedMotion} />
      <BEHowItWorks reducedMotion={reducedMotion} />
      <BEFeatures reducedMotion={reducedMotion} />
      <BEPricing reducedMotion={reducedMotion} />
      <BEFinalCTA reducedMotion={reducedMotion} />
      <BEFooter />
    </main>
  );
}
```

### Dependency Notes

- **GSAP**: Core + ScrollTrigger (free). DrawSVG, MorphSVG, SplitText require GSAP Club/Business license ($99-$199/year). Evaluate if budget allows; if not, DrawSVG can be replicated with stroke-dasharray/offset CSS animations, MorphSVG can be replaced with opacity crossfades between bud/bloom states, and SplitText can be replicated with a simple JS word-splitter.
- **No new font dependencies**: Playfair Display, Inter, Cormorant Garamond, and Noto Serif SC are already in the current stack.
- **SVG illustrations**: Must be created or commissioned. Budget consideration: ~20-30 unique SVG illustrations needed for the full system.

---

## 13. Implementation Notes

### Performance Considerations

1. **SVG complexity**: Each botanical SVG should stay under 50 path elements. Over-detailed illustrations cause jank during GSAP animation.
2. **ScrollTrigger batching**: Use `ScrollTrigger.batch()` for card grid animations to reduce the number of individual triggers.
3. **will-change**: Apply `will-change: clip-path` only during active animations (GSAP's `onStart`/`onComplete` callbacks to add/remove).
4. **Lazy GSAP**: Only load GSAP plugins when the landing page route is active. Dynamic `import()` in the landing page route loader.
5. **Image optimization**: Template preview images should use `srcset` with WebP/AVIF formats and lazy loading (except hero image).
6. **Font subsetting**: Noto Serif SC is large; subset to only the characters used (囍 and a few other Chinese characters).

### Accessibility

1. All botanical SVGs use `aria-hidden="true"` and `role="presentation"`.
2. Color contrast ratios:
   - `--be-ink` on `--be-ivory`: 14.5:1 (AAA)
   - `--be-ivory` on `--be-emerald-deep`: 12.8:1 (AAA)
   - `--be-ink` on `--be-rose-blush`: 13.2:1 (AAA)
   - `--be-rose-deep` on `--be-ivory`: 7.2:1 (AAA for large text)
3. Reduced motion: all animations degrade gracefully to static states.
4. Focus-visible states: 2px `--be-rose-deep` outline, 2px offset, on all interactive elements.
5. Skip-to-content link preserved from current design.

### Migration Path

1. Create the `botanicals/` and `sections/` directories alongside existing landing components.
2. Build the `BotanicalEditorial.tsx` compositor.
3. The landing page route (`src/routes/index.tsx`) can toggle between old and new designs via a feature flag or A/B test.
4. Once validated, remove old landing components.

### Estimated SVG Illustration Count

| Illustration | Variants | Total |
|-------------|----------|-------|
| Peony | full bloom, side view, bud, single petal | 4 |
| Vine | vertical (hero), horizontal (divider), corner | 3 |
| Double Happiness | geometric interpretation | 1 |
| Cloud | 2 sizes | 2 |
| Leaf | round, pointed | 2 |
| Ornamental divider | top border, bottom border, footer | 3 |
| **Total** | | **15** |

Each at ~2-5KB optimized = **30-75KB total SVG** (negligible impact on page weight).

---

## Summary

"Botanical Editorial" transforms DreamMoments from a capable SaaS landing page into a luxury editorial experience. The bold color-blocking (emerald/rose/ivory), oversized serif typography (Playfair Display), and living botanical illustrations create a page that feels like opening a beautifully designed magazine -- one that just happens to sell wedding invitations.

The three wow moments -- The Blooming Gallery, The Editorial Text Mask, and The Color Block Page Turn -- create a scroll experience that rewards exploration and would genuinely impress Awwwards judges with their craft and intentionality.

Most critically, the Chinese cultural motifs (peonies, double happiness, cloud scrolls) are not decorative afterthoughts but structural design elements that inform the illustration system, color palette, and animation language. This gives DreamMoments a design identity that no generic wedding platform can replicate.
