// Kysely Postgres client setup.
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

import { getConfig } from "../config";
import type { Database } from "../types/database";

const config = getConfig();

// Shared pg pool for all DB operations.
export const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Shared Kysely instance for typed SQL operations.
export const db = new Kysely<Database>({
  dialect: new PostgresDialect({ pool })
});