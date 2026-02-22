# Mobile Editor UX Improvements — Design

**Date:** 2026-02-22
**Status:** Approved

---

## Context

The mobile editor bottom sheet gives users no sense of where they are in the editing flow. When the sheet opens, it shows a section name and completion percentage, but nothing tells the user how many sections exist, how many are done, or where the current section sits in the overall flow. Switching between sections via the pill tabs causes an abrupt jump with no animation, making the transition feel jarring. As users scroll through a long section list, the section context disappears — they lose track of which section they are editing.

These gaps cause anxiety ("have I filled in everything?") and make the editing flow feel unpolished compared to the desktop experience.

---

## Goals

- Give users a clear sense of progress through all sections
- Always show which section they are currently reading/editing
- Make section navigation feel smooth, not abrupt

---

## Design

### Feature 1 — Section Step Indicator

A new component `SectionStepIndicator` placed in the bottom sheet between the drag handle and `ContextPanelHeader`.

**Visual layout inside the sheet:**

```
 ─────────────────────────────────  ← drag handle
 ● ● ● ◉ ○ ○ ○ ○           3 of 8  ← SectionStepIndicator (NEW)
 Welcome            72%  [AI]  [👁]  ← ContextPanelHeader (existing)
 [Welcome][Story][Gallery][Schedule] ← MobileSectionNav pills (existing)
```

**Dot visual states:**
- Complete (all required fields filled): solid `var(--dm-peach)` fill, 8px circle
- Current (active section): `var(--dm-peach)` 2px ring, white center, 8px circle
- Incomplete: `var(--dm-ink)` at 20% opacity ring, no fill, 8px circle

**Behavior:**
- Dots are tappable — tap navigates to that section (same as tapping the pill tab)
- State transitions animate with `transition-colors duration-200`
- `prefers-reduced-motion`: transitions disabled, state changes are instant
- If > 10 sections: dot size reduces to 6px

**Accessibility:**
- `role="tablist"` on the dot row
- Each dot: `role="tab"`, `aria-label="[Section Name]"`, `aria-selected="true|false"`
- Counter text "3 of 8" uses `aria-live="polite"` so screen readers announce section changes

**Completion source:** reuses `useSectionProgress` hook — already computes per-section completion percentages. A section is "complete" when its percentage === 100.

---

### Feature 2 — Sticky Section Sub-Header

A sticky `28px` strip inside `MobileAllSectionsPanel` that follows the user as they scroll, showing the current section name and field completion fraction.

**Visual:**
```
 [Welcome][Story][Gallery][Schedule] ← pills
 ─── Schedule · 3 of 5 fields ─────  ← sticky sub-header (NEW)
 Event 1  [input]
```

**Specs:**
- `sticky top-0 z-10 bg-white/95 backdrop-blur-sm`
- Height: 28px, text: `text-xs text-[var(--dm-ink)]/60` center-aligned
- Content: `"[Section name] · X of Y fields"`
- Only renders after user has scrolled past the first section heading (avoids redundancy with the top `ContextPanelHeader` which already shows the section name)
- Section detection driven by the existing `useFormScrollSpy` hook — no new scroll logic needed

---

### Feature 3 — Smooth Section Transitions

In `MobileSectionNav.tsx`, when a pill is tapped:

1. Change `scrollIntoView()` to `scrollIntoView({ behavior: 'smooth', block: 'start' })`
2. After navigation, briefly highlight the target section heading with a 100ms fade-in animation (opacity + subtle background-color wash using `--dm-peach` at 10% opacity) so users know exactly where they landed

`prefers-reduced-motion`: use `behavior: 'instant'` for scroll, skip the highlight pulse.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/editor/SectionStepIndicator.tsx` | **New file** — dot progress component |
| `src/components/editor/MobileBottomSheet.tsx` | Add `SectionStepIndicator` between drag handle and header content |
| `src/components/editor/MobileAllSectionsPanel.tsx` | Add sticky sub-header driven by scroll spy |
| `src/components/editor/MobileSectionNav.tsx` | Smooth scroll + highlight pulse on pill tap |

**Existing hooks reused (no changes needed):**
- `useSectionProgress` — `src/components/editor/hooks/useSectionProgress.ts` (per-section completion %)
- `useFormScrollSpy` — `src/components/editor/hooks/useFormScrollSpy.ts` (scroll position → active section)
- `useEditorState` — `src/components/editor/hooks/useEditorState.ts` (active section ID, section list)

---

## Error Handling

- If `useSectionProgress` returns undefined for a section, treat as incomplete (gray dot)
- If section list is empty, `SectionStepIndicator` renders nothing (defensive null check)
- Sticky sub-header only appears if scroll offset > 0 (prevents flicker on open)

---

## Verification

1. `pnpm dev` — open editor on a mobile viewport (Chrome DevTools → iPhone 14 Pro)
2. Open the bottom sheet — verify: step dots appear, "X of 8" counter is correct
3. Fill in required fields in a section — verify: that section's dot turns solid accent
4. Tap a different pill tab — verify: smooth scroll, highlight pulse on section heading, active dot updates
5. Scroll down through multiple sections — verify: sticky sub-header appears after first section, updates on crossing section boundaries
6. Test with `prefers-reduced-motion: reduce` in DevTools — verify: no animations, instant scroll
7. Test with screen reader (VoiceOver on iOS simulator) — verify: dots announce section name and selected state
