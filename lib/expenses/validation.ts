import { z } from "zod";

export const addExpenseSchema = z.object({
  amount: z
    .string()
    .trim()
    .refine((v) => v.length > 0, { message: "Amount is required" })
    .transform((v, ctx) => {
      const n = parseFloat(v);
      if (isNaN(n)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Amount must be a valid number",
        });
        return z.NEVER;
      }
      if (n <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Amount must be greater than 0",
        });
        return z.NEVER;
      }
      // Verify at most 2 decimal places
      if (!/^\d+(\.\d{1,2})?$/.test(v.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Amount must have at most 2 decimal places",
        });
        return z.NEVER;
      }
      // Return as fixed-precision string for numeric(10,2)
      return n.toFixed(2);
    }),
  category: z
    .string()
    .trim()
    .min(1, "Category is required")
    .max(64, "Category must be 64 characters or fewer"),
  note: z
    .string()
    .trim()
    .max(280, "Note must be 280 characters or fewer")
    .optional()
    .transform((v) => (v === undefined || v === "" ? null : v)),
});

export type AddExpenseInput = z.output<typeof addExpenseSchema>;
