import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: [".env.local", ".env"] });

// Ensure SSL is enabled for Neon connections
const dbUrl = process.env.DATABASE_URL!;
const dbUrlWithSsl = dbUrl.includes("sslmode=")
  ? dbUrl
  : `${dbUrl}?sslmode=require`;

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrlWithSsl,
  },
});
