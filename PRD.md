# DreamMoments - Product Requirements Document

> **AI-Powered Digital Wedding Invitations for Malaysian & Singaporean Chinese Couples**

**Version**: 1.0  
**Last Updated**: February 2026  
**Status**: Ready for Development

-----

## Executive Summary

DreamMoments is a web application that enables couples to create stunning, animated digital wedding invitations in under 5 minutes. The product targets Chinese couples in Malaysia and Singapore who want premium-quality invitations without hiring a designer.

**Core Value Proposition**: *“Beautiful invitations, fast.”*

**Key Differentiators**:

1. Cinematic scroll animations that rival Apple product pages
1. Premium templates that look like RM2,000 designer work
1. Signup to shareable link in under 5 minutes
1. AI-assisted content generation and styling

-----

## Table of Contents

1. [Target Users](#1-target-users)
1. [Product Goals](#2-product-goals)
1. [Feature Specifications](#3-feature-specifications)
1. [Templates](#4-templates)
1. [User Flows](#5-user-flows)
1. [Technical Architecture](#6-technical-architecture)
1. [Database Schema](#7-database-schema)
1. [API Specifications](#8-api-specifications)
1. [Monetization](#9-monetization)
1. [Implementation Roadmap](#10-implementation-roadmap)
1. [Success Metrics](#11-success-metrics)

-----

## 1. Target Users

### Primary Audience

- **Demographics**: Chinese couples in Malaysia and Singapore, aged 25-35
- **Characteristics**:
  - Tech-savvy, comfortable with web apps
  - Value aesthetics and modern design
  - Want convenience over DIY customization
  - Typically bilingual (English/Chinese)

### User Personas

**Persona 1: Sarah & Michael (Singapore)**

- Both working professionals, limited time
- Want something modern and elegant
- Comfortable paying for premium quality
- Guest list: 150 people, mixed English/Chinese speaking

**Persona 2: Wei Ling & Jun Hao (Malaysia)**

- Traditional Chinese wedding with modern twist
- Need bilingual invitation (Chinese for elders, English for friends)
- Budget-conscious but willing to pay for good design
- Guest list: 200 people

-----

## 2. Product Goals

### Primary Goals (MVP)

|Goal            |Metric                            |Target     |
|----------------|----------------------------------|-----------|
|Speed to publish|Time from signup to shareable link|< 5 minutes|
|Visual quality  |User satisfaction rating          |> 4.5/5    |
|Conversion      |Free to paid upgrade rate         |> 15%      |

### Secondary Goals

|Goal           |Metric                     |Target|
|---------------|---------------------------|------|
|RSVP completion|Guest RSVP rate            |> 70% |
|Sharing        |Invitations shared per user|> 1.5 |
|Retention      |Return visits to dashboard |> 3x  |

-----

## 3. Feature Specifications

### 3.1 Template Selection

**Description**: Landing page showcasing 3 premium templates with live previews.

**Layout**:

- Full-page sections, one template per section
- Scroll-triggered animations demonstrate template capabilities
- “Use This Template” CTA on each section

**Templates** (see Section 4 for details):

1. Love at Dusk (暮色之恋) - Romantic Chinese
1. Garden Romance - Outdoor/Natural
1. Eternal Elegance - Western Classic

### 3.2 Live Editor

**Desktop Experience**:

- Split-screen layout
- Left panel (60%): Scrollable template preview with live updates
- Right panel (40%): Contextual form that changes based on visible section
- Auto-scroll sync: Scrolling preview updates form panel to matching section
- Pre-filled with realistic sample data for immediate context

**Mobile Experience**:

- Full-screen template preview
- Tap any text element → inline edit popover
- Tap section → bottom sheet with section fields
- Sticky “Preview / Edit” toggle

**Section Editor Features**:

|Feature         |Description                                                                          |
|----------------|-------------------------------------------------------------------------------------|
|Live preview    |Changes reflect instantly in template                                                |
|Sample data     |Pre-filled with realistic examples (e.g., “Sarah & Michael”, “Grand Hyatt Singapore”)|
|Field validation|Real-time validation with helpful error messages                                     |
|Auto-save       |Draft saved every 30 seconds                                                         |
|Undo/Redo       |Last 20 actions                                                                      |

### 3.3 AI Assistant

**Capabilities**:

1. **Content Generation**: Generate schedules, FAQs, love stories
1. **Styling Adjustments**: “Make this more romantic”, “Use warmer colors”
1. **Auto-Translation**: Translate entire invitation to Chinese/English

**Interaction Model**:

- Floating AI button on each section
- Click → prompt input appears
- Type request → AI generates suggestion → “Apply” or “Regenerate”

**AI Limits**:

|Tier|Generations       |
|----|------------------|
|Free|5 total           |
|Paid|100 per invitation|

**AI Provider**: Kimi K2.5 (Moonshot AI)

- Excellent Chinese/English support
- Cost-effective for bilingual content
- Model: `moonshot-v1-8k`

### 3.4 Sections (Configurable per Template)

Each template has a fixed set of sections. Users can show/hide sections but not reorder or add custom sections (MVP scope).

|Section     |Description                                 |AI Generable |
|------------|--------------------------------------------|-------------|
|Hero        |Main visual with couple names, date, tagline|Tagline only |
|Announcement|Formal invitation text                      |Yes          |
|Couple Story|How we met, milestones                      |Yes          |
|Gallery     |Photo carousel/grid                         |Captions only|
|Schedule    |Timeline of events                          |Yes          |
|Venue       |Location with map                           |No           |
|RSVP        |Response form                               |No           |
|FAQ/Notes   |Common questions                            |Yes          |
|Footer      |Thank you message, social links             |Yes          |

### 3.5 RSVP System

**Guest-Facing Form**:

- Name (required)
- Attendance: Attending / Not Attending / Undecided
- Number of guests (if plus-ones allowed)
- Dietary requirements (dropdown + custom text)
- Message to couple (optional)
- Optional: Create account for reminders

**Couple Dashboard - RSVP Management**:

|Feature          |Description                               |
|-----------------|------------------------------------------|
|Guest list view  |Table with filters (attending/not/pending)|
|Dietary summary  |Aggregated dietary requirements           |
|Plus-one tracking|Total confirmed guests including plus-ones|
|CSV export       |Download guest list for venue/caterer     |
|Search           |Find specific guests                      |
|Manual add       |Add guests who RSVP’d offline             |

**Guest Import**:

- CSV upload with column mapping
- Paste from spreadsheet (auto-detect columns)
- Manual entry form

### 3.6 Dashboard

**Sections**:

1. **My Invitations**
- List of created invitations
- Status: Draft / Published / Archived
- Quick actions: Edit, Preview, Share, Delete
1. **RSVP Overview**
- Total invited vs responded
- Attending / Not attending / Pending breakdown
- Recent responses
1. **Basic Analytics**
- Total views
- RSVP rate (responded / invited)
- Views over time (simple line chart)
1. **Settings**
- Change invitation URL slug
- Publish / Unpublish
- Delete invitation

### 3.7 Sharing

**URL Format**: `dreammoments.app/invite/{slug}`

- Slug: couple names (e.g., `sarah-michael`)
- If taken: append short UID (e.g., `sarah-michael-x7k2`)

**Share Options**:

- Copy link button
- WhatsApp share (pre-formatted message)
- QR code download (for printed materials)

**Access**: Public (no password protection for MVP)

**Longevity**: Invitations remain accessible forever

- Template versioning ensures old invitations render correctly even after app updates

### 3.8 Authentication

**Sign Up / Sign In Methods**:

1. Google OAuth (primary, one-click)
1. Email + Password (fallback)

**Guest Accounts** (for RSVP):

- Optional signup for reminders
- Incentive: “Sign up to receive event reminders”

**Multi-Invitation Support**:

- One account can create multiple invitations
- Use case: Different invitations for different guest groups

-----

## 4. Templates

### 4.1 Template Architecture

Templates are configuration-driven, not hardcoded React components.

```typescript
interface TemplateConfig {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  category: 'chinese' | 'garden' | 'western';
  
  // Ordered sections
  sections: SectionConfig[];
  
  // Design tokens
  tokens: DesignTokens;
  
  // AI configuration
  aiConfig: {
    defaultTone: 'formal' | 'casual' | 'romantic';
    culturalContext: 'chinese' | 'western' | 'mixed';
  };
  
  // Template version for longevity
  version: string;
}

interface SectionConfig {
  id: string;
  type: SectionType;
  defaultVisible: boolean;
  fields: FieldConfig[];
  animations: AnimationConfig;
}

interface DesignTokens {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    muted: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    accentFont: string;
  };
  animations: {
    scrollTriggerOffset: number;
    defaultDuration: number;
    easing: string;
  };
}
```

### 4.2 Template 1: Love at Dusk (暮色之恋)

**Vibe**: Romantic, cinematic, Chinese elegance

**Color Palette**:

- Primary: `#544945` (warm brown)
- Accent: `#D4AF37` (gold)
- Background: `#1a1a1a` (dark)
- Text: `#F5F5F5` (cream)

**Typography**:

- Headings: Playfair Display / Noto Serif SC
- Body: Inter / Noto Sans SC
- Accent: Great Vibes (cursive)

**Sections** (11 total):

1. Hero - Full-screen with parallax couple photo
1. Announcement - Formal Chinese invitation text
1. Couple Introduction - Side-by-side portraits with bios
1. Love Story Timeline - Horizontal scroll timeline
1. Gallery - Masonry grid with lightbox
1. Schedule - Vertical timeline with icons
1. Venue - Map with directions
1. Entourage - Wedding party cards
1. Gift Registry - Optional gift preferences
1. RSVP - Elegant form
1. Footer - Thank you with countdown

**Signature Animations**:

- Hero: Slow zoom on scroll, text fade-in
- Timeline: Cards slide in from alternating sides
- Gallery: Staggered fade-in with scale
- Sparkle effects on gold elements

### 4.3 Template 2: Garden Romance

**Vibe**: Natural, light, outdoor elegance

**Color Palette**:

- Primary: `#2D5A3D` (forest green)
- Accent: `#E8B4B8` (blush pink)
- Background: `#FDF8F5` (warm white)
- Text: `#2C2C2C` (charcoal)

**Typography**:

- Headings: Cormorant Garamond
- Body: Lato
- Accent: Sacramento (script)

**Sections** (9 total):

1. Hero - Floral frame with couple names
1. Announcement - Elegant script invitation
1. Our Story - Illustrated journey
1. Gallery - Carousel with botanical borders
1. Schedule - Garden-themed icons
1. Venue - Watercolor map style
1. RSVP - Clean, minimal form
1. FAQ - Accordion with leaf icons
1. Footer - Floral footer with social links

**Signature Animations**:

- Hero: Flowers bloom on scroll
- Sections: Gentle fade with upward float
- Decorative vines grow along section borders
- Butterfly particles on hover

### 4.4 Template 3: Eternal Elegance

**Vibe**: Classic Western, timeless sophistication

**Color Palette**:

- Primary: `#1C1C1C` (black)
- Accent: `#C9A962` (champagne gold)
- Background: `#FFFFFF` (white)
- Text: `#333333` (dark gray)

**Typography**:

- Headings: Didot / Bodoni
- Body: Garamond
- Accent: Pinyon Script

**Sections** (8 total):

1. Hero - Minimalist with monogram
1. Announcement - Classic invitation wording
1. Couple - Elegant portraits
1. Gallery - Full-width slideshow
1. Details - Schedule and venue combined
1. RSVP - Sophisticated form
1. Registry - Gift information
1. Footer - Simple thank you

**Signature Animations**:

- Hero: Monogram draws itself (SVG line animation)
- Text: Letter-by-letter reveal
- Sections: Subtle fade with no movement (refined)
- Gold accents: Subtle shimmer effect

-----

## 5. User Flows

### 5.1 New User - Create Invitation

```
1. Landing Page
   └── View template showcase (scroll through 3 templates)
   └── Click "Use This Template" on preferred template

2. Authentication
   └── Sign up with Google (one-click) or Email
   └── [New user] Accept terms

3. Editor - Basic Info
   └── Auto-focused on Hero section
   └── Replace sample names with couple names
   └── Set wedding date
   └── [Optional] Upload hero photo

4. Editor - Section by Section
   └── Scroll through template preview
   └── Form panel updates to current section
   └── Edit fields or use AI to generate content
   └── Toggle sections on/off as needed

5. Preview
   └── Click "Preview" to see full invitation
   └── Mobile preview toggle
   └── Back to edit if needed

6. Publish
   └── Click "Publish"
   └── [Free tier] Prompted to upgrade for custom URL
   └── Invitation goes live
   └── Share modal with link, WhatsApp, QR code

Total time target: < 5 minutes for basic invitation
```

### 5.2 Guest - View & RSVP

```
1. Receive Link
   └── Via WhatsApp, SMS, email, or QR code

2. View Invitation
   └── Scroll through animated sections
   └── View photos, schedule, venue details

3. RSVP
   └── Scroll to RSVP section or click floating RSVP button
   └── Fill form (name, attendance, dietary, message)
   └── [Optional] Create account for reminders
   └── Submit → confirmation message

4. Return Visits
   └── Can revisit anytime to check details
   └── Update RSVP if needed (via email link)
```

### 5.3 Couple - Manage RSVPs

```
1. Login to Dashboard
   └── View all invitations

2. Select Invitation
   └── Overview: views, RSVP stats

3. RSVP Management
   └── View guest list with filters
   └── Check dietary requirements summary
   └── Export to CSV for venue

4. Share Reminders
   └── [Future] Send reminder to pending guests
```

-----

## 6. Technical Architecture

### 6.1 Tech Stack

|Layer     |Technology          |Rationale                               |
|----------|--------------------|----------------------------------------|
|Framework |TanStack Start      |Modern React framework, excellent DX    |
|Styling   |Tailwind CSS        |Rapid UI development                    |
|Animations|GSAP + Motion       |Scroll animations, performance          |
|Database  |Neon (Postgres)     |Serverless, scales to zero              |
|ORM       |Drizzle             |Lightweight, type-safe, serverless-first|
|Auth      |Better Auth / Lucia |Lightweight, self-hosted                |
|Storage   |Cloudflare R2       |Free egress, cost-effective             |
|AI        |Kimi K2.5 (Moonshot)|Bilingual, cost-effective               |
|Payments  |Stripe              |Global + local methods                  |
|Hosting   |Vercel              |Easy deployment, edge functions         |

### 6.2 Project Structure

```
src/
├── routes/                    # TanStack Router pages
│   ├── index.tsx              # Landing page (template showcase)
│   ├── auth/
│   │   ├── login.tsx
│   │   └── callback.tsx
│   ├── editor/
│   │   └── $invitationId.tsx  # Main editor
│   ├── dashboard/
│   │   ├── index.tsx          # Invitation list
│   │   └── $invitationId/
│   │       ├── index.tsx      # Overview
│   │       ├── rsvp.tsx       # RSVP management
│   │       └── settings.tsx   # Invitation settings
│   └── invite/
│       └── $slug.tsx          # Public invitation view
│
├── components/
│   ├── ui/                    # Shared UI components
│   ├── editor/
│   │   ├── EditorLayout.tsx   # Split-screen layout
│   │   ├── SectionForm.tsx    # Dynamic form per section
│   │   ├── AIAssistant.tsx    # AI prompt interface
│   │   └── PreviewPane.tsx    # Live preview
│   ├── templates/
│   │   ├── TemplateRenderer.tsx
│   │   └── sections/          # Section components
│   │       ├── HeroSection.tsx
│   │       ├── GallerySection.tsx
│   │       ├── ScheduleSection.tsx
│   │       └── ...
│   └── dashboard/
│       ├── RSVPTable.tsx
│       └── AnalyticsCard.tsx
│
├── templates/                 # Template configurations
│   ├── types.ts
│   ├── love-at-dusk.ts
│   ├── garden-romance.ts
│   └── eternal-elegance.ts
│
├── lib/
│   ├── db/
│   │   ├── schema.ts          # Drizzle schema
│   │   └── client.ts          # Database client
│   ├── ai/
│   │   ├── kimi.ts            # Kimi API client
│   │   └── prompts.ts         # Prompt templates
│   ├── storage/
│   │   └── r2.ts              # Cloudflare R2 client
│   └── auth/
│       └── index.ts           # Auth configuration
│
├── hooks/
│   ├── useInvitation.ts       # Invitation CRUD
│   ├── useAI.ts               # AI generation
│   └── useRSVP.ts             # RSVP management
│
└── styles/
    └── globals.css            # Tailwind + custom styles
```

### 6.3 Animation Architecture

**Scroll Animation Strategy**:

```typescript
// Using GSAP ScrollTrigger + React
interface AnimationConfig {
  trigger: 'scroll' | 'inView';
  animation: 'fadeIn' | 'slideUp' | 'slideLeft' | 'scale' | 'custom';
  duration: number;
  delay?: number;
  stagger?: number;  // For child elements
  scrub?: boolean;   // Tie to scroll position
}

// Performance optimizations:
// 1. Use CSS transforms only (no layout thrashing)
// 2. will-change hints on animated elements
// 3. Intersection Observer for lazy loading
// 4. Respect prefers-reduced-motion
```

**Reduced Motion Support**:

```typescript
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

// If reduced motion: disable animations, show static content
```

### 6.4 Template Versioning (Longevity)

**Problem**: App updates might break old invitations.

**Solution**: Version lock templates at publish time.

```typescript
// When invitation is published:
{
  templateId: 'love-at-dusk',
  templateVersion: '1.0.0',  // Locked version
  templateSnapshot: { ... }, // Full config snapshot
  content: { ... },          // User content
}

// Rendering logic:
// 1. Try to render with current template version
// 2. If incompatible, fall back to snapshot
// 3. Migrations for non-breaking updates
```

-----

## 7. Database Schema

### 7.1 Core Tables

```sql
-- Users (couples creating invitations)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  auth_provider VARCHAR(50), -- 'google' | 'email'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Invitations
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Basic info
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255), -- "Sarah & Michael's Wedding"
  
  -- Template
  template_id VARCHAR(50) NOT NULL,
  template_version VARCHAR(20) NOT NULL,
  template_snapshot JSONB, -- Full config at publish time
  
  -- Content (all user-editable content)
  content JSONB NOT NULL DEFAULT '{}',
  
  -- Section visibility
  section_visibility JSONB DEFAULT '{}', -- { "hero": true, "faq": false }
  
  -- Design overrides (AI-adjusted colors, etc.)
  design_overrides JSONB DEFAULT '{}',
  
  -- Status
  status VARCHAR(20) DEFAULT 'draft', -- 'draft' | 'published' | 'archived'
  published_at TIMESTAMP,
  
  -- AI usage
  ai_generations_used INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Guests (for RSVP)
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  
  -- Guest info
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  
  -- Relationship (for grouping)
  relationship VARCHAR(100), -- "Bride's family", "Groom's colleague"
  
  -- RSVP response
  attendance VARCHAR(20), -- 'attending' | 'not_attending' | 'undecided' | null
  guest_count INTEGER DEFAULT 1, -- Including plus-ones
  dietary_requirements TEXT,
  message TEXT,
  
  -- Account link (optional)
  user_id UUID REFERENCES users(id),
  
  -- Tracking
  rsvp_submitted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Invitation views (for analytics)
CREATE TABLE invitation_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  
  -- View metadata
  viewed_at TIMESTAMP DEFAULT NOW(),
  user_agent TEXT,
  referrer TEXT,
  
  -- Unique visitor tracking (hashed IP or fingerprint)
  visitor_hash VARCHAR(64)
);

-- AI generation history
CREATE TABLE ai_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  
  -- Generation details
  section_id VARCHAR(50),
  prompt TEXT NOT NULL,
  generated_content JSONB,
  
  -- Tracking
  accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  invitation_id UUID REFERENCES invitations(id),
  
  -- Stripe
  stripe_payment_intent_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  
  -- Amount
  amount_cents INTEGER NOT NULL,
  currency VARCHAR(3) NOT NULL, -- 'MYR' | 'SGD'
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- 'pending' | 'succeeded' | 'failed'
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_invitations_user ON invitations(user_id);
CREATE INDEX idx_invitations_slug ON invitations(slug);
CREATE INDEX idx_guests_invitation ON guests(invitation_id);
CREATE INDEX idx_views_invitation ON invitation_views(invitation_id);
CREATE INDEX idx_views_date ON invitation_views(viewed_at);
```

### 7.2 Content JSON Structure

```typescript
// invitations.content structure
interface InvitationContent {
  // Hero section
  hero: {
    partnerOneName: string;
    partnerTwoName: string;
    tagline: string;
    date: string; // ISO date
    heroImageUrl: string;
  };
  
  // Announcement
  announcement: {
    title: string;
    message: string;
    formalText: string; // Chinese formal invitation
  };
  
  // Couple
  couple: {
    partnerOne: {
      fullName: string;
      bio: string;
      photoUrl: string;
    };
    partnerTwo: {
      fullName: string;
      bio: string;
      photoUrl: string;
    };
  };
  
  // Love story
  story: {
    milestones: Array<{
      date: string;
      title: string;
      description: string;
      photoUrl?: string;
    }>;
  };
  
  // Gallery
  gallery: {
    photos: Array<{
      url: string;
      caption?: string;
    }>;
  };
  
  // Schedule
  schedule: {
    events: Array<{
      time: string;
      title: string;
      description: string;
      icon?: string;
    }>;
  };
  
  // Venue
  venue: {
    name: string;
    address: string;
    coordinates: { lat: number; lng: number };
    directions: string;
    parkingInfo?: string;
  };
  
  // RSVP settings
  rsvp: {
    deadline: string; // ISO date
    allowPlusOnes: boolean;
    maxPlusOnes: number;
    dietaryOptions: string[];
    customMessage?: string;
  };
  
  // FAQ
  faq: {
    items: Array<{
      question: string;
      answer: string;
    }>;
  };
  
  // Footer
  footer: {
    message: string;
    socialLinks?: {
      instagram?: string;
      hashtag?: string;
    };
  };
}
```

-----

## 8. API Specifications

### 8.1 Invitation APIs

```typescript
// Create invitation
POST /api/invitations
Body: { templateId: string }
Response: { id: string, slug: string }

// Get invitation (for editing)
GET /api/invitations/:id
Response: { invitation: Invitation, template: TemplateConfig }

// Update invitation content
PATCH /api/invitations/:id
Body: { content: Partial<InvitationContent>, sectionVisibility?: object }
Response: { success: true }

// Publish invitation
POST /api/invitations/:id/publish
Response: { slug: string, url: string }

// Get public invitation (for viewing)
GET /api/invite/:slug
Response: { invitation: PublicInvitation }
```

### 8.2 RSVP APIs

```typescript
// Submit RSVP (public, no auth)
POST /api/invite/:slug/rsvp
Body: { 
  name: string, 
  attendance: 'attending' | 'not_attending' | 'undecided',
  guestCount?: number,
  dietaryRequirements?: string,
  message?: string,
  email?: string  // Optional, for reminders
}
Response: { success: true, guestId: string }

// Get RSVP list (auth required, owner only)
GET /api/invitations/:id/guests
Query: { status?: string, search?: string }
Response: { guests: Guest[], summary: RSVPSummary }

// Import guests
POST /api/invitations/:id/guests/import
Body: { guests: Array<{ name: string, email?: string, relationship?: string }> }
Response: { imported: number, errors: string[] }

// Export guests (CSV)
GET /api/invitations/:id/guests/export
Response: CSV file download
```

### 8.3 AI APIs

```typescript
// Generate content
POST /api/ai/generate
Body: {
  invitationId: string,
  sectionId: string,
  type: 'schedule' | 'faq' | 'story' | 'tagline' | 'translate',
  context: object, // Relevant invitation data
  prompt?: string  // User's custom prompt
}
Response: { content: object, generationId: string }

// Apply AI generation
POST /api/ai/apply
Body: { generationId: string }
Response: { success: true }

// Style adjustment
POST /api/ai/style
Body: {
  invitationId: string,
  sectionId: string,
  prompt: string // "Make it more romantic"
}
Response: { styleOverrides: object, generationId: string }
```

### 8.4 Analytics APIs

```typescript
// Track view (public, called by invitation page)
POST /api/invite/:slug/view
Body: { visitorHash: string }
Response: { success: true }

// Get analytics (auth required)
GET /api/invitations/:id/analytics
Query: { period: '7d' | '30d' | 'all' }
Response: {
  totalViews: number,
  uniqueVisitors: number,
  rsvpRate: number,
  viewsByDay: Array<{ date: string, views: number }>
}
```

-----

## 9. Monetization

### 9.1 Pricing Tiers

|Feature            |Free              |Premium (RM49/SGD19)  |
|-------------------|------------------|----------------------|
|Templates          |All 3             |All 3                 |
|AI generations     |5                 |100                   |
|Custom URL slug    |Random ID only    |Custom (sarah-michael)|
|RSVP responses     |Unlimited         |Unlimited             |
|Guest import       |Manual only       |CSV + paste           |
|Analytics          |Basic (views only)|Full                  |
|Support            |Community         |Email                 |
|Invitation duration|Forever           |Forever               |

### 9.2 Payment Flow

```
1. User creates invitation (free)
2. Edits and previews
3. Clicks "Publish"
4. Upgrade prompt shows premium benefits
5. User clicks "Upgrade" → Stripe Checkout
6. Payment methods: Card, FPX (MY), PayNow (SG), GrabPay
7. Success → Premium features unlocked
8. Invitation published with custom slug
```

### 9.3 Stripe Configuration

```typescript
// Products
const products = {
  premium_myr: {
    priceId: 'price_xxx',
    amount: 4900, // RM49.00
    currency: 'myr',
  },
  premium_sgd: {
    priceId: 'price_yyy',
    amount: 1900, // SGD19.00
    currency: 'sgd',
  },
};

// Payment methods by region
const paymentMethods = {
  MY: ['card', 'fpx', 'grabpay'],
  SG: ['card', 'paynow', 'grabpay'],
};
```

-----

## 10. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

**Goal**: Core infrastructure and one working template

#### Week 1: Project Setup & Auth

|Task|Description                                    |Priority|
|----|-----------------------------------------------|--------|
|1.1 |Initialize TanStack Start project with Tailwind|P0      |
|1.2 |Set up Neon database + Drizzle ORM             |P0      |
|1.3 |Create database schema (users, invitations)    |P0      |
|1.4 |Implement Google OAuth                         |P0      |
|1.5 |Implement email/password auth                  |P1      |
|1.6 |Create basic auth UI (login/signup pages)      |P0      |
|1.7 |Set up Cloudflare R2 for image storage         |P1      |

#### Week 2: Template System & First Template

|Task|Description                                |Priority|
|----|-------------------------------------------|--------|
|2.1 |Define TemplateConfig TypeScript interfaces|P0      |
|2.2 |Create section component architecture      |P0      |
|2.3 |Build “Love at Dusk” template config       |P0      |
|2.4 |Implement HeroSection component            |P0      |
|2.5 |Implement GallerySection component         |P0      |
|2.6 |Implement ScheduleSection component        |P0      |
|2.7 |Implement VenueSection component           |P1      |
|2.8 |Implement RSVPSection component            |P0      |
|2.9 |Set up GSAP ScrollTrigger                  |P0      |
|2.10|Add entrance animations to all sections    |P0      |

### Phase 2: Editor Experience (Week 3-4)

**Goal**: Full editing flow from template to publish

#### Week 3: Editor UI

|Task|Description                               |Priority|
|----|------------------------------------------|--------|
|3.1 |Build split-screen editor layout (desktop)|P0      |
|3.2 |Create dynamic SectionForm component      |P0      |
|3.3 |Implement live preview sync               |P0      |
|3.4 |Add sample data pre-fill                  |P0      |
|3.5 |Build mobile tap-to-edit interface        |P1      |
|3.6 |Implement auto-save (draft)               |P0      |
|3.7 |Add undo/redo functionality               |P2      |
|3.8 |Image upload with R2 integration          |P0      |
|3.9 |Image optimization (resize, compress)     |P1      |

#### Week 4: Publishing Flow

|Task|Description                                |Priority|
|----|-------------------------------------------|--------|
|4.1 |Build preview mode (full-screen)           |P0      |
|4.2 |Implement publish flow                     |P0      |
|4.3 |Generate unique slugs                      |P0      |
|4.4 |Create public invitation route             |P0      |
|4.5 |Build share modal (copy link, WhatsApp, QR)|P0      |
|4.6 |Implement template versioning on publish   |P1      |
|4.7 |Add mobile preview toggle in editor        |P1      |

### Phase 3: RSVP System (Week 5-6)

**Goal**: Complete guest management

#### Week 5: RSVP Submission

|Task|Description                       |Priority|
|----|----------------------------------|--------|
|5.1 |Build RSVP form component         |P0      |
|5.2 |Create guests database table      |P0      |
|5.3 |Implement RSVP submission API     |P0      |
|5.4 |Add confirmation message/animation|P0      |
|5.5 |Optional guest account creation   |P2      |
|5.6 |RSVP update flow (via email link) |P2      |

#### Week 6: RSVP Dashboard

|Task|Description                        |Priority|
|----|-----------------------------------|--------|
|6.1 |Build guest list table with filters|P0      |
|6.2 |Implement dietary summary view     |P0      |
|6.3 |Add CSV export                     |P0      |
|6.4 |Build guest import (CSV, paste)    |P1      |
|6.5 |Add search and manual entry        |P1      |
|6.6 |Plus-one tracking                  |P1      |

### Phase 4: AI Features (Week 7-8)

**Goal**: AI content generation and styling

#### Week 7: AI Integration

|Task|Description                     |Priority|
|----|--------------------------------|--------|
|7.1 |Set up Kimi K2.5 API client     |P0      |
|7.2 |Create prompt templates         |P0      |
|7.3 |Build AI generation API endpoint|P0      |
|7.4 |Implement schedule generator    |P0      |
|7.5 |Implement FAQ generator         |P0      |
|7.6 |Implement love story generator  |P1      |
|7.7 |Track AI usage per invitation   |P0      |

#### Week 8: AI UI & Styling

|Task|Description                          |Priority|
|----|-------------------------------------|--------|
|8.1 |Build AI assistant floating button   |P0      |
|8.2 |Create prompt input interface        |P0      |
|8.3 |Implement “Apply” / “Regenerate” flow|P0      |
|8.4 |Add AI style adjustment              |P1      |
|8.5 |Implement auto-translation           |P1      |
|8.6 |Add AI generation limits UI          |P0      |

### Phase 5: Remaining Templates (Week 9-10)

**Goal**: Complete template collection

#### Week 9: Garden Romance Template

|Task|Description                      |Priority|
|----|---------------------------------|--------|
|9.1 |Create Garden Romance config     |P0      |
|9.2 |Design floral decorative elements|P0      |
|9.3 |Build template-specific sections |P0      |
|9.4 |Add botanical animations         |P0      |
|9.5 |Test all sections end-to-end     |P0      |

#### Week 10: Eternal Elegance Template

|Task|Description                     |Priority|
|----|--------------------------------|--------|
|10.1|Create Eternal Elegance config  |P0      |
|10.2|Design monogram SVG animation   |P1      |
|10.3|Build template-specific sections|P0      |
|10.4|Add refined animations          |P0      |
|10.5|Test all sections end-to-end    |P0      |

### Phase 6: Payments & Polish (Week 11-12)

**Goal**: Monetization and launch readiness

#### Week 11: Payments

|Task|Description                       |Priority|
|----|----------------------------------|--------|
|11.1|Set up Stripe account             |P0      |
|11.2|Create products/prices in Stripe  |P0      |
|11.3|Implement checkout flow           |P0      |
|11.4|Add FPX (MY) payment method       |P1      |
|11.5|Add PayNow (SG) payment method    |P1      |
|11.6|Handle webhook for payment success|P0      |
|11.7|Implement premium feature gating  |P0      |

#### Week 12: Dashboard & Analytics

|Task|Description                                 |Priority|
|----|--------------------------------------------|--------|
|12.1|Build main dashboard layout                 |P0      |
|12.2|Create invitation list view                 |P0      |
|12.3|Implement basic analytics (views, RSVP rate)|P0      |
|12.4|Add invitation settings page                |P0      |
|12.5|Build landing page with template showcase   |P0      |
|12.6|Performance optimization                    |P1      |
|12.7|Accessibility audit (reduced motion)        |P1      |
|12.8|Mobile responsive testing                   |P0      |

### Phase 7: Launch Prep (Week 13)

|Task|Description                         |Priority|
|----|------------------------------------|--------|
|13.1|End-to-end testing                  |P0      |
|13.2|Security audit                      |P0      |
|13.3|Set up error monitoring (Sentry)    |P1      |
|13.4|Create sample invitations for demo  |P0      |
|13.5|Write help documentation            |P2      |
|13.6|Set up analytics (Plausible/Posthog)|P1      |
|13.7|Domain setup (dreammoments.app)     |P0      |
|13.8|Production deployment               |P0      |

-----

## 11. Success Metrics

### Launch Metrics (First 30 Days)

|Metric                 |Target       |
|-----------------------|-------------|
|Invitations created    |100          |
|Paid conversions       |15 (15% rate)|
|Average time to publish|< 7 minutes  |
|RSVP submission rate   |> 50%        |
|User satisfaction (NPS)|> 40         |

### Growth Metrics (First 90 Days)

|Metric              |Target                             |
|--------------------|-----------------------------------|
|Monthly active users|500                                |
|Revenue             |RM5,000 / SGD2,500                 |
|Organic traffic     |1,000 visitors/month               |
|Referral rate       |20% (users from shared invitations)|

### Product Health Metrics

|Metric                |Target                       |
|----------------------|-----------------------------|
|Editor completion rate|> 60% (start to publish)     |
|AI feature adoption   |> 40% of users try AI        |
|Mobile view ratio     |> 70% (guests view on mobile)|
|Page load time        |< 3 seconds                  |
|Lighthouse score      |> 90                         |

-----

## Appendix A: Sample Content

### Sample Invitation Data (Pre-fill)

```json
{
  "hero": {
    "partnerOneName": "Sarah",
    "partnerTwoName": "Michael",
    "tagline": "Two hearts, one beautiful journey",
    "date": "2025-06-15"
  },
  "announcement": {
    "title": "We're Getting Married!",
    "message": "Together with our families, we invite you to celebrate our wedding."
  },
  "schedule": {
    "events": [
      { "time": "3:00 PM", "title": "Guest Arrival", "description": "Welcome drinks and registration" },
      { "time": "3:30 PM", "title": "Ceremony", "description": "Exchange of vows" },
      { "time": "4:30 PM", "title": "Photo Session", "description": "Group photos with guests" },
      { "time": "6:00 PM", "title": "Dinner Reception", "description": "Dinner and celebrations" },
      { "time": "9:00 PM", "title": "After Party", "description": "Dancing and festivities" }
    ]
  },
  "venue": {
    "name": "Grand Hyatt Singapore",
    "address": "10 Scotts Road, Singapore 228211"
  },
  "faq": {
    "items": [
      { "question": "What should I wear?", "answer": "Smart casual. Ladies, please avoid white." },
      { "question": "Can I bring a plus one?", "answer": "Please RSVP for your allocated seats only." },
      { "question": "Is there parking?", "answer": "Complimentary valet parking is available." }
    ]
  }
}
```

-----

## Appendix B: AI Prompt Templates

### Schedule Generator

```
You are helping create a wedding schedule. Based on the following details, generate 5-7 timeline events.

Wedding Date: {date}
Ceremony Time: {ceremonyTime}
Venue Type: {venueType}
Cultural Style: {culturalStyle}

Output JSON format:
{
  "events": [
    { "time": "3:00 PM", "title": "Event Name", "description": "Brief description" }
  ]
}

Keep descriptions concise (under 10 words). Ensure logical flow and timing.
```

### FAQ Generator

```
Generate 4-5 common wedding FAQ items for a {culturalStyle} wedding at a {venueType}.

Consider:
- Dress code
- Parking
- Dietary accommodations
- Gift preferences
- Plus ones policy

Output JSON format:
{
  "items": [
    { "question": "Question?", "answer": "Concise answer." }
  ]
}
```

### Style Adjustment

```
You are adjusting the visual style of a wedding invitation section.

Current section: {sectionType}
Current style: {currentStyle}
User request: "{userPrompt}"

Suggest style adjustments as JSON:
{
  "colorAdjustments": { "accent": "#hex", "background": "#hex" },
  "animationIntensity": 0.5 to 1.5,
  "decorativeElements": ["sparkles", "flowers", etc.]
}

Only include properties that should change based on the user's request.
```

-----

*End of PRD*