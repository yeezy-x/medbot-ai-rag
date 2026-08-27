import type {OllamaChatRequest,OllamaChatResponse} from "../types/ollama.types";

export interface ChatModel {
  generate(request: OllamaChatRequest): Promise<OllamaChatResponse>;
  generateStream(request: OllamaChatRequest,signal?: AbortSignal)
  : AsyncGenerator<{ delta: string; done: boolean }, void, unknown>;
}
