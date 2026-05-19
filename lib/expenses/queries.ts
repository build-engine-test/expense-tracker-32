import { desc, eq, sql } from "drizzle-orm";
import { db } from "../db/client";
import { expenses, type Expense, type NewExpense } from "../db/schema";

export async function listExpenses(): Promise<Expense[]> {
  return db.select().from(expenses).orderBy(desc(expenses.createdAt));
}

export async function getTotal(): Promise<number> {
  const result = await db
    .select({ total: sql<string | null>`SUM(${expenses.amount})::numeric` })
    .from(expenses);

  const raw = result[0]?.total ?? null;
  if (raw === null || raw === undefined) {
    return 0;
  }
  const parsed = parseFloat(raw);
  return isNaN(parsed) ? 0 : parsed;
}

export async function insertExpense(
  input: Omit<NewExpense, "id" | "createdAt">
): Promise<Expense[]> {
  return db.insert(expenses).values(input).returning();
}

export async function removeExpense(id: number): Promise<void> {
  await db.delete(expenses).where(eq(expenses.id, BigInt(id)));
}
