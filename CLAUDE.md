# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DreamMoments is a wedding invitation builder + RSVP management + photo upload platform. Built with TanStack Start (React full-stack framework), PostgreSQL via Neon Serverless, and Drizzle ORM. The design philosophy emphasizes cinematic, luxury aesthetics with glassmorphism patterns.

## Development Commands

```bash
pnpm dev                 # Start dev server on port 3000
pnpm build               # Production build
pnpm test                # Run tests with Vitest
pnpm check               # Run Biome linting + formatting check
pnpm format              # Auto-format with Biome
pnpm db:generate         # Generate Drizzle migrations
pnpm db:migrate          # Run migrations
pnpm db:push             # Push schema directly to DB
pnpm db:studio           # Open Drizzle Studio GUI
```

## Architecture

### Routing (TanStack Router)
- File-based routing in `src/routes/`
- `__root.tsx` is the root layout
- API routes use `server: { handlers: { GET, POST } }` pattern
- Route loaders fetch data before render via `loader:` function

### Server Functions
Use `createServerFn()` for type-safe server-client RPC:
```typescript
const getData = createServerFn({ method: 'GET' })
  .handler(async () => { /* runs on server */ })
```

### Data Fetching
- TanStack Query for client state management with caching
- Server functions for direct RPC calls
- SSR integration via `@tanstack/react-router-ssr-query`

### Database
- PostgreSQL with Neon Serverless (`@neondatabase/serverless`)
- Drizzle ORM with schema at `src/db/schema.ts`
- Database client at `src/db.ts`
- Requires `VITE_DATABASE_URL` in `.env.local`

### Forms
- TanStack React Form with Zod validation
- Custom `useAppForm` hook at `src/hooks/demo.form.ts`
- Reusable form components at `src/components/demo.FormComponents.tsx`

### UI Components
- shadcn/ui components in `src/components/ui/`
- Install new components: `pnpm dlx shadcn@latest add <component>`
- Tailwind CSS 4.0 with Vite plugin (styles in `src/styles.css`)
- New York style, zinc color palette

## Code Principles

**This codebase will outlive you.** Every shortcut becomes someone else's burden. Every hack compounds into technical debt that slows the whole team down.

You are not just writing code. You are shaping the future of this project. The patterns you establish will be copied. The corners you cut will be cut again.

**Fight entropy. Leave the codebase better than you found it.**

- Write clear, readable code over clever code
- Extract reusable logic into well-named functions and hooks
- Keep components focused (single responsibility)
- Handle errors gracefully with user-friendly messages
- Add types for all function parameters and return values
- Test critical paths (auth, data mutations, payments)

## Code Style

- **Package manager:** pnpm (required)
- **Formatter/Linter:** Biome (tab indentation, double quotes)
- **Path aliases:** `@/*` maps to `./src/*`
- Validate inputs with Zod before server operations
- Use shadcn/ui primitives from `@/components/ui`
