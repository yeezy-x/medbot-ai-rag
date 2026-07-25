"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MessageInput } from "@/components/message-input";
import { MessageList } from "@/modules/chat/components/message-list";
import { RetrievalInspector } from "@/modules/chat/components/retrieval-inspector";
import { ChatHeaderActions } from "@/modules/chat/components/chat-header-actions";
import { LazySourceViewer } from "@/modules/chat/components/source-viewer-lazy";
import { useStreamMessage } from "@/hooks/use-stream-message";
import { useDevMode } from "@/hooks/use-dev-mode";
import { cn } from "@/lib/utils";
import type { Message } from "@/modules/chat/types/chat.types";
import type {
  CitationDisplay,
  OpenedSource,
} from "@/modules/chat/types/citation.types";
import type { CitationReference } from "@/modules/knowledge/types/retrieval.types";
import type { DebugPayload } from "@/modules/chat/api/stream";

interface ChatConversationProps {
  sessionId: string;
  initialMessages: Message[];
  initialMessage?: string;
}

function toDisplayCitations(
  sessionId: string,
  refs: CitationReference[]
): CitationDisplay[] {
  return refs.map((c, i) => ({
    id: `${sessionId}-${i}-${c.chunkId}`,
    chunkId: c.chunkId,
    documentId: c.documentId,
    pageNumber: c.pageNumber,
    sourceTitle: c.sourceTitle,
  }));
}

export function ChatConversation({
  sessionId,
  initialMessages,
  initialMessage,
}: ChatConversationProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [pendingUser, setPendingUser] = useState<string | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [lastDebug, setLastDebug] = useState<DebugPayload | null>(null);
  const [lastTotalMs, setLastTotalMs] = useState<number | undefined>(undefined);
  const [openedSource, setOpenedSource] = useState<OpenedSource | null>(null);
  const [devMode] = useDevMode();

  const stream = useStreamMessage();
  const [, startTransition] = useTransition();
  const bootstrappedRef = useRef(false);

  const doStream = useCallback(
    async (message: string) => {
      setPendingUser(message);
      setLastUserMessage(message);
      try {
        const result = await stream.send(sessionId, message, {
          debug: devMode,
        });
        const now = new Date().toISOString();
        const userMsg: Message = {
          id: `local-user-${Date.now()}`,
          role: "USER",
          content: message,
          createdAt: now,
        };
        const assistantMsg: Message = {
          id: `local-assistant-${Date.now()}`,
          role: "ASSISTANT",
          content: result.answer,
          createdAt: new Date().toISOString(),
          citations: toDisplayCitations(sessionId, result.citations),
          metrics: {
            totalDurationMs: result.metrics.totalDurationMs,
            retrievalDurationMs: result.metrics.retrievalDurationMs,
            retrievedChunkCount: result.metrics.retrievedChunkCount,
            acceptedChunkCount: result.metrics.acceptedChunkCount,
            contextTokens: result.debug?.context.totalEstimatedTokens,
            topScore: result.debug?.retrieval.chunks[0]?.score,
          },
        };
        setMessages((prev) => [...prev, userMsg, assistantMsg]);
        setPendingUser(null);
        if (result.debug) setLastDebug(result.debug);
        setLastTotalMs(result.metrics.totalDurationMs);
        stream.reset();
        startTransition(() => router.refresh());
      } catch (err) {
        setPendingUser(null);
        stream.reset();
        toast.error(
          err instanceof Error ? err.message : "Couldn't send message."
        );
      }
    },
    [sessionId, stream, router, devMode]
  );

  const handleSend = useCallback(
    (message: string) => {
      if (stream.streaming) return;
      void doStream(message);
    },
    [stream.streaming, doStream]
  );

  const handleRegenerate = useCallback(() => {
    if (!lastUserMessage || stream.streaming) return;
    setMessages((prev) => {
      const idx = [...prev].reverse().findIndex((m) => m.role === "ASSISTANT");
      if (idx === -1) return prev;
      const realIdx = prev.length - 1 - idx;
      return prev.slice(0, realIdx);
    });
    setPendingUser(lastUserMessage);
    void doStream(lastUserMessage);
  }, [lastUserMessage, stream.streaming, doStream]);

  const handleOpenCitation = useCallback((c: CitationDisplay) => {
    setOpenedSource({
      documentId: c.documentId,
      pageNumber: c.pageNumber || 1,
      sourceTitle: c.sourceTitle,
      chunkId: c.chunkId,
    });
  }, []);

  const handleCloseSource = useCallback(() => setOpenedSource(null), []);

  // Auto-send when the launcher passed an initial message via `?q=`.
  useEffect(() => {
    if (bootstrappedRef.current) return;
    if (!initialMessage) return;
    bootstrappedRef.current = true;
    try {
      window.history.replaceState(null, "", `/chat/${sessionId}`);
    } catch {
      /* noop */
    }
    queueMicrotask(() => {
      void doStream(initialMessage);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessage]);

  // Global keybindings: Esc = stop or close source, ⌘. = toggle inspector
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (stream.streaming) {
          e.preventDefault();
          stream.stop();
          return;
        }
        if (openedSource) {
          e.preventDefault();
          setOpenedSource(null);
        }
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === ".") {
        e.preventDefault();
        setInspectorOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stream.streaming, stream, openedSource]);

  const streamingCitations = toDisplayCitations(sessionId, stream.citations);
  const activeDebug = stream.debug ?? lastDebug;
  const isSplit = Boolean(openedSource);

  return (
    <div className="flex h-full flex-col">
      <ChatHeaderActions
        devMode={devMode}
        streaming={stream.streaming}
        hasDebug={Boolean(activeDebug)}
        onOpenInspector={() => setInspectorOpen(true)}
      />

      <div className="flex flex-1 min-h-0">
        {/* Chat column */}
        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col",
            isSplit && "hidden md:flex md:basis-1/2 md:min-w-105"
          )}
        >
          <div className="flex-1 overflow-y-auto">
            <MessageList
              messages={messages}
              pendingUserMessage={pendingUser}
              streaming={stream.streaming}
              streamingContent={stream.partial}
              streamingCitations={streamingCitations}
              onRegenerate={
                !stream.streaming && lastUserMessage
                  ? handleRegenerate
                  : undefined
              }
              onOpenCitation={handleOpenCitation}
            />
          </div>
          <MessageInput
            onSend={handleSend}
            onStop={stream.stop}
            isStreaming={stream.streaming}
            autoFocus
          />
        </div>

        {/* Source viewer — split on desktop, fullscreen overlay on mobile */}
        {openedSource && (
          <div
            className={cn(
              "flex flex-col border-l border-border-subtle bg-surface-2",
              // Desktop split-view
              "md:relative md:basis-1/2 md:min-w-105 md:max-w-[60%]",
              // Mobile fullscreen overlay
              "fixed inset-0 z-40 md:static md:z-auto md:inset-auto"
            )}
            data-testid="source-viewer-panel"
          >
            <LazySourceViewer
              documentId={openedSource.documentId}
              initialPage={openedSource.pageNumber}
              sourceTitle={openedSource.sourceTitle}
              onClose={handleCloseSource}
            />
          </div>
        )}
      </div>

      <RetrievalInspector
        open={inspectorOpen}
        onClose={() => setInspectorOpen(false)}
        debug={activeDebug}
        streaming={stream.streaming}
        totalDurationMs={stream.metrics.totalDurationMs ?? lastTotalMs}
      />
    </div>
  );
}