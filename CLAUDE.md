# DreamMoments

AI-powered digital wedding invitation SaaS for Chinese couples in Malaysia/Singapore.



## Key Patterns

- **Routing**: `createFileRoute()`, dynamic segments use `$` prefix (`$slug`, `$invitationId`)
- **Auth**: Google OAuth + email/password via `AuthContext`; JWT sessions via `jose`
- **Database**: UUID PKs, JSONB for flexible content. Schema in `src/db/schema.ts`
- **Imports**: `@/*` maps to `./src/*`
- **Class merging**: `cn()` via `clsx` + `tailwind-merge`
- **Design tokens**: CSS custom properties prefixed `--dm-` (e.g. `--dm-primary` #C4727F dusty rose)

## Pre-commit Checklist

Run ALL before committing. CI will reject the PR if any fail.

```
pnpm check                  # 1. Biome lint + format
pnpm exec tsc --noEmit      # 2. TypeScript type check
pnpm test --run             # 3. Unit tests
pnpm build                  # 4. Production build
pnpm db:generate            # 5. Migration drift check — commit new drizzle/ files if generated
```

CI also runs `pnpm exec playwright test --project=chromium` for E2E.

## Conventions

- TypeScript strict mode, functional components with hooks
- Naming: Components PascalCase, utilities camelCase, routes kebab-case
- Accessibility: semantic HTML, ARIA labels, focus-visible states
