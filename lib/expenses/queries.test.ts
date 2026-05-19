import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Hoist mock variables so they're available inside vi.mock factory
// ---------------------------------------------------------------------------
const { mockFrom, mockSelect, mockDb } = vi.hoisted(() => {
  const mockFrom = vi.fn();
  const mockSelect = vi.fn(() => ({ from: mockFrom }));
  const mockDb = {
    select: mockSelect,
    insert: vi.fn(),
    delete: vi.fn(),
  };
  return { mockFrom, mockSelect, mockDb };
});

vi.mock("../db/client", () => ({
  db: mockDb,
}));

// Import queries AFTER the mock is registered
import { getTotal } from "./queries";

// ---------------------------------------------------------------------------
// getTotal
// ---------------------------------------------------------------------------
describe("getTotal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSelect.mockReturnValue({ from: mockFrom });
  });

  it("returns 0 for empty table (null SUM result)", async () => {
    mockFrom.mockResolvedValue([{ total: null }]);

    const result = await getTotal();

    expect(result).toBe(0);
    expect(typeof result).toBe("number");
  });

  it("sums numeric amounts as number (Postgres numeric returns string '37.50')", async () => {
    mockFrom.mockResolvedValue([{ total: "37.50" }]);

    const result = await getTotal();

    expect(result).toBe(37.5);
    expect(typeof result).toBe("number");
  });
});

