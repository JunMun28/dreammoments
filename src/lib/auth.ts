import { createAuthClient } from "@neondatabase/auth";
import { BetterAuthReactAdapter } from "@neondatabase/auth/react";

/**
 * Neon Auth client for authentication.
 *
 * Requires VITE_NEON_AUTH_URL environment variable to be set.
 * Get this URL from your Neon Console's Auth Configuration tab.
 * Format: https://ep-xxx.neonauth.{region}.aws.neon.tech/{database}/auth
 */
const authUrl = import.meta.env.VITE_NEON_AUTH_URL;

if (!authUrl) {
	console.warn(
		"VITE_NEON_AUTH_URL is not set. Authentication will not work. " +
			"Set this in your .env.local file with the URL from Neon Console.",
	);
}

export const authClient = createAuthClient(authUrl || "", {
	adapter: BetterAuthReactAdapter(),
});

/**
 * React hook to access the current authentication session.
 *
 * Returns an object with:
 * - `isPending`: true while the session is being fetched
 * - `data`: the session data (null if not authenticated)
 *   - `data.user`: the authenticated user object
 *   - `data.session`: the session metadata
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const session = useSession();
 *
 *   if (session.isPending) return <div>Loading...</div>;
 *   if (!session.data) return <div>Not logged in</div>;
 *
 *   return <div>Hello, {session.data.user.name}</div>;
 * }
 * ```
 */
export const useSession = authClient.useSession;

/**
 * Get the current session (for use outside React components).
 * Returns a promise with session data or null if not authenticated.
 */
export const getSession = authClient.getSession;

/**
 * Sign out the current user.
 * Invalidates the session and clears auth state.
 */
export const signOut = authClient.signOut;
