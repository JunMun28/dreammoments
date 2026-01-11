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
