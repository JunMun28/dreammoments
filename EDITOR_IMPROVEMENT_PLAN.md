# DreamMoments Editor Improvement Plan

> Synthesized from all team inputs: Researcher, UX Designer, UI Designer, Product Manager, Developer, Critic, and Tester. Conflicts resolved by the Reviewer with rationale.

---

## 1. Executive Summary

The DreamMoments editor is a 31-file, 665-line route component managing a wedding invitation editing experience across 4 layout modes (desktop grid, tablet 2-column, mobile portrait stack, mobile landscape 60/40 split). It serves Chinese couples in Malaysia/Singapore who are predominantly mobile users. The editor currently works but suffers from accessibility gaps (WCAG failures in dialogs, touch targets, and focus management), mobile usability friction (bottom sheet conflicts with keyboard and accidental dismissal), visual inconsistency (6 color signals for completion, uppercase tracking everywhere, mixed border radii), and a route file that coordinates ~30 pieces of state across 10 hooks.

This plan takes an **incremental 4-phase approach** that delivers accessibility fixes and quick wins first (2-3 days), then restructures layout and navigation (3-5 days), then extracts shared state architecture (3-5 days), and finally applies visual polish and advanced features (1-2 weeks). Each phase is independently shippable and does not block subsequent phases.

**Key conflict resolutions**: (1) Mobile bottom sheet is **kept but restructured** with a persistent edit tab rather than fully replaced -- this balances the UX Designer's valid criticism of sustained editing friction with the PM's concern about effort. (2) The god component **is decomposed** using EditorContext + useReducer, because the Developer's incremental approach (one state slice at a time over 2-3 days) makes the PM's "money pit" risk manageable. (3) Unused components SectionRail and ProgressIndicator are **deleted** -- they add clutter that contradicts the simplification goal, and the completion information is better served by inline indicators in the section pill bar.

---

## 2. Design Principles

1. **Monochrome-first**: Use `--dm-ink`, `--dm-muted`, and `--dm-border` for 90% of UI. Reserve `--dm-peach` exclusively for focus rings and the active inline-edit highlight. No green/yellow/amber status dots -- use icons and text labels instead.

2. **Sentence case everywhere**: Drop `uppercase tracking-[0.15em]` from all editor UI (section labels, header text, button labels). Keep only for template-rendered content where the design calls for it.

3. **Ghost buttons by default**: All editor buttons use transparent background + border. Only the Publish button uses a solid `bg-[color:var(--dm-accent-strong)]` fill.

4. **Minimum viable indication**: Every status indicator must pass WCAG 1.4.1 (not color alone). Save status uses text label + icon. Section completion uses checkmark icon for complete, progress fraction for partial, empty for untouched.

5. **Touch-first sizing**: All interactive elements are min 44x44px. On mobile, prefer larger (48px) targets. No element smaller than 24x24px even for decorative indicators.

6. **Progressive disclosure**: Show the minimum UI needed for the current task. AI assistance appears contextually per-section rather than as a global drawer. Keyboard shortcuts are discoverable via `?` but never mandatory.

---

## 3. Phase 1: Foundation & Quick Wins (2-3 days)

### 3.1 Fix all dialog accessibility

**What**: Add proper focus traps, Escape handlers, and focus restore to all 6 overlay/dialog surfaces.

**Why**: Currently, preview mode, upgrade dialog, slug dialog, keyboard shortcuts dialog, AI drawer, and inline edit overlay have inconsistent accessibility. Some have `role="dialog"` without focus traps; some trap focus but don't restore it on close.

**How**: The `useFocusTrap` hook at `src/components/editor/hooks/useFocusTrap.ts` already exists and is used for 4 dialogs via refs in `$invitationId.tsx:212-227`. Verify it covers all 6 surfaces:
- Preview mode (`previewDialogRef`, line 491) -- already wired
- Slug dialog (`slugDialogRef`, line 616) -- already wired
- Upgrade dialog (`upgradeDialogRef`, line 529) -- already wired
- Shortcuts dialog (`shortcutsDialogRef`, line 573) -- already wired
- AI drawer -- uses its own internal focus trap via `useFocusTrap` (line 7 of `AiAssistantDrawer.tsx`)
- MobileBottomSheet -- has manual focus management (lines 90-127)

**Remaining fix**: Ensure MobileBottomSheet stores `document.activeElement` on open and restores on close. Currently `previousFocusRef` exists (line 50) but verify it is populated before the sheet content renders.

**Effort**: S (2-4 hours)

**Acceptance Criteria**:
- Tab key never escapes any open dialog/overlay
- Escape closes any open dialog/overlay
- Focus returns to the trigger element after close
- All dialog containers have `role="dialog"` and `aria-modal="true"`

### 3.2 Fix touch targets below 44px

**What**: Audit and fix all interactive elements below the 44x44px WCAG minimum.

**Why**: Multiple elements fail the minimum touch target size, causing frustration on mobile.

**How** (specific file changes):

| File | Element | Current | Fix |
|------|---------|---------|-----|
| `ContextPanelHeader.tsx:37` | AI Sparkles button | `h-11 w-11` (44px) | Already correct -- no change needed |
| `ContextPanel.tsx:80` | Collapse button | `min-h-[44px] min-w-[44px]` | Already correct -- no change needed |
| `ContextPanel.tsx:59` | Expand button (collapsed) | `min-h-[44px] min-w-[44px]` | Already correct -- no change needed |
| `MobileSectionNav.tsx:98` | Prev/Next buttons | `h-11 w-11` (44px) | Already correct |
| `SaveStatusBadge.tsx:13` | Badge container | `px-2.5 py-1` | Not interactive -- no fix needed |
| `FieldRenderer.tsx:88-100` | Text input fields | `min-h-11` (44px) | Already correct |

**Remaining fix**: Verify `dm-completion-ring` (8x8px in `styles.css:1685-1689`) is never the sole tap target. It is `aria-hidden="true"` and lives inside a button, so it is decorative only -- acceptable.

**Effort**: XS (1 hour for audit, most targets already correct after previous fixes)

**Acceptance Criteria**: No interactive element smaller than 44x44px on any viewport.

### 3.3 Save status: add text label (WCAG 1.4.1 fix)

**What**: The `SaveStatusBadge` component already includes text labels ("Saved at...", "Saving...", "Unsaved changes") alongside colored dots. This passes WCAG 1.4.1.

**Why**: The Critic flagged that a dot-only save indicator would fail WCAG. The current implementation at `src/components/editor/SaveStatusBadge.tsx` already includes text, so this is already compliant.

**How**: No code change needed for the badge itself. However, on mobile the toolbar hides the save status in the overflow menu. Fix: show `SaveStatusBadge` inline in the mobile toolbar instead of hiding it behind overflow.

**File**: `src/components/editor/EditorToolbar.tsx`
- In the mobile toolbar section, render `<SaveStatusBadge status={saveStatus} autosaveAt={autosaveAt} />` inline after the title, before the overflow trigger.

**Effort**: XS (30 minutes)

**Acceptance Criteria**: Save status text is always visible without opening a menu, on all viewports.

### 3.4 Textarea focus ring parity

**What**: Add `focus-visible` ring to `<textarea>` in `FieldRenderer.tsx`.

**Why**: The `<input>` element has `focus-visible:ring-2 focus-visible:ring-[color:var(--dm-focus)]/60` but `<textarea>` at line 95 does not.

**How**: In `src/components/editor/FieldRenderer.tsx`, add to the textarea className:
```
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--dm-focus)]/60
```

**Effort**: XS (10 minutes)

**Acceptance Criteria**: Tab-focusing a textarea shows the same peach focus ring as input fields.

### 3.5 AI task pills: add aria-pressed

**What**: Add `aria-pressed` to the AI task type selector pills.

**Why**: Screen readers cannot identify the currently selected AI task type.

**How**: In `src/components/editor/AiAssistantDrawer.tsx`, on each task pill button (around line 85), add:
```tsx
aria-pressed={type === option.value}
```

**Effort**: XS (10 minutes)

**Acceptance Criteria**: Screen reader announces "Schedule, pressed" for the active task type.

### 3.6 CJK font fallback

**What**: Add Noto Serif SC as a fallback font for CJK characters.

**Why**: The primary font Outfit has no CJK glyphs. Target users (Chinese couples in MY/SG) will see system fallback fonts for Chinese text, creating visual inconsistency.

**How**: In `src/styles.css`:
- The Google Fonts import on line 1 already includes `Noto+Serif+SC`
- Update CSS custom properties at line 87-88:
```css
--font-heading: "Outfit", "Noto Serif SC", sans-serif;
--font-body: "Outfit", "Noto Serif SC", sans-serif;
```

**Effort**: XS (15 minutes)

**Acceptance Criteria**: Chinese characters render in Noto Serif SC rather than system fallback.

### 3.7 ToggleSwitch: remove card-in-card border

**What**: The `ToggleSwitch` component wraps itself in a bordered card (`rounded-2xl border border-[color:var(--dm-border)]`), which creates a card-in-card appearance when rendered inside the `ContextPanel` (which is itself a bordered panel).

**Why**: Visual nesting of bordered containers creates clutter.

**How**: In `src/components/editor/ToggleSwitch.tsx:17`, change:
```
"flex items-center justify-between gap-4 rounded-2xl border border-[color:var(--dm-border)] bg-[color:var(--dm-surface)] px-4 py-3"
```
to:
```
"flex items-center justify-between gap-4 px-4 py-3"
```

Remove the border, border-radius, and background. The toggle lives within the context panel which provides the surface.

**Effort**: XS (10 minutes)

**Acceptance Criteria**: Toggle switch renders without its own card border when inside the context panel.

### 3.8 backdrop-blur: desktop-only with @supports

**What**: Limit `backdrop-filter: blur()` to desktop viewports to avoid jank on low-end Android devices.

**Why**: The Critic identified that backdrop-blur causes jank on low-end Android. Currently used on `.dm-preview-toolbar` (line 832) and `.blush-pill-row` (line 412).

**How**: In `src/styles.css`, wrap backdrop-filter uses in a media query:
```css
@media (min-width: 768px) {
  @supports (backdrop-filter: blur(16px)) {
    .dm-preview-toolbar {
      backdrop-filter: blur(16px);
    }
  }
}
```
Remove the inline `backdrop-filter` from mobile-visible elements.

**Effort**: XS (30 minutes)

**Acceptance Criteria**: No backdrop-blur renders on viewports below 768px.

---

## 4. Phase 2: Layout & Navigation (3-5 days)

### 4.1 Merge SectionPillBar + MobileSectionNav into unified SectionNav

**What**: Replace the two separate components (`SectionPillBar.tsx` at 75 lines, `MobileSectionNav.tsx` at 174 lines) with a single `SectionNav` component that adapts based on an `isMobile` prop.

**Why**: Both components render nearly identical scrollable pill strips with completion indicators. The mobile version adds prev/next arrow buttons. Maintaining two components means double the bug surface.

**How**:
- Create `src/components/editor/SectionNav.tsx` that:
  - Always renders a scrollable `role="tablist"` pill strip (from `SectionPillBar`)
  - Conditionally renders prev/next arrow buttons when `isMobile={true}` (from `MobileSectionNav`)
  - Uses full keyboard navigation (ArrowLeft/ArrowRight/Home/End from `MobileSectionNav`)
  - Uses `roving tabindex` pattern (from `MobileSectionNav`)
- Delete `SectionPillBar.tsx` and `MobileSectionNav.tsx`
- Update `$invitationId.tsx` to use `<SectionNav>` with `isMobile` prop

**Completion indicators**: Replace the colored `dm-completion-ring` dots (green/yellow/gray -- fails WCAG 1.4.1) with:
- Complete (100%): Checkmark icon (`Check` from lucide-react, 12x12px, `text-[color:var(--dm-ink)]`)
- Partial (1-99%): No icon (the pill label alone is sufficient)
- Empty (0%): No icon

This reduces color signals from 6 to 3 (ink, muted, border) and eliminates the reliance on color alone.

**Tailwind classes for pills**:
```tsx
// Active pill
"inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl bg-[color:var(--dm-ink)] px-4 text-sm text-[color:var(--dm-on-accent)]"

// Inactive pill
"inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl border border-[color:var(--dm-border)] px-4 text-sm text-[color:var(--dm-muted)] hover:bg-[color:var(--dm-surface-muted)]"
```

Note: `rounded-xl` (not `rounded-full`) per UI Designer guideline. `text-sm` sentence case (not `text-xs uppercase tracking-[0.15em]`).

**Effort**: S-M (4-6 hours)

**Acceptance Criteria**:
- Single component renders correctly on all viewports
- Prev/next arrows visible only on mobile
- Keyboard navigation (Arrow keys, Home, End) works
- Active pill auto-scrolls into view
- Completion uses checkmark icon, not colored dots

### 4.2 Mobile bottom sheet: add persistent edit tab

**What**: On mobile, instead of the bottom sheet opening as a transient overlay that fights with the preview, add a persistent "Edit" / "Preview" tab toggle at the bottom of the screen. When "Edit" is selected, the context panel replaces the preview in the main content area (full-screen form editing). When "Preview" is selected, the full preview is shown.

**Why**: The UX Designer correctly identified that the bottom sheet fights the user during sustained editing -- the keyboard covers it, accidental gestures dismiss it, and the user can never see both the form and preview comfortably on a <768px screen. The PM's concern about effort is valid, but this approach is simpler than fixing the bottom sheet's many interaction problems (keyboard avoidance, snap point confusion, accidental dismiss).

**Resolution**: Keep `MobileBottomSheet.tsx` for the AI assistant (which is a transient overlay by nature), but stop using it for the context panel on mobile. Instead:

**How**:
1. In `src/components/editor/EditorLayout.tsx`, modify the mobile portrait branch (line 54-77):
   - Add a `mobileTab` state: `"preview" | "edit"` (passed as prop from route)
   - When `mobileTab === "preview"`: show preview area + section nav at bottom
   - When `mobileTab === "edit"`: show context panel full-screen + section nav at bottom
   - Remove the `bottomSheetOpen && contextPanel` conditional

2. Add a 2-segment toggle at the bottom, above the section nav:
```tsx
<div className="flex border-t border-[color:var(--dm-border)] bg-[color:var(--dm-surface)]">
  <button
    className={cn(
      "flex-1 py-3 text-sm font-medium",
      mobileTab === "edit"
        ? "border-b-2 border-[color:var(--dm-ink)] text-[color:var(--dm-ink)]"
        : "text-[color:var(--dm-muted)]"
    )}
    onClick={() => setMobileTab("edit")}
  >
    Edit
  </button>
  <button
    className={cn(
      "flex-1 py-3 text-sm font-medium",
      mobileTab === "preview"
        ? "border-b-2 border-[color:var(--dm-ink)] text-[color:var(--dm-ink)]"
        : "text-[color:var(--dm-muted)]"
    )}
    onClick={() => setMobileTab("preview")}
  >
    Preview
  </button>
</div>
```

3. In `$invitationId.tsx`, replace `mobileEditorOpen`/`setMobileEditorOpen`/`mobileSnapIndex`/`setMobileSnapIndex` with a single `mobileTab` state.

4. When a user taps a section in preview mode, auto-switch to "edit" tab with that section active.

**Effort**: M (1-2 days)

**Acceptance Criteria**:
- Mobile users can switch between Edit and Preview with a single tap
- Edit mode shows full-screen form (no preview peeking through)
- Preview mode shows full-screen preview
- Section nav remains visible in both modes
- Tapping a section in preview auto-switches to edit tab
- No bottom sheet used for the context panel on mobile
- MobileBottomSheet still used for AI assistant

### 4.3 Simplify ContextPanelHeader

**What**: Remove completion percentage and move AI button contextually.

**Why**: The completion percentage (`{Math.round(completion)}%`) in the header is noisy and already represented by the section nav indicators. The AI sparkles button should appear inline with the section fields rather than in the header.

**How**: In `src/components/editor/ContextPanelHeader.tsx`:
1. Remove the `<span>` showing `{Math.round(completion)}%` (line 29-31)
2. Remove the `completion` prop
3. Keep the visibility toggle (Eye icon) and section label
4. Move AI button trigger to `ContextPanel.tsx`, rendered below the fields as a contextual action:
```tsx
<button
  type="button"
  onClick={() => onAiClick(sectionId)}
  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[color:var(--dm-border)] px-4 py-2.5 text-sm text-[color:var(--dm-muted)] hover:bg-[color:var(--dm-surface-muted)]"
>
  <Sparkles className="h-4 w-4" aria-hidden="true" />
  Generate with AI
</button>
```

**Header Tailwind update** (sentence case, no uppercase):
```tsx
<h2 className="text-sm font-semibold text-[color:var(--dm-ink)]">
  {sectionLabel}
</h2>
```

**Effort**: S (2-3 hours)

**Acceptance Criteria**:
- No percentage shown in the header
- AI button appears below fields, not in the header
- Section label uses sentence case
- Visibility toggle remains in header

### 4.4 Delete unused SectionRail and ProgressIndicator

**What**: Remove `src/components/editor/SectionRail.tsx` (173 lines) and `src/components/editor/ProgressIndicator.tsx` (134 lines).

**Why**: These components are imported nowhere and never rendered. The PM suggested wiring them up, but the UX Designer and Critic agree that adding a vertical icon rail contradicts the goal of reducing navigation paradigms from 4 to 2. The scrollable pill bar (Phase 2, item 4.1) already provides section navigation. Adding another nav element would increase cognitive load.

**How**:
- Delete `src/components/editor/SectionRail.tsx`
- Delete `src/components/editor/ProgressIndicator.tsx`
- Remove the `sectionRail` prop from `EditorLayout.tsx` (line 8, line 22, lines 100-101, lines 109-113)
- Remove related CSS in `src/styles.css` (`.dm-section-rail` block, lines 1607-1655)

**Effort**: XS (30 minutes)

**Acceptance Criteria**: No dead code for unused navigation components.

### 4.5 Remove scroll-sync between preview and editor

**What**: Stop using `usePreviewScroll` to auto-scroll the preview when the user changes sections.

**Why**: The UX Designer called this a "haunted house" effect -- the preview scrolling without user input is disorienting. Users should control preview scroll themselves.

**How**:
- In `$invitationId.tsx`, remove the `usePreviewScroll` import and usage (lines 144-147)
- Keep `scrollToSection` available but only call it on explicit user action (e.g., when clicking a section in the preview)
- The `handleSectionChange` function (line 316-319) should only call `editor.setActiveSection(sectionId)`, not `scrollToSection(sectionId)`

**Effort**: XS (30 minutes)

**Acceptance Criteria**: Changing sections in the editor panel does not auto-scroll the preview.

---

## 5. Phase 3: State & Architecture (3-5 days)

### 5.1 Extract EditorContext with useReducer

**What**: Move the ~30 state variables from the route file into a React Context + useReducer pattern. The route file becomes a thin orchestrator that sets up the context and renders the layout.

**Why**: Every field change in `handleFieldChange` triggers `updateDraft` which calls `setHistory`, `setFuture`, `setDraft`, and `setVersion` -- 4 state updates. This causes unnecessary re-renders of every `FieldRenderer`. An `EditorContext` with `useReducer` batches these into a single dispatch, and `React.memo` on `FieldRenderer` prevents re-renders for fields that didn't change.

**How** (incremental, one state slice at a time):

**Step 1: Define the reducer** (new file `src/components/editor/hooks/useEditorReducer.ts`):
```ts
type EditorState = {
  draft: InvitationContent;
  history: InvitationContent[];
  future: InvitationContent[];
  version: number;
  activeSection: string;
  sectionVisibility: Record<string, boolean>;
  errors: Record<string, string>;
};

type EditorAction =
  | { type: "UPDATE_DRAFT"; payload: InvitationContent }
  | { type: "FIELD_CHANGE"; payload: { path: string; value: string | boolean } }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "SET_SECTION"; payload: string }
  | { type: "SET_VISIBILITY"; payload: Record<string, boolean> }
  | { type: "SET_ERROR"; payload: { path: string; error: string } }
  | { type: "RESET"; payload: { content: InvitationContent; visibility: Record<string, boolean>; section: string } };
```

**Step 2: Create EditorContext** (new file `src/components/editor/EditorContext.tsx`):
```tsx
const EditorContext = createContext<{
  state: EditorState;
  dispatch: Dispatch<EditorAction>;
} | null>(null);

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used within EditorProvider");
  return ctx;
}
```

**Step 3: Migrate route file**:
- Replace `useEditorState()` call with `useReducer(editorReducer, initialState)`
- Wrap layout in `<EditorContext.Provider>`
- Child components (`ContextPanel`, `FieldRenderer`, etc.) consume context instead of receiving props

**Step 4: Memoize FieldRenderer**:
```tsx
export const FieldRenderer = React.memo(function FieldRenderer({...}: FieldRendererProps) {
  // existing implementation
});
```
This prevents re-render when sibling fields change, since each field only reads its own value from context.

**Effort**: M (2-3 days)

**Acceptance Criteria**:
- Route file reduced from ~665 lines to ~200 lines (orchestration only)
- Field changes only re-render the changed field's `FieldRenderer` (verify with React DevTools Profiler)
- All existing functionality preserved (undo/redo, auto-save, section switching)
- No prop drilling deeper than 2 levels

### 5.2 Extract dialog components

**What**: Extract the 4 inline dialog implementations from `$invitationId.tsx` into standalone components.

**Why**: The route file contains full JSX for preview mode (lines 489-525), upgrade dialog (lines 527-570), keyboard shortcuts help (lines 572-612), and slug dialog (lines 614-662). These are self-contained UI that bloats the route file.

**How**:
- Create `src/components/editor/PreviewOverlay.tsx` (preview mode dialog)
- Create `src/components/editor/UpgradeDialog.tsx` (upgrade prompt)
- Create `src/components/editor/ShortcutsDialog.tsx` (keyboard shortcuts help)
- Create `src/components/editor/SlugDialog.tsx` (custom URL slug input)
- Each receives only the props it needs (open state, onClose, relevant data)
- Each uses `useFocusTrap` internally

**Effort**: S (3-4 hours)

**Acceptance Criteria**: Route file has no inline dialog JSX; each dialog is a self-contained component.

### 5.3 Delete useFieldValidation (unused)

**What**: Remove `src/components/editor/hooks/useFieldValidation.ts`.

**Why**: The Researcher identified this as unused. Validation is handled inline in `$invitationId.tsx` via the `onFieldBlur` callback (lines 398-407) and the `validateField` function in `useEditorState.ts`.

**How**: Delete the file. Verify no imports reference it.

**Effort**: XS (5 minutes)

**Acceptance Criteria**: No dead code for unused validation hook.

---

## 6. Phase 4: Visual Polish & Advanced Features (1-2 weeks)

### 6.1 Monochrome progress bars for desktop section nav

**What**: Add a thin 2px progress bar below each section pill in the desktop nav, showing section completion.

**Why**: The colored dots were removed in Phase 2. Desktop users benefit from a subtle visual indicator of overall progress without needing to click each section.

**How**: Below each pill in `SectionNav`, render:
```tsx
<div className="mt-1 h-0.5 w-full rounded-full bg-[color:var(--dm-border)]">
  <div
    className="h-full rounded-full bg-[color:var(--dm-ink)] transition-all duration-300"
    style={{ width: `${completion}%` }}
  />
</div>
```

Only render on desktop (hide with `hidden md:block`).

**Effort**: XS (30 minutes)

**Acceptance Criteria**: Desktop section pills show a thin monochrome progress bar. Mobile pills show checkmark only.

### 6.2 Sentence case migration

**What**: Replace all `uppercase tracking-[0.15em]` or `tracking-[0.2em]` or `tracking-[0.3em]` instances in editor components with sentence case.

**Why**: The UI Designer specified sentence case for all editor UI text. Uppercase tracking is reserved for template content.

**Files to update** (editor components only, not template styles):
| File | Line(s) | Current | New |
|------|---------|---------|-----|
| `ContextPanelHeader.tsx:24` | `text-sm font-semibold uppercase tracking-[0.15em]` | `text-sm font-semibold` |
| `AiAssistantDrawer.tsx:59` | `text-xs uppercase tracking-[0.3em]` | `text-xs font-medium` |
| `AiAssistantDrawer.tsx:79` | `text-[10px] uppercase tracking-[0.2em]` | `text-xs text-[color:var(--dm-muted)]` |
| `ListFieldEditor.tsx:38` | `text-xs uppercase tracking-[0.3em]` | `text-sm font-medium` |
| `MobileSectionNav.tsx:137` | `text-xs uppercase tracking-[0.15em]` | `text-sm` |
| `SectionPillBar.tsx:55` | `text-xs uppercase tracking-[0.15em]` | `text-sm` |
| Dialog buttons in `$invitationId.tsx` | Multiple | `text-xs uppercase tracking-[0.2em]` | `text-sm font-medium` |

**Effort**: S (1-2 hours)

**Acceptance Criteria**: No editor UI text uses uppercase tracking (only template-rendered content may use it).

### 6.3 Ghost button migration

**What**: Convert all editor buttons to ghost style (transparent background + border) except Publish.

**Why**: Reduces visual noise. The UI Designer specified that solid fill is reserved for the primary CTA (Publish).

**How**: Audit all `<button>` elements in editor components. Replace:
```
bg-[color:var(--dm-accent-strong)] text-[color:var(--dm-on-accent)]
```
with:
```
border border-[color:var(--dm-border)] text-[color:var(--dm-ink)] hover:bg-[color:var(--dm-surface-muted)]
```
for everything except the Publish button in `EditorToolbar.tsx`.

**Effort**: S (1-2 hours)

**Acceptance Criteria**: Only the Publish button has a solid background fill.

### 6.4 z-index rationalization

**What**: Standardize z-index values across the codebase to a 5-layer system with breathing room.

**Why**: The Critic recommended wider spacing (10/30/50/70/90) instead of the UI Designer's compressed (10-50) to avoid future conflicts.

**How**: Update `src/styles.css` and inline styles:

| Layer | z-index | Usage |
|-------|---------|-------|
| Base | 10 | Sticky headers, toolbar |
| Overlay | 30 | Bottom sheet, side panels |
| Modal | 50 | AI drawer, inline edit |
| Dialog | 70 | Preview mode, upgrade dialog, slug dialog |
| System | 90 | Skip link, toast notifications |

**Current values to update**:
- `.dm-preview` (line 797): `z-index: 60` -> `z-index: 70`
- `.dm-inline-edit` (line 873): `z-index: 70` -> `z-index: 70` (already correct for dialogs)
- `.dm-skip-link` (line 28): `z-index: 100` -> `z-index: 90`
- `ContextPanelHeader` sticky (line 22): `z-10` -> `z-10` (no change, base layer)
- `ContextPanel` collapse button (line 80): `z-20` -> `z-10` (base layer)

**Effort**: XS (30 minutes)

**Acceptance Criteria**: All z-index values follow the 5-layer system. No overlapping z-index conflicts.

### 6.5 Border radius standardization: rounded-xl

**What**: Replace `rounded-2xl`, `rounded-full` (on non-pill elements), and `rounded-lg` with `rounded-xl` as the default border radius for editor containers and cards.

**Why**: Visual consistency. `rounded-xl` (12px) is the standard; `rounded-full` is reserved for pills and circular buttons only.

**Files to update**:
- `ToggleSwitch.tsx:17`: `rounded-2xl` -> removed (no container border, per 3.7)
- `ContextPanel.tsx:69`: no border-radius (full-width panel)
- `.dm-inline-card` in `styles.css:888`: `border-radius: 2rem` -> `border-radius: 0.75rem` (12px = rounded-xl)

**Effort**: XS (30 minutes)

**Acceptance Criteria**: All editor containers use `rounded-xl`. Pills and circular buttons use `rounded-full`.

### 6.6 Inline edit: disable on mobile

**What**: Disable the inline edit overlay on mobile viewports. Mobile users edit through the full-screen edit tab instead.

**Why**: The UX Designer recommended this for P2. On mobile, the inline edit popover competes for space with the virtual keyboard and is awkward to position. The edit tab (Phase 2, item 4.2) provides a better mobile editing experience.

**How**: In `$invitationId.tsx`, modify `handleInlineEdit` to be a no-op on mobile:
```tsx
const handleInlineEdit = (fieldPath: string) => {
  if (isMobile) {
    // On mobile, switch to edit tab and focus the field
    setMobileTab("edit");
    editor.setActiveSection(fieldPath.split(".")[0]);
    return;
  }
  openInlineEdit(fieldPath, String(getValueByPath(editor.draft, fieldPath) ?? ""));
};
```

**Effort**: XS (30 minutes)

**Acceptance Criteria**: Tapping editable text on mobile preview switches to edit tab rather than showing inline overlay.

### 6.7 Review/summary step before publish

**What**: Add a "Review" step that appears when the user clicks Publish. This shows a summary of all sections, their completion status, and any validation errors, before proceeding to the slug/publish flow.

**Why**: Users currently publish without seeing a summary of what's complete vs incomplete. A review step reduces publish-and-regret.

**How**: Create `src/components/editor/PublishReview.tsx`:
- Renders as a dialog (uses `useFocusTrap`)
- Lists all sections with completion status (checkmark for complete, warning for incomplete)
- Shows any validation errors
- "Continue to Publish" button proceeds to slug dialog
- "Back to Editing" button closes the review

**Effort**: M (3-4 hours)

**Acceptance Criteria**: Clicking Publish shows a review summary. User must explicitly confirm to proceed.

### 6.8 LayoutToggle styling consistency

**What**: Update the `LayoutToggle` component to match the new design system.

**Why**: The Critic identified that `LayoutToggle` uses inconsistent styling compared to other editor controls.

**How**: In `src/components/editor/LayoutToggle.tsx`, apply:
- `rounded-xl` container (not `rounded-full`)
- Ghost button style for inactive segments
- `text-sm` sentence case labels (not uppercase)
- `min-h-11` for touch targets

**Effort**: XS (30 minutes)

**Acceptance Criteria**: LayoutToggle matches the ghost-button, sentence-case, rounded-xl design system.

---

## 7. Component Specification Table

| Component | File | Changes | Key Tailwind Classes |
|-----------|------|---------|---------------------|
| **SectionNav** (new) | `src/components/editor/SectionNav.tsx` | Replaces SectionPillBar + MobileSectionNav | Active: `min-h-11 rounded-xl bg-[color:var(--dm-ink)] px-4 text-sm text-[color:var(--dm-on-accent)]` / Inactive: `min-h-11 rounded-xl border border-[color:var(--dm-border)] px-4 text-sm text-[color:var(--dm-muted)]` |
| **EditorToolbar** | `src/components/editor/EditorToolbar.tsx` | Show SaveStatusBadge on mobile; ghost buttons except Publish | Ghost: `border border-[color:var(--dm-border)] text-[color:var(--dm-ink)]` / Publish: `bg-[color:var(--dm-ink)] text-[color:var(--dm-on-accent)]` |
| **ContextPanelHeader** | `src/components/editor/ContextPanelHeader.tsx` | Remove completion %, move AI button to ContextPanel body, sentence case | `text-sm font-semibold text-[color:var(--dm-ink)]` |
| **ContextPanel** | `src/components/editor/ContextPanel.tsx` | Add AI button below fields, consume EditorContext | AI button: `mt-4 inline-flex items-center gap-2 rounded-xl border border-[color:var(--dm-border)] px-4 py-2.5 text-sm` |
| **FieldRenderer** | `src/components/editor/FieldRenderer.tsx` | Add React.memo, textarea focus ring | Textarea: add `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--dm-focus)]/60` |
| **ToggleSwitch** | `src/components/editor/ToggleSwitch.tsx` | Remove card-in-card border | `flex items-center justify-between gap-4 px-4 py-3` |
| **SaveStatusBadge** | `src/components/editor/SaveStatusBadge.tsx` | No change (already has text labels) | No change |
| **MobileBottomSheet** | `src/components/editor/MobileBottomSheet.tsx` | Only used for AI assistant (not context panel) | No Tailwind changes |
| **AiAssistantDrawer** | `src/components/editor/AiAssistantDrawer.tsx` | Sentence case, aria-pressed on pills | Header: `text-xs font-medium` (not `uppercase tracking-[0.3em]`) |
| **InlineEditOverlay** | `src/components/editor/InlineEditOverlay.tsx` | Disable on mobile (redirect to edit tab) | No Tailwind changes |
| **EditorLayout** | `src/components/editor/EditorLayout.tsx` | Remove sectionRail prop, add mobileTab for edit/preview toggle | Mobile toggle: `flex-1 py-3 text-sm font-medium` |
| **ListFieldEditor** | `src/components/editor/ListFieldEditor.tsx` | Sentence case label | `text-sm font-medium text-[color:var(--dm-ink)]` (not `text-xs uppercase tracking-[0.3em]`) |
| **ListFieldItem** | `src/components/editor/ListFieldItem.tsx` | Inputs must have `bg-[color:var(--dm-surface-muted)]` for affordance | `bg-[color:var(--dm-surface-muted)] rounded-xl border border-[color:var(--dm-border)]` |
| **ImageUploadField** | `src/components/editor/ImageUploadField.tsx` | Include in design scope (Critic item #10) | Upload area: `rounded-xl border-2 border-dashed border-[color:var(--dm-border)] p-6` |
| **LayoutToggle** | `src/components/editor/LayoutToggle.tsx` | Rounded-xl, sentence case, ghost style | Container: `rounded-xl border border-[color:var(--dm-border)]` |
| **PreviewOverlay** (new) | `src/components/editor/PreviewOverlay.tsx` | Extracted from route | `fixed inset-0 z-[70] flex flex-col` |
| **UpgradeDialog** (new) | `src/components/editor/UpgradeDialog.tsx` | Extracted from route | `.dm-inline-edit` overlay + `.dm-inline-card` |
| **ShortcutsDialog** (new) | `src/components/editor/ShortcutsDialog.tsx` | Extracted from route | `.dm-inline-edit` overlay + `.dm-inline-card` |
| **SlugDialog** (new) | `src/components/editor/SlugDialog.tsx` | Extracted from route | `.dm-inline-edit` overlay + `.dm-inline-card` |
| **PublishReview** (new) | `src/components/editor/PublishReview.tsx` | New review step | `.dm-inline-edit` overlay + `.dm-inline-card` |
| **SectionRail** | `src/components/editor/SectionRail.tsx` | **DELETE** | N/A |
| **ProgressIndicator** | `src/components/editor/ProgressIndicator.tsx` | **DELETE** | N/A |
| **SectionPillBar** | `src/components/editor/SectionPillBar.tsx` | **DELETE** (replaced by SectionNav) | N/A |
| **MobileSectionNav** | `src/components/editor/MobileSectionNav.tsx` | **DELETE** (replaced by SectionNav) | N/A |

---

## 8. CSS/Token Changes

### Design Tokens (`:root` in `src/styles.css`)

| Token | Current Value | New Value | Reason |
|-------|--------------|-----------|--------|
| `--font-heading` | `"Outfit", sans-serif` | `"Outfit", "Noto Serif SC", sans-serif` | CJK fallback |
| `--font-body` | `"Outfit", sans-serif` | `"Outfit", "Noto Serif SC", sans-serif` | CJK fallback |
| No new tokens needed | - | - | Existing palette is sufficient |

### CSS Classes to Update

| Selector | Change | File:Line |
|----------|--------|-----------|
| `.dm-section-rail` (entire block) | **DELETE** | `styles.css:1607-1655` |
| `.dm-completion-ring` (entire block) | **DELETE** (replaced by checkmark icons) | `styles.css:1684-1701` |
| `.dm-preview` | `z-index: 60` -> `z-index: 70` | `styles.css:797` |
| `.dm-skip-link` | `z-index: 100` -> `z-index: 90` | `styles.css:28` |
| `.dm-inline-card` | `border-radius: 2rem` -> `border-radius: 0.75rem` | `styles.css:888` |
| `.dm-preview-toolbar` | Wrap `backdrop-filter` in `@media (min-width: 768px)` | `styles.css:831` |

### z-index Layer System

```css
/* Add to styles.css as a comment block for reference */
/* z-index layers:
   10 - Base: sticky headers, toolbar, panel header
   30 - Overlay: bottom sheet, side panels
   50 - Modal: AI drawer, inline edit
   70 - Dialog: preview mode, upgrade, slug, shortcuts
   90 - System: skip link, toast notifications
*/
```

---

## 9. Test Migration Plan

### Tests That Break

| Test File | What Breaks | Required Update |
|-----------|------------|-----------------|
| `tests/e2e/editor-mobile.spec.ts` | Bottom sheet tests for context panel | Rewrite to test edit/preview tab toggle instead |
| `tests/e2e/editor-gestures.spec.ts` | Swipe-to-dismiss bottom sheet tests for context panel | Remove or rewrite for AI assistant bottom sheet only |
| `tests/e2e/editor.spec.ts` | Section pill bar selectors | Update selectors for unified `SectionNav` component |
| `tests/e2e/editor-responsive.spec.ts` | Mobile layout assertions | Update for tab-based mobile layout |

### New Tests Needed

| Test | Priority | Description |
|------|----------|-------------|
| **Mobile edit/preview toggle** | P0 | Tab between edit and preview on mobile. Verify content visibility, section nav persistence, auto-switch on section tap. |
| **Unified SectionNav** | P0 | Keyboard navigation (arrows, Home, End), pill auto-scroll, completion indicators, prev/next arrows on mobile only. |
| **Complete editing flow** | P0 | Create invitation -> edit all sections -> review -> publish. End-to-end happy path. |
| **Auto-save reliability** | P0 | Edit a field, wait 30s, verify save status changes. Navigate away with unsaved changes, verify beforeunload warning. |
| **Focus trap validation** | P1 | For each dialog: Tab cycles within dialog, Escape closes, focus returns to trigger. |
| **AI assistant on mobile** | P1 | Open AI drawer (still uses bottom sheet), generate content, apply, verify drawer closes. |
| **FieldRenderer memoization** | P1 | Edit field A, verify field B does not re-render (React DevTools profiler or test spy). |
| **Inline edit disabled on mobile** | P2 | Tap editable text on mobile, verify switches to edit tab (no inline overlay). |
| **Publish review step** | P2 | Click publish, verify review summary shows, proceed to slug dialog. |

### Device Matrix

| Device | Viewport | Engine | Priority |
|--------|----------|--------|----------|
| iPhone SE | 375x667 | WebKit | P0 |
| iPhone 14 Pro | 393x852 | WebKit | P0 |
| Samsung Galaxy S21 | 360x800 | Chromium | P0 |
| iPad Mini | 768x1024 | WebKit | P1 |
| iPad Pro 11" | 834x1194 | WebKit | P1 |
| Desktop 1280px | 1280x800 | Chromium | P0 |
| Desktop 1920px | 1920x1080 | Chromium | P1 |

### Performance Benchmarks

| Metric | Target | Measurement |
|--------|--------|-------------|
| Editor load (LCP) | < 2s on 4G | Playwright `page.evaluate(() => performance.getEntriesByType('largest-contentful-paint'))` |
| Field input latency | < 50ms | Measure time between keypress and DOM update |
| Section switch | < 200ms | Measure time between tab click and new content visible |
| Auto-save execution | < 100ms | Measure `saveNow()` execution time |

### Visual Regression

- Use `expect(page).toHaveScreenshot()` with `maxDiffPixelRatio: 0.01` and `animations: "disabled"`
- 27 screenshots: 9 sections x 3 viewports (mobile, tablet, desktop)
- Store baselines in `tests/e2e/__screenshots__/`

---

## 10. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Mobile edit/preview tab increases navigation friction vs bottom sheet | Medium | Medium | A/B test with existing users. Keep bottom sheet code (don't delete `MobileBottomSheet.tsx`) for rollback. |
| EditorContext migration introduces regressions in undo/redo | Medium | High | Migrate one state slice at a time. Keep `useEditorState` working until full migration verified. Write unit tests for reducer before integrating. |
| Sentence case migration breaks visual consistency with templates | Low | Low | Only change editor chrome, never template-rendered content. |
| Removing SectionRail removes a navigation option some users might want | Low | Low | SectionRail was never rendered. No users have experienced it. |
| CJK font (Noto Serif SC) increases page weight | Low | Medium | Already imported in `styles.css` line 1. Font subsetting with `&text=` parameter if load time is impacted. |
| Deleting scroll-sync confuses users who expected preview to follow | Medium | Low | Add a manual "Scroll to section" button in the preview panel for explicit navigation. |
| Test rewrites for mobile layout delay testing coverage | Medium | Medium | Prioritize happy-path tests first. Keep old tests running (marked as `.skip`) until new tests are stable. |

---

## 11. Success Metrics

### Quantitative (measure after 4 weeks in production)

| Metric | Current Baseline | Target | How to Measure |
|--------|-----------------|--------|----------------|
| Mobile editor completion rate | Unknown (add analytics) | > 60% of sessions reach Publish | Track `publish` events / `editor_open` events by device |
| Time to first publish | Unknown | < 15 minutes (mobile), < 10 minutes (desktop) | Track elapsed time from first `editor_open` to first `publish` |
| Bottom sheet accidental dismiss rate | Unknown | < 5% of sessions | Track `dismiss` events without preceding `save` (AI assistant only now) |
| WCAG 2.2 AA axe-core violations | TBD (run baseline scan) | 0 critical, 0 serious | Automated axe-core scan in CI |
| Lighthouse Accessibility score | TBD (run baseline) | > 95 | Lighthouse CI |
| Editor load time (LCP) | TBD | < 2s on 4G | Lighthouse / Web Vitals |
| Field input latency | TBD | < 50ms | Custom performance mark |

### Qualitative

| Signal | How to Observe |
|--------|---------------|
| Users complete all sections before publishing | Analytics: sections_edited count per session |
| Mobile users don't struggle with navigation | Session recordings (Hotjar/PostHog): no rage taps on nav elements |
| AI feature discovery improves | Analytics: AI usage rate per session (contextual button vs global drawer) |
| Chinese text renders correctly | Manual QA: verify bilingual invitations render with Noto Serif SC |

### Analytics Implementation Prerequisite

Before any Phase 2+ measurement, implement basic event tracking:
```ts
// Minimum events to track:
track("editor_open", { device: "mobile" | "tablet" | "desktop", templateId })
track("section_edit", { sectionId, device })
track("ai_generate", { taskType, sectionId })
track("publish_start", { completionPct })
track("publish_complete", { slug })
track("mobile_tab_switch", { from: "edit" | "preview", to: "edit" | "preview" })
```

Use PostHog (free tier) or a custom endpoint to `src/api/analytics.ts`.

---

## Appendix: Conflict Resolution Summary

| Conflict | UX Designer | PM | Developer | Critic | Resolution | Rationale |
|----------|-------------|-----|-----------|--------|------------|-----------|
| Bottom sheet vs tabs | Replace with tabs | Keep and improve | No strong opinion | N/A | **Hybrid**: Tab toggle for context panel, keep bottom sheet for AI only | Sustained editing needs full-screen; transient AI fits bottom sheet |
| God component decomposition | N/A | Don't do it (money pit) | Do it (EditorContext, M effort) | N/A | **Do it** in Phase 3, incrementally | Developer's incremental approach (one slice at a time) limits risk; the performance benefit (4 setState -> 1 dispatch) is measurable |
| Unused SectionRail/ProgressIndicator | N/A | Wire them up | Delete them | N/A | **Delete** | Adding more nav contradicts simplification goal; they were never rendered so no user expects them |
| Scroll sync | Remove | N/A | N/A | N/A | **Remove** | "Haunted house" effect is disorienting; explicit scroll-to-section button is better |
| Monochrome progress bars | N/A | N/A | N/A | Too subtle, use checkmarks | **Checkmarks for complete, bars for desktop only** | Critic's checkmark suggestion is cleaner for mobile; bars still useful on desktop where space allows |
| Inline edit on mobile | Disable (P2) | N/A | N/A | N/A | **Disable and redirect to edit tab** in Phase 4 | With tab-based editing, inline edit on mobile is redundant |
