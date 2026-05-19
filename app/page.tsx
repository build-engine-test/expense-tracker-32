import React from "react";
import { listExpenses, getTotal } from "@/lib/expenses/queries";
import { ExpenseForm } from "./_components/expense-form";
import { Total } from "./_components/total";
import { ExpenseList } from "./_components/expense-list";

export default async function HomePage() {
  const [expenses, total] = await Promise.all([listExpenses(), getTotal()]);

  return (
    <main className="min-h-screen bg-background py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">
            Expense Tracker
          </h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            Log your spending and keep a running total.
          </p>
        </header>

        <section className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-medium">Add an Expense</h2>
          <ExpenseForm />
        </section>

        <section className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
          <Total total={total} />
          <ExpenseList expenses={expenses} />
        </section>
      </div>
    </main>
  );
}
