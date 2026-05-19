import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function createDb() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL environment variable is not set. " +
        "Please configure a valid PostgreSQL connection string."
    );
  }

  const queryClient = postgres(databaseUrl, {
    ssl: databaseUrl.includes("localhost") ? false : { rejectUnauthorized: false },
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  return drizzle(queryClient, { schema });
}

// Lazily initialise on first use so the HTTP server can bind even when
// DATABASE_URL is not yet available at module-evaluation time (e.g. during
// Next.js startup on Render before env vars are fully injected).
let _db: ReturnType<typeof createDb> | undefined;

export function getDb(): ReturnType<typeof createDb> {
  if (!_db) {
    _db = createDb();
  }
  return _db;
}

// Keep a named `db` export for backwards-compatibility with existing imports.
export const db = new Proxy({} as ReturnType<typeof createDb>, {
  get(_target, prop) {
    return getDb()[prop as keyof ReturnType<typeof createDb>];
  },
});
