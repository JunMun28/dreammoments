# Living Portrait — AI-Animated Hero Section

**Date:** 2026-03-01
**Status:** Approved
**Feature:** Transform couple's photo into a 3D cute avatar, then animate it into a living portrait video for the hero section

## Summary

Couples upload their photo → AI generates a stylized 3D cute avatar (Pixar/Ghibli/Clay/Chibi) → couple approves → AI animates it into a subtle looping video ("living portrait"). The animated video replaces the static hero image, creating a unique, premium wedding invitation experience.

## Two-Step Pipeline

### Step 1: Photo → 3D Cute Avatar

- **API:** GPT-4o Image Generation (OpenAI)
- **Input:** Couple's hero photo (`hero.heroImageUrl`)
- **Output:** Stylized avatar image (1024×1024 PNG)
- **Styles:** Pixar 3D, Ghibli, Clay, Chibi (dropdown selector)
- **Cost:** ~$0.04–0.08 per generation
- **Time:** 5–15 seconds
- **Rate limit:** Max 5 attempts per invitation

**Prompt template:**
> "Transform this couple photo into a cute {style} portrait. Maintain the couple's likeness and poses. Soft romantic lighting, warm tones, wedding-appropriate setting. High quality, detailed, elegant."

### Step 2: Avatar → Animated Living Portrait

- **API:** Runway Gen-3/4 or Kling (via Fal.ai)
- **Input:** Approved avatar image (`hero.avatarImageUrl`)
- **Output:** 3–5 second looping video (MP4/WebM, 720p)
- **Cost:** ~$0.10–0.50 per generation
- **Time:** 30–120 seconds
- **Rate limit:** Max 3 attempts per invitation

**Prompt template:**
> "Gentle, subtle animation. Soft breeze through hair, very slight natural breathing movement. Elegant, dreamlike quality. Keep the scene mostly still with only minimal, graceful motion."

### Cost Summary

| Step | Cost | Time |
|------|------|------|
| Avatar generation | ~$0.04–0.08 | 5–15 sec |
| Video generation | ~$0.10–0.50 | 30–120 sec |
| **Total per invite** | **~$0.14–0.58** | **~35–135 sec** |

## User Flow

### Editor Flow

1. Couple uploads hero photo (existing flow)
2. New "Living Portrait" section appears below the image upload
3. Couple selects avatar style (Pixar 3D / Ghibli / Clay / Chibi)
4. Click "Generate Avatar" → loading state (5–15 sec) → preview avatar
5. If unsatisfied → "Regenerate" (try different style or same style for variation)
6. If satisfied → "Animate Avatar" button becomes enabled
7. Click "Animate Avatar" → loading state (30–120 sec) → preview animated video
8. If unsatisfied → "Regenerate" video or go back to regenerate avatar
9. Avatar URL and video URL are auto-saved to invitation content

### Public View (Guest Experience)

Display priority (waterfall fallback):

1. `hero.animatedVideoUrl` exists → `<video autoplay muted loop playsinline>`
2. `hero.avatarImageUrl` exists → `<img>` with Ken Burns animation
3. `hero.heroImageUrl` exists → `<img>` with Ken Burns animation (current behavior)
4. None → Unsplash placeholder

## Data Model

New fields in `InvitationContent.hero`:

```typescript
hero: {
  heroImageUrl?: string;        // Original uploaded photo
  avatarImageUrl?: string;      // Generated 3D cute avatar
  avatarStyle?: "pixar" | "ghibli" | "clay" | "chibi";
  animatedVideoUrl?: string;    // Generated living portrait video
  animationStatus?: "idle" | "generating-avatar" | "generating-video" | "completed" | "failed";
}
```

## API Endpoints

### `POST /api/ai/generate-avatar`

- **Auth:** Required (invitation owner)
- **Input:** `{ invitationId, style: "pixar" | "ghibli" | "clay" | "chibi" }`
- **Validation:** heroImageUrl must exist, rate limit check (max 5)
- **Process:** Call OpenAI GPT-4o image API with photo + style prompt
- **Output:** Upload result to R2 (`avatars/{invitationId}/{timestamp}.png`), update invitation content
- **Response:** `{ avatarImageUrl: string }`

### `POST /api/ai/animate-portrait`

- **Auth:** Required (invitation owner)
- **Input:** `{ invitationId }`
- **Validation:** avatarImageUrl must exist, rate limit check (max 3)
- **Process:** Call Runway/Kling API with avatar image + subtle motion prompt, poll for completion
- **Output:** Download video, upload to R2 (`animations/{invitationId}/{timestamp}.mp4`), update invitation content
- **Response:** `{ animatedVideoUrl: string, status: "completed" | "failed" }`

## Storage

- Same Cloudflare R2 bucket as existing image uploads
- Avatar images: `avatars/{invitationId}/{timestamp}.png` (~200KB–1MB)
- Animated videos: `animations/{invitationId}/{timestamp}.mp4` (~2–5MB for 5-sec 720p loop)

## Editor UI

```
┌─────────────────────────────────┐
│  Hero Image                     │
│  [Current image upload field]   │
│                                 │
│  ── Living Portrait ──────────  │
│                                 │
│  Step 1: Create Avatar          │
│  Style: [Pixar 3D ▾]           │
│  [✨ Generate Avatar]           │
│                                 │
│  ┌─────────────────────┐       │
│  │  Avatar preview      │       │
│  └─────────────────────┘       │
│  [↻ Regenerate] [✗ Remove]     │
│                                 │
│  Step 2: Animate                │
│  [▶ Animate Avatar]            │
│  (disabled until avatar exists) │
│                                 │
│  ┌─────────────────────┐       │
│  │  Video preview       │       │
│  └─────────────────────┘       │
│  [↻ Regenerate] [✗ Remove]     │
└─────────────────────────────────┘
```

## Error Handling

- **No hero image:** "Generate Avatar" disabled with tooltip "Upload a hero photo first"
- **API failure (avatar):** Error toast, button stays enabled for retry
- **API failure (video):** Error toast, falls back to displaying avatar image
- **Slow connection:** `<video poster={avatarImageUrl}>` shows avatar while video loads
- **Mobile data saver:** Detect `navigator.connection.saveData` → show avatar instead of video
- **`prefers-reduced-motion`:** Show static avatar or original photo, never autoplay video
- **Image too small:** Validate minimum 512×512 before sending to API

## Out of Scope (YAGNI)

- No style customization beyond the 4 presets
- No couple-selectable animation intensity or duration
- No video trimming or editing in-app
- No batch processing (one hero image at a time)
- No caching/reuse of avatars across invitations
- No real-time 3D rendering — video files only

## Technical Notes

- Three.js + React Three Fiber are already installed (used for landing page water ripple) but NOT needed for this feature — we use standard `<video>` and `<img>` elements
- Video element attributes: `autoplay muted loop playsinline` for cross-browser autoplay
- Abstracted API provider interface so Runway/Kling can be swapped later
- OpenAI API key stored in server env vars (already have AI generation infrastructure in `src/api/ai/`)

## Research Sources

- [Runway API Pricing](https://docs.dev.runwayml.com/guides/pricing/)
- [Kling AI Developer Pricing](https://klingai.com/global/dev/pricing)
- [OpenAI GPT-4o Image Generation](https://openai.com/index/introducing-4o-image-generation/)
- [LivePortrait (open-source alternative)](https://github.com/KwaiVGI/LivePortrait)
- [Fal.ai (Kling API proxy)](https://fal.ai)
- [AI Video Generation APIs Guide 2026](https://wavespeed.ai/blog/posts/complete-guide-ai-video-apis-2026/)
