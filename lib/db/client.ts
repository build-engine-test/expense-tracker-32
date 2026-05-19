import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL environment variable is not set. " +
      "Please configure a valid PostgreSQL connection string."
  );
}

const queryClient = postgres(databaseUrl, {
  ssl: databaseUrl.includes("localhost") ? false : { rejectUnauthorized: false },
});

export const db = drizzle(queryClient, { schema });
