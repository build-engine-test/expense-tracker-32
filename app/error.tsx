"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error: _error, reset }: ErrorProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-8 shadow-sm text-center space-y-4">
          <h2 className="text-xl font-medium text-destructive">
            Something went wrong
          </h2>
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t load your expenses. This is usually a temporary
            database issue.
          </p>
          <Button
            variant="outline"
            onClick={reset}
            className="transition-colors"
          >
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}
