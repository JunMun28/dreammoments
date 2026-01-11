# PRD.md — DreamMoments Feature Requirements

> **Design Reference:** See `requirements.md` Section 14 for UI/UX guidelines (glassmorphism, motion, typography-led design)

```json
{
  "project": "DreamMoments",
  "description": "Wedding invitation builder + RSVP management + Photo sharing platform",
  "techStack": ["TanStack Start", "React 19", "Neon PostgreSQL", "Drizzle ORM", "Tailwind CSS"],
  "features": [
    {
      "id": "TMPL-001",
      "category": "Template System",
      "phase": "mvp",
      "description": "Template gallery browsing without requiring login",
      "stepsToVerify": [
        "Navigate to home page as unauthenticated user",
        "Template gallery is visible with multiple template options",
        "Each template shows a preview thumbnail and name",
        "Templates can be browsed without any login prompt"
      ],
      "passes": false
    },
    {
      "id": "TMPL-002",
      "category": "Template System",
      "phase": "mvp",
      "description": "Template preview with sample wedding data",
      "stepsToVerify": [
        "Click on any template in the gallery",
        "Full template preview loads with placeholder couple names, date, and venue",
        "Preview shows all sections (header, schedule, RSVP area)",
        "Preview is responsive on mobile and desktop"
      ],
      "passes": false
    },
    {
      "id": "TMPL-003",
      "category": "Template System",
      "phase": "mvp",
      "description": "Template selection persists through authentication flow",
      "stepsToVerify": [
        "Select a template while unauthenticated",
        "Initiate login flow",
        "Complete authentication",
        "Selected template is preserved and user lands in builder with that template"
      ],
      "passes": false
    },
    {
      "id": "AUTH-001",
      "category": "Authentication",
      "phase": "mvp",
      "description": "Couple login via email magic code",
      "stepsToVerify": [
        "Click login button",
        "Enter valid email address",
        "Receive email with login code (via Resend)",
        "Enter code on verification screen",
        "Successfully authenticated and redirected to dashboard/builder"
      ],
      "passes": false
    },
    {
      "id": "AUTH-002",
      "category": "Authentication",
      "phase": "mvp",
      "description": "Session management with persistent login",
      "stepsToVerify": [
        "Login successfully",
        "Close browser and reopen",
        "Navigate to app - user remains authenticated",
        "Session cookie is secure and httpOnly"
      ],
      "passes": false
    },
    {
      "id": "AUTH-003",
      "category": "Authentication",
      "phase": "mvp",
      "description": "Logout functionality",
      "stepsToVerify": [
        "While authenticated, click logout",
        "Session is cleared",
        "Redirected to home page",
        "Protected routes are no longer accessible"
      ],
      "passes": false
    },
    {
      "id": "BLDR-001",
      "category": "Invitation Builder",
      "phase": "mvp",
      "description": "Edit couple names, wedding date/time, and venue location",
      "stepsToVerify": [
        "Open builder with selected template",
        "Edit partner 1 and partner 2 names",
        "Set wedding date using date picker",
        "Set wedding time",
        "Enter venue name and address",
        "Changes reflect in live preview immediately"
      ],
      "passes": false
    },
    {
      "id": "BLDR-002",
      "category": "Invitation Builder",
      "phase": "mvp",
      "description": "Add and edit schedule blocks",
      "stepsToVerify": [
        "Add a new schedule block (e.g., Ceremony, Reception, Dinner)",
        "Set time for each block",
        "Set description/location for each block",
        "Reorder blocks via drag or arrows",
        "Delete a schedule block",
        "Schedule displays correctly in preview"
      ],
      "passes": false
    },
    {
      "id": "BLDR-003",
      "category": "Invitation Builder",
      "phase": "mvp",
      "description": "Notes/FAQ section for dress code, kids policy, etc.",
      "stepsToVerify": [
        "Add a notes/FAQ section",
        "Enter custom text (e.g., 'Black tie optional', 'Adults only')",
        "Add multiple notes items",
        "Edit and delete individual notes",
        "Notes display in preview"
      ],
      "passes": false
    },
    {
      "id": "BLDR-004",
      "category": "Invitation Builder",
      "phase": "mvp",
      "description": "Theme accent color customization",
      "stepsToVerify": [
        "Open theme settings in builder",
        "Select from preset accent colors OR enter custom hex",
        "Preview updates with new accent color on buttons, links, accents",
        "Color is saved and persists on refresh"
      ],
      "passes": false
    },
    {
      "id": "BLDR-005",
      "category": "Invitation Builder",
      "phase": "mvp",
      "description": "Font selection from curated set",
      "stepsToVerify": [
        "Open font settings",
        "Choose from available font pairings (heading + body)",
        "Preview updates with selected fonts",
        "Font selection persists on save"
      ],
      "passes": false
    },
    {
      "id": "BLDR-006",
      "category": "Invitation Builder",
      "phase": "mvp",
      "description": "Hero image upload",
      "stepsToVerify": [
        "Click upload hero image",
        "Select image file (JPG, PNG, WebP)",
        "Image is uploaded and stored",
        "Hero image displays in preview",
        "Can replace existing hero image"
      ],
      "passes": false
    },
    {
      "id": "BLDR-007",
      "category": "Invitation Builder",
      "phase": "mvp",
      "description": "Live preview of invitation",
      "stepsToVerify": [
        "All builder changes reflect in preview in real-time",
        "Preview can be toggled between mobile and desktop views",
        "Preview shows accurate representation of final invitation"
      ],
      "passes": false
    },
    {
      "id": "GUEST-001",
      "category": "Guest Management",
      "phase": "mvp",
      "description": "CSV file upload for guest import",
      "stepsToVerify": [
        "Navigate to guest management section",
        "Click import CSV button",
        "Select CSV file with guest data",
        "File uploads successfully",
        "Shows parsing progress for large files"
      ],
      "passes": false
    },
    {
      "id": "GUEST-002",
      "category": "Guest Management",
      "phase": "mvp",
      "description": "CSV validation with error reporting",
      "stepsToVerify": [
        "Upload CSV with some invalid rows (missing names, invalid format)",
        "System displays validation errors with row numbers",
        "Valid rows are highlighted separately from invalid",
        "User can download error report or fix inline"
      ],
      "passes": false
    },
    {
      "id": "GUEST-003",
      "category": "Guest Management",
      "phase": "mvp",
      "description": "Guest list preview before import confirmation",
      "stepsToVerify": [
        "After CSV upload, preview table shows all parsed guests",
        "Preview includes name, group, contact info columns",
        "User can review before confirming import",
        "Cancel returns to previous state without importing"
      ],
      "passes": false
    },
    {
      "id": "GUEST-004",
      "category": "Guest Management",
      "phase": "mvp",
      "description": "Per-group guest organization",
      "stepsToVerify": [
        "Guests can be assigned to groups (e.g., Family, Friends, Colleagues)",
        "Groups can be created, renamed, and deleted",
        "Guest list can be filtered by group",
        "Each group gets its own RSVP link"
      ],
      "passes": false
    },
    {
      "id": "GUEST-005",
      "category": "Guest Management",
      "phase": "mvp",
      "description": "Manual guest list editing (add/edit/delete)",
      "stepsToVerify": [
        "Add a new guest manually with name and group",
        "Edit existing guest details",
        "Delete a guest with confirmation",
        "Changes reflect immediately in guest count"
      ],
      "passes": false
    },
    {
      "id": "RSVP-001",
      "category": "RSVP System",
      "phase": "mvp",
      "description": "Per-group RSVP link generation",
      "stepsToVerify": [
        "Each guest group has a unique RSVP link",
        "Link format is /rsvp#t=<GROUP_TOKEN>",
        "Token is securely generated and not guessable",
        "Link is accessible from guest management dashboard"
      ],
      "passes": false
    },
    {
      "id": "RSVP-002",
      "category": "RSVP System",
      "phase": "mvp",
      "description": "Token-based guest session (no login required)",
      "stepsToVerify": [
        "Guest opens RSVP link with valid token",
        "Token is exchanged for session cookie automatically",
        "Guest sees invitation header and RSVP form immediately",
        "No login or signup prompt shown to guest"
      ],
      "passes": false
    },
    {
      "id": "RSVP-003",
      "category": "RSVP System",
      "phase": "mvp",
      "description": "Multi-person RSVP form (guest + spouse/plus-ones)",
      "stepsToVerify": [
        "RSVP form allows guest to RSVP for themselves",
        "Option to add additional attendees (spouse, children, etc.)",
        "Each attendee can have individual meal preference if applicable",
        "Total headcount is calculated and displayed"
      ],
      "passes": false
    },
    {
      "id": "RSVP-004",
      "category": "RSVP System",
      "phase": "mvp",
      "description": "RSVP edit capability",
      "stepsToVerify": [
        "Guest who already RSVP'd can return to same link",
        "Previous responses are pre-filled",
        "Guest can modify their RSVP",
        "Updated response replaces previous one"
      ],
      "passes": false
    },
    {
      "id": "RSVP-005",
      "category": "RSVP System",
      "phase": "mvp",
      "description": "RSVP deadline display and enforcement",
      "stepsToVerify": [
        "Couple can set RSVP deadline in builder",
        "Deadline is displayed on RSVP page",
        "After deadline, form shows 'RSVP closed' message",
        "Couple can extend deadline if needed"
      ],
      "passes": false
    },
    {
      "id": "RSVP-006",
      "category": "RSVP System",
      "phase": "mvp",
      "description": "Copy RSVP link functionality",
      "stepsToVerify": [
        "Click copy link button next to any group",
        "Link is copied to clipboard",
        "Toast/feedback confirms copy success",
        "Copied link works when pasted in browser"
      ],
      "passes": false
    },
    {
      "id": "RSVP-007",
      "category": "RSVP System",
      "phase": "mvp",
      "description": "QR code generation for RSVP links",
      "stepsToVerify": [
        "Generate QR code for any group RSVP link",
        "QR code can be downloaded as PNG or SVG",
        "QR code scans correctly to the RSVP URL",
        "QR includes optional branding/styling"
      ],
      "passes": false
    },
    {
      "id": "DASH-001",
      "category": "Dashboard & Export",
      "phase": "mvp",
      "description": "RSVP status overview dashboard",
      "stepsToVerify": [
        "Dashboard shows total invited count",
        "Shows confirmed attending count",
        "Shows declined count",
        "Shows pending/not responded count",
        "Percentages or visual chart displayed"
      ],
      "passes": false
    },
    {
      "id": "DASH-002",
      "category": "Dashboard & Export",
      "phase": "mvp",
      "description": "Guest response tracking table",
      "stepsToVerify": [
        "Table lists all guests with their RSVP status",
        "Shows response date/time",
        "Shows number of attendees per response",
        "Shows any meal preferences or notes"
      ],
      "passes": false
    },
    {
      "id": "DASH-003",
      "category": "Dashboard & Export",
      "phase": "mvp",
      "description": "CSV export of RSVP responses",
      "stepsToVerify": [
        "Click export to CSV button",
        "CSV downloads with all RSVP data",
        "Includes guest name, group, status, attendee count, preferences",
        "CSV opens correctly in Excel/Google Sheets"
      ],
      "passes": false
    },
    {
      "id": "DASH-004",
      "category": "Dashboard & Export",
      "phase": "mvp",
      "description": "Filter and search RSVP responses",
      "stepsToVerify": [
        "Filter by RSVP status (attending, declined, pending)",
        "Filter by guest group",
        "Search by guest name",
        "Filters can be combined"
      ],
      "passes": false
    },
    {
      "id": "PHOTO-001",
      "category": "Photo Upload",
      "phase": "premium",
      "description": "Shared photo upload link generation",
      "stepsToVerify": [
        "Enable photo upload feature in settings",
        "Generate shared upload link (same for all guests)",
        "Link format allows immediate upload without login",
        "Link can be copied and shared"
      ],
      "passes": false
    },
    {
      "id": "PHOTO-002",
      "category": "Photo Upload",
      "phase": "premium",
      "description": "Client-side image compression before upload",
      "stepsToVerify": [
        "Guest selects photos to upload",
        "Images are compressed client-side to max 2048px width",
        "Output format is WebP",
        "Original quality is preserved reasonably",
        "Upload progress shows compressed size"
      ],
      "passes": false
    },
    {
      "id": "PHOTO-003",
      "category": "Photo Upload",
      "phase": "premium",
      "description": "Upload quota enforcement",
      "stepsToVerify": [
        "System enforces max 500 photos per wedding",
        "System enforces max 2GB total storage",
        "User sees remaining quota before upload",
        "Clear error when quota exceeded",
        "Individual file size limit enforced (5MB input)"
      ],
      "passes": false
    },
    {
      "id": "PHOTO-004",
      "category": "Photo Upload",
      "phase": "premium",
      "description": "Turnstile anti-abuse challenge",
      "stepsToVerify": [
        "First upload session triggers Turnstile challenge",
        "Challenge appears before upload begins",
        "Successful challenge allows uploads to proceed",
        "Failed challenge blocks upload with clear message"
      ],
      "passes": false
    },
    {
      "id": "PHOTO-005",
      "category": "Photo Upload",
      "phase": "premium",
      "description": "Photo moderation queue for couple review",
      "stepsToVerify": [
        "Uploaded photos enter pending/moderation state",
        "Couple sees moderation queue in dashboard",
        "Can approve or reject individual photos",
        "Bulk approve/reject option available",
        "Rejected photos are deleted"
      ],
      "passes": false
    },
    {
      "id": "PHOTO-006",
      "category": "Photo Upload",
      "phase": "premium",
      "description": "Upload link rotation for abuse control",
      "stepsToVerify": [
        "Couple can rotate/regenerate upload link",
        "Old link immediately stops working",
        "New link is generated and can be shared",
        "Existing approved photos are preserved"
      ],
      "passes": false
    },
    {
      "id": "GALLERY-001",
      "category": "Photo Gallery",
      "phase": "premium",
      "description": "Couple gallery view for managing photos",
      "stepsToVerify": [
        "Couple can view all uploaded photos in gallery",
        "Photos organized by upload date or custom order",
        "Can select and delete photos",
        "Photo count and storage used displayed"
      ],
      "passes": false
    },
    {
      "id": "GALLERY-002",
      "category": "Photo Gallery",
      "phase": "premium",
      "description": "Guest-visible gallery (optional toggle)",
      "stepsToVerify": [
        "Couple can enable public gallery for guests",
        "Guests can view approved photos via gallery link",
        "Gallery is read-only for guests",
        "Gallery can be disabled at any time"
      ],
      "passes": false
    },
    {
      "id": "GALLERY-003",
      "category": "Photo Gallery",
      "phase": "premium",
      "description": "Auto-delete pending photos after 30 days",
      "stepsToVerify": [
        "Photos in pending state for 30+ days are auto-deleted",
        "Couple is warned before auto-deletion (notification)",
        "Approved photos are never auto-deleted",
        "Storage quota is reclaimed after deletion"
      ],
      "passes": false
    },
    {
      "id": "PREM-001",
      "category": "Premium Features",
      "phase": "premium",
      "description": "Remove DreamMoments branding",
      "stepsToVerify": [
        "Premium users can toggle off branding",
        "Invitation and RSVP pages show no DreamMoments logo",
        "Footer branding is removed",
        "Setting persists across sessions"
      ],
      "passes": false
    },
    {
      "id": "PREM-002",
      "category": "Premium Features",
      "phase": "premium",
      "description": "Additional premium templates",
      "stepsToVerify": [
        "Premium templates are visible but locked for free users",
        "Premium users can access all templates",
        "Premium templates have distinct badge/label",
        "Template selection respects subscription status"
      ],
      "passes": false
    },
    {
      "id": "PREM-003",
      "category": "Premium Features",
      "phase": "premium",
      "description": "Multi-event RSVP support",
      "stepsToVerify": [
        "Couple can create multiple events (ceremony, reception, after-party)",
        "Each event can have separate RSVP",
        "Guests can RSVP to different events independently",
        "Dashboard shows per-event RSVP breakdown"
      ],
      "passes": false
    },
    {
      "id": "PREM-004",
      "category": "Premium Features",
      "phase": "premium",
      "description": "Notifications for new photos and RSVP reminders",
      "stepsToVerify": [
        "Couple receives email when new photos are uploaded",
        "Notification preferences can be configured",
        "RSVP reminder emails can be sent to pending guests",
        "Reminder respects deadline and doesn't send after"
      ],
      "passes": false
    },
    {
      "id": "OOS-001",
      "category": "Out of Scope",
      "phase": "future",
      "description": "Payment integration (Stripe)",
      "stepsToVerify": [
        "Stripe checkout for premium subscription",
        "Subscription management (upgrade, cancel)",
        "Payment history and invoices",
        "Webhook handling for subscription events"
      ],
      "passes": false
    },
    {
      "id": "OOS-002",
      "category": "Out of Scope",
      "phase": "future",
      "description": "Public searchable wedding pages",
      "stepsToVerify": [
        "Weddings can be made publicly discoverable",
        "Search by couple names or wedding date",
        "SEO-optimized public pages",
        "Privacy controls for public visibility"
      ],
      "passes": false
    }
  ]
}
```
