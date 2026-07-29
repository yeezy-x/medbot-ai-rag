"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Download, RefreshCcw, Share2, ThumbsDown, ThumbsUp, Play } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { toast } from "sonner";

interface MessageActionsProps {
  content: string;
  onRegenerate?: () => void;
  onContinue?: () => void;
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
  onContinue,
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

  function handleExport() {
    try {
      const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "medbot-answer.md";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exported markdown");
    } catch {
      toast.error("Couldn't export");
    }
  }

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({ title: "MedBot answer", text: content });
        return;
      }
      await navigator.clipboard.writeText(content);
      toast.success("Answer copied");
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      toast.error("Couldn't share");
    }
  }

  return (
    <div
      className="mt-2 flex flex-wrap items-center gap-0.5 max-md:gap-1 transition-opacity duration-150 max-md:opacity-100 md:opacity-0 md:group-hover/msg:opacity-100 md:focus-within:opacity-100"
      data-testid="assistant-message-actions"
    >
      <IconButton
        size="xs"
        className="max-md:min-h-11 max-md:min-w-11 max-md:h-11 max-md:w-11"
        label={copied ? "Copied" : "Copy answer"}
        onClick={handleCopy}
        data-testid="message-action-copy"
      >
        {copied ? <Check /> : <Copy />}
      </IconButton>
      {onRegenerate && (
        <IconButton
          size="xs"
          className="max-md:min-h-11 max-md:min-w-11 max-md:h-11 max-md:w-11"
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
        className="max-md:min-h-11 max-md:min-w-11 max-md:h-11 max-md:w-11"
        label="Export markdown"
        onClick={() => void handleExport()}
        data-testid="message-action-export"
      >
        <Download />
      </IconButton>
      {onContinue && (
        <IconButton
          size="xs"
          className="max-md:min-h-11 max-md:min-w-11 max-md:h-11 max-md:w-11"
          label="Continue generating"
          onClick={onContinue}
          disabled={isLoading}
          data-testid="message-action-continue"
        >
          <Play />
        </IconButton>
      )}
      <IconButton
        size="xs"
        className="max-md:min-h-11 max-md:min-w-11 max-md:h-11 max-md:w-11"
        label="Share answer"
        onClick={() => void handleShare()}
        data-testid="message-action-share"
      >
        <Share2 />
      </IconButton>
      <IconButton
        size="xs"
        className="max-md:min-h-11 max-md:min-w-11 max-md:h-11 max-md:w-11"
        label="Good answer"
        active={feedback === "up"}
        onClick={() => handleFeedback("up")}
        data-testid="message-action-thumbs-up"
      >
        <ThumbsUp />
      </IconButton>
      <IconButton
        size="xs"
        className="max-md:min-h-11 max-md:min-w-11 max-md:h-11 max-md:w-11"
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