"use client";

import { useMemo } from "react";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { MessageItem } from "./message-item";
import { ThinkingIndicator } from "./thinking-indicator";
import { cn } from "@/lib/utils";
import type { Message } from "../types/chat.types";
import type { CitationDisplay } from "../types/citation.types";

interface MessageListProps {
  messages: Message[];
  pendingUserMessage?: string | null;
  streaming?: boolean;
  streamingContent?: string;
  streamingCitations?: CitationDisplay[];
  onRegenerate?: () => void;
  onOpenCitation?: (c: CitationDisplay) => void;
}

/**
 * Full-height scrollable conversation column. Auto-scrolls to the newest
 * message and progressively to the last chunk of a streaming token stream.
 */
export function MessageList({
  messages,
  pendingUserMessage,
  streaming,
  streamingContent,
  streamingCitations,
  onRegenerate,
  onOpenCitation,
}: MessageListProps) {
  const sentinelDep = useMemo(
    () =>
      `${messages.length}:${pendingUserMessage ?? ""}:${streaming ? 1 : 0}:${
        streamingContent?.length ?? 0
      }`,
    [messages.length, pendingUserMessage, streaming, streamingContent]
  );
  const sentinelRef = useAutoScroll(sentinelDep);

  return (
    <div
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      className={cn("mx-auto w-full max-w-3xl px-4 sm:px-6 py-6 space-y-6")}
      data-testid="message-list"
    >
      {messages.map((message, idx) => (
        <MessageItem
          key={message.id}
          role={message.role}
          content={message.content}
          createdAt={message.createdAt}
          citations={message.citations}
          metrics={message.metrics}
          onOpenCitation={onOpenCitation}
          onRegenerate={
            message.role === "ASSISTANT" &&
            idx === messages.length - 1 &&
            !streaming &&
            !pendingUserMessage
              ? onRegenerate
              : undefined
          }
        />
      ))}

      {pendingUserMessage && (
        <MessageItem
          role="USER"
          content={pendingUserMessage}
          createdAt={new Date().toISOString()}
          pending
        />
      )}

      {streaming && (
        <MessageItem
          role="ASSISTANT"
          content={streamingContent ?? ""}
          createdAt={new Date().toISOString()}
          streaming
          citations={streamingCitations}
          onOpenCitation={onOpenCitation}
        >
          {!streamingContent ? <ThinkingIndicator /> : undefined}
        </MessageItem>
      )}

      <div ref={sentinelRef} aria-hidden className="h-4" />
    </div>
  );
}
