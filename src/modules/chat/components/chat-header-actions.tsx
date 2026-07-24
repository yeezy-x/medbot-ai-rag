"use client";

import { Braces } from "lucide-react";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

interface ChatHeaderActionsProps {
  devMode: boolean;
  streaming?: boolean;
  hasDebug: boolean;
  onOpenInspector: () => void;
}

/**
 * Slim action bar rendered inline above the message list. Shows the
 * "Retrieval Inspector" opener when developer mode is enabled. Kept as a
 * separate component so the outer chat header (in `chat/layout.tsx`) stays
 * server-rendered and lightweight.
 */
export function ChatHeaderActions({
  devMode,
  streaming,
  hasDebug,
  onOpenInspector,
}: ChatHeaderActionsProps) {
  if (!devMode) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 border-b border-border-subtle bg-surface-2/60 px-6 py-2",
        "text-[0.75rem]"
      )}
      data-testid="chat-dev-actions"
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="inline-flex items-center gap-1 rounded-md border border-brand/30 bg-brand-muted px-1.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide text-brand">
          <Braces className="size-3" />
          Dev
        </span>
        <span className="hidden sm:inline">
          Retrieval payload is exposed on the SSE stream.
        </span>
      </div>
      <button
        type="button"
        onClick={onOpenInspector}
        disabled={!hasDebug && !streaming}
        data-testid="open-retrieval-inspector"
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1",
          "border-border-subtle bg-surface-3 text-foreground",
          "transition-colors hover:border-brand/40 hover:text-brand",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-border-subtle disabled:hover:text-foreground"
        )}
      >
        <Braces className="size-3.5" />
        Inspect
        <span className="ml-1 hidden items-center gap-0.5 sm:inline-flex">
          <Kbd>⌘</Kbd>
          <Kbd>.</Kbd>
        </span>
      </button>
    </div>
  );
}
