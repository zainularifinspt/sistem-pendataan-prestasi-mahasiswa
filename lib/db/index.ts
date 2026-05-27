import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

config({ path: ".env.local" });
config();

const connectionString =
  process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/prestasi_app";

declare global {
  var pgPool: Pool | undefined;
}

export const pool =
  globalThis.pgPool ??
  new Pool({
    connectionString,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.pgPool = pool;
}

export const db = drizzle(pool, { schema });
export { schema };
