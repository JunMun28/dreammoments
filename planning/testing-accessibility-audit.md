# DreamMoments: Accessibility & Testing Audit

> QA Tester and Accessibility Specialist Report
> Date: 2026-02-08
> Scope: Full codebase audit covering WCAG 2.1 AA compliance, E2E test coverage, edge cases, and error handling

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [WCAG 2.1 AA Compliance Audit](#2-wcag-21-aa-compliance-audit)
3. [Test Coverage Analysis](#3-test-coverage-analysis)
4. [Edge Cases & Robustness](#4-edge-cases--robustness)
5. [Error Handling Audit](#5-error-handling-audit)
6. [Prioritized Recommendations](#6-prioritized-recommendations)

---

## 1. Executive Summary

DreamMoments has a solid accessibility foundation with skip links, focus traps, ARIA labels, `prefers-reduced-motion` support, and axe-core integration in E2E tests. However, the audit identified **8 Critical**, **14 Major**, and **11 Minor** findings across WCAG compliance, test coverage gaps, edge-case handling, and error states.

**Key Strengths:**
- `useFocusTrap` hook properly traps focus, handles Escape, and restores focus on close
- Skip-to-content link present (`__root.tsx:104`)
- Global `prefers-reduced-motion: reduce` rule disables all animations (`styles.css:1594-1601`)
- All RSVP form inputs across templates have `min-height: 44px` touch targets
- `aria-live="polite"` used for error messages, save status, and RSVP feedback
- axe-core accessibility scans integrated in E2E tests (`editor-accessibility.spec.ts`)
- Visual regression screenshots across 6 viewport sizes (`editor-responsive.spec.ts`)

**Key Gaps:**
- Color contrast failures in completion indicators and some template text
- Checkbox touch targets below 44x44px (consent checkboxes: 18x18px)
- Missing `aria-label` on EditorPreviewFrame container
- No screen reader announcements for auto-save events
- No E2E tests for network failures, offline behavior, or concurrent editing
- No unit tests for any editor hooks, data layer, or auth module
- Dashboard delete uses `window.confirm()` (not accessible dialog)

---

## 2. WCAG 2.1 AA Compliance Audit

### 2.1 Focus Management

#### F-01: Focus Trap Coverage (Compliant)
- **Severity**: N/A (compliant)
- **WCAG**: 2.4.3 Focus Order
- **Current behavior**: `useFocusTrap` (`hooks/useFocusTrap.ts`) is applied to all 6 dialog surfaces: preview mode, slug dialog, upgrade dialog, shortcuts dialog (via refs in `$invitationId.tsx:266-281`), AI drawer (`AiAssistantDrawer.tsx:195`), and MobileBottomSheet (inline implementation, `MobileBottomSheet.tsx:168-211`).
- **Assessment**: All traps re-query focusable elements on each Tab keydown, handle Escape, and restore focus on close. Compliant.

#### F-02: MobileBottomSheet Focus Restore Race Condition
- **Severity**: Minor
- **WCAG**: 2.4.3 Focus Order
- **Current behavior**: `MobileBottomSheet.tsx:127-133` stores `document.activeElement` on open and restores on close. However, the close handler (`handleClose`, line 153) uses a 300ms `setTimeout` before calling `onClose()`. The focus restore effect (line 126-133) triggers on `open` state change, which happens after the timeout. If user interacts with other elements during this 300ms gap, `previousFocusRef` still holds the original element, which is correct -- but the animation delay means focus is briefly unmanaged.
- **Expected behavior**: Focus should transfer immediately to the trigger element when the sheet starts closing.
- **Fix**: Move the `onClose()` call to immediately set `open=false`, then let the animation run via a separate `isClosing` visual state (which already exists). The focus restore can happen synchronously.

#### F-03: ContextPanelHeader AI Button Size Below Recommended
- **Severity**: Minor
- **WCAG**: 2.5.8 Target Size (Minimum)
- **Current behavior**: The AI sparkles button in `ContextPanelHeader.tsx:63` is `h-9 w-9` (36x36px), below the 44x44px recommendation.
- **Expected behavior**: All interactive elements should be at least 44x44px.
- **Fix**: Change to `h-11 w-11` (44x44px) to match other buttons. The EDITOR_IMPROVEMENT_PLAN.md already notes the ContextPanelHeader AI button at `h-11 w-11` is "already correct" but the actual code still uses `h-9 w-9`.

#### F-04: FieldRenderer AI Button Below 44x44px
- **Severity**: Minor
- **WCAG**: 2.5.8 Target Size (Minimum)
- **Current behavior**: `FieldRenderer.tsx:124` renders an AI rewrite button at `h-8 w-8` (32x32px).
- **Expected behavior**: Minimum 44x44px touch target.
- **Fix**: Change to `h-11 w-11` (44x44px) or add padding to increase the touch area.

### 2.2 Color Contrast

#### C-01: Completion Ring Color-Only Indicators (WCAG Failure)
- **Severity**: Critical
- **WCAG**: 1.4.1 Use of Color
- **Current behavior**: `styles.css:1720-1730` defines `.dm-completion-ring` with green (#22c55e) for complete, yellow (#eab308) for partial, and gray for empty. These 8x8px dots (`dm-completion-ring`) are the only visual distinction. They are `aria-hidden="true"` which means screen readers ignore them, but sighted users with color blindness cannot differentiate states.
- **Expected behavior**: Section completion should convey meaning through shape/icon/text, not color alone.
- **Fix**: As recommended in EDITOR_IMPROVEMENT_PLAN.md Phase 2: replace dots with checkmark icon for complete, no icon for partial/empty. The `aria-label` on each tab button already includes `(X% complete)` text, which is good for screen readers.

#### C-02: Consent Checkbox Touch Target (WCAG Failure)
- **Severity**: Critical
- **WCAG**: 2.5.8 Target Size (Minimum)
- **Current behavior**: Consent checkboxes across all templates (`styles.css:630-638`, `styles.css:1326-1334`) are `18x18px`. The `<label>` wraps both checkbox and text, so the full label area is tappable, but the actual checkbox target itself is small.
- **Expected behavior**: The checkbox input should have at least 44x44px touch area (achieved via padding, or using a custom checkbox component).
- **Fix**: Add padding or use a custom styled checkbox with minimum 44x44px hit area. The `<label>` wrapping helps but WCAG 2.5.8 specifically measures the *control* size.

#### C-03: Love at Dusk Template - Muted Text Contrast
- **Severity**: Major
- **WCAG**: 1.4.3 Contrast (Minimum)
- **Current behavior**: `--love-muted: #A89F91` on `--love-ink: #0d0a09` background. The muted color (#A89F91) is used for secondary text. Contrast ratio against the dark background is approximately 7.4:1 (passes AA). However, when used against `--love-surface: #140d0b`, the contrast drops. Form placeholders at `opacity: 0.6` on this muted color further reduce contrast.
- **Expected behavior**: All text should maintain 4.5:1 contrast ratio (normal text) or 3:1 (large text).
- **Fix**: Test actual rendered contrast ratios for form placeholders with opacity applied. Consider raising placeholder opacity to 0.8 or using a lighter placeholder color.

#### C-04: Eternal Elegance - Gold on White Contrast
- **Severity**: Major
- **WCAG**: 1.4.3 Contrast (Minimum)
- **Current behavior**: `--eternal-secondary: #C9A962` used for kicker text (`.eternal-kicker`, `styles.css:1126`) on white background `--eternal-bg: #FFFFFF`. Contrast ratio of #C9A962 on #FFFFFF is approximately 2.4:1, which **fails** WCAG AA for both normal and large text.
- **Expected behavior**: Minimum 4.5:1 for normal text, 3:1 for large text.
- **Fix**: Darken the gold to at least #8B6914 (which is already defined as `goldDark` in GardenRomanceInvitation.tsx:27) or increase font size to qualify as large text (18pt+/24px+). The `.eternal-kicker` at 0.75rem (12px) is small text, so 4.5:1 is required.

#### C-05: Garden Romance - Gold (#D4AF37) on Ivory (#FFF8E7)
- **Severity**: Major
- **WCAG**: 1.4.3 Contrast (Minimum)
- **Current behavior**: Garden Romance template uses gold (#D4AF37) text on warm ivory (#FFF8E7) backgrounds. Contrast ratio is approximately 2.2:1, **failing** WCAG AA.
- **Expected behavior**: 4.5:1 minimum contrast.
- **Fix**: Use `goldDark: #8B6914` for all gold text on light backgrounds. Keep #D4AF37 for decorative borders/dividers only.

#### C-06: Blush Romance - Peach (#FFB7B2) on White
- **Severity**: Major
- **WCAG**: 1.4.3 Contrast (Minimum)
- **Current behavior**: `--dm-peach: #FFB7B2` used for `.blush-tagline` color (`styles.css:398`) on white-ish background. Contrast ratio is approximately 1.9:1, **failing** WCAG AA.
- **Expected behavior**: The tagline is large text (1.75rem/28px), so 3:1 minimum applies. Still fails.
- **Fix**: Darken the peach for text usage to at least #D4726B or use `--dm-muted` (#5C5856) for the tagline text and keep peach for decorative elements only.

### 2.3 Screen Reader Support

#### SR-01: EditorPreviewFrame Missing Accessible Label
- **Severity**: Major
- **WCAG**: 4.1.2 Name, Role, Value
- **Current behavior**: `EditorPreviewFrame.tsx:34` renders a `<div>` with `ref`, scroll classes, and `data-active-section` but no `role` or `aria-label`. Screen readers see an unlabeled scrollable container.
- **Expected behavior**: The preview area should be announced as a region with a descriptive label.
- **Fix**: Add `role="region"` and `aria-label="Invitation preview"` to the outer div.

#### SR-02: Auto-Save Status Not Announced to Screen Readers
- **Severity**: Major
- **WCAG**: 4.1.3 Status Messages
- **Current behavior**: `SaveStatusBadge.tsx` uses `aria-live="polite"` (verified in grep results), which is correct. However, the save status text changes between "Saved at...", "Saving...", and "Unsaved changes" -- the `aria-live` region should announce these transitions. Need to verify the implementation handles intermediate states properly.
- **Assessment**: Partially compliant. The `aria-live` is present but the badge component wraps the entire element. If the component re-mounts rather than updating text in place, screen readers may miss the announcement. Verify the badge uses consistent DOM (update text, not replace element).

#### SR-03: Inline Edit Overlay Missing Dialog Role
- **Severity**: Major
- **WCAG**: 4.1.2 Name, Role, Value
- **Current behavior**: Need to verify `InlineEditOverlay.tsx` has `role="dialog"` and `aria-modal="true"`. The focus trap test in `editor-accessibility.spec.ts:159-188` looks for `[role="dialog"]` containing "Apply|Save" text, which suggests it does have a dialog role. However, the inline edit overlay on mobile renders as a bottom bar, which may not have the dialog role.
- **Expected behavior**: Both desktop (popover) and mobile (bottom bar) inline edit should have proper ARIA roles.
- **Fix**: Ensure both mobile and desktop inline edit variants have `role="dialog"`, `aria-modal="true"`, and `aria-label="Edit field"`.

#### SR-04: Dashboard Delete Uses window.confirm()
- **Severity**: Major
- **WCAG**: 4.1.2 Name, Role, Value
- **Current behavior**: `dashboard.spec.ts:78` uses `page.on("dialog")` for delete confirmation, indicating `window.confirm()` is used. Native dialogs are accessible, but the behavior is inconsistent with the rest of the app which uses custom dialogs with focus traps.
- **Expected behavior**: Use a custom accessible confirmation dialog consistent with the rest of the UI, or accept the native dialog approach (which is technically WCAG compliant).
- **Assessment**: Native `confirm()` is accessible but inconsistent with the custom dialog pattern used elsewhere. Minor UX concern, not a WCAG failure.

#### SR-05: Template Section Shells Missing Heading Hierarchy
- **Severity**: Minor
- **WCAG**: 1.3.1 Info and Relationships
- **Current behavior**: Template sections use varied heading levels. In BlushRomanceInvitation, `<h1>` is used for couple names (correct), `<h2>` for announcement title, `<h3>` for venue name. This is generally correct. However, the `.blush-heading` class is applied to both `<p>` and heading elements inconsistently (e.g., milestone titles use `<p className="blush-heading">` instead of proper heading elements).
- **Expected behavior**: Content headings should use semantic heading elements, not styled paragraphs.
- **Fix**: Replace `<p className="blush-heading">` with `<h3 className="blush-heading">` in milestone, schedule, and FAQ sections across all templates.

### 2.4 Keyboard Navigation

#### K-01: MobileSectionNav Roving Tabindex (Compliant)
- **Severity**: N/A (compliant)
- **WCAG**: 2.1.1 Keyboard
- **Current behavior**: `MobileSectionNav.tsx` implements full roving tabindex with ArrowLeft/ArrowRight/Home/End keyboard navigation (lines 56-87). Active tab has `tabIndex={0}`, inactive tabs have `tabIndex={-1}`. `role="tablist"` and `role="tab"` are correct.
- **Assessment**: Fully compliant with WAI-ARIA tabs pattern.

#### K-02: Keyboard Shortcuts Suppress in Text Inputs (Compliant)
- **Severity**: N/A (compliant)
- **WCAG**: 2.1.1 Keyboard
- **Current behavior**: `useKeyboardShortcuts.ts:21-29` checks if the active element is an input, textarea, select, or contenteditable, and returns early. This prevents shortcuts from firing while typing.
- **Assessment**: Correct implementation.

#### K-03: Preview Mode Escape Key (Compliant)
- **Severity**: N/A (compliant)
- **Current behavior**: Preview mode dialog (`$invitationId.tsx:266-269`) uses `useFocusTrap` with `onEscape: () => setPreviewMode(false)`. Escape closes the preview and restores focus.
- **Assessment**: Fully compliant.

#### K-04: SectionPillBar Missing Keyboard Navigation
- **Severity**: Major
- **WCAG**: 2.1.1 Keyboard
- **Current behavior**: The desktop `SectionPillBar` component (used for non-mobile viewports, `$invitationId.tsx:451-456`) likely lacks the roving tabindex pattern that `MobileSectionNav` has. Users on desktop may not be able to navigate between section pills with Arrow keys.
- **Expected behavior**: Both mobile and desktop section navigation should support Arrow key navigation.
- **Fix**: Merge `SectionPillBar` and `MobileSectionNav` into a single `SectionNav` component (as recommended in EDITOR_IMPROVEMENT_PLAN.md Phase 2) that always includes keyboard navigation.

### 2.5 Reduced Motion Support

#### RM-01: Global Reduced Motion Rule (Compliant)
- **Severity**: N/A (compliant)
- **WCAG**: 2.3.3 Animation from Interactions
- **Current behavior**: `styles.css:1594-1601` applies a global rule:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  ```
  Additionally, individual components check reduced motion: `MobileBottomSheet.tsx:115-123` reads `prefers-reduced-motion`, `scroll-effects.ts` referenced in templates. Garden Romance uses `useReducedMotion()` from `motion/react`.
- **Assessment**: Comprehensive coverage. The global rule acts as a safety net, and component-specific checks handle behavioral changes (e.g., skip close animation).

#### RM-02: Garden Romance motion/react Animations
- **Severity**: Minor
- **WCAG**: 2.3.3 Animation from Interactions
- **Current behavior**: Garden Romance uses `motion/react` (`useReducedMotion()`, `useScroll`, `useTransform`, motion variants). The `motion/react` library respects `prefers-reduced-motion` natively, plus the global CSS rule provides a fallback.
- **Assessment**: Double-protected. Compliant.

### 2.6 Touch Targets

#### TT-01: Global Button Min-Height Rule (Compliant)
- **Severity**: N/A (compliant)
- **WCAG**: 2.5.8 Target Size (Minimum)
- **Current behavior**: `styles.css:41-44` enforces `min-height: 44px` on all `button.rounded-full` and `a.rounded-full` elements. Most interactive elements use `min-h-11` (44px) or `h-11 w-11` classes.
- **Assessment**: Good foundation. Exceptions noted in F-03, F-04, and C-02.

### 2.7 Form Labels and Error Announcements

#### FL-01: RSVP Form Labels (Compliant)
- **Severity**: N/A (compliant)
- **Current behavior**: All RSVP forms across templates use `<label>` wrapping pattern (BlushRomanceInvitation.tsx:272-367). Each input is inside its label with visible text. `aria-required="true"` present on the name field.
- **Assessment**: Compliant.

#### FL-02: Editor Field Labels (Compliant)
- **Severity**: N/A (compliant)
- **Current behavior**: `FieldRenderer.tsx:105-118` uses `<label htmlFor={inputId}>` with matching `id` on input/textarea. Required fields show a visual asterisk with `aria-hidden="true"`.
- **Assessment**: Compliant. The asterisk is decorative; the `required` attribute should be on the input for full screen reader support.

#### FL-03: Editor Fields Missing `required` Attribute
- **Severity**: Minor
- **WCAG**: 1.3.1 Info and Relationships
- **Current behavior**: `FieldRenderer.tsx` shows a visual asterisk for required fields but does not add `required` or `aria-required="true"` to the actual `<input>` / `<textarea>` elements.
- **Expected behavior**: Required fields should have `required` or `aria-required="true"` on the input element.
- **Fix**: Add `required={field.required}` and `aria-required={field.required}` to the input/textarea elements.

#### FL-04: Error Messages Use `<output>` with aria-live (Compliant)
- **Severity**: N/A (compliant)
- **Current behavior**: Error messages use `<output aria-live="polite">` in `FieldRenderer.tsx:151`, `AiAssistantDrawer.tsx:145`, and all RSVP forms. This ensures screen readers announce errors.
- **Assessment**: Good pattern. Compliant.

---

## 3. Test Coverage Analysis

### 3.1 E2E Test Inventory

| Test File | Tests | User Flows Covered |
|-----------|-------|-------------------|
| `editor.spec.ts` | 8 | Layout, section switching, visibility toggle, field types (text/textarea/image/list/date/toggle), validation, undo/redo, autosave, beforeunload, preview+share, publish free/premium, AI panel+limit, inline edit mobile |
| `editor-accessibility.spec.ts` | 7 | axe-core scans (editor load, bottom sheet, AI drawer, inline edit), focus trap validation (bottom sheet, AI drawer, inline edit overlay) |
| `editor-keyboard.spec.ts` | 7 | Cmd+Z undo, Cmd+Shift+Z redo, Cmd+S save, Cmd+P preview toggle, [ collapse, ] expand, ? help dialog |
| `editor-mobile.spec.ts` | 5 | Bottom sheet open, mobile section nav tablist, next/prev section buttons, AI assistant bottom sheet, inline edit bottom bar |
| `editor-responsive.spec.ts` | 12 | Visual regression across 6 viewports (iPhone SE, iPhone 14, iPad Portrait, iPad Landscape, Laptop, Desktop XL) x 2 states (initial, preview) |
| `editor-gestures.spec.ts` | 3 | Swipe dismiss bottom sheet, drag snap point, swipe helper directions |
| `auth.spec.ts` | 4 | Login success/invalid/unknown, Google OAuth, signup validation+success, password reset |
| `dashboard.spec.ts` | 4 | Auth guard redirect, empty state, list+actions (share/copy/whatsapp/preview/edit), delete confirm/cancel |
| `invite.spec.ts` | 4 | Sample render, live view tracking + hidden sections, RSVP submit + guest count, RSVP errors (guest limit, rate limit) |
| `landing.spec.ts` | 5 | Hero+sections, skip link, desktop header unauth, nav anchors, desktop header auth, mobile nav toggle |
| `routing.spec.ts` | 4 | Routing smoke unauth (/, /auth/login, /auth/signup, /auth/reset, /invite/sample), routing smoke auth (dashboard, editor, upgrade), editor/new redirect, callback redirect |
| `upgrade.spec.ts` | 1 | Upgrade flow (currency select, PayNow, Stripe checkout mock) |

**Total: ~64 test cases across 12 files**

### 3.2 Critical Paths WITHOUT Test Coverage

| Critical Path | Severity | Description |
|---------------|----------|-------------|
| **End-to-end invitation creation** | Critical | No test covers: sign up -> dashboard -> create new invitation -> select template -> edit all sections -> publish -> view published invite. Tests jump into editor with pre-seeded data. |
| **Template switching** | Critical | No test verifies changing templates preserves/migrates content. |
| **Multi-template RSVP** | Major | RSVP tests only cover love-at-dusk template. No coverage for blush-romance, garden-romance, or eternal-elegance RSVP forms. |
| **Session expiry / auth token refresh** | Major | No test for expired JWT sessions. `lib/session.ts` handles JWT but no test verifies behavior when token expires during editor use. |
| **Image upload failure** | Major | Editor test uploads a file but doesn't test upload failure (network error, file too large, wrong type). |
| **Concurrent editing** | Major | No test for two browser tabs editing the same invitation simultaneously (localStorage race conditions). |
| **AI generation error states** | Major | AI limit test exists, but no test for network errors during generation, empty prompts, or malformed API responses. |
| **Slug collision** | Major | Publish test verifies slug saves, but doesn't test duplicate slug rejection. |
| **Deep link to editor section** | Minor | No test for URL-based section navigation (e.g., `/editor/inv-1?section=venue`). |
| **Browser back/forward navigation** | Minor | No test for browser history behavior in the editor (section changes, dialog open/close). |

### 3.3 Unit Test Gaps

The project has **zero unit tests** (`pnpm test` runs Vitest but no test files were found in `src/`). The following modules would benefit from unit tests:

| Module | Priority | Reason |
|--------|----------|--------|
| `useEditorState` (hooks/useEditorState.ts) | P0 | Core editor state: draft mutations, undo/redo stack, field change handler. Any regression here breaks all editing. |
| `useAutoSave` (hooks/useAutoSave.ts) | P0 | Timer-based auto-save with version tracking. Edge cases: rapid changes, version mismatch, save during unmount. |
| `useFocusTrap` (hooks/useFocusTrap.ts) | P1 | Focus management. Unit test with jsdom to verify trap, escape, and restore behavior. |
| `useAiAssistant` (hooks/useAiAssistant.ts) | P1 | AI state machine: open/close panel, prompt management, generation lifecycle, apply result. |
| `useInlineEdit` (hooks/useInlineEdit.ts) | P1 | Inline edit lifecycle: open, update value, save, cancel. |
| `useSectionProgress` (hooks/useSectionProgress.ts) | P2 | Completion calculation. Should be a pure function testable without React. |
| `lib/validation.ts` | P1 | Zod schemas for input validation. Test boundary values, malicious input, CJK characters. |
| `lib/store.ts` | P1 | localStorage store with persistence. Test hydration, serialization, concurrent access. |
| `lib/session.ts` | P1 | JWT session management. Test token creation, verification, expiry. |
| `lib/slug.ts` | P2 | Slug generation/normalization. Test special characters, CJK, duplicates, length limits. |
| `data/sample-invitation.ts` | P2 | Sample content builder. Test all template IDs produce valid content shapes. |

### 3.4 Recommended New E2E Test Cases

| Test Case | Priority | Description |
|-----------|----------|-------------|
| **Full creation flow** | P0 | Sign up -> create invitation -> select template -> edit hero section -> publish -> verify public URL works |
| **All 4 template RSVP forms** | P0 | Submit RSVP on each template, verify form labels, required fields, and success message |
| **Image upload error handling** | P1 | Mock upload failure, verify error message shown, verify field returns to previous state |
| **Auto-save after field change** | P1 | Edit field, wait for auto-save interval, verify store updated, verify save status badge shows "Saved at..." |
| **Network failure during auto-save** | P1 | Mock localStorage write failure, verify "Unsaved changes" badge persists |
| **Slug collision rejection** | P1 | Try to publish two invitations with same slug, verify error |
| **Session expiry** | P1 | Clear session mid-edit, verify redirect to login, verify unsaved changes warning |
| **Large guest list** | P2 | RSVP 100+ guests, verify list renders without jank, verify pagination/virtualization if implemented |
| **CJK character support** | P2 | Enter Chinese/Malay characters in all field types, verify rendering in preview |
| **Template switch content migration** | P2 | Start with template A, switch to template B, verify shared fields preserved |
| **Concurrent tabs** | P2 | Open editor in two tabs, edit in one, verify other tab picks up changes on focus |
| **Preview mode across templates** | P2 | Open preview mode for each of the 4 templates, verify template-specific shell class applies |

---

## 4. Edge Cases & Robustness

### 4.1 Large Data Sets

#### ED-01: 500+ Guests in RSVP List
- **Severity**: Major
- **Current behavior**: Guest data is stored in localStorage (`lib/store.ts`). With 500+ guests, `JSON.stringify`/`JSON.parse` on every store read could cause noticeable lag. No virtualization or pagination exists for the dashboard guest list.
- **Expected behavior**: Guest lists should remain performant with 500+ entries.
- **Fix**: Implement virtual scrolling (e.g., `@tanstack/react-virtual`) for guest lists. Consider lazy-loading guest data separately from the main invitation store.

#### ED-02: Very Long Content (Names, Messages, FAQ Items)
- **Severity**: Minor
- **Current behavior**: No character limits enforced in the editor. A user could enter a 10,000-character message in the announcement textarea. Template rendering does not truncate or scroll long content -- it will overflow and potentially break layout.
- **Expected behavior**: Either enforce reasonable character limits with validation or handle overflow gracefully.
- **Fix**: Add `maxLength` attributes to inputs/textareas with appropriate limits (e.g., 500 for messages, 100 for names, 2000 for FAQ answers). Show character count near the limit.

#### ED-03: 20+ FAQ Items
- **Severity**: Minor
- **Current behavior**: The list field editor (`ListFieldEditor.tsx`) allows unlimited items. With 20+ FAQ items, the context panel becomes very long. The preview also becomes excessively tall.
- **Expected behavior**: Either cap the number of items or provide pagination/collapse for long lists.
- **Fix**: Add a configurable `maxItems` to the list field config. Show a warning when approaching the limit.

### 4.2 Offline Behavior / Network Failures

#### ED-04: No Offline Detection
- **Severity**: Critical
- **Current behavior**: The app uses localStorage for data persistence (client-side store), so basic editing works offline. However, image uploads (`lib/storage.ts`) and AI generation (`lib/ai.ts`) require network access. There is no offline detection or indicator.
- **Expected behavior**: When offline, show an indicator. Disable features that require network (AI generation, image upload). Queue changes for sync when online.
- **Fix**: Add `navigator.onLine` check and `online`/`offline` event listeners. Show a toast/banner when offline. Disable AI and upload buttons with explanatory tooltip.

#### ED-05: Auto-Save is Synchronous localStorage Write
- **Severity**: Minor
- **Current behavior**: `useAutoSave.ts:35-39` calls `updateInvitationContent` and `setInvitationVisibility` synchronously. These are localStorage writes which are synchronous and cannot fail under normal conditions. However, localStorage has a ~5MB limit per origin. If the store grows too large (many invitations with large content), writes will throw `QuotaExceededError`.
- **Expected behavior**: Handle `QuotaExceededError` gracefully.
- **Fix**: Wrap localStorage writes in try/catch. If quota exceeded, show warning to user and suggest deleting old invitations.

### 4.3 Concurrent Browser Tabs

#### ED-06: No Cross-Tab Synchronization
- **Severity**: Major
- **Current behavior**: Two tabs editing the same invitation will both read/write to `dm-store-v1` in localStorage. The last tab to auto-save wins, silently overwriting changes from the other tab. No `storage` event listener to detect external changes.
- **Expected behavior**: Either prevent concurrent editing (show "editing in another tab" warning) or synchronize changes.
- **Fix**: Listen for `storage` events on `dm-store-v1`. When detected, compare versions. If version conflict, show a "Changes from another tab detected. Reload?" prompt. Alternatively, use `BroadcastChannel` API for tab-to-tab communication.

### 4.4 Browser Compatibility

#### ED-07: CSS `backdrop-filter` Performance on Low-End Devices
- **Severity**: Minor
- **Current behavior**: `backdrop-filter: blur()` is used on `.dm-preview-toolbar` (styles.css:829), `.blush-pill-row` (styles.css:410), MobileBottomSheet backdrop (line 380), and AI drawer backdrop. On low-end Android devices, this causes visible jank.
- **Expected behavior**: Disable blur on mobile or low-end devices.
- **Fix**: As recommended in EDITOR_IMPROVEMENT_PLAN.md, wrap `backdrop-filter` in `@media (min-width: 768px)` with `@supports`.

#### ED-08: visualViewport API Not Available in All Browsers
- **Severity**: Minor
- **Current behavior**: `MobileBottomSheet.tsx:82` uses `window.visualViewport` for keyboard detection. The code properly checks `if (typeof window === "undefined" || !window.visualViewport) return` which handles the fallback case.
- **Assessment**: Properly handled. No fix needed.

### 4.5 Slow Network / Large Images

#### ED-09: No Image Size/Type Validation
- **Severity**: Major
- **Current behavior**: `handleImageUpload` in `$invitationId.tsx:324-331` calls `uploadImage(file)` without checking file size or type. A user could upload a 50MB raw photo, causing long upload times and potential storage issues.
- **Expected behavior**: Validate file size (e.g., max 10MB) and type (JPEG, PNG, WebP only) before upload. Show progress indicator for large files.
- **Fix**: Add client-side validation in the `handleImageUpload` function. Check `file.size` and `file.type` before calling `uploadImage`. Show error for invalid files.

#### ED-10: No Upload Progress Indicator
- **Severity**: Minor
- **Current behavior**: `ImageUploadField` shows an uploading state (`isUploading`), but there's no progress percentage. For large files on slow connections, users see only a spinner with no progress feedback.
- **Expected behavior**: Show upload progress percentage or a determinate progress bar.
- **Fix**: Use `XMLHttpRequest` or `fetch` with progress events to report upload percentage.

---

## 5. Error Handling Audit

### 5.1 Failed Saves

#### EH-01: Auto-Save Failure is Silent
- **Severity**: Critical
- **Current behavior**: `useAutoSave.ts:32-40` calls `updateInvitationContent` and `setInvitationVisibility` without try/catch. If localStorage is full or corrupted, the save will throw, and the `setSaveStatus("saved")` on line 39 will never execute. The interval will keep trying and failing every 30 seconds. The user sees "Unsaved changes" indefinitely without understanding why.
- **Expected behavior**: Catch save errors, display a user-friendly error message, and suggest actions (e.g., "Unable to save. Please copy your changes and refresh the page.").
- **Fix**: Wrap save logic in try/catch. On failure, set a new save status like "error" and display a persistent error banner.

### 5.2 Network Errors During Auto-Save

#### EH-02: N/A for localStorage Auto-Save
- **Assessment**: Since auto-save uses localStorage (not network), network errors don't apply to auto-save itself. However, the `beforeunload` handler (line 49-58) correctly warns users about unsaved changes.

### 5.3 Image Upload Failures

#### EH-03: Image Upload Error Not Surfaced to User
- **Severity**: Critical
- **Current behavior**: `handleImageUpload` in `$invitationId.tsx:324-331` has no error handling. If `uploadImage(file)` throws (network error, server error, invalid file), the error propagates to the error boundary. The `finally` block clears `uploadingField`, but the user never sees what went wrong.
- **Expected behavior**: Show an error message inline below the image upload field explaining the failure.
- **Fix**: Add try/catch in `handleImageUpload`. On error, set an error state specific to the upload field and display it in `ImageUploadField`.

### 5.4 Invalid/Duplicate Slugs

#### EH-04: No Slug Validation
- **Severity**: Major
- **Current behavior**: The slug dialog (`$invitationId.tsx:735-744`) accepts any text. The `handleSlugConfirm` on line 343-348 passes it to `publishInvitation`. There appears to be no validation for: empty slugs, slugs with special characters, slugs that collide with existing invitations, or slugs with profanity/reserved words.
- **Expected behavior**: Validate slug format (lowercase, alphanumeric + hyphens), check uniqueness, show inline error if invalid.
- **Fix**: Add slug validation in `handleSlugConfirm`: check format with regex, check uniqueness against existing invitations in store, show error state in the slug dialog.

### 5.5 Expired Sessions

#### EH-05: No Session Expiry Handling in Editor
- **Severity**: Critical
- **Current behavior**: The editor route (`$invitationId.tsx:308-311`) checks `if (!user) return <Navigate to="/auth/login" />` on initial render. But if the session expires mid-editing (JWT timeout), the user continues working without any warning. When auto-save runs, it writes to localStorage successfully (no auth needed for localStorage), but the user's identity context may be stale.
- **Expected behavior**: Periodically verify session validity. If expired, show a re-authentication prompt without losing current work.
- **Fix**: Add a session validation interval (e.g., every 5 minutes) that checks if the JWT is still valid. If expired, show a non-blocking modal: "Your session has expired. Please log in again to continue saving." Include a "Log In" button that opens login in a modal/popup without navigating away from the editor.

### 5.6 AI Generation Failures

#### EH-06: AI Error Display is Adequate
- **Severity**: N/A (adequate)
- **Current behavior**: `AiAssistantDrawer.tsx:144-148` displays errors with `<output aria-live="polite">` and the error text from the AI assistant hook. The `useAiAssistant` hook handles the "AI limit reached" case.
- **Assessment**: Error display is accessible and visible. The limit check works. However, consider adding retry logic for transient network errors.

#### EH-07: AI Generation During Network Outage
- **Severity**: Major
- **Current behavior**: If the network is down during AI generation, the error will be a generic network error message. No specific handling for offline state.
- **Expected behavior**: Check network status before initiating AI generation. Show "You're offline. AI generation requires an internet connection."
- **Fix**: Check `navigator.onLine` before calling `aiAssistant.generate()`. Show a specific offline error message.

---

## 6. Prioritized Recommendations

### P0 - Critical (Fix Immediately)

| # | Finding | WCAG | Effort | Files |
|---|---------|------|--------|-------|
| 1 | C-01: Completion ring color-only indicators | 1.4.1 | S | `styles.css`, `MobileSectionNav.tsx`, `SectionPillBar.tsx` |
| 2 | C-04: Eternal Elegance gold (#C9A962) on white fails contrast | 1.4.3 | XS | `styles.css` (`.eternal-kicker` color) |
| 3 | C-05: Garden Romance gold (#D4AF37) on ivory fails contrast | 1.4.3 | XS | `GardenRomanceInvitation.tsx` inline styles |
| 4 | C-06: Blush Romance peach (#FFB7B2) text fails contrast | 1.4.3 | XS | `styles.css` (`.blush-tagline` color) |
| 5 | EH-01: Auto-save failure is silent | N/A | S | `hooks/useAutoSave.ts` |
| 6 | EH-03: Image upload error not surfaced | N/A | S | `$invitationId.tsx`, `ImageUploadField.tsx` |
| 7 | EH-05: No session expiry handling in editor | N/A | M | `$invitationId.tsx`, `lib/session.ts` |
| 8 | ED-04: No offline detection | N/A | S | New hook: `useOnlineStatus.ts` |

### P1 - Major (Fix Before Next Release)

| # | Finding | WCAG | Effort | Files |
|---|---------|------|--------|-------|
| 9 | C-02: Consent checkbox 18x18px touch target | 2.5.8 | XS | `styles.css` (`.blush-consent`, `.eternal-consent`) |
| 10 | SR-01: EditorPreviewFrame missing accessible label | 4.1.2 | XS | `EditorPreviewFrame.tsx` |
| 11 | SR-03: Inline edit overlay ARIA roles (verify) | 4.1.2 | XS | `InlineEditOverlay.tsx` |
| 12 | K-04: SectionPillBar missing keyboard navigation | 2.1.1 | M | Merge into unified `SectionNav.tsx` |
| 13 | ED-06: No cross-tab synchronization | N/A | M | `lib/store.ts` |
| 14 | ED-09: No image size/type validation | N/A | S | `$invitationId.tsx` |
| 15 | EH-04: No slug validation | N/A | S | `$invitationId.tsx` |
| 16 | EH-07: AI generation during network outage | N/A | XS | `$invitationId.tsx` |
| 17 | FL-03: Editor fields missing `required` attribute | 1.3.1 | XS | `FieldRenderer.tsx` |
| 18 | ED-01: 500+ guests performance | N/A | M | Dashboard component, store |
| 19 | No unit tests for editor hooks | N/A | L | New test files in `src/` |
| 20 | No E2E test for full creation flow | N/A | M | New test file |
| 21 | No E2E tests for multi-template RSVP | N/A | S | `invite.spec.ts` |
| 22 | SR-04: Dashboard delete uses window.confirm() | N/A | S | Dashboard component |

### P2 - Minor (Fix When Convenient)

| # | Finding | WCAG | Effort | Files |
|---|---------|------|--------|-------|
| 23 | F-02: MobileBottomSheet focus restore race | 2.4.3 | XS | `MobileBottomSheet.tsx` |
| 24 | F-03: ContextPanelHeader AI button 36x36px | 2.5.8 | XS | `ContextPanelHeader.tsx` |
| 25 | F-04: FieldRenderer AI button 32x32px | 2.5.8 | XS | `FieldRenderer.tsx` |
| 26 | SR-05: Template sections using `<p>` for headings | 1.3.1 | S | All 4 template components |
| 27 | ED-02: No character limits on inputs | N/A | S | `FieldRenderer.tsx`, template configs |
| 28 | ED-03: Unlimited FAQ items | N/A | XS | List field config |
| 29 | ED-05: localStorage QuotaExceededError | N/A | XS | `useAutoSave.ts` |
| 30 | ED-07: backdrop-filter jank on mobile | N/A | XS | `styles.css` |
| 31 | ED-10: No upload progress indicator | N/A | S | `ImageUploadField.tsx` |
| 32 | C-03: Love at Dusk placeholder contrast | 1.4.3 | XS | Template CSS |
| 33 | RM-02: Verify Garden Romance reduced motion | 2.3.3 | XS | Already compliant, verify only |

---

## Appendix A: Test Environment Recommendations

### Device Testing Matrix

| Device | Viewport | Engine | Priority | Current Coverage |
|--------|----------|--------|----------|-----------------|
| iPhone SE | 375x667 | WebKit | P0 | editor-responsive only |
| iPhone 14 Pro | 390x844 | WebKit | P0 | editor-mobile tests use this |
| Samsung Galaxy S21 | 360x800 | Chromium | P0 | No coverage |
| iPad Mini | 768x1024 | WebKit | P1 | editor-responsive (iPad Portrait) |
| iPad Pro 11" | 834x1194 | WebKit | P1 | No coverage |
| Desktop 1280px | 1280x800 | Chromium | P0 | No coverage (has 1440, 1920) |

### Performance Benchmarks to Add

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Editor LCP | < 2s on 4G | `page.evaluate(() => performance.getEntriesByType('largest-contentful-paint'))` |
| Field input latency | < 50ms | Performance marks around `handleFieldChange` |
| Section switch time | < 200ms | Time between tab click and `[role="tabpanel"]` visible |
| Auto-save execution | < 100ms | Measure `saveNow()` in `useAutoSave` |
| Store hydration time | < 500ms | Time from `DOMContentLoaded` to `__dmStoreHydrated` |

### Automated Accessibility CI Pipeline

1. **axe-core in E2E**: Already present (`helpers/accessibility.ts`). Expand to cover all routes and states.
2. **Lighthouse CI**: Add `lighthouse ci` to CI pipeline targeting Accessibility score > 95.
3. **Color contrast checker**: Add automated contrast ratio verification for all template color combinations.
4. **ARIA validator**: Use `jest-axe` in unit tests for component-level accessibility testing.

---

## Appendix B: Correlation with EDITOR_IMPROVEMENT_PLAN.md

| This Audit Finding | Improvement Plan Item | Status |
|--------------------|----------------------|--------|
| C-01: Color-only completion indicators | Phase 2, 4.1: Replace with checkmark icons | Planned |
| K-04: SectionPillBar keyboard nav | Phase 2, 4.1: Merge into unified SectionNav | Planned |
| F-03: AI button size | Phase 1, 3.2: Touch targets audit | Listed as "already correct" but code shows 36px |
| C-06: Blush peach contrast | Not addressed | New finding |
| C-04/C-05: Template gold contrast | Not addressed | New finding |
| EH-01: Silent auto-save failure | Not addressed | New finding |
| ED-06: Cross-tab sync | Not addressed | New finding |
| SR-01: Preview frame label | Not addressed | New finding |
| FL-03: Missing required attribute | Not addressed | New finding |
