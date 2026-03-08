# Unique Template Content & Layouts — Design

## Goal

Each of the 4 wedding templates gets unique sample content, unique section order, unique internal component layouts, and template-specific sections — so they feel like completely different products rather than reskins.

## Principles

- Personality-driven length: templates have different section counts matching their vibe
- Realistic couples whose personalities naturally showcase each template's strengths
- Shared sections (RSVP, Schedule, etc.) get completely different HTML structure per template
- Unique sections per template add genuine differentiation

---

## Double Happiness — "Midnight Opulence" (~11 sections)

### Sample Couple
- **俊明 (Jun Ming) & 诗婷 (Shi Ting)**
- Met at a cocktail bar opening, bonded over jazz and architecture
- Formal bilingual tone, parents as hosts
- 4 milestones: cocktail bar meeting → architecture tour date → jazz club proposal → Art Deco themed wedding

### Section Order & Layout
1. **Hero** — Art Deco sunburst, LetterboxReveal (existing)
2. **Announcement** — formal parents-as-hosts invitation, geometric border frame
3. **Couple** — side-by-side portraits in Art Deco hexagonal frames
4. **Entourage** *(UNIQUE)* — wedding party grid (bridesmaids + groomsmen with names/roles)
5. **Story** — **horizontal scrolling timeline** (swipe-able cards via CSS scroll-snap, not vertical)
6. **Gallery** — **masonry grid** layout (CSS columns, not Swiper carousel)
7. **Schedule** — overlapping Art Deco card stack (cards slightly offset with box-shadow depth)
8. **Venue** — map card with geometric brass border
9. **Countdown** — large Art Deco numerals with tabular-nums
10. **RSVP** — split layout (info left, form right)
11. **Gift + Footer** — combined into one closing section

### Layout Changes from Current
- Story: horizontal scroll instead of vertical timeline
- Gallery: masonry grid instead of Swiper
- New Entourage section with grid layout
- Gift + Footer merged

---

## Romantic Cinematic — "Noir Rosé" (~12 sections, longest)

### Sample Couple
- **志豪 (Zhi Hao) & 美琳 (Mei Lin)**
- Met at a film festival, bonded over Wong Kar-wai movies
- Dramatic, poetic bilingual copy
- 4 milestones: film festival meeting → rooftop cinema date → Taipei sunrise proposal → cinematic wedding

### Section Order & Layout
1. **Hero** — curtain ClipReveal, film grain, starlight particles (existing)
2. **Love Letter** *(UNIQUE)* — handwritten-style love note from one partner, italic serif on parchment card
3. **Couple** — **overlapping portrait frames** (one slightly behind/offset, film aspect ratio crops)
4. **Story** — **full-bleed alternating layout** (photo full-width, text on dark band below, alternating sides)
5. **Gallery** — full-width film strip carousel with slight tilt on slides
6. **Highlights Reel** *(UNIQUE)* — video embed or large cinematic photo montage with overlay captions
7. **Schedule** — vertical timeline with clock icons on dark aubergine background
8. **Venue** — dark card with map overlay, aubergine bg
9. **Countdown** — elegant serif numerals, minimal, centered
10. **RSVP** — **single-column centered** form (not split), dark bg
11. **Guest Wishes** *(UNIQUE)* — scrolling wishes wall / danmu-style message display
12. **Gift + Footer**

### Layout Changes from Current
- Love Letter: entirely new section
- Couple: overlapping frames instead of side-by-side
- Story: full-bleed alternating instead of vertical timeline
- RSVP: single-column centered instead of split
- Highlights Reel: new video/montage section
- Guest Wishes: new scrolling wall section

---

## Classical Chinese — "Crimson Ink" (~9 sections, shortest)

### Sample Couple
- **文杰 (Wen Jie) & 雅琴 (Ya Qin)**
- Traditional family, classical poetry references
- Parents prominently featured
- Heavy Chinese with minimal English, formal deliberate tone
- 3 milestones only (concise): 相遇 → 相知 → 相守

### Section Order & Layout
1. **Hero** — obsidian bg, giant DrawPath 囍, ink drops (existing)
2. **Parents' Honor / 家长** *(UNIQUE)* — parents' full names with honorifics (长/次/幼 birth order), traditional hosting line "谨订于...恭请光临"
3. **Announcement** — formal classical Chinese, **vertical text** (writing-mode: vertical-rl) for Chinese copy
4. **Couple** — **stacked vertically** (not side-by-side), seal stamps beside each name
5. **Story** — **ink scroll feel**, vertical flow with brush stroke connectors, fewer milestones (3)
6. **Schedule** — **clean table layout** (rows, not cards), traditional formatting with Chinese time
7. **Venue** — minimal card with vermillion border accent
8. **RSVP** — compact single-column form, vermillion accent buttons, fewer fields
9. **Footer** — calligraphy 囍, no gift section (angpao assumed in traditional context)

### Layout Changes from Current
- Parents' Honor: entirely new section
- Couple: stacked vertically instead of side-by-side
- Announcement: vertical text option for Chinese
- Schedule: table layout instead of cards
- No Gift section, no Countdown, no Gallery (deliberate minimalism)
- Overall shorter with more negative space

---

## Botanical Garden — "Terra Botanica" (~10 sections)

### Sample Couple
- **Wei Lun & Mei Xin**
- Met volunteering at a botanical garden, proposal during a sunrise hike
- Casual, warm, English-forward with some Chinese
- 3 milestones: garden volunteering → waterfall hike date → sunrise hilltop proposal

### Section Order & Layout
1. **Hero** — diagonal ClipReveal, ember particles (existing)
2. **Couple** — **asymmetric layout** (one large portrait ~60% width, one smaller offset beside it ~35%)
3. **Story** — **organic flowing path** with curved SVG connector (DrawPath), botanical leaf markers at each milestone
4. **Gallery** — **polaroid-style scattered photos** with slight random rotations (-2deg to 3deg), tape/pin aesthetic
5. **Dress Code** *(UNIQUE)* — visual guide with color swatches (do: pastels, earth tones; don't: white, black), icons, garden attire tips
6. **Schedule** — card grid with leaf accent icons
7. **Venue** — **large map hero** with botanical vine DrawPath border, more prominent than other templates
8. **Countdown** — organic numerals with leaf ornament accents
9. **RSVP** — warm sand bg, nature-themed form with botanical dividers
10. **Gift + Footer**

### Layout Changes from Current
- Couple: asymmetric instead of side-by-side equal
- Gallery: polaroid scattered instead of Swiper carousel
- Dress Code: entirely new section
- Story: curved organic path instead of straight vertical line
- Venue: large hero-style instead of standard card

---

## Shared Components That Get Per-Template Redesign

| Component | DH (Midnight Opulence) | RC (Noir Rosé) | CC (Crimson Ink) | BG (Terra Botanica) |
|-----------|----------------------|----------------|-----------------|---------------------|
| **Story** | Horizontal scroll cards | Full-bleed alternating | Ink scroll vertical | Organic curved path |
| **Gallery** | Masonry grid | Film strip carousel | *(removed)* | Polaroid scattered |
| **Couple** | Side-by-side hex frames | Overlapping offset | Stacked vertical + seals | Asymmetric sizes |
| **Schedule** | Overlapping card stack | Vertical timeline + clocks | Table rows | Card grid + leaf icons |
| **RSVP** | Split (info + form) | Single-column centered | Compact single-column | Nature-themed full |
| **Countdown** | Art Deco numerals | Minimal serif | *(removed)* | Organic + leaf |

## Content Fields

The `InvitationContent` type already supports all needed fields. New unique sections need content:
- **Entourage** (DH): Array of { name, role, photoUrl? } — add to sample data
- **Love Letter** (RC): { from, message } — single text block
- **Highlights Reel** (RC): { videoUrl?, photos: Array<{url, caption}> }
- **Guest Wishes** (RC): Display-only (reads from submitted RSVP wishes)
- **Parents' Honor** (CC): { partnerOneParents: {father, mother}, partnerTwoParents: {father, mother}, hostingLine }
- **Dress Code** (BG): { guidelines: string, doColors: string[], dontColors: string[], tips: string[] }

These can be added to the sample data files. The actual InvitationContent type may need optional fields for template-specific sections, or they can be embedded in the existing `extra` / custom fields.
