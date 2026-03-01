# DreamMoments

AI-powered digital wedding invitation SaaS for Chinese couples in Malaysia/Singapore.

## Tech Stack

- **Framework**: React 19 + TypeScript + TanStack Start (Vite 7 + Nitro SSR)
- **Routing**: TanStack Router (file-based, `/src/routes/`)
- **State**: React Query for server state, localStorage custom store for client state, Context API for auth
- **Styling**: Tailwind CSS 4 (Vite plugin) + Motion for scroll animations
- **Database**: PostgreSQL + Drizzle ORM
- **Testing**: Vitest (unit) + Playwright (E2E, 3 browsers)
- **Code Quality**: Biome (tabs, double quotes, auto-import organization)
- **Package Manager**: pnpm

## Commands

```
pnpm dev              # Dev server at localhost:3000
pnpm build            # Production build
pnpm test             # Unit tests (Vitest)
pnpm test:e2e         # E2E tests (Playwright: Chromium, WebKit, Android)
pnpm test:e2e:headed  # E2E tests in headed mode
pnpm lint             # Biome lint
pnpm format           # Biome format
pnpm check            # Biome lint + format
pnpm db:generate      # Generate Drizzle migrations
pnpm db:migrate       # Run migrations
pnpm db:push          # Push schema to DB
pnpm db:pull          # Pull schema from DB
pnpm db:studio        # Drizzle Studio GUI
pnpm db:seed          # Seed database with sample data
```

## Directory Guide

```
src/
  api/                 # Server API route handlers (ai, auth, guests, invitations, public)
  routes/              # File-based router pages (TanStack Router)
    auth/              # Login, signup, reset, OAuth callback
    dashboard/         # User dashboard with invitation management
    editor/            # Invitation editor ($invitationId)
    invite/            # Public invitation view ($slug)
  components/
    editor/            # Editor UI (context panel, toolbar, field renderers, inline edit, AI assistant)
      hooks/           # Editor hooks (useAutoSave, useEditorState, useFieldValidation, useInlineEdit, etc.)
    templates/         # Wedding invitation template (double-happiness)
    landing/           # Landing page sections
    share/             # Share/invite modal
    ui/                # Shared UI primitives (LoadingSpinner, Skeleton)
  lib/                 # Core utilities (auth, ai, session, validation, store, slug, scroll-effects, utils)
  db/                  # Drizzle schema, DB connection, seed data
  integrations/        # React Query configuration
  templates/           # Template definitions
  data/                # Sample data
tests/
  e2e/                 # Playwright E2E tests
```

## Key Patterns

- **Routing**: `createFileRoute()` with `component` export; dynamic segments use `$` prefix (`$slug`, `$invitationId`)
- **API routes**: Server functions in `src/api/` (auth, invitations, guests, ai, public)
- **Templates**: Renderer pattern (`TemplateRenderer.tsx`, `InvitationRenderer.tsx`) with section visibility toggles
- **Editor**: Context panel + preview frame layout with auto-save, inline editing, AI assistant drawer, and section-based navigation
- **Auth**: Google OAuth + email/password via `AuthContext` in `lib/auth.tsx`; JWT sessions via `jose` in `lib/session.ts`
- **Validation**: Zod schemas in `lib/validation.ts` for input validation
- **Database**: 6 tables (users, invitations, guests, invitation_views, ai_generations, payments), UUID PKs, JSONB for flexible content
- **Design tokens**: CSS custom properties in `:root` — surfaces (`--dm-bg` #F8F8F8, `--dm-surface` #FFFFFF), ink (`--dm-ink` #1A1A1A), borders (`--dm-border` #E0E0E0), accent dusty rose (`--dm-primary` #C4727F); editor chrome font: Inter only. Template/invitation content fonts are separate.
- **Class merging**: `cn()` helper using `clsx` + `tailwind-merge`
- **Imports**: Path alias `@/*` maps to `./src/*`

## Environment

- Node: ^20.19.0 || >=22.12.0
- Requires `DATABASE_URL` env var for PostgreSQL
- Google OAuth: `VITE_GOOGLE_CLIENT_ID`, `VITE_GOOGLE_REDIRECT_URI`
- Local env file: `.env.local`

## Pre-commit Checklist

Before every commit, run these commands and ensure they all pass:

```
pnpm check            # Biome lint + format (CI runs this — must pass)
npx tsc --noEmit      # TypeScript type check
pnpm test --run       # Unit tests
```

## Conventions

- TypeScript strict mode
- Functional components with hooks
- Accessibility: skip-to-content link, focus-visible states, semantic HTML, ARIA labels
- Components: PascalCase. Utilities: camelCase. Routes: kebab-case
