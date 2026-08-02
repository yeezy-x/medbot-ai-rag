"use client";

import { Button } from "@/components/ui/button";

export default function ChatDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center"
      data-testid="chat-detail-error"
    >
      <p className="max-w-sm text-[0.9rem] text-muted-foreground">
        {error.message || "Couldn't load this conversation."}
      </p>
      <Button onClick={reset} data-testid="chat-detail-error-retry">
        Try again
      </Button>
    </div>
  );
}
