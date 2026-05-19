"use client";

import React from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

function DeleteSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="destructive"
      size="sm"
      disabled={pending}
      aria-label="Delete"
      className="transition-colors"
    >
      {pending ? "Deleting…" : "Delete"}
    </Button>
  );
}

interface DeleteButtonProps {
  id: bigint;
  deleteAction: (formData: FormData) => Promise<void>;
}

export function DeleteButton({ id, deleteAction }: DeleteButtonProps) {
  return (
    <form action={deleteAction}>
      <input type="hidden" name="id" value={id.toString()} />
      <DeleteSubmitButton />
    </form>
  );
}
