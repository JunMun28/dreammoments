# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DreamMoments is a wedding invitation builder + RSVP management platform. Built with TanStack Start (React full-stack framework), PostgreSQL via Neon Serverless, and Drizzle ORM. Features include:

- **Canvas editor**: Fabric.js-based free-form design with long page (scrollable sections) layout
- **Photo gallery** with image uploads
- **RSVP management** with token-based guest access
- Cinematic, luxury aesthetics with glassmorphism patterns

## Development Commands

```bash
pnpm dev                 # Start dev server on port 3000
pnpm build               # Production build
pnpm test                # Run all tests with Vitest
pnpm test src/lib/auth   # Run tests matching pattern
pnpm check               # Biome lint + format check
pnpm format              # Auto-format with Biome (use --write to apply)
pnpm typecheck           # TypeScript type checking
pnpm db:generate         # Generate migrations from schema
pnpm db:migrate          # Run migrations
pnpm db:push             # Push schema changes to DB (dev only)
pnpm db:studio           # Open Drizzle Studio GUI
pnpm test:e2e            # Run Playwright E2E tests
pnpm test:e2e:ui         # Run E2E tests with UI mode
```

## Architecture

### Data Flow

```
Routes (src/routes/) → Server Functions (src/lib/*-server.ts) → Drizzle ORM → Neon PostgreSQL
         ↓
    Context (src/contexts/) → Components → UI Components (src/components/ui/)
```

### Component Organization

```
src/components/
├── editor/           # Canvas editor components
│   ├── FabricCanvas.tsx      # Fabric.js canvas wrapper
│   ├── CanvasPropertiesPanel # Object property editing
│   ├── LayersPanel.tsx       # Z-order management
│   ├── ComponentsPanel.tsx   # Drag-and-drop elements
│   ├── TemplatesPanel.tsx    # Pre-built templates
│   └── properties/           # Property-specific editors
├── sections/         # Long page section previews (Hero, Schedule, Venue, etc.)
├── landing/          # Marketing landing page components
└── ui/               # shadcn/ui base components
```

### Key Architectural Patterns

**Server Functions** (`src/lib/*-server.ts`): Use `createServerFn()` from TanStack Start for type-safe server-client RPC. Current server modules:

- `invitation-server.ts` - CRUD for invitations
- `guest-server.ts` - Guest and group management
- `rsvp-server.ts` - RSVP responses
- `gallery-server.ts` - Photo gallery uploads
- `canvas-server.ts` - Fabric.js canvas state persistence

Pattern: export internal functions for testability, wrap with createServerFn for HTTP:

```typescript
// Internal function (testable with mocked db)
export async function doSomethingInternal(input) { ... }

// Server function wrapper
export const doSomething = createServerFn({ method: "POST" })
  .inputValidator((input) => input)
  .handler(async ({ data }) => doSomethingInternal(data));
```

**API Routes** (`src/routes/api.*.ts`): File upload endpoints using TanStack Start's API route pattern for hero images and gallery uploads.

**Route Loaders**: Routes use `beforeLoad` for auth checks and `loader` for data fetching. The builder route demonstrates the full pattern with auth redirect, user sync, and data loading.

**Context Pattern**: `InvitationBuilderContext` owns builder state (invitation data, schedule blocks, notes, guest groups, gallery images) and provides CRUD operations. Components read from context for live preview updates.

### Database Schema (`src/db/schema.ts`)

Core entities and their relationships:

- `users` → `invitations` (1:many) - couples create invitations
- `invitations` → `scheduleBlocks`, `notes`, `guestGroups`, `galleryImages`, `canvasStates` (1:many) - invitation content
- `guestGroups` → `guests` → `rsvpResponses` (nested) - RSVP tracking
- `guestGroups` → `guestSessions` (1:many) - token-based guest auth (no login required)

Key invitation fields:

- `decorativeSettings`: JSON for sparkles, double happiness, border styles

### Authentication

Two auth systems:

1. **Couple auth**: Neon Auth (Google OAuth) → `neon_auth.users` → synced to local `users` table via `syncUserFromNeonAuth()`
2. **Guest auth**: Token-based sessions for RSVP (`/rsvp#t=<TOKEN>`) → `guestSessions` table → cookie-based session

### Testing Pattern

Tests are colocated with source files (`*.test.ts` / `*.test.tsx`). Server functions use mocked Drizzle DB:

```typescript
vi.mock("@/db/index", () => ({
  db: { select: vi.fn(), insert: vi.fn(), ... }
}));
```

### Custom Hooks (`src/hooks/`)

- `useAutosave` - Debounced autosave for invitation changes
- `useImageUpload` - Hero image upload with progress
- `useGalleryUpload` - Multi-image gallery upload

## Code Style

- **Package manager:** pnpm (required)
- **Formatter/Linter:** Biome (tab indentation, double quotes)
- **Path aliases:** `@/*` maps to `./src/*`
- **UI components:** shadcn/ui in `src/components/ui/` - install via `pnpm dlx shadcn@latest add <component>`

### Key Dependencies

- **Fabric.js** - Canvas editor for free-form invitation design
- **Leaflet/React-Leaflet** - Venue maps
- **Embla Carousel** - Photo gallery carousel
- **date-fns** - Date formatting
- **Zod** - Schema validation

## Code Principles

**This codebase will outlive you.** Every shortcut becomes someone else's burden. Fight entropy.

- Write clear, readable code over clever code
- Extract reusable logic into well-named functions and hooks
- Keep components focused (single responsibility)
- Add types for all function parameters and return values
- Validate inputs with Zod before server operations

## TDD Workflow

Follow strict Test-Driven Development:

1. Write failing tests for requirements—include edge cases
2. Run tests and confirm they FAIL
3. Commit the tests
4. WAIT for approval before implementing
5. Implement code until tests pass—do NOT modify tests
6. Commit working implementation

No mocks unless absolutely necessary.
