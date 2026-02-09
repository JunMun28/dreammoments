/**
 * CSRF token generation and validation.
 * Tokens are stored in-memory with a 1-hour TTL.
 */

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

interface CsrfEntry {
	expiresAt: number;
}

const tokenStore = new Map<string, CsrfEntry>();

/** Cleanup expired tokens periodically */
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function startCleanup() {
	if (cleanupTimer) return;
	cleanupTimer = setInterval(() => {
		const now = Date.now();
		for (const [token, entry] of tokenStore) {
			if (now >= entry.expiresAt) {
				tokenStore.delete(token);
			}
		}
	}, CLEANUP_INTERVAL_MS);
	if (typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
		cleanupTimer.unref();
	}
}

/**
 * Generate a new CSRF token and store it.
 */
export function generateCsrfToken(): string {
	startCleanup();
	const token = crypto.randomUUID();
	tokenStore.set(token, { expiresAt: Date.now() + TOKEN_TTL_MS });
	return token;
}

/**
 * Validate a CSRF token. Returns true if valid, false otherwise.
 * Valid tokens are consumed (one-time use).
 */
export function validateCsrfToken(token: string | null | undefined): boolean {
	if (!token) return false;

	const entry = tokenStore.get(token);
	if (!entry) return false;

	// Check expiry before deleting to avoid race condition
	if (Date.now() >= entry.expiresAt) {
		tokenStore.delete(token);
		return false;
	}

	// Remove the token (one-time use)
	tokenStore.delete(token);
	return true;
}
