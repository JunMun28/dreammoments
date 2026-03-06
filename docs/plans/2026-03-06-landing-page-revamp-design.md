# Landing Page Revamp - Immersive Cinematic Design

**Date:** 2026-03-06
**Status:** Approved

## Summary

Complete overhaul of the DreamMoments landing page into an immersive, cinematic scroll-driven experience. Lush tropical aesthetic targeting MY/SG couples. Strip down to fewer, bolder sections. Generate all photos with Gemini (nano-banana-2).

## Design Direction

- **Style:** Immersive/cinematic - full-bleed photos, parallax storytelling, scroll-driven sequences
- **Emotion:** "This will make our wedding feel special" - uniqueness and personalization
- **Palette:** Lush tropical - greens, warm gold, cream whites, earth browns, natural light through foliage
- **Animation:** Full cinematic - parallax layers, scroll-driven photo sequences, immersive transitions

## Sections

### 1. Hero - "The Opening Shot"
- Full-viewport Gemini-generated hero: lush tropical garden, couple silhouetted against golden light through palm fronds
- 3-layer parallax: foreground foliage + couple + sky
- Cinematic text fade-in: large serif headline "Your love story, beautifully told"
- Slow Ken Burns zoom on background
- Single CTA: "Start Creating" with gentle delay
- Soft animated scroll chevron

### 2. Showcase - "See It Come Alive"
- Scroll-triggered horizontal photo reel: 4-5 Gemini wedding moments (ceremony, laughter, details, reception)
- Each photo ~80% viewport with parallax offset
- Final photo transitions into a live template preview (actual invitation card)
- Caption: "One invitation. Every detail. Effortlessly yours." + secondary CTA

### 3. Social Proof - "Real Couples"
- Dark overlay section
- Large stat fade-in: "84% of guests RSVP within 48 hours"
- 2-3 testimonial cards: names + locations (KL, Singapore, Penang)
- Background: soft-focus tropical floral Gemini image with dark gradient

### 4. FAQ
- Clean accordion on light/cream background
- 5 collapsible items, tightened copy
- Visual breathing room after dark social proof

### 5. Closing CTA + Footer
- Full-bleed Gemini image: couple walking into tropical garden, evening light
- Large text: "Ready to begin?" + "Start Creating" button
- Compact dark footer: links + social + copyright

## Visual System

- **Photos:** 6-8 Gemini-generated, lush tropical, natural light, cinematic DoF
- **Headings:** Cormorant Infant (serif)
- **Accents:** Great Vibes (sparingly)
- **Body:** System sans-serif
- **Colors:** Deep forest green, warm gold, cream, earth brown (replacing pink/rose)

## Animation Stack

- **Keep:** Lenis smooth scroll, GSAP ScrollTrigger (simplified)
- **New:** Parallax layers, horizontal scroll sequence, Ken Burns zoom, cinematic fade reveals
- **Drop:** Three.js/WebGL water ripple, blob cursor, floating particles, velocity scroller, scroll-pinned services, 3D tilt card

## Preserved

- Dark/light theme support
- Clerk auth in header
- Accessibility: skip-to-content, ARIA, keyboard nav, focus-visible, reduced motion
- Responsive design (mobile-first)

## Generated Assets (Gemini)

| # | Description | Aspect | Use |
|---|-------------|--------|-----|
| 1 | Tropical garden, couple silhouette, golden light through palms | 16:9 | Hero background |
| 2 | Ceremony moment under tropical canopy | 3:2 | Showcase reel |
| 3 | Candid laughter, lush greenery backdrop | 3:2 | Showcase reel |
| 4 | Detail shot: rings on tropical leaves/flowers | 3:2 | Showcase reel |
| 5 | Reception toast, warm string lights, tropical setting | 3:2 | Showcase reel |
| 6 | Soft-focus tropical florals (hibiscus, frangipani) | 16:9 | Social proof bg |
| 7 | Couple walking into tropical garden, evening light | 16:9 | Closing CTA bg |
| 8 | Hero foreground foliage layer (transparent/cutout) | 16:9 | Parallax layer |
