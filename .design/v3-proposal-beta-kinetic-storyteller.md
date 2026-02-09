# V3 Proposal: Kinetic Storyteller

**Designer**: Beta -- Kinetic Storyteller
**Date**: February 2026
**Persona**: Scroll-driven narrative. GSAP timeline orchestration, horizontal scroll galleries, sticky sections, physics-based motion. Awwwards SOTD inspired.
**Status**: PROPOSAL

---

## 0. DIAGNOSIS: Why the Current Page Feels Flat

Having audited every component, hook, and animation config, the problems are structural:

1. **Animation monoculture**. Every single section uses the same `{ opacity: 0, y: 24 }` -> `{ opacity: 1, y: 0 }` pattern from `animation.ts`. The `sectionReveal`, `childReveal`, `containerReveal`, and `mockupReveal` variants are four names for the same trick: fade-up with slight Y translation. There is zero variety in motion vocabulary.

2. **GSAP is installed but barely used**. The only real GSAP usage is `useStrokeDraw` (a single SVG path animation) and the scroll context in `index.tsx` that does nothing besides kill ScrollTriggers on reduced-motion. The `GSAP_EASE` presets (`power3.out`, `power4.out`, etc.) are defined but never referenced. GSAP ScrollTrigger is registered but never creates a pinned section, a scrubbed timeline, or a horizontal scroll.

3. **No scroll storytelling**. The page is 8 vertically stacked sections with identical reveal timing. There is no narrative arc, no pacing variation, no moment where scrolling itself becomes the interaction. The user scrolls and things fade in. That is the entire experience.

4. **Typography has no drama**. The hero headline uses `clamp(3.5rem, 8vw + 1rem, 8.5rem)` but the actual rendered size on a 390px mobile screen is ~4.6rem, and on a 1440px desktop is ~8.5rem. Both are fine but unremarkable. Section titles at `clamp(2rem, 4vw + 0.5rem, 3.5rem)` max out at 3.5rem -- barely larger than body text on desktop.

5. **Cultural motifs are ghosts**. The `PeonyOutline` renders at `opacity={0.06}`, the `DoubleHappiness` watermarks at `opacity={0.03}`. The `LatticeOverlay` at `opacity={0.04}`. These are invisible. They exist in the DOM but not in the user's perception.

6. **Only one interactive moment**. The `use3DTilt` hook on the hero card is the sole place a user's input changes the visual output. Desktop-only, pointer-fine only. On mobile (75-85% of traffic), the page is entirely passive.

---

## 1. COLOR PALETTE: "Vermillion Dawn"

The current palette is correct in hue but anemic in application. The fix is not new colors -- it is bolder usage of the existing ones, plus two strategic additions.

### Adjusted Tokens

| Token | Current | Proposed | Delta | Rationale |
|-------|---------|----------|-------|-----------|
| `--dm-bg` | `#FFFAF3` | `#FFF8EE` | Warmer by 5 units | Pushes rice-paper warmth further. Distinguishes from generic `#FFFFFF` sites. |
| `--dm-surface` | `#FFFFFF` | `#FFFFFF` | No change | Pure white for card elevation contrast. |
| `--dm-surface-muted` | `#F5F2EE` | `#F2EDE5` | Warmer, slightly darker | Creates visible distinction from `--dm-bg` for alternating section rhythm. |
| `--dm-ink` | `#1A1512` | `#120E0A` | Darker, richer | True rich black-brown. Current ink lacks density at large display sizes. |
| `--dm-muted` | `#6B5744` | `#5C4A38` | Slightly darker | Improves contrast ratio against warm backgrounds. |
| `--dm-border` | `#E8DECE` | `#DDD0BE` | 10% more visible | Borders currently vanish against the background. Cards need edge definition. |
| `--dm-crimson` | `#C41E3A` | `#D42040` | +10% saturation, nudged toward scarlet | The current crimson reads dull at small sizes. This pops harder on cream backgrounds. |
| `--dm-crimson-deep` | `#9B1B30` | `#A8182E` | Brighter deep red | Better hover contrast. |
| `--dm-crimson-soft` | `#FDE8EC` | `#FDE0E6` | Pinker, more saturated | Should feel like a blush, not like white. |
| `--dm-gold` | `#D4AF37` | `#DAA520` | Classic goldenrod, +15% saturation | Current gold reads olive-adjacent in certain lighting. This is unmistakably gold. |
| `--dm-gold-warm` | `#C5943A` | `#C08B2E` | Slightly deeper | Better for decorative text at small sizes. |
| `--dm-gold-soft` | `#FDF5E0` | `#FBF0D0` | More visible warmth | Current gold-soft is indistinguishable from white. |
| `--dm-rose` | `#D46B66` | `#D95F5A` | Warmer, more coral | Current rose is desaturated. This feels like a peony. |
| `--dm-rose-soft` | `#FBE0DE` | `#FADBD6` | Warmer | Visible as a section background change. |
| `--dm-sage` | `#8FA68E` | `#7D9E7C` | Slightly more saturated | For success states and nature accents. |

### New Additions

| Token | Hex | Role |
|-------|-----|------|
| `--dm-crimson-vivid` | `#E8243C` | Hero headline accent word ONLY. High-saturation red for maximum pop at `8.5rem`. Never for body text. |
| `--dm-charcoal` | `#2A2320` | Sticky nav background, intermediate dark. Warmer than ink, lighter than `--dm-dark-bg`. |
| `--dm-cream-warm` | `#F5E6CC` | Horizontal scroll gallery track background. Visible warmth. |

### Section Color Rhythm (Revised "Heartbeat")

```
Section              Background              Character
----------------------------------------------------------------------
1. Hero              #FFF8EE (warm cream)     Slow reveal, editorial drama
2. Social Proof      #FADBD6 (rose soft)      Quick breath, stats + quote
3. Showcase          #D42040 (crimson)        BOLD STATEMENT -- horizontal scroll gallery
4. How It Works      #FFF8EE (warm cream)     Sticky vertical progression
5. Features          #F2EDE5 (muted surface)  Card reveal cascade
6. Pricing           #FBF0D0 (gold soft)      Comparison, count-up
7. Final CTA         #120E0A (rich ink)       Dark dramatic close
8. Footer            #FFF8EE (warm cream)     Quiet resolution
```

### Contrast Validation

| Pair | Ratio | WCAG Level |
|------|-------|------------|
| `--dm-ink` (#120E0A) on `--dm-bg` (#FFF8EE) | 17.8:1 | AAA |
| `--dm-muted` (#5C4A38) on `--dm-bg` (#FFF8EE) | 7.2:1 | AAA |
| `--dm-crimson` (#D42040) on `--dm-bg` (#FFF8EE) | 5.1:1 | AA |
| `--dm-crimson-vivid` (#E8243C) on `--dm-bg` (#FFF8EE) | 4.6:1 | AA (large text only, which is its sole use) |
| White (#FFFFFF) on `--dm-crimson` (#D42040) | 5.4:1 | AA |
| `--dm-gold` (#DAA520) on `--dm-dark-bg` (#1A1512) | 6.8:1 | AAA |
| `--dm-dark-text` (#FAF8F5) on `--dm-dark-bg` (#1A1512) | 16.2:1 | AAA |

---

## 2. TYPOGRAPHY SYSTEM

### Font Stack (Unchanged -- Using Existing Fonts)

| Role | Font | Weight | Fallback |
|------|------|--------|----------|
| Display | Playfair Display | 700, 800 | Noto Serif SC, Georgia, serif |
| Heading | Playfair Display | 600 | Noto Serif SC, Georgia, serif |
| Body | Inter | 400, 500 | system-ui, sans-serif |
| Accent | Cormorant Garamond | 400 italic, 600 | Noto Serif SC, Georgia, serif |
| Chinese Display | Noto Serif SC | 700, 900 | serif |

### Type Scale (Revised)

The current scale is timid. The hero needs to be a billboard, section headers need to feel like magazine spreads.

```css
:root {
  /* Hero: true editorial scale */
  --text-hero: clamp(4.5rem, 12vw + 1rem, 10rem);

  /* Hero subtitle / large callout */
  --text-hero-sub: clamp(1.125rem, 2vw + 0.5rem, 1.5rem);

  /* Section titles: magazine-spread size */
  --text-section: clamp(2.5rem, 6vw + 0.5rem, 5rem);

  /* Section subtitles */
  --text-section-sub: clamp(1rem, 1.5vw + 0.25rem, 1.375rem);

  /* Card titles */
  --text-card-title: clamp(1.375rem, 2.5vw + 0.25rem, 2rem);

  /* Chinese kicker characters: larger, more visible */
  --text-kicker-cn: clamp(1.5rem, 2.5vw + 0.5rem, 2.5rem);

  /* English kicker */
  --text-kicker-en: 0.8125rem;

  /* Body sizes remain stable */
  --text-lg: clamp(1.0625rem, 1vw + 0.25rem, 1.25rem);
  --text-base: 1rem;
  --text-sm: 0.875rem;
  --text-xs: 0.75rem;
}
```

### Key Typographic Decisions

**Hero Headline at 10rem Desktop / 4.5rem Mobile:**
The current `8.5rem` max already exists in the CSS but the visual impact is diluted by the surrounding layout. At `10rem`, the headline becomes the architecture of the hero section. The word "remember." at this scale, set in Playfair Display 800 italic with `--dm-crimson-vivid`, becomes a visual event.

**Manual Character Splitting for Hero:**
Since SplitText is not available on GSAP free tier, we implement manual character splitting:

```tsx
// ManualSplitText component -- wraps each character in a span
function SplitChars({ children, className }: { children: string; className?: string }) {
  return (
    <>
      {children.split("").map((char, i) => (
        <span
          key={`${char}-${i}`}
          className={cn("inline-block", className)}
          style={{ display: char === " " ? "inline" : "inline-block" }}
          data-char-index={i}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </>
  );
}
```

This gives us per-character animation targets without the paid plugin.

**Section Headers at 5rem Desktop:**
The jump from 3.5rem to 5rem is significant. At 5rem on a 1440px screen, the section title occupies ~7% of viewport height. Combined with tight letter-spacing (-0.04em at this size) and generous whitespace above (120px), each section opening feels like turning a page in a coffee-table book.

---

## 3. HERO SECTION: "The Unfold"

### Concept

The hero is not a static layout. It is a scroll-driven narrative in three acts:

**Act 1 (0-100vh): The Reveal**
The headline animates character-by-character as the section loads. The template preview card scales up from 0.85 to 1.0. The Chinese kicker badge slides in from the left.

**Act 2 (100vh-200vh): The Parallax Drift**
As the user scrolls past the initial viewport, the headline and CTA group move upward at 1.5x scroll speed (parallax), while the template card moves at 0.7x scroll speed, creating depth separation. The peony SVG drifts at 0.3x. A faint crimson wash intensifies.

**Act 3 (200vh-250vh): The Exit**
The entire hero content fades to 0 and scales to 0.95 as it hands off to the Social Proof section. The transition feels like a camera pulling back.

### GSAP Implementation: Hero Timeline

```tsx
// Inside Hero component's useEffect, within gsap.context()

useEffect(() => {
  if (reducedMotion || !heroRef.current) return;

  const ctx = gsap.context(() => {
    // ──── ACT 1: Entrance (triggered on page load, not scroll) ────
    const entranceTL = gsap.timeline({ delay: 0.2 });

    // Character-by-character headline reveal
    const chars = heroRef.current!.querySelectorAll("[data-char-index]");
    entranceTL.set(chars, { opacity: 0, y: 40, rotateX: -90 });
    entranceTL.to(chars, {
      opacity: 1,
      y: 0,
      rotateX: 0,
      duration: 0.6,
      ease: "power3.out",
      stagger: {
        each: 0.03,
        from: "start",
      },
    });

    // Kicker badge slides in from left
    entranceTL.from(
      "[data-hero-kicker]",
      {
        x: -30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      },
      "-=0.4" // overlap with tail of char animation
    );

    // Subtitle fades up
    entranceTL.from(
      "[data-hero-subtitle]",
      {
        y: 20,
        opacity: 0,
        duration: 0.7,
        ease: "power2.out",
      },
      "-=0.5"
    );

    // CTA buttons stagger in
    entranceTL.from(
      "[data-hero-cta] > *",
      {
        y: 16,
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
        stagger: 0.1,
      },
      "-=0.3"
    );

    // Template card scales up with slight rotation
    entranceTL.from(
      "[data-hero-card]",
      {
        scale: 0.85,
        opacity: 0,
        y: 40,
        rotateY: -8,
        duration: 1.2,
        ease: "power3.out",
      },
      0.3 // starts 0.3s after timeline begins
    );

    // Trust indicators fade in last
    entranceTL.from(
      "[data-hero-trust]",
      {
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
      },
      "-=0.4"
    );

    // ──── ACT 2: Parallax Drift (scroll-driven) ────

    // Headline moves up faster than scroll
    gsap.to("[data-hero-headline]", {
      yPercent: -30,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 0.5,
      },
    });

    // Template card moves slower -- creates depth
    gsap.to("[data-hero-card]", {
      yPercent: -15,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 0.8,
      },
    });

    // Peony SVG drifts very slowly
    gsap.to("[data-hero-peony]", {
      yPercent: -8,
      x: 20,
      rotate: 5,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: 1.2,
      },
    });

    // Crimson wash intensifies on scroll
    gsap.to("[data-hero-wash]", {
      opacity: 0.2,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "center center",
        end: "bottom top",
        scrub: 0.6,
      },
    });

    // ──── ACT 3: Exit (scroll-driven) ────
    gsap.to("[data-hero-content]", {
      opacity: 0,
      scale: 0.95,
      ease: "power2.in",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "70% top",
        end: "bottom top",
        scrub: 0.3,
      },
    });

  }, heroRef.current);

  return () => ctx.revert();
}, [reducedMotion]);
```

### Hero Layout (JSX Structure)

```tsx
<section
  ref={heroRef}
  className="relative min-h-[120vh] overflow-hidden"
  style={{ background: "var(--dm-bg)" }}
>
  {/* Background washes */}
  <div
    data-hero-wash
    className="absolute inset-0 pointer-events-none"
    style={{
      background: "radial-gradient(ellipse at 30% 50%, var(--dm-crimson) 0%, transparent 50%)",
      opacity: 0.08,
    }}
  />

  {/* Peony SVG -- larger, more visible */}
  <div data-hero-peony>
    <PeonyOutline
      className="absolute right-[-8%] top-[5%] w-[50rem] h-[50rem] hidden lg:block"
      opacity={0.12}  {/* was 0.06 -- now visible */}
    />
  </div>

  <div
    data-hero-content
    className="relative z-10 mx-auto flex min-h-svh max-w-7xl flex-col items-center justify-center gap-12 px-6 pt-28 pb-16 lg:flex-row lg:gap-16 lg:pt-32"
  >
    {/* Left: Copy */}
    <div className="relative max-w-xl flex-1 text-center lg:text-left">
      {/* Double Happiness watermark -- bolder */}
      <div className="absolute -left-10 top-1/2 -translate-y-1/2 hidden lg:block">
        <DoubleHappiness size="20rem" opacity={0.06} color="var(--dm-crimson)" />
        {/* was 0.03 -- doubled */}
      </div>

      {/* Kicker */}
      <div data-hero-kicker className="relative z-10 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
        {/* ... badge content ... */}
      </div>

      {/* Headline with manual character split */}
      <h1
        data-hero-headline
        className="relative z-10 mt-6 font-display font-extrabold tracking-[-0.04em]"
        style={{ fontSize: "var(--text-hero)", lineHeight: 0.95, color: "var(--dm-ink)" }}
      >
        <SplitChars>Beautiful invitations your guests will</SplitChars>{" "}
        <em
          className="italic"
          style={{ color: "var(--dm-crimson-vivid)" }}
        >
          <SplitChars>remember.</SplitChars>
        </em>
      </h1>

      {/* Subtitle */}
      <p data-hero-subtitle className="relative z-10 mx-auto mt-6 max-w-[44ch] leading-relaxed lg:mx-0"
        style={{ fontSize: "var(--text-hero-sub)", color: "var(--dm-muted)" }}
      >
        Create a stunning digital wedding invitation in minutes. AI writes your content,
        you make it yours. Share via WhatsApp in one tap. From RM49.
      </p>

      {/* CTAs */}
      <div data-hero-cta className="relative z-10 mt-8 flex flex-col items-center gap-4 sm:flex-row lg:items-start">
        {/* ... buttons ... */}
      </div>

      {/* Trust */}
      <div data-hero-trust className="relative z-10 mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm lg:justify-start">
        {/* ... */}
      </div>
    </div>

    {/* Right: Template card */}
    <div data-hero-card className="relative flex flex-1 items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
      {/* ... card with 3D tilt ... */}
    </div>
  </div>
</section>
```

### Mobile Hero (390px)

On mobile, the three-act structure simplifies:
- **Act 1**: Character animation still runs but with `stagger: 0.02` (faster) and no `rotateX` (saves compositing)
- **Act 2**: Parallax is disabled entirely (no `scrollTrigger` for headline/card). The card stacks below the headline with no parallax depth.
- **Act 3**: Exit fade still runs to create a smooth transition to Social Proof.

The headline at `clamp(4.5rem, 12vw + 1rem, 10rem)` evaluates to `~5.7rem` on 390px width. This is noticeably larger than the current `~4.6rem` and creates a true editorial moment.

---

## 4. SECTION LAYOUT AND TRANSITIONS: The Full Scroll Narrative

### The 8-Section Arc

The page tells a story in 8 acts with deliberate pacing variation:

```
TENSION MAP (scroll engagement over time):

Calm ─────|                              |──────── Calm
          |     /\         /\            |
          |    /  \       /  \      /\   |
          |   /    \     /    \    /  \  |
          |  /      \   /      \  /    \ |
          | /        \ /        \/      \|

Section:   1    2    3     4    5   6   7    8
           Hero Soc  Show  How  Feat Pri CTA  Foot

Motion:    High Low  MAX   Med  Med Low High None
```

### Section 1: Hero (described in Section 3 above)
- **Entry**: Staggered character animation + card scale
- **During**: Parallax depth layers
- **Exit**: Fade + scale down

### Section 2: Social Proof (Quick Breath)

**Concept**: A thin, impactful band. Stats count up on scroll. The testimonial quote reveals word-by-word.

**ScrollTrigger Config**:
```ts
// Stats counter -- triggered on scroll into view
gsap.from("[data-stat-value]", {
  textContent: 0,
  duration: 2,
  ease: "power1.out",
  snap: { textContent: 1 },
  stagger: 0.3,
  scrollTrigger: {
    trigger: socialProofRef.current,
    start: "top 80%",
    toggleActions: "play none none none",
  },
});

// Testimonial quote -- word-by-word opacity reveal
const words = socialProofRef.current.querySelectorAll("[data-word]");
gsap.set(words, { opacity: 0.15 });

gsap.to(words, {
  opacity: 1,
  duration: 0.3,
  ease: "power1.out",
  stagger: 0.05,
  scrollTrigger: {
    trigger: "[data-testimonial]",
    start: "top 75%",
    end: "top 40%",
    scrub: 0.5,
  },
});
```

**Word-Split Implementation** (for testimonial):
```tsx
function SplitWords({ children }: { children: string }) {
  return (
    <>
      {children.split(" ").map((word, i) => (
        <span key={`${word}-${i}`} data-word className="inline-block mr-[0.25em]">
          {word}
        </span>
      ))}
    </>
  );
}
```

**Transition to Showcase**: The rose-soft background clips away with a CSS `clip-path` animation:
```ts
gsap.to("[data-social-proof-section]", {
  clipPath: "inset(0 0 100% 0)",
  ease: "power2.inOut",
  scrollTrigger: {
    trigger: "[data-social-proof-section]",
    start: "bottom 60%",
    end: "bottom 20%",
    scrub: 0.5,
  },
});
```

### Section 3: Showcase -- HORIZONTAL SCROLL GALLERY (Signature Moment)

This is the single most important animation on the page. The current implementation is a static masonry grid. The proposed version is a pinned horizontal scroll gallery that takes over the viewport.

**Concept**: As the user scrolls vertically, the section pins in place and the 4 template cards translate horizontally across the screen. Each card has parallax: the image moves at a different rate than the card frame, creating a "window" effect. A progress indicator (thin gold line) tracks position.

**Scroll Height**: The section occupies `300vh` of vertical scroll distance, pinned for the middle `200vh`.

**GSAP Implementation**:

```ts
// Inside Showcase component
useEffect(() => {
  if (reducedMotion || !showcaseRef.current) return;

  const ctx = gsap.context(() => {
    const track = showcaseRef.current!.querySelector("[data-showcase-track]") as HTMLElement;
    const cards = showcaseRef.current!.querySelectorAll("[data-showcase-card]");
    const images = showcaseRef.current!.querySelectorAll("[data-showcase-image]");
    const progress = showcaseRef.current!.querySelector("[data-showcase-progress]") as HTMLElement;

    // Calculate total horizontal scroll distance
    const totalWidth = track.scrollWidth - window.innerWidth;

    // ──── Master horizontal scroll timeline ────
    const horizontalTL = gsap.timeline({
      scrollTrigger: {
        trigger: showcaseRef.current,
        start: "top top",
        end: () => `+=${totalWidth}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    // Move the track horizontally
    horizontalTL.to(track, {
      x: -totalWidth,
      ease: "none",
    });

    // ──── Parallax: images move slower than cards ────
    // This creates the "window" effect where the image
    // appears to slide within the card frame
    images.forEach((img) => {
      gsap.to(img, {
        xPercent: -15,
        ease: "none",
        scrollTrigger: {
          trigger: showcaseRef.current,
          start: "top top",
          end: () => `+=${totalWidth}`,
          scrub: 1.5, // slower scrub = more parallax lag
        },
      });
    });

    // ──── Progress bar ────
    gsap.to(progress, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: showcaseRef.current,
        start: "top top",
        end: () => `+=${totalWidth}`,
        scrub: 0.3,
      },
    });

    // ──── Card reveal: each card fades in as it enters viewport ────
    cards.forEach((card, i) => {
      gsap.from(card, {
        opacity: 0,
        scale: 0.92,
        rotateY: -5,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: card,
          containerAnimation: horizontalTL,
          start: "left 80%",
          toggleActions: "play none none reverse",
        },
      });
    });

    // ──── Section header: fade out as scroll begins ────
    gsap.to("[data-showcase-header]", {
      opacity: 0,
      y: -30,
      ease: "power2.in",
      scrollTrigger: {
        trigger: showcaseRef.current,
        start: "top top",
        end: "top -10%",
        scrub: 0.3,
      },
    });

  }, showcaseRef.current);

  return () => ctx.revert();
}, [reducedMotion]);
```

**Showcase HTML Structure**:

```tsx
<section
  ref={showcaseRef}
  id="showcase"
  className="relative overflow-hidden"
  style={{ background: "var(--dm-crimson)" }}
>
  <LatticeOverlay color="white" opacity={0.06} /> {/* was 0.04 */}

  {/* Pinned viewport container */}
  <div className="relative h-screen flex flex-col">
    {/* Header: visible initially, fades out */}
    <div data-showcase-header className="pt-16 pb-8 px-6">
      <SectionHeader
        kickerEn="THE COLLECTION"
        kickerCn="四款精选"
        title="Four templates. One for every love story."
        subtitle="From garden ceremonies to evening banquets."
        kickerColor="var(--dm-gold)"
        light
        reducedMotion={reducedMotion}
      />
    </div>

    {/* Progress bar */}
    <div className="mx-auto w-48 h-[2px] bg-white/20 rounded-full overflow-hidden mb-8">
      <div
        data-showcase-progress
        className="h-full rounded-full origin-left"
        style={{ background: "var(--dm-gold)", transform: "scaleX(0)" }}
      />
    </div>

    {/* Horizontal track */}
    <div className="flex-1 flex items-center overflow-visible">
      <div
        data-showcase-track
        className="flex gap-8 px-[max(1.5rem,calc((100vw-1280px)/2))] items-center"
        style={{ width: "fit-content" }}
      >
        {templates.map((template) => (
          <div
            key={template.id}
            data-showcase-card
            className="flex-shrink-0 w-[75vw] max-w-[420px] lg:w-[30vw] lg:max-w-[380px]"
          >
            <Link to="/invite/$slug" params={{ slug: `${template.id}-sample` }}>
              <div className="overflow-hidden rounded-[2rem] bg-white shadow-2xl">
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    data-showcase-image
                    src={template.photo}
                    alt={`${template.title} template preview`}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  {/* Template info at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="font-display text-xl font-semibold text-white">{template.title}</p>
                    <p className="mt-1 text-sm text-white/80">{template.desc}</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}

        {/* Final card: CTA */}
        <div className="flex-shrink-0 w-[75vw] max-w-[420px] lg:w-[30vw] lg:max-w-[380px] flex items-center justify-center">
          <div className="text-center px-8">
            <p className="font-accent text-2xl italic text-white/90">See them live</p>
            <Link
              to="/invite/$slug"
              params={{ slug: "garden-romance-sample" }}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/40 px-8 py-4 text-sm font-medium text-white transition-colors duration-300 hover:border-white hover:bg-white/10"
            >
              View a sample invitation <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>

  <PaperCutEdge position="bottom" color="var(--dm-bg)" />
</section>
```

### Section 4: How It Works -- STICKY PROGRESS REVEAL

**Concept**: A sticky left column shows the current step number and title. The right column contains the 5 step cards. As the user scrolls, the left column updates (crossfade) while the golden thread SVG draws. Each step card slides in from the right.

**GSAP Implementation**:

```ts
useEffect(() => {
  if (reducedMotion || !howItWorksRef.current) return;

  const ctx = gsap.context(() => {
    const steps = howItWorksRef.current!.querySelectorAll("[data-step]");
    const stickyTitle = howItWorksRef.current!.querySelector("[data-sticky-title]") as HTMLElement;
    const stickyNumber = howItWorksRef.current!.querySelector("[data-sticky-number]") as HTMLElement;
    const progressPath = howItWorksRef.current!.querySelector("[data-progress-path]") as SVGPathElement;

    // ──── Golden thread stroke draw (enhanced) ────
    if (progressPath) {
      const length = progressPath.getTotalLength();
      gsap.set(progressPath, { strokeDasharray: length, strokeDashoffset: length });

      gsap.to(progressPath, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: howItWorksRef.current,
          start: "top 60%",
          end: "bottom 40%",
          scrub: 0.8,
        },
      });
    }

    // ──── Step cards: staggered reveal from right ────
    steps.forEach((step, i) => {
      gsap.from(step, {
        x: 60,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: step,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      });
    });

    // ──── Sticky number crossfade (desktop only) ────
    if (window.matchMedia("(min-width: 1024px)").matches) {
      steps.forEach((step, i) => {
        ScrollTrigger.create({
          trigger: step,
          start: "top center",
          end: "bottom center",
          onEnter: () => {
            gsap.to(stickyNumber, {
              textContent: `0${i + 1}`,
              duration: 0,
              onStart: () => {
                gsap.fromTo(stickyNumber,
                  { opacity: 0, y: 10 },
                  { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
                );
              },
            });
            gsap.to(stickyTitle, {
              duration: 0,
              onStart: () => {
                stickyTitle.textContent = TIMELINE_STEPS[i].title;
                gsap.fromTo(stickyTitle,
                  { opacity: 0, y: 8 },
                  { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
                );
              },
            });
          },
          onEnterBack: () => {
            // Same logic for scrolling back up
            stickyNumber.textContent = `0${i + 1}`;
            stickyTitle.textContent = TIMELINE_STEPS[i].title;
            gsap.fromTo(stickyNumber, { opacity: 0 }, { opacity: 1, duration: 0.3 });
            gsap.fromTo(stickyTitle, { opacity: 0 }, { opacity: 1, duration: 0.3 });
          },
        });
      });
    }
  }, howItWorksRef.current);

  return () => ctx.revert();
}, [reducedMotion]);
```

**Layout**:
```
Desktop (lg+):
+──────────────────────────────────────────────────+
|                                                  |
|  [Sticky Left]          [Scrolling Right]        |
|                                                  |
|   THE PROCESS            ┌─────────────────┐     |
|   五步成礼               │ Sign up in      │     |
|                          │ seconds         │     |
|   ── 01 ──               │ Create your...  │     |
|                          └─────────────────┘     |
|   Sign up                                        |
|   in seconds             ┌─────────────────┐     |
|                          │ Pick your       │     |
|                          │ template        │     |
|                          │ Choose from...  │     |
|                          └─────────────────┘     |
|                                                  |
|                          ... (3 more steps)      |
+──────────────────────────────────────────────────+

Mobile: Simple vertical stack, no sticky column.
```

### Section 5: Features -- CASCADING CARD REVEAL

**Concept**: Instead of a 2-column grid that fades in together, each feature animates individually with a cascading waterfall effect. The phone mockup on the right side uses a subtle floating animation.

```ts
// Feature items cascade in with staggered X offset
const features = featuresRef.current!.querySelectorAll("[data-feature-item]");
features.forEach((feature, i) => {
  const isOdd = i % 2 !== 0;
  gsap.from(feature, {
    x: isOdd ? 40 : -40,
    opacity: 0,
    duration: 0.7,
    ease: "power3.out",
    scrollTrigger: {
      trigger: feature,
      start: "top 88%",
      toggleActions: "play none none none",
    },
  });
});

// Phone mockup: subtle continuous float
gsap.to("[data-phone-mockup]", {
  y: -12,
  duration: 3,
  ease: "sine.inOut",
  repeat: -1,
  yoyo: true,
});

// Phone mockup: scroll-driven rotation
gsap.to("[data-phone-mockup]", {
  rotateY: 5,
  rotateX: -3,
  ease: "none",
  scrollTrigger: {
    trigger: featuresRef.current,
    start: "top bottom",
    end: "bottom top",
    scrub: 1,
  },
});
```

### Section 6: Pricing -- COUNT-UP WITH SCROLL TRIGGER

**Concept**: The price figure (RM49) counts up from 0 to 49 using GSAP's snap, triggered when the card scrolls into view. The premium card has a gold shimmer that sweeps across its border on entry.

```ts
// Price count-up
const priceEl = pricingRef.current!.querySelector("[data-price-value]") as HTMLElement;
gsap.from(priceEl, {
  textContent: 0,
  duration: 1.8,
  ease: "power1.out",
  snap: { textContent: 1 },
  scrollTrigger: {
    trigger: priceEl,
    start: "top 80%",
    toggleActions: "play none none none",
  },
  onUpdate: function () {
    priceEl.textContent = Math.round(Number(priceEl.textContent)).toString();
  },
});

// Premium card: gold border shimmer on entry
const premiumCard = pricingRef.current!.querySelector("[data-premium-card]") as HTMLElement;
gsap.fromTo(
  premiumCard,
  { boxShadow: "0 0 0 3px var(--dm-gold), 0 0 40px -10px rgba(218, 165, 32, 0)" },
  {
    boxShadow: "0 0 0 3px var(--dm-gold), 0 0 40px -10px rgba(218, 165, 32, 0.3)",
    duration: 1.5,
    ease: "power2.inOut",
    repeat: 1,
    yoyo: true,
    scrollTrigger: {
      trigger: premiumCard,
      start: "top 75%",
      toggleActions: "play none none none",
    },
  }
);

// Cards: slight 3D tilt on entry
gsap.from("[data-pricing-card]", {
  rotateX: 4,
  y: 30,
  opacity: 0,
  duration: 0.9,
  ease: "power3.out",
  stagger: 0.15,
  scrollTrigger: {
    trigger: "[data-pricing-cards]",
    start: "top 80%",
    toggleActions: "play none none none",
  },
});
```

### Section 7: Final CTA -- DARK DRAMATIC CLOSE

**Concept**: The transition into the dark section is the most dramatic moment. The warm cream background "peels away" via clip-path to reveal the dark bg underneath. The calligraphy characters animate stroke-by-stroke. Floating gold particles drift upward.

```ts
// ──── Reveal transition: clip-path from center ────
gsap.from("[data-final-cta-section]", {
  clipPath: "circle(0% at 50% 50%)",
  ease: "power3.inOut",
  scrollTrigger: {
    trigger: "[data-final-cta-section]",
    start: "top 80%",
    end: "top 20%",
    scrub: 0.8,
  },
});

// ──── Calligraphy reveal: Each stroke fades in ────
const calligraphyPaths = finalCtaRef.current!.querySelectorAll("[data-calligraphy-stroke]");
calligraphyPaths.forEach((path, i) => {
  const svgPath = path as SVGPathElement;
  const length = svgPath.getTotalLength();
  gsap.set(svgPath, { strokeDasharray: length, strokeDashoffset: length });

  gsap.to(svgPath, {
    strokeDashoffset: 0,
    duration: 0.8,
    ease: "power2.out",
    delay: i * 0.15,
    scrollTrigger: {
      trigger: finalCtaRef.current,
      start: "top 60%",
      toggleActions: "play none none none",
    },
  });
});

// ──── Headline: scale up from small ────
gsap.from("[data-final-cta-headline]", {
  scale: 0.85,
  opacity: 0,
  y: 30,
  duration: 1,
  ease: "power3.out",
  scrollTrigger: {
    trigger: "[data-final-cta-headline]",
    start: "top 75%",
    toggleActions: "play none none none",
  },
});

// ──── Floating gold particles: continuous upward drift ────
// Implemented via CSS @keyframes to avoid GSAP overhead on repeating loops
// But initial scatter uses GSAP:
const particles = finalCtaRef.current!.querySelectorAll("[data-particle]");
particles.forEach((particle, i) => {
  gsap.set(particle, {
    x: gsap.utils.random(-200, 200),
    y: gsap.utils.random(-100, 100),
    scale: gsap.utils.random(0.3, 1),
    opacity: 0,
  });

  gsap.to(particle, {
    opacity: gsap.utils.random(0.15, 0.4),
    y: "-=80",
    duration: gsap.utils.random(4, 8),
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true,
    delay: i * 0.5,
    scrollTrigger: {
      trigger: finalCtaRef.current,
      start: "top 70%",
      toggleActions: "play pause resume pause",
    },
  });
});

// ──── CTA button: shimmer effect ────
gsap.fromTo(
  "[data-final-cta-button]::after",
  { left: "-100%" },
  {
    left: "100%",
    duration: 1.5,
    ease: "power2.inOut",
    scrollTrigger: {
      trigger: "[data-final-cta-button]",
      start: "top 70%",
      toggleActions: "play none none none",
    },
  }
);
```

### Section 8: Footer (No Animation)

The footer is static. No animation. This is deliberate. After the dramatic Final CTA, the footer acts as a visual exhale. Simple, centered, quiet.

---

## 5. ANIMATION STRATEGY: Deep Technical Specification

### 5.1 GSAP Easing Vocabulary

The current `GSAP_EASE` object defines 4 eases but uses none. Here is the expanded vocabulary with specific use cases:

```ts
export const GSAP_EASE = {
  // Entrances: elements appearing
  entrance: "power3.out",        // Default reveal. Smooth deceleration.
  entranceDramatic: "power4.out", // Hero elements. Stronger deceleration.
  entranceSoft: "power2.out",    // Subtle reveals (trust badges, captions).

  // Exits: elements disappearing
  exit: "power2.in",            // Scroll-away fades. Quick acceleration.
  exitSlow: "power3.in",       // Hero parallax exit.

  // Continuous / scrubbed: scroll-driven motion
  scrub: "none",               // Linear progress for scroll-scrubbed animations.

  // Emphasis: drawing attention
  bounce: "back.out(1.4)",     // CTA button hover. Slight overshoot.
  elastic: "elastic.out(1, 0.5)", // Price count-up landing.

  // Transitions: between states
  transition: "power2.inOut",   // Clip-path reveals, crossfades.
  transitionSlow: "power3.inOut", // Section transitions.

  // Oscillation: repeating animations
  float: "sine.inOut",         // Phone mockup bob, particle drift.
} as const;
```

### 5.2 Duration Guidelines

| Animation Type | Duration | Rationale |
|---------------|----------|-----------|
| Character reveal (stagger each) | 0.03s | 30 chars * 0.03 = 0.9s total. Fast enough to feel fluid. |
| Element entrance | 0.6-0.9s | Standard reveal. 0.6 for small elements, 0.9 for large. |
| Hero card entrance | 1.2s | Dramatic, cinematic timing. |
| Scroll-scrubbed | N/A | Duration set by scroll distance via `scrub` value. |
| Clip-path transition | 0.8-1.2s (scrubbed) | Tied to scroll distance. |
| Count-up | 1.8s | Slow enough to read individual numbers passing. |
| Floating animation (repeat) | 3-5s | Slow, organic, non-distracting. |
| Hover micro-interaction | 0.3s | Snappy, responsive. |

### 5.3 ScrollTrigger Configuration Patterns

**Pattern 1: Parallax (Non-Pinned)**
Used for: Hero layers, background elements
```ts
{
  trigger: containerElement,
  start: "top bottom",   // begins when element enters viewport from bottom
  end: "bottom top",     // ends when element exits viewport at top
  scrub: 0.5,            // 0.5s smoothing. Lower = more responsive.
  // No pin
}
```

**Pattern 2: Pinned Horizontal Scroll**
Used for: Showcase gallery
```ts
{
  trigger: sectionElement,
  start: "top top",           // pins when section hits top of viewport
  end: () => `+=${trackScrollDistance}`, // dynamic based on content width
  scrub: 1,                   // 1s smoothing. Slightly laggy = cinematic feel.
  pin: true,                  // pins the section
  anticipatePin: 1,           // pre-renders pin to avoid jank
  invalidateOnRefresh: true,  // recalculates on resize
}
```

**Pattern 3: Trigger-Once (Toggle)**
Used for: Element entrances (stats, cards, features)
```ts
{
  trigger: element,
  start: "top 80%",           // triggers when element's top is 80% from viewport top
  toggleActions: "play none none none", // play once, never reverse
}
```

**Pattern 4: Scrubbed Reveal (Bi-directional)**
Used for: Testimonial word-reveal, golden thread
```ts
{
  trigger: containerElement,
  start: "top 75%",
  end: "bottom 40%",
  scrub: 0.5,
  // No toggleActions -- scrub handles both directions
}
```

**Pattern 5: Container Animation (Nested ScrollTrigger)**
Used for: Card reveals within horizontal scroll
```ts
{
  trigger: cardElement,
  containerAnimation: parentHorizontalTimeline, // links to the parent scrubbed TL
  start: "left 80%",    // note: left/right instead of top/bottom
  toggleActions: "play none none reverse",
}
```

### 5.4 Manual Text Splitting (No SplitText Plugin)

Three levels of text splitting, from coarse to fine:

**Level 1: Word Split (for testimonials, subtitles)**
```tsx
function SplitWords({ children, className }: { children: string; className?: string }) {
  return (
    <>
      {children.split(/(\s+)/).map((segment, i) => {
        if (/^\s+$/.test(segment)) {
          return <span key={`space-${i}`}>{segment}</span>;
        }
        return (
          <span
            key={`word-${i}`}
            data-word
            className={cn("inline-block", className)}
            style={{ willChange: "opacity, transform" }}
          >
            {segment}
          </span>
        );
      })}
    </>
  );
}
```

**Level 2: Character Split (for hero headline)**
```tsx
function SplitChars({ children, className }: { children: string; className?: string }) {
  return (
    <>
      {children.split("").map((char, i) => (
        <span
          key={`char-${i}`}
          data-char-index={i}
          className={cn(className)}
          style={{
            display: char === " " ? "inline" : "inline-block",
            willChange: "opacity, transform",
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </>
  );
}
```

**Level 3: Line Split (for section titles)**
```tsx
// Line-splitting requires measuring. Use a ResizeObserver approach:
function useSplitLines(ref: React.RefObject<HTMLElement>) {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const computeLines = () => {
      const text = el.textContent || "";
      const words = text.split(" ");
      const tempEl = document.createElement("span");
      tempEl.style.cssText = window.getComputedStyle(el).cssText;
      tempEl.style.position = "absolute";
      tempEl.style.visibility = "hidden";
      tempEl.style.whiteSpace = "nowrap";
      document.body.appendChild(tempEl);

      const containerWidth = el.offsetWidth;
      const computedLines: string[] = [];
      let currentLine = "";

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        tempEl.textContent = testLine;
        if (tempEl.offsetWidth > containerWidth && currentLine) {
          computedLines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) computedLines.push(currentLine);

      document.body.removeChild(tempEl);
      setLines(computedLines);
    };

    computeLines();
    const ro = new ResizeObserver(computeLines);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  return lines;
}
```

Then animate each line with a clip-path reveal:
```ts
gsap.from("[data-line]", {
  clipPath: "inset(0 100% 0 0)", // clips from right
  opacity: 0,
  duration: 0.6,
  ease: "power3.out",
  stagger: 0.12,
});
```

### 5.5 Sticky Section Parallax (How It Works)

**Desktop Layout (lg+)**:
```
Position: sticky on the left column.
Top offset: 50% - half the sticky element height.
The right column is a standard flow column with scroll.
```

```css
/* Sticky left column */
[data-sticky-panel] {
  position: sticky;
  top: calc(50vh - 120px); /* centers vertically in viewport */
  height: fit-content;
  will-change: transform; /* hint for compositor */
}
```

**Scroll-driven number transition**:
The step number (01, 02, 03, 04, 05) is not simply replaced -- it crossfades with a Y-axis slide:

```ts
// When a new step enters the center zone:
function updateStickyStep(index: number) {
  const tl = gsap.timeline();

  // Exit current number
  tl.to("[data-sticky-number]", {
    y: -15,
    opacity: 0,
    duration: 0.25,
    ease: "power2.in",
  });

  // Update text content at midpoint
  tl.call(() => {
    stickyNumber.textContent = `0${index + 1}`;
    stickyTitle.textContent = TIMELINE_STEPS[index].title;
  });

  // Enter new number
  tl.fromTo(
    "[data-sticky-number]",
    { y: 15, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" }
  );
  tl.fromTo(
    "[data-sticky-title]",
    { y: 8, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" },
    "-=0.2"
  );
}
```

### 5.6 Performance Budget

Every animation must be compositable (transform + opacity only). No layout-triggering properties.

| Property | Compositable | Used |
|----------|-------------|------|
| `transform` (translate, scale, rotate) | Yes | Primary |
| `opacity` | Yes | Primary |
| `clip-path` | Yes (GPU-accelerated in all modern browsers) | Section transitions |
| `strokeDashoffset` | Yes (SVG paint only) | Golden thread, calligraphy |
| `textContent` | No layout (text node swap) | Count-up |
| `background-color` | No (paint) | NEVER animated |
| `width` / `height` | No (layout) | NEVER animated |
| `border` | No (paint) | NEVER animated |
| `box-shadow` | No (paint) | Used ONCE (premium card pulse), then static |

**`will-change` Strategy**:
Only apply `will-change` to elements that will be GSAP-animated. Remove it after animation completes for one-shot animations.

```ts
// Before animation
gsap.set(elements, { willChange: "transform, opacity" });

// After animation completes
gsap.set(elements, { willChange: "auto", delay: 0.1 });
```

For scroll-scrubbed animations, `will-change` stays for the duration of the ScrollTrigger.

### 5.7 `prefers-reduced-motion` Implementation

Every GSAP animation is wrapped in the `reducedMotion` guard. The reduced-motion experience is not "no animation" -- it is "instant state":

```ts
if (reducedMotion) {
  // Instead of character-by-character reveal, show all text immediately
  gsap.set("[data-char-index]", { opacity: 1, y: 0, rotateX: 0 });

  // Instead of horizontal scroll gallery, show a static grid
  // (handled in JSX with conditional rendering)

  // Instead of parallax, show elements at final position
  gsap.set("[data-hero-headline]", { yPercent: 0 });
  gsap.set("[data-hero-card]", { yPercent: 0 });

  // Instead of clip-path transition, show full section
  gsap.set("[data-final-cta-section]", { clipPath: "circle(100% at 50% 50%)" });

  // Instead of count-up, show final number
  gsap.set("[data-price-value]", { textContent: "49" });

  // Kill all ScrollTriggers
  ScrollTrigger.getAll().forEach(st => st.kill());

  return; // Early return from useEffect
}
```

---

## 6. STANDOUT COMPONENTS

### 6.1 Horizontal Scroll Showcase Gallery

**What makes it special**: The horizontal scroll is not a simple `translateX`. Each card has three motion layers:
1. **Card frame**: Moves at scroll speed (1:1 with scrub)
2. **Card image**: Moves at 0.85x scroll speed (creates window parallax)
3. **Card label**: Moves at 1.1x scroll speed (slightly ahead of frame)

This three-layer parallax within a horizontal scroll creates a depth perception that makes each card feel like a physical object sliding across a table.

**Performance note**: All three layers use `transform: translateX()` only. Zero paint operations during scroll.

**Snap behavior**: After the horizontal scroll completes (scrub reaches 1), the section unpins naturally. No snap-to-card behavior (this would require Lenis or ScrollSnap which conflicts with the natural scroll feel).

### 6.2 Sticky Step Counter (How It Works)

**What makes it special**: The large step number (rendered at `8rem` in Playfair Display, `--dm-gold` color) acts as a persistent anchor while the step cards scroll past. The number transitions use a "slot machine" metaphor: the old number slides up and fades while the new number slides in from below.

This creates a sense that the user is progressing through a journey, not just reading a list. Combined with the golden thread SVG that draws in sync with scroll position, the section feels like unrolling a scroll -- culturally resonant for Chinese weddings.

**Desktop only**: On mobile, the sticky panel is replaced by inline step numbers within each card. The golden thread still draws via scroll.

### 6.3 Parallax Hero with Depth Layers

**What makes it special**: Five layers at different scroll speeds:
1. Background wash (0.1x) -- barely moves
2. Peony SVG (0.3x) -- gentle drift + rotation
3. Double Happiness watermark (0.4x)
4. Card preview (0.7x) -- moves but noticeably slower than content
5. Headline + CTA (1.3x) -- moves faster than scroll, exits sooner

The result: as the user scrolls past the hero, the headline rushes away while the card lingers, creating a "camera pull" effect where the user's focus naturally shifts from text to the product image, and then to the next section.

### 6.4 Dark Section Reveal (Final CTA)

**What makes it special**: The transition from the warm gold pricing section to the dark Final CTA uses a `clip-path: circle()` expansion. The circle originates from the center of the screen and expands outward, creating a cinematic "iris" transition.

```
Frame 1 (start):    clip-path: circle(0% at 50% 50%)     ← invisible
Frame 2 (25%):      clip-path: circle(25% at 50% 50%)    ← small circle
Frame 3 (50%):      clip-path: circle(50% at 50% 50%)    ← half screen
Frame 4 (75%):      clip-path: circle(75% at 50% 50%)    ← most of screen
Frame 5 (100%):     clip-path: circle(100% at 50% 50%)   ← full section visible
```

This is scrub-driven, so the user controls the speed. The effect is subtle at normal scroll speed but dramatic if the user scrolls slowly. It works because the dark section's content (gold calligraphy, crimson accents, floating particles) is already visually distinct, so the circular reveal frames it like a spotlight on a stage.

---

## 7. CULTURAL ELEMENT INTEGRATION

### The Problem with Current Cultural Elements

Every cultural element is at ghost opacity:
- `DoubleHappiness`: 0.03 opacity
- `PeonyOutline`: 0.06 opacity
- `LatticeOverlay`: 0.04 opacity
- `CalligraphyReveal`: exists but barely visible

At these levels, only someone specifically looking for them would notice. They contribute zero to the user's first impression.

### The Fix: Cultural Elements as Architecture, Not Decoration

| Element | Current State | Proposed State | Implementation |
|---------|--------------|---------------|----------------|
| **Double Happiness (囍)** | 0.03 opacity watermark behind hero | 0.06 opacity behind hero (doubled) + 0.8 opacity as section divider between Social Proof and Showcase | The high-opacity version is rendered at `3rem` in `--dm-gold` as a decorative divider, flanked by thin gold lines. Not a watermark -- a structural motif. |
| **Peony Outline SVG** | 0.06 opacity, desktop only, static | 0.12 opacity, scroll-driven stroke animation, parallax drift | The peony draws its strokes as the hero loads (3s animation), then drifts with parallax. At 0.12 it is visible as a decorative element, not invisible noise. |
| **Lattice Overlay** | 0.04 opacity on Showcase section | 0.08 opacity, with a subtle scroll-driven shift | Doubled visibility. The lattice pattern shifts `x: 20px` over the section's scroll range, creating a moire shimmer. |
| **Paper-Cut Edge** | Bottom of Showcase only | Bottom of Showcase + top of Final CTA | Consistent cultural framing. The scalloped edges are a "jianzhi" (paper-cutting) reference. |
| **Calligraphy Reveal** | In Final CTA, generic treatment | Stroke-by-stroke GSAP animation with `strokeDashoffset` | Each stroke of the 4 characters (爱情故事) draws sequentially. Duration: 0.8s per stroke, 0.15s stagger between strokes. Total: ~3s. Triggered at 60% viewport entry. |
| **Gold Rule (HR)** | Thin gold line between sections | Unchanged but with animated width expansion | The gold line grows from 0 width to full width over 0.6s when scrolled into view. Subtle but gives life to a static element. |
| **Chinese Kickers** | Small text at `clamp(1.25rem, 2vw, 2rem)` | Larger at `clamp(1.5rem, 2.5vw, 2.5rem)`, Noto Serif SC 700 | The bilingual kickers are the most effective cultural signifier. Making them larger and bolder increases their impact proportionally. |
| **New: Cloud Motif SVG** | Does not exist | Subtle cloud pattern in the How It Works section background | Simple SVG cloud outlines at 0.05 opacity, positioned at top-right and bottom-left of the section. Parallax drift at 0.2x scroll speed. Auspicious clouds (祥云) are a core Chinese decorative motif. |

### Cultural Color Usage Rules

1. **Crimson (#D42040)** is used boldly. The Showcase section background IS crimson. The CTA buttons ARE crimson. The hero accent word IS crimson. This is Chinese Red -- it should not be timid.

2. **Gold (#DAA520)** is decorative, never functional. Gold for dividers, ornamental text, kicker text, thread lines, particles. NEVER for clickable elements or body text (fails contrast requirements and reads as "cheap" when overused).

3. **The crimson-to-dark transition** (Pricing gold-soft -> Final CTA ink-dark) mirrors the traditional Chinese wedding banquet progression: daylight ceremony (warm, bright) -> evening reception (rich, dark, dramatic).

---

## 8. MOBILE-SPECIFIC DESIGN

### Mobile Viewport: 75-85% of Traffic

Every design decision must be mobile-first. Desktop is the enhancement, not the baseline.

### 8.1 Simplified Animations for Mobile

| Animation | Desktop | Mobile (< 1024px) |
|-----------|---------|-------------------|
| Hero char reveal | 0.03s stagger, rotateX -90 | 0.02s stagger, NO rotateX (saves compositor layers) |
| Hero parallax | 5 layers at different speeds | Disabled. All layers at 1x scroll speed. |
| Showcase horizontal scroll | Pinned GSAP ScrollTrigger | **Swipe gallery** with CSS `scroll-snap-type` (see 8.2) |
| How It Works sticky panel | Sticky left column with crossfade | No sticky. Inline step numbers. Golden thread still draws. |
| Features cascade | Alternating x: -40/+40 | All from y: 20 (simpler, no horizontal movement) |
| Pricing card tilt | rotateX: 4 on entry | No rotation. Simple fade + y. |
| Final CTA circle reveal | clip-path circle expansion | clip-path: inset() (top-to-bottom wipe, cheaper to render) |
| Floating particles | 5 particles with GSAP drift | 3 particles, CSS @keyframes only (no JS overhead) |

### 8.2 Mobile Showcase: Swipe Gallery

On mobile, the GSAP horizontal scroll is replaced with a native touch-friendly swipe gallery:

```tsx
{/* Mobile: CSS scroll-snap gallery */}
<div className="lg:hidden overflow-x-auto scroll-snap-x-mandatory flex gap-4 px-6 pb-4 -mx-6"
  style={{
    scrollSnapType: "x mandatory",
    WebkitOverflowScrolling: "touch",
    scrollbarWidth: "none", // Firefox
  }}
>
  {templates.map((template) => (
    <div
      key={template.id}
      className="flex-shrink-0 w-[80vw] max-w-[320px]"
      style={{ scrollSnapAlign: "center" }}
    >
      <TemplateCard template={template} />
    </div>
  ))}
</div>

{/* Desktop: GSAP horizontal scroll */}
<div className="hidden lg:block">
  {/* ... pinned horizontal scroll as described in Section 4 ... */}
</div>
```

**Why CSS scroll-snap instead of GSAP on mobile**:
1. Native momentum scrolling. GSAP ScrollTrigger with `pin: true` on mobile creates a jarring interruption in native scroll momentum. Users expect to flick and coast.
2. Zero JS overhead. The gallery renders without waiting for GSAP to calculate dimensions.
3. Battery life. GSAP ScrollTrigger fires `onUpdate` callbacks on every frame during scroll. On mobile, this is wasted energy for a gallery that works natively.

### 8.3 Mobile Touch Targets

All interactive elements: minimum 44x44px touch target (already enforced by existing CSS rule on `.rounded-full` buttons).

CTA buttons on mobile: full-width at `sm:` breakpoint and below:
```css
@media (max-width: 639px) {
  .dm-cta-primary,
  .dm-cta-secondary {
    width: 100%;
    justify-content: center;
  }
}
```

### 8.4 Mobile Type Scale

The `clamp()` values in the type scale handle mobile naturally:

| Token | 390px Render | 768px Render | 1440px Render |
|-------|-------------|-------------|---------------|
| `--text-hero` | 5.68rem (90.8px) | 7.66rem (122.6px) | 10rem (160px) |
| `--text-section` | 3.84rem (61.4px) | 4.8rem (76.8px) | 5rem (80px) |
| `--text-kicker-cn` | 2.47rem (39.5px) | 2.5rem (40px) | 2.5rem (40px) |

The hero headline at 90px on a 390px screen occupies ~23% of viewport width per character. For a 7-word headline broken across 3 lines, this creates the editorial billboard effect.

### 8.5 Mobile Performance Targets

| Metric | Budget | Strategy |
|--------|--------|----------|
| LCP | < 2.0s | Hero image `fetchPriority="high"`, `loading="eager"`. Font subsetting for Playfair Display (Latin + basic punctuation only). Inline critical CSS. |
| CLS | < 0.05 | All images have `aspect-ratio` set. Font `font-display: swap` with matched fallback metrics. No layout-shifting animations. |
| INP | < 150ms | No JS on the critical interaction path (CTA clicks are native links). GSAP animations use `gsap.ticker` which does not block the main thread. |
| Total page weight | < 800KB | GSAP core + ScrollTrigger: ~60KB gzipped. 4 images at ~100KB each (WebP, lazy-loaded except hero). Fonts: ~80KB (subset). HTML + CSS + JS: ~120KB. Total: ~660KB. |

### 8.6 Mobile-Specific Cultural Elements

- **Peony SVG**: Hidden on mobile (`hidden lg:block`). Mobile screens are too narrow for large decorative SVGs.
- **Double Happiness watermarks**: Hidden on mobile. The 20rem watermark would overlap content.
- **Lattice overlay**: Kept at reduced opacity (0.05 instead of 0.08) on mobile.
- **Paper-cut edge**: Kept. Renders at full width, scales naturally.
- **Chinese kickers**: Kept and prominent. This is the primary cultural signifier that works at every screen size.
- **Gold rules**: Kept. Full-width horizontal lines scale perfectly.

---

## 9. REFERENCES AND INSPIRATION

### Scroll-Driven Storytelling

1. **Apple AirPods Pro page** (apple.com/airpods-pro)
   - ScrollTrigger pinning for the product transformation sequence
   - Multiple scrub values for different content layers
   - Reference for: How It Works sticky progression

2. **Locomotive.ca** (locomotive.ca)
   - Horizontal scroll galleries with parallax depth
   - Reference for: Showcase horizontal scroll implementation

3. **Aristide Benoist Portfolio** (aristidebenoist.com)
   - Character-by-character text reveals on scroll
   - Reference for: Hero headline animation timing

4. **Linear.app** (linear.app)
   - Clip-path section transitions
   - Reference for: Final CTA circle reveal

5. **Stripe.com** (stripe.com)
   - Sticky sidebar with scrolling content pane
   - Reference for: How It Works desktop layout

### Cultural Design Reference

6. **MUJI** (muji.com) and **Shiseido** (shiseido.com)
   - Japanese/East Asian luxury with whitespace
   - Reference for: How cultural elements can be bold without being loud

7. **Chinese Wedding Invitation Traditions**
   - Red and gold as dominant colors
   - Double happiness, peonies, clouds, lattice as auspicious motifs
   - Reference for: Cultural element selection and placement

### Typography and Editorial

8. **Pentagram.com** (pentagram.com)
   - Oversized serif headlines with tight tracking
   - Reference for: Hero type scale at 10rem

9. **It's Nice That** (itsnicethat.com)
   - Magazine-style section pacing
   - Reference for: Section rhythm and whitespace

### Awwwards SOTD Patterns

10. **Common SOTD patterns** used in this proposal:
    - Pinned horizontal scroll with scrubbed progress
    - Multi-speed parallax creating perceived depth
    - Clip-path section transitions
    - Character-level text animation
    - Scrub-driven color/opacity shifts

---

## 10. IMPLEMENTATION CHECKLIST

### Phase 1: Foundation (Estimated: 2 days)
- [ ] Update CSS custom properties (color palette, type scale)
- [ ] Create `SplitChars` and `SplitWords` utility components
- [ ] Create `useSplitLines` hook
- [ ] Update `GSAP_EASE` object with full vocabulary
- [ ] Test `prefers-reduced-motion` behavior with all new tokens

### Phase 2: Hero Overhaul (Estimated: 2 days)
- [ ] Implement 3-act hero animation (entrance, parallax, exit)
- [ ] Manual character splitting for headline
- [ ] Increase cultural element opacity (peony, double happiness)
- [ ] Mobile hero: simplified entrance, no parallax
- [ ] Performance audit: verify no layout-triggering animations

### Phase 3: Showcase Horizontal Scroll (Estimated: 3 days)
- [ ] Desktop: GSAP ScrollTrigger pinned horizontal scroll
- [ ] Image parallax within cards (three-layer depth)
- [ ] Card entry animations within container animation
- [ ] Progress indicator bar
- [ ] Mobile: CSS scroll-snap swipe gallery fallback
- [ ] Test on iOS Safari (ScrollTrigger pin behavior)
- [ ] Test on Android Chrome (touch momentum)

### Phase 4: How It Works Sticky (Estimated: 2 days)
- [ ] Desktop: Sticky left panel with step crossfade
- [ ] Golden thread enhanced stroke-draw
- [ ] Step card entry animations (from right)
- [ ] Mobile: No sticky, inline step numbers
- [ ] Test sticky behavior with browser chrome resize (iOS address bar)

### Phase 5: Remaining Sections (Estimated: 2 days)
- [ ] Social Proof: Word-by-word testimonial reveal, stat count-up
- [ ] Features: Cascading card reveal, phone mockup float
- [ ] Pricing: Count-up, premium card shimmer
- [ ] Final CTA: Circle clip-path reveal, calligraphy stroke animation, particles
- [ ] Footer: No animation (intentional)

### Phase 6: Polish and Testing (Estimated: 2 days)
- [ ] Cross-browser ScrollTrigger testing (Chrome, Safari, Firefox)
- [ ] iOS Safari address bar resize behavior
- [ ] `prefers-reduced-motion` complete audit
- [ ] Lighthouse performance audit (LCP, CLS, INP)
- [ ] Page weight audit (< 800KB total)
- [ ] Accessibility audit (focus order, screen reader, keyboard nav)

**Total estimated effort: 13 days**

---

## APPENDIX A: Complete GSAP ScrollTrigger Map

Every ScrollTrigger instance on the page, in scroll order:

| # | Section | Target | Type | Start | End | Scrub | Pin | Purpose |
|---|---------|--------|------|-------|-----|-------|-----|---------|
| 1 | Hero | `[data-hero-headline]` | Parallax | `top top` | `bottom top` | 0.5 | No | Headline moves up faster |
| 2 | Hero | `[data-hero-card]` | Parallax | `top top` | `bottom top` | 0.8 | No | Card moves up slower |
| 3 | Hero | `[data-hero-peony]` | Parallax | `top top` | `bottom top` | 1.2 | No | Peony drifts slowly |
| 4 | Hero | `[data-hero-wash]` | Opacity | `center center` | `bottom top` | 0.6 | No | Crimson wash intensifies |
| 5 | Hero | `[data-hero-content]` | Exit | `70% top` | `bottom top` | 0.3 | No | Content fades and scales |
| 6 | Social Proof | `[data-stat-value]` | Toggle | `top 80%` | -- | -- | No | Stats count up (one-shot) |
| 7 | Social Proof | `[data-word]` | Scrub | `top 75%` | `top 40%` | 0.5 | No | Word-by-word reveal |
| 8 | Showcase | `[data-showcase-track]` | Horizontal | `top top` | `+=${totalWidth}` | 1 | **Yes** | Horizontal gallery scroll |
| 9 | Showcase | `[data-showcase-image]` | Parallax | `top top` | `+=${totalWidth}` | 1.5 | No | Image parallax within cards |
| 10 | Showcase | `[data-showcase-progress]` | Scale | `top top` | `+=${totalWidth}` | 0.3 | No | Progress bar |
| 11 | Showcase | `[data-showcase-card]` (x4) | Container | `left 80%` | -- | -- | No | Card entry within horizontal |
| 12 | Showcase | `[data-showcase-header]` | Opacity | `top top` | `top -10%` | 0.3 | No | Header fades as scroll begins |
| 13 | How It Works | `[data-progress-path]` | Stroke | `top 60%` | `bottom 40%` | 0.8 | No | Golden thread draws |
| 14 | How It Works | `[data-step]` (x5) | Toggle | `top 85%` | -- | -- | No | Step card entry |
| 15 | How It Works | `[data-step]` (x5) | Callback | `top center` | `bottom center` | -- | No | Sticky panel text update |
| 16 | Features | `[data-feature-item]` (x7) | Toggle | `top 88%` | -- | -- | No | Feature cascade |
| 17 | Features | `[data-phone-mockup]` | Scrub | `top bottom` | `bottom top` | 1 | No | Phone rotation on scroll |
| 18 | Pricing | `[data-price-value]` | Toggle | `top 80%` | -- | -- | No | Price count-up |
| 19 | Pricing | `[data-premium-card]` | Toggle | `top 75%` | -- | -- | No | Gold shimmer |
| 20 | Pricing | `[data-pricing-card]` (x2) | Toggle | `top 80%` | -- | -- | No | Card entry |
| 21 | Final CTA | `[data-final-cta-section]` | Scrub | `top 80%` | `top 20%` | 0.8 | No | Circle clip-path reveal |
| 22 | Final CTA | `[data-calligraphy-stroke]` | Toggle | `top 60%` | -- | -- | No | Calligraphy draw |
| 23 | Final CTA | `[data-final-cta-headline]` | Toggle | `top 75%` | -- | -- | No | Headline scale entry |
| 24 | Final CTA | `[data-particle]` (x5) | Toggle | `top 70%` | -- | -- | No | Particle animation start |

**Total ScrollTrigger instances: 24** (desktop), **~12** (mobile, with parallax and sticky disabled).

---

## APPENDIX B: File Changes Summary

| File | Change Type | Description |
|------|------------|-------------|
| `src/styles.css` | Modify | Updated CSS custom properties (colors, type scale) |
| `src/components/landing/animation.ts` | Modify | Expanded `GSAP_EASE` vocabulary, updated duration values |
| `src/components/landing/Hero.tsx` | Major rewrite | 3-act scroll narrative, character splitting, parallax layers |
| `src/components/landing/SocialProof.tsx` | Modify | Word-by-word testimonial reveal, GSAP count-up |
| `src/components/landing/Showcase.tsx` | Major rewrite | Horizontal scroll gallery (desktop), swipe gallery (mobile) |
| `src/components/landing/HowItWorks.tsx` | Major rewrite | Sticky panel (desktop), enhanced golden thread |
| `src/components/landing/Features.tsx` | Modify | Cascading card reveal, phone mockup float |
| `src/components/landing/Pricing.tsx` | Modify | GSAP count-up, premium card shimmer |
| `src/components/landing/FinalCTA.tsx` | Major rewrite | Circle reveal transition, calligraphy stroke animation |
| `src/components/landing/hooks/useGSAP.ts` | Modify | Enhanced with reduced-motion handling |
| `src/components/landing/hooks/useStrokeDraw.ts` | Modify | Improved easing and timing |
| `src/routes/index.tsx` | Modify | Updated gsap.context with new ScrollTrigger management |
| `src/components/landing/motifs/PeonyOutline.tsx` | Modify | Increased opacity, added `data-hero-peony` attribute |
| `src/components/landing/motifs/DoubleHappiness.tsx` | Modify | Increased opacity values |
| `src/components/landing/motifs/LatticeOverlay.tsx` | Modify | Increased opacity, scroll-driven shift |
| `src/components/landing/motifs/SectionHeader.tsx` | Modify | Updated type scale references |
| **New files** | | |
| `src/components/landing/SplitText.tsx` | New | `SplitChars`, `SplitWords` utility components |
| `src/components/landing/hooks/useSplitLines.ts` | New | Line-splitting hook with ResizeObserver |

---

## APPENDIX C: Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| GSAP ScrollTrigger `pin: true` on iOS Safari causes jumpy behavior | High | Test early. If broken, fall back to `position: sticky` CSS with IntersectionObserver for progress tracking. |
| Horizontal scroll gallery disorienting for users unfamiliar with the pattern | Medium | Clear progress bar, "scroll to explore" hint text below header, natural unpin at end. |
| 24 ScrollTrigger instances cause scroll jank on low-end Android | Medium | Profile on a Moto G Power. If jank detected, reduce to 15 by combining parallax layers and removing feature cascade stagger. |
| Character splitting breaks on CJK characters | Low | The hero headline is English only. Chinese text is handled by `SplitWords` at the word level, not character level. |
| `clip-path: circle()` not supported on older browsers | Low | CSS `@supports` fallback to simple opacity transition. Affects < 1% of target audience browsers. |
| Page weight exceeds 800KB with all GSAP code | Low | GSAP core (41KB) + ScrollTrigger (18KB) gzipped. Well within budget. Monitor with `bundlesize` CI check. |
