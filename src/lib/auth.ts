import { createAuthClient } from '@neondatabase/auth';
import { BetterAuthReactAdapter } from '@neondatabase/auth/react';

// Create the auth client
// Note: VITE_AUTH_BASE_URL should be set in .env if not using the default origin
export const authClient = createAuthClient(import.meta.env.VITE_AUTH_BASE_URL || 'http://localhost:3000', {
  adapter: BetterAuthReactAdapter(),
});
