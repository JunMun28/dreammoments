/**
 * Simple in-memory rate limiter with TTL-based cleanup.
 * No external dependencies required.
 */

interface RateLimitEntry {
	count: number;
	resetAt: number;
}

interface RateLimiterOptions {
	/** Maximum number of requests allowed within the window */
	maxAttempts: number;
	/** Time window in milliseconds */
	windowMs: number;
}

const stores = new Map<string, Map<string, RateLimitEntry>>();

/** Cleanup interval: runs every 5 minutes */
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function startCleanup() {
	if (cleanupTimer) return;
	cleanupTimer = setInterval(() => {
		const now = Date.now();
		for (const store of stores.values()) {
			for (const [key, entry] of store) {
				if (now >= entry.resetAt) {
					store.delete(key);
				}
			}
		}
	}, CLEANUP_INTERVAL_MS);
	// Allow the process to exit even if the timer is running
	if (
		cleanupTimer &&
		typeof cleanupTimer === "object" &&
		"unref" in cleanupTimer
	) {
		cleanupTimer.unref();
	}
}

function getStore(name: string): Map<string, RateLimitEntry> {
	let store = stores.get(name);
	if (!store) {
		store = new Map();
		stores.set(name, store);
		startCleanup();
	}
	return store;
}

export interface RateLimitResult {
	allowed: boolean;
	remaining: number;
	resetAt: number;
}

export function createRateLimiter(name: string, options: RateLimiterOptions) {
	const { maxAttempts, windowMs } = options;

	return function checkRateLimit(key: string): RateLimitResult {
		const store = getStore(name);
		const now = Date.now();
		const entry = store.get(key);

		if (!entry || now >= entry.resetAt) {
			// First request or window expired -- start a new window
			store.set(key, { count: 1, resetAt: now + windowMs });
			return {
				allowed: true,
				remaining: maxAttempts - 1,
				resetAt: now + windowMs,
			};
		}

		if (entry.count >= maxAttempts) {
			return { allowed: false, remaining: 0, resetAt: entry.resetAt };
		}

		entry.count++;
		return {
			allowed: true,
			remaining: maxAttempts - entry.count,
			resetAt: entry.resetAt,
		};
	};
}

// ── Pre-configured limiters ──────────────────────────────────────────

/** Auth endpoints: 5 attempts per 15 minutes per key */
export const authRateLimit = createRateLimiter("auth", {
	maxAttempts: 5,
	windowMs: 15 * 60 * 1000,
});

/** RSVP submissions: 10 per hour per key */
export const rsvpRateLimit = createRateLimiter("rsvp", {
	maxAttempts: 10,
	windowMs: 60 * 60 * 1000,
});
