import { describe, it, expect, vi, beforeEach } from "vitest";

// ---------------------------------------------------------------------------
// Hoist mocks so they're available in vi.mock factory
// ---------------------------------------------------------------------------
const { mockInsertExpense, mockRemoveExpense, mockRevalidatePath } =
  vi.hoisted(() => {
    return {
      mockInsertExpense: vi.fn(),
      mockRemoveExpense: vi.fn(),
      mockRevalidatePath: vi.fn(),
    };
  });

vi.mock("../../lib/expenses/queries", () => ({
  insertExpense: mockInsertExpense,
  removeExpense: mockRemoveExpense,
}));

vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

// Import AFTER mocks are registered
import { addExpense, deleteExpense } from "./expenses";

// ---------------------------------------------------------------------------
// Helper: build a FormData
// ---------------------------------------------------------------------------
function makeFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    fd.append(k, v);
  }
  return fd;
}

// ---------------------------------------------------------------------------
// addExpense
// ---------------------------------------------------------------------------
describe("addExpense", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsertExpense.mockResolvedValue([]);
    mockRemoveExpense.mockResolvedValue(undefined);
    mockRevalidatePath.mockReturnValue(undefined);
  });

  it("rejects amount <= 0 and does not call insertExpense", async () => {
    const fd = makeFormData({ amount: "0", category: "x" });
    const result = await addExpense(fd);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors?.amount).toBeDefined();
    }
    expect(mockInsertExpense).not.toHaveBeenCalled();
  });

  it("rejects negative amount and does not call insertExpense", async () => {
    const fd = makeFormData({ amount: "-5", category: "x" });
    const result = await addExpense(fd);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors?.amount).toBeDefined();
    }
    expect(mockInsertExpense).not.toHaveBeenCalled();
  });

  it("rejects empty category (whitespace only)", async () => {
    const fd = makeFormData({ amount: "5", category: "   " });
    const result = await addExpense(fd);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors?.category).toBeDefined();
    }
    expect(mockInsertExpense).not.toHaveBeenCalled();
  });

  it("inserts with trimmed note=null when note is blank, revalidates, returns ok:true", async () => {
    const fd = makeFormData({ amount: "12.50", category: "coffee", note: "" });
    const result = await addExpense(fd);

    expect(mockInsertExpense).toHaveBeenCalledWith({
      amount: "12.50",
      category: "coffee",
      note: null,
    });
    expect(mockRevalidatePath).toHaveBeenCalledWith("/");
    expect(result.ok).toBe(true);
  });

  it("inserts with trimmed note when note has content", async () => {
    const fd = makeFormData({
      amount: "5.00",
      category: "lunch",
      note: "  tasty burger  ",
    });
    const result = await addExpense(fd);

    expect(mockInsertExpense).toHaveBeenCalledWith({
      amount: "5.00",
      category: "lunch",
      note: "tasty burger",
    });
    expect(result.ok).toBe(true);
  });

  it("returns ok:false without leaking DB error details on unexpected failure", async () => {
    mockInsertExpense.mockRejectedValue(new Error("connection refused"));
    const fd = makeFormData({ amount: "10", category: "food" });
    const result = await addExpense(fd);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("Failed to save expense");
    }
  });
});

// ---------------------------------------------------------------------------
// deleteExpense
// ---------------------------------------------------------------------------
describe("deleteExpense", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRemoveExpense.mockResolvedValue(undefined);
    mockRevalidatePath.mockReturnValue(undefined);
  });

  it("calls removeExpense and revalidatePath, returns ok:true", async () => {
    const result = await deleteExpense(7);

    expect(mockRemoveExpense).toHaveBeenCalledWith(7);
    expect(mockRevalidatePath).toHaveBeenCalledWith("/");
    expect(result.ok).toBe(true);
  });

  it("rejects non-integer id with ok:false", async () => {
    const result = await deleteExpense(3.7);

    expect(result.ok).toBe(false);
    expect(mockRemoveExpense).not.toHaveBeenCalled();
  });

  it("rejects NaN id with ok:false", async () => {
    const result = await deleteExpense(NaN);

    expect(result.ok).toBe(false);
    expect(mockRemoveExpense).not.toHaveBeenCalled();
  });
});
