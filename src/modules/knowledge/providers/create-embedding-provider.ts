import { env } from "@/config/env";
import { getEmbeddingModelName, resolveLlmProvider } from "@/config/llm";
import type { EmbeddingProvider } from "./embedding.provider";
import { GeminiEmbeddingProvider } from "./gemini-embedding.provider";
import { OllamaEmbeddingProvider } from "./ollama.provider";
import { OpenAICompatibleEmbeddingProvider } from "./openai-compatible-embedding.provider";

export function createEmbeddingProvider(): EmbeddingProvider {
  const provider = resolveLlmProvider();
  const model = getEmbeddingModelName();

  if (provider === "openrouter") {
    if (!env.OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is required when LLM_PROVIDER=openrouter");
    }
    return new OpenAICompatibleEmbeddingProvider(model, env.OPENROUTER_API_KEY);
  }

  if (provider === "gemini") {
    if (!env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is required when LLM_PROVIDER=gemini");
    }
    return new GeminiEmbeddingProvider(model, env.GEMINI_API_KEY);
  }

  return new OllamaEmbeddingProvider();
}
