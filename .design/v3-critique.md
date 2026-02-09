# V3 Landing Page Proposals -- Design Critique

**Reviewer**: 20-year Awwwards Judge
**Date**: February 2026
**Scoring**: 4 lenses x 25 points = 100 total

---

## Scoring Summary

| Lens (25pts each) | Alpha: Bold Minimalist | Beta: Kinetic Storyteller | Gamma: Cultural Futurist |
|--------------------|:-----:|:-----:|:-----:|
| **Conversion** | 21 | 18 | 20 |
| **Performance** | 21 | 15 | 18 |
| **Accessibility** | 20 | 18 | 21 |
| **Feasibility** | 22 | 14 | 19 |
| **TOTAL** | **84** | **65** | **78** |

**Ranking**: 1st Alpha, 2nd Gamma, 3rd Beta

---

## Proposal Alpha: Bold Minimalist (84/100)

### Conversion: 21/25

**Strengths:**
- Centered editorial hero puts the headline front-and-center. For mobile (75-85% of traffic), a single stacked column is the correct move. No wasted space on a side-by-side layout that collapses anyway.
- "Moving Border Button" is a genuine attention magnet for the CTA. CSS-only, so it works on every device.
- Trust line (Free / No CC / 3 min) is present and positioned correctly below CTA.
- Chinese kickers positioned ABOVE English headings at large sizes signal "this product is for you" to the target audience. This is the strongest cultural conversion signal of all three proposals.
- Pricing: premium card with animated border draws the eye to the upgrade path.

**Weaknesses:**
- The 3D floating card in the hero is positioned below the fold on mobile. The hero becomes pure text -- no product preview until scroll. For couples who arrive from WhatsApp discovery, seeing the product immediately matters.
- Aurora gradient background is visually subtle enough that it could read as a plain white page on a poorly calibrated phone screen. The hero needs more visual anchor.
- No mention of WhatsApp sharing as a feature callout in hero trust line. For MY/SG couples, "Share via WhatsApp" is a conversion-critical feature.

### Performance: 21/25

**Strengths:**
- Aurora backgrounds are pure CSS gradients. Zero image cost. GPU-composited.
- Moving border button is CSS-only (`@keyframes spin` on a pseudo-element). No JS overhead.
- Spotlight cursor is desktop-only, disabled on mobile. Correct decision.
- Page weight estimate of +2-3KB CSS is realistic and well within budget.
- LCP strategy is sound: hero text is pure CSS, card image below fold on mobile.

**Weaknesses:**
- The `backgroundPosition` GSAP animation on aurora layers triggers paint operations on some browsers, not just compositing. Should use `transform: translate()` on a separate layer instead.
- The diagonal clip-path section transitions animated via GSAP scrub -- `clip-path` is compositable on modern browsers but can cause full-layer repaints on older Android Chrome. Need a fallback.
- No explicit font subsetting strategy. Playfair Display + Inter + Cormorant Garamond + Noto Serif SC at multiple weights is potentially 200KB+ in fonts alone if not subsetted aggressively.

### Accessibility: 20/25

**Strengths:**
- Explicit `prefers-reduced-motion` handling for every GSAP animation with the `gsap.set()` fallback pattern.
- CSS catch-all `@media (prefers-reduced-motion: reduce)` already exists.
- Motion variants gated with `initial={reducedMotion ? false : 'hidden'}`.
- Moving border button has a static border fallback for reduced motion.

**Weaknesses:**
- No contrast ratio audit provided. The `--dm-crimson` (#DC2626) on `--dm-bg` (#FAFAF8) needs verification. Quick check: 4.5:1 -- barely passes AA for large text, fails for body. This is a risk if crimson is used for any body-sized text.
- No mention of `aria-label` or screen reader strategy for the cultural elements. The 40vw xi character, the aurora backgrounds, the lattice -- all need `aria-hidden="true"`.
- Focus states defined in existing CSS but not explicitly addressed in the proposal for new interactive components (bento cards, perspective card stack).
- The "random delay" stagger on bento cards could disorient screen reader users who rely on predictable reveal order.

### Feasibility: 22/25

**Strengths:**
- All GSAP features used are free tier: `ScrollTrigger`, `gsap.timeline()`, `gsap.fromTo()`, basic easings. No `DrawSVG`, no `SplitText`, no `MorphSVG`.
- Component inventory is clear with file paths. Three new components, eight modified.
- Estimated 600 lines new + 800 lines modified is realistic for the scope described.
- The perspective card stack uses native CSS `perspective` and `rotateY` -- no GSAP needed for the fan effect, only for entrance animations.
- Implementation priority is well-ordered: foundation first, then hero, then cascading outward.

**Weaknesses:**
- The bento grid layout (3x3 with variable spans) is described in ASCII art but no Tailwind classes are provided. `grid-template-columns` with `span 2` is straightforward but the responsive collapse to single column needs explicit specification.
- The "cursor spotlight" hook creates DOM elements dynamically with `document.createElement()`. In React 19 with SSR (TanStack Start + Nitro), this must be guarded against server-side execution, which it is (via `useEffect`), but the pattern is fragile.

---

## Proposal Beta: Kinetic Storyteller (65/100)

### Conversion: 18/25

**Strengths:**
- Word-by-word testimonial reveal in Social Proof is a powerful trust-building technique. It forces the user to read the testimonial rather than skim past it.
- Price count-up animation (RM 0 -> 49) is a proven conversion technique that anchors the free tier and makes the premium feel accessible.
- The "tension map" concept (calm -> high -> MAX -> med -> med -> low -> high -> calm) shows deliberate pacing awareness. The page has narrative rhythm.

**Weaknesses:**
- The horizontal scroll-jacking gallery in Showcase is the biggest conversion risk. On mobile (75-85% of traffic), this is DISABLED and replaced with a swipe gallery. This means the "single most important animation on the page" does not exist for most users. The Showcase section has two entirely different experiences, and the primary audience gets the lesser one.
- The hero's "three-act" structure occupies 250vh of scroll distance. At minimum, the user must scroll through 2.5x their viewport height before reaching Social Proof. On a 390px phone, that is ~2000px of hero content. This is too long. Users arriving from WhatsApp want to see the product and price quickly, not a parallax art installation.
- The character-by-character animation with `rotateX: -90` (3D rotation per character) creates a lot of compositor layers on a ~40 character headline. On mid-range Android phones (the primary device for MY couples), this could cause visible jank during the entrance sequence.
- The crimson background on the entire Showcase section is bold but may be fatiguing during the horizontal scroll. Users are trapped in a red viewport for the equivalent of 200vh of scrolling. Red fatigue is real.

### Performance: 15/25

**Strengths:**
- Good awareness of compositable properties. The proposal explicitly lists which CSS properties trigger layout vs paint vs composite.
- `will-change` strategy with cleanup after one-shot animations is correctly specified.
- Mobile showcase uses CSS scroll-snap instead of GSAP, which is the correct decision.

**Weaknesses:**
- 24 ScrollTrigger instances on desktop. This is HEAVY. Each ScrollTrigger instance attaches a scroll listener and runs calculations on every frame. At 24 instances, the scroll handler overhead on a 60fps target is significant. The proposal acknowledges this ("reduce to 15 on low-end Android") but the base count is too high.
- The pinned horizontal scroll gallery calculates `track.scrollWidth - window.innerWidth` dynamically, requiring `invalidateOnRefresh: true`. On iOS Safari, viewport resize events fire constantly as the address bar shows/hides. This will cause the ScrollTrigger to recalculate mid-scroll, causing jank.
- 5 parallax layers in the hero at different scroll speeds means 5 GSAP `to()` calls, each with their own `scrollTrigger`. That is 5 scroll listeners firing on every frame just for the hero section.
- The `box-shadow` animation on the premium card (`0 0 40px -10px rgba(218,165,32,0.3)`) triggers paint. The proposal acknowledges this but does not provide an alternative (e.g., using a pseudo-element with `opacity` transition).
- The `useSplitLines` hook with ResizeObserver creates DOM measurement elements, which can cause forced synchronous layout if not batched.
- Estimated 13 days implementation time is ambitious given the complexity of the horizontal scroll gallery + sticky panel + 24 ScrollTrigger instances.

### Accessibility: 18/25

**Strengths:**
- Reduced motion handling is comprehensive. Every GSAP animation has a `reducedMotion` guard with `gsap.set()` to final state.
- The horizontal scroll gallery has a static grid fallback for reduced motion users.
- Word-splitting components are semantically sound (wrapping words in `<span>` preserves text content for screen readers).

**Weaknesses:**
- The pinned horizontal scroll section is not keyboard-navigable. A keyboard user would scroll vertically and be trapped in the pinned section with no way to "scroll horizontally." This is an accessibility failure unless keyboard navigation is explicitly handled (e.g., arrow keys to advance cards).
- The hero occupies 250vh. For users with motor impairments who rely on keyboard navigation, tabbing through 2.5 viewport heights of hero content before reaching the next section is painful.
- The character-by-character animation means screen readers will encounter ~40 individual `<span>` elements for the headline. Even though the text content is preserved, the DOM is heavily fragmented.
- The clip-path circle reveal on Final CTA (`circle(0% at 50% 50%)`) means the section is initially invisible. If GSAP fails to load or ScrollTrigger miscalculates, the entire Final CTA section is invisible. Need a CSS fallback.

### Feasibility: 14/25

**Strengths:**
- The proposal correctly identifies that `SplitText` is not available on GSAP free tier and provides a manual implementation.
- File change summary is detailed with change types (modify vs major rewrite vs new).
- Risk assessment is honest and includes iOS Safari ScrollTrigger pin issues.

**Weaknesses:**
- The pinned horizontal scroll gallery with containerAnimation is the single most complex GSAP pattern available. Getting it right on iOS Safari, Android Chrome, and Firefox requires extensive testing. The "2-3 days" estimate for Phase 3 is almost certainly optimistic -- this alone is 3-5 days with cross-browser debugging.
- The sticky left panel in How It Works with crossfading text content relies on multiple ScrollTrigger `onEnter`/`onEnterBack` callbacks updating DOM text. This is fragile -- if the user scrolls quickly, the crossfade animations can overlap and produce visual artifacts.
- The proposal defines 3 levels of text splitting (word, character, line) but the `useSplitLines` hook with DOM measurement is brittle. Line breaking depends on font loading timing, and if fonts shift after measurement, the line splits will be wrong. This is a CLS risk.
- Total estimated effort of 13 days is too aggressive. This is more like 18-20 days with proper testing.
- The `mask-image` animation for ink wash transition (`linear-gradient`) is not GPU-composited in all browsers. On Firefox, `mask-image` animations trigger full repaints.

---

## Proposal Gamma: Cultural Futurist (78/100)

### Conversion: 20/25

**Strengths:**
- The "Neon Dynasty" cultural confidence is the strongest differentiator of all three proposals. Chinese couples who see a neon-glow xi character will feel like this product was made for them, not adapted for them. This is THE conversion advantage.
- Full-bleed vermillion Features section is bold but correct for this audience. Red is THE Chinese wedding color. Owning it fully is a competitive differentiator.
- The red envelope (hongbao) badge on the premium pricing card is brilliant. It is culturally resonant, visually distinctive, and converts "premium" into a gift metaphor. Angpao/hongbao is EXACTLY how Chinese couples think about wedding spending.
- Lattice at 15% opacity (hero) and 10% (showcase) is finally at visible levels. The architectural framing effect is real.
- The midnight indigo showcase section is visually arresting. Template cards illuminated on dark backgrounds is how art galleries display work -- it elevates the templates.

**Weaknesses:**
- The "Electric Ceremony" palette introduces entirely NEW CSS custom property names (`--cf-*` instead of `--dm-*`). This means renaming every token across the entire codebase, not just the landing page. The landing page components reference `--dm-*` tokens throughout. This is a massive refactoring scope that is not addressed.
- White text on vermillion (#E63946) at 4.55:1 contrast ratio passes AA but BARELY. For body text at 15px on the Features section, this is risky. Users with slight visual impairment will struggle. The proposal acknowledges this but proposes no mitigation for the body-text lines in the feature list.
- The concept pushes so hard on cultural maximalism that it may alienate the ~20% of target users who prefer understated aesthetics. Not every Chinese couple wants a Shanghai Fashion Week runway. Some want "tastefully modern with a cultural touch." The "voltage rhythm" between calm and intense is good, but the intense sections (full vermillion + midnight indigo) cover a large portion of the page.
- No explicit mention of the WhatsApp discovery path or how the hero communicates "this is shareable."

### Performance: 18/25

**Strengths:**
- Neon glow effect is pure CSS `text-shadow`. No JavaScript. No canvas. Negligible GPU cost.
- Paper-cut edges are CSS `clip-path` on the section itself -- no extra DOM elements needed.
- Page weight estimate of < 750KB (under the 800KB constraint) is achievable since no new fonts are added.
- SVG assets (lattice, calligraphy, paper-cut) totaling ~13KB inline is reasonable and avoids network requests.
- GSAP + ScrollTrigger at ~40KB gzipped is standard.

**Weaknesses:**
- The neon-glow `text-shadow` with 4 layers at large sizes (18rem, 22rem) is a GPU memory concern. Each `text-shadow` layer at those sizes creates a large blur pass. On low-end Android devices, this could cause frame drops during scroll. The mobile reduction to 2 layers is good but may not be enough for the cheapest devices.
- The `slow-rotate` animation on the 22rem Final CTA xi character (`180s linear infinite`) means the browser keeps a GPU-composited layer active for the entire page session, even when the section is off-screen. This wastes memory. Should be triggered only when in viewport.
- The ink wash reveal using `clip-path: inset()` is GPU-composited, but the `mask-image` variant mentioned for Showcase is not universally composited. This inconsistency could cause different performance profiles across browsers.
- The lattice pattern at 15% opacity on desktop is a full-viewport inline SVG. SVG pattern fills at this scale can cause rasterization cost on initial render.
- The calligraphy stroke animation with ~45 SVG paths, each with `getTotalLength()` and individual `strokeDasharray`/`strokeDashoffset` animations, creates 45 GSAP instances. This is a lot of managed animations for one section.

### Accessibility: 21/25

**Strengths:**
- Dedicated accessibility section (Section 11) with contrast ratio audit for every foreground/background pair. This is the most thorough of the three proposals.
- Explicit `aria-hidden="true"` and `role="presentation"` for all decorative SVGs.
- Explicit `aria-label` strategy for xi characters (decorative vs functional).
- Chinese kickers with English equivalent `aria-label` for screen readers.
- Keyboard navigation: focusable cards with `tabIndex={0}`, Enter/Space handlers.
- Cultural sensitivity section addressing simplified Chinese, secular symbols, and inclusive color choices.
- Reduced motion handling for every animation type with specific fallback behavior documented.

**Weaknesses:**
- The gold (#D4AF37) on vermillion (#E63946) at 2.8:1 is correctly identified as "decorative only" but the kicker text on the Features section is a functional label ("为何选择" / "WHY DREAMMOMENTS"). This pair must be readable, not just decorative. The kicker at 2rem is "large text" by WCAG standards (>= 18pt bold or >= 24pt normal), so 3:1 is the threshold -- but 2.8:1 still fails.
- The full-bleed vermillion section creates a visual environment that is challenging for users with color sensitivity or photosensitive conditions. No mention of a fallback or reduced-contrast mode.
- Focus ring `3px solid --cf-vermillion` on a vermillion background section would be invisible. Focus ring color must adapt to section background.

### Feasibility: 19/25

**Strengths:**
- Uses only GSAP free tier features. The calligraphy stroke animation uses native `strokeDasharray`/`strokeDashoffset` with GSAP tweens, not the paid DrawSVG plugin.
- All four font families already loaded -- zero additional byte cost.
- The mobile swipe gallery with CSS scroll-snap is the pragmatic correct choice (same as Beta).
- The animation configuration object (`CF_ANIMATION`) is well-structured as an exportable constant.

**Weaknesses:**
- The `--cf-*` token rename is a dealbreaker as specified. Every component in the codebase uses `--dm-*` tokens. A wholesale rename is not a landing page redesign -- it is a brand identity refactor that touches every file.
- The paper-cut clip-path with 24 control points is specified as a static polygon. Making this responsive (different scallop counts on mobile) requires JavaScript-generated clip-paths or separate CSS classes, which adds complexity.
- The "Neon-Glow DoubleHappiness" component is specified but the existing `DoubleHappiness` motif component renders a character, not a text-shadow glow. This is a rewrite, not a modification.
- The indigo (#1A1A3E) and midnight indigo (#0D0D2A) introduce new section background colors that don't exist in the current palette. This requires extending the Tailwind theme and adding new semantic tokens.
- The calligraphy SVG asset (~6KB, 45 paths for 4 characters in correct stroke order) must be hand-authored by someone who knows Chinese calligraphy stroke order. This is a specialized design asset, not a code task.

---

## Red Flags That Must Be Killed (Regardless of Winner)

1. **Beta's 250vh hero**: No. The hero must be 100vh maximum. Couples from WhatsApp need to see value within one scroll. A 2.5-viewport hero is self-indulgent.

2. **Beta's 24 ScrollTrigger instances**: Cap at 12-14. Combine parallax layers, remove individual feature cascade triggers in favor of a single container trigger.

3. **Gamma's `--cf-*` token rename**: Absolutely not. The `--dm-*` namespace is used across the entire application (dashboard, editor, templates). The landing page redesign must use the existing `--dm-*` namespace, adding new tokens as needed.

4. **Gamma's gold on vermillion body text (2.8:1 ratio)**: This contrast pair cannot be used for any text smaller than 24px or 18px bold. On the Features section, use white text only.

5. **Beta's box-shadow animation on premium card**: Box-shadow animations trigger paint. Replace with a pseudo-element using `opacity` transition.

6. **All three: Font loading unaddressed**: None of the proposals specify font subsetting or `font-display` strategy. With 4 font families, this is a performance-critical gap. Must use `font-display: swap` with matched fallback metrics and subset to Latin + CJK Basic (for the Chinese kickers only).

7. **Gamma's neon text-shadow at 18-22rem**: Test on a Redmi Note or Samsung A-series phone (the most common devices for MY/SG couples in the 25-35 age range). If it causes frame drops, reduce to 2 shadow layers or use a pre-rendered image for the glow effect.

8. **Beta's character-by-character `rotateX: -90` on mobile**: 3D rotation creates individual compositor layers for each character span. On a 40-character headline, that is 40 layers. On mobile, simplify to `y: 20, opacity: 0` only.

---

## Stolen Ideas (Best Elements From Each Proposal)

### From Alpha (Winner)
- **Aurora background component**: Reusable, pure CSS, zero-weight. Use in Hero and Pricing.
- **Moving border button**: The rotating conic gradient border is visually distinctive and CSS-only. Use for primary CTAs.
- **Centered editorial hero layout**: Correct for mobile-first. The Swiss-design center alignment is better than left-right split.
- **Chinese kickers above English, at display scale**: This is the single most effective cultural conversion signal.
- **Bento grid for Features**: Variable-size cards create visual interest without gimmicky animation.
- **Section background alternation (light/dark/light/muted/light/accent/dark/light)**: Good rhythm.

### From Beta (Eliminated)
- **Word-by-word testimonial reveal** (Social Proof): Steal this. It forces engagement with the trust content. Use GSAP scrub with word-level opacity.
- **Price count-up animation** (Pricing): Steal this. Counting from 0 to 49 is a proven conversion technique.
- **Golden thread stroke-draw enhanced with step card entrance** (How It Works): The existing stroke-draw is good; Beta's enhancement of per-step card entrance on scroll trigger is worth adopting.
- **SplitChars / SplitWords utility components**: These are useful for targeted text animations without the paid SplitText plugin. Keep them simple.

### From Gamma (Runner-up)
- **Neon-glow xi at visible opacity**: The concept is right -- xi at 12% with text-shadow glow instead of 3% is dramatically more impactful. Adapt for the `--dm-*` palette.
- **Lattice at architectural opacity (10-15%)**: The lattice pattern should be VISIBLE. 0.04 is invisible. Push to 0.08-0.12.
- **Hongbao (red envelope) badge on premium pricing**: Brilliant culturally resonant touch. Steal this.
- **Vermillion section for Features**: Bold but correct. One full-bleed crimson section creates a memorable moment. Adopt but with careful contrast handling.
- **Paper-cut edges as structural borders**: Use between 2-3 section transitions, not everywhere.
- **Calligraphy stroke animation in Final CTA**: The stroke-by-stroke reveal for Chinese characters is culturally rich and visually mesmerizing. Keep it.
- **Three-layer visual hierarchy** (Shout / Narrative / Texture): This framework prevents visual chaos.

---

## Blind Spots All Three Missed

1. **WhatsApp OG Image Preview**: When the link is shared via WhatsApp (the primary discovery channel), the OG image is the first touchpoint. None of the proposals discuss what the shared preview looks like or how to optimize it for cultural appeal.

2. **Loading state / skeleton**: What does the page look like while GSAP loads? If GSAP is loaded async (as Gamma suggests), there is a window where the page is static HTML with no animation hooks. This needs a graceful loading strategy, not just "content renders first."

3. **Scroll restoration on back-navigation**: TanStack Router supports scroll restoration, but with GSAP ScrollTrigger pins and scrubbed animations, navigating away and back may produce broken scroll states. This needs explicit handling.

4. **RTL/LTR considerations**: While the target audience is Chinese (LTR), some Malaysian couples may view on devices with system-level RTL settings (unlikely but possible via Arabic language settings). The diagonal clip-paths and horizontal scrolls would break in RTL mode.

5. **Above-the-fold pricing signal**: None of the proposals show the price in the hero. For price-sensitive MY/SG couples, "From RM49" or "Free to start" visible above the fold without scrolling could significantly improve conversion. Beta mentions "From RM49" in the hero subtitle, which is the closest any proposal gets.

6. **Social proof specificity**: The stats ("500+ couples," "4.9/5 rating") are identical across all three. For a product in MY/SG, showing "500+ Malaysian & Singaporean couples" or "Trusted in KL, JB, Singapore" adds geographic specificity that builds trust with the local audience.

7. **Template preview interaction on mobile**: All three proposals show template cards as static images. On mobile, a "peek" interaction (swipe up to expand to full-screen preview) would give users a taste of the product without navigating away. This is how Canva and similar tools drive mobile conversion.

8. **Angpao / QR code feature visibility**: The angpao QR code feature is a significant differentiator for Chinese weddings, yet it is buried in the Features list in all three proposals. It deserves a hero-level callout or dedicated micro-section.

9. **Language toggle**: For bilingual MY/SG Chinese couples, some may prefer a Malay or English-primary view. None of the proposals consider a language toggle, even though the bilingual kicker strategy implicitly acknowledges the audience is bilingual.

10. **Dark mode**: All three proposals define dark section variants but none address system-level dark mode preference (`prefers-color-scheme: dark`). For 75-85% mobile users, many will have dark mode enabled. The current page forces light mode -- this is fine for a wedding product but should be a deliberate decision, not an oversight.
