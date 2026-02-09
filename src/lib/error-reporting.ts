/**
 * Lightweight error reporting.
 *
 * In production, reports errors to Sentry via the HTTP envelope API
 * (no SDK dependency). In development, logs to console.
 */

interface SentryConfig {
	publicKey: string;
	host: string;
	projectId: string;
}

let sentryConfig: SentryConfig | null = null;
let initialized = false;

/**
 * Parse a Sentry DSN string into its components.
 * Format: https://<public_key>@<host>/<project_id>
 */
function parseDsn(dsn: string): SentryConfig | null {
	try {
		const url = new URL(dsn);
		const publicKey = url.username;
		const projectId = url.pathname.replace("/", "");
		const host = url.host;
		if (!publicKey || !projectId || !host) return null;
		return { publicKey, host, projectId };
	} catch {
		return null;
	}
}

/**
 * Get the Sentry DSN from the environment.
 * Checks client-side env first (VITE_SENTRY_DSN), then server-side (SENTRY_DSN).
 */
function getDsn(): string | undefined {
	if (typeof window !== "undefined") {
		// Client-side: Vite exposes VITE_ prefixed vars on import.meta.env
		return (import.meta as { env?: Record<string, string> }).env
			?.VITE_SENTRY_DSN;
	}
	// Server-side
	return process.env.SENTRY_DSN ?? process.env.VITE_SENTRY_DSN;
}

/**
 * Initialize error reporting. Call once at app startup.
 * Sets up global unhandled error/rejection handlers in production.
 */
export function initErrorReporting(): void {
	if (initialized) return;
	initialized = true;

	const dsn = getDsn();
	if (!dsn) return;

	const parsed = parseDsn(dsn);
	if (!parsed) {
		console.warn("[error-reporting] Invalid SENTRY_DSN format.");
		return;
	}
	sentryConfig = parsed;

	if (typeof window !== "undefined") {
		window.addEventListener("error", (event) => {
			reportError(event.error ?? new Error(event.message), {
				source: "window.onerror",
				filename: event.filename,
				lineno: event.lineno,
				colno: event.colno,
			});
		});

		window.addEventListener("unhandledrejection", (event) => {
			const error =
				event.reason instanceof Error
					? event.reason
					: new Error(String(event.reason));
			reportError(error, { source: "unhandledrejection" });
		});
	}
}

/**
 * Report an error. In development, logs to console.
 * In production with a valid DSN, sends to Sentry.
 */
export function reportError(
	error: unknown,
	context?: Record<string, unknown>,
): void {
	const err = error instanceof Error ? error : new Error(String(error));

	const isDev =
		(typeof process !== "undefined" &&
			process.env?.NODE_ENV !== "production") ||
		(typeof window !== "undefined" &&
			(import.meta as { env?: Record<string, string> }).env?.DEV === "true");

	if (isDev) {
		console.error("[error-reporting]", err, context);
		return;
	}

	if (!sentryConfig) {
		console.error("[error-reporting] No Sentry config — logging only:", err);
		return;
	}

	sendToSentry(err, context).catch((sendErr) => {
		console.error("[error-reporting] Failed to send to Sentry:", sendErr);
	});
}

/**
 * Build and send a Sentry event via the store endpoint.
 */
async function sendToSentry(
	error: Error,
	context?: Record<string, unknown>,
): Promise<void> {
	if (!sentryConfig) return;

	const { publicKey, host, projectId } = sentryConfig;
	const timestamp = new Date().toISOString();

	const event = {
		event_id: crypto.randomUUID().replace(/-/g, ""),
		timestamp,
		platform: typeof window !== "undefined" ? "javascript" : "node",
		level: "error",
		logger: "dreammoments",
		exception: {
			values: [
				{
					type: error.name,
					value: error.message,
					stacktrace: error.stack
						? { frames: parseStack(error.stack) }
						: undefined,
				},
			],
		},
		extra: context ?? {},
		tags: {
			runtime: typeof window !== "undefined" ? "browser" : "server",
		},
	};

	const url = `https://${host}/api/${projectId}/store/?sentry_version=7&sentry_key=${publicKey}`;

	await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(event),
	});
}

/**
 * Parse an Error stack string into Sentry-compatible frames.
 */
function parseStack(stack: string): Array<{
	filename: string;
	function: string;
	lineno?: number;
	colno?: number;
}> {
	const lines = stack.split("\n").slice(1);
	return lines
		.map((line) => {
			const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
			if (match) {
				return {
					function: match[1],
					filename: match[2],
					lineno: Number.parseInt(match[3], 10),
					colno: Number.parseInt(match[4], 10),
				};
			}
			const simpleMatch = line.match(/at\s+(.+?):(\d+):(\d+)/);
			if (simpleMatch) {
				return {
					function: "<anonymous>",
					filename: simpleMatch[1],
					lineno: Number.parseInt(simpleMatch[2], 10),
					colno: Number.parseInt(simpleMatch[3], 10),
				};
			}
			return null;
		})
		.filter(
			(
				f,
			): f is {
				filename: string;
				function: string;
				lineno: number;
				colno: number;
			} => f !== null,
		)
		.reverse(); // Sentry expects frames in caller-first order
}
