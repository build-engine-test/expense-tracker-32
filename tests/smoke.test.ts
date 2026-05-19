import { describe, it, expect } from "vitest";

describe("home page module", () => {
  it("exports default async function", async () => {
    const mod = await import("../app/page");
    const defaultExport = mod.default;
    expect(typeof defaultExport).toBe("function");
    // AsyncFunction constructor name
    expect(defaultExport.constructor.name).toBe("AsyncFunction");
  });
});
