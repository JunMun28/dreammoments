import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: [".env.local", ".env"] });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	console.warn(
		"Warning: DATABASE_URL is not set. Drizzle commands will fail.",
	);
	console.warn("Please set DATABASE_URL in .env.local or .env file.");
}

export default defineConfig({
	out: "./drizzle",
	schema: "./src/db/schema.ts",
	dialect: "postgresql",
	dbCredentials: {
		url: databaseUrl ?? "",
	},
	// Verbose output for debugging
	verbose: true,
	// Strict mode for safer migrations
	strict: true,
});
