# Wedding Template Revamp Design

**Date:** 2026-03-07
**Status:** Approved
**Scope:** Revamp Double Happiness + 3 new templates (Romantic Cinematic, Classical Chinese, Botanical Garden)

---

## 1. Double Happiness Revamp

### A. MY/SG Cultural Fixes

- Add multi-event section: ROM, tea ceremony, dinner as separate cards with dates/times/venues
- Add event selection checkboxes to RSVP form (which events attending)
- Add halal/vegetarian/no-beef/no-seafood dietary select to RSVP
- Add WhatsApp RSVP fallback link below form (`https://wa.me/60XXX?text=...`)
- Add Google Maps + Waze dual links on venue cards
- Add DuitNow/PayNow/Touch 'n Go QR codes to AngpowQRCode component
- Fix date format to DD/MM/YYYY + lunar calendar date
- Add bilingual labels on all section titles (English + Chinese)
- Update terminology: angpao not hongbao

### B. Visual & Animation Upgrade

- Add fixed bottom action bar (music, gift, message, like with heart burst)
- Upgrade gallery to Swiper.js carousel with swipe gestures
- Add blur-up LQIP image placeholders (inline base64 tiny → blur → sharp)
- Add confetti/heart micro-animation on RSVP submit success
- Add vinyl-spin animation on music toggle (replacing pulse)
- Add Double Happiness 囍 animated reveal in hero

### C. Performance & Accessibility

- Add `content-visibility: auto` on off-screen sections
- Add `decoding="async"` on all images
- Fix primary text color to #8B4A55 (WCAG AA safe on cream)
- Add `lang="zh-CN"` on Chinese text spans
- Add `aria-hidden="true"` on decorative Unicode
- Preload hero CJK font subset
- Pause countdown when tab hidden (visibilitychange)
- Add passive scroll listeners
- Add `prefers-reduced-motion` to disable parallax + particles + music viz

---

## 2. New Shared Components

Built during Phase 1, used by all templates:

| Component | Purpose |
|-----------|---------|
| `BottomActionBar.tsx` | Fixed bottom toolbar: music, gift, message, like |
| `SwiperGallery.tsx` | Swipeable photo carousel with blur-up placeholders |
| `MultiEventCards.tsx` | ROM/tea/dinner cards with Google Maps + Waze links |
| `RsvpFormMYSG.tsx` | Enhanced RSVP: event selection, dietary (halal), WhatsApp fallback |
| `ConfettiAnimation.tsx` | Heart/confetti burst on RSVP success |

Existing shared components (unchanged):
- SectionShell, SectionTitle, CountdownWidget, AngpowQRCode, AudioPlayer, MusicPlayer, AnimationRenderer, EnvelopeAnimation

---

## 3. Template File Structure

Each template:
```
src/templates/[template-id].ts
src/components/templates/[template-id]/
  ├── [TemplateName]Invitation.tsx
  ├── [template-id].css
  ├── HeroSection.tsx
  └── [unique decorative components]
```

Register in:
- `src/templates/index.ts` (template registry)
- `src/components/templates/InvitationRenderer.tsx` (lazy loading)

---

## 4. Template Designs

### A. Romantic Cinematic (`romantic-cinematic`)

**Tokens:**
- Primary: #8B4A55 (deep dusty rose)
- Secondary: #2D1F2B (midnight plum)
- Accent: #C5A880 (champagne gold)
- Background: #FBF5F3 (warm blush cream)
- Heading: Playfair Display + Noto Serif SC
- Body: Inter + Noto Sans SC

**Unique elements:**
- Hero: Full-bleed photo with gradient overlay, oversized serif names, film-grain texture
- Decorations: Shimmer sweep on gold, slow parallax photo layers, cinematic letterbox bars
- Motion: Slow fade-ins (800ms), parallax (0.3x), staggered reveals
- Vibe: Movie poster for a love story

### B. Classical Chinese (`classical-chinese`)

**Tokens:**
- Primary: #C41E3A (auspicious red)
- Secondary: #1A0F0A (lacquer black)
- Accent: #D4A843 (imperial gold)
- Background: #FFF8EF (ivory)
- Heading: KaiTi / Noto Serif SC
- Body: Songti SC / Noto Sans SC

**Unique elements:**
- Hero: Large animated 囍 SVG draw-path reveal, red+gold gradient, calligraphy names
- Decorations: Cloud borders, phoenix+dragon motifs, traditional frame ornaments, ink wash transitions
- Motion: Ink-spread reveals (clipPath), gold dust drift particles, calligraphy draw-on
- Vibe: Traditional elegance meets modern digital

### C. Botanical Garden (`botanical-garden`)

**Tokens:**
- Primary: #3D5A3E (forest green)
- Secondary: #2C3E2C (deep evergreen)
- Accent: #D4A880 (warm gold)
- Background: #F7F5F0 (natural linen)
- Heading: Cormorant Garamond + Noto Serif SC
- Body: Inter + Noto Sans SC

**Unique elements:**
- Hero: Botanical illustration frame (SVG), centered names, leaf border animation
- Decorations: Leaf/vine dividers, watercolor wash section backgrounds, botanical corners
- Motion: Organic ease-out reveals, leaf drift particles, grow-in for botanical elements
- Vibe: Garden party elegance, fresh and natural

---

## 5. Implementation Phases

### Phase 1: Shared Infrastructure + Double Happiness Revamp
1. Build new shared components (BottomActionBar, SwiperGallery, MultiEventCards, RsvpFormMYSG, ConfettiAnimation)
2. Update Double Happiness template config (new sections, tokens, fields)
3. Update DoubleHappinessInvitation.tsx (integrate new components, bilingual labels, 囍 reveal)
4. Update double-happiness.css (contrast fix, content-visibility, reduced-motion)
5. Update AngpowQRCode for DuitNow/PayNow
6. Add performance fixes (font preload, passive listeners, visibility-based countdown)
7. Test & verify

### Phase 2: Romantic Cinematic
1. Create template config (romantic-cinematic.ts)
2. Create RomanticCinematicInvitation.tsx + HeroSection.tsx
3. Create romantic-cinematic.css with film-grain overlay, parallax layers
4. Create unique decorations (ShimmerSweep, LetterboxBars)
5. Register in template index + InvitationRenderer
6. Test & verify

### Phase 3: Classical Chinese
1. Create template config (classical-chinese.ts)
2. Create ClassicalChineseInvitation.tsx + HeroSection.tsx
3. Create classical-chinese.css with ink wash transitions, red/gold palette
4. Create unique decorations (DoubleHappinessDraw, CloudBorderTraditional, PhoenixDragonMotif, InkWashReveal)
5. Register in template index + InvitationRenderer
6. Test & verify

### Phase 4: Botanical Garden
1. Create template config (botanical-garden.ts)
2. Create BotanicalGardenInvitation.tsx + HeroSection.tsx
3. Create botanical-garden.css with watercolor washes, linen texture
4. Create unique decorations (BotanicalFrame, LeafDivider, VineCorner, LeafDriftParticles)
5. Register in template index + InvitationRenderer
6. Test & verify
