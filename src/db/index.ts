import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";

import * as schema from "./schema";

type DrizzleDB = NodePgDatabase<typeof schema>;

// Check if we're in a server environment
const isServer = typeof window === "undefined";

function env(key: string): string | undefined {
	if (typeof process === "undefined") return undefined;
	return process.env[key];
}

export function isProduction(): boolean {
	if (typeof process !== "undefined" && process.env.NODE_ENV !== undefined) {
		return process.env.NODE_ENV === "production";
	}
	return import.meta.env.PROD;
}

// Get database URL from environment
const databaseUrl = isServer ? env("DATABASE_URL") : undefined;

// In production, DATABASE_URL is mandatory - fail hard at startup
if (isServer && isProduction() && !databaseUrl) {
	throw new Error(
		"[Database] FATAL: DATABASE_URL is required in production. " +
			"Set the DATABASE_URL environment variable to a valid PostgreSQL connection string.",
	);
}

// In development without DATABASE_URL, log a clear warning
if (isServer && !isProduction() && !databaseUrl) {
	console.warn(
		"[Database] WARNING: DATABASE_URL is not set. " +
			"Running in development mode with limited functionality (in-memory fallback). " +
			"Set DATABASE_URL to connect to PostgreSQL.",
	);
}

// Connection pool configuration
const poolConfig: PoolConfig | null = databaseUrl
	? {
			connectionString: databaseUrl,
			max: Number.parseInt(env("DB_POOL_MAX") || "10", 10),
			idleTimeoutMillis: Number.parseInt(env("DB_IDLE_TIMEOUT") || "30000", 10),
			connectionTimeoutMillis: Number.parseInt(
				env("DB_CONNECTION_TIMEOUT") || "10000",
				10,
			),
			ssl: isProduction()
				? { rejectUnauthorized: true }
				: env("DB_SSL") === "true"
					? { rejectUnauthorized: true }
					: undefined,
		}
	: null;

// Create connection pool (only on server with valid config)
let pool: Pool | null = null;

if (isServer && poolConfig) {
	pool = new Pool(poolConfig);

	pool.on("error", (err) => {
		console.error("[Database] Unexpected pool error:", err.message);
	});

	pool.on("connect", () => {
		if (!isProduction()) {
			console.log("[Database] New client connected to pool");
		}
	});
}

// Create Drizzle instance
export const db: DrizzleDB | null =
	pool && isServer ? drizzle(pool, { schema }) : null;

export function isDatabaseAvailable(): boolean {
	return db !== null;
}

export async function checkDatabaseHealth(): Promise<{
	connected: boolean;
	latencyMs: number;
	error?: string;
}> {
	if (!pool) {
		return {
			connected: false,
			latencyMs: 0,
			error: "Database not configured (DATABASE_URL not set)",
		};
	}

	const startTime = Date.now();

	try {
		const client = await pool.connect();
		try {
			await client.query("SELECT 1 as health_check");
			return {
				connected: true,
				latencyMs: Date.now() - startTime,
			};
		} finally {
			client.release();
		}
	} catch (error) {
		return {
			connected: false,
			latencyMs: Date.now() - startTime,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

export function getDbOrNull(): DrizzleDB | null {
	return db;
}

export { schema };
