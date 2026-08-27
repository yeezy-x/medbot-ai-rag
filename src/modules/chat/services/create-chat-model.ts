import { env } from "@/config/env";
import { resolveLlmProvider } from "@/config/llm";
import type { ChatModel } from "./chat-model";
import { GeminiChatService } from "./gemini-chat.service";
import { OllamaChatService } from "./ollama-chat.service";
import { OpenAICompatibleChatService } from "./openai-compatible-chat.service";

export function createChatModel(): ChatModel {
  const provider = resolveLlmProvider();

  if (provider === "openrouter") {
    if (!env.OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is required when LLM_PROVIDER=openrouter");
    }
    return new OpenAICompatibleChatService(
      env.OPENROUTER_API_KEY,
      "https://openrouter.ai/api/v1",
      {
        "HTTP-Referer": "https://medbot-nu.vercel.app",
        "X-Title": "MedBot",
      }
    );
  }

  if (provider === "gemini") {
    if (!env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is required when LLM_PROVIDER=gemini");
    }
    return new GeminiChatService(env.GEMINI_API_KEY);
  }

  return new OllamaChatService(env.OLLAMA_BASE_URL ?? "http://localhost:11434");
}
