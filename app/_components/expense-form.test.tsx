/**
 * Tests for ExpenseForm component (task-3-2-form)
 */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";

// ── Mock next/navigation (not used but avoids any stray import issues) ──────
vi.mock("next/navigation", () => ({ useRouter: () => ({}) }));

// ── Mock the server action ───────────────────────────────────────────────────
vi.mock("../\_actions/expenses", () => ({
  addExpense: vi.fn().mockResolvedValue({ ok: true }),
}));

// ── We control useFormStatus and useActionState at the module level ──────────
const mockUseFormStatus = vi.fn(() => ({ pending: false }));
const mockUseActionState = vi.fn();

vi.mock("react-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-dom")>();
  return {
    ...actual,
    useFormStatus: () => mockUseFormStatus(),
  };
});

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useActionState: (action: unknown, initial: unknown) => mockUseActionState(action, initial),
  };
});

// ── Import component AFTER mocks are set up ──────────────────────────────────
import { ExpenseForm } from "./expense-form";

describe("ExpenseForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseFormStatus.mockReturnValue({ pending: false });
    // Default: idle state, no errors
    mockUseActionState.mockImplementation((action: unknown) => [
      null,
      action,
      false,
    ]);
  });

  it("renders all three fields and a submit button", () => {
    render(<ExpenseForm />);

    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/note/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
  });

  it("submit button shows pending state", () => {
    mockUseFormStatus.mockReturnValue({ pending: true });

    render(<ExpenseForm />);

    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    // Button should show some kind of "adding" / pending text
    expect(btn.textContent).toMatch(/adding/i);
  });

  it("displays inline field error from action state", () => {
    mockUseActionState.mockImplementation((action: unknown) => [
      { ok: false, error: "Validation failed", fieldErrors: { amount: "Must be > 0" } },
      action,
      false,
    ]);

    render(<ExpenseForm />);

    expect(screen.getByText("Must be > 0")).toBeInTheDocument();
  });
});
