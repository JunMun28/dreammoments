import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema.ts";

const databaseUrl = process.env.DATABASE_URL;

export const db = databaseUrl ? drizzle(databaseUrl, { schema }) : null;
