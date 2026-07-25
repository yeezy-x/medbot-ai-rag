import type { CitationReference } from "@/modules/knowledge/types/retrieval.types";

/** Chunk-level entry inside the debug payload. Mirrors the server type. */
export interface DebugChunk {
  id: string;
  score: number;
  pageNumber?: number;
  chapter?: string;
  section?: string;
  documentId: string;
  sourceTitle: string;
  contentPreview: string;
  accepted: boolean;
  rejectionReason?: string;
}

export interface DebugPayload {
  retrieval: {
    query: string;
    topK: number;
    minScore: number;
    durationMs: number;
    chunks: DebugChunk[];
  };
  context: {
    totalCharacters: number;
    totalEstimatedTokens: number;
    maxCharacters: number;
    acceptedChunkCount: number;
  };
  prompt: {
    system: string;
    contextPreview: string;
    question: string;
  };
}

/** Mirror of the server-side RAGStreamEvent. */
export type StreamEvent =
  | {
      type: "context";
      citations: CitationReference[];
      retrievedChunkCount: number;
      acceptedChunkCount: number;
      retrievalDurationMs: number;
      debug?: DebugPayload;
    }
  | { type: "token"; delta: string }
  | {
      type: "done";
      answer: string;
      metrics: {
        durationMs: number;
        retrievalDurationMs: number;
        chunkCount: number;
      };
    }
  | { type: "error"; message: string };

export interface StreamHandlers {
  onEvent: (event: StreamEvent) => void;
  signal?: AbortSignal;
  debug?: boolean;
  topK?: number;
  minScore?: number;
}

/**
 * Posts a user question to the streaming endpoint and pushes each SSE `data:`
 * frame through `onEvent`. The Promise resolves when the stream terminates.
 */
export async function streamMessage(
  sessionId: string,
  message: string,
  { onEvent, signal, debug, topK, minScore }: StreamHandlers
): Promise<void> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (debug) headers["x-medbot-debug"] = "1";

  const response = await fetch(`/api/chats/${sessionId}/messages/stream`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      sessionId,
      message,
      ...(topK !== undefined ? { topK } : {}),
      ...(minScore !== undefined ? { minScore } : {}),
    }),
    signal,
  });

  if (!response.ok || !response.body) {
    let msg = `Request failed: ${response.status}`;
    try {
      const err = await response.json();
      msg = err?.error?.message ?? msg;
    } catch {
      /* ignore */
    }
    onEvent({ type: "error", message: msg });
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let boundary: number;
      while ((boundary = buffer.indexOf("\n\n")) !== -1) {
        const rawFrame = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);

        const dataLines = rawFrame
          .split("\n")
          .filter((l) => l.startsWith("data:"))
          .map((l) => l.slice(5).trim());
        if (dataLines.length === 0) continue;

        const payload = dataLines.join("\n");
        try {
          const event = JSON.parse(payload) as StreamEvent;
          onEvent(event);
        } catch {
          /* ignore malformed frames */
        }
      }
    }
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") return;
    onEvent({
      type: "error",
      message: err instanceof Error ? err.message : "Stream broken",
    });
  } finally {
    try {
      reader.releaseLock();
    } catch {
      /* noop */
    }
  }
}