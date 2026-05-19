/**
 * Tests for ExpenseList component (task-3-3-list-and-total)
 */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";

// Mock the server action used by DeleteButton
vi.mock("@/app/_actions/expenses", () => ({
  deleteExpense: vi.fn().mockResolvedValue({ ok: true }),
  addExpense: vi.fn().mockResolvedValue({ ok: true }),
}));

// Mock next/cache (used inside server actions)
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { ExpenseList } from "./expense-list";
import type { Expense } from "@/lib/db/schema";

function makeExpense(overrides: Partial<Expense> & { id: bigint }): Expense {
  return {
    id: overrides.id,
    amount: overrides.amount ?? "10.00",
    category: overrides.category ?? "Food",
    note: overrides.note ?? null,
    createdAt: overrides.createdAt ?? new Date("2024-01-15T10:30:00Z"),
  };
}

describe("ExpenseList", () => {
  it("renders empty state when no rows", () => {
    render(<ExpenseList expenses={[]} />);
    expect(screen.getByText(/No expenses yet\./i)).toBeInTheDocument();
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("renders one row per expense with delete button", () => {
    const expenses: Expense[] = [
      makeExpense({ id: BigInt(1), amount: "12.50", category: "Coffee", note: "Morning brew" }),
      makeExpense({ id: BigInt(2), amount: "25.00", category: "Lunch", note: null }),
    ];

    render(<ExpenseList expenses={expenses} />);

    // Two rows rendered (not counting the header row)
    expect(screen.getByText("$12.50")).toBeInTheDocument();
    expect(screen.getByText("Coffee")).toBeInTheDocument();
    expect(screen.getByText("Morning brew")).toBeInTheDocument();

    expect(screen.getByText("$25.00")).toBeInTheDocument();
    expect(screen.getByText("Lunch")).toBeInTheDocument();

    // Two delete buttons
    const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
    expect(deleteButtons).toHaveLength(2);

    // Each row's form has a hidden input with the expense id
    const hiddenInputs = document.querySelectorAll('input[name="id"]') as NodeListOf<HTMLInputElement>;
    expect(hiddenInputs).toHaveLength(2);
    expect(hiddenInputs[0].value).toBe("1");
    expect(hiddenInputs[1].value).toBe("2");
  });
});
