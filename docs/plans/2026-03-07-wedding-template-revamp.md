# Wedding Template Revamp Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Revamp Double Happiness template with MY/SG cultural fixes, performance & accessibility improvements, and create 3 new templates (Romantic Cinematic, Classical Chinese, Botanical Garden).

**Architecture:** Shared core components (RSVP, countdown, angpao, audio, section shell) + unique hero/decorations per template. New shared components: BottomActionBar, SwiperGallery, MultiEventCards. Each template = config file + invitation component + CSS + hero + decorations.

**Tech Stack:** React, TanStack Router, Tailwind CSS v4, Motion (framer-motion replacement), Swiper.js, Three.js (existing), TypeScript strict mode.

**Already exists (skip these):**
- CountdownWidget already pauses on tab hidden (visibilitychange)
- MusicPlayer already has vinyl-spin animation (.dh-music-spin)
- AngpowQRCode already supports duitnow/paynow/tng
- RsvpConfirmation already has confetti particles
- SectionTitle already supports bilingual labels (zhLabel + enHeading)

---

## Phase 1: Shared Infrastructure + Double Happiness Revamp

### Task 1: Install Swiper.js dependency

**Files:**
- Modify: `package.json`

**Step 1: Install Swiper**

Run: `pnpm add swiper`

**Step 2: Verify installation**

Run: `pnpm exec tsc --noEmit`
Expected: No new errors

**Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add swiper dependency for gallery carousel"
```

---

### Task 2: Create MultiEventCards shared component

**Files:**
- Create: `src/components/templates/MultiEventCards.tsx`

**Context:**
- MY/SG weddings have multiple events: ROM, tea ceremony, dinner banquet
- Each card needs: event name (bilingual), date (DD/MM/YYYY), time (12h), venue, dress code, Google Maps + Waze links
- Use existing design patterns from DoubleHappinessInvitation.tsx schedule section (lines ~700-770)
- Style with the template's CSS variables (--t-primary, --t-accent, etc.)

**Step 1: Create the component**

Props interface:
```typescript
interface WeddingEvent {
  id: string
  nameEn: string
  nameZh: string
  date: string        // DD/MM/YYYY
  lunarDate?: string  // e.g., 农历十一月初二
  time: string        // e.g., "7:00 PM"
  venue: string
  address: string
  dressCode?: string
  googleMapsUrl?: string
  wazeUrl?: string
}

interface MultiEventCardsProps {
  events: WeddingEvent[]
  primaryColor?: string
  accentColor?: string
  className?: string
}
```

Component renders:
- A card per event with `data-reveal` for scroll animation
- Event name bilingual (English heading + Chinese subtitle)
- Date with calendar icon, time with clock icon
- Venue with map-pin icon
- Dress code with shirt icon (if provided)
- Two map buttons: "Google Maps" + "Waze" with external-link icon, `target="_blank" rel="noopener"`
- Use lucide-react icons (Calendar, Clock, MapPin, Shirt, ExternalLink)
- Cards styled with border-left accent stripe (like existing .dh-event-card-stripe)

**Step 2: Verify build**

Run: `pnpm exec tsc --noEmit && pnpm build`

**Step 3: Commit**

```bash
git add src/components/templates/MultiEventCards.tsx
git commit -m "feat: add MultiEventCards component for MY/SG multi-event weddings"
```

---

### Task 3: Create SwiperGallery shared component

**Files:**
- Create: `src/components/templates/SwiperGallery.tsx`
- Create: `src/components/templates/swiper-gallery.css`

**Context:**
- Replace static 2-column grid with swipeable Swiper.js carousel
- Include blur-up LQIP: tiny inline base64 placeholder → blur(20px) → sharp on load
- Use `<picture>` element with WebP source for future-proofing
- Reference Swiper docs: import from 'swiper/react', 'swiper/css', 'swiper/css/pagination'

**Step 1: Create the component**

Props interface:
```typescript
interface GalleryPhoto {
  url: string
  caption?: string
  captionZh?: string
  placeholder?: string  // tiny base64 data URI for blur-up
}

interface SwiperGalleryProps {
  photos: GalleryPhoto[]
  primaryColor?: string
  className?: string
}
```

Component:
- Import Swiper, SwiperSlide from 'swiper/react'
- Import Pagination, A11y from 'swiper/modules'
- Import 'swiper/css' and 'swiper/css/pagination'
- Config: slidesPerView=1, spaceBetween=16, pagination={{ clickable: true }}, modules=[Pagination, A11y]
- Each slide: `.img-placeholder` div with inline blur background, `<img>` with `loading="lazy" decoding="async"`, onLoad adds `.loaded` class to remove blur
- Caption below image (bilingual if captionZh provided)
- `prefers-reduced-motion`: no transition on blur removal

**Step 2: Create CSS file**

```css
.swiper-gallery .img-placeholder {
  filter: blur(20px);
  transition: filter 0.5s ease-out;
  overflow: hidden;
  border-radius: var(--radius, 12px);
}
.swiper-gallery .img-placeholder.loaded {
  filter: blur(0);
}
@media (prefers-reduced-motion: reduce) {
  .swiper-gallery .img-placeholder {
    filter: none;
    transition: none;
  }
}
```

**Step 3: Verify build**

Run: `pnpm exec tsc --noEmit && pnpm build`

**Step 4: Commit**

```bash
git add src/components/templates/SwiperGallery.tsx src/components/templates/swiper-gallery.css
git commit -m "feat: add SwiperGallery component with blur-up placeholders"
```

---

### Task 4: Create BottomActionBar shared component

**Files:**
- Create: `src/components/templates/BottomActionBar.tsx`
- Create: `src/components/templates/bottom-action-bar.css`

**Context:**
- Fixed bottom toolbar: music toggle, gift shortcut, message/wishes, like with heart burst
- Glassmorphic background (backdrop-filter: blur)
- Account for safe-area-inset-bottom (notch devices)
- Heart burst: on tap, spawn 3-5 tiny hearts that float up and fade out
- Only show in public/preview mode, not editor mode

**Step 1: Create the component**

Props interface:
```typescript
interface BottomActionBarProps {
  isPlaying?: boolean
  onMusicToggle?: () => void
  onGiftClick?: () => void
  onMessageClick?: () => void
  onLikeClick?: () => void
  likeCount?: number
  primaryColor?: string
  className?: string
}
```

Component:
- 4 buttons in a flex row: Music (Volume2/VolumeX), Gift, MessageCircle, Heart
- Like count with `font-variant-numeric: tabular-nums`
- Heart burst: on like click, create temporary absolute-positioned heart elements that animate up (translateY -60px) and fade out (opacity 0) over 800ms, then remove from DOM
- Use `env(safe-area-inset-bottom)` in padding-bottom

**Step 2: Create CSS**

- `.bottom-action-bar` fixed bottom, glassmorphic bg, z-100
- `.bar-btn` 44x44px touch targets
- `.heart-burst` animation keyframes (float up + fade)
- `body` padding-bottom to account for bar height
- Hide bar when `prefers-reduced-motion` is not relevant here (bar is functional, not decorative)

**Step 3: Verify build**

Run: `pnpm exec tsc --noEmit && pnpm build`

**Step 4: Commit**

```bash
git add src/components/templates/BottomActionBar.tsx src/components/templates/bottom-action-bar.css
git commit -m "feat: add BottomActionBar component with heart burst animation"
```

---

### Task 5: Update RSVP form for MY/SG (enhance existing form in Double Happiness)

**Files:**
- Modify: `src/components/templates/double-happiness/DoubleHappinessInvitation.tsx` (RSVP section ~lines 800-950)

**Context:**
- Current RSVP has: name, email, attendance, guestCount, dietaryRequirements (text input), message
- Need to add: event selection checkboxes, dietary as select dropdown with halal option, WhatsApp fallback link
- Keep the same form validation pattern (existing validateRsvp function)

**Step 1: Add event selection checkboxes**

After the attendance radio group, add:
```tsx
{/* Event selection - only show if attending */}
{rsvpData.attendance === 'attending' && content.schedule?.events && (
  <div className="space-y-2">
    <label className="block text-sm font-medium" style={{ color: COLORS.dark }}>
      Which events? / <span lang="zh-CN">出席活动</span>
    </label>
    {content.schedule.events.map((event) => (
      <label key={event.id} className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          name="events"
          value={event.id}
          className="rounded border-gray-300"
        />
        <span>{event.title}</span>
      </label>
    ))}
  </div>
)}
```

**Step 2: Replace dietary text input with select dropdown**

Replace the existing dietary text input with:
```tsx
<select
  value={rsvpData.dietaryRequirements}
  onChange={(e) => setRsvpData(prev => ({ ...prev, dietaryRequirements: e.target.value }))}
  className="w-full rounded-lg border px-4 py-3 text-base"
  style={{ borderColor: `${COLORS.accent}40` }}
>
  <option value="">No restrictions</option>
  <option value="halal">Halal</option>
  <option value="vegetarian">Vegetarian</option>
  <option value="no-beef">No Beef</option>
  <option value="no-seafood">No Seafood</option>
  <option value="other">Other (specify in message)</option>
</select>
```

**Step 3: Add WhatsApp fallback link after submit button**

```tsx
<a
  href={`https://wa.me/${content.couple?.contactPhone || ''}?text=${encodeURIComponent('Hi, I would like to RSVP for your wedding!')}`}
  target="_blank"
  rel="noopener noreferrer"
  className="block text-center text-sm underline mt-3"
  style={{ color: COLORS.muted }}
>
  Or RSVP via WhatsApp
</a>
```

**Step 4: Verify build**

Run: `pnpm exec tsc --noEmit && pnpm build`

**Step 5: Commit**

```bash
git add src/components/templates/double-happiness/DoubleHappinessInvitation.tsx
git commit -m "feat: enhance RSVP form with event selection, halal dietary, WhatsApp fallback"
```

---

### Task 6: Add accessibility & performance fixes to Double Happiness

**Files:**
- Modify: `src/components/templates/double-happiness/double-happiness.css`
- Modify: `src/components/templates/double-happiness/DoubleHappinessInvitation.tsx`

**Step 1: Fix WCAG contrast in CSS**

In `double-happiness.css`, update the color variables:
```css
/* Change --t-primary from #B07D62 to WCAG-safe value */
--t-primary: #8B5E4B;  /* Darker cappuccino - 4.5:1 on #F9F8F6 */
```

**Step 2: Add content-visibility to sections**

In `double-happiness.css`:
```css
.double-happiness section {
  content-visibility: auto;
  contain-intrinsic-size: 0 500px;
}
/* Don't defer hero */
.double-happiness section:first-of-type {
  content-visibility: visible;
}
```

**Step 3: Add lang attributes in TSX**

In `DoubleHappinessInvitation.tsx`, wrap Chinese text with `lang="zh-CN"`:
- Tagline: `<p lang="zh-CN">{content.hero?.tagline}</p>`
- Section Chinese labels in SectionTitle already have this (zhLabel prop renders Chinese)
- Story milestone descriptions
- Footer blessing text

**Step 4: Add aria-hidden on decorative characters**

Find all decorative 囍, ❤, ✦ and add `aria-hidden="true"`:
```tsx
<span aria-hidden="true" className="dh-xi-watermark">囍</span>
```

**Step 5: Add prefers-reduced-motion enhancements**

In `double-happiness.css`, extend the existing reduced-motion block:
```css
@media (prefers-reduced-motion: reduce) {
  .double-happiness .dm-particle-drift-up,
  .double-happiness .dm-particle-drift-down,
  .double-happiness .dm-particle-float {
    animation: none;
    display: none;
  }
  .double-happiness .dh-ken-burns {
    animation: none;
  }
  .double-happiness [data-reveal] {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

**Step 6: Verify**

Run: `pnpm check && pnpm exec tsc --noEmit && pnpm build`

**Step 7: Commit**

```bash
git add src/components/templates/double-happiness/
git commit -m "fix: WCAG contrast, content-visibility, lang attrs, reduced-motion in Double Happiness"
```

---

### Task 7: Integrate new shared components into Double Happiness

**Files:**
- Modify: `src/components/templates/double-happiness/DoubleHappinessInvitation.tsx`

**Step 1: Replace gallery grid with SwiperGallery**

Find the gallery section (~lines 620-680). Replace the 2-column grid with:
```tsx
<SwiperGallery
  photos={(content.gallery?.photos || []).map(p => ({
    url: p.url,
    caption: p.caption,
  }))}
  primaryColor={COLORS.primary}
/>
```

Import: `import { SwiperGallery } from '../SwiperGallery'`

**Step 2: Add BottomActionBar**

At the bottom of the component (before closing fragment), add:
```tsx
{mode !== 'editor' && (
  <BottomActionBar
    primaryColor={COLORS.primary}
    onGiftClick={() => document.getElementById('gift')?.scrollIntoView({ behavior: 'smooth' })}
    onMessageClick={() => document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth' })}
  />
)}
```

Import: `import { BottomActionBar } from '../BottomActionBar'`

**Step 3: Add venue dual map links**

In the venue section (~line 775), ensure both Google Maps AND Waze links:
```tsx
<div className="flex gap-3 mt-3">
  {content.venue?.mapUrl && (
    <a href={content.venue.mapUrl} target="_blank" rel="noopener noreferrer"
       className="inline-flex items-center gap-1 text-sm underline"
       style={{ color: COLORS.primary }}>
      <MapPin size={14} /> Google Maps
    </a>
  )}
  {content.venue?.wazeUrl && (
    <a href={content.venue.wazeUrl} target="_blank" rel="noopener noreferrer"
       className="inline-flex items-center gap-1 text-sm underline"
       style={{ color: COLORS.primary }}>
      <MapPin size={14} /> Waze
    </a>
  )}
</div>
```

**Step 4: Verify**

Run: `pnpm check && pnpm exec tsc --noEmit && pnpm build`

**Step 5: Commit**

```bash
git add src/components/templates/double-happiness/DoubleHappinessInvitation.tsx
git commit -m "feat: integrate SwiperGallery, BottomActionBar, dual map links in Double Happiness"
```

---

### Task 8: Update template types and content schema for MY/SG fields

**Files:**
- Modify: `src/templates/types.ts`
- Modify: `src/data/sample-invitation.ts`

**Step 1: Add new fields to types**

In `types.ts`, ensure FieldConfig supports:
- `type: 'select'` for dietary dropdown
- `type: 'checkbox-group'` for event selection

Add to SectionType union: `"multi-event"` if not present.

**Step 2: Update sample invitation for MY/SG**

In `sample-invitation.ts`, update the double-happiness sample:
- Add `contactPhone: '60123456789'` to couple section (for WhatsApp RSVP)
- Add `wazeUrl` alongside existing mapUrl in venue section
- Ensure dates use DD/MM/YYYY format in display strings
- Add `lunarDate` field to schedule events

**Step 3: Verify**

Run: `pnpm exec tsc --noEmit && pnpm build`

**Step 4: Commit**

```bash
git add src/templates/types.ts src/data/sample-invitation.ts
git commit -m "feat: update types and sample data for MY/SG multi-event weddings"
```

---

## Phase 2: Romantic Cinematic Template

### Task 9: Create Romantic Cinematic template config

**Files:**
- Create: `src/templates/romantic-cinematic.ts`
- Modify: `src/templates/index.ts`

**Step 1: Create template config**

```typescript
import type { TemplateConfig } from './types'

export const romanticCinematicTemplate: TemplateConfig = {
  id: 'romantic-cinematic',
  name: 'Romantic Cinematic',
  nameZh: '浪漫光影',
  description: 'Dreamy dusty rose & champagne with cinematic parallax and film-grain textures',
  category: 'chinese',
  tokens: {
    colors: {
      primary: '#8B4A55',    // Deep dusty rose (WCAG-safe)
      secondary: '#2D1F2B',  // Midnight plum
      accent: '#C5A880',     // Champagne gold
      background: '#FBF5F3', // Warm blush cream
      text: '#2D1F2B',
      muted: '#8A7F7A',
    },
    typography: {
      headingFont: "'Playfair Display', 'Noto Serif SC', Georgia, serif",
      bodyFont: "'Inter', 'Noto Sans SC', sans-serif",
      accentFont: "'Playfair Display', 'Noto Serif SC', serif",
    },
    animations: {
      scrollTriggerOffset: 0.15,
      defaultDuration: 800,
      easing: 'ease-out',
    },
  },
  sections: [
    // Same section structure as double-happiness, reordered:
    // hero, countdown, announcement, couple, story, gallery, schedule, venue, rsvp, gift, footer
    // Copy from doubleHappinessTemplate sections and adjust field defaults
  ],
  aiConfig: {
    toneKeywords: ['romantic', 'cinematic', 'dreamy', 'intimate'],
    culturalContext: 'chinese',
  },
  version: '1.0.0',
}
```

**Step 2: Register in index.ts**

```typescript
import { doubleHappinessTemplate } from './double-happiness'
import { romanticCinematicTemplate } from './romantic-cinematic'

export const templates = [doubleHappinessTemplate, romanticCinematicTemplate]
export { doubleHappinessTemplate, romanticCinematicTemplate }
```

**Step 3: Verify**

Run: `pnpm exec tsc --noEmit`

**Step 4: Commit**

```bash
git add src/templates/romantic-cinematic.ts src/templates/index.ts
git commit -m "feat: add Romantic Cinematic template config"
```

---

### Task 10: Create Romantic Cinematic invitation component + CSS

**Files:**
- Create: `src/components/templates/romantic-cinematic/RomanticCinematicInvitation.tsx`
- Create: `src/components/templates/romantic-cinematic/romantic-cinematic.css`
- Create: `src/components/templates/romantic-cinematic/HeroSection.tsx`

**Context:**
- Follow DoubleHappinessInvitation.tsx structure (1195 lines) but with unique hero and decorative style
- Reuse: SectionShell, SectionTitle, CountdownWidget, SwiperGallery, MultiEventCards, AngpowQRCode, BottomActionBar, RsvpConfirmation
- Hero: Full-bleed couple photo, gradient overlay (bottom 60% dark), oversized Playfair Display names, film-grain CSS overlay
- Motion: Slow fade-ins (800ms ease-out), parallax on hero photo (0.3x), staggered section reveals
- Unique decorations: Shimmer sweep on gold accents, letterbox bars (thin gold lines top/bottom of hero), soft vignette

**Step 1: Create HeroSection.tsx**

Unique hero with:
- Full-bleed background image with Ken Burns + parallax
- Film-grain overlay: `background-image: url("data:image/svg+xml,...")` with noise pattern, mix-blend-mode: overlay, opacity: 0.3
- Letterbox bars: thin gold horizontal lines at top and bottom
- Oversized couple names in Playfair Display (3rem mobile, 4rem desktop)
- Date + tagline fade in with delay
- Gradient overlay from transparent to secondary color at bottom

**Step 2: Create romantic-cinematic.css**

CSS custom properties scoped to `.romantic-cinematic`:
- Color tokens matching template config
- Film-grain overlay class
- Shimmer sweep keyframe animation on gold accents
- Soft vignette using radial-gradient on sections
- Section alternation (blush cream / white / soft plum tint)
- All decorative animations respect prefers-reduced-motion
- content-visibility: auto on sections

**Step 3: Create RomanticCinematicInvitation.tsx**

Follow DoubleHappinessInvitation structure:
- Same props (TemplateInvitationProps)
- Same section rendering pattern (SectionShell wrapping each section)
- Use shared components for: countdown, gallery (SwiperGallery), schedule (MultiEventCards), venue, RSVP, gift (AngpowQRCode)
- Unique: hero, decorative dividers (shimmer dividers instead of gold), section backgrounds
- Include BottomActionBar for public mode
- All Chinese text wrapped in `lang="zh-CN"`
- All decorative Unicode has `aria-hidden="true"`

**Step 4: Verify**

Run: `pnpm check && pnpm exec tsc --noEmit && pnpm build`

**Step 5: Commit**

```bash
git add src/components/templates/romantic-cinematic/
git commit -m "feat: add Romantic Cinematic template component with film-grain hero"
```

---

### Task 11: Register Romantic Cinematic in InvitationRenderer

**Files:**
- Modify: `src/components/templates/InvitationRenderer.tsx`
- Modify: `src/data/sample-invitation.ts`

**Step 1: Add lazy import**

In `templateImports` record:
```typescript
'romantic-cinematic': () => import('./romantic-cinematic/RomanticCinematicInvitation'),
```

**Step 2: Add sample content**

In `buildSampleContent`, add case for 'romantic-cinematic' with appropriate sample data (can share most content with double-happiness but with English-forward naming).

**Step 3: Verify end-to-end**

Run: `pnpm build`
Then manually test: navigate to `/editor/new` and verify template appears in selection.

**Step 4: Commit**

```bash
git add src/components/templates/InvitationRenderer.tsx src/data/sample-invitation.ts
git commit -m "feat: register Romantic Cinematic in renderer and add sample data"
```

---

## Phase 3: Classical Chinese Template

### Task 12: Create Classical Chinese template config

**Files:**
- Create: `src/templates/classical-chinese.ts`
- Modify: `src/templates/index.ts`

**Template tokens:**
- Primary: #C41E3A (auspicious red)
- Secondary: #1A0F0A (lacquer black)
- Accent: #D4A843 (imperial gold)
- Background: #FFF8EF (ivory)
- Heading: "'KaiTi', 'Noto Serif SC', serif"
- Body: "'Songti SC', 'Noto Sans SC', sans-serif"

Register in templates array in index.ts.

**Step 1: Create config, Step 2: Register, Step 3: Verify, Step 4: Commit**

```bash
git commit -m "feat: add Classical Chinese template config"
```

---

### Task 13: Create Classical Chinese invitation component + CSS

**Files:**
- Create: `src/components/templates/classical-chinese/ClassicalChineseInvitation.tsx`
- Create: `src/components/templates/classical-chinese/classical-chinese.css`
- Create: `src/components/templates/classical-chinese/HeroSection.tsx`
- Create: `src/components/templates/classical-chinese/DoubleHappinessDraw.tsx`
- Create: `src/components/templates/classical-chinese/InkWashReveal.tsx`

**Unique elements:**
- Hero: Large animated 囍 SVG draw-path (stroke-dasharray/dashoffset animation), red+gold radial gradient, calligraphy-style couple names
- DoubleHappinessDraw.tsx: SVG 囍 character that draws itself on scroll entry (uses motion's useInView + CSS stroke animation)
- InkWashReveal.tsx: Section transition effect using clipPath animation that looks like ink spreading on paper
- Cloud border decorations using existing CloudBorder component
- Red+gold section alternation (ivory / light red tint / dark lacquer)
- Traditional frame ornaments around photos (double-line gold border with corner flourishes)
- Gold dust particles (reuse existing GoldDustParticles)

**Step 1: Create unique components, Step 2: Create CSS, Step 3: Create main invitation, Step 4: Verify, Step 5: Commit**

```bash
git commit -m "feat: add Classical Chinese template with ink wash reveals and 囍 draw animation"
```

---

### Task 14: Register Classical Chinese in InvitationRenderer

**Files:**
- Modify: `src/components/templates/InvitationRenderer.tsx`
- Modify: `src/data/sample-invitation.ts`

Same pattern as Task 11. Add lazy import and sample content.

```bash
git commit -m "feat: register Classical Chinese in renderer and add sample data"
```

---

## Phase 4: Botanical Garden Template

### Task 15: Create Botanical Garden template config

**Files:**
- Create: `src/templates/botanical-garden.ts`
- Modify: `src/templates/index.ts`

**Template tokens:**
- Primary: #3D5A3E (forest green)
- Secondary: #2C3E2C (deep evergreen)
- Accent: #D4A880 (warm gold)
- Background: #F7F5F0 (natural linen)
- Heading: "'Cormorant Garamond', 'Noto Serif SC', Georgia, serif"
- Body: "'Inter', 'Noto Sans SC', sans-serif"

```bash
git commit -m "feat: add Botanical Garden template config"
```

---

### Task 16: Create Botanical Garden invitation component + CSS

**Files:**
- Create: `src/components/templates/botanical-garden/BotanicalGardenInvitation.tsx`
- Create: `src/components/templates/botanical-garden/botanical-garden.css`
- Create: `src/components/templates/botanical-garden/HeroSection.tsx`
- Create: `src/components/templates/botanical-garden/BotanicalFrame.tsx`
- Create: `src/components/templates/botanical-garden/LeafDivider.tsx`
- Create: `src/components/templates/botanical-garden/LeafDriftParticles.tsx`

**Unique elements:**
- Hero: Botanical illustration frame (SVG leaf/vine border), centered couple names in Cormorant Garamond, delicate leaf animation on entry
- BotanicalFrame.tsx: SVG frame with leaf/vine corners that grows in on scroll (scale + opacity)
- LeafDivider.tsx: Horizontal divider with small leaf/branch SVG motif
- LeafDriftParticles.tsx: Gentle floating leaves (similar to GoldDustParticles but with leaf shapes, green-tinted)
- Section backgrounds: alternating natural linen / soft sage wash / white
- Watercolor wash effect: CSS radial-gradient with soft green edges on alternate sections
- Organic ease-out reveals (slightly slower, 900ms)
- Photos in rounded corners with subtle botanical border

**Step 1: Create unique components, Step 2: Create CSS, Step 3: Create main invitation, Step 4: Verify, Step 5: Commit**

```bash
git commit -m "feat: add Botanical Garden template with leaf animations and botanical frame"
```

---

### Task 17: Register Botanical Garden in InvitationRenderer

**Files:**
- Modify: `src/components/templates/InvitationRenderer.tsx`
- Modify: `src/data/sample-invitation.ts`

Same pattern as Tasks 11/14.

```bash
git commit -m "feat: register Botanical Garden in renderer and add sample data"
```

---

## Phase 5: Final Verification

### Task 18: Full build verification and lint

**Step 1: Run full check suite**

```bash
pnpm check                  # Biome lint + format
pnpm exec tsc --noEmit      # TypeScript type check
pnpm build                  # Production build
```

**Step 2: Manual smoke test**

- Navigate to `/editor/new` — all 4 templates should appear in selection grid
- Preview each template with sample data
- Test RSVP form submission (event checkboxes, dietary select, WhatsApp link)
- Test Swiper gallery swiping
- Test bottom action bar (music, gift scroll, like heart burst)
- Test on mobile viewport (Chrome DevTools responsive mode)
- Test with `prefers-reduced-motion: reduce` in DevTools

**Step 3: Commit any remaining fixes**

```bash
git commit -m "fix: final adjustments from smoke testing"
```
