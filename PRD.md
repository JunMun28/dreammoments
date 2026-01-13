# PRD.md — DreamMoments Feature Requirements

> **Design Reference:** See `requirements.md` Section 14 for UI/UX guidelines (glassmorphism, motion, typography-led design)

```json
{
  "project": "DreamMoments",
  "description": "Wedding invitation builder + RSVP management + Photo sharing platform",
  "techStack": [
    "TanStack Start",
    "React 19",
    "Neon PostgreSQL",
    "Neon Auth",
    "Drizzle ORM",
    "Tailwind CSS"
  ],
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
      "passes": true
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
      "passes": true
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
      "description": "Couple login via Google OAuth (Neon Auth)",
      "stepsToVerify": [
        "Click 'Sign in with Google' button",
        "Google OAuth popup or redirect opens",
        "User authorizes DreamMoments app",
        "Successfully authenticated and redirected to dashboard/builder",
        "User record created/synced in neon_auth schema"
      ],
      "tasks": [
        {
          "id": "AUTH-001-T1",
          "task": "Enable Neon Auth in Neon Console and configure Google OAuth provider",
          "done": false
        },
        {
          "id": "AUTH-001-T2",
          "task": "Install and configure @neondatabase/auth SDK",
          "done": true
        },
        {
          "id": "AUTH-001-T3",
          "task": "Create login page with Google OAuth button using Neon Auth UI or custom",
          "done": true
        },
        {
          "id": "AUTH-001-T4",

          "task": "Set up OAuth callback route to handle Neon Auth response",
          "done": false
        },
        {
          "id": "AUTH-001-T5",
          "task": "Sync neon_auth.users to local users table on first login (optional)",
          "done": true
        },
        {
          "id": "AUTH-001-T6",
          "task": "Remove deprecated login_codes table and custom auth code",
          "done": true
        }
      ],
      "passes": false
    },
    {
      "id": "AUTH-002",
      "category": "Authentication",
      "phase": "mvp",
      "description": "Session management via Neon Auth",
      "stepsToVerify": [
        "Login successfully via Google OAuth",
        "Close browser and reopen",
        "Navigate to app - user remains authenticated",
        "Session managed by Neon Auth (neon_auth.sessions)"
      ],
      "tasks": [
        {
          "id": "AUTH-002-T1",
          "task": "Configure Neon Auth session settings in Console/SDK",
          "done": false
        },
        {
          "id": "AUTH-002-T2",
          "task": "Create useSession hook or context to access current user",
          "done": true
        },
        {
          "id": "AUTH-002-T3",
          "task": "Create protected route wrapper/middleware using Neon Auth session",
          "done": true
        },
        {
          "id": "AUTH-002-T4",
          "task": "Remove deprecated custom sessions table (Neon Auth manages this)",
          "done": true
        }
      ],
      "passes": false
    },
    {
      "id": "AUTH-003",
      "category": "Authentication",
      "phase": "mvp",
      "description": "Logout functionality via Neon Auth",
      "stepsToVerify": [
        "While authenticated, click logout",
        "Neon Auth session is invalidated",
        "Redirected to home page",
        "Protected routes are no longer accessible"
      ],
      "tasks": [
        {
          "id": "AUTH-003-T1",
          "task": "Implement logout button calling Neon Auth signOut()",
          "done": true
        },
        {
          "id": "AUTH-003-T2",
          "task": "Clear local state/context on logout",
          "done": true
        },
        {
          "id": "AUTH-003-T3",
          "task": "Redirect to home page after logout",
          "done": true
        }
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
      "tasks": [
        {
          "id": "BLDR-001-T1",
          "task": "Create invitations DB table with couple info fields",
          "done": true
        },
        {
          "id": "BLDR-001-T2",
          "task": "Build basic info form with partner names inputs",
          "done": true
        },
        {
          "id": "BLDR-001-T3",
          "task": "Add date picker component (shadcn calendar)",
          "done": true
        },
        {
          "id": "BLDR-001-T4",
          "task": "Add time picker component",
          "done": true
        },
        {
          "id": "BLDR-001-T5",
          "task": "Add venue name and address fields",
          "done": true
        },
        {
          "id": "BLDR-001-T6",
          "task": "Implement autosave with debounce on field changes",
          "done": true
        },
        {
          "id": "BLDR-001-T7",
          "task": "Wire form state to preview component via context/props",
          "done": true
        }
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
      "tasks": [
        {
          "id": "BLDR-002-T1",
          "task": "Create schedule_blocks DB table (invitationId, title, time, description, order)",
          "done": true
        },
        {
          "id": "BLDR-002-T2",
          "task": "Build schedule block list component with add button",
          "done": true
        },
        {
          "id": "BLDR-002-T3",
          "task": "Create block editor form (title, time picker, description)",
          "done": true
        },
        {
          "id": "BLDR-002-T4",
          "task": "Implement drag-and-drop reordering (or arrow buttons)",
          "done": true
        },
        {
          "id": "BLDR-002-T5",
          "task": "Add delete block with confirmation",
          "done": true
        },
        {
          "id": "BLDR-002-T6",
          "task": "Render schedule blocks in preview component",
          "done": true
        }
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
      "tasks": [
        {
          "id": "BLDR-003-T1",
          "task": "Add notes JSON field to invitations table (or separate notes table)",
          "done": true
        },
        {
          "id": "BLDR-003-T2",
          "task": "Build notes list component with add/edit/delete",
          "done": true
        },
        {
          "id": "BLDR-003-T3",
          "task": "Create note editor (title + description or single text field)",
          "done": true
        },
        {
          "id": "BLDR-003-T4",
          "task": "Implement reordering for notes",
          "done": true
        },
        {
          "id": "BLDR-003-T5",
          "task": "Render notes section in preview component",
          "done": true
        }
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
      "tasks": [
        {
          "id": "BLDR-004-T1",
          "task": "Add accentColor field to invitations table",
          "done": true
        },
        {
          "id": "BLDR-004-T2",
          "task": "Create color picker component with preset swatches",
          "done": true
        },
        {
          "id": "BLDR-004-T3",
          "task": "Add custom hex input option",
          "done": true
        },
        {
          "id": "BLDR-004-T4",
          "task": "Apply accent color via CSS custom properties in preview",
          "done": true
        },
        {
          "id": "BLDR-004-T5",
          "task": "Persist color selection on change",
          "done": true
        }
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
      "tasks": [
        {
          "id": "BLDR-005-T1",
          "task": "Define font pairing presets (3-5 options with Google Fonts)",
          "done": true
        },
        {
          "id": "BLDR-005-T2",
          "task": "Add fontPairing field to invitations table",
          "done": true
        },
        {
          "id": "BLDR-005-T3",
          "task": "Create font selector dropdown with preview text",
          "done": true
        },
        {
          "id": "BLDR-005-T4",
          "task": "Dynamically load selected Google Fonts",
          "done": true
        },
        {
          "id": "BLDR-005-T5",
          "task": "Apply fonts via CSS custom properties in preview",
          "done": true
        }
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
      "tasks": [
        {
          "id": "BLDR-006-T1",
          "task": "Add heroImageUrl field to invitations table",
          "done": true
        },
        {
          "id": "BLDR-006-T2",
          "task": "Create file input with drag-drop zone",
          "done": true
        },
        {
          "id": "BLDR-006-T3",
          "task": "Client-side image resize/compress before upload",
          "done": true
        },
        {
          "id": "BLDR-006-T4",
          "task": "Implement server function to handle upload (store in R2 or local)",
          "done": true
        },
        {
          "id": "BLDR-006-T5",
          "task": "Display upload progress indicator",
          "done": true
        },
        {
          "id": "BLDR-006-T6",
          "task": "Show hero image in preview with replace option",
          "done": true
        }
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
      "tasks": [
        {
          "id": "BLDR-007-T1",
          "task": "Create InvitationPreview component that renders full invitation",
          "done": true
        },
        {
          "id": "BLDR-007-T2",
          "task": "Wire preview to builder form state (React context or props)",
          "done": true
        },
        {
          "id": "BLDR-007-T3",
          "task": "Add mobile/desktop viewport toggle button",
          "done": true
        },
        {
          "id": "BLDR-007-T4",
          "task": "Style preview container with responsive iframe or width constraints",
          "done": true
        },
        {
          "id": "BLDR-007-T5",
          "task": "Ensure preview updates on every form change without flicker",
          "done": true
        }
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
