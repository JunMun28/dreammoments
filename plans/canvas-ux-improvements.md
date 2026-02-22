# Canvas Editor UX Improvements — Implementation Plan

## Enhancement Summary

**Deepened on:** 2026-02-17  
**Sections enhanced:** 9  
**Research sources used:** W3C APG, WCAG 2.2 Understanding docs, React docs, MDN platform docs, TanStack Router docs, project learning in `docs/solutions/ui-bugs/interaction-publish-regressions-canvas-editor-20260217.md`

### Key Improvements

1. Added explicit accessibility semantics for toolbar dropdown/disclosure flows (`aria-expanded`, `aria-controls`, keyboard handling).
2. Strengthened save/upload/onboarding UX with screen-reader announcements, reduced-motion support, and safer storage handling.
3. Incorporated pointer-event and publish-flow invariants from prior regression learnings to avoid known breakage patterns.

### New Considerations Discovered

- Avoid relying on `title` tooltips as primary UX; they are inconsistent for touch/keyboard users.
- Keep pointer lifecycle on a single interaction target and preserve pointer-capture behavior for drag/resize reliability.
- Add explicit keyboard and screen-reader checks to verification, not only visual/manual checks.

### Section Manifest

1. Friendly Labels: clearer microcopy, target-size/accessibility guardrails.
2. Auto-Save Indicator: status semantics, live announcement, reduced motion.
3. Visual Editing Cues: hover/focus behavior across mouse/touch/keyboard.
4. Progressive Toolbar: menu button + disclosure patterns and focus behavior.
5. Block Toolbar: overflow menu semantics and accidental-action prevention.
6. Color Presets: contrast visibility and accessible swatch interactions.
7. Font Dropdown: semantic grouping, fallback behavior, font loading expectations.
8. Image Upload: secure file validation, drag-drop handling, preview memory safety.
9. Canvas Onboarding: modal focus lifecycle, resilient localStorage, route-leave guard.

## Overview

9 improvements across 3 phases to make the canvas editor approachable for non-technical Malaysian/Singaporean couples creating wedding invitations.

---

## Phase 1: Quick Wins (no new files)

### 1. Friendly Labels — `CanvasToolbar.tsx`

**Current → New:**
- `"Anim On"` / `"Anim Off"` → `"Show Animations"` / `"Hide Animations"`
- Remove Grid spacing `<input type="number">` from toolbar (power-user feature, keep only in ListView)
- Keep "Canvas View"/"List View" as-is

**Changes:**
- Line 101-103: Change button text
- Lines 140-153: Remove the Grid spacing `<label>` block from the design tokens row
- Remove `onSpacingChange` from toolbar props (still passed from CanvasEditor but no longer used in toolbar)

### Research Insights

**Best practices:**
- Prefer plain-language labels over abbreviations in primary actions.
- Keep button hit areas at least WCAG 2.2 `24x24` CSS px minimum.
- Keep visual label and `aria-label` aligned so screen reader and visual users hear/see same intent.

**Performance considerations:**
- No runtime cost impact expected; this is mostly copy and structure cleanup.

**Implementation details:**
```tsx
<Button
	label="Toggle animation preview"
	onClick={onToggleAnimations}
>
	{animationsEnabled ? "Hide Animations" : "Show Animations"}
</Button>
```

**Edge cases:**
- Text expansion in localization can overflow small buttons; keep `min-h-11` and avoid fixed width.
- On narrow screens, keep labels short enough to avoid wrapping in sticky toolbar rows.

**References:**
- https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
- https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label

### 2. Auto-Save Indicator — `CanvasToolbar.tsx` + `CanvasEditor.tsx`

**Current:** Save button shows raw text "UNSAVED"/"SAVING"/"SAVED"
**New:** Colored dot + icon button, CSS tooltip on hover showing `savedAt`

**CanvasToolbar.tsx changes:**
- Add `savedAt: string` prop
- Replace save button contents with: `<Save icon>` + colored dot
  - green dot = saved
  - yellow dot + pulse animation = saving
  - gray dot = unsaved
  - red dot = error
- Add `title` attribute or CSS tooltip showing `"Last saved: {savedAt}"` on hover
- Keep button clickable for manual save

**CanvasEditor.tsx changes:**
- Pass `savedAt={save.savedAt}` to `<CanvasToolbar>` (line 546)

### Research Insights

**Best practices:**
- Keep color dot as visual aid, but expose text status via `role="status"` + `aria-live="polite"`.
- Do not rely on `title` attribute as the only way to expose "Last saved"; it is inconsistent for touch/keyboard.
- Respect `prefers-reduced-motion` for pulsing "saving" state.

**Performance considerations:**
- Status updates are lightweight; avoid timestamp reformatting on every render with memoized formatter.

**Implementation details:**
```tsx
const statusText =
	saveStatus === "saved"
		? `Saved${savedAt ? ` at ${savedAt}` : ""}`
		: saveStatus === "saving"
			? "Saving"
			: saveStatus === "error"
				? "Save failed"
				: "Unsaved changes";

<button type="button" aria-label={statusText} onClick={onSave}>
	<Save aria-hidden="true" className="h-3.5 w-3.5" />
	<span aria-hidden="true" className={dotClassByStatus[saveStatus]} />
	<span className="sr-only" role="status" aria-live="polite">
		{statusText}
	</span>
</button>
```

**Edge cases:**
- `savedAt` can be empty immediately after first load or after error; render graceful fallback text.
- If save status flips quickly (`saving` -> `saved`), ensure announcement does not spam by debouncing or only announcing state transitions.

**References:**
- https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions
- https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/title
- https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion

### 3. Visual Editing Cues — `CanvasEditor.tsx`

**Current:** No hover feedback on blocks
**New:** Dashed outline on hover, cursor hints, "Double-click to edit" tooltip

**CanvasBlockNode changes:**
- Add `onPointerEnter` / `onPointerLeave` props to wire `setHoveredBlock` from store
- Add `hovered: boolean` prop
- When hovered AND not selected:
  - Add `outline: 1px dashed var(--dm-border); outline-offset: 2px`
  - Add `title="Double-click to edit"` on text/heading blocks
  - Change cursor to `text` for text/heading, `move` for others

**CanvasEditor changes:**
- Subscribe to `hoveredBlockId` from store (already at line 377 area — but not currently subscribed)
- Pass `hovered` and `onHover`/`onHoverEnd` to each `<CanvasBlockNode>`

### Research Insights

**Best practices:**
- Provide both hover and focus-visible cues; touch users do not get hover.
- Keep drag/resize pointer lifecycle stable (`down/move/up/cancel`) to avoid interaction regressions.
- Avoid `title` as sole cue for "Double-click to edit"; provide visible helper text for selected text blocks when practical.

**Performance considerations:**
- Hover tracking per block is cheap, but avoid setting state if hovered id does not change.

**Implementation details:**
```tsx
const hoveredBlockId = store((state) => state.hoveredBlockId);

<CanvasBlockNode
	hovered={hoveredBlockId === block.id}
	onHover={() => store.getState().setHoveredBlock(block.id)}
	onHoverEnd={() => store.getState().setHoveredBlock(null)}
/>
```

**Edge cases:**
- On touch, pointer enter/leave may never fire; keep edit affordance via selection toolbar and double-tap fallback.
- Preserve existing selected outline precedence so hover outline does not fight selection/resize handles.

**References:**
- https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture
- https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/title

---

## Phase 2: Toolbar Restructuring (modifies existing files)

### 4. Progressive Disclosure Toolbar — `CanvasToolbar.tsx`

**Current:** All 11 buttons + 5 design controls visible at once
**New:** Two-tier layout with collapsible design panel

**Primary row (always visible):**
- Title, Undo, Redo, Add dropdown, [save dot], List/Canvas toggle, Preview, Publish

**"Add" dropdown:**
- Single "Add" button that opens a small dropdown: Text, Image, Decorative
- Use `useState` for open/close, close on outside click via `onPointerDown` check
- On mobile (`sm:hidden`): Add buttons stay in existing bottom bar in `CanvasEditor.tsx:745-769`, removed from top toolbar

**"Design" toggle:**
- Button that expands/collapses design controls panel below primary row
- Design panel (collapsed by default): BG color, Text color, Heading font, Body font, Animation toggle
- Use `useState<boolean>` for panel visibility

**Data attributes for onboarding:**
- Add `data-onboarding="canvas-toolbar"` to toolbar wrapper
- Add `data-onboarding="canvas-publish"` to Publish button

**New props:**
- `templateId: string` — for color presets (Phase 3 integration)

### Research Insights

**Best practices:**
- Implement "Add" as ARIA menu button pattern (`aria-haspopup="menu"`, `aria-expanded`, keyboard support).
- Implement "Design" expansion with disclosure pattern (`aria-controls` + `aria-expanded`).
- Outside-click close should be paired with Escape handling and focus return to trigger button.

**Performance considerations:**
- Use one global pointerdown listener only while menu/panel is open; remove in cleanup.
- Keep dropdown content mounted only when open to reduce layout/paint overhead.

**Implementation details:**
```tsx
<button
	type="button"
	aria-haspopup="menu"
	aria-expanded={isAddOpen}
	aria-controls="canvas-add-menu"
	onClick={() => setIsAddOpen((v) => !v)}
>
	Add
</button>
{isAddOpen ? (
	<ul id="canvas-add-menu" role="menu">
		<li role="none"><button role="menuitem">Text</button></li>
		<li role="none"><button role="menuitem">Image</button></li>
		<li role="none"><button role="menuitem">Decorative</button></li>
	</ul>
) : null}
```

**Edge cases:**
- Ensure Add menu closes on selection, outside click, Escape, and route/navigation changes.
- Ensure mobile keeps bottom add bar to avoid duplicated actions in constrained width.

**References:**
- https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/
- https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
- https://react.dev/reference/react/useEffect

### 5. Simplified Block Toolbar — `BlockToolbar.tsx`

**Current:** 8 action buttons visible simultaneously (AI, Duplicate, Forward, Backward, Front, Back, Lock, Delete)
**New:** 3 primary + overflow menu

**Primary buttons (always visible):**
- AI, Duplicate, Delete

**Overflow "..." button:**
- Opens dropdown with: Bring Forward, Send Backward, Bring to Front, Send to Back, Lock/Unlock
- `useState<boolean>` for menu visibility
- Close on outside click via `onPointerDown` check on document

**Size reduction:**
- Remove fixed `w-[19.5rem]`, use `w-auto` or smaller width

### Research Insights

**Best practices:**
- Keep dangerous action (`Delete`) visually distinct and away from overflow trigger.
- Put transform/z-order actions in overflow menu with keyboard support.
- Retain `onPointerDown={(e) => e.stopPropagation()}` so menu interaction does not deselect block.

**Performance considerations:**
- Fewer always-visible buttons reduces layout pressure in narrow toolbars.
- Keep menu state local to each selected block instance; do not store globally.

**Implementation details:**
```tsx
const [overflowOpen, setOverflowOpen] = useState(false);

<ToolbarButton label="More actions" onClick={() => setOverflowOpen((v) => !v)}>
	...
</ToolbarButton>
{overflowOpen ? (
	<ul role="menu" aria-label="Block actions">
		<li role="none"><button role="menuitem" onClick={onBringForward}>Bring forward</button></li>
		<li role="none"><button role="menuitem" onClick={onSendBackward}>Send backward</button></li>
		<li role="none"><button role="menuitem" onClick={onBringToFront}>Bring to front</button></li>
		<li role="none"><button role="menuitem" onClick={onSendToBack}>Send to back</button></li>
		<li role="none"><button role="menuitem" onClick={onLockToggle}>{block.locked ? "Unlock" : "Lock"}</button></li>
	</ul>
) : null}
```

**Edge cases:**
- Keep overflow menu anchored within viewport near edges (flip alignment if needed).
- Ensure focus returns to overflow trigger after menu closes.

**References:**
- https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/
- https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html

---

## Phase 3: New Sub-Components (4 new files)

### 6. Color Presets — NEW `src/components/canvas/ColorPresetPicker.tsx`

**Props:**
```ts
{
  templateId: string;
  currentColor: string;
  onColorChange: (color: string) => void;
  label: string;
}
```

**Behavior:**
- Look up template from `templates` array via `templateId`
- Show 6 round swatches from template's `tokens.colors`: primary, secondary, accent, background, text, muted
- Selected swatch gets a ring indicator (`ring-2 ring-offset-1`)
- Last swatch = native `<input type="color">` for custom colors
- Fallback: if templateId not found, show only the color input

**Integration:**
- Replace BG and Text `<input type="color">` in `CanvasToolbar.tsx` design panel

### Research Insights

**Best practices:**
- Render each swatch as a `<button>` with accessible name (`aria-label="Set background to ..."`).
- Keep selected indicator visible on light and dark swatches (ring + offset + contrasting outline).
- For text/background token pairs, surface warning if contrast drops below WCAG minimum (4.5:1 for normal text).

**Performance considerations:**
- Static swatch arrays are cheap; memoize template lookup by `templateId`.

**Implementation details:**
```tsx
<button
	type="button"
	aria-label={`${label}: ${tokenName}`}
	aria-pressed={isSelected}
	className={cn(
		"h-7 w-7 rounded-full border",
		isSelected && "ring-2 ring-offset-1 ring-[color:var(--dm-ink)]",
	)}
	style={{ backgroundColor: value }}
	onClick={() => onColorChange(value)}
/>
```

**Edge cases:**
- Template may miss one of six expected colors; skip missing tokens instead of crashing.
- For very light colors, ring offset must remain visible against white toolbar backgrounds.

**References:**
- https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/color

### 7. Font Dropdown — NEW `src/components/canvas/FontSelect.tsx`

**Props:**
```ts
{
  value: string;
  onChange: (fontFamily: string) => void;
  label: string;
}
```

**Font registry:**
```ts
const FONT_REGISTRY = [
  { group: "Serif", fonts: [
    { label: "Elegant Serif", value: "Playfair Display" },
    { label: "Classic Garamond", value: "Cormorant Garamond" },
    { label: "Chinese Serif", value: "Noto Serif SC" },
  ]},
  { group: "Sans-Serif", fonts: [
    { label: "Outfit", value: "Outfit" },
    { label: "Modern Sans", value: "Inter" },
    { label: "Lato", value: "Lato" },
    { label: "Manrope", value: "Manrope" },
  ]},
  { group: "Script", fonts: [
    { label: "Sacramento", value: "Sacramento" },
    { label: "Pinyon Script", value: "Pinyon Script" },
    { label: "Playful Handwriting", value: "Reenie Beanie" },
  ]},
];
```

**Behavior:**
- `<select>` with `<optgroup>` for each category
- Styled to match existing design system
- Each option shows friendly name, value is the actual font family

**Integration:**
- Replace Heading/Body font text inputs in `CanvasToolbar.tsx` design panel

### Research Insights

**Best practices:**
- Keep native `<select>` + `<optgroup>` semantics for reliable keyboard/mobile UX.
- Use friendly labels in options, map to canonical font-family values internally.
- Always apply fallback stacks (serif/sans-serif/cursive) in case font not loaded.

**Performance considerations:**
- If web fonts are loaded externally, prefer `font-display: swap` to reduce invisible text delay.

**Implementation details:**
```tsx
<label className="inline-flex items-center gap-1">
	{label}
	<select
		value={value}
		onChange={(event) => onChange(event.target.value)}
		aria-label={label}
	>
		{FONT_REGISTRY.map((group) => (
			<optgroup key={group.group} label={group.group}>
				{group.fonts.map((font) => (
					<option key={font.value} value={font.value}>
						{font.label}
					</option>
				))}
			</optgroup>
		))}
	</select>
</label>
```

**Edge cases:**
- If selected value no longer exists in registry, preserve raw value and show fallback option.
- CJK text may require additional fallback families for full glyph coverage.

**References:**
- https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/select
- https://web.dev/articles/font-best-practices

### 8. Image Upload — NEW `src/components/canvas/CanvasImageUpload.tsx`

**Props:**
```ts
{
  currentSrc: string;
  onImageChange: (src: string) => void;
}
```

**Behavior:**
- If `currentSrc` exists: show thumbnail preview (small `<img>`)
- "Choose Photo" button triggers hidden `<input type="file" accept="image/*">`
- Drag-and-drop zone (small, within toolbar)
- On file select/drop: call `uploadImage(file)` from `@/lib/storage`
- Show `<LoadingSpinner size="sm">` during upload
- Collapsed "Or paste URL" `<button>` toggles URL text input as fallback
- Error state: red text below

**Integration:**
- Replace Image URL `<input type="url">` in `BlockToolbar.tsx` for image blocks

### Research Insights

**Best practices:**
- Use `<input type="file" accept="image/*">` for picker hint, but still validate MIME/size before upload.
- Prevent default `dragover` + `drop` behavior to avoid browser navigating to dropped file.
- Revoke object URLs used for previews to avoid memory leaks.

**Performance considerations:**
- Compress/resize very large images before upload when feasible to reduce bandwidth and latency.
- Keep preview thumbnails constrained and lazy-rendered.

**Implementation details:**
```tsx
const [previewUrl, setPreviewUrl] = useState<string | null>(null);

const onDrop = (event: React.DragEvent) => {
	event.preventDefault();
	const file = event.dataTransfer.files?.[0];
	if (!file) return;
	void upload(file);
};

useEffect(() => {
	return () => {
		if (previewUrl) URL.revokeObjectURL(previewUrl);
	};
}, [previewUrl]);
```

**Edge cases:**
- `accept` does not prevent renamed non-image files; validate type server-side too.
- Handle upload cancellation/failure with clear retry UI and preserve previous `currentSrc`.

**References:**
- https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file
- https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop
- https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL_static

### 9. Canvas Onboarding — NEW `src/components/canvas/CanvasOnboarding.tsx`

**Pattern:** Follow exact structure of `src/components/editor/OnboardingTour.tsx`

**Separate localStorage key:** `"dm-canvas-onboarding-complete"`

**4 steps:**
1. Welcome overlay (no target) — "Design your invitation by arranging blocks"
2. Target `canvas-area` — "Tap any text to edit it, drag blocks to reposition"
3. Target `canvas-toolbar` — "Add text, images, or decorations"
4. Target `canvas-publish` — "Preview and publish when ready"

All steps: `mobileVisible: true`

**Integration in CanvasEditor.tsx:**
- Add `data-onboarding="canvas-area"` to canvas `<div>` (line 589)
- Render `<CanvasOnboarding />` after the main content, before closing `</div>`

### Research Insights

**Best practices:**
- Keep onboarding overlay as modal dialog semantics (`role="dialog"`, `aria-modal="true"`) with focus management.
- Support keyboard controls (`Enter`, arrow next, `Escape` close), matching existing onboarding pattern.
- Wrap `localStorage` get/set in `try/catch`; storage may throw in restricted contexts.

**Performance considerations:**
- Only mount onboarding when needed; keep measurement listeners active only while visible.

**Implementation details:**
```tsx
function readOnboardingComplete(key: string): boolean {
	try {
		return localStorage.getItem(key) === "true";
	} catch {
		return false;
	}
}

function writeOnboardingComplete(key: string) {
	try {
		localStorage.setItem(key, "true");
	} catch {
		// no-op; continue without persistence
	}
}
```

**Edge cases:**
- If target element is missing (`canvas-publish` not rendered yet), continue step without crash.
- Optional hardening: block navigation with unsaved changes until save/publish resolves.

**References:**
- https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
- https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- https://tanstack.com/router/latest/docs/framework/react/guide/navigation-blocking

---

## Files Summary

| Action | File | Phase |
|--------|------|-------|
| Modify | `src/components/canvas/CanvasToolbar.tsx` | 1, 2 |
| Modify | `src/components/canvas/CanvasEditor.tsx` | 1, 2 |
| Modify | `src/components/canvas/BlockToolbar.tsx` | 2 |
| Create | `src/components/canvas/ColorPresetPicker.tsx` | 3 |
| Create | `src/components/canvas/FontSelect.tsx` | 3 |
| Create | `src/components/canvas/CanvasImageUpload.tsx` | 3 |
| Create | `src/components/canvas/CanvasOnboarding.tsx` | 3 |

## Institutional Learnings Applied

From `docs/solutions/ui-bugs/interaction-publish-regressions-canvas-editor-20260217.md`:

- Preserve pointer invariants: keep interaction lifecycle on consistent target and avoid mixed delta/origin math.
- Keep canonical server mutation path first for critical publish/save flows.
- Keep editor store identity stable per `invitationId`; avoid autosave-driven reinitialization side effects.

## Verification

1. `npx tsc --noEmit` — no TypeScript errors
2. `pnpm test` — unit tests pass
3. Manual test at 4 viewports (1280x800, 768x1024, 390x844, 320x568)
4. Test onboarding: clear `dm-canvas-onboarding-complete`, reload, step through
5. Test image upload: select image block, use file picker, verify preview
6. Test color presets: open Design panel, click swatches, verify canvas updates
7. Test font dropdown: change heading/body fonts, verify blocks update
8. Keyboard test: toolbar "Add" and overflow menus support Enter/Space/Escape and focus return
9. A11y test: save status is announced by screen reader (`role="status"`), not color-only
10. Reduced motion test: saving pulse animation disabled/softened under `prefers-reduced-motion`
11. Drag-drop test: dropping file outside drop zone does not navigate away
12. Regression test: publish flow still uses canonical server mutation path and updates local store from response
