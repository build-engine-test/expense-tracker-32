import React from "react";
import { formatCurrency } from "@/lib/format";

interface TotalProps {
  total: number;
}

export function Total({ total }: TotalProps) {
  return (
    <p className="text-xl font-semibold tabular-nums font-mono">
      Total spent: {formatCurrency(total)}
    </p>
  );
}
