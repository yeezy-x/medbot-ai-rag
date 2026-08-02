"use client";

import { Button } from "@/components/ui/button";

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-md px-6 py-16 text-center" data-testid="settings-error">
      <p className="text-[0.9rem] text-muted-foreground">
        {error.message || "Couldn't load settings."}
      </p>
      <Button className="mt-4" onClick={reset} data-testid="settings-error-retry">
        Try again
      </Button>
    </div>
  );
}
