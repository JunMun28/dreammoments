# DreamMoments UI Design Report

**Prepared by**: UI Designer Agent
**Date**: February 2026
**Scope**: Full visual design audit of templates, editor UI, design tokens, typography, colors, animations, and responsive design

---

## Executive Summary

DreamMoments has a strong foundational design system with thoughtful design tokens, consistent accessibility patterns, and four distinct template themes. The codebase demonstrates care for reduced motion preferences, touch-friendly targets (44px minimum), and focus-visible states. However, several areas need visual polish to achieve the "premium templates that look like RM2,000 designer work" promise from the PRD. Key gaps include: **inconsistent font loading** (PRD specifies per-template fonts but the CSS only loads Outfit + Reenie Beanie globally), **template-specific CSS not leveraging the config-driven design tokens**, **Garden Romance deviating significantly from its PRD description** (it is built as a Chinese Red theme instead of the natural/garden theme described), and the **editor UI needing refinement in its collapsed panel state and mobile-to-desktop transition**. Overall, the design is 70% complete with significant opportunity for visual uplift.

---

## Template Design Review

### 1. Love at Dusk (LoveAtDuskInvitation.tsx)

**PRD Spec**: Romantic, cinematic, Chinese elegance. Dark background with warm brown primary and gold accent.

**Current Implementation**:
- Color palette closely matches PRD: dark background (`#0c0a08`), crimson primary (`#8B2942`), gold accent (`#C9A962`/`#D4AF37`), cream text
- Uses CSS custom properties (`--love-*`) scoped to `.love-at-dusk` wrapper -- good isolation
- Hero section has a parallax background gradient and glow effect
- Uses `dm-reveal` scroll animation with `slide-left`/`slide-right` variants for alternating card reveals

**Strengths**:
- Beautiful dark theme with atmospheric crimson/gold accents
- The `love-hero-glow` radial gradient creates an appealing spotlight effect
- RSVP form has proper dark-theme styling with consistent border/bg colors
- Consent checkbox and privacy link are well integrated

**Issues**:
- PRD specifies `Playfair Display / Noto Serif SC` for headings but the template config has `headingFont: "'Playfair Display', 'Noto Serif SC', serif"` -- these fonts are **not loaded in `styles.css`** (only Outfit and Reenie Beanie are imported from Google Fonts)
- The hero uses `text-3xl font-semibold` (Outfit body font) instead of the serif display font specified in tokens
- Gallery photos use fixed `h-32` height which crops images too aggressively
- The `dm-reveal` animation is a single-shot CSS animation that fires on page load, not scroll-triggered; `useScrollReveal()` hook is used but relies on `data-reveal` attributes and Intersection Observer -- animation timing is not staggered by distance from viewport
- No sparkle effects on gold elements as specified in PRD
- Missing parallax on hero photo -- `dm-parallax` class is applied to `love-hero-bg` but this is a gradient div, not a photo

**Verdict**: 65% aligned with PRD. Needs font loading, richer hero with actual parallax photo, and signature sparkle animations.

### 2. Garden Romance (GardenRomanceInvitation.tsx)

**PRD Spec**: Natural, light, outdoor elegance with forest green primary (`#2D5A3D`), blush pink accent (`#E8B4B8`), warm white background (`#FDF8F5`). Fonts: Cormorant Garamond (headings), Lato (body), Sacramento (script).

**Current Implementation**:
- **Major deviation**: The template is implemented as a **Chinese Red theme** (`#C41E3A` crimson, `#D4AF37` gold, `#0D0D0D` rich black background in config, but actually uses a light cream background in components). The PRD Garden Romance is a completely different aesthetic.
- The nameZh "花园之誓" and description "Bold Chinese red and gold" confirm the implementation diverged intentionally
- This is the most visually polished template -- uses Motion (framer-motion successor) for scroll animations with variants (`fadeUp`, `scaleIn`, `slideFromLeft`, `slideFromRight`)
- Per-character AnimatedText reveal on hero names
- StoryProgressLine with scroll-linked progress
- Beautiful bilingual date formatting (English + Chinese)
- Lattice pattern background ornament
- Glass morphism cards (`gr-glass-dark`, `gr-glass-light`) with backdrop blur

**Strengths**:
- Most cinematic scroll experience of all templates
- Excellent use of Motion library for viewport-triggered animations
- Rich gallery layout with responsive grid (`md:col-span-2 md:row-span-2` for hero photo)
- Sample Unsplash photos give it a finished, premium feel
- Proper `useReducedMotion()` hook to skip all animations
- Gold dividers as section separators

**Issues**:
- PRD Garden Romance is an entirely different template (green/pink nature theme) -- this is effectively an additional Chinese theme rather than a replacement
- Font loading: specifies `Playfair Display` and `Noto Serif SC` in config but uses inline styles; fonts are not guaranteed to load without `@import`
- Template config says `background: "#0D0D0D"` (dark) but the component renders on cream/ivory backgrounds -- disconnect between config and rendering
- Venue section has hardcoded Unsplash image that won't work when users don't upload photos
- RSVP form on the deep red background has good contrast but the input borders are very subtle (`rgba(212,175,55,0.3)`)

**Verdict**: 80% polished visually but 20% aligned with PRD spec. This is a strong Chinese wedding template but it is NOT the Garden Romance described in the PRD.

### 3. Eternal Elegance (EternalEleganceInvitation.tsx)

**PRD Spec**: Classic Western, timeless sophistication. Black primary (`#1C1C1C`), champagne gold accent (`#C9A962`), white background, minimal. Fonts: Didot/Bodoni, Garamond, Pinyon Script.

**Current Implementation**:
- Color palette matches PRD exactly
- Scoped CSS custom properties (`--eternal-*`) provide clean token isolation
- Monogram SVG draws the couple's initials in a circle -- partially implements the PRD's "monogram draws itself" animation
- Letter-by-letter tagline reveal using CSS `animation-delay` per character
- Clean, sophisticated card layouts with minimal decoration

**Strengths**:
- Most faithful to its PRD spec of all templates
- Appropriate use of restraint -- no floating particles or heavy effects
- The monogram is a tasteful branding element
- Footer with dark background creates elegant closing
- Good section rhythm with alternating white/surface backgrounds

**Issues**:
- Fonts not loaded: `Didot`, `Bodoni MT`, `Cormorant Garamond`, `Garamond`, `Pinyon Script` are all specified in config but none are imported via Google Fonts
- Since Didot/Bodoni are system fonts not available on most systems, the template falls back to generic serif which breaks the premium feel
- Monogram is static (opacity: 0.3 circle with text) -- PRD requests SVG line animation (draw effect) which is not implemented
- Gallery section lacks the "full-width slideshow" specified in PRD; instead uses a standard 3-column grid identical to other templates
- Letter animation is CSS-only and not viewport-triggered, so it fires on page load even if the tagline is below the fold
- The `details` section combining schedule + venue is very minimal (just two text lines) -- needs richer layout for a premium feel
- Couple card layout uses name as React key which would break if both partners have the same name

**Verdict**: 70% aligned with PRD. Needs proper font loading, SVG draw animation, and richer details section.

### 4. Blush Romance (BlushRomanceInvitation.tsx)

**PRD Spec**: This is a 4th template not in the original PRD (which specifies 3). Added as a garden/botanical theme.

**Current Implementation**:
- Soft blush tones: primary `#7F1D1D`, secondary `#D94674`, accent `#FFF1F2`, background `#FFF6F8`
- Config specifies `Cormorant Garamond` (heading), `Lato` (body), `Sacramento` (accent) -- these are the fonts from the PRD's Garden Romance spec
- Essentially fills the visual niche that Garden Romance was supposed to occupy
- Uses `blush-*` CSS classes with matching custom properties

**Strengths**:
- Hero section with decorative arch frame (`blush-hero-frame`) and bloom gradient
- Soft, romantic color palette that works well for the garden category
- Timeline layout for schedule section with grid-based time/content split
- Consistent use of `blush-kicker`, `blush-heading`, `blush-body` typography classes
- Photo hover zoom effect

**Issues**:
- Fonts not loaded (same pattern as other templates -- Cormorant Garamond, Lato, Sacramento not imported)
- The hero frame is a CSS border with border-radius creating an arch shape -- works but could be more decorative (e.g., SVG botanical frame)
- Gallery photos lack defined aspect ratio -- `blush-photo-frame` class doesn't set height
- Missing the "floral" and "botanical" decorative elements promised by garden-category templates
- No animated vine/flower decorations -- just standard fade-up reveals
- The venue map is a placeholder SVG with no actual map integration
- Schedule timeline uses a flat grid layout that doesn't visually communicate progression

**Verdict**: 60% complete. Needs font loading, botanical decorative elements, and more personality to differentiate from other templates.

---

## Design Token System Assessment

### Current Architecture

The design token system has two layers:

1. **Global tokens** in `styles.css` `:root` -- app shell colors (`--dm-bg`, `--dm-ink`, `--dm-peach`, etc.)
2. **Template-scoped tokens** -- CSS custom properties on wrapper elements (`.love-at-dusk`, `.eternal-elegance`) and config objects (`tokens.colors`, `tokens.typography`)

### Strengths

- Clear separation between app shell tokens and template tokens
- Tailwind CSS 4's `@theme inline` block properly bridges CSS custom properties to utility classes
- Semantic naming: `--dm-bg`, `--dm-surface`, `--dm-ink` map to clear UI roles
- Accent color variations (`--dm-peach`, `--dm-sage`, `--dm-lavender`) provide palette depth

### Issues

1. **Config-rendering disconnect**: Template configs define `tokens.colors` and `tokens.typography` but the rendering components don't consume them programmatically. Garden Romance defines `background: "#0D0D0D"` in its config but renders on cream. The tokens serve as documentation rather than actual style drivers.

2. **Missing font loading pipeline**: Templates specify 12+ distinct fonts across configs but `styles.css` only imports 3 (Outfit, Reenie Beanie, Noto Serif SC). Critical missing imports:
   - Playfair Display (Love at Dusk, Garden Romance headings)
   - Cormorant Garamond (Blush Romance, Eternal Elegance)
   - Lato (Blush Romance body)
   - Sacramento (Blush Romance accent)
   - Garamond (Eternal Elegance body)
   - Pinyon Script (Eternal Elegance accent)
   - Inter (Garden Romance body)

3. **Animation tokens not used**: Each template config specifies `animations.scrollTriggerOffset`, `defaultDuration`, and `easing` but these values are not referenced by the animation implementations. Garden Romance hardcodes `duration: 0.8` and its own easing curve.

4. **No dark mode support**: The `@custom-variant dark` is defined but no dark mode tokens exist. The editor shell defines `.dm-shell-dark` but templates don't respond to it.

### Recommendation

Bridge the config tokens to actual CSS by rendering them as CSS custom properties on the template wrapper `<div>`, then reference them in styles. This makes the config-driven architecture the PRD describes actually functional.

---

## Editor UI Review

### Layout (EditorLayout.tsx)

**Desktop**: Three-column grid with optional section rail (64px) + preview (flexible) + context panel (380px/40px collapsed). Clean, focused layout.

**Mobile**: Vertical stack with sticky toolbar, scrollable preview, and sticky pill bar that swaps to a bottom sheet.

**Strengths**:
- `100dvh` usage ensures proper mobile viewport handling
- Safe area inset padding for notched devices
- Grid-based layout with `max-w-[1440px]` prevents ultra-wide stretching
- Panel collapse animation to 40px provides space recovery

**Issues**:
- When panel is collapsed, the 40px column provides a ChevronLeft expand button but no section indicator -- user loses context
- Mobile bottom sheet replaces pill bar -- there's no way to see other sections while editing one
- No explicit tablet portrait layout -- tablets between 768px and 1024px may render poorly with the desktop three-column grid
- The `panelWidth` variable uses string template literals for grid columns which could cause layout shifts during transitions

### Section Rail (SectionRail.tsx)

**Strengths**:
- SVG completion ring around each icon -- elegant progress indicator
- Proper ARIA: `role="tablist"`, `role="tab"`, `aria-selected`, keyboard navigation with ArrowUp/Down/Home/End
- Scrollbar hidden but scroll preserved

**Issues**:
- No tooltips on hover -- icons alone may not be recognizable for all section types
- The `CompletionRing` SVG has a fixed 44x44 viewport which aligns with the 44px button size, but the ring is slightly offset from the icon center on some renders
- No visual indicator of which sections are hidden (toggled off) in the rail

### Context Panel (ContextPanel.tsx)

**Strengths**:
- Section-specific header with visibility toggle and AI button
- Key-based re-mount on section change triggers CSS `dm-section-slide-in` animation
- `dm-scroll-thin` provides a branded scrollbar
- Error states with left-border indicator on fields

**Issues**:
- The list field resolution logic (lines 103-128) is complex and fragile -- it searches for the first array property in the section data rather than using a direct field path mapping
- When collapsed, the aside is only 40px wide with a single chevron button -- could show mini section indicators

### Field Renderer (FieldRenderer.tsx)

**Strengths**:
- Consistent input styling: `rounded-2xl`, `border-dm-border`, `bg-dm-surface-muted`
- AI magic button (sparkle icon) shown contextually for fields with `aiTaskType`
- Proper label/input association via `htmlFor`/`id`
- Error output uses `<output>` with `aria-live="polite"`

**Issues**:
- No character count indicator for textarea fields
- No placeholder text showing sample data -- fields load empty, losing the "pre-filled with realistic examples" UX the PRD describes
- Date inputs don't have a date picker UI enhancement beyond native browser
- The AI magic button is small (32x32) but adequate; it could benefit from a tooltip

### AI Assistant Drawer (AiAssistantDrawer.tsx)

**Strengths**:
- Desktop: right-side drawer with backdrop blur, slide-in/out animations
- Mobile: delegates to MobileBottomSheet for native-feeling interaction
- Focus trap via `useFocusTrap` hook
- Proper `aria-modal`, `role="dialog"`, `aria-label`
- Task selector pills with `aria-pressed` states
- Remaining generations counter in footer

**Issues**:
- The drawer width is fixed at 480px which may feel wide on smaller desktop screens (1024px)
- No "Regenerate" button label as PRD specifies -- only "Generate" and then the result shows "Apply to Invitation"
- The suggestion card preview (`AiSuggestionCard`) shows raw JSON-like output -- needs formatted preview
- Close animation uses `setTimeout(300)` which could desync from the actual CSS animation duration

### Toolbar (EditorToolbar.tsx)

**Strengths**:
- Desktop: horizontal toolbar with Dashboard back link, undo/redo, save status, preview, publish
- Mobile: compact toolbar with overflow menu, keyboard-navigable with arrow keys
- Save status dot indicator (green/yellow/gray)
- All buttons meet 44px minimum touch target

**Issues**:
- No keyboard shortcut indicators on desktop (e.g., "Ctrl+Z" next to Undo)
- Mobile overflow menu appears as a dropdown but has no animation
- The "Publish" button has no confirmation dialog -- could accidentally publish

### Mobile Bottom Sheet (MobileBottomSheet.tsx)

**Strengths**:
- Snap points support for multi-height states
- Drag-to-dismiss with configurable thresholds (increased for dirty forms)
- Keyboard-aware: adjusts height when virtual keyboard opens using `visualViewport` API
- Focus trap with dynamic element re-querying on Tab press
- Reduced motion support: skips animations entirely

**Issues**:
- The drag handle is a `<button>` but it only responds to touch events, not pointer events -- won't work with mouse-based testing
- `pb-8` bottom padding on content may be insufficient on devices with large safe area insets
- No haptic feedback on snap transitions (would require native API)

---

## Typography Assessment

### Current State

The app uses a minimal type system:
- **Heading font**: Outfit (loaded via Google Fonts)
- **Body font**: Outfit (same as heading)
- **Accent font**: Reenie Beanie (loaded via Google Fonts)
- **CJK serif**: Noto Serif SC (loaded via Google Fonts)

### Issues

1. **Outfit as both heading and body** creates typographic monotony in the editor shell. The PRD envisions a more varied type system.

2. **Template fonts are not loaded**: This is the single biggest visual quality gap. The templates specify premium serif fonts (Playfair Display, Cormorant Garamond, Didot) that would dramatically elevate the perceived quality, but they fall back to system fonts because no `@import` or `<link>` exists for them.

3. **Reenie Beanie is only used** for the `.font-accent` utility class (landing page elements) and is not referenced by any template. The accent fonts specified per-template (Great Vibes, Sacramento, Pinyon Script) are not loaded either.

4. **Chinese typography**: Noto Serif SC is loaded and used by Love at Dusk and Garden Romance for Chinese text. This is the correct choice for formal Chinese wedding content.

5. **Font display**: The Google Fonts import does not specify `&display=swap` (though it does include `display=swap` in the URL). This is correct for preventing FOIT (Flash of Invisible Text).

### Recommendation

Add a font loading module that imports all template-required fonts. Use `@import` in `styles.css` or dynamic `<link>` elements per template to avoid loading unused fonts:

```
Playfair Display: Love at Dusk, Garden Romance
Cormorant Garamond: Blush Romance, Eternal Elegance
Lato: Blush Romance
Sacramento: Blush Romance
Garamond: Eternal Elegance (system font fallback may suffice)
Inter: Garden Romance
Pinyon Script: Eternal Elegance
```

---

## Color Palette Analysis vs PRD

### Love at Dusk

| Token | PRD | Implementation | Match |
|-------|-----|----------------|-------|
| Primary | `#544945` (warm brown) | `#B30E0E` (bright red) | NO |
| Accent | `#D4AF37` (gold) | `#FFE094` (light gold) | Partial |
| Background | `#1a1a1a` (dark) | `#0c0a08` (darker) | Close |
| Text | `#F5F5F5` (cream) | `#F5F5F5` | YES |

The implementation chose a more vibrant crimson/red primary instead of the PRD's warm brown, which creates a stronger Chinese wedding aesthetic. The CSS layer uses `--love-primary: #8B2942` (deep crimson) while the config uses `#B30E0E`. This inconsistency should be resolved.

### Garden Romance

| Token | PRD | Implementation | Match |
|-------|-----|----------------|-------|
| Primary | `#2D5A3D` (forest green) | `#C41E3A` (crimson) | NO |
| Accent | `#E8B4B8` (blush pink) | `#D4AF37` (gold) | NO |
| Background | `#FDF8F5` (warm white) | `#0D0D0D` (in config) / cream (in render) | NO |
| Text | `#2C2C2C` (charcoal) | `#FFF8E7` (ivory) | NO |

Complete deviation. The implementation is a Chinese red/gold theme, not the garden/green theme from the PRD.

### Eternal Elegance

| Token | PRD | Implementation | Match |
|-------|-----|----------------|-------|
| Primary | `#1C1C1C` (black) | `#1C1C1C` | YES |
| Accent | `#C9A962` (champagne gold) | `#C9A962` | YES |
| Background | `#FFFFFF` (white) | `#FFFFFF` | YES |
| Text | `#333333` (dark gray) | `#333333` | YES |

Perfect match. This is the most PRD-faithful template.

### Blush Romance (not in PRD)

Not in original PRD, so no direct comparison. The colors (deep rose `#7F1D1D`, pink `#D94674`, blush backgrounds) are cohesive and work well for a romantic garden category.

---

## Animation Quality Review

### Scroll Animations

**Two distinct systems in use**:

1. **CSS-based `dm-reveal`** (Love at Dusk, Eternal Elegance, Blush Romance): Uses `data-reveal` attributes + `useScrollReveal()` Intersection Observer hook. Elements get a `fadeUp` animation when they enter the viewport. Simple but effective.

2. **Motion library** (Garden Romance only): Uses `motion.div` components with `whileInView` viewport detection, `variants`, and stagger containers. Much richer animation system with spring physics and per-element timing.

### Quality Gap

The Garden Romance template has dramatically better animation quality than the other three. Specific differences:
- Garden Romance: per-character text reveals, scroll-linked progress bar, spring-based hover effects, staggered container reveals
- Others: single `translateY(30px) -> 0` fade-up with optional `transitionDelay` staggering

### Recommendations

1. Extend Motion library usage to at least the Love at Dusk template (which is meant to be the most cinematic)
2. The `useParallax()` hook in Love at Dusk applies `data-parallax` but the effect is subtle since it's on a gradient div rather than a photo
3. Add the PRD's "sparkle effects on gold elements" for Love at Dusk
4. Add the PRD's "monogram draws itself" SVG line animation for Eternal Elegance
5. Add the PRD's "flowers bloom on scroll" for Garden Romance (currently not botanical at all)

### Reduced Motion

Excellent support across the board:
- Global `prefers-reduced-motion: reduce` catch-all in `styles.css` that sets `animation-duration: 0.01ms !important`
- Garden Romance uses `useReducedMotion()` hook to conditionally skip all Motion animations
- Per-component `@media (prefers-reduced-motion: reduce)` blocks for specific classes
- Bottom sheet skips closing animation when reduced motion is preferred

---

## Responsive Design Assessment

### Breakpoints

The codebase uses Tailwind's default breakpoints:
- `sm: 640px` -- text size increases
- `md: 768px` -- grid layouts shift to multi-column
- `lg: 1024px` -- max-width containers, larger grids

### Template Responsiveness

**Love at Dusk**: Good. Hero adjusts text size with `sm:text-5xl`. Couple cards stack on mobile. RSVP form uses `sm:grid-cols-2`. Gallery uses responsive grid `sm:grid-cols-2 lg:grid-cols-3`.

**Garden Romance**: Best. Uses `100svh` for hero, responsive text scaling (`text-6xl sm:text-8xl lg:text-9xl`), story milestones alternate layout direction on desktop. Gallery has sophisticated responsive grid with span rules.

**Eternal Elegance**: Good. Uses media query in CSS for section padding (`768px`). Couple cards use `md:grid-cols-2`. Gallery is `md:grid-cols-3`.

**Blush Romance**: Good. Venue uses `@media (min-width: 768px)` for grid-template-columns. Schedule timeline uses fixed grid-template-columns (`80px 1fr`) which may be tight on very small screens.

### Editor Responsiveness

The editor uses `useMediaQuery` hook for breakpoint detection:
- `isMobile`: `(max-width: 767px)` -- vertical stack layout
- `isTablet`: `(min-width: 768px) and (max-width: 1023px)` -- still vertical stack
- `isTabletLandscape` and `isMobileLandscape` -- supported but the layout code treats them same as mobile
- Desktop: `>= 1024px` -- three-column grid

**Issue**: The 768px-1023px tablet range uses mobile layout, which means tablets in portrait mode see the full-screen preview + bottom sheet pattern rather than a split view. This may feel wasteful of screen space on 10" tablets.

### Mobile-specific

- `100dvh` used consistently for viewport height
- `env(safe-area-inset-top)` padding on toolbar
- Touch targets meet 44px minimum (`min-h-11`, `min-h-[44px]`)
- Bottom sheet with drag-to-dismiss and snap points
- Keyboard-aware height adjustment via `visualViewport` API
- `-webkit-overflow-scrolling: touch` for momentum scrolling

---

## Top 10 Specific Visual Improvements

### 1. Load Template-Specific Fonts

**Priority**: Critical
**Impact**: Transforms perceived quality from "web app" to "premium invitation"

In `src/styles.css`, add font imports for all template fonts. Use `font-display: swap` to prevent FOIT:

```css
@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Cormorant+Garamond:wght@300;400;600&family=Lato:wght@300;400;700&family=Sacramento&family=Pinyon+Script&family=Inter:wght@300;400;500;600&display=swap");
```

**Files**: `src/styles.css` (line 1)

### 2. Bridge Template Config Tokens to CSS Custom Properties

**Priority**: High
**Impact**: Makes the config-driven architecture actually function

In `InvitationRenderer.tsx` or each template component, render the config tokens as CSS custom properties on the wrapper element:

```tsx
// In template wrapper div
<div style={{
  '--tpl-primary': tokens.colors.primary,
  '--tpl-secondary': tokens.colors.secondary,
  '--tpl-heading-font': tokens.typography.headingFont,
  // etc.
}}>
```

Then reference these in template CSS instead of hardcoded values. This ensures the config is the single source of truth.

**Files**: `src/components/templates/InvitationRenderer.tsx`, each template's invitation component

### 3. Add Monogram SVG Draw Animation for Eternal Elegance

**Priority**: Medium
**Impact**: Delivers the PRD's signature animation for this template

In `EternalEleganceInvitation.tsx`, replace the static SVG monogram with an animated stroke-dasharray animation:

```css
.eternal-monogram-svg circle {
  stroke-dasharray: 330;
  stroke-dashoffset: 330;
  animation: eternal-draw 2s ease-out forwards;
}

@keyframes eternal-draw {
  to { stroke-dashoffset: 0; }
}
```

**Files**: `src/styles.css` (eternal elegance section), `src/components/templates/eternal-elegance/EternalEleganceInvitation.tsx`

### 4. Upgrade Love at Dusk to Use Motion Library

**Priority**: High
**Impact**: Brings cinematic scroll pacing to the template described as "cinematic" in the PRD

Replace `useScrollReveal()` + `data-reveal` with Motion's `whileInView` variants, similar to how Garden Romance works. This enables:
- Staggered reveals with spring physics
- Scroll-linked progress indicators
- Per-element timing control

**Files**: `src/components/templates/love-at-dusk/LoveAtDuskInvitation.tsx`

### 5. Add Sample Data Placeholders to Editor Fields

**Priority**: High
**Impact**: Delivers the "pre-filled with realistic examples" UX from the PRD

In `FieldRenderer.tsx`, use the `field.sample` value from the template config as the `placeholder` prop on inputs/textareas. Currently, fields have no placeholder text:

```tsx
<input
  {...sharedProps}
  placeholder={field.sample || ''}
  // ...
/>
```

**Files**: `src/components/editor/FieldRenderer.tsx` (lines 137-148)

### 6. Add Botanical Decorative Elements to Blush Romance

**Priority**: Medium
**Impact**: Differentiates it from other templates and fulfills garden-category promise

Add SVG floral frame elements to the hero section (replacing the CSS border arch), leaf/vine decorations on section dividers, and subtle floral watermarks. These can be lightweight inline SVGs:

```tsx
// Example: SVG botanical divider between sections
<div className="blush-divider" aria-hidden="true">
  <svg viewBox="0 0 200 20" fill="var(--dm-peach)" opacity="0.3">
    {/* Leaf/vine path */}
  </svg>
</div>
```

**Files**: `src/components/templates/blush-romance/BlushRomanceInvitation.tsx`, `src/styles.css`

### 7. Add Tooltips to Section Rail Icons

**Priority**: Low
**Impact**: Improves editor discoverability for first-time users

The section rail uses icons only (no text labels). Add native `title` attributes or a custom tooltip component on hover:

```tsx
<button
  // ...existing props
  title={section.label}
>
```

For a more polished approach, add a CSS-only tooltip that appears on hover with the section name.

**Files**: `src/components/editor/SectionRail.tsx` (line 160)

### 8. Implement Full-Width Gallery Slideshow for Eternal Elegance

**Priority**: Medium
**Impact**: Distinguishes Eternal Elegance gallery from other templates' grid layouts

Replace the standard 3-column grid with a full-width horizontal slideshow/carousel with navigation arrows and dot indicators. This matches the PRD spec of "full-width slideshow."

**Files**: `src/components/templates/eternal-elegance/EternalEleganceInvitation.tsx` (gallery section, lines 181-210)

### 9. Fix Editor Panel Collapse State

**Priority**: Medium
**Impact**: Improves editor UX when maximizing preview area

When the context panel is collapsed (40px), show mini section icons vertically instead of just a chevron. This keeps the user oriented about which section they're editing and provides quick access to other sections without expanding.

**Files**: `src/components/editor/ContextPanel.tsx` (lines 48-61), `src/components/editor/EditorLayout.tsx`

### 10. Add Keyboard Shortcut Hints to Desktop Toolbar

**Priority**: Low
**Impact**: Power user discoverability

Show keyboard shortcut hints next to toolbar buttons on desktop (e.g., "Undo (Ctrl+Z)", "Preview (Ctrl+P)"). These should appear as subtle text next to or below the button labels:

```tsx
<button>
  <Undo2 />
  Undo
  <kbd className="ml-2 text-[10px] text-dm-muted">Ctrl+Z</kbd>
</button>
```

**Files**: `src/components/editor/EditorToolbar.tsx` (desktop toolbar, lines 244-307)

---

## Summary Priority Matrix

| # | Improvement | Priority | Effort | Impact |
|---|-------------|----------|--------|--------|
| 1 | Load template-specific fonts | Critical | Low | Very High |
| 2 | Bridge config tokens to CSS | High | Medium | High |
| 3 | SVG draw animation (Eternal Elegance) | Medium | Low | Medium |
| 4 | Motion library for Love at Dusk | High | High | High |
| 5 | Sample data placeholders in editor | High | Low | High |
| 6 | Botanical elements for Blush Romance | Medium | Medium | Medium |
| 7 | Tooltips on section rail | Low | Low | Low |
| 8 | Full-width gallery slideshow | Medium | Medium | Medium |
| 9 | Editor panel collapse state | Medium | Medium | Medium |
| 10 | Keyboard shortcut hints | Low | Low | Low |

The single highest-ROI change is **loading the template fonts** -- it requires one line of CSS and transforms the visual quality of every template from fallback system fonts to premium display typefaces.
