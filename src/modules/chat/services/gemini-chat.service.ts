import type {
  OllamaChatRequest,
  OllamaChatResponse,
} from "../types/ollama.types";
import type { ChatModel } from "./chat-model";

function geminiUrl(model: string, method: "generateContent" | "streamGenerateContent", apiKey: string) {
  const encoded = encodeURIComponent(model);
  const alt = method === "streamGenerateContent" ? "&alt=sse" : "";
  return `https://generativelanguage.googleapis.com/v1beta/models/${encoded}:${method}?key=${apiKey}${alt}`;
}

function toGeminiBody(request: OllamaChatRequest) {
  return {
    systemInstruction: request.system
      ? { parts: [{ text: request.system }] }
      : undefined,
    contents: [{ role: "user", parts: [{ text: request.prompt }] }],
    generationConfig: {
      temperature: request.options?.temperature,
      topP: request.options?.topP,
      topK: request.options?.topK,
    },
  };
}

export class GeminiChatService implements ChatModel {
  constructor(private readonly apiKey: string) {}

  async generate(request: OllamaChatRequest): Promise<OllamaChatResponse> {
    const response = await fetch(geminiUrl(request.model, "generateContent", this.apiKey), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toGeminiBody(request)),
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`[GeminiChat] ${response.status}: ${body.slice(0, 400)}`);
    }
    const json = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text =
      json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ??
      "";
    return { model: request.model, response: text, done: true };
  }

  async *generateStream(
    request: OllamaChatRequest,
    signal?: AbortSignal
  ): AsyncGenerator<{ delta: string; done: boolean }, void, unknown> {
    const response = await fetch(
      geminiUrl(request.model, "streamGenerateContent", this.apiKey),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toGeminiBody(request)),
        signal,
      }
    );
    if (!response.ok || !response.body) {
      const body = await response.text().catch(() => "");
      throw new Error(`[GeminiChat] stream ${response.status}: ${body.slice(0, 400)}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, newlineIdx).trim();
          buffer = buffer.slice(newlineIdx + 1);
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (!data) continue;
          try {
            const frame = JSON.parse(data) as {
              candidates?: Array<{
                content?: { parts?: Array<{ text?: string }> };
              }>;
            };
            const delta =
              frame.candidates?.[0]?.content?.parts
                ?.map((p) => p.text ?? "")
                .join("") ?? "";
            if (delta) yield { delta, done: false };
          } catch {
            /* ignore */
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
