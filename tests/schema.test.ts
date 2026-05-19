import { describe, it, expect } from "vitest";
import { expenses } from "../lib/db/schema";
import type { InferSelectModel } from "drizzle-orm";

describe("schema exports expenses table with correct columns", () => {
  it("has all required columns", () => {
    const columnNames = Object.keys(expenses);
    expect(columnNames).toContain("id");
    expect(columnNames).toContain("amount");
    expect(columnNames).toContain("category");
    expect(columnNames).toContain("note");
    expect(columnNames).toContain("createdAt");
  });

  it("inferred select type has amount as string and note as string | null", () => {
    // TypeScript compile-time check via type assertion
    type Row = InferSelectModel<typeof expenses>;
    // amount is numeric → Drizzle maps it to string
    const _amountCheck: Row["amount"] = "10.50";
    // note is nullable text → string | null
    const _noteCheck: Row["note"] = null;
    const _noteCheck2: Row["note"] = "some note";
    expect(_amountCheck).toBe("10.50");
    expect(_noteCheck).toBeNull();
    expect(_noteCheck2).toBe("some note");
  });
});
