# DreamMoments Editor Improvement Plan

> Consolidated from 9-agent analysis: Researcher, Product Manager, UX Designer, UI Designer, Developer, Code Reviewer, Tester, Accessibility Specialist, and Devil's Advocate.

---

## Executive Summary

The DreamMoments editor is a functional, well-architected responsive editor with 4 layout modes, extracted hooks, and solid mobile support. The team identified **6 real bugs**, **14 WCAG accessibility failures**, and several UX improvements that would meaningfully help mobile users. However, the critics correctly identified that much of the proposed work is over-engineering for the current product stage.

**This plan follows a phased approach**: fix real defects first, then make targeted UX improvements, and defer architectural refactoring until data justifies it.

---

## Phase 1: Bug Fixes & Accessibility (Must Do -- ~1-2 days)

These are non-negotiable fixes for production readiness.

### 1.1 Security: Remove Demo User Bypass
- **File**: `src/routes/editor/$invitationId.tsx:73-80`
- **Issue**: `createUser()` runs for any unauthenticated visitor -- security hole
- **Fix**: Gate behind `import.meta.env.DEV` or remove entirely

### 1.2 Accessibility: Focus Traps for All Dialogs
- **Files**: `$invitationId.tsx:448-480` (preview), `$invitationId.tsx:483-524` (upgrade), `$invitationId.tsx:527-565` (shortcuts)
- **Issue**: 3 dialogs have `role="dialog"` but no focus trap, no Escape handler, no focus restore
- **Fix**: Extract a shared `useFocusTrap(containerRef, { enabled, onEscape })` hook (already needed -- MobileBottomSheet, InlineEditOverlay, and AiAssistantDrawer each implement their own). Apply to all 3 dialogs.

### 1.3 Accessibility: Toolbar Menu Keyboard Navigation
- **File**: `src/components/editor/EditorToolbar.tsx:71-137`
- **Issue**: Overflow menu missing `role="menu"`, `role="menuitem"`, arrow key nav
- **Fix**: Implement WAI-ARIA Menu pattern

### 1.4 Accessibility: Missing Focus Ring on Textarea
- **File**: `src/components/editor/FieldRenderer.tsx:102`
- **Issue**: `<textarea>` lacks `focus-visible` styling (input has it, textarea doesn't)
- **Fix**: Add `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--dm-focus)]/60`

### 1.5 Accessibility: AI Task Pills Missing aria-pressed
- **File**: `src/components/editor/AiAssistantDrawer.tsx:81-96`
- **Fix**: Add `aria-pressed={type === option.value}` to each pill button

### 1.6 Accessibility: InlineEditOverlay Missing aria-modal
- **File**: `src/components/editor/InlineEditOverlay.tsx:181, 258`
- **Fix**: Add `aria-modal="true"` to both mobile and desktop dialog containers

### 1.7 Accessibility: Preview Mode Needs Dialog Role
- **File**: `$invitationId.tsx:448-480`
- **Fix**: Add `role="dialog" aria-modal="true" aria-label="Invitation preview"` + focus trap + Escape handler

### 1.8 Accessibility: Focus Restore on Dialog Close
- **Files**: MobileBottomSheet, AiAssistantDrawer, InlineEditOverlay
- **Fix**: Store `document.activeElement` before opening, restore on close

### 1.9 Performance: Replace JSON.stringify Change Detection
- **File**: `src/components/editor/hooks/useAutoSave.ts:24-27`
- **Issue**: `JSON.stringify(draftRef.current)` runs on every render
- **Fix**: Use a version counter incremented in `updateDraft()`. Compare `versionRef.current !== lastSavedVersionRef.current`

### 1.10 Code Quality: Deduplicate listFieldMap
- **Files**: `useEditorState.ts:11-52` and `ListFieldEditor.tsx:3-44`
- **Fix**: Move to a shared module, import from both locations

### 1.11 Accessibility: Replace `prompt()` with Custom Dialog
- **File**: `$invitationId.tsx:255`
- **Issue**: Native `prompt()` is inaccessible and blocks the thread
- **Fix**: Create a simple custom slug input dialog with proper focus management

---

## Phase 2: High-Value UX Improvements (~3-5 days)

These are the changes with the best value-to-risk ratio, validated by multiple team members.

### 2.1 Mobile Section Navigation: Scrollable Tab Strip
**Priority**: P0 | **Risk**: Low | **Effort**: 2-3 hours

- **What**: Replace dot indicators in `MobileSectionNav.tsx` with a horizontally scrollable pill/tab bar showing section names + completion indicators
- **Why**: Current dots are 8px wide (fail WCAG 2.5.8 minimum 24px), unlabeled, and hard to distinguish with 8+ sections. Every team member flagged this.
- **Design**: Abbreviated labels ("Hero", "Schedule", "Story"), active pill filled with `--dm-accent-strong`, completion color ring, auto-scroll active pill into view
- **Keep**: Prev/next chevron buttons as secondary affordances
- **Remove**: Swipe gesture on nav bar (conflicts with bottom sheet and preview scroll)
- **Note**: Move `role="tablist"` to the pill container only (currently on outer div that includes nav buttons -- accessibility issue L3)

### 2.2 Keyboard-Aware Bottom Sheet
**Priority**: P0 | **Risk**: Medium | **Effort**: 3-4 hours

- **What**: When a text input inside the bottom sheet receives focus and the virtual keyboard opens, auto-expand the sheet to 85% and ensure the focused field is visible above the keyboard
- **Why**: Without this, the keyboard covers 40% of the viewport, making the 60% snap sheet unusable for typing. The critics correctly identified this as the most critical mobile issue.
- **Implementation**: Listen for `visualViewport.resize` events, compute available height, adjust snap point accordingly. Restore original snap when keyboard dismisses.

### 2.3 Bottom Sheet Accidental Dismiss Protection
**Priority**: P0 | **Risk**: Low | **Effort**: 1-2 hours

- **What**: Increase dismiss threshold when the form has been modified. Require either: (a) drag below 20% viewport height, OR (b) explicit close button, OR (c) backdrop tap
- **Why**: The "Low-Tech Parent" persona accidentally dismisses the sheet by stray swipes. Current `SWIPE_THRESHOLD` is 80px and `VELOCITY_THRESHOLD` is 0.5 -- these are too sensitive for users unfamiliar with gesture patterns.
- **Fix in**: `MobileBottomSheet.tsx` -- increase thresholds when content has been edited. Also fix the drag handle button that fires `onClick={handleClose}` on tap (line 334) -- accidental close.

### 2.4 AI Button and Collapse Button Touch Target Fixes
**Priority**: P0 | **Risk**: Low | **Effort**: 30 minutes

- **Files**: `ContextPanelHeader.tsx:37` (AI button `h-9 w-9` = 36px), `ContextPanel.tsx:75` (collapse button `h-6 w-6` = 24px)
- **Fix**: Increase AI button to `h-11 w-11` (44px). Increase collapse button hit area with padding.

### 2.5 Bottom Sheet Focus Trap: Re-query on Tab
**Priority**: P1 | **Risk**: Low | **Effort**: 1 hour

- **File**: `MobileBottomSheet.tsx:90-127`
- **Issue**: Focus trap queries focusable elements once on mount. Dynamic content (field changes) can escape the trap.
- **Fix**: Re-query focusable elements on each Tab keydown event instead of caching them.

---

## Phase 3: Targeted Polish (~1-2 days)

Lower risk improvements that enhance the experience without architectural changes.

### 3.1 Section Transition Feedback
- Add a subtle direction-aware fade (not slide) when switching sections in the context panel: `opacity 0->1` over 150ms. Simpler than full slide transitions, still provides orientation.

### 3.2 Save Status Visibility on Mobile
- Show a small colored dot next to the title in the mobile toolbar (green=saved, amber=saving, gray=unsaved) instead of hiding status in the overflow menu.

### 3.3 "Next Section" Button
- Add a "Next: [Section Name]" button at the bottom of each section's fields in ContextPanel. Guides first-time users through the editing flow.

### 3.4 Inline Edit Hover Affordance (Desktop)
- Add a subtle hover state on `.dm-editable` elements: faint outline/underline indicating the element is clickable. Currently there's no visual cue.

### 3.5 Consistent Error Styling
- Replace hardcoded `#b91c1c` with a design token. Add left border accent to erroneous fields. Add required `*` indicator for required fields.

### 3.6 Reduced Motion: AI Drawer
- The global `prefers-reduced-motion` catch-all in `styles.css` handles most cases, but verify AI drawer animations are covered.

---

## Phase 4: Testing Infrastructure (~2-3 days)

### 4.1 Immediate: Remove Chromium-Only Skips
- 10 tests in `editor.spec.ts` skip non-chromium browsers. Remove skips for: section switching, field editing, visibility toggle, preview mode, publish flow, AI panel. Instantly 3x browser coverage.

### 4.2 Axe-Core Integration
- Install `@axe-core/playwright`, create shared `checkAccessibility()` helper, add scans to: editor load, bottom sheet open, AI drawer open, inline edit open.

### 4.3 Keyboard Shortcut Tests
- New `editor-keyboard.spec.ts`: Cmd+Z, Cmd+Shift+Z, Cmd+S, Cmd+P, `[`, `]`, `?`. 9 test scenarios.

### 4.4 Focus Trap Validation
- Test Tab cycling in bottom sheet, AI drawer, inline edit overlay. Verify focus doesn't escape.

### 4.5 Gesture Test Helpers
- Create `swipe()` and `drag()` helpers using `dispatchEvent` for touch simulation. Test bottom sheet drag-to-dismiss and section nav.

### 4.6 Visual Regression Baselines
- Switch from `page.screenshot()` to `expect(page).toHaveScreenshot()` with `maxDiffPixelRatio: 0.01` and `animations: "disabled"`.

---

## Explicitly Deferred (Do NOT Build Now)

The critics analysis identified these as over-engineering or premature:

| Item | Reason to Defer |
|------|----------------|
| EditorScreen decomposition into 5 components via EditorContext | Risk/reward ratio is poor. Hooks are already extracted. The 568-line file is a page coordinator, not a god component. Revisit when the file exceeds 800+ lines or when multiple developers need to work on it simultaneously. |
| useReducer for UI state | Current `useState` calls are independent toggles. useReducer adds indirection without benefit at this scale. |
| CSS grid replacing JS layout branches | Current 4-branch `EditorLayout.tsx` is 128 lines and explicit. CSS-only approach makes breakpoints implicit and harder to debug. |
| Device mockup frame for mobile preview | Pure decoration, zero impact on task completion. |
| Dot-grid canvas background | Decoration. |
| 4-token animation system | Over-engineering for current product stage. Current `duration-300 ease-out` works. |
| Spring-like snap animation | Diminishing returns. |
| Immer for immutable updates | `structuredClone` is fast enough for small wedding invitation content. |
| Inline edit disabled on mobile | Current mobile bottom bar implementation already works well. Disabling would be a regression. |
| AI assistant embedded in bottom sheet | Current separate bottom sheet is cleaner and avoids competing for space. |
| "Quick Overview" toggle | New feature, not an improvement to existing UX. |
| Resizable desktop panel | Fixed 380px works fine. |
| Backdrop opacity tied to snap height | Micro-detail with no measurable impact. |

---

## Analytics Prerequisite

**Before building anything beyond Phase 2, add basic analytics.** The critics correctly identified that current metrics are assumptions, not data:

- Track: editor opens by device type, sections edited per session, time to first publish, bottom sheet dismiss events (accidental vs intentional), inline edit usage rate
- Use a lightweight solution (PostHog, Plana, or custom events to your API)
- Measure for 2-4 weeks before deciding on further improvements

---

## Summary: Effort vs Impact

| Phase | Effort | Impact | Risk |
|-------|--------|--------|------|
| Phase 1: Bug fixes + A11y | 1-2 days | HIGH (security, WCAG compliance, performance) | LOW |
| Phase 2: UX improvements | 3-5 days | HIGH (mobile usability, touch targets) | LOW-MEDIUM |
| Phase 3: Polish | 1-2 days | MEDIUM (quality of life) | LOW |
| Phase 4: Testing | 2-3 days | HIGH (regression prevention, 3x browser coverage) | LOW |
| **Total** | **~2 weeks** | | |

This plan delivers the critical fixes and highest-impact UX improvements while avoiding the 4-6 week architectural rewrite that carries significant regression risk. After shipping these changes and collecting analytics data, revisit the deferred items based on real user behavior.

---

## Team Contributions

| Role | Key Contribution |
|------|-----------------|
| **Researcher** | Industry benchmarks: mobile form abandonment 27% higher than desktop; reducing fields boosts conversions 160%; 30/60/90% snap points align with Apple HIG + Material Design |
| **Product Manager** | 4 personas (Mobile Bride, Desktop Groom, Tablet Planner, Low-Tech Parent), 16 user stories, 5 detailed acceptance criteria, success metrics |
| **UX Designer** | "Peek-Edit-Review" model, scrollable tab strip, 2-snap bottom sheet, AI inline mode, 11 prioritized recommendations |
| **UI Designer** | Bottom sheet visual refinements, animation system, spacing tokens, depth-based visual hierarchy, 6 design principles |
| **Developer** | 6-phase migration plan, EditorContext architecture, hybrid responsive strategy, CSS custom property optimization, shared hook extraction |
| **Code Reviewer** | 39 issues (6 critical, 8 high, 13 medium, 8 low), top 5 fix priorities |
| **Tester** | 70+ new test scenarios, axe-core integration plan, cross-browser matrix, gesture testing helpers, CI pipeline |
| **Accessibility Specialist** | 14 WCAG 2.2 AA failures (7 critical, 4 major, 3 moderate), dialog pattern score 5/10, comprehensive remediation steps |
| **Critics** | Reality check: challenged fabricated metrics, identified over-engineering, proposed 80/20 minimum viable changes, found team contradictions |
