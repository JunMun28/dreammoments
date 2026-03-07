# Clerk Auth Migration Design

Replace custom JWT/bcrypt/Google OAuth auth system with Clerk managed authentication.

## Context

DreamMoments currently uses a hand-rolled auth system:
- JWT sessions via `jose`, bcrypt password hashing, Google OAuth
- Custom `AuthContext` with `useAuth()` hook (12 client files)
- Custom `requireAuth()` server helper (16 API files)
- DB tables: `users`, `passwordResetTokens`, `tokenBlocklist`
- Auth routes: `/auth/login`, `/auth/signup`, `/auth/callback`, `/auth/reset`

Clerk replaces all of this with a managed service. The app already has a Clerk project configured with Google OAuth and email verification.

## Decisions

- **User sync**: Hybrid just-in-time — on first API call, find-or-create user in DB by `clerkId`
- **Auth UI**: Clerk Account Portal (hosted) — delete all custom auth routes
- **SDK**: `@clerk/tanstack-react-start`

## Architecture

### Server Auth

```typescript
// src/lib/server-auth.ts (new implementation)
import { auth, clerkClient } from '@clerk/tanstack-react-start/server'

export async function requireAuth(): Promise<{ userId: string; user: User }> {
  const { userId } = await auth()
  if (!userId) throw new Error('Authentication required')

  // JIT find-or-create in DB
  let [user] = await db.select().from(users).where(eq(users.clerkId, userId))

  if (!user) {
    const clerkUser = await clerkClient().users.getUser(userId)
    const email = clerkUser.emailAddresses.find(
      e => e.id === clerkUser.primaryEmailAddressId
    )?.emailAddress ?? clerkUser.emailAddresses[0].emailAddress;
    [user] = await db.insert(users).values({
      clerkId: userId,
      email,
      name: clerkUser.firstName ?? clerkUser.lastName ?? undefined,
      avatarUrl: clerkUser.imageUrl,
      plan: 'free',
    }).returning()
  }

  return { userId: user.id, user }
}
```

All 16 API files continue calling `requireAuth()` with the same return shape.

### Client Auth

Replace `<AuthProvider>` with `<ClerkProvider>` in `__root.tsx`.
Replace `useAuth()` calls with Clerk hooks:
- `useUser()` for user data
- `useAuth()` for auth state (isSignedIn, userId)
- `useClerk()` for actions (signOut, openSignIn)
- `<SignedIn>`, `<SignedOut>`, `<UserButton>`, `<SignInButton>` components

### Database Changes

**Schema migration:**
- Add `clerkId varchar(255) UNIQUE` to `users` table
- Drop `passwordHash`, `authProvider` columns
- Drop `passwordResetTokens` table
- Drop `tokenBlocklist` table

### Middleware

```typescript
// src/start.ts (new file)
import { clerkMiddleware } from '@clerk/tanstack-react-start/server'
import { createStart } from '@tanstack/react-start'

export const startInstance = createStart(() => ({
  requestMiddleware: [clerkMiddleware()],
}))
```

## Files to Delete

- `src/api/auth.ts` — custom auth server functions (signup, login, logout, Google OAuth, password reset)
- `src/lib/auth.tsx` — custom AuthContext/AuthProvider
- `src/lib/session.ts` — JWT creation/verification via jose
- `src/lib/auth-cookies.ts` — cookie management
- `src/lib/auth-errors.ts` — error message mapping
- `src/lib/auth-redirect.ts` — redirect sanitization
- `src/routes/auth/login.tsx` — login page
- `src/routes/auth/signup.tsx` — signup page
- `src/routes/auth/callback.tsx` — Google OAuth callback
- `src/routes/auth/reset.tsx` — password reset page

## Files to Modify

- `src/routes/__root.tsx` — replace AuthProvider with ClerkProvider, update CSP
- `src/lib/server-auth.ts` — rewrite requireAuth to use Clerk auth()
- `src/components/Header.tsx` — use Clerk components (UserButton, SignInButton)
- `src/routes/dashboard/index.tsx` — replace useAuth with useUser/useAuth
- `src/routes/dashboard/$invitationId/index.tsx` — same
- `src/routes/editor/new.tsx` — same
- `src/routes/editor/canvas/$invitationId.tsx` — same
- `src/routes/invite/$slug.tsx` — same
- `src/routes/upgrade/index.tsx` — same
- `src/routes/upgrade/success.tsx` — same
- `src/routes/index.tsx` — same
- `src/db/schema.ts` — add clerkId, drop auth-related columns/tables
- `package.json` — add @clerk/tanstack-react-start, remove bcryptjs, jose
- `.env` — add CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY

## Dependencies

**Add:** `@clerk/tanstack-react-start`
**Remove:** `bcryptjs`, `jose`, `@types/bcryptjs`

## Clerk API Keys

- Publishable: `pk_test_dGhhbmtmdWwtd29sZi04MS5jbGVyay5hY2NvdW50cy5kZXYk`
- Secret: stored in `.env` (not committed)

## CSP Updates

Add to Content-Security-Policy in `__root.tsx`:
- `script-src`: add `https://*.clerk.accounts.dev`
- `connect-src`: add `https://*.clerk.accounts.dev https://api.clerk.com`
- `img-src`: add `https://img.clerk.com`
- `frame-src`: add `https://*.clerk.accounts.dev`
