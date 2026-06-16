"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

/**
 * Error boundary for the main layout routes.
 * Shows a friendly error message with a retry button.
 */
export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4">
      <AlertTriangle className="h-12 w-12 text-destructive/50 mb-4" />
      <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-md text-center">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <Button onClick={reset} variant="outline">
        Try again
      </Button>
    </div>
  );
}
