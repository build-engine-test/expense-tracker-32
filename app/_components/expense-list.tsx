import React from "react";
import { formatCurrency } from "@/lib/format";
import type { Expense } from "@/lib/db/schema";
import { DeleteButton } from "./delete-button";
import { deleteExpense } from "@/app/_actions/expenses";

interface ExpenseListProps {
  expenses: Expense[];
}

async function deleteExpenseAction(formData: FormData): Promise<void> {
  "use server";
  const raw = formData.get("id");
  const id = typeof raw === "string" ? parseInt(raw, 10) : NaN;
  if (isNaN(id)) return;
  await deleteExpense(id);
}

export function ExpenseList({ expenses }: ExpenseListProps) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border bg-card shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-3 text-left text-muted-foreground font-medium">Amount</th>
            <th className="px-4 py-3 text-left text-muted-foreground font-medium">Category</th>
            <th className="px-4 py-3 text-left text-muted-foreground font-medium">Note</th>
            <th className="px-4 py-3 text-left text-muted-foreground font-medium">When</th>
            <th className="px-4 py-3 text-left text-muted-foreground font-medium sr-only">Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-10 text-center text-muted-foreground"
              >
                No expenses yet.
              </td>
            </tr>
          ) : (
            expenses.map((expense) => (
              <tr key={expense.id.toString()} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                <td className="px-4 py-3 tabular-nums font-mono">
                  {formatCurrency(expense.amount)}
                </td>
                <td className="px-4 py-3">{expense.category}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {expense.note ?? "—"}
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {expense.createdAt.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <DeleteButton id={expense.id} deleteAction={deleteExpenseAction} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
