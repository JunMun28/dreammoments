# PRD.md — Chinese Wedding Invitation Builder (Couple-First) + Guest RSVP + Shared Photo Upload Link (No Guest Login)


**Primary Goal:** Build a **couple-first** product that lets couples create a premium digital wedding card, import guests, and share:
1) a **RSVP link (guest can RSVP more than 1 person: spouse,etc.)** (guests open → RSVP immediately)  
2) an optional **single shared photo-upload link** (no guest login; same link for everyone)

**Architecture (Cost-Optimized):**
- **Cloudflare Worker (Hono)**: API + share routes + SPA static asset serving
- **Neon Serverless Postgres + Drizzle**: relational data
- **Cloudflare R2**: media (hero, gallery photos, OG, QR)
- **Resend**: couple login + guest OTP fallback (optional but recommended)
---

## 1) Product Summary (Revised)

### 1.1 Who this is for
This app targets **the couple** as the primary user/buyer.

- The public **Home** page is a couple-oriented onboarding entry, where they can select the template to try customized without the need to sign in first.
- Guests only land on functional pages via links the couple shares:
  - RSVP link → RSVP page (immediate action)
  - Photo upload link → Upload page (immediate action)

### 1.2 Core outcomes
**Couple can:**
- Choose a template (without login)
- Customize invitation content and theme (without login)
- Log in
- Import guests (CSV)
- Share RSVP links (per group)
- shared upload link during wedding ceremony
- Track RSVPs and export

**Guest can (without login):**
- Open RSVP link → RSVP immediately
- Open upload link → upload photos (same link for all guests)

---

## 2) UX / IA (No “Admin vs Guest” Selection)

### 2.1 Public (Couple-first) Home Page
**Goal:** convert couples with a premium feel (red primary color & offwhite background) and a crystal-clear “start building” flow.


## 3) Primary User Journeys (Revised)

### 3.1 Couple Journey (end-to-end)
1. **Template selection** + preview sample
2. Login 
3. **Customize** (theme + content + sections)
4. **Import guests** (CSV)
5. **Share**
   - Copy RSVP links per group (and/or export CSV of links)
   - (Optional premium) copy shared photo upload link
   - Download QR PNG/SVG for RSVP links and upload link
6. Track RSVPs, export CSV, manage photos/moderation (premium)

### 3.2 Guest RSVP Journey (no guest login)
**Link format (recommended, token-safe):**
- `https://<domain>/rsvp#t=<GROUP_TOKEN>`

Flow:
1. Guest opens link
2. Page auto-exchanges token → session cookie
3. Guest sees invitation header + RSVP form immediately
4. Submit RSVP (and edit if needed)

### 3.3 Guest Photo Upload Journey (no guest login; single shared link)

Flow:
1. Guest opens upload link
3. Upload photos (client-side compression)
4. Success screen + optional “upload more” action

**Anti-abuse UX (required):**
- Turnstile challenge on first upload session creation (or before first upload)
- Clear limits (max size, accepted formats)

---

## 4) Scope

### 4.1 MVP (Phase 1) — Must Ship
Couple:
- Template selection
- Login (email code)
- Invitation builder (theme + key content)
- CSV guest import + validation
- Generate per-group RSVP links + “copy link”
- RSVP dashboard + CSV export
- Basic photo gallery (optional for MVP; can be couple-uploaded only)

Guest:
- RSVP via direct link (no login)
- Token exchange → session cookie
- RSVP submit/edit
- RSVP deadline messaging

### 4.2 Premium (Phase 2) — Add-ons (shown in product, gated)
- **Shared photo upload link (no login)** + storage quotas + moderation queue
- Guest-visible gallery (optional)
- Remove branding / more templates
- Multi-event RSVP
- Notifications (new pending photos, RSVP reminders)

### 4.3 Out of Scope (MVP)
- Payments (Stripe) — can be Phase 2/3
- Public searchable wedding pages
---


## 10) Templates & Builder (New Requirement)

### 10.1 Template System
- Templates are curated “digital wedding card” layouts
- Each template defines:
  - layout structure
  - typography pairings
  - default motion style
  - section ordering

**MVP:** store template definitions as versioned code/config (not DB) to reduce complexity/cost.

### 10.2 Builder Capabilities (MVP)
Couple can edit:
- names, date/time, location
- schedule blocks (optional)
- notes/FAQs (dress code, kids, etc.)
- theme accent color
- fonts (limited set)
- hero image (upload to R2)

Premium toggles (Phase 2):
- enable shared photo upload link
- enable moderation
- enable additional templates / remove branding

---

## 11) Photo Pipeline (Revised for Shared Upload Link)

### 11.1 Upload Rules (Cost + abuse control)
- Client-side compress and resize:
  - full max width: 2048px
  - output: WebP
- Server validates:
  - max file size (e.g., 5MB input)
  - allowed content types
  - quota checks

### 11.2 Quotas & Retention (Premium Defaults)
- Max photos per wedding: 500
- Max total storage per wedding: 2GB
- Pending auto-delete after 30 days (if moderation enabled)
- Rotate upload link to stop abuse immediately

---

## 14) UI/UX Guidelines (World-Class Design System)

### 14.1 Visual Philosophy
**“Cinematic, Ethereal, & Effortless”**
The design needs to feel like a high-end fashion editorial meets a seamless utility app. It should feel expensive but act instantly.

- **Minimalist Luxury:** Generous negative space. Never cluttered. Elements breathe.
- **Glass & Light:** Use glassmorphism (frosted blurs) for cards and overlays to keep the context of the hero photography visible.
- **Typography-Led:** The text itself is the design decoration.


### 14.4 Motion & Micro-interactions
Motion is what separates "good" from "world-class".
- **The "Reveal":** Elements should not just appear. They should stagger-fade-in upwards.
- **Envelope Experience:** The RSVP page load should feel like opening a physical envelope—smooth, deliberate animation of the card sliding out or unfolding.
- **Button Interaction:** Subtle scale down (0.98) on click. Soft glow bloom on hover.
- **Parallax:** Hero images should move slightly slower than the scroll speed to create depth.

### 14.5 Component Library Guidelines
- **Buttons:**
  - *Primary:* Solid fill (theme color), sharp or slightly rounded corners (pill optional). No default browser shadows; use custom soft diffusions.
  - *Secondary:* Transparent background, simple thin border, or text with an elegant underline that grows on hover.
- **Inputs:**
  - No heavy borders. Use bottom-border-only for a "paper form" feel, or extremely subtle full borders `gray-200`.
  - Focus states: Smooth transition to theme color line.
- **Cards:**
  - White/Glass containers with super soft, large spread shadows (e.g., `box-shadow: 0 20px 40px -10px rgba(0,0,0,0.05)`).
- **Modals:**
  - Center-screen for desktop. Bottom-sheet drag-to-dismiss for mobile (essential for "app-like" feel).

### 14.6 Mobile-First Considerations
- **Touch Targets:** Minimum 44px for everything.
- **Bottom Navigation:** Key actions (RSVP Submit, Upload) should stick to the bottom on mobile for easy thumb reach.
- **Pinch/Zoom:** Disable standard pinch-zoom on the UI elements to prevent accidental zooming, but allow it on photos.
