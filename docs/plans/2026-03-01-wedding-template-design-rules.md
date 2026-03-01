# Wedding Template Design Rules

Design rules for creating beautiful Singapore/Malaysia Chinese wedding digital long-page invitation cards.
Derived from analysis of 31 production Chinese wedding invitation templates.

---

## 1. Foundational Principles

### 1.1 Mobile-First Single-Column Scroll

All templates are designed for mobile sharing (WhatsApp, Telegram, WeChat). The entire invitation is a single vertical scroll.

- Max content width: `430px` on desktop, centered with side margins.
- Text container: `380px` max-width within each section.
- No horizontal scrolling. No side-by-side columns on mobile.
- Use `100svh` (small viewport height) for hero section to account for mobile browser chrome.

### 1.2 Visual Rhythm: Alternate Section Backgrounds

Sections alternate between 2-3 background styles to create visual separation without borders:

```
cream → white → cream → dark → cream → white → ...
```

Common patterns:
- **Cream** (`#FFF8F0` or similar warm off-white) for text-heavy sections
- **White** (`#FFFFFF`) for photo-heavy sections
- **Dark** (deep primary color, e.g., `#8B1A1A`) for RSVP or accent sections

This prevents "wall of text" fatigue and gives each section a distinct feel.

### 1.3 Bilingual Content (Chinese + English)

Every text section uses Chinese as primary, English as secondary.

**Section title pattern:**
```
Chinese label (small, wide-spaced, primary color)
English heading (large, accent font, dark)
```

Example:
```
爱 情 故 事        ← 14px, tracking 0.5em, primary color
Our Story          ← 32-40px, accent serif font, dark color
```

For SG/MY audiences, English should be prominent enough to stand alone — many guests are English-primary. Don't treat English as an afterthought.

### 1.4 Scroll-Triggered Reveals

Every content element fades/slides in on scroll using IntersectionObserver.

- Trigger threshold: `0.15` to `0.2`
- Root margin: `0px 0px -50px 0px` (trigger slightly before element is fully visible)
- Default animation: fade + translate-up 30px
- Duration: `0.6s` to `0.8s`
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out cubic)
- Stagger siblings by `100-150ms`, max total stagger `500ms`
- Always respect `prefers-reduced-motion`: skip to visible state immediately

### 1.5 Photography is the Hero

Photos carry the emotional weight. Text supports photos, not the other way around.

- Full-bleed images with overlaid text are the dominant pattern across all templates.
- Minimum source image width: `900px` for full-bleed sections.
- Always provide a fallback image URL and graceful error handling.
- Use `object-fit: cover` universally. Never distort or stretch.
- Lazy-load everything below the fold. Use `fetchPriority="high"` for hero only.

### 1.6 Cultural Sensitivity for SG/MY

- **囍 (double happiness)** is optional — not all SG/MY Chinese couples want a traditional red/gold aesthetic. Many prefer modern minimalist, blush, or moody dark palettes.
- **Red/gold is traditional but not mandatory.** Provide it as a design token, not a hardcoded constraint.
- **Include both Chinese and English** for all key content: couple names, dates, venue, schedule.
- **Digital angpow** via PayNow (SG) / DuitNow / Touch 'n Go eWallet (MY) is more relevant than physical red packets.
- **Food is important** — dietary requirements field should be prominent in RSVP (halal, vegetarian, no pork, no beef are all common in SG/MY context).

### 1.7 Background Music

Background music is a signature feature of Chinese digital wedding invitations. Every template should support it.

- **Floating player** — fixed position (bottom-right or top-right), small circular button with play/pause icon.
- **User-initiated playback** — respect browser autoplay policies. Require a user tap to start. Do not autoplay.
- **Visual feedback** — pulsing animation, spinning disc icon, or equalizer bars when music is playing.
- **Unobtrusive** — must not block content or interfere with scrolling. Z-index above content but below modals.
- **Persist state** — remember play/pause state as user scrolls through sections.

---

## 2. Section-by-Section Rules

### 2.1 Hero Section

**Purpose:** The emotional first impression. Sets the mood, introduces the couple, anchors the date.

**Layout:**
- Full viewport height: `min-height: 100svh`
- Full-bleed background photo, edge to edge
- Dark gradient overlay for text readability: `linear-gradient(to bottom, black/50%, black/40%, black/70%)`
- Content vertically and horizontally centered within a max-width container
- Generous padding: `py: 80px`, `px: 24px`

**Content hierarchy (top to bottom):**

| Order | Element | Font | Size | Style |
|-------|---------|------|------|-------|
| 1 | Kicker text | Body sans-serif | 12px | Uppercase, tracking 0.5em, gold/light color |
| 2 | Couple names | Accent serif, 700 | 36px mobile / 60px desktop | White, joined by `&` or `·` in gold |
| 3 | Tagline | Heading serif | 18px | Gold-light, max-width 480px, leading-relaxed |
| 4 | Date + venue pills | Body sans-serif | 14px | Rounded capsules, white/90%, 1px white/20% border |
| 5 | Add to Calendar | Button | 12px | Ghost style, optional |

**Kicker text examples:**
- `WE ARE GETTING MARRIED`
- `诚邀您参加我们的婚礼`
- `SAVE THE DATE`

**Tagline examples:**
- `囍临门 · 永结同心`
- `愿得一人心，白首不相离`
- `从今天起，一起慢慢变老`

**Animation:**
- Elements stagger in from bottom: kicker (0ms) → names (100ms) → tagline (200ms) → pills (300ms)
- Optional: 囍 watermark behind content — 12rem font size, 8% opacity, center-positioned, pointer-events none

**Photo requirements:**
- `object-fit: cover`, full bleed
- `fetchPriority="high"` (above the fold)
- Provide `onError` fallback to placeholder image
- Recommended aspect: portrait-leaning or square source image

---

### 2.2 Countdown Section

**Purpose:** Build anticipation with a live countdown to the wedding day.

**Layout:**
- Centered content, moderate vertical padding
- Cream/warm background
- Max-width: `640px`

**Content:**
- Four time units displayed side-by-side: Days / Hours / Minutes / Seconds
- Large numerals with small labels beneath each

**Typography:**
| Element | Font | Size | Style |
|---------|------|------|-------|
| Numbers | Body sans-serif, bold | 32-40px | Dark/primary color |
| Labels | Body sans-serif | 10-12px | Uppercase, tracking 0.3em, muted |

**Animation:** Fade-in on scroll. Numbers update in real-time with subtle digit-change transitions (opacity swap or slide).

**Spacing:**
- Section padding: `py: 64px`, `px: 24px`
- Gap between number units: `24-32px`

---

### 2.3 Announcement Section

**Purpose:** The formal invitation letter from the couple (or parents) to guests.

**Layout:**
- Centered text block, max-width `640px`
- Gold decorative dividers above and below content
- Cream/warm background

**Content hierarchy (top to bottom):**

| Order | Element | Font | Size | Style |
|-------|---------|------|------|-------|
| 1 | Gold divider | — | 1px height, 128px width | Gradient: transparent → gold/50% → transparent |
| 2 | Chinese label | Heading serif | 14px | Tracking 0.5em, primary color (red) |
| 3 | Title | Accent serif, 700 | 32-40px | Dark color |
| 4 | Chinese message | Body sans-serif | 16px | Blockquote style: 3px gold left border, 24px left padding |
| 5 | English message | Body sans-serif | 14px | Muted color, max-width same as Chinese |
| 6 | Gold divider | — | 1px height, 128px width | Same gradient as top |

**Chinese label examples:**
- `诚 挚 邀 请`
- `我 们 的 喜 帖`

**Cultural variant — Parents' invitation:**
For more traditional SG/MY families, the announcement can come from the parents:
- Replace couple's message with parents' formal invitation
- Use "吾家有喜" or "家有喜事" as the title
- Include both sets of parents' names
- More formal tone, classical Chinese phrasing

**Animation:** Staggered fade-up reveals, dividers → label → title → messages.

---

### 2.4 Couple Section

**Purpose:** Introduce both partners with portrait photos and brief bios.

**Layout:**
- Section title centered at top
- Two-column grid on desktop (gap: 48px), single column stacked on mobile
- Each partner card: centered text alignment

**Content per partner:**

| Order | Element | Font | Size | Style |
|-------|---------|------|------|-------|
| 1 | Circular portrait | — | 256px diameter | `rounded-full`, decorative frame |
| 2 | Role label | Body sans-serif | 12px | Uppercase, tracking 0.3em, gold color |
| 3 | Name | Accent serif, 700 | 24px | Dark color |
| 4 | Bio | Body sans-serif | 14px | Muted color, 2-3 lines max |

**Photo frame style:**
- Border: `1px solid gold/30%`
- Box-shadow: `0 2px 8px dark/8%`
- Overflow: hidden (clip photo to circle)

**Role label examples:**
- `新郎 / THE GROOM`
- `新娘 / THE BRIDE`

**Animation:**
- Partner 1 fades in first (0ms delay)
- Partner 2 follows with 150ms delay
- Both fade-up with standard reveal animation

---

### 2.5 Story / Timeline Section

**Purpose:** Tell the couple's love story through relationship milestones.

**Layout:**
- Vertical timeline with decorative line on the left
- Each milestone is positioned to the right of the timeline line
- Cream/warm background

**Timeline structure:**

```
│  (timeline line - 2px wide, gradient)
●  Date                    (dot - 12px, primary fill, gold border)
   Title
   Description
   [Optional: small photo]

│
●  Date
   Title
   Description
```

**Timeline line:**
- Width: `2px`
- Color: `linear-gradient(180deg, gold, primary, gold)`
- Position: `left: 4px` on mobile, `left: 12px` on desktop

**Timeline dot:**
- Size: `12px` diameter
- Fill: primary color (e.g., red)
- Border: `2px solid gold`
- Position: aligned to timeline line

**Content per milestone:**

| Element | Font | Size | Style |
|---------|------|------|-------|
| Date | Body sans-serif | 12px | Uppercase, tracking 0.25em, gold color |
| Title | Heading serif | 24px | Dark color |
| Description | Body sans-serif | 14px | Muted color, leading-relaxed |

**Spacing:**
- Left padding from line: `32px` mobile / `48px` desktop
- Between milestones: `64px`

**Animation:** Each milestone fades in with staggered delay: `index * 100ms`, capped at `500ms`.

---

### 2.6 Gallery Section

**Purpose:** Showcase the couple's best photos in a visual grid.

**Layout:**
- Section title centered at top
- 2-column grid layout
- First photo spans full width (featured hero shot)
- All subsequent photos fill the 2-column grid

**Grid specifications:**
- Columns: 2
- Gap: `16px`
- Featured photo (index 0): `col-span-2`, height `288px` mobile / `384px` desktop
- Standard photos: height `256px` mobile / `320px` desktop

**Photo treatment:**
- `object-fit: cover`, `loading="lazy"`
- Corner radius: `12px` (rounded-xl)
- Frame border: `1px solid gold/30%`, subtle box-shadow
- Caption: bottom-left overlay, white text on `linear-gradient(to-top, black/30%, transparent)`
- Dark gradient at bottom for caption readability

**Alternative layouts** (from sample analysis):
- **Carousel/swiper** — horizontal scroll gallery, common in Chinese templates. Good for 10+ photos.
- **Masonry** — variable-height grid. Striking but complex.
- **Lightbox on tap** — full-screen overlay for detailed viewing. Recommended for all layouts.

**Animation:** Staggered fade-in, `100ms` interval per photo, max `500ms` total delay.

---

### 2.7 Schedule Section

**Purpose:** Day-of event timeline — what happens when.

**Layout:**
- Vertical list of event cards
- Each card has a colored left stripe (accent/primary color)
- White background cards on cream section background

**Card style:**
- Background: white
- Border: `1px solid gold/20%`
- Border-radius: `12px` (rounded-xl)
- Padding: `20px`
- Left stripe: `4px` wide, primary color, `rounded-full`

**Content per event card:**

| Element | Font | Size | Style |
|---------|------|------|-------|
| Time | Body sans-serif, bold | 12px | Uppercase, tracking 0.2em, gold color |
| Event title | Heading serif | 18px | Dark color |
| Description | Body sans-serif | 14px | Muted color |

**Spacing:**
- Between cards: `16px`
- Content gap within card: `4-8px`

**Animation:** Staggered fade-in, `80ms` interval per card.

---

### 2.8 Venue Section

**Purpose:** Where to go and how to get there.

**Layout:**
- Centered text, max-width `640px`
- White background

**Content hierarchy:**

| Order | Element | Font | Size | Style |
|-------|---------|------|------|-------|
| 1 | Section title | Standard bilingual title pattern | — | — |
| 2 | Venue name | Heading serif | 24px | Dark color |
| 3 | Address | Body sans-serif | 14px | Muted, leading-relaxed |
| 4 | Directions | Body sans-serif | 14px | Muted (optional) |
| 5 | Parking info | Body sans-serif | 12px | Uppercase, tracking 0.2em, gold |
| 6 | Navigation buttons | — | — | Google Maps + Waze pills |

**Navigation button style:**
- Layout: horizontal row, centered, `gap: 12px`
- Shape: `rounded-full` pill
- Border: `1px solid primary/20%`
- Text: `12px` uppercase, `tracking 0.15em`, primary color
- Hover: `bg primary/5%`
- Padding: `10px 20px`

**SG/MY specifics:**
- Always include **both Google Maps AND Waze** — Malaysians heavily use Waze, Singaporeans use both.
- Include parking info — critical for hotel/restaurant venues in both countries.
- Optional: embedded static map image or iframe.

---

### 2.9 RSVP Section

**Purpose:** Collect guest attendance, dietary requirements, and messages.

**Layout:**
- **Dark background** — deep primary color (e.g., `#8B1A1A`) to visually separate from other sections
- Two columns on desktop: info panel (left) + form (right)
- Single column stacked on mobile: info above, form below

**Left panel (info):**

| Element | Font | Size | Style |
|---------|------|------|-------|
| Chinese label | Heading serif | 14px | Tracking 0.5em, gold-light |
| "RSVP" heading | Accent serif, 700 | 40px | Cream/white |
| Deadline text | Body sans-serif | 14px | White/70% |
| Info card | — | — | White/6% bg, rounded, 1px white/10% border |

**Right panel (form):**
- Background: cream/warm color
- Border: `1px solid gold/20%`
- Border-radius: `16px` (rounded-2xl)
- Padding: `24px` mobile / `32px` desktop

**Form fields:**
1. **Name** (required) — full-width, text input
2. **Email** — full-width, email input
3. **Attendance** — half-width, select dropdown (Attending / Not Attending / Undecided)
4. **Guest Count** — half-width, number input with min/max
5. **Dietary Requirements** — full-width, text input
6. **Message** — full-width, textarea (min-height `96px`)
7. **Consent checkbox** — with privacy policy link

**Input style:**
- Border: `1px solid gold/30%`
- Border-radius: `8px`
- Padding: `12px 16px`
- Font: body sans-serif, `14px`
- Focus: `outline 2px white`, `box-shadow 0 0 0 4px primary/50%`

**Submit button:**
- Full width
- Background: primary color
- Text: white, `12px` uppercase, tracking `0.3em`, bold
- Border-radius: `rounded-full`
- Padding: `14px 20px`
- Disabled state: `opacity 70%`, `cursor not-allowed`

**Post-submit:** Replace form with confirmation card showing submitted data and an "Edit" button to re-enter.

**Validation:**
- Inline error messages in red, `role="alert"`
- Validate on blur (not just submit)
- Required field indicator in label

---

### 2.10 Gift / Digital Angpow Section

**Purpose:** Enable guests to send monetary gifts digitally.

**Layout:**
- Centered content, max-width `400px`
- **Hidden by default** — couples opt in to show this section
- Cream/warm background

**Content:**

| Order | Element | Style |
|-------|---------|-------|
| 1 | Section title | Standard bilingual title pattern |
| 2 | QR code | Centered, decorative gold border frame |
| 3 | Payment method | Small label beneath QR |
| 4 | Recipient name | Body text, dark |

**Design treatment:**
- Frame the QR code with a gold/decorative border to evoke the red packet tradition
- Keep wording gracious, not transactional: "If you wish to bless us with a gift" rather than "Pay here"

**SG/MY payment methods:**
- **Singapore:** PayNow (via UEN or phone number)
- **Malaysia:** DuitNow, Touch 'n Go eWallet, Boost

---

### 2.11 Footer Section

**Purpose:** Close the invitation with a thank-you and emotional flourish.

**Layout:**
- Centered text, cream background
- Gold divider at top
- Generous vertical padding

**Content:**

| Order | Element | Font | Size | Style |
|-------|---------|------|------|-------|
| 1 | Gold divider | — | 1px height, 96px width | Gradient fade |
| 2 | Decorative motif | Accent serif | 48-64px | Primary color, aria-hidden |
| 3 | Thank-you message | Heading serif | 18px | Dark, whitespace-pre-line, leading-relaxed |
| 4 | Social hashtag | Body sans-serif | 12px | Uppercase, tracking 0.28em, muted |

**Decorative motif options:**
- 囍 (double happiness) — traditional
- ♥ or heart illustration — modern
- Custom SVG flourish — unique per template
- Couple's initials monogram — personalized

**Animation:** Gentle fade-in on scroll, no stagger needed.

---

## 3. Typography System

### 3.1 Font Roles

Templates use three font roles:

| Role | Purpose | Fallback Stack |
|------|---------|----------------|
| **Heading** | Section labels, Chinese poetry, formal text | `'Noto Serif SC', 'Songti SC', Georgia, serif` |
| **Body** | Paragraphs, form labels, descriptions | `Inter, 'Noto Sans SC', system-ui, sans-serif` |
| **Accent** | Couple names, section titles, decorative text | `'Noto Serif SC', 'Songti SC', serif` at weight 700 |

### 3.2 Type Scale

| Level | Mobile | Desktop | Weight | Use |
|-------|--------|---------|--------|-----|
| Display | 36px | 60px | 700 | Couple names on hero |
| H1 | 32px | 40-48px | 700 | Section headings (English) |
| H2 | 24px | 28px | 400-700 | Sub-headings, venue name, milestone titles |
| Body | 14-16px | 16px | 400 | Paragraphs, messages |
| Small | 12px | 12-14px | 400-600 | Labels, dates, kickers |
| Micro | 10px | 10-12px | 400 | Timestamps, form hints |

### 3.3 Chinese Text Spacing

- Chinese section labels use **letter-spacing 0.5em** with spaces between each character: `爱 情 故 事`
- This creates a traditional calligraphic feel and visual breathing room.
- Body Chinese text uses normal letter-spacing.

### 3.4 Line Heights

| Text type | Line height |
|-----------|-------------|
| Headings | 1.2 |
| Body text | 1.75 (leading-relaxed) |
| Labels/small | 1.4 |

---

## 4. Spacing System

### 4.1 Section Spacing

| Property | Mobile | Desktop |
|----------|--------|---------|
| Section padding-y | 64-96px | 96-128px |
| Section padding-x | 24px | 40px |
| Content max-width | 100% | 640-768px (centered) |
| Between content blocks | 32-48px | 48-64px |

### 4.2 Element Spacing

| Context | Gap |
|---------|-----|
| Section title to content | 48-56px |
| Between cards/items | 16px |
| Between text blocks | 8-16px |
| Form field gap | 16px |
| Button margin-top | 24px |
| Divider margin | 40px |

---

## 5. Animation System

### 5.1 Reveal Animation

The standard scroll-reveal animation used across all sections:

```
Initial state:
  opacity: 0
  transform: translate3d(0, 30px, 0)

Visible state:
  opacity: 1
  transform: translate3d(0, 0, 0)

Transition:
  duration: 0.6-0.8s
  easing: cubic-bezier(0.16, 1, 0.3, 1)
  delay: per-element stagger
```

### 5.2 Stagger Pattern

When multiple sibling elements animate in:
- Interval: `100-150ms` between each element
- Cap: `500ms` maximum total delay (so item 6+ all animate at 500ms)
- Formula: `delay = Math.min(index * 100, 500)` ms

### 5.3 Direction Variants

| Variant | Transform | Use case |
|---------|-----------|----------|
| **fade-up** (default) | `translateY(30px)` | Most content |
| **fade-left** | `translateX(-30px)` | Timeline items, left-aligned |
| **fade-right** | `translateX(30px)` | Alternating timeline |
| **fade-scale** | `scale(0.95)` | Photos, cards |
| **fade-blur** | `filter: blur(8px)` | Hero elements, decorative |

### 5.4 Particle Effects (Optional)

For templates that want atmospheric effects:

| Preset | Count | Color | Shape | Drift | Use |
|--------|-------|-------|-------|-------|-----|
| petalRain | 18 | Pink/50% | Petal | Down | Blush/romantic themes |
| goldDust | 24 | Gold/60% | Sparkle | Up | Traditional/luxury themes |
| starlight | 16 | White/70% | Sparkle | Float | Dark/moody themes |
| lanterns | 8 | Orange/60% | Circle | Up | Traditional Chinese themes |

### 5.5 Reduced Motion

All animations must check `prefers-reduced-motion: reduce`:
- Skip all transforms, transitions, and particles
- Show all content immediately in visible state
- No auto-playing animations or drift effects

---

## 6. Photo Guidelines

### 6.1 Image Specifications

| Context | Min Width | Aspect Ratio | Object Fit |
|---------|-----------|--------------|------------|
| Hero background | 900px | Flexible (portrait preferred) | cover |
| Couple portraits | 600px | 1:1 (square) | cover |
| Gallery featured | 900px | 16:9 or 3:2 | cover |
| Gallery standard | 600px | Flexible | cover |
| Story thumbnails | 400px | 1:1 or 3:4 | cover |

### 6.2 Overlay Patterns

| Context | Overlay |
|---------|---------|
| Hero | `linear-gradient(to-b, black/50%, black/40%, black/70%)` |
| Gallery caption | `linear-gradient(to-t, black/30%, transparent)` |
| Card hover | `background: primary/5%` |

### 6.3 Error Handling

Every `<img>` element must:
1. Have a fallback `src` (placeholder photo URL)
2. Use `onError` handler that swaps to fallback (once only, via `dataset.fallback` flag)
3. Show a colored background placeholder (`bg: gold-light`) while loading

---

## 7. Interaction Patterns

### 7.1 Buttons

Two button styles:

**Primary (solid):**
- Background: primary color
- Text: white, 12px uppercase, tracking 0.3em, bold
- Border-radius: `rounded-full` (9999px)
- Padding: `14px 20px`
- Hover: slightly darker shade
- Disabled: `opacity 70%`, `cursor not-allowed`

**Ghost (outline):**
- Background: transparent
- Border: `1px solid primary/20%`
- Text: primary color, 12px uppercase, tracking 0.15em
- Border-radius: `rounded-full`
- Padding: `10px 20px`
- Hover: `bg primary/5%`

### 7.2 Form Inputs

- Border: `1px solid gold/30%`
- Border-radius: `8px`
- Padding: `12px 16px`
- Font: body sans-serif, 14px
- Placeholder: `gray-400`
- Focus ring: `outline 2px white`, `box-shadow 0 0 0 4px primary/50%`
- Error state: red border, red error text below with `role="alert"`

### 7.3 Links

- Color: primary color
- Style: underline
- Hover: no underline
- External links: `target="_blank"`, `rel="noopener noreferrer"`

---

## 8. Accessibility Checklist

Every template must meet these requirements:

- [ ] All images have descriptive `alt` text (decorative images use `alt=""` + `aria-hidden="true"`)
- [ ] Color contrast meets WCAG AA (4.5:1 for text, 3:1 for large text and UI components)
- [ ] Never use gold text on red background (2.66:1 fails WCAG)
- [ ] All form inputs have associated `<label>` elements
- [ ] Required fields have `aria-required="true"`
- [ ] Error messages use `role="alert"` for screen reader announcement
- [ ] Focus-visible states on all interactive elements
- [ ] Semantic HTML: `<section>`, `<article>`, `<nav>`, `<figure>`, `<figcaption>`
- [ ] `lang` attribute on bilingual content (`lang="zh-Hans"` on Chinese, `lang="en"` on English)
- [ ] Reduced motion media query respected (all animations skippable)
- [ ] Touch targets minimum `44x44px` on mobile
- [ ] Skip-to-content link at the top (optional but recommended for long pages)

---

## 9. Design Tokens (Template-Agnostic)

Each template defines its own color palette via design tokens. The token structure is fixed; the values vary per template.

### 9.1 Color Tokens

| Token | Purpose | Example (Traditional) | Example (Modern) |
|-------|---------|----------------------|-------------------|
| `primary` | Main accent, buttons, highlights | `#C8102E` (red) | `#8B6F5E` (taupe) |
| `secondary` | Darker accent, dark sections | `#8B1A1A` (deep red) | `#5C4A3A` (dark brown) |
| `accent` | Decorative elements, gold | `#D4A843` (gold) | `#C9A96E` (warm gold) |
| `background` | Page/section background | `#FFF8F0` (cream) | `#FAFAF8` (warm white) |
| `text` | Primary text color | `#2B1216` (dark brown) | `#1A1A1A` (near black) |
| `muted` | Secondary text, descriptions | `#8B7355` (warm gray) | `#888888` (neutral gray) |

### 9.2 Font Tokens

| Token | Purpose | Guidelines |
|-------|---------|------------|
| `headingFont` | Section labels, poetry | Chinese serif with generous fallbacks |
| `bodyFont` | Paragraphs, forms | Chinese sans-serif + Latin sans-serif |
| `accentFont` | Names, titles, decorative | Chinese serif at bold weight |

### 9.3 Animation Tokens

| Token | Purpose | Default |
|-------|---------|---------|
| `scrollTriggerOffset` | IntersectionObserver rootMargin | `100` (px) |
| `defaultDuration` | Standard reveal duration | `0.6` (seconds) |
| `easing` | CSS easing function name | `easeOutCubic` |

---

## 10. Section Order Reference

The recommended section order, based on the most common pattern across all 31 analyzed templates:

| Order | Section | Default Visible | Notes |
|-------|---------|----------------|-------|
| 1 | Hero | Yes | Always first, full-viewport |
| 2 | Countdown | Yes | Builds anticipation immediately |
| 3 | Announcement | Yes | Formal invitation text |
| 4 | Couple | Yes | Partner introductions |
| 5 | Story | Yes | Love story timeline |
| 6 | Gallery | Yes | Photo showcase |
| 7 | Schedule | Yes | Day-of event timeline |
| 8 | Venue | Yes | Location + navigation |
| 9 | RSVP | Yes | Guest response form |
| 10 | Gift | No (opt-in) | Digital angpow |
| 11 | Footer | Yes | Thank-you, closing |

Sections can be reordered, hidden, or shown via the template configuration. This order represents the most natural reading flow for Chinese wedding invitations.

---

## 11. Quick Reference: CSS Custom Properties

Templates should define their colors as CSS custom properties scoped to the template root class:

```css
.template-name {
  --t-primary: #C8102E;
  --t-secondary: #8B1A1A;
  --t-accent: #D4A843;
  --t-bg: #FFF8F0;
  --t-text: #2B1216;
  --t-muted: #8B7355;
  --t-bg-alt: #FFFFFF;
}
```

This allows consistent theming and easy palette swaps without modifying component code.
