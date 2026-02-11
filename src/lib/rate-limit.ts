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

/** Maximum entries per store to prevent memory exhaustion */
const MAX_STORE_ENTRIES = 10_000;

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
	if (typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
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
			// Evict oldest entries if store is at capacity
			if (store.size >= MAX_STORE_ENTRIES) {
				let oldest: { key: string; resetAt: number } | null = null;
				for (const [k, v] of store) {
					if (now >= v.resetAt) {
						store.delete(k);
					} else if (!oldest || v.resetAt < oldest.resetAt) {
						oldest = { key: k, resetAt: v.resetAt };
					}
				}
				// If still at capacity after purging expired, evict oldest
				if (store.size >= MAX_STORE_ENTRIES && oldest) {
					store.delete(oldest.key);
				}
			}
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

// ── DB-backed rate limiter (multi-instance safe) ─────────────────────

/**
 * Create a DB-backed rate limiter that uses INSERT ... ON CONFLICT
 * for atomic increments. Falls back to in-memory when DB is unavailable.
 */
export function createDbRateLimiter(name: string, options: RateLimiterOptions) {
	const inMemoryFallback = createRateLimiter(`${name}:fallback`, options);
	const { maxAttempts, windowMs } = options;

	return async function checkDbRateLimit(
		key: string,
	): Promise<RateLimitResult> {
		// biome-ignore lint/suspicious/noExplicitAny: dynamic import avoids circular dep
		let db: any;
		try {
			const mod = await import("@/db/index");
			db = mod.getDbOrNull();
		} catch {
			db = null;
		}

		if (!db) {
			return inMemoryFallback(key);
		}

		try {
			const { sql } = await import("drizzle-orm");
			const now = new Date();
			const resetAt = new Date(Date.now() + windowMs);

			// Atomic upsert: insert or increment count, reset window if expired
			const result = await db.execute(sql`
				INSERT INTO rate_limit_entries (key, store_name, count, reset_at)
				VALUES (${key}, ${name}, 1, ${resetAt})
				ON CONFLICT (key, store_name) DO UPDATE SET
					count = CASE
						WHEN rate_limit_entries.reset_at <= ${now}
						THEN 1
						ELSE rate_limit_entries.count + 1
					END,
					reset_at = CASE
						WHEN rate_limit_entries.reset_at <= ${now}
						THEN ${resetAt}
						ELSE rate_limit_entries.reset_at
					END
				RETURNING count, reset_at
			`);

			const row = (result as { rows: Array<{ count: number; reset_at: Date }> })
				.rows[0];
			if (!row) {
				return inMemoryFallback(key);
			}

			const count = Number(row.count);
			const entryResetAt = new Date(row.reset_at).getTime();

			return {
				allowed: count <= maxAttempts,
				remaining: Math.max(0, maxAttempts - count),
				resetAt: entryResetAt,
			};
		} catch {
			// DB error -- fall back to in-memory
			return inMemoryFallback(key);
		}
	};
}

// ── Pre-configured limiters ──────────────────────────────────────────

/** Auth endpoints: 10 attempts per 15 minutes per key */
export const authRateLimit = createRateLimiter("auth", {
	maxAttempts: 10,
	windowMs: 15 * 60 * 1000,
});

/** Format a resetAt timestamp into a user-friendly rate limit message */
export function formatRateLimitMessage(resetAt: number): string {
	const minutes = Math.max(1, Math.ceil((resetAt - Date.now()) / 60_000));
	return `Too many attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.`;
}

/** RSVP submissions: 10 per hour per key */
export const rsvpRateLimit = createRateLimiter("rsvp", {
	maxAttempts: 10,
	windowMs: 60 * 60 * 1000,
});
