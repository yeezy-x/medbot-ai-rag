"use client";

import { useEffect, useState } from "react";
import { Check, Copy, RefreshCcw, ThumbsDown, ThumbsUp } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { toast } from "sonner";

interface MessageActionsProps {
  content: string;
  onRegenerate?: () => void;
  isLoading?: boolean;
}

/**
 * Row of hover-revealed actions under an assistant message.
 * Regenerate is a stub until F3 streaming lands; kept in the UI so the layout
 * is stable and the affordance is discoverable.
 */
export function MessageActions({
  content,
  onRegenerate,
  isLoading,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1400);
    return () => clearTimeout(t);
  }, [copied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  }

  function handleFeedback(kind: "up" | "down") {
    setFeedback((prev) => (prev === kind ? null : kind));
    toast.success(kind === "up" ? "Feedback saved" : "Thanks — we'll do better");
  }

  return (
    <div
      className="mt-2 flex items-center gap-0.5 opacity-0 transition-opacity duration-150 group-hover/msg:opacity-100 focus-within:opacity-100"
      data-testid="assistant-message-actions"
    >
      <IconButton
        size="xs"
        label={copied ? "Copied" : "Copy answer"}
        onClick={handleCopy}
        data-testid="message-action-copy"
      >
        {copied ? <Check /> : <Copy />}
      </IconButton>
      {onRegenerate && (
        <IconButton
          size="xs"
          label="Regenerate"
          onClick={onRegenerate}
          disabled={isLoading}
          data-testid="message-action-regenerate"
        >
          <RefreshCcw />
        </IconButton>
      )}
      <IconButton
        size="xs"
        label="Good answer"
        active={feedback === "up"}
        onClick={() => handleFeedback("up")}
        data-testid="message-action-thumbs-up"
      >
        <ThumbsUp />
      </IconButton>
      <IconButton
        size="xs"
        label="Needs work"
        active={feedback === "down"}
        onClick={() => handleFeedback("down")}
        data-testid="message-action-thumbs-down"
      >
        <ThumbsDown />
      </IconButton>
    </div>
  );
}
