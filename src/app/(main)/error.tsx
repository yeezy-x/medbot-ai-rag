"use client";

import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      className="flex h-dvh flex-col items-center justify-center gap-3 px-6 text-center"
      data-testid="app-error"
      role="alert"
    >
      <p className="max-w-md text-[0.9rem] text-muted-foreground">
        {error.message || "Something went wrong loading the app."}
      </p>
      <Button onClick={reset} data-testid="app-error-retry">
        Try again
      </Button>
    </div>
  );
}
