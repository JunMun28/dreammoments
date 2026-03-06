# Landing Page Revamp - Immersive Cinematic Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current landing page with an immersive, cinematic scroll-driven experience featuring lush tropical aesthetics and Gemini-generated photography.

**Architecture:** Strip the landing page to 5 bold sections (Hero, Showcase, Social Proof, FAQ, Closing CTA + Footer). Use GSAP ScrollTrigger for parallax and scroll-driven horizontal photo reel. Keep Lenis smooth scroll, Clerk auth, dark/light theme. Drop Three.js/WebGL, blob cursor, particles, velocity scroller.

**Tech Stack:** React + TanStack Router, GSAP + ScrollTrigger, Lenis, motion/react (header only), Tailwind CSS v4, Clerk auth, Gemini API (image generation)

**Design doc:** `docs/plans/2026-03-06-landing-page-revamp-design.md`

---

### Task 1: Generate Cinematic Photos with Gemini

**Files:**
- Create: `scripts/generate-landing-photos.py`
- Output: `public/photos/landing/` (7 images)

**Step 1: Create the generation script**

```python
import os
from pathlib import Path
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
output_dir = Path("public/photos/landing")
output_dir.mkdir(parents=True, exist_ok=True)

photos = [
    {
        "name": "hero-bg",
        "prompt": "Cinematic wide shot of a Malaysian Chinese wedding couple standing in a lush tropical garden at golden hour. Warm sunlight filtering through palm fronds and tropical foliage. The couple is slightly silhouetted with rim lighting. Frangipani and bougainvillea in the background. Shot on 35mm film, shallow depth of field, warm color grading with deep greens and golden amber tones. Professional wedding photography, editorial quality.",
        "aspect": "16:9",
        "size": "2K",
    },
    {
        "name": "hero-foliage",
        "prompt": "Dense tropical foliage frame border shot from below looking up. Monstera leaves, palm fronds, and ferns creating a natural vignette. Bright sky visible through gaps. Shot on 35mm, shallow depth of field so leaves are beautifully blurred. Lush greens with warm golden light filtering through. No people. Clean botanical composition suitable as a foreground overlay.",
        "aspect": "16:9",
        "size": "2K",
    },
    {
        "name": "showcase-ceremony",
        "prompt": "Intimate Chinese tea ceremony moment at a tropical outdoor wedding. Couple exchanging tea cups under a wooden pavilion draped with tropical greenery. Warm ambient light, fairy lights overhead. Shallow depth of field, warm earth tones with rich greens. Professional wedding photography, candid emotional moment.",
        "aspect": "3:2",
        "size": "2K",
    },
    {
        "name": "showcase-laughter",
        "prompt": "Candid moment of a Malaysian Chinese wedding couple laughing together in a tropical garden. Surrounded by lush palm trees and tropical flowers. Natural golden hour light, warm and joyful mood. Shot on 85mm lens, beautiful bokeh, cinematic color grading. Professional wedding photography.",
        "aspect": "3:2",
        "size": "2K",
    },
    {
        "name": "showcase-details",
        "prompt": "Elegant flat lay of Chinese wedding details on a tropical leaf surface. Gold wedding rings, red ang pao envelopes, tropical flowers (frangipani, orchids), calligraphy invitation card. Warm natural light from above, rich earth tones and greens. Styled wedding photography, editorial quality.",
        "aspect": "3:2",
        "size": "2K",
    },
    {
        "name": "showcase-reception",
        "prompt": "Chinese wedding reception dinner in a tropical outdoor setting. Round tables with red and gold table settings, warm string lights overhead, tropical palm trees framing the scene. Guests toasting with champagne. Warm evening golden light, cinematic depth. Professional wedding photography, joyful atmosphere.",
        "aspect": "3:2",
        "size": "2K",
    },
    {
        "name": "closing-couple",
        "prompt": "Romantic wide shot of a Chinese wedding couple walking away hand in hand through a tropical garden path at dusk. Warm string lights and lanterns lining the path. Lush green tropical foliage on both sides. Shot from behind, cinematic framing, warm golden-amber tones. Professional wedding photography, 35mm lens, dreamy and hopeful mood.",
        "aspect": "16:9",
        "size": "2K",
    },
]

for photo in photos:
    print(f"Generating {photo['name']}...")
    response = client.models.generate_content(
        model="gemini-3-pro-image-preview",
        contents=[photo["prompt"]],
        config=types.GenerateContentConfig(
            response_modalities=["TEXT", "IMAGE"],
            image_config=types.ImageConfig(
                aspect_ratio=photo["aspect"],
                image_size=photo["size"],
            ),
        ),
    )
    for part in response.parts:
        if part.inline_data:
            image = part.as_image()
            filepath = output_dir / f"{photo['name']}.jpg"
            image.save(str(filepath))
            print(f"  Saved: {filepath}")
            break
    else:
        print(f"  WARNING: No image generated for {photo['name']}")

print("Done! Generated photos in public/photos/landing/")
```

**Step 2: Run the script**

```bash
cd /Users/wongjunmun/Developer/tanstack_projects/dreammoments
uv run scripts/generate-landing-photos.py
```

Expected: 7 images in `public/photos/landing/`

**Step 3: Verify images look good**

Open each image and visually confirm quality. Re-run individual prompts with adjustments if needed.

**Step 4: Commit**

```bash
git add public/photos/landing/ scripts/generate-landing-photos.py
git commit -m "feat: generate cinematic tropical landing page photos"
```

---

### Task 2: Update Color Theme - Tropical Palette

**Files:**
- Modify: `src/components/landing/landing.css` (lines 16-39 for color tokens, lines 5-14 for @theme)

**Step 1: Update light mode CSS custom properties**

Replace the pink/rose palette (lines 16-29) with tropical colors:

```css
:root {
  --agency-background: #faf9f6;        /* Warm cream */
  --agency-foreground: #1a2e1a;        /* Deep forest green */
  --agency-muted: #f0ede6;             /* Muted cream */
  --agency-muted-foreground: #4a6741;  /* Sage green */
  --agency-border: #c5cec0;            /* Soft green-gray */
  --agency-ring: #2d5a27;              /* Forest green focus */
  --agency-gold: #b8860b;              /* Dark goldenrod */
}
```

**Step 2: Update dark mode CSS custom properties**

Replace dark mode (lines 31-39):

```css
.dark {
  --agency-background: #0f1a0f;        /* Deep forest black */
  --agency-foreground: #f0ede6;        /* Warm cream */
  --agency-muted: #1a2e1a;            /* Muted dark green */
  --agency-muted-foreground: #a3b89a;  /* Sage light */
  --agency-border: #2d5a27;            /* Dark green border */
  --agency-ring: #6db365;              /* Green focus ring */
  --agency-gold: #d4a017;              /* Bright gold */
}
```

**Step 3: Run type check and build to verify no breakage**

```bash
pnpm exec tsc --noEmit && pnpm build
```

Expected: No errors (CSS custom properties are consumed by Tailwind theme, no TS impact)

**Step 4: Commit**

```bash
git add src/components/landing/landing.css
git commit -m "feat(landing): update color palette to tropical green/gold"
```

---

### Task 3: Update Landing CSS Animations

**Files:**
- Modify: `src/components/landing/landing.css` (lines 120-248)

**Step 1: Replace animation keyframes**

Remove old animations (dm-blur-in, dm-card-float, dm-particle-drift, dm-card-enter). Replace with cinematic animations:

```css
/* Ken Burns slow zoom */
@keyframes dm-ken-burns {
  0% { transform: scale(1); }
  100% { transform: scale(1.12); }
}

/* Cinematic fade in */
@keyframes dm-cinema-fade {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

/* Slide up reveal */
@keyframes dm-cinema-up {
  0% { opacity: 0; transform: translateY(40px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* Parallax float - subtle idle movement */
@keyframes dm-parallax-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
```

**Step 2: Update animation utility classes**

Replace old utility classes:

```css
.dm-ken-burns {
  animation: dm-ken-burns 14s ease-in-out infinite alternate;
}

.dm-cinema-fade {
  opacity: 0;
  animation: dm-cinema-fade 1.2s ease-out forwards;
  animation-delay: var(--delay, 0s);
}

.dm-cinema-up {
  opacity: 0;
  animation: dm-cinema-up 0.8s ease-out forwards;
  animation-delay: var(--delay, 0s);
}

.dm-parallax-float {
  animation: dm-parallax-float 6s ease-in-out infinite;
}
```

**Step 3: Keep reduced-motion media query** (lines 240-248) intact.

**Step 4: Commit**

```bash
git add src/components/landing/landing.css
git commit -m "feat(landing): replace animations with cinematic keyframes"
```

---

### Task 4: Rewrite Page Composition

**Files:**
- Modify: `src/components/landing/page.tsx` (full rewrite)
- Delete: `src/components/landing/water-ripple.tsx`
- Delete: `src/components/landing/webgl-support.ts`
- Delete: `src/components/landing/overlay-context.tsx`

**Step 1: Rewrite page.tsx**

The new page removes OverlayProvider and simplifies the composition:

```tsx
"use client";
import "./landing.css";

import { Footer } from "./footer";
import { Header } from "./header";
import { Hero } from "./hero";
import { Showcase } from "./showcase";
import { SocialProof } from "./social-proof";
import { Faq } from "./faq";
import { ClosingCta } from "./closing-cta";
import { SkipToContent } from "./skip-to-content";
import { SmoothScroll } from "./smooth-scroll";
import { LandingThemeProvider } from "./theme-context";
import { ThemeSwitch } from "./theme-switch";

function LandingContent() {
  return (
    <div className="landing">
      <SkipToContent />
      <SmoothScroll>
        <Header />
        <ThemeSwitch />
        <main id="main-content" className="relative z-10 flex-1">
          <Hero />
          <Showcase />
          <SocialProof />
          <Faq />
          <ClosingCta />
        </main>
        <Footer />
      </SmoothScroll>
    </div>
  );
}

export function LandingPage() {
  return (
    <LandingThemeProvider>
      <LandingContent />
    </LandingThemeProvider>
  );
}
```

**Step 2: Delete removed files**

```bash
rm src/components/landing/water-ripple.tsx
rm src/components/landing/webgl-support.ts
rm src/components/landing/overlay-context.tsx
```

**Step 3: Update header.tsx** - Remove the `useOverlay()` import and references

In `src/components/landing/header.tsx`, remove the overlay import and the `AnimatePresence` conditional that hides header on overlay. The header should always be visible.

**Step 4: Update header navigation sections**

Replace the sections array (line 14-28) with the new section IDs:

```tsx
const sections = [
  { id: "hero", label: "Home" },
  { id: "showcase", label: "Templates" },
  { id: "social-proof", label: "Stories" },
  { id: "faq", label: "FAQ" },
];
```

**Step 5: Verify build**

```bash
pnpm exec tsc --noEmit
```

Expected: Errors for missing Showcase and ClosingCta components (we'll create them next). That's fine for now.

**Step 6: Commit**

```bash
git add -A src/components/landing/
git commit -m "feat(landing): restructure page composition for cinematic layout"
```

---

### Task 5: Rewrite Hero Section

**Files:**
- Modify: `src/components/landing/hero.tsx` (full rewrite)

**Step 1: Write the new Hero component**

Replace the entire file with a cinematic full-viewport parallax hero:

```tsx
"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "@tanstack/react-router";

gsap.registerPlugin(ScrollTrigger);

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const foliageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const section = sectionRef.current;
    const bg = bgRef.current;
    const foliage = foliageRef.current;
    const content = contentRef.current;
    if (!section || !bg || !foliage || !content) return;

    const ctx = gsap.context(() => {
      // Ken Burns zoom on background
      gsap.to(bg, {
        scale: 1.12,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });

      // Foliage parallax - moves faster than bg
      gsap.to(foliage, {
        yPercent: -30,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });

      // Content fades out on scroll
      gsap.to(content, {
        opacity: 0,
        yPercent: -20,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "30% top",
          end: "80% top",
          scrub: 1,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative h-[100svh] min-h-[600px] overflow-hidden"
    >
      {/* Background layer - Ken Burns */}
      <div
        ref={bgRef}
        className="absolute inset-0 scale-100"
        style={{ willChange: "transform" }}
      >
        <img
          src="/photos/landing/hero-bg.jpg"
          alt=""
          className="h-full w-full object-cover"
          fetchPriority="high"
        />
        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10" />
      </div>

      {/* Foliage foreground layer - parallax */}
      <div
        ref={foliageRef}
        className="pointer-events-none absolute inset-0 z-10"
        style={{ willChange: "transform" }}
      >
        <img
          src="/photos/landing/hero-foliage.jpg"
          alt=""
          className="h-full w-full object-cover opacity-40 mix-blend-multiply dark:mix-blend-screen dark:opacity-20"
        />
      </div>

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-20 flex h-full flex-col items-center justify-center px-4 text-center"
      >
        <p className="dm-cinema-fade font-script text-xl text-gold sm:text-2xl md:text-3xl" style={{ "--delay": "0.3s" } as React.CSSProperties}>
          DreamMoments
        </p>
        <h1
          className="dm-cinema-up mt-4 font-heading text-4xl font-light leading-tight tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
          style={{ "--delay": "0.6s" } as React.CSSProperties}
        >
          Your love story,
          <br />
          beautifully told
        </h1>
        <p
          className="dm-cinema-up mt-6 max-w-md text-base text-white/80 sm:text-lg"
          style={{ "--delay": "0.9s" } as React.CSSProperties}
        >
          Create stunning digital wedding invitations that capture the magic of
          your special day.
        </p>
        <Link
          to="/editor/new"
          search={{ template: "double-happiness" }}
          className="dm-cinema-up mt-10 inline-flex items-center rounded-full bg-gold px-8 py-3 text-sm font-medium text-white transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:text-base"
          style={{ "--delay": "1.2s" } as React.CSSProperties}
        >
          Start Creating
        </Link>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2">
        <div className="dm-cinema-fade flex flex-col items-center gap-2" style={{ "--delay": "2s" } as React.CSSProperties}>
          <span className="text-xs uppercase tracking-widest text-white/60">
            Scroll
          </span>
          <svg
            className="h-5 w-5 animate-bounce text-white/60"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Verify no TypeScript errors in this file**

```bash
pnpm exec tsc --noEmit 2>&1 | grep hero
```

**Step 3: Commit**

```bash
git add src/components/landing/hero.tsx
git commit -m "feat(landing): cinematic parallax hero with Ken Burns zoom"
```

---

### Task 6: Create Showcase Section (Horizontal Scroll Reel)

**Files:**
- Create: `src/components/landing/showcase.tsx`
- Delete: `src/components/landing/projects.tsx`
- Delete: `src/components/landing/services.tsx`
- Delete: `src/components/landing/about.tsx`

**Step 1: Create the Showcase component**

This is the signature section — vertical scroll drives a horizontal photo sequence, ending with a template preview.

```tsx
"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "@tanstack/react-router";

gsap.registerPlugin(ScrollTrigger);

const showcasePhotos = [
  {
    src: "/photos/landing/showcase-ceremony.jpg",
    alt: "Tea ceremony moment under a tropical pavilion",
  },
  {
    src: "/photos/landing/showcase-laughter.jpg",
    alt: "Couple laughing together in a tropical garden",
  },
  {
    src: "/photos/landing/showcase-details.jpg",
    alt: "Wedding details with rings and tropical flowers",
  },
  {
    src: "/photos/landing/showcase-reception.jpg",
    alt: "Reception dinner under string lights",
  },
];

export function Showcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const templateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const section = sectionRef.current;
    const track = trackRef.current;
    const template = templateRef.current;
    if (!section || !track || !template) return;

    const ctx = gsap.context(() => {
      // Calculate horizontal scroll distance
      const totalWidth = track.scrollWidth - window.innerWidth;

      gsap.to(track, {
        x: -totalWidth,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${totalWidth}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      // Template card fade in at the end
      gsap.from(template, {
        opacity: 0,
        scale: 0.9,
        duration: 0.5,
        scrollTrigger: {
          trigger: template,
          containerAnimation: gsap.getById?.("showcase-scroll") || undefined,
          start: "left 80%",
          end: "left 50%",
          scrub: 1,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="showcase"
      className="relative overflow-hidden bg-background"
    >
      <div
        ref={trackRef}
        className="flex h-[100svh] items-center gap-8 px-[10vw]"
        style={{ width: `${(showcasePhotos.length + 1) * 85 + 20}vw` }}
      >
        {/* Section intro */}
        <div className="flex w-[40vw] shrink-0 flex-col justify-center pr-8 lg:w-[30vw]">
          <p className="font-script text-lg text-gold sm:text-xl">
            Our templates
          </p>
          <h2 className="mt-2 font-heading text-3xl font-light leading-tight text-foreground sm:text-4xl lg:text-5xl">
            Every detail,
            <br />
            effortlessly yours
          </h2>
        </div>

        {/* Photo reel */}
        {showcasePhotos.map((photo, i) => (
          <div
            key={photo.src}
            className="relative h-[70vh] w-[75vw] shrink-0 overflow-hidden rounded-2xl sm:w-[60vw] lg:w-[50vw]"
          >
            <img
              src={photo.src}
              alt={photo.alt}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
            {/* Subtle gradient for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        ))}

        {/* Template preview card */}
        <div
          ref={templateRef}
          className="flex h-[70vh] w-[75vw] shrink-0 flex-col items-center justify-center gap-8 rounded-2xl border border-border bg-muted/50 sm:w-[60vw] lg:w-[50vw]"
        >
          <div className="flex flex-col items-center gap-4 px-8 text-center">
            <p className="font-script text-lg text-gold">See it in action</p>
            <h3 className="font-heading text-2xl font-light text-foreground sm:text-3xl lg:text-4xl">
              One invitation.
              <br />
              Every detail.
            </h3>
            <p className="mt-2 max-w-sm text-muted-foreground">
              Beautiful bilingual invitations with RSVP tracking, guest
              messaging, and real-time updates.
            </p>
            <Link
              to="/editor/new"
              search={{ template: "double-happiness" }}
              className="mt-4 inline-flex items-center rounded-full border border-gold bg-transparent px-8 py-3 text-sm font-medium text-gold transition-colors hover:bg-gold hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              Try it free
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Delete old section files**

```bash
rm src/components/landing/projects.tsx
rm src/components/landing/services.tsx
rm src/components/landing/about.tsx
```

**Step 3: Commit**

```bash
git add src/components/landing/showcase.tsx
git add -A src/components/landing/
git commit -m "feat(landing): add horizontal scroll showcase, remove old sections"
```

---

### Task 7: Rewrite Social Proof Section

**Files:**
- Modify: `src/components/landing/social-proof.tsx` (full rewrite)

**Step 1: Rewrite the component**

Dark cinematic section with a large stat and testimonial cards:

```tsx
"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    quote:
      "Our guests couldn't stop talking about how beautiful our invitation was. It felt like us.",
    name: "Wei Lin & James",
    location: "Kuala Lumpur",
  },
  {
    quote:
      "We managed everything from one link - RSVPs, meal choices, even song requests. So easy.",
    name: "Shu Qi & David",
    location: "Singapore",
  },
  {
    quote:
      "The bilingual feature was perfect for our families. Both sides felt included.",
    name: "Mei Xin & Adrian",
    location: "Penang",
  },
];

export function SocialProof() {
  const sectionRef = useRef<HTMLElement>(null);
  const statRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const section = sectionRef.current;
    const stat = statRef.current;
    if (!section || !stat) return;

    const ctx = gsap.context(() => {
      gsap.from(stat, {
        opacity: 0,
        y: 40,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: stat,
          start: "top 80%",
          end: "top 50%",
          toggleActions: "play none none reverse",
        },
      });

      gsap.from(".testimonial-card", {
        opacity: 0,
        y: 30,
        stagger: 0.15,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".testimonial-cards",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="social-proof"
      className="relative overflow-hidden py-24 sm:py-32 lg:py-40"
    >
      {/* Background image with dark overlay */}
      <div className="absolute inset-0">
        <img
          src="/photos/landing/showcase-details.jpg"
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Large stat */}
        <div ref={statRef} className="text-center">
          <p className="font-heading text-5xl font-light text-white sm:text-6xl lg:text-7xl">
            84%
          </p>
          <p className="mt-4 text-lg text-white/70 sm:text-xl">
            of guests RSVP within 48 hours
          </p>
        </div>

        {/* Testimonials */}
        <div className="testimonial-cards mt-16 grid gap-6 sm:mt-20 sm:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="testimonial-card rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md sm:p-8"
            >
              <blockquote className="text-sm leading-relaxed text-white/85 sm:text-base">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="mt-4 border-t border-white/10 pt-4">
                <p className="text-sm font-medium text-white">{t.name}</p>
                <p className="text-xs text-white/50">{t.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/landing/social-proof.tsx
git commit -m "feat(landing): cinematic social proof with stat and testimonials"
```

---

### Task 8: Rewrite FAQ Section

**Files:**
- Modify: `src/components/landing/faq.tsx` (full rewrite)

**Step 1: Rewrite as a clean accordion**

```tsx
"use client";
import { useState } from "react";

const faqs = [
  {
    q: "Do my guests need to download an app?",
    a: "No. Your invitation is a beautiful web page that works on any device. Guests just tap the link you share - no app needed.",
  },
  {
    q: "Can I have my invitation in both English and Chinese?",
    a: "Yes! All our templates support bilingual content. Your guests can switch between languages with one tap.",
  },
  {
    q: "How do RSVPs and plus-ones work?",
    a: "Guests RSVP directly from the invitation. They can confirm plus-ones, select meal preferences, and leave you a message - all in one flow.",
  },
  {
    q: "Can I update details after sending?",
    a: "Absolutely. Change venue details, timings, or any content in real-time. Guests always see the latest version.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes. Create and preview your full invitation for free. You only pay when you're ready to publish and share with guests.",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="font-script text-lg text-gold">Common questions</p>
          <h2 className="mt-2 font-heading text-3xl font-light text-foreground sm:text-4xl">
            Everything you need to know
          </h2>
        </div>

        <dl className="mt-12 divide-y divide-border" role="list">
          {faqs.map((faq, i) => (
            <div key={faq.q} className="py-5">
              <dt>
                <button
                  type="button"
                  className="flex w-full items-center justify-between text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  aria-expanded={openIndex === i}
                >
                  <span className="text-base font-medium text-foreground sm:text-lg">
                    {faq.q}
                  </span>
                  <svg
                    className={`ml-4 h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300 ${
                      openIndex === i ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </dt>
              <dd
                className="overflow-hidden transition-all duration-300"
                style={{
                  display: "grid",
                  gridTemplateRows: openIndex === i ? "1fr" : "0fr",
                }}
              >
                <div className="overflow-hidden">
                  <p className="pt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {faq.a}
                  </p>
                </div>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/landing/faq.tsx
git commit -m "feat(landing): clean FAQ accordion with tropical styling"
```

---

### Task 9: Create Closing CTA + Rewrite Footer

**Files:**
- Create: `src/components/landing/closing-cta.tsx`
- Modify: `src/components/landing/footer.tsx` (full rewrite)

**Step 1: Create ClosingCta component**

```tsx
"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "@tanstack/react-router";

gsap.registerPlugin(ScrollTrigger);

export function ClosingCta() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const section = sectionRef.current;
    const content = contentRef.current;
    if (!section || !content) return;

    const ctx = gsap.context(() => {
      gsap.from(content, {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[70vh] items-center justify-center overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="/photos/landing/closing-couple.jpg"
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
      </div>

      {/* Content */}
      <div ref={contentRef} className="relative z-10 px-4 text-center">
        <h2 className="font-heading text-4xl font-light text-white sm:text-5xl lg:text-6xl">
          Ready to begin?
        </h2>
        <p className="mt-4 text-lg text-white/70">
          Create your invitation in minutes. Share it with everyone.
        </p>
        <Link
          to="/editor/new"
          search={{ template: "double-happiness" }}
          className="mt-8 inline-flex items-center rounded-full bg-gold px-10 py-4 text-base font-medium text-white transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          Start Creating
        </Link>
      </div>
    </section>
  );
}
```

**Step 2: Rewrite footer.tsx**

Compact dark footer:

```tsx
import { Link } from "@tanstack/react-router";

const footerLinks = [
  { label: "Templates", href: "#showcase" },
  { label: "FAQ", href: "#faq" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

const socialLinks = [
  { label: "Instagram", href: "https://instagram.com/dreammoments" },
  { label: "Facebook", href: "https://facebook.com/dreammoments" },
  { label: "TikTok", href: "https://tiktok.com/@dreammoments" },
];

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0f1a0f] dark:bg-[#0a120a]">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-4 py-12 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="text-center sm:text-left">
          <p className="font-heading text-lg font-light text-white">
            DreamMoments
          </p>
          <p className="mt-1 text-xs text-white/40">
            Malaysia &amp; Singapore
          </p>
        </div>

        {/* Links */}
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2" aria-label="Footer navigation">
          {footerLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-white/60 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Social */}
        <div className="flex gap-4">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-white/60 transition-colors hover:text-white"
              aria-label={link.label}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>

      <div className="border-t border-white/5 py-4 text-center">
        <p className="text-xs text-white/30">
          &copy; {new Date().getFullYear()} DreamMoments. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
```

**Step 3: Commit**

```bash
git add src/components/landing/closing-cta.tsx src/components/landing/footer.tsx
git commit -m "feat(landing): add closing CTA section and compact footer"
```

---

### Task 10: Update Route Config and Clean Up

**Files:**
- Modify: `src/routes/index.tsx` - update preload hints
- Modify: `src/components/landing/landing.css` - remove unused utilities (particle, card-float, card-enter classes)
- Modify: `src/components/landing/header.tsx` - verify overlay removal compiles

**Step 1: Update route preload**

In `src/routes/index.tsx`, change the preload image from mock-project1.webp to the hero image:

```tsx
head: () => ({
  links: [
    {
      rel: "preload",
      href: "/photos/landing/hero-bg.jpg",
      as: "image",
    },
  ],
}),
```

**Step 2: Clean landing.css**

Remove unused animation classes: `.dm-blur-char`, `.dm-card-float`, `.dm-particle`, `.dm-card-enter` and their keyframes if they were kept from Task 3.

Remove unused utilities: `.shadow-soft` if unused.

Keep: `.font-script`, `.font-heading`, `.bg-gold`, `.text-gold`, `.focus-ring`, reduced-motion media query.

**Step 3: Full build verification**

```bash
pnpm check && pnpm exec tsc --noEmit && pnpm test --run && pnpm build
```

Fix any lint, type, or test errors.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat(landing): clean up routes, CSS, and unused code"
```

---

### Task 11: Visual Review and Polish

**Step 1: Start dev server**

```bash
pnpm dev
```

**Step 2: Review each section in browser**

Open `http://localhost:3000` and check:
- Hero: parallax layers work, text is readable over image, CTA is prominent
- Showcase: horizontal scroll is smooth, photos display correctly, template card at end
- Social proof: dark overlay readable, stat prominent, cards aligned
- FAQ: accordion expands/collapses, styling consistent
- Closing CTA: image loads, text readable, button works
- Footer: compact, links work
- Dark mode: toggle works, all sections look good in both themes
- Mobile: check 390px width, all sections stack properly, horizontal scroll works on touch
- Reduced motion: verify animations disabled

**Step 3: Fix any visual issues found**

Adjust spacing, font sizes, image positioning, overlay opacity as needed.

**Step 4: Final pre-commit checks**

```bash
pnpm check && pnpm exec tsc --noEmit && pnpm test --run && pnpm build
```

**Step 5: Commit**

```bash
git add -A
git commit -m "feat(landing): visual polish and responsive fixes"
```

---

## Task Summary

| Task | Description | Dependencies |
|------|-------------|-------------|
| 1 | Generate photos with Gemini | None |
| 2 | Update color theme to tropical | None |
| 3 | Update CSS animations | Task 2 |
| 4 | Rewrite page composition | None |
| 5 | Rewrite Hero section | Tasks 1, 3 |
| 6 | Create Showcase section | Tasks 1, 3, 4 |
| 7 | Rewrite Social Proof | Tasks 1, 3, 4 |
| 8 | Rewrite FAQ | Tasks 2, 4 |
| 9 | Create Closing CTA + Footer | Tasks 1, 2, 4 |
| 10 | Route config + cleanup | Tasks 4-9 |
| 11 | Visual review and polish | Task 10 |

**Parallel groups:**
- Tasks 1, 2, 4 can run in parallel (no dependencies)
- Tasks 3 depends on 2
- Tasks 5-9 can run in parallel after their dependencies
- Tasks 10-11 are sequential at the end
