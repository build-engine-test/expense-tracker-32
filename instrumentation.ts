export async function register() {
  // Only run on the Node.js server (not edge runtime)
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    // No DB configured — skip migration (will fail at query time with a clear error)
    return;
  }

  try {
    // Use postgres directly to avoid circular import with drizzle client
    const { default: postgres } = await import("postgres");
    const sql = postgres(databaseUrl, {
      ssl: databaseUrl.includes("localhost")
        ? false
        : { rejectUnauthorized: false },
      max: 1,
      connect_timeout: 10,
    });

    // Idempotent schema bootstrap — safe to run on every startup
    await sql`
      CREATE TABLE IF NOT EXISTS "expenses" (
        "id"         bigserial PRIMARY KEY NOT NULL,
        "amount"     numeric(10, 2) NOT NULL,
        "category"   text NOT NULL,
        "note"       text,
        "created_at" timestamp with time zone DEFAULT now() NOT NULL,
        CONSTRAINT "expenses_amount_positive"    CHECK ("amount" > 0),
        CONSTRAINT "expenses_category_nonempty"  CHECK (length("category") > 0)
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS "expenses_created_at_idx"
        ON "expenses" ("created_at" DESC NULLS LAST)
    `;

    await sql.end();
  } catch (err) {
    // Log but do not crash the server — the error boundary on each page
    // will surface DB errors gracefully to the user.
    // eslint-disable-next-line no-console
    console.error("[instrumentation] DB bootstrap failed:", err);
  }
}
