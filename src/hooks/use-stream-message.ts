"use client";

import { useCallback, useRef, useState } from "react";
import {
  streamMessage,
  type DebugPayload,
  type StreamEvent,
} from "@/modules/chat/api/stream";
import type { CitationReference } from "@/modules/knowledge/types/retrieval.types";

interface StreamMetrics {
  retrievalDurationMs?: number;
  retrievedChunkCount?: number;
  acceptedChunkCount?: number;
  totalDurationMs?: number;
  chunkCount?: number;
}

interface SendOptions {
  debug?: boolean;
  topK?: number;
  minScore?: number;
}

interface UseStreamMessageResult {
  streaming: boolean;
  partial: string;
  citations: CitationReference[];
  metrics: StreamMetrics;
  debug: DebugPayload | null;
  error: string | null;
  send: (
    sessionId: string,
    message: string,
    options?: SendOptions
  ) => Promise<{
    answer: string;
    citations: CitationReference[];
    metrics: StreamMetrics;
    debug: DebugPayload | null;
    aborted: boolean;
  }>;
  stop: () => void;
  reset: () => void;
}

/**
 * Client-side hook that owns the streaming lifecycle for a single message.
 * Consumers render `partial` as the streaming assistant bubble; when `send()`
 * resolves, they promote it to a persisted message and clear the hook.
 */
export function useStreamMessage(): UseStreamMessageResult {
  const [streaming, setStreaming] = useState(false);
  const [partial, setPartial] = useState("");
  const [citations, setCitations] = useState<CitationReference[]>([]);
  const [metrics, setMetrics] = useState<StreamMetrics>({});
  const [debug, setDebug] = useState<DebugPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    setStreaming(false);
    setPartial("");
    setCitations([]);
    setMetrics({});
    setDebug(null);
    setError(null);
    abortRef.current = null;
  }, []);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const send = useCallback(
    async (sessionId: string, message: string, options: SendOptions = {}) => {
      const controller = new AbortController();
      abortRef.current = controller;

      setStreaming(true);
      setPartial("");
      setCitations([]);
      setMetrics({});
      setDebug(null);
      setError(null);

      let accumulated = "";
      let finalCitations: CitationReference[] = [];
      let finalDebug: DebugPayload | null = null;
      const finalMetrics: StreamMetrics = {};
      let aborted = false;
      let errored: string | null = null;

      const onEvent = (event: StreamEvent) => {
        switch (event.type) {
          case "context":
            finalCitations = event.citations;
            setCitations(event.citations);
            finalMetrics.retrievedChunkCount = event.retrievedChunkCount;
            finalMetrics.acceptedChunkCount = event.acceptedChunkCount;
            finalMetrics.retrievalDurationMs = event.retrievalDurationMs;
            setMetrics({ ...finalMetrics });
            if (event.debug) {
              finalDebug = event.debug;
              setDebug(event.debug);
            }
            break;
          case "token":
            accumulated += event.delta;
            setPartial(accumulated);
            break;
          case "done":
            if (event.answer) {
              accumulated = event.answer;
              setPartial(accumulated);
            }
            finalMetrics.totalDurationMs = event.metrics.durationMs;
            finalMetrics.retrievalDurationMs = event.metrics.retrievalDurationMs;
            finalMetrics.chunkCount = event.metrics.chunkCount;
            setMetrics({ ...finalMetrics });
            break;
          case "error":
            errored = event.message;
            setError(event.message);
            break;
        }
      };

      try {
        await streamMessage(sessionId, message, {
          onEvent,
          signal: controller.signal,
          debug: options.debug,
          topK: options.topK,
          minScore: options.minScore,
        });
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          aborted = true;
        } else {
          errored = err instanceof Error ? err.message : "Stream failed";
          setError(errored);
        }
      } finally {
        if (controller.signal.aborted) aborted = true;
        setStreaming(false);
        abortRef.current = null;
      }

      if (errored) throw new Error(errored);

      return {
        answer: accumulated,
        citations: finalCitations,
        metrics: finalMetrics,
        debug: finalDebug,
        aborted,
      };
    },
    []
  );

  return { streaming, partial, citations, metrics, debug, error, send, stop, reset };
}