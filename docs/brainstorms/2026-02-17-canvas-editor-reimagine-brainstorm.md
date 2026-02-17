---
date: 2026-02-17
topic: canvas-editor-reimagine
---

# Reimagine the Editor: Canvas Engine with Structured Document Model

## What We're Building

A Canva-style canvas editor that replaces the current side-panel + preview architecture with a direct manipulation experience. Users click any element on the invitation to edit it in-place, drag elements to reposition them freely, and interact with a contextual AI popover for content generation and layout suggestions. Templates serve as starting points that produce an editable document, not locked-in layouts.

The core idea: introduce a **structured document model** (a tree of positioned, typed blocks) that sits between templates and the canvas renderer. Templates export document definitions. The canvas engine renders and makes them interactive. The AI reads and writes to this document model.

## Why This Approach

**Considered alternatives:**
- **Overlay canvas on existing templates (Approach B):** Preserves current templates but relies on fragile DOM-rect tracking for interactivity. Free-form positioning via CSS transforms breaks responsive layouts. Rejected because it doesn't deliver true canvas freedom and creates maintenance burden.
- **Block-based editor like Notion (Approach C):** Simpler to build, proven UX, but limited to vertical stacking. Loses the art-directed feel of current templates and doesn't deliver the Canva-like free-form positioning the user wants.

**Why Approach A wins:**
1. Clean separation: templates define initial document state, canvas engine owns rendering + interaction
2. The document model is the perfect API surface for AI manipulation (move, resize, rewrite, restyle)
3. Undo/redo can operate on document diffs instead of full content snapshots
4. New templates become JSON document definitions, not 950+ line React components
5. True free-form positioning with snap-to-grid guardrails for non-technical users

## Key Decisions

- **Editing model: Click-to-edit on canvas.** The preview IS the editor. No separate context panel for field editing. Click any text to edit it in-place, click images to replace them, select any element for AI suggestions.

- **Positioning: Free-form with guardrails.** Elements can be dragged anywhere within the canvas. Snap-to-grid, alignment guides, and smart spacing keep layouts clean for non-technical users.

- **Templates as starting points.** Templates define the initial document (block tree with positions, styles, content). Once loaded, the user can fully customize everything. Templates are not React components anymore — they're document definitions.

- **AI interaction: Contextual popover.** Select an element, get AI suggestions specific to that element (rewrite text, suggest alternative images, adjust styling, move/resize recommendations). No persistent chat sidebar.

- **Target users: Non-technical couples.** Strong guardrails everywhere — snap-to-grid, undo/redo, smart defaults, template presets. The freedom of a canvas with the safety net of good defaults.

- **Scope: Full rebuild, implemented incrementally.** Plan the complete architecture now, ship in phases over weeks/months.

- **Rendering: DOM-based.** Blocks are divs with absolute positioning. Native text editing, accessibility, and CSS styling all work naturally.

- **Layout: Mobile-first single canvas.** The canvas width matches mobile viewport (~390px). Desktop simply centers it. This eliminates responsive complexity and matches how 90%+ of guests view invitations.

- **Animations: Block-level property.** Each block can have an `animation` from a predefined set (fadeInUp, parallax, slideFromLeft, etc.). IntersectionObserver triggers animations on scroll. Simple and predictable.

## Architecture Overview

### Document Model

```
Document {
  id: string
  templateId: string
  canvas: { width: number, height: number }
  blocks: Block[]
  metadata: { ... }
}

Block {
  id: string
  type: "text" | "image" | "heading" | "divider" | "map" | "gallery" | "timeline" | "form" | "countdown" | "group"
  position: { x: number, y: number }
  size: { width: number, height: number }
  content: Record<string, unknown>  // type-specific content
  style: Record<string, string>     // CSS-like style properties
  animation?: "fadeInUp" | "fadeIn" | "slideFromLeft" | "slideFromRight" | "scaleIn" | "parallax" | "none"
  constraints?: {                   // guardrails
    minWidth?: number
    maxWidth?: number
    snapToGrid?: boolean
    locked?: boolean
  }
  children?: Block[]                // for group blocks (sections)
  sectionId?: string                // links to template section concept
}
```

### Key Components

1. **CanvasEngine** — Renders blocks on a scrollable canvas, handles selection, drag, resize, keyboard navigation
2. **BlockRenderer** — Renders individual block types (text, image, gallery, etc.)
3. **SelectionOverlay** — Handles selection rectangles, drag handles, resize handles, alignment guides
4. **InlineEditor** — In-place text editing when a text block is selected
5. **AiContextPopover** — Contextual AI suggestions for the selected block
6. **DocumentStore** — Manages document state, undo/redo (command pattern), persistence
7. **TemplateConverter** — Converts template definitions to initial Document instances

### AI Integration

The AI operates on the document model via a defined action set:
- `updateContent(blockId, content)` — Change text, image URL, etc.
- `moveBlock(blockId, position)` — Reposition an element
- `resizeBlock(blockId, size)` — Resize an element
- `addBlock(type, position, content)` — Add new elements
- `removeBlock(blockId)` — Remove elements
- `restyleBlock(blockId, style)` — Change colors, fonts, spacing
- `reorderBlocks(blockIds)` — Change z-order or visual order
- `generateContent(blockId, prompt)` — AI writes/rewrites content

The contextual popover shows relevant actions based on block type:
- Text block: Rewrite, translate, change tone, shorten/expand
- Image block: Suggest alternatives, adjust size, add caption
- Group/section: Rearrange children, change layout, suggest redesign
- Any block: Move, resize, duplicate, delete, restyle

## Resolved Questions

1. **Canvas rendering technology: DOM-based.** Divs with absolute positioning + CSS transforms. Simplest to build, native text editing/selection works, accessible. Wedding invitations have a limited number of elements (~30-50 blocks), so DOM performance is not a concern.

2. **Responsive output: Mobile-first single layout.** Design on a single mobile-width canvas since 90%+ of wedding guests view invitations on phones. Desktop viewing simply centers the mobile layout. This dramatically simplifies the editor — no dual-layout concerns, the canvas IS the mobile view.

3. **Template migration: Recreate as document definitions.** Rebuild each template's layout as a document model definition. Reimplement key visual effects (scroll reveals, parallax) as block-level animation properties. Accept some visual differences from the original React-rendered templates.

4. **Scroll animations: Block-level animation property.** Each block has an optional `animation` property from a predefined set (e.g., `fadeInUp`, `parallax`, `slideFromLeft`, `scaleIn`). Simple, predictable, and non-technical users don't need to configure animation timelines.

## Open Questions

None — all questions resolved during brainstorming.

## Next Steps

-> `/workflows:plan` for implementation details and phased delivery schedule.
