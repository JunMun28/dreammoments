# Cinematic Luxury -- DreamMoments Landing Page Redesign

**Designer A Proposal**
**Direction**: Editorial magazine meets luxury fashion house (Cartier, Bulgari digital experiences)
**Mood**: Bold, saturated, dramatic, cinematic -- a landing page that feels like a Vogue editorial crossed with a Cartier film premiere

---

## 1. Color Palette

### Primary Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--cl-crimson` | `#C41E3A` | Primary CTA backgrounds, hero accent text, active states, feature icons, cultural highlights |
| `--cl-crimson-deep` | `#8B0000` | Hover states, gradient endpoints, dramatic text emphasis, section dividers |
| `--cl-crimson-glow` | `rgba(196, 30, 58, 0.12)` | Radial glow backgrounds behind CTAs, hero ambient light |
| `--cl-crimson-soft` | `#F9E4E8` | Light tint for badges, kicker backgrounds, subtle card accents |

### Gold Spectrum

| Token | Hex | Usage |
|-------|-----|-------|
| `--cl-gold` | `#D4AF37` | Decorative elements, section kickers, ornamental rules, 囍 watermark, timeline connectors |
| `--cl-gold-deep` | `#C9A94E` | Hover shimmer on gold elements, pricing card borders, premium badges |
| `--cl-gold-champagne` | `#F5EDDA` | Gold-tinted surface backgrounds (pricing section, social proof) |
| `--cl-gold-light` | `rgba(212, 175, 55, 0.08)` | Subtle gold wash overlays for section backgrounds |

### Neutrals

| Token | Hex | Usage |
|-------|-----|-------|
| `--cl-white` | `#FEFDFB` | Page background, card surfaces -- NOT pure white, slightly warm |
| `--cl-cream` | `#F8F5F0` | Alternating section backgrounds, muted surfaces |
| `--cl-ink` | `#1A1412` | Primary text, headings -- very deep warm brown, nearly black |
| `--cl-ink-medium` | `#4A4340` | Subheadings, secondary body text |
| `--cl-ink-muted` | `#8A8380` | Captions, timestamps, helper text |
| `--cl-border` | `#E8E2DA` | Card borders, dividers, subtle structural lines |
| `--cl-border-gold` | `rgba(212, 175, 55, 0.25)` | Premium card borders, ornamental hairlines |

### Usage Rules

1. **Crimson is the power color.** Use it sparingly but boldly -- CTAs, hero emphasis word, active timeline steps, and cultural badges. Never use it for body text.
2. **Gold is decorative only.** It appears in kickers, ornamental rules, the 囍 watermark, and premium pricing elements. Never for body text or functional UI.
3. **Dramatic contrast is the key principle.** Large white/cream sections punctuated by intense crimson and gold moments. The eye should be "pulled" to these accents.
4. **No pure blacks, no pure whites.** Everything has warmth. `--cl-ink` is a deep warm brown. `--cl-white` has a warm undertone.
5. **Gold gradients** are allowed for decorative horizontal rules: `linear-gradient(90deg, transparent, var(--cl-gold), transparent)`.

---

## 2. Typography

### Font Families

| Token | Family | Fallback Stack | Usage |
|-------|--------|----------------|-------|
| `--font-display` | **Playfair Display** | "Noto Serif SC", Georgia, serif | Hero headline (120px+), section titles, pricing values |
| `--font-editorial` | **Cormorant Garamond** | "Noto Serif SC", Georgia, serif | Accent text, kickers, blockquotes, testimonials, sub-taglines |
| `--font-body` | **Inter** | "Noto Serif SC", system-ui, sans-serif | Body copy, feature descriptions, CTA labels, navigation |
| `--font-cultural` | **Noto Serif SC** | serif | 囍 characters, bilingual content, cultural badges |

### Type Scale (all using `clamp()` for fluid responsiveness)

| Token | Size | Weight | Tracking | Usage |
|-------|------|--------|----------|-------|
| `--text-hero` | `clamp(4rem, 10vw + 1rem, 8.5rem)` | 700 | `-0.035em` | Hero h1 -- enormous, commanding, cinematic |
| `--text-hero-accent` | `clamp(3.5rem, 9vw + 0.5rem, 7.5rem)` | 400 italic | `-0.02em` | Hero emphasis word (italic crimson) |
| `--text-section` | `clamp(2.5rem, 5vw + 1rem, 4.5rem)` | 600 | `-0.025em` | Section h2 headings |
| `--text-section-accent` | `clamp(1.25rem, 2vw + 0.5rem, 1.75rem)` | 300 italic | `0.02em` | Section sub-headings in Cormorant |
| `--text-kicker` | `clamp(0.7rem, 1vw, 0.8rem)` | 500 | `0.18em` | Uppercase kickers above section titles |
| `--text-body` | `clamp(1rem, 1.2vw, 1.125rem)` | 400 | `0` | Paragraphs, descriptions |
| `--text-body-lg` | `clamp(1.125rem, 1.5vw, 1.3rem)` | 400 | `0` | Hero subtitle, larger body |
| `--text-caption` | `0.8125rem` | 500 | `0.06em` | Badges, timestamps, small labels |
| `--text-overline` | `0.6875rem` | 600 | `0.2em` | All-caps overlines, step numbers |

### Typography Hierarchy Rules

1. **Hero headline must be oversized.** At desktop it reaches 136px (8.5rem). This is the "Awwwards moment" -- when you land on the page, the type is impossibly large and confident.
2. **Section titles use Playfair Display** at 600 weight -- elegant, editorial, never heavy.
3. **Kickers are always uppercase Inter** with extreme tracking (0.18em) in gold or crimson -- they feel like a magazine section label.
4. **Italics in Cormorant Garamond** are the "breath" of the page -- the romantic counterpoint to the bold Playfair headlines.
5. **Line heights**: Headlines 1.05, body 1.65, captions 1.4.

---

## 3. Layout -- Section-by-Section Detail

### 3.1 Hero Section

**Layout**: Full viewport height (`100svh`). Split layout on desktop -- 55% left (copy), 45% right (template preview). On mobile, stacked vertically with copy first.

**Desktop Structure**:
```
+------------------------------------------------------------------+
|  [Grain overlay, 3% opacity]                                      |
|                                                                    |
|  [Radial crimson glow                                             |
|   at center-left, very subtle]                                    |
|                                                                    |
|      囍  Made for Chinese Weddings    AI-Powered                  |
|                                                                    |
|      Beautiful invitations                                        |
|      your guests will                    +-------------------+    |
|      remember.                           |                   |    |
|         ^^^^^^^^^ (crimson italic)       |  [Template card   |    |
|                                          |   with 3D tilt    |    |
|      Create a stunning digital wedding   |   on mouse move]  |    |
|      invitation in minutes...            |                   |    |
|                                          |   9:16 aspect     |    |
|      [Create Your Invitation]  [Browse]  |   rounded-3xl     |    |
|                                          |   floating shadow  |    |
|      Free to start | No card | PDPA      +-------------------+    |
|                                                 [Badge]           |
+------------------------------------------------------------------+
```

**Key differences from current**:
- Hero headline is 2x larger -- goes from `clamp(2.75rem, 6vw + 1rem, 5rem)` to `clamp(4rem, 10vw + 1rem, 8.5rem)` -- massive typographic statement
- Template preview card gets **3D perspective tilt** that follows cursor position (GSAP-driven, max 8 degrees rotation)
- Background has a cinematic **radial glow** from `--cl-crimson-glow` emanating from the center-left, giving a warm spotlight effect
- CTA button gets a **magnetic hover effect** -- the button subtly moves toward the cursor within a 40px radius
- Trust indicators are separated by thin gold hairlines instead of gray dividers
- Floating badge uses a gold border with a subtle **pulse animation** (scale 1.0 -> 1.02 -> 1.0, every 3s)

**Cinematic Letterboxing**: Two thin horizontal bars (height: 2px, background: `--cl-border`) at top and bottom of viewport, creating a widescreen film aspect feel. These bars are 90% width, centered, with fade-in on page load.

### 3.2 Social Proof Section

**Layout**: Horizontal strip, darker cream background (`--cl-gold-champagne`). Full-width with content centered at `max-w-6xl`.

**Desktop Structure**:
```
+------------------------------------------------------------------+
|  ━━━━━━ gold ornamental rule ━━━━━━                               |
|                                                                    |
|    500+              4.9/5              < 3 min                   |
|    Couples served    Average rating     Setup time                |
|                                                                    |
|  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  |
|                                                                    |
|    "Our guests kept saying the invitation was the most beautiful  |
|     they'd ever received..."                                      |
|                                            -- Wei Lin & Jun Hao   |
|                                                                    |
|  ━━━━━━ gold ornamental rule ━━━━━━                               |
+------------------------------------------------------------------+
```

**Key differences from current**:
- Stats numbers use **counter animation** (GSAP CountUp from 0 to target value, triggered on scroll into view, 1.5s duration, power2.out easing)
- Top and bottom gold ornamental rules: `linear-gradient(90deg, transparent 5%, var(--cl-gold) 30%, var(--cl-gold) 70%, transparent 95%)`
- Testimonial text in **Cormorant Garamond italic**, large size (1.5rem), with a subtle **typewriter reveal** -- characters fade in left-to-right with 0.02s stagger
- Stats values use **Playfair Display** at 48px, crimson color -- they feel like editorial page numbers
- The entire section has a **parallax scroll** effect: content scrolls at 0.85x the rate of the page, creating subtle depth

### 3.3 Showcase Section (THE WOW MOMENT)

**Layout**: This section uses **horizontal scroll-jacking**. The section is pinned to the viewport while the user scrolls, and the template cards slide horizontally through the frame.

**Desktop Structure**:
```
+------------------------------------------------------------------+
|  PINNED SECTION (100vh)                                           |
|                                                                    |
|      The Collection                                               |
|      Four templates, crafted for                                  |
|      Chinese weddings.                                            |
|                                                                    |
|  +----------+ +----------+ +----------+ +----------+             |
|  |          | |          | |          | |          |              |
|  | Garden   | | Love at  | | Blush    | | Eternal  |             |
|  | Romance  | | Dusk     | | Romance  | | Elegance |             |
|  |          | |          | |          | |          |              |
|  | [3:4]    | | [3:4]    | | [3:4]    | | [3:4]    |             |
|  |          | |          | |          | |          |              |
|  +----------+ +----------+ +----------+ +----------+             |
|       ^^^ These scroll horizontally while section is pinned      |
|                                                                    |
|  [Progress indicator: ---- o ---- o ---- o ---- o ----]          |
+------------------------------------------------------------------+
```

**GSAP Implementation**:
```
ScrollTrigger.create({
  trigger: ".showcase-section",
  pin: true,
  start: "top top",
  end: () => "+=" + (containerWidth - viewportWidth),
  scrub: 1,
  snap: { snapTo: 1 / (numCards - 1), duration: 0.3, ease: "power2.inOut" }
})
// Tween: gsap.to(".showcase-track", { x: -(containerWidth - viewportWidth), ease: "none" })
```

**Key differences from current**:
- **Horizontal scroll-jacking** replaces the static 4-column grid
- Each card is much larger -- nearly full viewport height (70vh), with generous padding
- Cards have a **parallax image** inside -- as the horizontal scroll progresses, the image inside each card moves at a slower rate, creating depth
- On **hover**, each card scales to 1.03 with a subtle shadow expansion, and the image inside zooms to 1.08 -- all with 0.6s ease
- A **progress indicator** at the bottom shows a horizontal line with dots for each template, the filled portion animating in sync with scroll
- Section header text reveals via **SplitText char-by-char** animation -- each character fades up from 20px below with 0.015s stagger, creating a wave effect
- Cultural badge uses crimson with gold text instead of the current white-on-crimson

**Card Inner Layout**:
```
+---------------------------+
|                           |
|    [Photo -- parallax]    |
|    gradient overlay at    |
|    bottom 30%             |
|                           |
|    +--- Gold rule ---+    |
|    Garden Romance         |
|    Chinese tradition      |
|    with modern warmth.    |
|                           |
|    [Preview ->]           |
+---------------------------+
```

### 3.4 How It Works Section

**Layout**: Asymmetric split -- 40% left (sticky section header), 60% right (scrolling timeline cards). The left side pins while the right side scrolls.

**Desktop Structure**:
```
+------------------------------------------------------------------+
|  Background: --cl-cream                                           |
|                                                                    |
|  +-- STICKY (40%) --+  +-- SCROLLING (60%) --+                   |
|  |                   |  |                     |                   |
|  | How It Works      |  | 01                  |                   |
|  |                   |  | Sign up in seconds  |                   |
|  | From sign up to   |  | Create your account |                   |
|  | RSVPs in 5 steps  |  |                     |                   |
|  |                   |  | 02                   |                   |
|  | [Decorative 囍    |  | Pick your template   |                  |
|  |  in gold, 40%     |  | Choose from 4...    |                   |
|  |  opacity]         |  |                     |                   |
|  |                   |  | 03                   |                   |
|  +-------------------+  | Let AI write...     |                   |
|                         |                     |                   |
|                         | 04                   |                   |
|                         | Make it yours        |                   |
|                         |                     |                   |
|                         | 05                   |                   |
|                         | Share & track RSVPs  |                   |
|                         +---------------------+                   |
+------------------------------------------------------------------+
```

**GSAP Implementation**:
- Left panel uses `position: sticky; top: 50%; transform: translateY(-50%)` -- stays centered while right side scrolls
- The timeline line on the right animates its height as user scrolls (current implementation preserved, but moved to right column)
- Each step number ("01", "02", etc.) is in **Playfair Display**, oversized (3rem), crimson-colored, and fades in with a scale-up from 0.8
- Step cards have a left gold border (3px) that animates from 0 height to full height as each card enters viewport

**Key differences from current**:
- Changes from centered vertical timeline to **asymmetric split layout** -- more editorial, more sophisticated
- Section header becomes a persistent anchor while content scrolls -- users never lose context
- Step numbers are dramatically larger and in crimson (not muted gray circles)
- Each card has a **staggered entrance**: the number fades in first (0.3s), then the title slides up (0.2s delay), then the description (0.4s delay)
- The decorative 囍 character on the left panel has a very slow **parallax rotation** (0 to 5 degrees over the section scroll)

### 3.5 Features Section

**Layout**: Full-width section with cinematic composition. Split layout inside a large container card. Left side: feature list with animated icons. Right side: large product mockup with **perspective tilt** on scroll.

**Desktop Structure**:
```
+------------------------------------------------------------------+
|  Background: --cl-white                                           |
|                                                                    |
|  +------------------------------------------------------------+  |
|  |  Container card (rounded-3xl, cream bg, gold-tinted border) |  |
|  |                                                              |  |
|  |  +-- Features (50%) --+  +-- Mockup (50%) --------+        |  |
|  |  |                    |  |                         |        |  |
|  |  | Why DreamMoments   |  |  +-------------------+  |        |  |
|  |  |                    |  |  | Editor preview    |  |        |  |
|  |  | Everything you     |  |  | with 3D perspective|  |        |  |
|  |  | need. Nothing you  |  |  | tilt on scroll    |  |        |  |
|  |  | don't.             |  |  |                   |  |        |  |
|  |  |                    |  |  | Rotates subtly    |  |        |  |
|  |  | [Icon] AI-Powered  |  |  | on Y axis as     |  |        |  |
|  |  | [Icon] Chinese Wed |  |  | user scrolls     |  |        |  |
|  |  | [Icon] One-Tap     |  |  | through section  |  |        |  |
|  |  | [Icon] Dashboard   |  |  +-------------------+  |        |  |
|  |  | [Icon] Every Screen|  |                         |        |  |
|  |  +--------------------+  +-------------------------+        |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

**Key differences from current**:
- Feature icons animate in with a **magnetic pull effect** -- they start 20px to the left and slide into position with a spring ease
- Each feature row has a left-side **accent line** (2px, crimson) that grows from 0 to full height as the row enters view
- The mockup has a **3D perspective tilt** driven by scroll position: `rotateY()` value mapped from -5deg to 5deg across the section scroll range
- Icon circles use a crimson-to-gold gradient border instead of solid gray
- The italic accent text "Nothing you don't." uses **Cormorant Garamond** in crimson (currently rose)
- Container card border uses `--cl-border-gold` for a premium feel

### 3.6 Pricing Section

**Layout**: Centered, two-card layout with dramatic size difference. Premium card is 15% taller and has a gold gradient top border. Background uses subtle diagonal gold lines pattern.

**Desktop Structure**:
```
+------------------------------------------------------------------+
|  Background: --cl-gold-champagne with diagonal gold line pattern  |
|                                                                    |
|      Simple Pricing                                               |
|      One price. No subscriptions.                                 |
|                                                                    |
|      [MYR (Malaysia) / SGD (Singapore)]                           |
|                                                                    |
|    +-------------------+    +------------------------+            |
|    |                   |    |  [MOST POPULAR badge]  |            |
|    |  Free             |    |                        |            |
|    |                   |    |  Premium               |            |
|    |  RM 0             |    |                        |            |
|    |                   |    |  RM 49  / SGD 19       |            |
|    |  [features]       |    |                        |            |
|    |                   |    |  [features]            |            |
|    |                   |    |                        |            |
|    | [Get Started]     |    |  [Upgrade for RM49]    |            |
|    +-------------------+    +------------------------+            |
|                                                                    |
+------------------------------------------------------------------+
```

**Key differences from current**:
- Premium card has a **top gold gradient bar** (4px): `linear-gradient(90deg, var(--cl-crimson), var(--cl-gold))` -- signals premium
- Price values ("RM49") are in **Playfair Display**, 72px, with a subtle **counter animation** on scroll-in (0 -> 49 over 1.2s)
- "Most Popular" badge uses a crimson-to-deep-crimson gradient background with a subtle shimmer animation
- Check icons are crimson (premium) vs gold (free) -- differentiates tiers visually
- Premium card has a **subtle glow** shadow: `0 0 40px rgba(196, 30, 58, 0.08)` -- barely visible but creates a "spotlight" effect
- Free card uses a dashed border to feel intentionally understated compared to premium
- The **diagonal gold line pattern** in the background is achieved with CSS: `repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(212, 175, 55, 0.03) 40px, rgba(212, 175, 55, 0.03) 41px)`

### 3.7 Final CTA Section

**Layout**: Full-width cinematic section. Deep warm background. Massive centered text. This is the emotional crescendo of the page.

**Desktop Structure**:
```
+------------------------------------------------------------------+
|  Background: --cl-ink (deep warm dark)                            |
|  [Top gold hairline]                                              |
|                                                                    |
|        [Giant 囍 watermark, 3% opacity, gold, 30rem]             |
|                                                                    |
|        Your love story awaits                                     |
|        (Cormorant italic, gold)                                   |
|                                                                    |
|        Create an invitation                                       |
|        your guests will treasure.                                 |
|        (Playfair Display, 4.5rem, cream)                          |
|                                                                    |
|        Join hundreds of couples...                                |
|        (Inter, muted cream)                                       |
|                                                                    |
|        [Create Your Invitation]                                   |
|        (Crimson CTA with shimmer)                                 |
|                                                                    |
|        Free to start. No credit card.                             |
|                                                                    |
|  [Bottom gold hairline]                                           |
+------------------------------------------------------------------+
```

**Key differences from current**:
- The 囍 watermark is **25% larger** (30rem) and has a very slow **rotation animation** (0 to 360 degrees over 120s, infinite loop, linear) -- barely perceptible but adds subtle life
- CTA button has an **enhanced shimmer** -- a gold highlight sweeps across the button every 4 seconds (without needing hover)
- The section title reveals via **SplitText word-by-word** animation with 0.08s stagger, each word sliding up from 30px below
- A set of **floating gold particles** (6-8 tiny dots, 2-4px, very low opacity 5-8%) drift upward slowly in the background using GSAP random motion -- creates a "magical" atmosphere
- The crimson radial glow is intensified -- `rgba(196, 30, 58, 0.12)` (up from 0.08) -- for a more dramatic spotlight

### 3.8 Footer

**Layout**: Clean, minimal footer. Horizontal rule at top with gold gradient. Logo, tagline, navigation, and compliance in a tight vertical stack.

**Desktop Structure**:
```
+------------------------------------------------------------------+
|  [Gold gradient hairline]                                         |
|                                                                    |
|      DreamMoments                                                 |
|      AI-powered wedding invitations...                            |
|                                                                    |
|      Privacy | Terms                                              |
|                                                                    |
|      PDPA compliant for MY & SG                                   |
|                                                                    |
|  [Gold gradient hairline]                                         |
+------------------------------------------------------------------+
```

**Key differences from current**:
- "DreamMoments" wordmark uses **Playfair Display** at 1.75rem with `letter-spacing: 0.08em` -- feels like a luxury brand logotype
- Navigation links have a **magnetic hover** -- they move 2px toward the cursor on hover, with an underline that expands from center
- Footer links separated by a thin gold pipe `|` instead of gray
- PDPA compliance line uses extremely small text (0.6875rem) with 60% opacity -- present but not distracting
- Adding a subtle **gold ornamental flourish** (a simple SVG of two crossed lines with small dots) above the logo, very subtle, 30% opacity

---

## 4. Animations -- GSAP Strategy

### 4.1 Global Animation Infrastructure

**Libraries**:
- `gsap` (core) + `ScrollTrigger` + `SplitText` (premium plugins)
- `@studio-freight/lenis` for smooth scroll (replaces native scroll for buttery 60fps scrolling)

**Global Settings**:
```ts
gsap.defaults({
  ease: "power3.out",
  duration: 0.8
});

// Smooth scroll
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
});

// Connect Lenis to GSAP
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
```

### 4.2 Text Reveal Animations

**Hero Headline -- SplitText Char-by-Char**:
```ts
const heroSplit = new SplitText(".hero-headline", {
  type: "chars,words",
  charsClass: "char",
});

gsap.from(heroSplit.chars, {
  opacity: 0,
  y: 40,
  rotateX: -15,
  stagger: 0.02,
  duration: 1.0,
  ease: "power4.out",
  delay: 0.3,
});
```
Each character slides up and rotates slightly from below, creating a "rising from the page" effect. The stagger creates a wave that takes roughly 1.5s for the full headline to reveal.

**Section Headers -- SplitText Word-by-Word**:
```ts
ScrollTrigger.batch(".section-header", {
  onEnter: (elements) => {
    elements.forEach((el) => {
      const split = new SplitText(el, { type: "words" });
      gsap.from(split.words, {
        opacity: 0,
        y: 30,
        stagger: 0.06,
        duration: 0.7,
        ease: "power3.out",
      });
    });
  },
  start: "top 85%",
  once: true,
});
```

### 4.3 Scroll-Driven Animations

**Showcase Horizontal Scroll (The Signature Moment)**:
```ts
const showcase = document.querySelector(".showcase-section");
const track = document.querySelector(".showcase-track");
const cards = document.querySelectorAll(".showcase-card");

const totalScroll = track.scrollWidth - showcase.offsetWidth;

gsap.to(track, {
  x: -totalScroll,
  ease: "none",
  scrollTrigger: {
    trigger: showcase,
    pin: true,
    scrub: 1,
    start: "top top",
    end: () => `+=${totalScroll}`,
    snap: {
      snapTo: 1 / (cards.length - 1),
      duration: { min: 0.2, max: 0.4 },
      ease: "power2.inOut",
    },
    invalidateOnRefresh: true,
  },
});

// Parallax images inside cards
cards.forEach((card, i) => {
  const img = card.querySelector("img");
  gsap.to(img, {
    xPercent: -15,
    ease: "none",
    scrollTrigger: {
      trigger: showcase,
      start: "top top",
      end: () => `+=${totalScroll}`,
      scrub: 1,
    },
  });
});
```

**How It Works -- Sticky Header with Scrolling Content**:
```ts
ScrollTrigger.create({
  trigger: ".hiw-section",
  start: "top top",
  end: "bottom bottom",
  pin: ".hiw-header",
  pinSpacing: false,
});
```

**Features Mockup -- 3D Perspective Tilt on Scroll**:
```ts
gsap.to(".features-mockup", {
  rotateY: 8,
  rotateX: -3,
  scrollTrigger: {
    trigger: ".features-section",
    start: "top 80%",
    end: "bottom 20%",
    scrub: 1,
  },
});
```

### 4.4 Interactive Animations

**Magnetic CTA Buttons**:
```ts
function createMagneticButton(el: HTMLElement) {
  const bound = 40; // magnetic radius in px
  const strength = 0.3; // movement multiplier

  el.addEventListener("mousemove", (e) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(el, {
      x: x * strength,
      y: y * strength,
      duration: 0.3,
      ease: "power2.out",
    });
  });

  el.addEventListener("mouseleave", () => {
    gsap.to(el, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: "elastic.out(1, 0.4)",
    });
  });
}

document.querySelectorAll(".dm-cta-primary, .dm-cta-secondary")
  .forEach(createMagneticButton);
```
The button snaps back with an elastic ease on mouse leave -- satisfying, playful, luxurious.

**Hero Template Card -- 3D Tilt on Mouse**:
```ts
const card = document.querySelector(".hero-template-card");

card.addEventListener("mousemove", (e) => {
  const rect = card.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width - 0.5;
  const y = (e.clientY - rect.top) / rect.height - 0.5;

  gsap.to(card, {
    rotateY: x * 16, // max 8 degrees each side
    rotateX: -y * 12, // max 6 degrees each side
    duration: 0.4,
    ease: "power2.out",
    transformPerspective: 800,
  });
});

card.addEventListener("mouseleave", () => {
  gsap.to(card, {
    rotateY: 0,
    rotateX: 0,
    duration: 0.8,
    ease: "elastic.out(1, 0.5)",
  });
});
```

### 4.5 Micro-Animations

| Element | Animation | Trigger | Duration | Easing |
|---------|-----------|---------|----------|--------|
| Gold ornamental rules | Width from 0% to 100% | Scroll into view | 1.2s | `power2.inOut` |
| Feature icon circles | Scale 0 -> 1 with rotation 90deg -> 0 | Staggered scroll reveal | 0.6s | `back.out(1.5)` |
| Stats counter | CountUp from 0 | Scroll into view | 1.5s | `power2.out` |
| Timeline step gold border | Height 0 -> 100% | Each step scroll-in | 0.8s | `power2.out` |
| CTA shimmer sweep | Gold highlight left -> right | Every 4s (auto) | 0.6s | `power1.inOut` |
| Floating gold particles | Random y drift upward | Continuous | 8-12s loop | `sine.inOut` |
| 囍 watermark rotation | 0deg -> 360deg | Continuous | 120s | `linear` |
| Template badge pulse | Scale 1.0 -> 1.02 -> 1.0 | Continuous | 3s | `sine.inOut` |
| Progress dots (showcase) | Opacity 0.3 -> 1 | Synced with horizontal scroll | N/A | `none` |

### 4.6 Easing Reference

| Name | Value | Usage |
|------|-------|-------|
| Default | `power3.out` | Most entrance animations |
| Dramatic | `power4.out` | Hero text reveal, hero CTA |
| Smooth | `power2.inOut` | Horizontal scroll snaps, ornamental rules |
| Springy | `elastic.out(1, 0.4)` | Magnetic button release, card tilt release |
| Bouncy | `back.out(1.5)` | Icon reveals, badge entrances |
| Linear | `none` or `linear` | Scroll-scrubbed animations, watermark rotation |

---

## 5. Key Differentiators from Current Design

### What the current design does safely (and boringly)

1. **Uniform fade-up animations** -- every element fades up 24px with the same timing. No variety, no drama.
2. **Conservative type scale** -- hero tops out at 5rem (80px). Looks like a SaaS landing page, not a luxury brand.
3. **Static grid layout for templates** -- 4 equal columns. Functional but forgettable.
4. **Motion library only** -- Framer Motion is excellent for UI, but it lacks GSAP's scroll-pinning, horizontal scroll, and SplitText capabilities.
5. **Muted color palette** -- the crimson exists but is used sparingly. The page feels beige.
6. **No interactive moments** -- nothing responds to the cursor. The page is passive.

### What Cinematic Luxury changes

1. **Typographic drama** -- the hero headline at 8.5rem (136px on desktop) makes an immediate, unforgettable first impression. You feel the confidence of the brand.
2. **Horizontal scroll-jacking showcase** -- this is the Awwwards-winning moment. Pinning the section and scrolling templates horizontally with parallax images creates a gallery experience that feels premium and curated.
3. **Interactive cursor responses** -- magnetic buttons, 3D tilt cards, and cursor-following effects make the page feel alive. The user is a participant, not just a viewer.
4. **SplitText character animations** -- text that reveals character by character feels editorial and cinematic, like a movie title sequence.
5. **GSAP ScrollTrigger ecosystem** -- scrubbed animations tied to scroll position feel inevitable and controlled, unlike simple intersection observer triggers.
6. **Dramatic contrast** -- bold crimson and rich gold against warm whites creates the kind of contrast that photographs well (important for social sharing and Awwwards screenshots).
7. **Asymmetric layouts** -- the How It Works sticky split layout and the overall rhythm of narrow/wide sections creates visual variety.
8. **Cinematic details** -- letterboxing bars, film-grain overlay, radial glows, floating particles. Each is subtle alone, but together they create atmosphere.

---

## 6. Visual Hierarchy -- Eye Flow

### Full-Page Eye Flow (Desktop)

```
1. HERO: Eye enters at the massive headline (largest element on page)
   -> scans right to template preview card
   -> returns left to CTA button (crimson = highest contrast)

2. SOCIAL PROOF: Eye catches gold ornamental rule (contrast break)
   -> pulled to large crimson stat numbers (500+, 4.9/5, < 3 min)
   -> settles on italic testimonial for emotional resonance

3. SHOWCASE: Section header reveals via SplitText (movement draws eye)
   -> horizontal scroll activates, eye follows card motion
   -> each template card is a full focal point -- no competition
   -> progress dots anchor the eye to the bottom for context

4. HOW IT WORKS: Sticky header on left anchors context
   -> eye follows the timeline down the right side
   -> oversized crimson step numbers "01, 02..." provide rhythm
   -> gold border animation on each card draws sequential attention

5. FEATURES: Eye enters at section header
   -> scans feature list on left (icon + text pairs)
   -> 3D-tilted mockup on right provides visual reward

6. PRICING: Gold background shift signals "pay attention"
   -> premium card is larger, has glow, gold top bar -- eye goes there
   -> price in Playfair Display 72px is unmissable
   -> CTA button is the final anchor

7. FINAL CTA: Dark background = dramatic contrast shift
   -> eye centers on the large headline (cream on dark)
   -> 囍 watermark adds cultural depth subconsciously
   -> CTA button with auto-shimmer is the final action point

8. FOOTER: Minimal, functional, ego-less. Eye rests.
```

### Section-Level Hierarchy Rules

1. **F-pattern for text-heavy sections** (Hero, Features): Primary content top-left, visual element right.
2. **Center-axis for emotional sections** (Social Proof, Final CTA): Everything centered for intimacy and focus.
3. **Horizontal scan for gallery sections** (Showcase): The scroll direction itself creates the hierarchy -- first card is the default focus.
4. **Z-pattern for comparison sections** (Pricing): Eye zigzags between free and premium, with premium winning by visual weight.

---

## 7. Mobile Adaptation

### Philosophy

Mobile is not a lesser version. It is a focused, touch-optimized experience. Every desktop "wow moment" either translates to mobile or is replaced with an equally impressive mobile-native alternative.

### Hero Section

| Desktop | Mobile |
|---------|--------|
| Split layout (55/45) | Stacked vertical: headline, then template card |
| 8.5rem headline | `clamp(4rem, 10vw + 1rem, 8.5rem)` scales down to ~4rem (64px) -- still bold |
| 3D tilt on mouse move | Disabled -- static card with subtle floating shadow animation |
| Magnetic CTA buttons | Disabled -- standard touch interaction with active state scale(0.97) |
| Cinematic letterboxing | Removed -- full-bleed on mobile |
| SplitText char reveal | Simplified to word-by-word reveal (fewer DOM elements, better performance) |

### Social Proof

| Desktop | Mobile |
|---------|--------|
| 3-column stats | Stacked vertical with horizontal gold rules between each |
| Counter animation | Preserved -- works well on mobile |
| Typewriter testimonial | Simplified to standard fade-in |

### Showcase (Horizontal Scroll)

| Desktop | Mobile |
|---------|--------|
| ScrollTrigger pinned horizontal scroll | **Native horizontal swipe carousel** with CSS `scroll-snap-type: x mandatory` |
| GSAP-driven parallax inside cards | Disabled -- standard image display |
| Progress dots with scroll sync | Dots still present, synced via `IntersectionObserver` |
| Cards at 70vh height | Cards at 60vh height, full viewport width minus 32px padding |
| Scrub animations | Replaced with `scroll-snap` for native momentum |

**Critical**: On mobile, we do NOT use GSAP scroll-jacking. Native touch scroll with `scroll-snap` is always more reliable and accessible. The cards become a swipeable horizontal carousel with snap points.

### How It Works

| Desktop | Mobile |
|---------|--------|
| Sticky split layout (40/60) | Standard stacked layout -- header, then timeline |
| Sticky pinned header | Header scrolls normally with content |
| Asymmetric grid | Full-width single column |
| 3rem step numbers | 2rem step numbers, still crimson and bold |
| Gold border reveal animation | Preserved |

### Features

| Desktop | Mobile |
|---------|--------|
| Split layout with mockup | Stacked: features first, mockup second |
| 3D perspective tilt mockup | Static mockup with fade-in on scroll |
| Feature rows with animated accent lines | Preserved -- accent lines still animate |

### Pricing

| Desktop | Mobile |
|---------|--------|
| Side-by-side cards | Stacked vertically, premium card first (most important) |
| Premium card is 15% taller | Premium card has gold top gradient bar and glow -- height same |
| Price counter animation | Preserved |

### Final CTA

| Desktop | Mobile |
|---------|--------|
| 30rem 囍 watermark | Scaled to 15rem (still impactful) |
| Floating gold particles | Reduced to 3 particles (performance) |
| SplitText word reveal | Simplified fade-in |
| Auto-shimmer CTA | Preserved |

### Global Mobile Rules

1. **All GSAP ScrollTrigger pinning is disabled** below 768px. Pinning can conflict with mobile address bar resize behavior and feels unnatural on touch.
2. **Magnetic/tilt effects are disabled** below 1024px. These require `pointer: fine` and are inappropriate for touch.
3. **SplitText animations are simplified** on mobile. Word-level instead of char-level to reduce DOM node count.
4. **Lenis smooth scroll is disabled** on iOS. iOS has excellent native momentum scrolling; overriding it feels wrong.
5. **Touch interactions**: All interactive elements have `:active` states with `scale(0.97)` for tactile feedback.
6. **Performance**: Use `will-change: transform` sparingly. Remove it via `onComplete` callbacks. Limit concurrent animations to 3 on mobile.

---

## 8. Wow Moments

### Wow Moment #1: The Showcase Horizontal Scroll Gallery

**What happens**: As the user scrolls past the "The Collection" header, the entire section locks to the viewport. Continued vertical scrolling moves the template cards horizontally through the frame, each one filling nearly the full viewport height. Inside each card, the photograph moves at a slower parallax rate, creating a sense of depth. Snap points ensure each card settles cleanly in the center. A progress indicator at the bottom tracks position.

**Why it wins Awwwards**: Horizontal scroll-jacking done right (with snapping, parallax, and appropriate scroll distance) is consistently cited as a hallmark of award-winning sites. It transforms a simple "here are our templates" section into a gallery experience -- like walking through an exhibition. The parallax inside the cards adds the "extra mile" detail that separates SOTD from honorable mention.

**Technical detail**: The scroll distance equals `(numberOfCards - 1) * cardWidth`, with `scrub: 1` for smooth scrub and snap duration of 0.2-0.4s. The section automatically unpins when the last card is fully visible.

### Wow Moment #2: The Hero SplitText Reveal with 3D Card Tilt

**What happens**: On page load, the hero headline characters rise up from below with a slight 3D rotation, staggered 0.02s apart, creating a wave that takes ~1.5s to complete. Simultaneously, the template preview card fades in with a subtle scale-up. Once revealed, the card responds to cursor movement with real-time 3D perspective tilt (max 8 degrees), making it feel like a physical card floating in space. The CTA buttons below have a magnetic effect that pulls them toward the cursor.

**Why it wins Awwwards**: The combination of cinematic text reveal + interactive 3D element + magnetic buttons in a single viewport creates a "playground" feel. Judges look for: (a) typography as a design element, (b) interactive responses to cursor, (c) polish in transitions. This hero delivers all three.

**Technical detail**: SplitText uses `type: "chars,words"` for the headline. The 3D tilt uses `transformPerspective: 800` for realistic depth. Mouse events calculate normalized position (-0.5 to 0.5) relative to the card bounds.

### Wow Moment #3: The Final CTA Gold Particle Atmosphere

**What happens**: When the user reaches the final CTA (dark background section), 6-8 tiny gold dots (2-4px) drift slowly upward across the section, fading in and out with staggered timing. The 囍 watermark rotates imperceptibly behind the text. The CTA button has an automated gold shimmer that sweeps across every 4 seconds. Combined with the SplitText word reveal, the section feels alive and magical -- like stepping into a room where something special is about to happen.

**Why it wins Awwwards**: This is about atmosphere. Most landing pages end with a boring "sign up now" block. This section creates emotional resonance through subtle, ambient animation that doesn't demand attention but rewards it. The gold particles + dark background + cultural watermark create a sense of occasion. The auto-shimmer CTA constantly draws the eye without being obnoxious.

**Technical detail**: Particles use `gsap.to()` with `repeat: -1`, `yoyo: true`, randomized `y` range (-100 to -300px), and staggered `delay` values. Each particle also has a random horizontal drift (`x: gsap.utils.random(-20, 20)`).

---

## 9. Component Architecture

### New Components (React)

```
src/components/landing/
  +-- Hero.tsx                   # EXISTING -- refactored
  +-- SocialProof.tsx            # EXISTING -- refactored
  +-- Showcase.tsx               # EXISTING -- MAJOR refactor (horizontal scroll)
  +-- HowItWorks.tsx             # EXISTING -- refactored (sticky split)
  +-- Features.tsx               # EXISTING -- refactored (3D mockup)
  +-- Pricing.tsx                # EXISTING -- refactored (gold accents)
  +-- FinalCTA.tsx               # EXISTING -- refactored (particles)
  +-- Footer.tsx                 # EXISTING -- minor updates
  +-- animation.ts               # EXISTING -- replaced with GSAP config

  +-- hooks/
  |   +-- useGSAP.ts             # NEW: GSAP + ScrollTrigger initialization, cleanup
  |   +-- useSmoothScroll.ts     # NEW: Lenis smooth scroll setup
  |   +-- useMagneticEffect.ts   # NEW: Magnetic cursor effect for buttons/links
  |   +-- use3DTilt.ts           # NEW: 3D perspective tilt for cards/mockups
  |   +-- useSplitText.ts        # NEW: SplitText text reveal wrapper
  |   +-- useCountUp.ts          # NEW: Number counter animation
  |   +-- useReducedMotion.ts    # EXISTING concept -- integrated into all hooks

  +-- ui/
  |   +-- GoldRule.tsx           # NEW: Ornamental gold gradient horizontal rule
  |   +-- SplitTextReveal.tsx    # NEW: Reusable SplitText component
  |   +-- MagneticButton.tsx     # NEW: Button wrapper with magnetic effect
  |   +-- ParallaxImage.tsx      # NEW: Image with scroll-driven parallax
  |   +-- FloatingParticles.tsx  # NEW: Gold particle ambient effect
  |   +-- ProgressDots.tsx       # NEW: Horizontal scroll progress indicator
  |   +-- CountUpNumber.tsx      # NEW: Animated number counter
```

### Hook Architecture

Each animation hook follows the pattern:
```tsx
function useGSAPAnimation(ref: RefObject<HTMLElement>, options: AnimOptions) {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion || !ref.current) return;

    const ctx = gsap.context(() => {
      // GSAP animation code
    }, ref.current);

    return () => ctx.revert(); // cleanup
  }, [ref, prefersReducedMotion]);
}
```

**Critical pattern**: All GSAP animations wrapped in `gsap.context()` for automatic cleanup. All hooks check `prefers-reduced-motion` before creating any animation. This is non-negotiable for accessibility.

### State Management

- **No global animation state needed** -- all animations are self-contained in their hooks/components
- **Scroll position** is managed by ScrollTrigger internally (no React state needed)
- **Lenis instance** is created once at the layout level and passed via context if child components need programmatic scrolling

### Migration Strategy from Current Code

1. Replace `motion/react` (Framer Motion) with GSAP for scroll-driven animations
2. Keep `motion/react` for simple entrance animations where GSAP is overkill (e.g., simple fade-ins that don't need scroll scrubbing)
3. Current `animation.ts` constants are replaced by GSAP defaults and hook-specific configs
4. Current `sectionReveal`, `childReveal`, `containerReveal` variants are replaced by GSAP `ScrollTrigger.batch()` calls
5. Framer Motion `useScroll` in HowItWorks is replaced by GSAP `ScrollTrigger` with `scrub`

### Performance Considerations

1. **GSAP plugins are loaded via dynamic import** -- SplitText and ScrollTrigger are code-split to avoid blocking initial paint
2. **All scroll-driven animations use `scrub`** -- no requestAnimationFrame loops outside GSAP's internal ticker
3. **`will-change: transform`** is applied only during animation via GSAP's `force3D: true` and removed on complete
4. **Image loading**: Showcase card images use `loading="lazy"` except for the first visible card
5. **Mobile GSAP budget**: Max 3 concurrent ScrollTrigger instances on mobile (Hero reveal, stats counter, CTA reveal)

---

## Summary

The "Cinematic Luxury" direction transforms DreamMoments from a clean but forgettable SaaS page into a bold editorial experience that communicates the same premium feeling couples want for their wedding. The key moves are:

1. **Oversized Playfair Display typography** that makes the hero feel like a magazine spread
2. **GSAP-powered horizontal scroll showcase** that turns template browsing into a gallery walk
3. **Interactive cursor effects** (magnetic buttons, 3D card tilt) that make the page feel alive
4. **Bold crimson/gold color story** with dramatic contrast against warm whites
5. **SplitText character reveals** that feel cinematic and editorial
6. **Atmospheric details** (grain, particles, radial glows, ornamental rules) that build luxury

Every desktop effect degrades gracefully on mobile. Every animation respects `prefers-reduced-motion`. The architecture maps cleanly to React hooks and components.

This is not a subtle evolution of the current design. It is a confident step into luxury territory -- the kind of page that makes couples think "if their landing page looks this good, imagine what our invitation will look like."
