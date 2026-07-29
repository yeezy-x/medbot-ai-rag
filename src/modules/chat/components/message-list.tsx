"use client";

import { type RefObject, useMemo } from "react";
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
  onContinue?: () => void;
  onOpenCitation?: (c: CitationDisplay) => void;
  scrollContainerRef?: RefObject<HTMLElement | null>;
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
  onContinue,
  onOpenCitation,
  scrollContainerRef,
}: MessageListProps) {
  const sentinelDep = useMemo(
    () =>
      `${messages.length}:${pendingUserMessage ?? ""}:${streaming ? 1 : 0}:${
        streamingContent?.length ?? 0
      }`,
    [messages.length, pendingUserMessage, streaming, streamingContent]
  );
  const sentinelRef = useAutoScroll(sentinelDep, scrollContainerRef);

  return (
    <div className="flex justify-center">
      <div
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Conversation messages"
        className={cn(
          "w-full max-w-3xl px-6 sm:px-10 py-6 pb-10 space-y-6"
        )}
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
            onContinue={
              message.role === "ASSISTANT" &&
              message.incomplete &&
              idx === messages.length - 1 &&
              !streaming &&
              !pendingUserMessage
                ? onContinue
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
    </div>
  );
}