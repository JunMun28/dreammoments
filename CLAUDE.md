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
pnpm db:studio        # Drizzle Studio GUI
```

## Directory Guide

```
src/
  routes/              # File-based router pages (TanStack Router)
  components/
    templates/         # 4 wedding invitation templates (blush-romance, eternal-elegance, garden-romance, love-at-dusk)
    landing/           # Landing page sections
    share/             # Share/invite modal
  lib/                 # Core utilities (auth, store, data, types, ai, slug, scroll-effects)
  db/                  # Drizzle schema and DB connection
  integrations/        # React Query configuration
  templates/           # Template definitions
  data/                # Sample data
tests/
  e2e/                 # Playwright E2E tests
```

## Key Patterns

- **Routing**: `createFileRoute()` with `component` export; dynamic segments use `$` prefix (`$slug`, `$invitationId`)
- **Templates**: Renderer pattern (`TemplateRenderer.tsx`, `InvitationRenderer.tsx`) with section visibility toggles
- **Auth**: Google OAuth + email/password via `AuthContext` in `lib/auth.tsx`
- **Database**: 6 tables (users, invitations, guests, invitation_views, ai_generations, payments), UUID PKs, JSONB for flexible content
- **Design tokens**: CSS custom properties (`--dm-bg`, `--dm-ink`, `--dm-peach`, `--dm-sage`, `--dm-lavender`); fonts: Outfit (body) + Reenie Beanie (accents)
- **Class merging**: `cn()` helper using `clsx` + `tailwind-merge`
- **Imports**: Path alias `@/*` maps to `./src/*`

## Environment

- Node: ^20.19.0 || >=22.12.0
- Requires `DATABASE_URL` env var for PostgreSQL
- Google OAuth: `VITE_GOOGLE_CLIENT_ID`, `VITE_GOOGLE_REDIRECT_URI`
- Local env file: `.env.local`

## Conventions

- TypeScript strict mode
- Functional components with hooks
- Accessibility: skip-to-content link, focus-visible states, semantic HTML, ARIA labels
- Components: PascalCase. Utilities: camelCase. Routes: kebab-case
