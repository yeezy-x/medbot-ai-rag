import type {
  OllamaChatRequest,
  OllamaChatResponse,
} from "../types/ollama.types";

/**
 * OllamaChatService
 *
 * Isolation boundary between the MedBot Next.js backend and the local Ollama
 * inference server. Supports both single-shot generation (`generate`) and
 * token streaming (`generateStream`). Network failures are trapped so the
 * caller (ChatService) can decide how to persist partial results.
 */
export class OllamaChatService {
  constructor(
    private readonly baseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434"
  ) {}

  /**
   * Single-shot generation. Kept for compatibility with the non-streaming
   * endpoint at `POST /api/chats/[id]/messages`.
   */
  async generate(request: OllamaChatRequest): Promise<OllamaChatResponse> {
    return this.post<OllamaChatResponse>("/api/generate", {
      ...request,
      stream: false,
    });
  }

  /**
   * Streaming generation. Ollama returns newline-delimited JSON where each
   * frame has `{ response: string, done: boolean, ... }`. We adapt it to a
   * clean async iterator of `{ delta, done }`.
   */
  async *generateStream(
    request: OllamaChatRequest,
    signal?: AbortSignal
  ): AsyncGenerator<{ delta: string; done: boolean }, void, unknown> {
    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...request, stream: true }),
      signal,
    });

    if (!response.ok || !response.body) {
      if (response.status === 404) {
        const modelName =
          (request as unknown as { model?: string }).model ?? "your-model";
        throw new Error(
          `[OllamaChatService] 404 Not Found. Run \`ollama pull ${modelName}\` first.`
        );
      }
      throw new Error(
        `[OllamaChatService] Stream request failed: ${response.status} ${response.statusText}`
      );
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // NDJSON — split on newlines, keep the trailing partial line in buffer.
        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, newlineIdx).trim();
          buffer = buffer.slice(newlineIdx + 1);
          if (!line) continue;
          try {
            const frame = JSON.parse(line) as {
              response?: string;
              done?: boolean;
            };
            yield {
              delta: frame.response ?? "",
              done: Boolean(frame.done),
            };
            if (frame.done) return;
          } catch {
            // Ignore malformed line — Ollama sometimes emits an empty final line.
          }
        }
      }

      // Drain any final buffered frame.
      const tail = buffer.trim();
      if (tail) {
        try {
          const frame = JSON.parse(tail) as {
            response?: string;
            done?: boolean;
          };
          yield {
            delta: frame.response ?? "",
            done: Boolean(frame.done),
          };
        } catch {
          /* ignore */
        }
      }
    } finally {
      try {
        reader.releaseLock();
      } catch {
        /* noop */
      }
    }
  }

  private async post<T>(endpoint: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (response.status === 404) {
        const modelName =
          (body as Record<string, unknown>)?.model ?? "your-model";
        throw new Error(
          `[OllamaChatService] 404 Not Found. Run \`ollama pull ${modelName}\` first.`
        );
      }
      throw new Error(
        `[OllamaChatService] Request failed: ${response.status} ${response.statusText}`
      );
    }

    return response.json() as Promise<T>;
  }
}
