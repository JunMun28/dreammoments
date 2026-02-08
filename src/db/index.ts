import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool, type PoolConfig } from "pg";

import * as schema from "./schema";

// Database configuration types
export type DrizzleDB = NodePgDatabase<typeof schema>;

export interface DatabaseConfig {
	connectionString: string;
	maxConnections?: number;
	idleTimeoutMs?: number;
	connectionTimeoutMs?: number;
}

export interface HealthCheckResult {
	connected: boolean;
	latencyMs: number;
	error?: string;
}

// Check if we're in a server environment
const isServer = typeof window === "undefined";

/**
 * Check if the app is running in production mode
 */
export function isProduction(): boolean {
	return process.env.NODE_ENV === "production";
}

// Get database URL from environment
const databaseUrl = isServer ? process.env.DATABASE_URL : undefined;

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
			// Connection pool settings optimized for Neon PostgreSQL
			max: Number.parseInt(process.env.DB_POOL_MAX || "10", 10),
			idleTimeoutMillis: Number.parseInt(
				process.env.DB_IDLE_TIMEOUT || "30000",
				10,
			),
			connectionTimeoutMillis: Number.parseInt(
				process.env.DB_CONNECTION_TIMEOUT || "10000",
				10,
			),
			// Neon requires SSL — enforce certificate validation in production
			ssl:
				process.env.NODE_ENV === "production"
					? { rejectUnauthorized: true }
					: process.env.DB_SSL === "true"
						? { rejectUnauthorized: true }
						: undefined,
		}
	: null;

// Create connection pool (only on server with valid config)
let pool: Pool | null = null;

if (isServer && poolConfig) {
	pool = new Pool(poolConfig);

	// Handle pool errors gracefully
	pool.on("error", (err) => {
		console.error("[Database] Unexpected pool error:", err.message);
	});

	pool.on("connect", () => {
		if (process.env.NODE_ENV === "development") {
			console.log("[Database] New client connected to pool");
		}
	});
}

// Create Drizzle instance
export const db: DrizzleDB | null =
	pool && isServer ? drizzle(pool, { schema }) : null;

/**
 * Check if database is available
 */
export function isDatabaseAvailable(): boolean {
	return db !== null;
}

/**
 * Perform a health check on the database connection
 */
export async function checkDatabaseHealth(): Promise<HealthCheckResult> {
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
			const latencyMs = Date.now() - startTime;
			return {
				connected: true,
				latencyMs,
			};
		} finally {
			client.release();
		}
	} catch (error) {
		const latencyMs = Date.now() - startTime;
		return {
			connected: false,
			latencyMs,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Get pool statistics for monitoring
 */
export function getPoolStats(): {
	totalCount: number;
	idleCount: number;
	waitingCount: number;
} | null {
	if (!pool) {
		return null;
	}

	return {
		totalCount: pool.totalCount,
		idleCount: pool.idleCount,
		waitingCount: pool.waitingCount,
	};
}

/**
 * Gracefully close the database connection pool
 * Call this during application shutdown
 */
export async function closeDatabaseConnection(): Promise<void> {
	if (pool) {
		console.log("[Database] Closing connection pool...");
		await pool.end();
		console.log("[Database] Connection pool closed");
	}
}

/**
 * Get a database instance or throw an error.
 * In production this always throws if DATABASE_URL is missing (the startup
 * check already prevents that). In development it throws with a helpful
 * message so callers can fall back to the in-memory store.
 */
export function getDb(): DrizzleDB {
	if (!db) {
		throw new Error(
			"Database not available. Please set DATABASE_URL environment variable.",
		);
	}
	return db;
}

/**
 * Get a database instance or null
 * Use this when database is optional (graceful fallback to localStorage)
 */
export function getDbOrNull(): DrizzleDB | null {
	return db;
}

// Export schema for use in queries
export { schema };

// Export types from schema for convenience
export type {
	aiGenerations,
	guests,
	invitations,
	invitationViews,
	payments,
	users,
} from "./schema";
