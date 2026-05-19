"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  insertExpense,
  removeExpense,
} from "../../lib/expenses/queries";
import { addExpenseSchema } from "../../lib/expenses/validation";

type ActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function addExpense(formData: FormData): Promise<ActionResult> {
  const raw = {
    amount: formData.get("amount") ?? "",
    category: formData.get("category") ?? "",
    note: formData.get("note") ?? undefined,
  };

  const parsed = addExpenseSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const [field, messages] of Object.entries(
      parsed.error.flatten().fieldErrors
    )) {
      fieldErrors[field] = messages[0] ?? "Invalid value";
    }
    return {
      ok: false,
      error: "Validation failed",
      fieldErrors,
    };
  }

  try {
    await insertExpense(parsed.data);
    revalidatePath("/");
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to save expense" };
  }
}

export async function deleteExpense(id: number): Promise<ActionResult> {
  if (!Number.isInteger(id) || isNaN(id)) {
    return { ok: false, error: "Invalid expense id" };
  }

  try {
    await removeExpense(id);
    revalidatePath("/");
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to delete expense" };
  }
}
