import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock next/cache before importing actions
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock queries module
vi.mock("../lib/expenses/queries", () => ({
  listExpenses: vi.fn(),
  getTotal: vi.fn(),
  insertExpense: vi.fn(),
  removeExpense: vi.fn(),
}));

// Mock next/navigation (used by components)
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/",
}));

import * as queries from "../lib/expenses/queries";
import { revalidatePath } from "next/cache";
import { addExpense, deleteExpense } from "../app/_actions/expenses";

const mockListExpenses = vi.mocked(queries.listExpenses);
const mockGetTotal = vi.mocked(queries.getTotal);
const mockInsertExpense = vi.mocked(queries.insertExpense);
const mockRemoveExpense = vi.mocked(queries.removeExpense);
const mockRevalidatePath = vi.mocked(revalidatePath);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("home composition with empty data", () => {
  it("shows $0.00 and empty state", async () => {
    mockListExpenses.mockResolvedValue([]);
    mockGetTotal.mockResolvedValue(0);

    // Import page after mocks are set
    const { default: HomePage } = await import("../app/page");
    const element = await HomePage();

    const { container } = render(element as React.ReactElement);

    expect(container.textContent).toContain("Total spent: $0.00");
    expect(container.textContent).toContain("No expenses yet.");
  });
});

describe("add → list → delete loop", () => {
  it("calls correct query functions for addExpense", async () => {
    mockInsertExpense.mockResolvedValue([]);

    const formData = new FormData();
    formData.set("amount", "12.50");
    formData.set("category", "coffee");
    formData.set("note", "");

    const result = await addExpense(formData);

    expect(result.ok).toBe(true);
    expect(mockInsertExpense).toHaveBeenCalledOnce();
    const callArg = mockInsertExpense.mock.calls[0][0];
    expect(callArg.amount).toBe("12.50");
    expect(callArg.category).toBe("coffee");
    expect(mockRevalidatePath).toHaveBeenCalledWith("/");
  });

  it("calls correct query functions for deleteExpense", async () => {
    mockRemoveExpense.mockResolvedValue(undefined);

    const result = await deleteExpense(1);

    expect(result.ok).toBe(true);
    expect(mockRemoveExpense).toHaveBeenCalledWith(1);
    expect(mockRevalidatePath).toHaveBeenCalledWith("/");
  });
});

describe("error.tsx renders a retry UI", () => {
  it("shows a user-visible message and a try again button", async () => {
    const { default: ErrorComponent } = await import("../app/error");
    const resetFn = vi.fn();

    const { getByRole, getByText } = render(
      React.createElement(ErrorComponent, {
        error: new Error("boom"),
        reset: resetFn,
      })
    );

    // Should have some visible error message
    expect(getByText(/something went wrong/i)).toBeTruthy();

    // Should have a try again button that calls reset
    const btn = getByRole("button", { name: /try again/i });
    expect(btn).toBeTruthy();
    await userEvent.click(btn);
    expect(resetFn).toHaveBeenCalledOnce();
  });
});
