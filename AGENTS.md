# Repository Guidelines

## Project Structure & Module Organization
- `src/` app code.
- `src/routes/` file-based routes (TanStack Router). `__root.tsx` layout, `index.tsx` home.
- `src/components/` UI pieces.
- `src/lib/` utilities. `src/data/` static data. `src/integrations/` external services.
- `src/db/` Drizzle schema + helpers. `drizzle/` generated migrations.
- `public/` static assets.
- `src/styles.css` global styles. `src/router.tsx` router setup.

## Build, Test, and Development Commands
- `pnpm dev` Vite dev server on port `3000`.
- `pnpm build` production build.
- `pnpm preview` serve built output.
- `pnpm test` Vitest run (single pass).
- `pnpm lint` Biome lint. `pnpm format` format. `pnpm check` lint + format.
- DB: `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:push`, `pnpm db:pull`, `pnpm db:studio`.

## Coding Style & Naming Conventions
- TypeScript + React. Indent tabs. Quotes double. Managed by Biome.
- Run `pnpm check` before PR.
- Components `PascalCase.tsx`. Hooks `useX.ts`. Route files map to URL path segments.

## Testing Guidelines
- Frameworks: Vitest + Testing Library.
- No coverage threshold set.
- Naming: `*.test.ts` / `*.test.tsx` near code or in `tests/`.
- TDD: write failing test first, then implement.
- Always run `pnpm test` and report results.
- Set `passes: true` only after tests + manual verify.

## Commit & Pull Request Guidelines
- Git history empty; no established pattern yet.
- Suggested commit style: Conventional Commits `feat:`, `fix:`, `chore:` with short imperative subject.
- PRs: summary, testing notes, link issue if any, screenshots for UI changes.

## Security & Configuration
- Env loaded from `.env.local` then `.env` (see `drizzle.config.ts`).
- Required for DB work: `DATABASE_URL`.
Example:
```
DATABASE_URL=postgres://user:pass@host:5432/db
```
