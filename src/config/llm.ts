import { env } from "@/config/env";
import { DEFAULT_OLLAMA_MODEL } from "@/modules/chat/constants/ollama.constants";
import { EMBEDDING } from "@/modules/knowledge/constants/embedding.constants";

export type LlmProviderName = "ollama" | "openrouter" | "gemini";

export function resolveLlmProvider(): LlmProviderName {
  if (env.LLM_PROVIDER !== "auto") {
    return env.LLM_PROVIDER;
  }
  if (env.OPENROUTER_API_KEY) return "openrouter";
  if (env.GEMINI_API_KEY) return "gemini";
  return "ollama";
}

export function getChatModelName(): string {
  if (env.CHAT_MODEL) return env.CHAT_MODEL;
  const provider = resolveLlmProvider();
  if (provider === "openrouter") return env.OPENROUTER_CHAT_MODEL;
  if (provider === "gemini") return env.GEMINI_CHAT_MODEL;
  return DEFAULT_OLLAMA_MODEL;
}

export function getEmbeddingModelName(): string {
  const provider = resolveLlmProvider();
  if (provider === "openrouter") return env.OPENROUTER_EMBED_MODEL;
  if (provider === "gemini") return env.GEMINI_EMBED_MODEL;
  return EMBEDDING.MODEL;
}

export function getLlmRuntime() {
  const provider = resolveLlmProvider();
  return {
    provider,
    chatModel: getChatModelName(),
    embedModel: getEmbeddingModelName(),
  };
}

export function assertProductionLlmConfigured(): void {
  if (!process.env.VERCEL) return;
  const provider = resolveLlmProvider();
  if (provider === "ollama") {
    throw new Error(
      "Production cannot reach local Ollama. Set OPENROUTER_API_KEY or GEMINI_API_KEY (or LLM_PROVIDER)."
    );
  }
}
