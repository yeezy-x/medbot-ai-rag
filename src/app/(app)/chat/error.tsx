"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold">
          Something went wrong
        </h2>

        <p className="mt-2 text-muted-foreground">
          {error.message}
        </p>

        <Button
          className="mt-4"
          onClick={() => reset()}
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}