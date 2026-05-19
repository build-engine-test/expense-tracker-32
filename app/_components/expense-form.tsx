"use client";

import React, { useRef, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addExpense } from "@/app/_actions/expenses";

type ActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> }
  | null;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Adding..." : "Add Expense"}
    </Button>
  );
}

export function ExpenseForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction] = useActionState<ActionResult, FormData>(
    async (_prev: ActionResult, formData: FormData) => {
      const result = await addExpense(formData);
      if (result.ok) {
        formRef.current?.reset();
      }
      return result;
    },
    null
  );

  const fieldErrors =
    state && !state.ok ? (state.fieldErrors ?? {}) : {};

  return (
    <form ref={formRef} action={formAction} noValidate className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0.01"
          required
          placeholder="0.00"
          aria-describedby={fieldErrors.amount ? "amount-error" : undefined}
        />
        {fieldErrors.amount && (
          <p id="amount-error" className="text-sm text-rose-600">
            {fieldErrors.amount}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          name="category"
          type="text"
          required
          maxLength={64}
          placeholder="e.g. Coffee"
          aria-describedby={fieldErrors.category ? "category-error" : undefined}
        />
        {fieldErrors.category && (
          <p id="category-error" className="text-sm text-rose-600">
            {fieldErrors.category}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="note">Note</Label>
        <Input
          id="note"
          name="note"
          type="text"
          maxLength={280}
          placeholder="Optional note"
          aria-describedby={fieldErrors.note ? "note-error" : undefined}
        />
        {fieldErrors.note && (
          <p id="note-error" className="text-sm text-rose-600">
            {fieldErrors.note}
          </p>
        )}
      </div>

      {state && !state.ok && !Object.keys(fieldErrors).length && (
        <p className="text-sm text-rose-600">{state.error}</p>
      )}

      <SubmitButton />
    </form>
  );
}
