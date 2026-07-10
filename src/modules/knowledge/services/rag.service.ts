import { RetrievalService } from "./retrieval.service";

import {
  ContextBuilder,
} from "../builders/context.builder";

import {
  PromptBuilder,
} from "../builders/prompt.builder";

import {
  RAGContext,
  RAGRequest,
  RAGResponse,
} from "../types/rag.types";

import {
  OllamaChatService,
} from "@/modules/chat/services/ollama-chat.service";

import {
  DEFAULT_TOP_K,
} from "@/modules/chat/constants/retrieval.constants";

export class RAGService {
  constructor(
    private readonly retrievalService =
      new RetrievalService(),

    private readonly contextBuilder =
      new ContextBuilder(),

    private readonly promptBuilder =
      new PromptBuilder(),

    private readonly ollamaChatService =
      new OllamaChatService()
  ) {}

  /**
   * Builds the complete augmented context required
   * for answer generation.
   *
   * Question
   *   ↓
   * Retrieval
   *   ↓
   * Context
   *   ↓
   * Prompt
   */
  private async buildContext(
    request: RAGRequest
  ): Promise<RAGContext> {
    // 1. Retrieve relevant medical knowledge
    const retrieval =
      await this.retrievalService.retrieve({
        query: request.question,

        topK:
          request.topK ??
          DEFAULT_TOP_K,
      });

    // 2. Build structured context window
    const context =
      this.contextBuilder.build(
        retrieval.chunks
      );

    // 3. Build final prompt with conversation history
    const prompt =
      this.promptBuilder.build(
        request.question,
        context,
        request.history ?? []
      );

    return {
      retrieval,
      context,
      prompt,
    };
  }

  /**
   * Main RAG pipeline entry point.
   *
   * Retrieve
   *   ↓
   * Augment
   *   ↓
   * Generate
   */
  async generate(
    request: RAGRequest
  ): Promise<RAGResponse> {
    const startedAt = Date.now();

    // 1. Build retrieval context and prompt
    const ragContext =
      await this.buildContext(request);

    console.log(
      `[RAG FLOW] Retrieved ${ragContext.retrieval.chunks.length} chunks for query: "${request.question}"`
    );

    console.log(
      "[RAG FLOW] Final Context Sent to LLM:",
      ragContext.context.text
    );

    console.log(
      "[RAG FLOW] Final Prompt Sent to LLM:",
      ragContext.prompt.context
    );

    // 2. Generate the answer
    const response =
      await this.ollamaChatService.generate({
        model: "qwen2.5-coder:3b",

        system:
          ragContext.prompt.system,

        prompt:
          ragContext.prompt.context,

        stream: false,
      });
    console.log(
      "========== OLLAMA =========="
    );
    console.log(response);
    // 3. Return AI result only.
    // No database persistence belongs here.
    return {
      answer: response.response,
      citations: ragContext.retrieval.citations,
      metrics: {
        durationMs:Date.now() - startedAt,
        retrievalDurationMs:ragContext.retrieval.durationMs,
        chunkCount:ragContext.retrieval.chunks.length,
      },
    };
  }
}