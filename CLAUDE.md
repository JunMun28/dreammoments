# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DreamMoments is a wedding invitation builder + RSVP management platform. Built with TanStack Start (React full-stack framework), PostgreSQL via Neon Serverless, and Drizzle ORM. The design emphasizes cinematic, luxury aesthetics with glassmorphism patterns.

## Development Commands

```bash
pnpm dev                 # Start dev server on port 3000
pnpm build               # Production build
pnpm test                # Run all tests with Vitest
pnpm test src/lib/auth   # Run tests matching pattern
pnpm check               # Biome lint + format check
pnpm format              # Auto-format with Biome (use --write to apply)
pnpm db:push             # Push schema changes to DB
pnpm db:studio           # Open Drizzle Studio GUI
pnpm test:e2e            # Run Playwright E2E tests
```

## Architecture

### Data Flow

```
Routes (src/routes/) → Server Functions (src/lib/*-server.ts) → Drizzle ORM → Neon PostgreSQL
         ↓
    Context (src/contexts/) → Components → UI Components (src/components/ui/)
```

### Key Architectural Patterns

**Server Functions** (`src/lib/*-server.ts`): Use `createServerFn()` from TanStack Start for type-safe server-client RPC. Pattern: export internal functions for testability, wrap with createServerFn for HTTP:

```typescript
// Internal function (testable with mocked db)
export async function doSomethingInternal(input) { ... }

// Server function wrapper
export const doSomething = createServerFn({ method: "POST" })
  .inputValidator((input) => input)
  .handler(async ({ data }) => doSomethingInternal(data));
```

**Route Loaders**: Routes use `beforeLoad` for auth checks and `loader` for data fetching. The builder route demonstrates the full pattern with auth redirect, user sync, and data loading.

**Context Pattern**: `InvitationBuilderContext` owns builder state (invitation data, schedule blocks, notes, guest groups) and provides CRUD operations. Components read from context for live preview updates.

### Database Schema (`src/db/schema.ts`)

Core entities and their relationships:

- `users` → `invitations` (1:many) - couples create invitations
- `invitations` → `scheduleBlocks`, `notes`, `guestGroups` (1:many) - invitation content
- `guestGroups` → `guests` → `rsvpResponses` (nested) - RSVP tracking
- `guestGroups` → `guestSessions` (1:many) - token-based guest auth (no login required)

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

## Code Style

- **Package manager:** pnpm (required)
- **Formatter/Linter:** Biome (tab indentation, double quotes)
- **Path aliases:** `@/*` maps to `./src/*`
- **UI components:** shadcn/ui in `src/components/ui/` - install via `pnpm dlx shadcn@latest add <component>`

## Code Principles

**This codebase will outlive you.** Every shortcut becomes someone else's burden. Fight entropy.

- Write clear, readable code over clever code
- Extract reusable logic into well-named functions and hooks
- Keep components focused (single responsibility)
- Add types for all function parameters and return values
- Validate inputs with Zod before server operations
