# Living Portrait — AI-Animated Hero Section

**Date:** 2026-03-01
**Status:** Approved
**Deepened on:** 2026-03-01
**Sections enhanced:** 12
**Research agents used:** 14 (security, performance, architecture, race conditions, code simplicity, spec flow, pattern recognition, async UI, fal.ai API, video autoplay, Kling API, R2 storage, framework docs, learnings)
**API Provider:** fal.ai (unified — both avatar and video generation)

**Feature:** Transform couple's photo into a 3D cute avatar, then animate it into a living portrait video for the hero section

## Enhancement Summary

### Key Improvements from Research
1. **Architecture overhaul**: `animationStatus` moved out of JSONB content into `aiGenerations` table — prevents auto-save race conditions and separates transient state from display content
2. **Async video pipeline**: Video generation uses fire-and-forget job submission + client-side React Query polling instead of blocking 120-second server functions
3. **Security hardening**: Ownership-scoped mutations `(invitationId, userId)`, hardcoded content paths, based on prior cross-invitation mutation vulnerability
4. **Performance**: Poster-first progressive video loading, WebP avatars at 512x512, video encoding optimization (2-5MB → ~1.25MB), viewport-gated playback
5. **Race condition prevention**: Ref-based mutex for double-clicks, generation epoch tracking, PATCH-based content updates (not full replace), split avatar/video status tracking
6. **Simplification**: 2 styles (not 4) for v1, no provider abstraction, single combined rate limit
7. **Unified fal.ai pipeline**: Both avatar generation (FLUX img2img) and video generation (Kling) via fal.ai — single SDK, single API key, existing credits

### New Considerations Discovered
- fal.ai `@fal-ai/client` SDK provides unified queue pattern (submit/poll/result) for both steps
- FLUX image-to-image `strength` parameter (0-1) controls style vs likeness tradeoff — key for avatar quality
- WeChat in-app browser has unique video autoplay restrictions (important for MY/SG market)
- Avatar/video changes must be excluded from editor undo/redo history
- Hero image changes should cascade-delete avatar and video with confirmation dialog

---

## Summary

Couples upload their photo → AI generates a stylized 3D cute avatar (Pixar 3D / Ghibli) → couple approves → AI animates it into a subtle looping video ("living portrait"). The animated video replaces the static hero image, creating a unique, premium wedding invitation experience.

## Two-Step Pipeline

### Step 1: Photo → 3D Cute Avatar

- **API:** fal.ai FLUX.1 [dev] Image-to-Image (`fal-ai/flux/dev/image-to-image`)
- **Input:** Couple's hero photo (`hero.heroImageUrl`)
- **Output:** Stylized avatar image (512×512 WebP)
- **Styles:** Pixar 3D, Ghibli (2 styles for v1)
- **Cost:** ~$0.025 per generation (1024×1024 = 1 megapixel)
- **Time:** 5–15 seconds
- **Rate limit:** Max 8 total living portrait generations per invitation (avatar + video combined)

**Prompt template:**
> "Transform this couple photo into a cute {style} animated portrait. CRITICAL: Preserve the person's exact facial features, face shape, skin tone, hairstyle, hair color, and expression. The character must be clearly recognizable as the same person. Soft romantic lighting, warm tones, wedding-appropriate setting. High quality, detailed, elegant."

### Research Insights — Avatar Generation

**Best Practices (fal.ai FLUX Image-to-Image):**
- Use `strength` parameter (0.5–0.7) to balance style transfer vs likeness preservation — lower = more original features preserved
- Generate at `1024x1024` from API, then convert to WebP and resize to 512×512 for storage (sufficient for 2x retina at 256px display)
- Set `num_inference_steps: 40` for quality, `guidance_scale: 7.5` for prompt adherence
- No organization verification required — just `FAL_KEY` env var
- Alternative model for higher quality: FLUX Pro 1.1 (`fal-ai/flux-pro/v1.1`) at $0.04/megapixel

**fal.ai SDK Integration:**
```typescript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/flux/dev/image-to-image", {
  input: {
    image_url: heroImageUrl,
    prompt: stylePrompt,
    strength: 0.6,       // Balance style vs likeness
    image_size: "square", // 1024x1024
    num_inference_steps: 40,
  },
  pollInterval: 1000,
});
const avatarUrl = result.images[0].url;
```

**Prompt Engineering for Facial Likeness:**
- Include explicit preservation block in prompt (see template above)
- Avoid words like "cartoon" or "caricature" that push too far from original — use "animated portrait"
- For couple avatars, use the exact same prompt template for visual consistency
- `strength: 0.5` for maximum likeness, `strength: 0.7` for stronger stylization — let users tune via style choice

**Error Handling:**
- fal.ai returns standard HTTP errors — no unpredictable content policy rejections like OpenAI
- Never show raw API errors; show: "This photo could not be processed. Please try a different photo with a clear, front-facing view."
- Retry transient errors (429, 5xx) with exponential backoff via fal.ai client retry config

**Input Photo Guidance (show to users):**
- Front-facing or slight 3/4 angle (no profile shots)
- Good lighting, clear focus, face fills at least 30% of frame
- No sunglasses or face-obscuring accessories

### Step 2: Avatar → Animated Living Portrait

- **API:** fal.ai Kling 2.6 Pro Image-to-Video (`fal-ai/kling-video/v2.6/pro/image-to-video`)
- **Input:** Approved avatar image (`hero.avatarImageUrl`)
- **Output:** 5 second looping video (MP4 H.264, 720p)
- **Cost:** ~$0.35 per 5-second video ($0.07/sec, no audio)
- **Time:** 30–120 seconds
- **Rate limit:** Shared with Step 1 — max 8 total generations per invitation

**Prompt template:**
> "Gentle, subtle animation. Soft breeze through hair, very slight natural breathing movement. Elegant, dreamlike quality. Keep the scene mostly still with only minimal, graceful motion."

### Research Insights — Video Generation

**fal.ai SDK Integration (Queue Pattern):**
```typescript
import { fal } from "@fal-ai/client";

// Step 1: Submit job (returns immediately)
const { request_id } = await fal.queue.submit(
  "fal-ai/kling-video/v2.6/pro/image-to-video",
  { input: { image_url: avatarImageUrl, prompt: motionPrompt } }
);

// Step 2: Poll status (client-side via React Query refetchInterval)
const status = await fal.queue.status(
  "fal-ai/kling-video/v2.6/pro/image-to-video",
  { requestId: request_id, logs: true }
);

// Step 3: Get result when completed
const result = await fal.queue.result(
  "fal-ai/kling-video/v2.6/pro/image-to-video",
  { requestId: request_id }
);
const videoUrl = result.video.url; // fal.ai hosted URL (temporary)
```

**API Integration Pattern:**
- Video generation MUST use async job submission + client-side polling (NOT a blocking 120-second server function)
- Submit job via `POST /api/ai/animate-portrait` → server calls `fal.queue.submit()` → returns `{ jobId, requestId }` immediately
- Client polls `GET /api/ai/animate-status` with React Query `refetchInterval` → server calls `fal.queue.status()`
- On first detection of completion: server calls `fal.queue.result()` → downloads video → processes with FFmpeg → uploads to R2 → updates DB

**Alternative video models on fal.ai (if Kling quality is insufficient):**
- MiniMax Hailuo-02 Standard: $0.017-0.045/sec (budget option)
- WAN 2.1: $0.20/video (cheapest, lower quality)
- MiniMax Video 01: $0.50/video (fixed price)

**Video Encoding Optimization:**
- Resolution: 720x720 (square, matching avatar aspect ratio) or 720x960 (portrait)
- Codec: H.264 Baseline profile (universal hardware decode on mobile)
- Bitrate: 1.5–2 Mbps CBR (5-second loop at 2 Mbps = ~1.25 MB)
- Frame rate: 24fps (cinematic, lower decode overhead)
- Audio: Strip entirely (video is muted)
- **Always process with `-movflags +faststart`** — moves moov atom to start for streaming
- This brings file size from 2–5 MB down to **~1–1.5 MB** (60-75% reduction)

### Cost Summary

| Step | Model | Cost | Time |
|------|-------|------|------|
| Avatar generation | FLUX.1 [dev] img2img | ~$0.025 | 5–15 sec |
| Video generation | Kling 2.6 Pro (5s) | ~$0.35 | 30–120 sec |
| **Total per invite** | **fal.ai unified** | **~$0.38** | **~35–135 sec** |

*All costs charged against existing fal.ai credits. No separate API keys needed.*

---

## User Flow

### Editor Flow

1. Couple uploads hero photo (existing flow)
2. New "Living Portrait" section appears below the image upload (premium only — free users see `UpgradePrompt`)
3. Couple selects avatar style (Pixar 3D / Ghibli) via radio buttons
4. Click "Generate Avatar" → progress indicator with step label (5–15 sec) → preview avatar
5. If unsatisfied → "Regenerate" (try different style or same style for variation)
6. If satisfied → "Animate Avatar" button becomes enabled
7. Click "Animate Avatar" → progress bar with ETA (30–120 sec) → preview animated video
8. If unsatisfied → "Regenerate" video or go back to regenerate avatar
9. Avatar URL and video URL are saved to invitation content via `handleFieldChange` (leverages existing auto-save)

### Research Insights — User Flow Gaps

**Missing flows that must be addressed:**

- **Hero image changed after avatar generated**: Show confirmation dialog: "Changing your hero photo will remove the generated avatar and video. Continue?" Then cascade-delete both.
- **Navigate away during generation**: Generation continues server-side. When user returns, poll status endpoint to recover. Server persists job state in `aiGenerations` table.
- **Rate limit exhaustion**: Show remaining attempts count proactively (e.g., "3 of 8 attempts remaining"). When exhausted, disable button with clear message.
- **Plan-tier gating**: Living Portrait is premium-only. Free users see the section with existing `UpgradePrompt` component.
- **Undo/redo exclusion**: Avatar and video URL changes do NOT participate in `useEditorState`'s undo/redo stack — they are committed side effects, not undoable edits.
- **Style preview**: Show static example thumbnails for each style option before the user commits to generation.
- **Failed attempts**: Only successful completions count against the rate limit. Timeouts and API errors do not consume attempts.
- **Regenerate avatar invalidates video**: When avatar is regenerated while a video exists, auto-remove the video and show: "Avatar changed — generate a new video?"

### Public View (Guest Experience)

Display priority (waterfall fallback):

1. `hero.animatedVideoUrl` exists → progressive video loading (see Performance section)
2. `hero.avatarImageUrl` exists → `<img>` with Ken Burns animation
3. `hero.heroImageUrl` exists → `<img>` with Ken Burns animation (current behavior)
4. None → Unsplash placeholder

### Research Insights — Video Display

**Poster-first progressive loading (CRITICAL for LCP):**
- Always render a poster `<img>` with `fetchPriority="high"` first for instant LCP
- Load `<video>` in parallel; cross-fade to video on `canplaythrough` event
- Never let video block LCP — the poster image IS the LCP element

**Mobile considerations:**
- `prefers-reduced-motion`: Show static avatar or original photo, never autoplay video
- Slow networks (2G/3G): Skip video loading entirely — detect via `navigator.connection.effectiveType`
- Safari iOS autoplay requires `muted` + `playsinline` attributes
- WeChat in-app browser (critical for MY/SG): May need `x5-video-player-type="h5"` attribute. **Must test before launch.**
- Viewport-gated playback: Pause video via `IntersectionObserver` when hero scrolls off-screen (reduces memory + battery)
- Set `<video preload="metadata">` (not `"auto"`) to avoid eagerly downloading full video on mobile

**SSR considerations:**
- Server-render `<video>` with `poster` attribute so SSR output shows an image (not black rectangle)
- Add `<link rel="preload" as="image" href={posterUrl}>` in the route's `head` function for poster preload
- Network Information API checks (`navigator.connection`) must run client-side only in `useEffect`

**Editor mode:**
- Do NOT autoplay video in editor mode — show poster frame with "Video preview" badge overlay
- Eliminates continuous video decode overhead during editing

---

## Data Model

### Display data — in `InvitationContent.hero` (JSONB)

```typescript
hero: {
  // Existing fields...
  heroImageUrl?: string;        // Original uploaded photo
  avatarImageUrl?: string;      // Generated 3D cute avatar (WebP, 512x512)
  avatarStyle?: "pixar" | "ghibli";
  animatedVideoUrl?: string;    // Generated living portrait video (MP4)
}
```

### Research Insights — Data Model

**Why `animationStatus` was removed from JSONB (critical decision):**

Multiple reviewers independently identified this as the #1 anti-pattern in the original plan:

1. **Auto-save race condition**: The editor's `useAutoSave` sends the entire `content` JSONB blob every 2–30 seconds. If the server sets `animationStatus: "completed"` but the editor's stale draft still has `"generating-video"`, the next auto-save overwrites the server's status — silently losing the completed state.
2. **Separation of concerns**: `InvitationContent` is the couple's "document" (what guests see). Job processing state is operational metadata that does not belong there.
3. **Snapshot pollution**: The `invitationSnapshots` table captures content on every update. Processing status transitions would pollute the snapshot history.
4. **Existing pattern**: The codebase already keeps transient state (`aiGenerating`, `saveStatus`, `uploadingField`) in React state, not in the database.

**Where processing state lives instead:**

- **In-progress state**: React component state in `useLivingPortrait` hook (matching `useAiAssistant` pattern)
- **Job persistence**: Rows in the existing `aiGenerations` table with `sectionId: "hero-avatar"` or `sectionId: "hero-animation"`, extended with a `status` column and `externalJobId`
- **Completion state**: Derived from URL presence — `avatarImageUrl` present = avatar done, `animatedVideoUrl` present = video done

**Why split avatar and video tracking:**

The original single `animationStatus` enum cannot represent "avatar complete, video failed" or "avatar regenerated, video stale." Use two `aiGenerations` rows — one per step — each with independent status.

---

## API Endpoints

### `POST /api/ai/generate-avatar`

- **Auth:** Required — verify `invitation.userId === authedUser.id` (ownership scoping)
- **Input:** `{ invitationId, style: "pixar" | "ghibli", token }`
- **Validation:** Zod schema via `parseInput`, heroImageUrl must exist, rate limit check, min 512×512 image
- **Process:**
  1. Download hero image URL from invitation content
  2. Call `fal.subscribe("fal-ai/flux/dev/image-to-image", { input: { image_url, prompt, strength: 0.6 } })`
  3. Download result from fal.ai temporary URL, convert to WebP, resize to 512×512
  4. Upload to R2 (`avatars/{invitationId}/{contentHash}.webp`)
  5. Delete previous avatar from R2 (prevent orphans)
- **Response:** `{ avatarImageUrl: string }` — client previews, then applies via `handleFieldChange`
- **Does NOT modify invitation content directly** — follows existing generate → preview → apply pattern

### `POST /api/ai/animate-portrait` (Job Submission)

- **Auth:** Required — ownership scoping
- **Input:** `{ invitationId, token }`
- **Validation:** avatarImageUrl must exist, rate limit check
- **Process:**
  1. Call `fal.queue.submit("fal-ai/kling-video/v2.6/pro/image-to-video", { input: { image_url, prompt } })`
  2. Store `request_id` as `externalJobId` in `aiGenerations` row with `status: "processing"`
  3. Return immediately
- **Response:** `{ jobId: string, status: "processing" }`

### `GET /api/ai/animate-status` (Polling)

- **Auth:** Required — ownership scoping
- **Input:** `{ jobId, token }`
- **Process:**
  1. Check `aiGenerations` row for current status
  2. If status is `"processing"`, call `fal.queue.status()` with stored `externalJobId` for latest state
  3. On first detection of completion: call `fal.queue.result()` → download video → process with FFmpeg (`-movflags +faststart`, H.264 Baseline, strip audio) → upload to R2 → update `aiGenerations` to `"completed"`
- **Response:** `{ status: "processing" | "completed" | "failed", animatedVideoUrl?: string, progress?: number }`

### Research Insights — API Design

**Security (based on prior vulnerability — CRITICAL):**
- Both endpoints MUST verify `invitation.userId === authedUser.id` before any mutation
- Use `and(eq(id, invitationId), eq(userId, userId))` in the DB query (same pattern as `applyAiResultFn`)
- Use `structuredClone` of existing content before modifying
- Write to hardcoded key paths only (`hero.avatarImageUrl`, `hero.animatedVideoUrl`) — never accept user-supplied paths
- Add regression tests: call endpoints with valid token but `invitationId` belonging to another user → assert "Access denied"

**Content update pattern (matches existing codebase):**
- Server returns URL → client displays preview → user approves → client calls `handleFieldChange("hero.avatarImageUrl", url)` → auto-save persists naturally
- This matches the existing `useAiAssistant` generate → preview → `applyResult()` flow
- When the user applies, the `useAutoSave` hook picks up the change and saves it
- Alternative for navigate-away recovery: if the generation completes server-side but the user left, the `aiGenerations` row stores the result URL. When the user returns, the `useLivingPortrait` hook queries for pending completed jobs and offers to apply them.

**Error handling:**
- Use the existing `ApiError` class: `ApiError.rateLimit()`, `ApiError.badRequest()`
- Classify errors: `RATE_LIMITED` (retryable after delay), `TIMEOUT` (retryable once), `SERVER_ERROR` (retryable with backoff)
- fal.ai client has built-in retry config: `fal.config({ retry: { maxRetries: 2, baseDelay: 1000, maxDelay: 60000 } })`

**File structure:**
- `src/api/ai-avatar.ts` — avatar generation endpoint
- `src/api/ai-animation.ts` — animation submission + status endpoints
- `src/api/r2.ts` — server-side R2 upload utility (new, shared)
- Do NOT add to existing `src/api/ai.ts` (already 753 lines)

---

## Storage

- Same Cloudflare R2 bucket, custom domain `media.dreammoments.app` (not `r2.dev`)
- Avatar images: `avatars/{invitationId}/{contentHash}.webp` (~100–300 KB)
- Animated videos: `animations/{invitationId}/{contentHash}.mp4` (~1–1.5 MB optimized)
- Cache-Control: `public, max-age=31536000, immutable` on all uploads
- Content-addressed keys (hash-based) ensure cache invalidation on regeneration

### Research Insights — R2 Storage

**CDN configuration:**
- Cloudflare has edge nodes in Kuala Lumpur (KUL), Singapore (SIN), and Johor Bahru (JHB) — excellent for target market
- Custom domain automatically uses Cloudflare CDN edge caching
- After first guest views the invitation, all subsequent guests in same region get edge-cached assets with sub-50ms TTFB
- Create a cache rule for `.mp4`/`.webm` files: edge TTL 30 days, browser TTL 7 days

**Video streaming:**
- R2 natively supports range requests (HTTP 206) for video seeking
- `-movflags +faststart` on MP4 is **mandatory** — without it, browser downloads entire file before playback (fatal on mobile)
- Set explicit `Content-Type: video/mp4` on upload — R2 does not auto-detect reliably

**CORS (only needed if different subdomain):**
- If media is at `media.dreammoments.app` and app is at `app.dreammoments.app`, simple `<video src="...">` does NOT require CORS
- Only needed if using `fetch()` to read video data programmatically

**Cleanup strategy:**
- On regeneration: delete previous avatar/video from R2 before uploading new one
- On invitation deletion: cascade-delete all media files (use `invitation_media` tracking table or content-based scan)
- Safety net: R2 lifecycle rule to delete `uploads/temp/*` after 1 day
- Weekly reconciliation job to detect and delete orphaned R2 objects not referenced by any invitation

**Cost at scale (R2 egress is FREE):**
- 500 invitations/month × 1.5 MB video = 750 MB new storage/month
- 500 × 100 views × 1.5 MB = 75 GB egress/month → $0.00 (free)
- Storage after 12 months: ~9 GB → ~$0.14/month
- **Total R2 cost: ~$0.14–1.80/month** — negligible

---

## Editor UI

```
┌─────────────────────────────────┐
│  Hero Image                     │
│  [Current image upload field]   │
│                                 │
│  ── Living Portrait ──────────  │
│  (Premium only — UpgradePrompt  │
│   shown for free users)         │
│                                 │
│  Step 1: Create Avatar          │
│  (○ Pixar 3D) (○ Ghibli)       │
│  [✨ Generate Avatar]           │
│  "5 of 8 attempts remaining"   │
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
│  │  (poster frame +     │       │
│  │   "Video preview"    │       │
│  │   badge in editor)   │       │
│  └─────────────────────┘       │
│  [↻ Regenerate] [✗ Remove]     │
└─────────────────────────────────┘
```

### Research Insights — Editor Integration

**Follow existing patterns:**
- Add `"living-portrait"` to `FieldConfig.type` union in `src/templates/types.ts`
- Add corresponding field entry to hero section in `src/templates/double-happiness.ts`
- Handle in `FieldRenderer` with a dedicated `LivingPortraitField` component
- Create `useLivingPortrait` hook in `src/components/editor/hooks/` following `useAiAssistant` patterns

**Race condition prevention (P0 items):**
1. **Double-click**: Use ref-based mutex (`generatingRef`), not just React state — state updates don't batch fast enough
2. **Navigate away**: Job state persists in `aiGenerations` table; `useLivingPortrait` queries for pending completed jobs on mount
3. **Auto-save conflict**: Server does NOT modify invitation content directly. Client applies via `handleFieldChange`, which triggers auto-save naturally. For navigate-away recovery, use `patchInvitationContentFn` to set only the specific key.
4. **Regenerate avatar invalidates video**: Set video `aiGenerations` row to `status: "invalidated"` when avatar is regenerated. Discard stale video results by comparing `videoSourceAvatarHash` to current avatar hash.
5. **Stale closures**: Use `draftRef` pattern (matching `useAutoSave`) when merging async results into draft state
6. **Polling overlap**: Use recursive `setTimeout` with backoff (not `setInterval`), with cancel token pattern

**Loading state UX (multi-phase):**
- 0–3 seconds: Shimmer/skeleton placeholder
- 3–15 seconds (avatar): Progress bar + step description ("Analyzing your photo...")
- 15–120 seconds (video): Progress bar + estimated time remaining + step description
- Accessibility: Always-mounted `aria-live="polite"` region for screen reader announcements; `role="progressbar"` with `aria-valuenow`/`aria-valuemin`/`aria-valuemax`

**State management:**
- Workflow state (which step we're on): Zustand store or component state
- Server data (job status, results): React Query with `refetchInterval`
- Dynamic poll rate: 2 seconds for first 30 seconds, then 5 seconds. Stop on completion/failure.

---

## Error Handling

- **No hero image:** "Generate Avatar" disabled with tooltip "Upload a hero photo first"
- **API failure (avatar):** Error toast with classified message, button stays enabled for retry.
- **API failure (video):** Error toast, falls back to displaying avatar image
- **Slow connection:** `<video poster={avatarImageUrl}>` shows avatar while video loads; skip video entirely on 2G/3G
- **`prefers-reduced-motion`:** Show static avatar or original photo, never autoplay video. Also disable Ken Burns on fallback `<img>`.
- **Image too small:** Validate minimum 512×512 before sending to API
- **Rate limit exhaustion:** Disable button, show "Limit reached" with remaining count
- **Generation timeout:** "Avatar generation took too long. Try a smaller or simpler photo." (retryable)
- **Autoplay failure:** Fallback to poster image with subtle play button overlay (important for WeChat in-app browser)
- **Navigate-away recovery:** On remount, check `aiGenerations` for completed jobs that weren't applied

---

## Out of Scope (YAGNI)

- No style customization beyond the 2 presets (add more based on usage data)
- No couple-selectable animation intensity or duration
- No video trimming or editing in-app
- No batch processing (one hero image at a time)
- No caching/reuse of avatars across invitations
- No real-time 3D rendering — video files only
- No provider abstraction layer for v1 (direct API calls, swap by changing the function body)
- No `navigator.connection.saveData` detection for v1 (covered by `prefers-reduced-motion` + `effectiveType` check)
- No SSE for real-time progress (polling is sufficient at current scale)
- No multi-image couple avatar in single request (generate separately for consistency)

---

## Technical Notes

- Three.js + React Three Fiber are already installed (used for landing page water ripple) but NOT needed for this feature — we use standard `<video>` and `<img>` elements
- Video element attributes: `autoplay muted loop playsinline preload="metadata"`
- **Single API provider**: fal.ai for both avatar (FLUX img2img) and video (Kling) — no OpenAI dependency for this feature
- **New dependency**: `@fal-ai/client` (npm package) — unified SDK for all fal.ai models
- **Env var**: `FAL_KEY` — single API key for both avatar and video generation (server-side only)
- **fal.ai proxy**: For browser-side calls, configure proxy at `/api/fal/proxy` (optional — current plan uses server functions only)
- `@aws-sdk/client-s3` needed for server-side R2 uploads (existing deps may already cover this)
- FFmpeg must be available on the processing server for video encoding
- The existing `src/api/ai.ts` reference in original plan was incorrect — it's a file not a directory
- fal.ai temporary URLs expire — always download and re-upload to R2 for permanent storage

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/api/ai-avatar.ts` | Create | Avatar generation server function |
| `src/api/ai-animation.ts` | Create | Video submission + status polling server functions |
| `src/api/r2.ts` | Create | Server-side R2 upload utility (extract `getR2Config` from `storage.ts`) |
| `src/lib/types.ts` | Modify | Add `avatarImageUrl`, `avatarStyle`, `animatedVideoUrl` to `hero` interface |
| `src/lib/validation.ts` | Modify | Add new optional fields to `invitationContentSchema` |
| `src/templates/types.ts` | Modify | Add `"living-portrait"` to `FieldConfig.type` union |
| `src/templates/double-happiness.ts` | Modify | Add Living Portrait field to hero section config |
| `src/components/editor/hooks/useLivingPortrait.ts` | Create | Hook for generation lifecycle, following `useAiAssistant` patterns |
| `src/components/editor/LivingPortraitField.tsx` | Create | Editor UI for avatar/video generation |
| `src/components/editor/FieldRenderer.tsx` | Modify | Add `living-portrait` case |
| `src/components/templates/double-happiness/HeroMedia.tsx` | Create | Extracted hero media component with video/avatar/image fallback |
| `src/components/templates/double-happiness/DoubleHappinessInvitation.tsx` | Modify | Use `HeroMedia` in hero section |
| `src/routes/invite/$slug.tsx` | Modify | Add poster preload to `head` function |
| `src/db/schema.ts` | Modify | Add `status` and `externalJobId` columns to `aiGenerations` table |

## Research Sources

- [fal.ai FLUX.1 [dev] Image-to-Image](https://fal.ai/models/fal-ai/flux/dev/image-to-image/api)
- [fal.ai FLUX Pro 1.1](https://fal.ai/models/fal-ai/flux-pro/v1.1)
- [fal.ai Kling 2.6 Pro Image-to-Video](https://fal.ai/models/fal-ai/kling-video/v2.6/pro/image-to-video)
- [fal.ai Queue API Documentation](https://docs.fal.ai/model-apis/model-endpoints/queue)
- [fal.ai JavaScript Client SDK](https://github.com/fal-ai/fal-js)
- [fal.ai Pricing](https://fal.ai/pricing)
- [fal.ai Next.js Integration](https://docs.fal.ai/model-apis/integrations/nextjs)
- [R2 Platform Limits](https://developers.cloudflare.com/r2/platform/limits/)
- [R2 Pricing (zero egress)](https://developers.cloudflare.com/r2/pricing/)
- [R2 Object Lifecycles](https://developers.cloudflare.com/r2/buckets/object-lifecycles/)
- [R2 CORS Configuration](https://developers.cloudflare.com/r2/buckets/cors/)
- [Cloudflare KL/SG Edge Nodes](https://blog.cloudflare.com/kuala-lumpur-malaysia-cloudflares-45th-data-center/)
- [TanStack Query v5 — refetchInterval](https://tanstack.com/query/v5)
- [NNGroup Skeleton Screens](https://www.nngroup.com/articles/skeleton-screens/)
- [MDN ARIA Live Regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions)
- [LivePortrait (open-source alternative)](https://github.com/KwaiVGI/LivePortrait)
