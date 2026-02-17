---
title: "feat: Reimagine Editor as Canvas Engine with Structured Document Model"
type: feat
status: active
date: 2026-02-17
brainstorm: docs/brainstorms/2026-02-17-canvas-editor-reimagine-brainstorm.md
---

# feat: Reimagine Editor as Canvas Engine with Structured Document Model

## Enhancement Summary

**Deepened on:** 2026-02-17  
**Sections enhanced:** 11  
**Research agents used:** `deepen-plan`, `framework-docs-researcher`, `performance-oracle`, `security-sentinel`, `emil-design-engineering`, `kieran-typescript-reviewer`, Context7 (`/pmndrs/zustand`, `/charkour/zundo`, `/tanstack/router`) + official web docs

### Key Improvements

1. Hardened store/undo architecture for drag-heavy workloads (`subscribeWithSelector`, transient updates, strict `partialize` + `equality`).
2. Added pointer + mobile interaction constraints (`setPointerCapture`, `touch-action`, `pointercancel`, auto-scroll via `requestAnimationFrame`).
3. Upgraded accessibility/performance gates to align with WCAG 2.2 + modern web vitals.

### New Considerations Discovered

- `role="application"` should be scoped carefully; overuse harms screen-reader ergonomics.
- Drag UX must ship equivalent non-drag controls (WCAG 2.5.7).
- `contentEditable` needs paste sanitization + IME handling to avoid malformed content and edit glitches.

## Section Manifest

- Section 1: Overview + Problem Statement - tighten success shape, editing parity, migration safety.
- Section 2: Document model + store - normalization, undo boundaries, schema guardrails.
- Section 3: Rendering + drag system - pointer correctness, paint pipeline, perf budgets.
- Section 4: Inline editing + AI - text safety, action validation, predictable undo.
- Section 5: Accessibility + mobile - WCAG 2.2 compliance and touch-first ergonomics.
- Section 6: Migration + rollout - dual-format reliability, observability, reversible rollout.
- Section 7: Acceptance criteria + quality gates - measurable thresholds and test matrix.

## Overview

Replace the current side-panel + preview editor architecture with a Canva-style canvas editor where users directly manipulate invitation elements. The preview IS the editor. Users click any element to edit in-place, drag elements to reposition them freely, and interact with a contextual AI popover for content generation and layout suggestions.

The core architecture change: introduce a **structured document model** (a normalized tree of positioned, typed blocks) that sits between templates and the canvas renderer. Templates become JSON document definitions instead of 700-950 line React components. The AI reads and writes to this document model via a defined action set.

**Key design decisions** (from brainstorm):
- Click-to-edit on canvas (no separate context panel)
- Free-form positioning with snap-to-grid guardrails
- Templates as starting points, fully customizable after loading
- Contextual AI popover (not a persistent sidebar)
- DOM-based rendering (divs with absolute positioning + CSS transforms)
- Mobile-first single canvas (~390px width)
- Block-level animation properties

## Problem Statement / Motivation

The current editor has significant architectural limitations:

1. **Monolithic orchestrator**: `src/routes/editor/$invitationId.tsx` (746 lines) wires 12+ hooks with manual prop threading through deep component chains
2. **Two disconnected editing paths**: Context panel form editing and inline popover editing operate with separate state management
3. **Locked templates**: Each template is a 700-950 line React component that hardcodes layout and which fields are inline-editable. Adding a new template requires implementing the full component
4. **Limited inline editing**: Only 14 text fields per template are inline-editable. Lists, toggles, images, dates cannot be edited in-place
5. **No drag-and-drop**: Elements cannot be repositioned. No list item reordering
6. **Full-snapshot undo**: Stores entire `InvitationContent` clones (50 max), memory-intensive
7. **No shared editor context**: All props threaded manually, no React context for editor state

The canvas editor addresses all of these while enabling true AI co-editing via a structured document model.

## Proposed Solution

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Editor Route                          │
│  (thin orchestrator, delegates to DocumentStore)         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐   ┌──────────────┐   ┌─────────────┐ │
│  │ DocumentStore │◄──│ CanvasEngine │──►│ AI Popover  │ │
│  │ (Zustand +   │   │ (renders +   │   │ (contextual │ │
│  │  zundo)      │   │  interacts)  │   │  suggestions│ │
│  └──────┬───────┘   └──────┬───────┘   └─────────────┘ │
│         │                  │                             │
│         ▼                  ▼                             │
│  ┌──────────────┐   ┌──────────────┐                    │
│  │ AutoSave     │   │ BlockRenderer│                    │
│  │ (localStorage│   │ (per-type    │                    │
│  │  + server)   │   │  rendering)  │                    │
│  └──────────────┘   └──────────────┘                    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Document Model (TypeScript Interface)

```typescript
// src/lib/canvas/types.ts

interface CanvasDocument {
  version: "2.0";
  templateId: string;
  canvas: { width: number; height: number };
  blocksById: Record<string, Block>;
  blockOrder: string[]; // z-order, bottom to top
  designTokens: DesignTokens;
  metadata: {
    createdAt: string;
    updatedAt: string;
    templateVersion: string;
  };
}

type BlockType =
  | "text"
  | "image"
  | "heading"
  | "divider"
  | "map"
  | "gallery"
  | "timeline"
  | "form"
  | "countdown"
  | "group"
  | "decorative";

interface Block {
  id: string;
  type: BlockType;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  content: Record<string, unknown>; // type-specific
  style: Record<string, string>;    // CSS properties
  animation?: AnimationType;
  constraints?: BlockConstraints;
  children?: string[];               // child block IDs for groups
  parentId?: string;                 // parent group ID
  semantic?: string;                 // "partner-name" | "wedding-date" | etc.
  sectionId?: string;                // maps to template section concept
  locked?: boolean;
}

type AnimationType =
  | "fadeInUp"
  | "fadeIn"
  | "slideFromLeft"
  | "slideFromRight"
  | "scaleIn"
  | "parallax"
  | "none";

interface BlockConstraints {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  aspectRatio?: number;    // for images
  snapToGrid?: boolean;
}

interface DesignTokens {
  colors: Record<string, string>;
  fonts: Record<string, string>;
  spacing: number; // grid size in px
}
```

### State Management: Zustand + zundo

```typescript
// src/lib/canvas/store.ts

interface DocumentState {
  // Document data
  document: CanvasDocument;

  // Interaction state (NOT tracked by undo)
  selectedBlockIds: string[];
  hoveredBlockId: string | null;
  activeTool: "select" | "text" | "image" | "pan";
  dragState: DragState | null;
  editingBlockId: string | null; // block with active contentEditable

  // Actions (tracked by undo via zundo)
  updateBlock: (blockId: string, patch: Partial<Block>) => void;
  moveBlock: (blockId: string, position: { x: number; y: number }) => void;
  resizeBlock: (blockId: string, size: { width: number; height: number }) => void;
  addBlock: (type: BlockType, position: Position, content?: Record<string, unknown>) => void;
  removeBlock: (blockId: string) => void;
  reorderBlocks: (blockIds: string[]) => void;
  updateContent: (blockId: string, content: Record<string, unknown>) => void;
  restyleBlock: (blockId: string, style: Record<string, string>) => void;

  // Interaction actions (NOT tracked by undo)
  selectBlock: (blockId: string, additive?: boolean) => void;
  clearSelection: () => void;
  setActiveTool: (tool: string) => void;
  startDrag: (dragState: DragState) => void;
  endDrag: () => void;
  startEditing: (blockId: string) => void;
  stopEditing: () => void;
}
```

**zundo configuration:**
- `partialize`: Only track `document` (not `selectedBlockIds`, `hoveredBlockId`, `activeTool`, `dragState`, `editingBlockId`)
- `limit`: 50 history entries
- `equality`: Skip identical states (e.g., during drag, only commit on drop)

### Research Insights

**Best Practices:**
- Keep high-frequency interaction state (`dragPreview`, hover, pointer coords) outside render selectors; subscribe imperatively for transient updates.
- Use selector-based subscriptions and shallow equality to avoid cascade rerenders on each pointer move.
- Keep undo snapshots document-only, but add explicit action boundaries (`beginDrag`/`commitDrag`) so history stays semantic.

**Performance Considerations:**
- Snapshot only on user-intent boundaries (drop, resize end, blur, AI apply), not every move tick.
- Budget history memory with measured serialized snapshot size in CI (fail when exceeding threshold).

**Implementation Details:**
```typescript
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { temporal } from "zundo";
import { shallow } from "zustand/shallow";

export const useDocumentStore = create<DocumentState>()(
  subscribeWithSelector(
    temporal(
      (set, get) => ({
        // state + actions
      }),
      {
        partialize: (state) => ({ document: state.document }),
        equality: shallow,
        limit: 50,
      },
    ),
  ),
);
```

**Edge Cases:**
- Undo while inline edit open: commit/cancel edit first, then allow history navigation.
- Multi-select move: ensure one history entry represents full group delta, not N block mutations.

### Rendering: DOM-Based Canvas

Blocks are `<div>` elements with `position: absolute` inside a `position: relative` canvas container. Use `transform: translate(x, y)` instead of `top/left` for GPU-accelerated positioning during drag.

```
Canvas Container (position: relative, width: 390px, height: auto)
  ├── Block div (position: absolute, transform: translate(x,y))
  ├── Block div (position: absolute, transform: translate(x,y))
  ├── ...
  ├── SelectionOverlay (handles, alignment guides)
  └── InlineEditor (contentEditable overlay for active text block)
```

**Performance guardrails:**
- During drag: update CSS transform directly via ref, commit to Zustand only on drop
- `will-change: transform` only on the block being dragged (not all blocks)
- `contain: layout style` on block containers to isolate reflows
- No virtualization needed (~30-50 blocks per invitation)

### Research Insights

**Best Practices:**
- Use `translate3d(x, y, 0)` during drag for stable compositor behavior.
- Use `requestAnimationFrame` to coalesce drag paints and avoid main-thread thrash.
- Keep `will-change` short-lived; set on drag start, remove on drag end.

**Performance Considerations:**
- Track `INP` and dropped-frame rate for drag interactions, not only FPS averages.
- `contain` is useful, but verify it does not break intrinsic sizing/overflow expectations per block type.

**Implementation Details:**
```typescript
function scheduleDragPaint(nextX: number, nextY: number) {
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => {
    node.style.transform = `translate3d(${nextX}px, ${nextY}px, 0)`;
  });
}
```

**Edge Cases:**
- Browser zoom and devicePixelRatio changes can skew guide math; normalize to CSS pixels.
- Nested transformed parents can distort pointer deltas; compute in local canvas coordinates.

### Migration Strategy: Dual Renderer with Format Discriminator

```typescript
// In the invitations JSONB content column:
// Old format: { hero: { ... }, couple: { ... }, ... } (InvitationContent)
// New format: { version: "2.0", canvas: { ... }, blocksById: { ... }, ... } (CanvasDocument)

function isCanvasDocument(content: Record<string, unknown>): content is CanvasDocument {
  return content.version === "2.0";
}
```

- Existing invitations continue to render with current React template components
- New invitations created after canvas editor ships use the new document format
- Optional "Upgrade to Canvas Editor" action for existing invitations (lazy migration)
- Both renderers coexist behind the `isCanvasDocument` check
- Public invitation view (`/invite/$slug`) supports both formats

### Research Insights

**Best Practices:**
- Add explicit `formatVersion` + `schemaVersion` and keep migration functions pure/idempotent.
- Validate incoming JSON with Zod before rendering to avoid runtime crashes from malformed documents.
- Persist migration metadata (`migratedFrom`, `migratedAt`, `migrationToolVersion`) for support/debugging.

**Performance Considerations:**
- Run migration lazily on editor open, not list page load.
- Cache migrated doc in local draft to avoid repeated conversion for unchanged source content.

**Implementation Details:**
```typescript
const CanvasDocumentSchema = z.object({
  version: z.literal("2.0"),
  templateId: z.string(),
  canvas: z.object({ width: z.number(), height: z.number() }),
  blocksById: z.record(z.string(), z.any()),
  blockOrder: z.array(z.string()),
});
```

**Edge Cases:**
- Partial migration failure: keep old-format content untouched and surface retry action.
- Unknown legacy fields: preserve in `metadata.legacy` to avoid silent data loss.

## Technical Approach

### Key Components

| Component | File | Responsibility |
|-----------|------|----------------|
| `DocumentStore` | `src/lib/canvas/store.ts` | Zustand store with zundo undo/redo, all document mutations |
| `CanvasEngine` | `src/components/canvas/CanvasEngine.tsx` | Renders scrollable canvas, handles pointer events, selection, keyboard nav |
| `BlockRenderer` | `src/components/canvas/BlockRenderer.tsx` | Dispatches to type-specific renderers (TextBlock, ImageBlock, etc.) |
| `SelectionOverlay` | `src/components/canvas/SelectionOverlay.tsx` | Selection rectangles, drag handles, resize handles, alignment guides |
| `InlineTextEditor` | `src/components/canvas/InlineTextEditor.tsx` | contentEditable overlay for in-place text editing |
| `AiContextPopover` | `src/components/canvas/AiContextPopover.tsx` | Contextual AI suggestions based on selected block type + semantic |
| `BlockToolbar` | `src/components/canvas/BlockToolbar.tsx` | Floating toolbar near selected block (move, duplicate, delete, lock, animation) |
| `CanvasToolbar` | `src/components/canvas/CanvasToolbar.tsx` | Top toolbar (undo/redo, zoom, add block, save status, preview, publish) |
| `TemplateConverter` | `src/lib/canvas/template-converter.ts` | Converts template definitions to CanvasDocument instances |
| `useCanvasAutoSave` | `src/components/canvas/hooks/useCanvasAutoSave.ts` | Auto-save adapted for document model (same dual persistence pattern) |
| `useCanvasKeyboard` | `src/components/canvas/hooks/useCanvasKeyboard.ts` | Keyboard shortcuts (Cmd+Z, Delete, Arrow nudge, Escape) |
| `useSnapGuides` | `src/components/canvas/hooks/useSnapGuides.ts` | Snap-to-grid + alignment guide calculations |
| `useDragBlock` | `src/components/canvas/hooks/useDragBlock.ts` | Pointer event handling for block drag with CSS transform |

### Drag & Positioning

Use native pointer events (not dnd-kit) for simplest implementation:

1. `pointerdown` on block → record offset, set `dragState`
2. `pointermove` → update CSS transform directly via ref (no React state)
3. Show snap guides at grid intervals (8px) and alignment with other blocks
4. `pointerup` → commit final position to Zustand store (triggers undo snapshot)

**Mobile:** Long-press (300ms) to enter drag mode. Single tap selects. This distinguishes scroll from drag.

**Snap-to-grid:** 8px grid. Hold Shift to disable snap for pixel-perfect positioning. Alignment guides shown when edges or centers align with other blocks.

### Research Insights

**Best Practices:**
- Call `setPointerCapture(pointerId)` on drag start; release on end/cancel for reliable move/up events.
- Handle `pointercancel` explicitly (incoming call, OS gestures, browser interruptions).
- Apply `touch-action` selectively (`none` on drag handles, `pan-y` on scroll zones) to preserve natural page scroll.

**Performance Considerations:**
- Keep guide calculations O(visible-blocks) with cached bounding boxes and invalidate lazily.
- Auto-scroll should run in one rAF loop; avoid timer storms during edge-hover.

**Implementation Details:**
```typescript
function onPointerDown(e: PointerEvent) {
  const el = e.currentTarget as HTMLElement;
  el.setPointerCapture(e.pointerId);
  startDrag(e);
}
```

**Edge Cases:**
- Must provide non-drag alternative controls for same outcome (WCAG 2.5.7).
- Pen/stylus pointer types can trigger different pressure/hover sequences; test all pointer types.

### Inline Text Editing

Double-click (or single-tap on mobile) a text block to enter edit mode:

1. Replace block content with a `contentEditable` div
2. Use `react-contenteditable` library (already handles caret position management)
3. On blur or Escape → commit text to store, exit edit mode
4. On Enter (for single-line headings) → commit and exit
5. Preserve selection/caret position during React re-renders via `react-contenteditable`'s built-in handling

### Research Insights

**Best Practices:**
- Prefer plain-text editing semantics; sanitize pasted HTML aggressively before commit.
- Use React `suppressContentEditableWarning` only where controlled editing invariants are enforced.
- Track IME composition (`compositionstart/end`) to prevent premature commits for CJK input.

**Performance Considerations:**
- Debounce expensive normalization, but keep visible text updates immediate for typing latency.
- Commit on blur/explicit save; avoid store writes on every keystroke for large documents.

**Implementation Details:**
```typescript
const onPaste = (e: ClipboardEvent) => {
  e.preventDefault();
  const text = e.clipboardData?.getData("text/plain") ?? "";
  document.execCommand("insertText", false, text);
};
```

**Edge Cases:**
- Emoji + surrogate pairs can break naive max-length counters.
- Undo stack should treat one edit session as one entry unless user explicitly pauses/saves.

### AI Integration

The `semantic` field on blocks maps to AI task types:

```typescript
const semanticToAiTask: Record<string, AiTaskType[]> = {
  "partner-name": ["style"],
  "tagline": ["tagline", "translate"],
  "story-text": ["story", "translate"],
  "schedule-event": ["schedule"],
  "faq-item": ["faq"],
  "venue-description": ["style", "translate"],
  // generic fallbacks
  "text": ["style", "translate"],
  "image": ["style"],
};
```

**Popover trigger:** Click the AI sparkle icon on the floating BlockToolbar (appears on selection). The popover shows relevant actions based on `block.type` + `block.semantic`.

**AI actions on document model:**
- `updateContent(blockId, content)` — Rewrite text, change image
- `moveBlock(blockId, position)` — AI-suggested repositioning
- `addBlock(type, position, content)` — AI adds new elements
- `restyleBlock(blockId, style)` — Change colors, fonts
- `generateContent(blockId, prompt)` — AI generates content with preview before apply

### Research Insights

**Best Practices:**
- Make AI output a typed action payload first; run schema validation before mutating store.
- Default to preview/apply flow (never silent apply) to preserve user trust and undo clarity.
- Persist `lastAiAction` metadata for observability and incident debugging.

**Performance Considerations:**
- Stream text previews; apply final mutation once to avoid history spam.
- Batch multi-block AI changes into a single transaction for deterministic undo.

**Edge Cases:**
- AI may target deleted/locked blocks; server/client must reject stale block IDs safely.
- Prompt injection inside editable text should not escape into executable HTML/CSS.

### Accessibility

- **Tab order:** `tabindex` follows visual top-to-bottom order (sorted by `position.y`), not DOM insertion order
- **Screen readers:** Canvas container has `role="application"`. Each block has `aria-label` describing type + semantic + position. Live region announces drag operations
- **Keyboard positioning:** Arrow keys nudge selected block by grid size (8px). Shift+Arrow for 1px nudge
- **Alternative editing:** A "List View" toggle shows all blocks in a sequential list (similar to current ContextPanel) for users who prefer form-based editing

### Research Insights

**Best Practices:**
- Treat `role="application"` as opt-in mode; keep default document semantics where possible.
- Ensure pointer interactions respect cancellation and no-down-event execution patterns.
- Keep minimum 44x44 CSS px actionable targets on touch interfaces.

**Performance Considerations:**
- Live region updates should be concise and throttled during drag (`aria-live="polite"` + delta announcements).

**Edge Cases:**
- Must support equivalent non-drag paths for repositioning (arrow nudge + numeric position inputs).
- Focus restoration after popover close/edit end must be deterministic across keyboard and touch flows.

### Mobile Editing

- **Canvas width:** 390px (matches mobile viewport), centered on desktop
- **Block selection:** Single tap to select. Long-press (300ms) to start drag
- **Drag feedback:** Block lifts with subtle scale(1.02) + shadow. Position offset so finger doesn't obscure the block
- **Scroll vs. drag:** Scroll the canvas by touching empty space. Drag only after long-press on a block
- **Text editing:** Tap selected text block to enter edit mode. Virtual keyboard pushes canvas up via `visualViewport` API
- **Block toolbar:** Appears above the selected block. On mobile, snaps to bottom of screen if block is near top
- **Auto-scroll zones:** During drag, approaching canvas top/bottom edges (40px zone) triggers auto-scroll

### Research Insights

**Best Practices:**
- Prefer `visualViewport` when available; fallback to window resize/scroll for older environments.
- Keep long-press activation cancellable by movement threshold to prevent accidental drags while scrolling.
- Disable hover-only affordances on coarse pointers; surface actions via persistent selected state.

**Performance Considerations:**
- During keyboard open, avoid forced synchronous layout reads each frame.
- Cap auto-scroll speed and ease near edges to prevent overshoot.

**Edge Cases:**
- iOS Safari dynamic toolbar changes viewport height during gesture; recompute safe bounds on each viewport event.
- Long-press conflicts with text selection for editable blocks; require explicit mode switch when needed.

## Implementation Phases

### Phase 1: Document Model + Store (Foundation)

**Goal:** Define the document model, create Zustand store, and build a read-only renderer.

**Deliverables:**
- [x] `src/lib/canvas/types.ts` — TypeScript interfaces for CanvasDocument, Block, etc.
- [x] `src/lib/canvas/store.ts` — Zustand store with zundo middleware, all document mutations
- [x] `src/components/canvas/CanvasEngine.tsx` — Read-only renderer: canvas container + block positioning
- [x] `src/components/canvas/BlockRenderer.tsx` — Type dispatch to block-specific renderers
- [x] `src/components/canvas/blocks/TextBlock.tsx` — Text block renderer
- [x] `src/components/canvas/blocks/ImageBlock.tsx` — Image block renderer
- [x] `src/components/canvas/blocks/HeadingBlock.tsx` — Heading block renderer
- [x] `src/components/canvas/blocks/DividerBlock.tsx` — Divider block renderer
- [x] `src/lib/canvas/template-converter.ts` — Convert one template (Blush Romance) to CanvasDocument
- [x] Unit tests for store mutations and template converter
- [x] Feature flag: `CANVAS_EDITOR_ENABLED` in `.env.local`

**Success criteria:** Can render Blush Romance template from a CanvasDocument JSON with visual fidelity comparable to the React component version.

**Dependencies:** None (greenfield code alongside existing editor).

### Phase 2: Block Selection + Inline Editing

**Goal:** Make the canvas interactive — select blocks, edit text in-place.

**Deliverables:**
- [x] `src/components/canvas/SelectionOverlay.tsx` — Selection rectangle with handles
- [x] `src/components/canvas/BlockToolbar.tsx` — Floating toolbar (delete, duplicate, lock, AI trigger)
- [x] `src/components/canvas/InlineTextEditor.tsx` — contentEditable overlay for text blocks
- [x] `src/components/canvas/hooks/useCanvasKeyboard.ts` — Keyboard shortcuts (Delete, Escape, Cmd+Z, Cmd+A)
- [x] Click to select, double-click to edit text
- [x] Multi-select with Shift+click
- [x] Undo/redo working for content edits
- [x] Unit + integration tests for selection and text editing

**Success criteria:** Can select any block, edit text blocks in-place, undo/redo edits.

### Phase 3: Block Positioning (Drag + Resize + Snap)

**Goal:** Free-form block positioning with guardrails.

**Deliverables:**
- [x] `src/components/canvas/hooks/useDragBlock.ts` — Pointer event handling for drag
- [x] `src/components/canvas/hooks/useResizeBlock.ts` — Corner/edge resize handles
- [x] `src/components/canvas/hooks/useSnapGuides.ts` — Grid snap + alignment guides
- [x] `src/components/canvas/AlignmentGuides.tsx` — Visual guide lines during drag/resize
- [x] Z-order controls in BlockToolbar (Bring Forward, Send Backward)
- [x] Mobile: long-press to drag, auto-scroll zones
- [x] Arrow key nudge (8px grid, 1px with Shift)
- [x] Undo/redo for position/size changes (commit on drop only)
- [ ] E2E tests for drag-and-drop interactions

**Success criteria:** Can drag blocks to any position with snap guides, resize blocks, reorder z-index.

### Phase 4: Complex Block Types

**Goal:** Support all block types beyond text/image/heading.

**Deliverables:**
- [x] `src/components/canvas/blocks/GalleryBlock.tsx` — Photo gallery with grid layout
- [x] `src/components/canvas/blocks/TimelineBlock.tsx` — Story milestones timeline
- [x] `src/components/canvas/blocks/MapBlock.tsx` — Venue map embed
- [x] `src/components/canvas/blocks/CountdownBlock.tsx` — Countdown timer (configurable target date)
- [x] `src/components/canvas/blocks/FormBlock.tsx` — RSVP form (wraps existing RSVP logic)
- [x] `src/components/canvas/blocks/GroupBlock.tsx` — Group container (drag moves children together)
- [x] `src/components/canvas/blocks/DecorativeBlock.tsx` — SVG decorations, particles, overlays
- [x] Block-specific property editors in BlockToolbar
- [x] Tests for each block type

**Success criteria:** All block types from the brainstorm are renderable and configurable.

### Phase 5: AI Integration

**Goal:** Contextual AI popover for content generation and styling.

**Deliverables:**
- [x] `src/components/canvas/AiContextPopover.tsx` — Popover with block-type-specific AI actions
- [x] Semantic-to-task-type mapping for AI context awareness
- [x] Text block: Rewrite, translate, change tone, shorten/expand
- [x] Image block: Suggest alternatives, generate caption
- [x] Group/section: Rearrange children, suggest layout
- [x] Any block: Restyle (colors, fonts, spacing)
- [x] AI result preview before applying
- [x] Undo support for AI-applied changes
- [x] Tests for AI popover interactions

**Success criteria:** Can trigger AI suggestions for any selected block, preview results, and apply/discard.

### Phase 6: Template Conversion + Auto-Save

**Goal:** Convert all 4 templates to document definitions. Wire up persistence.

**Deliverables:**
- [x] Convert remaining templates to CanvasDocument definitions:
  - [x] `src/lib/canvas/templates/eternal-elegance.ts`
  - [x] `src/lib/canvas/templates/garden-romance.ts`
  - [x] `src/lib/canvas/templates/love-at-dusk.ts`
- [x] `src/components/canvas/hooks/useCanvasAutoSave.ts` — Dual persistence (localStorage + server)
- [x] Block-level animations (fadeInUp, parallax, etc.) with IntersectionObserver
- [x] Animation preview toggle in editor
- [x] Design token editing (global colors, fonts)
- [x] Template selection flow updated for canvas documents
- [x] Visual fidelity comparison tests for each template

**Success criteria:** All 4 templates available as canvas documents. Auto-save working. Animations play on scroll.

### Phase 7: Migration + Polish + Ship

**Goal:** Production-ready with canvas-only content format.

**Deliverables:**
- [x] Canvas renderer in `/invite/$slug` (public view)
- [x] Legacy `/editor/$invitationId` route redirects to canvas route
- [x] `src/lib/canvas/migrate.ts` — Converts InvitationContent to CanvasDocument
- [x] `formatVersion` discriminator field in content JSONB
- [ ] Updated onboarding tour for canvas editor
- [x] Canvas editor route at `/editor/canvas/$invitationId`
- [x] Mobile bottom bar for block palette (add blocks)
- [ ] Comprehensive E2E test suite for canvas editor
- [ ] Performance audit (drag smoothness, memory usage, save latency)
- [ ] Accessibility audit (keyboard nav, screen reader, reduced motion)
- [x] Remove feature flag, make canvas editor the default for new invitations

**Success criteria:** Canvas editor is production-ready and new invitations use canvas format by default.

### Phase Hardening Additions

- Add Phase 0.5 spike: pointer capture + touch-action prototype on iOS Safari + Android Chrome before full drag build.
- Add migration dry-run command for sampled production data with mismatch report (no writes).
- Add explicit observability tasks in Phase 7:
  - Event timings: `drag_start`, `drag_drop`, `autosave_local_done`, `autosave_server_done`
  - Error taxonomy: migration failure, AI action validation failure, contentEditable commit failure
  - Web vitals capture: INP, CLS on editor route

## Alternative Approaches Considered

See brainstorm document: `docs/brainstorms/2026-02-17-canvas-editor-reimagine-brainstorm.md`

1. **Overlay canvas on existing templates (Approach B):** Rejected — fragile DOM-rect tracking, CSS transform conflicts with responsive layouts
2. **Block-based editor like Notion (Approach C):** Rejected — limited to vertical stacking, loses art-directed template feel

## Acceptance Criteria

### Functional Requirements

- [x] Users can click any text element on the canvas to edit it in-place
- [x] Users can drag any block to reposition it anywhere on the canvas
- [x] Users can resize blocks via corner/edge handles
- [x] Snap-to-grid (8px) and alignment guides appear during drag/resize
- [x] Z-order controls: bring forward, send backward, bring to front, send to back
- [x] Undo/redo for all operations (text edits, moves, resizes, AI changes)
- [x] AI contextual popover shows relevant actions per block type
- [x] All 4 templates available as canvas documents with comparable visual fidelity
- [x] Block-level scroll animations work (fadeInUp, parallax, etc.)
- [x] Auto-save to localStorage + server (same dual persistence pattern)
- [x] Publish flow works from canvas editor
- [x] Editor and public routes normalize content to canvas format
- [x] New invitations use the canvas editor by default

### Non-Functional Requirements

- [ ] Drag operations maintain 60fps (no jank)
- [ ] Canvas renders ~50 blocks without performance degradation
- [ ] Undo history uses <1MB memory (50 snapshots)
- [ ] Auto-save latency <500ms for localStorage, <3s for server
- [ ] Mobile: touch targets minimum 44x44px
- [ ] Mobile: long-press drag feels responsive (<300ms activation)
- [ ] INP on editor route <200ms at p75 (mobile + desktop sample traffic)
- [ ] Drag move handler main-thread work stays under 4ms/frame on reference devices

### Accessibility Requirements

- [ ] Keyboard navigation: Tab through blocks in visual order
- [x] Arrow key nudge for block positioning
- [ ] Screen reader: blocks announced with type + content + position
- [ ] Live region: drag operations announced
- [x] "List View" alternative for form-based sequential editing
- [ ] Reduced motion: animations respect `prefers-reduced-motion`
- [ ] Focus management: focus restored after drag, edit, popover close
- [x] WCAG 2.5.7 Dragging Movements: all drag actions have non-drag equivalent controls
- [ ] WCAG 2.5.8 Target Size (Minimum): pointer targets >= 44x44 CSS px
- [ ] WCAG 2.5.2 Pointer Cancellation: no irreversible action on down-event

### Quality Gates

- [x] Unit test coverage for DocumentStore mutations
- [x] Integration tests for selection and editing interactions
- [ ] E2E tests for core user flows (create, edit, drag, AI, publish)
- [x] Visual fidelity tests for template rendering
- [ ] Performance benchmarks recorded and baselined
- [ ] Accessibility audit passing (axe-core, keyboard walkthrough)

## Success Metrics

- **Template creation time**: New templates defined in <100 lines of JSON (vs. 700-950 lines of React)
- **Editing task completion rate**: Users can complete common editing tasks (change text, reposition element, publish) without help
- **AI engagement**: Users trigger AI suggestions at least once per editing session
- **Mobile editing parity**: All editing operations available on mobile (touch equivalent for every desktop action)

## Dependencies & Prerequisites

| Dependency | Status | Notes |
|-----------|--------|-------|
| React 19 | Installed | Current stack |
| Zustand | **Needs install** | State management for document store |
| zundo | **Needs install** | Undo/redo middleware for Zustand |
| react-contenteditable | **Needs install** | contentEditable wrapper with caret management |
| motion (Framer Motion) | Installed | Already used for animations, has `drag` prop available |
| Tailwind CSS 4 | Installed | Styling |
| PostgreSQL JSONB | Ready | `content` column already accepts `Record<string, unknown>` |

## Risk Analysis & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Visual fidelity loss during template conversion | High | Medium | Phase 1 validates one template before proceeding. Accept "comparable" not "identical" |
| Mobile drag UX feels imprecise | Medium | High | Prototype in Phase 3, user test before committing. Fallback: position input fields |
| contentEditable cross-browser inconsistencies | Medium | Medium | Use `react-contenteditable` library. Test on Safari, Chrome, Firefox |
| Undo/redo memory pressure with position data | Low | Low | zundo `partialize` excludes interaction state. 50 snapshots at ~5KB each = 250KB |
| Existing E2E tests break during migration | High | Medium | Maintain old editor alongside new. Feature flag. New E2E suite for canvas |
| AI context loss with generic blocks | Medium | High | `semantic` field preserves meaning. Map semantics to AI task types |
| Scope creep during incremental build | Medium | High | Each phase has clear deliverables and success criteria. Ship phases independently |

## Future Considerations

- **Real-time collaboration**: Document model + Zustand store pattern is compatible with CRDT-based sync (e.g., Yjs). Not in scope but architecture does not preclude it
- **Custom block types**: Plugin system for user-defined blocks (e.g., Spotify embed, video). Defer until block model is proven stable
- **Template marketplace**: JSON document definitions can be shared/sold. Much simpler than packaging React components
- **AI layout generation**: Full-page layout generation from a prompt ("create a romantic garden wedding invitation"). Requires significant AI capability beyond current scope
- **Desktop responsive preview**: Show how the mobile canvas looks when centered on a desktop viewport

## References & Research

### Internal References

- Brainstorm: `docs/brainstorms/2026-02-17-canvas-editor-reimagine-brainstorm.md`
- Current editor route: `src/routes/editor/$invitationId.tsx` (746 lines)
- Editor layout: `src/components/editor/EditorLayout.tsx` (97 lines)
- Editor state: `src/components/editor/hooks/useEditorState.ts` (189 lines)
- Auto-save: `src/components/editor/hooks/useAutoSave.ts` (242 lines)
- AI assistant: `src/components/editor/hooks/useAiAssistant.ts` (238 lines)
- Content types: `src/lib/types.ts` (201 lines)
- Template types: `src/templates/types.ts` (123 lines)
- DB schema: `src/db/schema.ts` (196 lines)
- Template example: `src/components/templates/love-at-dusk/LoveAtDuskInvitation.tsx` (953 lines)
- Inline editing helpers: `src/components/templates/helpers.ts` (42 lines)
- Section shell: `src/components/templates/SectionShell.tsx` (84 lines)

### External References

- Zustand docs: https://zustand.docs.pmnd.rs/
- Zustand `subscribeWithSelector`: https://zustand.docs.pmnd.rs/middlewares/subscribe-with-selector
- zundo README/API: https://github.com/charkour/zundo
- TanStack Router code splitting: https://tanstack.com/router/latest/docs/framework/react/guide/code-splitting
- MDN Pointer Events: https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events
- MDN `setPointerCapture`: https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture
- MDN `touch-action`: https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action
- MDN `requestAnimationFrame`: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
- MDN `contenteditable`: https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/contenteditable
- React DOM common props (`contentEditable`/`suppressContentEditableWarning`): https://react.dev/reference/react-dom/components/common
- MDN ARIA `application` role: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/application_role
- W3C WCAG 2.5.7 Dragging Movements: https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html
- W3C WCAG 2.5.8 Target Size (Minimum): https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- W3C WCAG 2.5.2 Pointer Cancellation: https://www.w3.org/WAI/WCAG22/Understanding/pointer-cancellation.html
- MDN Visual Viewport API: https://developer.mozilla.org/en-US/docs/Web/API/Visual_Viewport_API
- MDN Web Storage API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API
