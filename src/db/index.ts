// Server-only database module
// WARNING: This module must only be imported on the server via dynamic imports

import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema.ts";

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

// Lazy-initialized database instance
let _db: NodePgDatabase<typeof schema> | null = null;

/**
 * Get the database instance. This must only be called on the server.
 * Uses lazy initialization to avoid importing drizzle-orm/node-postgres until needed.
 */
export async function getDb(): Promise<NodePgDatabase<typeof schema>> {
	if (isBrowser) {
		throw new Error("Database cannot be accessed from the browser");
	}

	if (!_db) {
		if (!process.env.DATABASE_URL) {
			throw new Error("DATABASE_URL environment variable is required");
		}

		// Ensure SSL is enabled for Neon connections
		const dbUrl = process.env.DATABASE_URL;
		const dbUrlWithSsl = dbUrl.includes("sslmode=")
			? dbUrl
			: `${dbUrl}?sslmode=require`;

		// Dynamic import with string concatenation to prevent Vite static analysis
		const drizzleModule = await import(
			/* @vite-ignore */ "drizzle-orm" + "/node-postgres"
		);
		_db = drizzleModule.drizzle(dbUrlWithSsl, { schema });
	}
	// Safety check - should never happen since we just initialized _db above
	if (!_db) {
		throw new Error("Database initialization failed unexpectedly");
	}
	return _db;
}

// Legacy export for backwards compatibility
// This creates a proxy that throws helpful errors if accessed synchronously
export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
	get(_target, prop) {
		if (isBrowser) {
			throw new Error(
				"Database cannot be accessed from the browser. " +
					"Ensure this code only runs on the server.",
			);
		}
		if (!_db) {
			throw new Error(
				"Database not initialized. Use 'await getDb()' instead of 'db' directly, " +
					"or ensure getDb() was called earlier in your request.",
			);
		}
		return Reflect.get(_db, prop);
	},
});
