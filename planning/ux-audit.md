# DreamMoments UX Audit

**Auditor**: UX Designer Agent
**Date**: 2026-02-08
**Scope**: Editor, all user flows, mobile UX, information architecture, onboarding, micro-interactions
**Method**: Full source code review of 30+ files across routes, components, hooks, and templates

---

## Executive Summary

DreamMoments has a thoughtful, wedding-appropriate design language with strong foundations: a split-screen editor with context panel, section-based navigation with completion tracking, auto-save, undo/redo, keyboard shortcuts, and an AI assistant. The mobile experience uses a bottom sheet pattern with snap points and form scroll spy, which is sophisticated.

However, the current implementation has several critical UX gaps that will cause user friction and drop-off, particularly around the new-user onboarding flow, auto-save reliability perception, mobile editing discoverability, and the publish/share workflow. The editor route alone manages ~30 pieces of state across 10 hooks in a 767-line component, creating a complex user-facing experience that, while feature-rich, lacks clear guidance at key decision points.

**Overall UX Score**: 6.5/10 -- Solid foundation with meaningful gaps.

---

## 1. Editor UX

### 1.1 Split-Screen Layout (Desktop)

**Current Behavior**: Preview on the left (takes `1fr`), context panel on the right (fixed 380px or 40px collapsed). Pill bar sits inside the context panel column, above the scrollable fields.

| Issue | Severity | Details | Recommended Fix | Effort |
|-------|----------|---------|-----------------|--------|
| No visual cue that preview sections are clickable | Major | Users on desktop can click sections in the preview to navigate, but nothing indicates interactivity (no hover cursor change, no highlight overlay). The `onSectionSelect` handler exists but is invisible. | Add a subtle hover overlay on preview sections (e.g., a `cursor-pointer`, faint border/highlight, or a "Edit this section" tooltip on hover). | Small |
| Panel collapsed state loses all context | Minor | When collapsed to 40px, users see only a `ChevronLeft` icon. There is no indication of which section is active or what the save status is. | Show a vertical label of the active section name or a minimal progress indicator in the collapsed rail. | Small |
| No resize handle for the panel | Minor | Panel width is fixed at 380px. On wider screens (1440px+), users may want the preview to be larger. On 1024px screens, 380px is quite wide relative to the preview. | Consider a drag-to-resize handle, or at minimum, offer a "compact panel" option at ~280px for tablets. | Medium |
| `max-w-[1440px]` on the grid clips the layout | Minor | On ultra-wide monitors, large white gutters appear on both sides. The editor feels like it belongs in a narrower viewport. | Allow the layout to expand beyond 1440px for the preview area, keeping the panel at its fixed width. | Small |

### 1.2 Context Panel Pattern

**Current Behavior**: Shows a header with section name, visibility toggle, AI button, and completion %. Below that, scrollable fields rendered by `FieldRenderer`. Fields use `key={sectionId}` to re-mount on section change (which triggers a fade animation).

| Issue | Severity | Details | Recommended Fix | Effort |
|-------|----------|---------|-----------------|--------|
| Section label is just the ID with first letter capitalized | Major | `sectionConfig.id.replace(/^\w/, c => c.toUpperCase())` means users see "Hero", "Rsvp", "Faq" instead of human-readable labels like "Welcome Header", "Guest RSVP", "Frequently Asked Questions". | Use `sectionConfig.name` or a display label map instead of raw ID capitalization. The `SectionConfig` type has `id` and `type` but no display `name` field -- add one. | Small |
| Visibility toggle is very small (4x7 switch) | Minor | The `h-4 w-7` toggle with a `h-2.5 w-2.5` knob is tiny, especially next to the section title. Easy to miss or accidentally tap. | Increase to at least `h-5 w-9` with `h-3.5 w-3.5` knob for better touch target. The `min-height: 44px` touch target guideline is not met on the toggle itself (though the button wrapping it may help). | Small |
| No explanation of what hiding a section does | Major | New users may not understand that toggling visibility hides the section from the published invitation. There is no tooltip, helper text, or first-time explanation. | Add a tooltip or small helper text: "Hide this section from your published invitation". Consider a confirmation for hiding sections with content. | Small |
| Completion % is raw numeric | Minor | Showing "67%" is functional but not delightful. There is no visual progress bar or ring, just a number. | Replace with a small circular progress ring (the `dm-completion-ring` already exists in CSS on the pill bar; reuse it in the header). | Small |
| `role="tabpanel"` without associated `role="tab"` in parent | Minor | The scrollable fields div has `role="tabpanel"` but the pill bar above it in the desktop layout has `role="tablist"` with `role="tab"` buttons. The `aria-labelledby` connection between tab and tabpanel is missing. | Connect the tabpanel to its controlling tab via `aria-labelledby` and `id` attributes. | Small |

### 1.3 Inline Editing Flow

**Current Behavior**: Clicking text in the preview opens `InlineEditOverlay` -- a positioned popover on desktop, a bottom input bar on mobile. User edits in a textarea and clicks "Apply" or presses Enter.

| Issue | Severity | Details | Recommended Fix | Effort |
|-------|----------|---------|-----------------|--------|
| No visual indication that preview text is inline-editable | Critical | Users must guess they can click on text in the preview to edit it. There is no pencil icon, dashed underline, or hover state. The `onInlineEdit` handler is passed through but the template renderer gives no visual affordance. | Add a hover state to editable text elements (dashed underline, subtle highlight, or pencil icon) and a cursor change. This is the most impactful discoverability fix. | Medium |
| Inline edit loses position on scroll | Minor | The `InlineEditOverlay` captures `rect` from `getBoundingClientRect()` at open time but the scroll/resize handler just calls `setLiveRect(rect)` with the original rect -- it does not re-read from the DOM element. | Store a ref to the target element and re-call `getBoundingClientRect()` on scroll/resize, or reposition relative to the scroll container. | Medium |
| No character count or field constraints | Minor | The inline edit textarea has no maxlength, no character count, and no hint about expected content length. A tagline field and a full story paragraph use the same unconstrained textarea. | Show field-specific constraints (e.g., "Tagline: keep under 60 characters") from the `FieldConfig`. | Small |
| Saving with Enter only works for single-line fields | Minor | `isMultiline` is determined by `value.length > 60 || value.includes('\n')`, so a user typing a short value cannot use Enter to save if the existing value was long. Behavior is inconsistent. | Use the field type from `FieldConfig` to determine single-line vs. multi-line, not the value content. | Small |

### 1.4 Auto-Save Indicators

**Current Behavior**: `useAutoSave` runs every 30 seconds. Status is "saved", "saving", or "unsaved". On desktop, `SaveStatusBadge` shows in the toolbar. On mobile, a 1.5px dot (green/yellow/gray) appears in the compact toolbar. `beforeunload` fires for unsaved changes.

| Issue | Severity | Details | Recommended Fix | Effort |
|-------|----------|---------|-----------------|--------|
| 30-second save interval is too long | Major | Users can lose up to 30 seconds of work if they navigate away or close the tab between saves. The `beforeunload` dialog is the only protection. Modern editors (Google Docs, Notion) save within 1-3 seconds of changes. | Reduce to 2-3 seconds with debounce, or save on every field blur. The save operation writes to localStorage (via `useStore`), which is instant. | Small |
| Save is synchronous but pretends to be async | Minor | `saveNow()` sets "saving", calls `updateInvitationContent` (which is synchronous localStorage write), then immediately sets "saved". The "saving" state flashes for 0ms, providing no perceptible feedback. | Either remove the "saving" intermediate state (since it is instant) or add a minimum 500ms display time for the "saving" badge so users see feedback. | Small |
| Mobile save indicator is nearly invisible | Major | A `h-1.5 w-1.5` (6px) dot is the only save status on mobile. Users will not notice it, especially with the small toolbar. | Show a text label ("Saved" / "Saving...") or use a larger indicator. Consider a brief toast on save. | Small |
| No manual save button | Minor | `Cmd+S` triggers `onSave` but the handler is empty (`/* auto-save handles this; force-save could trigger manual save */`). Users who instinctively hit Cmd+S get no response. | Wire `onSave` to call `saveNow()` and show a confirmation toast. | Small |
| No save-on-blur for individual fields | Minor | Changes are only persisted on the 30s timer. If a user fills in 5 fields and closes the browser tab before the timer fires, and the beforeunload dialog is dismissed, all changes are lost. | Add `saveNow()` call on field blur in addition to the interval. | Small |

### 1.5 Section Navigation

**Current Behavior**: Desktop uses `SectionPillBar` (horizontally scrollable tabs). Mobile uses `MobileSectionNav` with prev/next arrows flanking a scrollable tab strip. Sections display completion rings.

| Issue | Severity | Details | Recommended Fix | Effort |
|-------|----------|---------|-----------------|--------|
| Section pills show raw IDs as labels | Major | `pillSections` maps `section.id` directly as the label: `label: s.id`. So pills show "hero", "rsvp", "faq" instead of "Welcome", "Guest RSVP", "FAQ". | Use human-readable section names. Add a `displayName` to `SectionConfig` or maintain a label map. | Small |
| Desktop `SectionPillBar` lacks keyboard navigation | Minor | Unlike `MobileSectionNav` which implements `ArrowLeft/Right/Home/End` keyboard handling, the desktop `SectionPillBar` has no `onKeyDown` handler and no `tabIndex` management. | Add the same `roving tabindex` pattern from `MobileSectionNav` to `SectionPillBar`. | Small |
| No "next section" CTA at the bottom of the context panel | Major | After completing fields in a section, there is no prompt to move to the next section. Users must manually click the next pill. This breaks the natural flow of top-to-bottom form completion. | Add a "Continue to [Next Section]" button at the bottom of each section's field list with a completion summary. | Medium |
| Completion ring semantics are unclear | Minor | The `dm-completion-ring` shows three states (empty/partial/full) but there is no legend explaining what the ring colors mean. First-time users will not understand the visual. | Add a tooltip on hover: "3 of 5 fields completed" or similar. | Small |

---

## 2. User Flows

### 2.1 New User Flow: Landing -> Sign Up -> Create -> Edit -> Publish -> Share

| Step | Current State | Issues | Severity |
|------|--------------|--------|----------|
| **Landing** | Beautiful hero with petal animations, template showcase, 5-step timeline, features section | No CTA button in the hero section. The only way to enter is via template links in the showcase. Missing a prominent "Get Started" or "Create Your Invitation" CTA above the fold. | Critical |
| **Sign Up** | Clean form with Google OAuth + email/password. Redirect support via query params. | No password strength indicator. No terms/privacy checkbox. No email verification step visible. After signup, user goes to `/dashboard` -- but there is no template selection step. | Major |
| **Template Selection** | Not a dedicated step. Users must go to `/editor/new?template=xxx` or click a template from the landing page showcase. | There is no `/templates` or template picker page. New users who sign up directly land on an empty dashboard with a "New Invitation" button that links to `/editor/new` -- but that route is not defined in the file-based routes (only `$invitationId` is). The new user flow appears broken. | Critical |
| **Editor** | Full-featured split-screen editor with all fields | No onboarding tour, no welcome message, no "getting started" guide. Users are dropped into a section-based editor with no context on how to use it. | Major |
| **Publish** | Free users: "Continue Free" (random slug) or "Upgrade". Premium: custom slug dialog. | The "Continue Free" button calls `publishInvitation(id, { randomize: true })` but does NOT update the status to "published" and does NOT navigate anywhere. The user is left on the editor with no confirmation. | Critical |
| **Share** | `handleShare` sets status to "published" and navigates to dashboard with `?share=true` query. But only the preview mode "Share" button triggers this. | The share flow from the publish dialog is disconnected. After clicking "Continue Free" in the upgrade dialog, the invitation is "published" (slug created) but the user has no share modal, no confirmation, no URL to copy. | Critical |

### 2.2 Guest Flow: View Invitation -> RSVP

| Step | Current State | Issues | Severity |
|------|--------------|--------|----------|
| **View** | `/invite/$slug` renders the invitation with template. Tracks view with `trackInvitationView`. OG meta tags for social sharing. | If the slug doesn't match any invitation, it falls back to a sample invitation silently. Guests may see the wrong content with no error message. | Major |
| **RSVP** | `handleRsvpSubmit` accepts name, attendance, guestCount, dietaryRequirements, message, email. Uses `dm-visitor` localStorage key for deduplication. | RSVP success/error is shown via `rsvpStatus` state, but there is no visible RSVP status display in the `InviteScreen` component -- the status string is set but never rendered in the JSX. The `rsvpStatus` is only passed implicitly through the template renderer. | Major |
| **RSVP Dedup** | Uses localStorage `dm-visitor` key, generated once per browser | Guests on different devices or clearing cookies can submit multiple RSVPs. There is no server-side dedup or edit-your-RSVP flow. | Minor |

### 2.3 Couple Flow: Manage RSVPs (Dashboard)

| Step | Current State | Issues | Severity |
|------|--------------|--------|----------|
| **Dashboard List** | Shows invitation cards with template name, title, status, views, RSVPs, updated date. Edit/Preview/Share/Delete actions. | Delete uses `window.confirm()` -- a jarring native dialog that breaks the elegant design language. No undo option. | Major |
| **Invitation Detail** | `/dashboard/$invitationId` shows stats, RSVP table, dietary summary, add guest form, analytics chart, settings. | The analytics chart is a simple SVG with circles. The `viewsByDay` data points are rendered at `cx={20 + index * 30}` which overflows at >6 data points. No axis labels. | Minor |
| **RSVP Filtering** | Filter pills + search input. URL query params sync. | Active filter pill has no visual distinction (same styling as inactive pills). Users cannot tell which filter is active. | Major |
| **Guest Import** | CSV upload with column mapping for premium users | The column mapping UX is bare: three `<select>` dropdowns with no preview of data. No validation, no error handling for malformed CSVs. The import button has no loading state. | Minor |

---

## 3. Mobile UX

### 3.1 Bottom Sheet Pattern

**Current Behavior**: `MobileBottomSheet` with snap points at [30%, 60%, 95%]. Drag handle at top. Touch gestures for resize and dismiss. Keyboard-aware (detects virtual keyboard via `visualViewport`). Dirty-state aware (higher dismiss thresholds when form has changes).

| Issue | Severity | Details | Recommended Fix | Effort |
|-------|----------|---------|-----------------|--------|
| Bottom sheet is not visible by default | Critical | On mobile, the editor loads with only the preview visible and a pill bar at the bottom. There is NO button or CTA to open the bottom sheet. The only way to open it is by tapping a section in the preview (`handleSectionSelectFromPreview`), but preview sections have no visible tap affordance. New mobile users will see a preview and have no idea how to edit. | Add a prominent "Edit" floating action button (FAB) or make the pill bar tappable to open the sheet. Alternatively, auto-open the sheet at the 30% snap point on first load. | Medium |
| Sheet drag handle is purely visual | Minor | The drag handle `<button>` has `aria-label="Drag to resize or dismiss"` but no mouse support -- only touch events. Desktop users in responsive mode cannot interact with it. | Add `onMouseDown/Move/Up` handlers for parity, or at minimum add pointer events. | Small |
| No haptic feedback on snap transitions | Minor | When the sheet snaps to a new position, there is no vibration or tactile feedback, which is standard in iOS/Android native bottom sheets. | Add `navigator.vibrate(10)` on snap change (where supported). | Small |
| Sheet content scrolling conflicts with drag gesture | Minor | The drag gesture is attached to the handle button only, which is correct. But if a user tries to scroll content near the top of the sheet, they may accidentally trigger a dismiss. The `isDirty` threshold helps but is not sufficient. | Consider adding scroll-aware drag: only allow dismiss gesture when content is scrolled to top. | Medium |

### 3.2 Mobile Section Navigation

**Current Behavior**: Two instances of `MobileSectionNav` -- one "external" (shown when bottom sheet is closed, at the bottom of the screen) and one "embedded" (inside the bottom sheet header). Prev/Next arrows + scrollable pill strip.

| Issue | Severity | Details | Recommended Fix | Effort |
|-------|----------|---------|-----------------|--------|
| Two navigation instances create confusion | Major | When the bottom sheet is open, the external nav disappears and the embedded nav appears. The transition is abrupt. Users lose spatial context of where they were. | Use a smooth transition: slide the external nav up into the sheet header position, or keep one persistent instance. | Medium |
| Section pills are small and hard to tap | Minor | Pills have `min-h-11` (44px height) which is good, but horizontal scrolling means only 2-3 pills are visible at once. Users must scroll to see all sections. | Consider a two-row grid on mobile for 6+ sections, or show section count indicators. | Medium |
| No "Edit" button on the external pill bar | Critical | The external pill bar (when sheet is closed) changes the active section in the preview but does NOT open the bottom sheet. Users must tap the preview itself. This is unintuitive -- a user tapping "Schedule" expects to see the schedule fields, not just scroll the preview. | Make tapping a pill on the external bar also open the bottom sheet to the corresponding section. | Small |

### 3.3 Mobile All-Sections Panel

**Current Behavior**: `MobileAllSectionsPanel` renders ALL sections in a single scrollable list inside the bottom sheet, with `ContextPanelHeader` for each section and all fields visible. `useFormScrollSpy` syncs the active section pill as the user scrolls.

| Issue | Severity | Details | Recommended Fix | Effort |
|-------|----------|---------|-----------------|--------|
| All sections rendered at once is overwhelming | Major | On a typical invitation with 8+ sections, the user sees a very long form with potentially 30+ fields. There is no progressive disclosure. | Consider collapsible accordion sections, or only render the active section with next/prev navigation. | Medium |
| No visual separation between sections | Minor | Each section has a `ContextPanelHeader` but no visual separator (border, spacing, or background change) between sections. They blend together. | Add a `border-b` or increased spacing (`py-6 mb-6`) between sections. | Small |
| The `h-32` spacer at the bottom is arbitrary | Minor | A fixed 128px spacer ensures the last section can scroll fully into view, but this may be too much or too little depending on content. | Use a dynamic spacer based on the viewport height minus the last section's natural height. | Small |

---

## 4. Pain Points & Drop-Off Analysis

### 4.1 Critical Drop-Off Points

1. **Landing page -> Signup**: No CTA button in the hero. Users must scroll to the template showcase and find the small template links. Estimated drop-off: 40-60% of new visitors.

2. **Signup -> First edit**: No template selection step. The dashboard shows an empty state with "Create Invitation" linking to `/editor/new` which likely 404s (no route defined for bare `/editor/new`). Estimated drop-off: 70%+ of new signups.

3. **Mobile editor entry**: No visible way to open the editing interface. Users see a preview with no edit button. Estimated drop-off: 80%+ of mobile users on first visit.

4. **Publish flow**: The "Continue Free" button publishes silently with no confirmation, no share URL, no next step. Users don't know their invitation is live. Estimated drop-off: 50%+ of users who reach this step.

### 4.2 Friction Points (Not Drop-Off, but Frustration)

1. **Section labels**: Raw IDs like "hero", "rsvp", "faq" require domain knowledge.
2. **No field help text**: Fields have labels but no descriptions, examples, or character guidance.
3. **No preview of what guests will see**: The preview is always in "editor" mode with section highlights. Users cannot see the actual guest experience without entering Preview mode.
4. **No undo confirmation**: Undo/redo silently swap content. No toast or visual feedback.

### 4.3 Delightful Moments

1. **Completion rings**: The per-section progress tracking is motivating.
2. **Inline editing**: Click-to-edit on the preview is elegant (when discoverable).
3. **AI assistant**: The drawer with task type pills and prompt input is well-designed.
4. **Auto-save with beforeunload**: Protects against accidental data loss.
5. **Keyboard shortcuts**: Power users get `Cmd+Z`, `Cmd+P`, `[`, `]`, `?` for help.
6. **Landing page animations**: Floating petals, parallax timeline, template hover effects create a premium feel.

---

## 5. Information Architecture

### 5.1 Section-Based Editing

**Assessment**: Section-based editing is the right pattern for wedding invitations, which have natural content sections (hero, schedule, story, RSVP, etc.). The pattern mirrors how users think about their invitation content.

| Issue | Severity | Details | Recommended Fix | Effort |
|-------|----------|---------|-----------------|--------|
| Section ordering is template-defined and fixed | Minor | Users cannot reorder sections. For a wedding where the story section is more important than the schedule, users are stuck with the template's order. | Add drag-to-reorder in the pill bar or a section order editor. | Large |
| No section grouping or categorization | Minor | All sections are treated equally. "Hero" (critical) and "Footer" (trivial) have the same visual weight. | Group sections into "Essential" (hero, schedule, RSVP) and "Optional" (story, gallery, FAQ). Show completion separately for each group. | Medium |
| FAQ section has no questions visible in the editor | Minor | The FAQ section likely has a `list` field type, but the `FieldRenderer` for lists delegates to `ListFieldEditor` which is a separate component. The UX of list editing (add/remove/reorder items) was not reviewed but the pattern is in place. | Ensure list editing has clear add/remove buttons, empty state, and reorder capability. | Medium |

### 5.2 Does the Context Panel Work?

**Assessment**: Yes, for desktop. The panel provides a focused editing surface for the active section while the preview shows the full invitation. The completion % and visibility toggle are useful.

**But**: The panel's value diminishes on mobile where it becomes a full-screen overlay (bottom sheet at 95%) that covers the preview entirely. On mobile, users alternate between "see preview" and "edit fields" -- they cannot do both simultaneously. This is an inherent limitation of mobile form factors and is handled adequately by the snap point system.

---

## 6. Onboarding

### 6.1 First-Time Experience

| Issue | Severity | Details | Recommended Fix | Effort |
|-------|----------|---------|-----------------|--------|
| No onboarding tour or tooltip hints | Critical | Users enter the editor with no guidance. The split-screen layout, section pills, AI button, inline editing, and context panel are all features that require discovery. | Add a 3-5 step onboarding walkthrough on first editor visit: (1) "This is your preview", (2) "Click sections here to edit", (3) "Use AI to generate content", (4) "Preview and publish when ready". Store `onboarding-complete` in localStorage. | Medium |
| No template preview before commitment | Major | Users choose a template from the landing page showcase (or not at all from the dashboard). There is no side-by-side template comparison, no "Try this template" flow. | Add a `/templates` page with all 4 templates, live previews, and "Use This Template" CTAs. | Medium |
| Sample data is helpful but not explained | Minor | `buildSampleContent()` pre-fills fields with sample data ("Sarah & Tom", "Sept 24, 2025"). This is good for showing what a filled invitation looks like, but users may not realize they need to replace this content. | Highlight sample-data fields with a different background color or "Sample" badge. Auto-clear on first edit. | Small |

### 6.2 Progressive Disclosure

| Issue | Severity | Details | Recommended Fix | Effort |
|-------|----------|---------|-----------------|--------|
| All features visible at once | Major | The editor shows undo/redo, preview, publish, AI, section pills, context panel, inline editing, and keyboard shortcuts all at once. This is overwhelming for new users. | Consider a "Simple" vs "Advanced" mode toggle. In simple mode: hide undo/redo, keyboard shortcuts, panel collapse, and AI. Surface them after the user has completed 50%+ of fields or after 3 sessions. | Large |
| AI assistant has no explanation | Minor | The sparkle icon opens the AI drawer, but there is no tooltip explaining what AI can do. The drawer itself is clear once opened. | Add tooltip: "Generate content with AI" on the sparkle button. | Small |

---

## 7. Micro-Interactions

### 7.1 Transitions & Feedback

| Issue | Severity | Details | Recommended Fix | Effort |
|-------|----------|---------|-----------------|--------|
| No feedback on field save | Minor | When a user types in a field and tabs away, there is no visual confirmation that the change was captured. The draft updates in memory but there is no micro-animation. | Add a brief green checkmark or subtle flash on the field border when a value changes. | Small |
| Preview scroll sync has no easing indication | Minor | When a user clicks a section pill, `scrollToSection` smoothly scrolls the preview. But the 600ms timeout for `isScrollingRef.current` is arbitrary and may not match the actual scroll animation duration. | Use `scrollend` event (supported in modern browsers) instead of a fixed timeout. | Small |
| Dialog animations are hardcoded 300ms | Minor | All overlays (preview, upgrade, slug, shortcuts, AI drawer, bottom sheet) use 300ms animations. This is consistent but does not respect the user's `prefers-reduced-motion` setting universally. The bottom sheet does check it, but the preview mode and inline edit overlays do not. | Add `prefers-reduced-motion` checks to all animated overlays. | Small |
| No loading state for AI generation | Minor | While `generating` is true, the button shows a spinner and "Generating..." text. But there is no skeleton or placeholder in the result area. Users see an empty space until the result appears. | Show a skeleton preview card while generating. | Small |

### 7.2 Loading & Empty States

| Issue | Severity | Details | Recommended Fix | Effort |
|-------|----------|---------|-----------------|--------|
| `FullPageLoader` shows on every editor mount | Minor | `isHydrated` state causes a flash of the loading spinner on every page load, even when data is in localStorage. | Use `useSyncExternalStore` or initialize `isHydrated` to `true` if running on the client. | Small |
| "Invitation not found" is a dead-end | Major | If the invitation ID is invalid, users see a plain text message with no navigation. | Show a styled error page with "Go to Dashboard" and "Create New Invitation" links, consistent with the error fallback pattern. | Small |
| Dashboard empty state is minimal | Minor | The empty state shows "No Invitations Yet" with a "Create Invitation" button. It does not show template previews or inspiration. | Show 2-3 template preview thumbnails in the empty state as inspiration, with "Start with this template" CTAs. | Medium |

---

## 8. Accessibility-Specific UX Issues

| Issue | Severity | Details | Recommended Fix | Effort |
|-------|----------|---------|-----------------|--------|
| `SectionPillBar` tabs lack `tabIndex` management | Major | The desktop pill bar does not implement roving tabindex. All tabs are tabbable (default `tabIndex`), which means keyboard users must tab through every section pill to get past them. | Implement `tabIndex={isActive ? 0 : -1}` and arrow key navigation, matching the mobile nav pattern. | Small |
| Upgrade dialog `role="dialog"` but no close button | Minor | The upgrade dialog has no close button or X icon. It can only be dismissed by clicking "Continue Free" or "Upgrade". | Add an X button or "Cancel" action. | Small |
| `ShareModal` has no `role="dialog"` or focus trap | Major | The share modal uses `className="dm-inline-edit"` for positioning but has no `role`, no `aria-modal`, no focus trap, and no Escape key handler. | Add `role="dialog"`, `aria-modal="true"`, `aria-label`, focus trap, and Escape handler -- matching the pattern used elsewhere. | Small |
| Color contrast for muted text | Minor | `text-dm-muted` is used extensively but the actual color value depends on the theme. On light backgrounds, muted text may fail WCAG AA contrast requirements. | Audit contrast ratios for all `--dm-muted` values across templates. | Medium |

---

## 9. Prioritized Recommendations

### P0 -- Critical (Fix before launch)

1. **Add a CTA button to the landing page hero** -- Users need a clear path to sign up. Add "Create Your Invitation" button with `Link to="/auth/signup"`.
2. **Build a template selection flow** -- Add `/templates` route or a template picker in the create invitation flow. The current path from dashboard "New Invitation" to editor is broken.
3. **Make mobile editing discoverable** -- Add a floating "Edit" button or auto-open the bottom sheet. Users MUST be able to find the editing interface without guessing.
4. **Fix the publish/share flow** -- After publishing, show the share modal with the invitation URL, copy button, and WhatsApp share. Do not silently publish.
5. **Add inline editing discoverability** -- Show hover states on editable preview text so users know they can click to edit.

### P1 -- Major (Fix in next sprint)

6. **Add human-readable section labels** -- Replace raw IDs with display names throughout.
7. **Reduce auto-save interval** -- 30 seconds to 2-3 seconds for localStorage writes.
8. **Add a first-time onboarding walkthrough** -- 3-5 steps covering the editor layout.
9. **Fix RSVP filter active state** -- Active filter pill needs visual distinction.
10. **Add "Continue to next section" CTA** -- Guide users through the editing flow.
11. **Fix mobile save status visibility** -- Replace 6px dot with readable text.
12. **Replace `window.confirm` in dashboard delete** -- Use a styled confirmation dialog.
13. **Add `role="dialog"` and focus trap to ShareModal**.

### P2 -- Minor (Polish)

14. Add tooltip to visibility toggle explaining what it does.
15. Wire Cmd+S to force save.
16. Add keyboard navigation to desktop `SectionPillBar`.
17. Add `prefers-reduced-motion` checks to all animated overlays.
18. Show skeleton during AI generation.
19. Improve "Invitation not found" with styled error page.
20. Add template previews to dashboard empty state.

---

## 10. Component Complexity Assessment

The editor route (`src/routes/editor/$invitationId.tsx`) at 767 lines with 10 hooks and ~30 state pieces is at the upper limit of maintainable complexity. While the hook extraction is well done (each hook is focused and testable), the route component itself still orchestrates too many concerns:

- **UI state**: `previewMode`, `panelCollapsed`, `upgradeOpen`, `slugDialogOpen`, `mobileEditorOpen`, `mobileSnapIndex`, `isHydrated`, `uploadingField`, `previewLayout`
- **Derived state**: `activeSectionConfig`, `pillSections`, `isLightTemplate`, `styleOverrides`
- **Refs**: 6 refs (`previewRef`, `formScrollRef`, `draftRef`, `visibilityRef`, `previewDialogRef`, `slugDialogRef`, `upgradeDialogRef`, `shortcutsDialogRef`)
- **Handlers**: 8 handler functions defined in the component body
- **JSX**: 4 inline dialog overlays rendered conditionally

**Recommendation**: Extract the 4 dialog overlays (preview, upgrade, slug, shortcuts) into separate components. This would reduce the route component to ~500 lines and make each dialog independently testable.

---

## Appendix: File-by-File Notes

| File | Lines | Key Observation |
|------|-------|-----------------|
| `$invitationId.tsx` | 767 | Core orchestrator. Well-structured hook usage but too many inline dialogs. |
| `EditorLayout.tsx` | 89 | Clean layout component. Good mobile/desktop split. |
| `ContextPanel.tsx` | 183 | Solid panel with proper ARIA. List field logic is complex (lines 103-128). |
| `ContextPanelHeader.tsx` | 74 | Small, focused. Missing `aria-labelledby` connection to tabpanel. |
| `EditorPreviewFrame.tsx` | 60 | Thin wrapper. No interactive affordances for editable areas. |
| `FieldRenderer.tsx` | 160 | Good field type switching. Missing help text, character counts. |
| `MobileBottomSheet.tsx` | 469 | Sophisticated. Good keyboard, a11y, and gesture handling. |
| `MobileSectionNav.tsx` | 186 | Good ARIA tab pattern with keyboard nav. |
| `MobileAllSectionsPanel.tsx` | 145 | Clean but renders all sections at once (performance concern for large forms). |
| `AiAssistantDrawer.tsx` | 272 | Well-designed dual mode (desktop drawer, mobile sheet). |
| `EditorToolbar.tsx` | 312 | Good mobile overflow menu with keyboard nav. |
| `InlineEditOverlay.tsx` | 350 | Complex positioning logic. Good mobile adaptation. |
| `useAutoSave.ts` | 68 | Simple but needs shorter interval. |
| `useEditorState.ts` | 139 | Clean undo/redo with 20-item history cap. |
| `useAiAssistant.ts` | 204 | Well-encapsulated AI state. Apply logic is hardcoded per section. |
| `useFormScrollSpy.ts` | 73 | Good IntersectionObserver usage. |
| `useInlineEdit.ts` | 60 | Clean state management for inline editing. |
| `useKeyboardShortcuts.ts` | 89 | Good text-input guard. Missing shortcuts for section navigation. |
| `useFocusTrap.ts` | 98 | Reusable, handles dynamic content. Good focus restore. |
| `dashboard/index.tsx` | 181 | Functional but basic. Delete uses window.confirm. |
| `dashboard/$invitationId/index.tsx` | 541 | Feature-rich but dense. Analytics chart is minimal. |
| `invite/$slug.tsx` | 193 | Good OG meta. Silent fallback to sample data is risky. |
| `index.tsx` (landing) | 623 | Beautiful animations. Missing hero CTA. |
| `auth/login.tsx` | 123 | Clean. No password visibility toggle. |
| `auth/signup.tsx` | 132 | Clean. No password strength, no terms checkbox. |
| `ShareModal.tsx` | 74 | Missing dialog role, focus trap, Escape handler. |
