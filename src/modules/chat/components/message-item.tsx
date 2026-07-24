"use client";

import { Sparkles, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Markdown } from "@/components/markdown/markdown";
import { relativeTime } from "@/lib/format";
import { CitationList } from "./citation-list";
import { MessageActions } from "./message-actions";
import type { CitationDisplay } from "../types/citation.types";
import type { MessageMetrics } from "../types/chat.types";
import { RagMetrics } from "./rag-metrics";

type MessageRole = "USER" | "ASSISTANT" | "SYSTEM";

interface MessageItemProps {
  role: MessageRole;
  content: string;
  createdAt?: string;
  citations?: CitationDisplay[];
  metrics?: MessageMetrics;
  pending?: boolean;
  streaming?: boolean;
  onRegenerate?: () => void;
  onOpenCitation?: (c: CitationDisplay) => void;
  children?: React.ReactNode;
}

export function MessageItem({
  role,
  content,
  createdAt,
  citations,
  metrics,
  pending,
  streaming,
  onRegenerate,
  onOpenCitation,
  children,
}: MessageItemProps) {
  const isUser = role === "USER";
  const isSystem = role === "SYSTEM";

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="rounded-md border border-border-subtle bg-surface-3 px-3 py-1.5 text-[0.75rem] text-muted-foreground">
          {content}
        </div>
      </div>
    );
  }

  return (
    <article
      className={cn("group/msg flex gap-3 animate-fade-up")}
      data-role={role.toLowerCase()}
      data-testid={`message-${role.toLowerCase()}`}
    >
      <Avatar role={role} streaming={streaming} />
      <div className="min-w-0 flex-1 pt-0.5">
        <header className="mb-1.5 flex items-baseline gap-2">
          <span className="text-[0.8rem] font-semibold text-foreground">
            {isUser ? "You" : "MedBot"}
          </span>
          {createdAt && !streaming && (
            <span className="text-[0.7rem] text-muted-foreground">
              {relativeTime(createdAt)}
            </span>
          )}
          {streaming && (
            <span className="text-[0.7rem] font-medium text-brand">
              Streaming…
            </span>
          )}
        </header>

        {children}

        <MessageBody
          role={role}
          content={content}
          pending={pending}
          streaming={streaming}
        />

        {!isUser && citations && citations.length > 0 && (
          <CitationList citations={citations} onOpen={onOpenCitation} />
        )}

        {!isUser && !streaming && !pending && metrics && (
          <RagMetrics metrics={metrics} />
        )}

        {!isUser && !streaming && !pending && content && (
          <MessageActions content={content} onRegenerate={onRegenerate} />
        )}
      </div>
    </article>
  );
}

function Avatar({
  role,
  streaming,
}: {
  role: MessageRole;
  streaming?: boolean;
}) {
  const isUser = role === "USER";
  return (
    <div
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full border",
        isUser
          ? "border-border-subtle bg-surface-3 text-foreground"
          : "border-brand/30 bg-brand-muted text-brand",
        streaming && "shadow-[0_0_0_3px_var(--brand-muted)]"
      )}
      aria-hidden
    >
      {isUser ? (
        <UserIcon className="size-3.5" />
      ) : (
        <Sparkles className="size-3.5" strokeWidth={2.2} />
      )}
    </div>
  );
}

function MessageBody({
  role,
  content,
  pending,
  streaming,
}: {
  role: MessageRole;
  content: string;
  pending?: boolean;
  streaming?: boolean;
}) {
  if (role === "USER") {
    if (!content) return null;
    return (
      <p
        className={cn(
          "whitespace-pre-wrap wrap-break-word text-[0.925rem] leading-relaxed text-foreground",
          pending && "opacity-75"
        )}
      >
        {content}
      </p>
    );
  }
  if (!content) return null;
  return (
    <div className={cn(streaming && "streaming-cursor")}>
      <Markdown content={content} />
    </div>
  );
}
