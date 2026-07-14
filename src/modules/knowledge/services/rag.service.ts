import {
  RetrievalService,
} from "./retrieval.service";

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
} from "../constants/retrieval.constants";

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
   * Context filtering / selection
   *   ↓
   * Prompt
   */
  private async buildContext(
    request: RAGRequest
  ): Promise<RAGContext> {
    /*
     * 1. Retrieve potentially relevant
     * medical knowledge.
     */
    const retrieval =
      await this.retrievalService.retrieve({
        query:
          request.question,

        topK:
          request.topK ??
          DEFAULT_TOP_K,
      });

    /*
     * 2. Build the final context window.
     *
     * ContextBuilder may:
     * - reject low-score chunks
     * - deduplicate chunks
     * - enforce context budget
     *
     * Therefore:
     *
     * retrieval.chunks.length
     *
     * may be greater than:
     *
     * context.chunks.length
     */
    const context =
      this.contextBuilder.build(
        retrieval.chunks
      );

    /*
     * 3. Build the final prompt using only
     * the accepted context window.
     */
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
   *
   * No chat persistence belongs here.
   */
  async generate(
    request: RAGRequest
  ): Promise<RAGResponse> {
    const startedAt =
      Date.now();

    /*
     * 1. Run retrieval and construct
     * the accepted context window.
     */
    const ragContext =
      await this.buildContext(
        request
      );

    /*
     * 2. Determine exactly which chunks
     * were accepted by ContextBuilder.
     */
    const acceptedChunkIds =
      new Set(
        ragContext.context.chunks.map(
          (chunk) => chunk.id
        )
      );

    /*
     * 3. Keep citations only for chunks
     * that are actually present in the
     * context sent to the LLM.
     *
     * This prevents citation
     * over-attribution.
     */
    const citations =
      ragContext.retrieval.citations.filter(
        (citation) =>
          acceptedChunkIds.has(
            citation.chunkId
          )
      );

    /*
     * 4. Development observability.
     */
    console.log(
      "\n========== RAG PIPELINE =========="
    );

    console.log({
      question:
        request.question,

      retrievedChunks:
        ragContext.retrieval.chunks.length,

      acceptedContextChunks:
        ragContext.context.chunks.length,

      returnedCitations:
        citations.length,
    });

    console.log(
      "\n[RAG FLOW] Final Context Sent to LLM:"
    );

    console.log(
      ragContext.context.text
    );

    console.log(
      "\n[RAG FLOW] Final Prompt Sent to LLM:"
    );

    console.log(
      ragContext.prompt.context
    );

    /*
     * 5. Generate the final answer.
     */
    const response =
      await this.ollamaChatService.generate({
        model:
          "qwen2.5-coder:3b",

        system:
          ragContext.prompt.system,

        prompt:
          ragContext.prompt.context,

        stream:
          false,
      });

    console.log(
      "\n========== OLLAMA =========="
    );

    console.log(response);

    /*
     * 6. Return only the AI-domain result.
     *
     * Database persistence remains the
     * responsibility of ChatService.
     */
    return {
      answer:
        response.response,

      citations,

      metrics: {
        durationMs:
          Date.now() - startedAt,

        retrievalDurationMs:
          ragContext.retrieval.durationMs,

        chunkCount:
          ragContext.context.chunks.length,
      },
    };
  }
}