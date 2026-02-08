# DreamMoments UX Designer Report

**Date**: February 2026
**Scope**: Comprehensive user experience analysis across all user flows
**Codebase Version**: Commit 58ac25e (main branch)

---

## Executive Summary

DreamMoments has a strong visual identity and a well-structured editor experience for desktop users. The split-screen editor with live preview, section pill navigation, inline editing, and AI assistant drawer form a cohesive editing paradigm. However, several friction points threaten the PRD's 5-minute target for signup-to-publish.

**Key findings**:

1. **Landing-to-editor flow is broken for production users** -- the `/editor/new` route creates a demo user rather than routing through auth, and there is no proper "Use This Template" CTA linked to the auth flow from the landing page.
2. **Mobile editing is functional but complex** -- the triple-layer interaction (preview + pill nav + bottom sheet with all sections) requires many taps to reach the right field.
3. **The RSVP guest flow is solid** but lacks confirmation feedback beyond a text string, and guests cannot update their RSVP after submission.
4. **The dashboard delivers core features** but has no onboarding guidance, no empty-state illustrations, and no progressive disclosure for power features like CSV import.
5. **Form validation is minimal** -- validation only fires on blur for required fields, with no inline guidance or field-level help text.

The 10 highest-impact improvements are detailed at the end of this report.

---

## 1. User Flow Analysis

### 1.1 New User -- Create Invitation (PRD Section 5.1)

**Intended flow** (from PRD):
Landing Page -> Click "Use This Template" -> Auth -> Editor (Hero auto-focused) -> Edit section-by-section -> Preview -> Publish -> Share

**Actual implementation flow**:

| Step | PRD Intent | Actual Code | Gap |
|------|-----------|-------------|-----|
| 1. Landing | Showcase 3 templates with "Use This Template" CTA | `src/routes/index.tsx` shows 3 templates as cards that link to `/invite/$slug` (sample view), not to the editor | **Critical gap**: CTA does not lead to editor |
| 2. Template CTA | Goes to auth, then editor | Template cards link to `/invite/{templateId}-sample`. The sample page shows a header "Create your own" button that links to `/editor/new?template={id}` | Indirect path: 2 clicks instead of 1 |
| 3. Auth gate | Sign up with Google or Email | `/editor/new` bypasses auth entirely -- `ensureDemoUserAndInvitation()` creates a demo user without login | **Critical gap**: No auth gate in production path |
| 4. Editor load | Auto-focused on Hero section | Editor loads with `template.sections[0]` as active section, which is typically "hero" | Works as intended |
| 5. Section editing | Scroll preview, form follows | Scroll-spy (`usePreviewScroll`) syncs active section with preview scroll position; form panel updates | Works as intended |
| 6. Preview | Full-screen preview with mobile toggle | Preview mode renders full invitation in a dialog overlay. No mobile preview toggle (layout is hardcoded to "web") | **Gap**: Mobile preview toggle missing |
| 7. Publish | Upgrade prompt, slug setup, share | Publish triggers upgrade dialog (free users) or slug dialog (premium users). "Continue Free" randomizes slug. | Works, but flow is confusing -- "Share" button in preview actually publishes |
| 8. Share | Modal with link/WhatsApp/QR | ShareModal provides copy link, WhatsApp, QR code download | Works as intended |

**Friction points**:
- F1: The primary CTA path from landing is: Landing -> Template sample view -> "Create your own" -> `/editor/new` (bypasses auth). This is 3 clicks minimum, not the 1-click intent from the PRD.
- F2: No template selection step exists in the proper editor flow. The template is set via URL param `?template=` on `/editor/new`.
- F3: The Header component's "Start Free Trial" button hardcodes `template: "love-at-dusk"` -- users who want a different template must go through the showcase.
- F4: After publish, there is no celebratory moment or clear "you're done" confirmation.

### 1.2 Guest -- View & RSVP (PRD Section 5.2)

**Intended flow**: Receive link -> View animated invitation -> RSVP -> Confirmation -> Return visits

**Actual implementation** (`src/routes/invite/$slug.tsx`):

| Step | PRD Intent | Actual Code | Gap |
|------|-----------|-------------|-----|
| 1. View invitation | Scroll through animated sections | `InvitationRenderer` renders the template with content and hidden sections | Works well |
| 2. RSVP form | Fill form (name, attendance, dietary, message) | RSVP form is embedded in template sections; `handleRsvpSubmit` calls `submitRsvp` | Works |
| 3. Confirmation | Confirmation message | `rsvpStatus` state displays "RSVP received. Thank you!" as a text string | **Gap**: No visual confirmation, no animation, no confetti |
| 4. Return visits | Can revisit and update RSVP | No RSVP update mechanism exists | **Gap**: No way to update RSVP |

**Friction points**:
- F5: RSVP confirmation is just a text string -- no visual feedback, no success animation.
- F6: Guests cannot update their RSVP after initial submission. The PRD mentions "Update RSVP if needed (via email link)" but this is not implemented.
- F7: No floating RSVP button as mentioned in PRD ("Click floating RSVP button"). Guest must scroll to find the RSVP section.
- F8: Rate limiting on RSVP (`submitRsvp` can throw) displays "RSVP limit reached" -- this error message is confusing and gives no actionable guidance.
- F9: View tracking calls `trackInvitationView` on mount but does not deduplicate effectively (uses `navigator.userAgent` + `document.referrer`, not a stable visitor hash from localStorage like the RSVP flow does).

### 1.3 Couple -- Manage RSVPs (PRD Section 5.3)

**Intended flow**: Login -> Dashboard -> Select invitation -> View RSVP stats -> Manage guest list -> Export

**Actual implementation** (`src/routes/dashboard/index.tsx` + `src/routes/dashboard/$invitationId/index.tsx`):

| Step | PRD Intent | Actual Code | Gap |
|------|-----------|-------------|-----|
| 1. Dashboard list | View all invitations with status | Grid of invitation cards with template name, title, status, quick actions (Edit/Preview/Share/Delete) | Works |
| 2. Invitation detail | RSVP overview with stats | 5-stat cards (Invited, Responded, Total Guests, Attending, Pending) + guest table | Works well |
| 3. Guest management | Filters, search, dietary summary | Filter buttons (All/Attending/Not Attending/Pending), search input, dietary summary panel, add guest form | Works |
| 4. Export | CSV export | `exportGuestsCsv` function, download button | Works |
| 5. Import | CSV import with column mapping | File input with column mapper (name, email, relationship) | Premium-gated, works |

**Friction points**:
- F10: Dashboard list has no invitation thumbnail or visual preview -- cards are text-only, making it hard to distinguish between invitations.
- F11: Delete uses `window.confirm()` -- no custom modal, breaks design consistency.
- F12: The invitation detail page URL (`/dashboard/$invitationId`) has no breadcrumb or clear back navigation.
- F13: Analytics chart is a basic SVG scatter plot with no labels, tooltips, or meaningful visualization.
- F14: Filter buttons do not visually indicate which filter is active (no selected state styling).
- F15: Settings panel allows slug changes on blur without validation feedback -- no "saved" confirmation, no slug availability check.

---

## 2. Editor UX Deep-Dive

### 2.1 Desktop Editor Layout

The desktop editor uses a well-structured `EditorLayout` with:
- **Toolbar** (sticky top): Back, title, undo/redo, save status, preview, publish
- **Preview pane** (left ~65%): Live template rendering with inline edit triggers
- **Context panel** (right ~35%): Section pill bar + field form for active section

**Strengths**:
- Section pill bar with completion indicators provides clear progress tracking
- `usePreviewScroll` syncs preview scrolling with context panel section
- Panel collapse/expand with keyboard shortcuts (`[` and `]`)
- Undo/redo with 20-action history
- Auto-save every 30 seconds with `beforeunload` protection
- `SaveStatusBadge` provides clear save state feedback

**Weaknesses**:
- W1: Preview scroll sync is one-directional (preview scroll updates form); scrolling/navigating forms does not scroll the preview on desktop.
- W2: The preview pane has `overflow-hidden` which prevents direct scrolling within it when nested in the grid layout. The actual scrolling happens inside the `InvitationRenderer`.
- W3: Field labels are rendered from section IDs with minimal formatting (`capitalize first letter`). Labels like "partnerOneName" become "PartnerOneName" if not handled by field config labels.
- W4: No visual indicator of which section is currently visible in the preview pane (no highlight ring or border on the active section in the preview).
- W5: The `previewLayout` variable is hardcoded to `"web"` (`const previewLayout: PreviewLayout = "web"`), so the mobile preview toggle mentioned in PRD is non-functional.

### 2.2 Section Navigation

**Desktop**: `SectionPillBar` renders horizontal pills with completion dots
**Mobile/Tablet**: `MobileSectionNav` renders a scrollable tab strip with prev/next arrow buttons

Both implement proper ARIA `tablist`/`tab` patterns with keyboard navigation (Arrow keys, Home, End).

**Issues**:
- W6: Section pills show the section ID as the label (e.g., "hero", "announcement") rather than human-friendly names. The `ContextPanelHeader` capitalizes the first letter but does not convert to display names (e.g., "Couple Story" instead of "story").
- W7: Completion ring dots are tiny and may be hard to distinguish at a glance.

### 2.3 Inline Editing

`InlineEditOverlay` provides two modes:
- **Desktop**: Positioned popover anchored to the clicked element with arrow indicator
- **Mobile**: Fixed bottom input bar with backdrop

**Strengths**:
- Focus trap, escape-to-close, pointer-outside-to-close
- Multiline detection based on content length
- Focus restoration on close

**Issues**:
- W8: The inline edit popover does not track element position after initial render (scroll listener re-reads the original rect, not the current position). This means if the user scrolls the preview, the popover stays at the old position.
- W9: No visual highlight on the element being edited in the preview -- the user cannot easily see which text they are modifying.
- W10: Inline edit only handles text fields. No inline editing for dates, toggles, images, or list items.

### 2.4 AI Assistant

`AiAssistantDrawer` renders as a right-side drawer on desktop and a `MobileBottomSheet` on mobile.

**Strengths**:
- Clear task type selector pills (Schedule, FAQ, Story, Tagline, Translate, Style)
- Prompt input with placeholder guidance
- Loading state with spinner
- Result preview via `AiSuggestionCard` with "Apply to Invitation" action
- Remaining generations counter
- Cannot close while generating (prevents data loss)

**Issues**:
- W11: No prompt suggestions or examples for each task type. A new user seeing "Describe what you want..." has no guidance on what to type.
- W12: "Apply to Invitation" replaces content without showing a diff or allowing selective application.
- W13: No "Regenerate" button -- user must click "Generate" again. The PRD specifically calls for an "Apply or Regenerate" flow.
- W14: AI error display is a simple text `<output>` element with no retry guidance.
- W15: When the AI panel opens on mobile, the editor bottom sheet closes (`setMobileEditorOpen(false)`), but there is no clear way to return to editing without closing the AI panel first.

### 2.5 Auto-Save

`useAutoSave` fires every 30 seconds, matches PRD. It uses `beforeunload` to warn about unsaved changes.

**Issues**:
- W16: Auto-save is synchronous (`updateInvitationContent` writes to localStorage store). If the operation were async (real API), there is no error handling or retry logic.
- W17: The `SaveStatusBadge` shows "saving" and immediately "saved" since the operation is synchronous. With a real API, the intermediate state would need proper handling.
- W18: No manual save trigger is exposed to the user (the Cmd+S shortcut handler is empty: `/* auto-save handles this; force-save could trigger manual save */`).

---

## 3. Mobile UX Assessment

### 3.1 Layout Handling

The editor detects mobile (`max-width: 767px`), tablet (`768px-1023px`), tablet landscape, and mobile landscape via `useMediaQuery`.

- **Mobile/Tablet**: Full-screen preview with sticky toolbar and bottom pill nav. Bottom sheet for editing.
- **Desktop**: Split-screen grid layout.

**Strengths**:
- `100dvh` used correctly for mobile viewport
- Safe area insets respected (`env(safe-area-inset-top)`, `env(safe-area-inset-bottom)`)
- Keyboard-aware bottom sheet resizing via `visualViewport` API
- Drag-to-resize with velocity-based dismissal
- `isDirty` flag increases swipe threshold to prevent accidental dismissal of unsaved work

**Issues**:
- M1: The mobile bottom sheet has 3 snap points (30%, 60%, 95%) but no visual indication of which snap point is active.
- M2: Tapping a section in the preview opens the bottom sheet at 95% (full-screen editing), which fully obscures the preview. The PRD envisions "Tap section -> bottom sheet with section fields" at a more moderate height.
- M3: The `MobileAllSectionsPanel` renders ALL sections in a continuous scroll. This can be overwhelming -- the user sees every section's fields at once rather than the focused single-section view of the desktop `ContextPanel`.
- M4: No "Edit" or "Tap to edit" affordance on the mobile preview. The user must discover that tapping sections opens the editor.
- M5: Landscape mobile (`max-height: 500px`) is detected but not handled differently in the layout. The same portrait layout is used.
- M6: Mobile toolbar truncates the invitation title at `max-w-[40vw]`. For long titles, this cuts off important information.

### 3.2 Mobile Navigation

The `MobileSectionNav` with prev/next arrows and scrollable pills is well-implemented:
- Auto-scrolls active pill into view
- Arrow key navigation with wrap-around
- Completion status indicators

**Issues**:
- M7: The pill bar disappears when the bottom sheet is open (`!bottomSheetOpen && pillBar`). The sheet has its own embedded pill bar, but the user loses spatial context during the transition.
- M8: No gesture navigation between sections (swipe left/right to change section).

### 3.3 Mobile Bottom Sheet

The `MobileBottomSheet` component is well-engineered with:
- Touch-based drag handle
- Snap point system
- Velocity-based dismissal
- Body scroll locking
- Focus trapping
- Reduced motion support
- Keyboard awareness

**Issues**:
- M9: The drag handle button has `touch-none` which disables all touch events, but drag handlers are on `onTouchStart/Move/End`. This works but may confuse touch event propagation.
- M10: No haptic feedback on snap point transitions.
- M11: The sheet's `max-h-[90vh]` height at the highest snap (95%) means it almost covers the full screen, but there is a visible gap at the top that does not provide useful context of the preview beneath.

---

## 4. State Management Review

### 4.1 Loading States

| Component | Loading Handling | Quality |
|-----------|-----------------|---------|
| Editor route | `FullPageLoader` with "Loading editor..." message | Adequate |
| Auth redirect | `Navigate` component (instant) | No loading state shown |
| Dashboard | Direct render from store (synchronous) | No skeleton/shimmer |
| Invitation view | Direct render from store | No skeleton/shimmer |
| Image upload | `uploadingField` state tracks which field is uploading | Good |
| AI generation | `generating` boolean with spinner in button | Good |

**Gaps**:
- S1: No skeleton loading states anywhere. Since state comes from localStorage, this is not currently an issue, but migrating to a real API would expose blank screens.
- S2: `FullPageLoader` is used for both "loading" and "creating demo user" states, which are conceptually different.

### 4.2 Empty States

| Component | Empty State | Quality |
|-----------|-------------|---------|
| Dashboard (no invitations) | "No Invitations Yet" card with "Create Invitation" CTA | Good, but no illustration |
| Guest table (no guests) | Table renders with empty tbody | **Bad**: No empty state message |
| Dietary summary (no data) | "No dietary notes yet." text | Adequate |
| Analytics (no views) | SVG chart renders with no data points | **Bad**: Empty chart with no message |
| Search results (no match) | Table renders with empty tbody | **Bad**: No "no results" message |

**Gaps**:
- S3: Guest table has no empty state -- an empty table body is confusing.
- S4: Analytics chart with zero data renders an empty SVG rectangle.
- S5: Search with no results does not show a "no guests found" message.

### 4.3 Error States

| Component | Error Handling | Quality |
|-----------|---------------|---------|
| Login form | `error` state with `<output aria-live="polite">` | Good |
| Signup form | Same as login | Good |
| Editor 404 | "Invitation not found." text | Minimal but functional |
| Dashboard 403 | "403 - Not authorized." text | Minimal |
| RSVP error | "RSVP limit reached. Please try again later." | Confusing message |
| AI generation error | Error text below generate button | Adequate |
| Field validation | Left border highlight with error text | Good visual treatment |

**Gaps**:
- S6: No global error boundary. An unhandled error in any component crashes the entire page.
- S7: 404 and 403 pages are plain text with no navigation back or helpful links.
- S8: No network error handling (relevant when migrating from localStorage to API).

---

## 5. Friction Points Inventory

| ID | Description | Severity | Flow | Category |
|----|------------|----------|------|----------|
| F1 | Landing CTA does not lead directly to editor; requires 3 clicks | **Critical** | Create | Navigation |
| F2 | No template selection step in the editor flow | **High** | Create | Navigation |
| F3 | Header "Start Free Trial" hardcodes one template | **Medium** | Create | Navigation |
| F4 | No celebratory confirmation after publishing | **Medium** | Create | Feedback |
| F5 | RSVP confirmation is plain text, no visual feedback | **High** | RSVP | Feedback |
| F6 | Guests cannot update RSVP after submission | **High** | RSVP | Functionality |
| F7 | No floating RSVP button for quick access | **Medium** | RSVP | Navigation |
| F8 | "RSVP limit reached" error message is confusing | **Low** | RSVP | Messaging |
| F9 | View tracking not properly deduplicated | **Low** | RSVP | Analytics |
| F10 | Dashboard cards have no visual preview/thumbnail | **Medium** | Manage | Visual |
| F11 | Delete uses browser `confirm()` instead of custom modal | **Low** | Manage | Consistency |
| F12 | No breadcrumb on invitation detail page | **Low** | Manage | Navigation |
| F13 | Analytics chart is a bare SVG with no labels | **Medium** | Manage | Data viz |
| F14 | Filter buttons have no active/selected visual state | **Medium** | Manage | Feedback |
| F15 | Slug change has no validation or save confirmation | **Medium** | Manage | Feedback |
| W1 | Form navigation does not scroll preview (desktop) | **Medium** | Edit | Sync |
| W5 | Mobile preview toggle non-functional (hardcoded "web") | **High** | Edit | Functionality |
| W6 | Section pills show raw IDs instead of display names | **Medium** | Edit | Labeling |
| W8 | Inline edit popover drifts on scroll | **Medium** | Edit | Positioning |
| W9 | No visual highlight on element being inline-edited | **Medium** | Edit | Feedback |
| W11 | AI prompt has no suggestions or examples | **High** | Edit | Guidance |
| W12 | AI apply replaces content without diff preview | **Medium** | Edit | Control |
| W13 | No "Regenerate" button for AI results | **Medium** | Edit | Workflow |
| W18 | Cmd+S does nothing (save shortcut is empty) | **Low** | Edit | Shortcuts |
| M2 | Mobile section tap opens sheet at 95%, obscuring preview | **Medium** | Edit/Mobile | Layout |
| M3 | All sections shown at once on mobile (overwhelming) | **High** | Edit/Mobile | Information |
| M4 | No "tap to edit" affordance on mobile preview | **High** | Edit/Mobile | Discoverability |
| S3 | Guest table has no empty state | **Medium** | Manage | Empty state |
| S4 | Analytics renders empty chart with no data | **Medium** | Manage | Empty state |
| S6 | No global error boundary | **High** | All | Resilience |

---

## 6. Top 10 UX Improvements

### 1. Fix the Landing-to-Editor CTA Flow (Critical)

**Problem**: The primary conversion path (Landing -> Template -> Editor) requires 3 clicks and bypasses authentication entirely.

**Solution**:
- Add a prominent "Use This Template" button overlay on each template card in the Showcase section
- Clicking the button navigates to `/auth/signup?redirect=/editor/new?template={templateId}` (for new users) or directly to `/editor/new?template={templateId}` (for logged-in users)
- Remove the demo user bypass from `/editor/new` in production
- Add proper auth guard to the editor route

**Wireframe description**: Each template card in the Showcase grid gets a semi-transparent overlay on hover/tap containing a centered "Use This Template" pill button with the template name below it. The card itself no longer links to the sample view.

### 2. Add Onboarding Guide for First-Time Editor Users (High)

**Problem**: New users land in the editor with no guidance on what to do first. The 5-minute target requires zero learning curve.

**Solution**:
- Detect first-time editor visit (no prior invitations in store)
- Show a lightweight coach-mark tour with 4 steps:
  1. "Start with your names and date" (points to Hero section fields)
  2. "Navigate sections here" (points to section pill bar)
  3. "Use AI to write content" (points to sparkle button)
  4. "Preview and publish when ready" (points to toolbar buttons)
- Allow dismissal at any step; remember dismissal state

**Wireframe description**: A floating tooltip with a pointed arrow, step counter (1/4), text instruction, and "Next" / "Skip" buttons. Semi-transparent backdrop highlights the target element.

### 3. Implement Floating RSVP Button for Guest View (High)

**Problem**: Guests must scroll through the entire invitation to find the RSVP section. Mobile users (70%+ of traffic per PRD metrics) may abandon before reaching it.

**Solution**:
- Add a fixed-position "RSVP" pill button at the bottom-right of the guest view
- Button uses `scrollIntoView` to smoothly scroll to the RSVP section
- Button auto-hides when the RSVP section is in viewport (using IntersectionObserver)
- Animate entrance with a subtle slide-up after 2 seconds of viewing

**Wireframe description**: A pill-shaped button with wedding-ring icon and "RSVP" text, positioned at `bottom: 24px; right: 24px`, with the template's accent color as background. Fades in after 2 seconds, fades out when RSVP section enters viewport.

### 4. Add RSVP Confirmation Animation and Update Capability (High)

**Problem**: After submitting RSVP, guests see only "RSVP received. Thank you!" text. They also cannot update their response.

**Solution**:
- Replace text confirmation with an animated success card: checkmark animation, couple's names, event date, and a "We'll see you there!" (or "We'll miss you") message
- Store RSVP guest ID in localStorage
- On return visits, pre-fill the RSVP form with previous response and allow updates
- Add "Update your RSVP" link in the confirmation card

**Wireframe description**: The RSVP form slides up to reveal a success card with: animated checkmark circle, "Thank you, [name]!" heading, brief confirmation text based on attendance status, and a muted "Change your response" link at the bottom.

### 5. Improve Mobile Editor with Focused Section View (High)

**Problem**: The `MobileAllSectionsPanel` shows all sections' fields in a continuous scroll, which is overwhelming and defeats the purpose of section-based navigation.

**Solution**:
- Default the mobile bottom sheet to showing only the active section (like desktop `ContextPanel`)
- Add a "View All Sections" toggle at the top of the sheet for users who want to scroll through everything
- When navigating via the embedded pill bar, scroll to that section within the sheet (current behavior) but collapse other sections
- Add "tap to edit" visual indicators on the preview (subtle edit icons on editable text elements)

**Wireframe description**: The bottom sheet header shows the embedded section pill bar. Below it, only the active section's fields are shown. A small "Show all sections" text link at the top-right of the fields area toggles to the full scrollable view. On the preview, small pencil-circle icons appear next to editable text when the user taps the screen.

### 6. Add AI Prompt Suggestions and Regenerate Flow (High)

**Problem**: AI assistant provides no guidance on what to prompt, and there is no regenerate button.

**Solution**:
- Add 2-3 example prompt chips below the prompt textarea for each task type:
  - Schedule: "Chinese wedding banquet with tea ceremony" / "Garden ceremony, 150 guests"
  - FAQ: "Outdoor venue, formal dress code" / "Hotel ballroom, halal catering"
  - Story: "Met at university, 3 years together" / "High school sweethearts"
- Add a "Regenerate" button below the result card (alongside "Apply to Invitation")
- Show a compact diff view highlighting what changed when applying AI content

**Wireframe description**: Below the prompt textarea, 2-3 pill chips with example prompts. Tapping a chip fills the textarea. After generation, the result card shows with two buttons: "Apply to Invitation" (primary) and "Regenerate" (secondary/outline). Between result and apply, a collapsible "See changes" section shows before/after text diffs.

### 7. Add Dashboard Visual Previews and Improved Empty States (Medium)

**Problem**: Dashboard invitation cards are text-only; empty states throughout the app are bare.

**Solution**:
- Add template thumbnail/color swatch to each invitation card on the dashboard
- Replace empty guest table with "No guests have RSVP'd yet. Share your invitation to start collecting responses." with share CTA
- Add empty state for search results: "No guests match '[search term]'"
- Improve analytics empty state: "Views and analytics will appear once your invitation is published and shared."

**Wireframe description**: Dashboard invitation card gets a small colored rectangle (using template accent color) on the left edge, and the template name styled as a colored badge. Empty state areas show a centered illustration placeholder (simple line art), heading, description, and optional CTA button.

### 8. Implement Functional Mobile Preview Toggle (Medium)

**Problem**: The `previewLayout` is hardcoded to `"web"`, so users cannot preview how their invitation looks on mobile devices.

**Solution**:
- Restore the `LayoutToggle` component in the editor toolbar (it exists but is not used)
- Store preview layout in editor state
- When "mobile" is selected, apply `max-w-[390px] mx-auto` to the preview frame (already implemented in `EditorPreviewFrame`)
- On actual mobile devices, hide the toggle (they are already seeing mobile view)

**Wireframe description**: A small toggle button group in the toolbar with laptop and phone icons. Desktop view shows full-width preview; mobile view shows a phone-width preview centered in the pane with a subtle device frame border.

### 9. Add Publish Confirmation Celebration (Medium)

**Problem**: After publishing, the user is redirected to the dashboard with `?share=true` parameter but no celebratory feedback.

**Solution**:
- After successful publish, show a full-screen celebration overlay for 3 seconds:
  - Animated confetti/sparkle effect
  - "Your invitation is live!" heading
  - The invitation URL displayed prominently
  - "Share Now" and "View Dashboard" buttons
- Auto-open the ShareModal after the celebration dismisses

**Wireframe description**: A centered card overlay on a semi-transparent backdrop with: sparkle animation around the border, "Your invitation is live!" heading in the template's accent font, the URL in a copy-able pill, and two buttons at the bottom.

### 10. Improve Filter and Navigation Feedback Throughout (Medium)

**Problem**: Multiple interactions lack visual feedback: active filters, slug saves, section transitions.

**Solution**:
- Add active/selected state styling to dashboard RSVP filter buttons (filled background for active filter)
- Add toast/snackbar for successful slug save, CSV export, guest add, and clipboard copy
- Add smooth scroll animation when navigating between sections via pill bar (currently jumps)
- Replace `window.confirm()` for delete with a custom confirmation modal matching the design system

**Wireframe description**: Active filter button uses accent-strong background (same style as active section pill). A toast notification appears at bottom-center: pill-shaped, accent border, icon + message, auto-dismisses after 3 seconds. Delete confirmation modal uses the same card style as the upgrade dialog.

---

## 7. Recommended User Journey Map Improvements

### Current Journey (with friction)

```
Landing ----[3 clicks]----> Sample View ----> /editor/new (demo bypass) ----> Editor
                                                                               |
                                                    No onboarding             |
                                                    No mobile preview         |
                                                    AI has no guidance        |
                                                                               |
                                             Publish ----> Dashboard (flat redirect)
                                                                               |
                                                    No celebration            |
                                                    No visual cards           |
```

### Recommended Journey (with improvements)

```
Landing ----[1 click "Use This Template"]----> Auth (if needed) ----> Editor
                                                                       |
                                                 Onboarding tour (4 steps)
                                                 Auto-focused hero section
                                                 AI suggestions ready
                                                                       |
                                          Edit sections (mobile-optimized)
                                          AI with prompt examples
                                          Mobile/web preview toggle
                                                                       |
                                          Preview ----> Publish
                                                         |
                                                  Celebration overlay
                                                  Share modal auto-open
                                                         |
                                                  Dashboard with visual cards
                                                  RSVP management with empty states
```

### Guest Journey Improvement

```
Current:  Link ----> Scroll entire invitation ----> Find RSVP ----> Submit ----> Text confirmation

Improved: Link ----> Scroll invitation ----> Floating RSVP button ----> Submit ----> Animated confirmation
                                                                                      |
                                                                                "Change response" link
                                                                                (stores ID in localStorage)
```

---

## 8. Additional Observations

### Accessibility Wins Already in Place
- Skip-to-content link in root layout
- `aria-live="polite"` on error messages and save status
- Focus traps in all dialogs (MobileBottomSheet, AiAssistantDrawer, InlineEditOverlay, preview mode)
- Focus restoration on dialog close
- `role="tablist"` / `role="tab"` on section navigation
- `role="switch"` on visibility toggles
- `prefers-reduced-motion` respected in landing animations and bottom sheet transitions
- Minimum 44px touch targets on interactive elements

### Template System Strengths
- Configuration-driven templates with shared `InvitationRenderer`
- Section visibility toggles allow customization without code changes
- 4 templates with distinct visual identities
- Sample content pre-fill gives immediate context

### Design System Consistency
- CSS custom properties (`--dm-*`) used consistently
- `cn()` utility for conditional class merging
- Consistent button styles: rounded-full with uppercase tracking
- Consistent spacing with Tailwind utilities

---

*End of UX Designer Report*
