import type {
  OllamaChatRequest,
  OllamaChatResponse,
} from "../types/ollama.types";
import type { ChatModel } from "./chat-model";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

function toMessages(request: OllamaChatRequest): ChatMessage[] {
  const messages: ChatMessage[] = [];
  if (request.system) {
    messages.push({ role: "system", content: request.system });
  }
  messages.push({ role: "user", content: request.prompt });
  return messages;
}

/**
 * OpenAI-compatible chat (OpenRouter, etc).
 */
export class OpenAICompatibleChatService implements ChatModel {
  constructor(
    private readonly apiKey: string,
    private readonly baseUrl: string,
    private readonly extraHeaders: Record<string, string> = {}
  ) {}

  async generate(request: OllamaChatRequest): Promise<OllamaChatResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...this.extraHeaders,
      },
      body: JSON.stringify({
        model: request.model,
        messages: toMessages(request),
        stream: false,
        temperature: request.options?.temperature,
        top_p: request.options?.topP,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `[OpenAICompatibleChat] ${response.status} ${response.statusText}: ${body.slice(0, 400)}`
      );
    }

    const json = (await response.json()) as {
      model?: string;
      choices?: Array<{ message?: { content?: string } }>;
    };
    return {
      model: json.model ?? request.model,
      response: json.choices?.[0]?.message?.content ?? "",
      done: true,
    };
  }

  async *generateStream(
    request: OllamaChatRequest,
    signal?: AbortSignal
  ): AsyncGenerator<{ delta: string; done: boolean }, void, unknown> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        ...this.extraHeaders,
      },
      body: JSON.stringify({
        model: request.model,
        messages: toMessages(request),
        stream: true,
        temperature: request.options?.temperature,
        top_p: request.options?.topP,
      }),
      signal,
    });

    if (!response.ok || !response.body) {
      const body = await response.text().catch(() => "");
      throw new Error(
        `[OpenAICompatibleChat] stream ${response.status}: ${body.slice(0, 400)}`
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

        let separator: number;
        while ((separator = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, separator).trim();
          buffer = buffer.slice(separator + 1);
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (!data || data === "[DONE]") {
            if (data === "[DONE]") {
              yield { delta: "", done: true };
              return;
            }
            continue;
          }
          try {
            const frame = JSON.parse(data) as {
              choices?: Array<{
                delta?: { content?: string };
                finish_reason?: string | null;
              }>;
            };
            const delta = frame.choices?.[0]?.delta?.content ?? "";
            const finished = Boolean(frame.choices?.[0]?.finish_reason);
            if (delta) yield { delta, done: false };
            if (finished) {
              yield { delta: "", done: true };
              return;
            }
          } catch {
            /* ignore keep-alives */
          }
        }
      }
      yield { delta: "", done: true };
    } finally {
      try {
        reader.releaseLock();
      } catch {
        /* noop */
      }
    }
  }
}
