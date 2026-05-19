import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("client throws on missing DATABASE_URL", () => {
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.DATABASE_URL;
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.DATABASE_URL = originalEnv;
    } else {
      delete process.env.DATABASE_URL;
    }
    vi.resetModules();
  });

  it("throws an Error with a clear message when DATABASE_URL is not set", async () => {
    delete process.env.DATABASE_URL;
    vi.resetModules();

    // The module no longer throws at import time (so the HTTP server can bind
    // even before env vars are fully available). Instead it throws lazily on
    // first use via getDb().
    const mod = await import("./client");

    let thrownError: unknown = null;
    try {
      mod.getDb();
    } catch (err) {
      thrownError = err;
    }

    expect(thrownError).toBeInstanceOf(Error);
    const errorMessage = (thrownError as Error).message;
    expect(errorMessage.length).toBeGreaterThan(0);
    // Must NOT leak the actual connection string in the error message
    if (originalEnv) {
      expect(errorMessage).not.toContain(originalEnv);
    }
    // Should mention DATABASE_URL conceptually but not contain its value
    expect(errorMessage.toLowerCase()).toMatch(/database_url|environment|connection/);
  });
});
