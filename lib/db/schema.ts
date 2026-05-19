import {
  bigserial,
  check,
  index,
  numeric,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const expenses = pgTable(
  "expenses",
  {
    id: bigserial("id", { mode: "bigint" }).primaryKey(),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    category: text("category").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("expenses_created_at_idx").on(table.createdAt.desc()),
    check("expenses_amount_positive", sql`${table.amount} > 0`),
    check(
      "expenses_category_nonempty",
      sql`length(${table.category}) > 0`,
    ),
  ],
);

export type Expense = InferSelectModel<typeof expenses>;
export type NewExpense = InferInsertModel<typeof expenses>;
