import { RetrievalService } from "./retrieval.service";
import { ContextBuilder } from "../builders/context.builder";
import { PromptBuilder } from "../builders/prompt.builder";
import type { RAGContext, RAGRequest, RAGResponse } from "../types/rag.types";
import type {CitationReference,RetrievedChunk} from "../types/retrieval.types";
import { createChatModel } from "@/modules/chat/services/create-chat-model";
import type { ChatModel } from "@/modules/chat/services/chat-model";
import { assertProductionLlmConfigured, getChatModelName } from "@/config/llm";
import {DEFAULT_MIN_SIMILARITY_SCORE,DEFAULT_TOP_K} from "../constants/retrieval.constants";
import { MAX_CONTEXT_CHARACTERS } from "../constants/context.constants";

/** Rich debug payload exposed only in developer mode. */
export interface RAGDebugPayload {
  retrieval: {
    query: string;
    topK: number;
    minScore: number;
    durationMs: number;
    chunks: Array<{
      id: string;
      chunkIndex?: number;
      score: number;
      pageNumber?: number;
      chapter?: string;
      section?: string;
      documentId: string;
      sourceTitle: string;
      contentPreview: string;
      accepted: boolean;
      rejectionReason?: string;
    }>;
  };
  context: {
    totalCharacters: number;
    totalEstimatedTokens: number;
    maxCharacters: number;
    acceptedChunkCount: number;
  };
  prompt: {
    system: string;
    contextPreview: string; // truncated to 4KB
    question: string;
  };
}

/** Discriminated union emitted by the streaming RAG pipeline. */
export type RAGStreamEvent =
  | {
      type: "context";
      citations: CitationReference[];
      retrievedChunkCount: number;
      acceptedChunkCount: number;
      retrievalDurationMs: number;
      debug?: RAGDebugPayload;
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

export interface RAGStreamOptions {
  signal?: AbortSignal;
  debug?: boolean;
}

const PREVIEW_CHARS = 320;
const PROMPT_PREVIEW_LIMIT = 4096;

export class RAGService {
  constructor(
    private readonly retrievalService = new RetrievalService(),
    private readonly contextBuilder = new ContextBuilder(),
    private readonly promptBuilder = new PromptBuilder(),
    private readonly chatModel: ChatModel = createChatModel()
  ) {}

  private async buildContext(request: RAGRequest): Promise<RAGContext> {
    const retrieval = await this.retrievalService.retrieve({
      query: request.question,
      topK: request.topK ?? DEFAULT_TOP_K,
      candidatePoolSize: request.topK ?? DEFAULT_TOP_K,
      minScore: request.minScore ?? DEFAULT_MIN_SIMILARITY_SCORE
    });
    const context = this.contextBuilder.build(retrieval.chunks);
    const prompt = this.promptBuilder.build(
      request.question,
      context,
      request.history ?? []
    );
    return { retrieval, context, prompt };
  }

  private filterCitations(ragContext: RAGContext): CitationReference[] {
    const acceptedChunkIds = new Set(
      ragContext.context.chunks.map((c) => c.id)
    );
    return ragContext.retrieval.citations.filter((c) =>
      acceptedChunkIds.has(c.chunkId)
    );
  }

  /**
   * Build the rich debug payload from an already-computed RAG context.
   * Chunks not present in the accepted context window are labelled with a
   * rejection reason derived from what we know:
   *   - score below MIN_SIMILARITY_SCORE  → "similarity below threshold"
   *     (defensive: retrieval usually filters these, but we double-check)
   *   - otherwise                          → "context window budget exceeded"
   */
  private buildDebugPayload(
    ragContext: RAGContext,
    request: RAGRequest
  ): RAGDebugPayload {
    const acceptedIds = new Set(ragContext.context.chunks.map((c) => c.id));
    const effectiveMinScore = request.minScore ?? DEFAULT_MIN_SIMILARITY_SCORE;
    const chunks = ragContext.retrieval.chunks.map(
      (c: RetrievedChunk) => {
        const accepted = acceptedIds.has(c.id);
        let rejectionReason: string | undefined;
        if (!accepted) {
          if (c.score < effectiveMinScore) {
            rejectionReason = "similarity below threshold";
          } else {
            rejectionReason = "context window budget exceeded";
          }
        }
        return {
          id: c.id,
          score: c.score,
          pageNumber: c.pageNumber,
          chapter: c.chapter,
          section: c.section,
          documentId: c.documentId,
          sourceTitle: c.source.title,
          contentPreview:
            c.content.length > PREVIEW_CHARS
              ? `${c.content.slice(0, PREVIEW_CHARS)}…`
              : c.content,
          accepted,
          rejectionReason,
        };
      }
    );

    const promptContext = ragContext.prompt.context ?? "";
    const contextPreview =
      promptContext.length > PROMPT_PREVIEW_LIMIT
        ? `${promptContext.slice(0, PROMPT_PREVIEW_LIMIT)}…`
        : promptContext;

    return {
      retrieval: {
        query: request.question,
        topK: request.topK ?? DEFAULT_TOP_K,
        minScore: effectiveMinScore,
        durationMs: ragContext.retrieval.durationMs,
        chunks,
      },
      context: {
        totalCharacters: ragContext.context.totalCharacters,
        totalEstimatedTokens: ragContext.context.totalEstimatedTokens,
        maxCharacters: MAX_CONTEXT_CHARACTERS,
        acceptedChunkCount: ragContext.context.chunks.length,
      },
      prompt: {
        system: ragContext.prompt.system ?? "",
        contextPreview,
        question: ragContext.prompt.question ?? request.question,
      },
    };
  }

  /**
   * Non-streaming pipeline — kept for compatibility.
   */
  async generate(request: RAGRequest): Promise<RAGResponse> {
    assertProductionLlmConfigured();
    const startedAt = Date.now();
    const ragContext = await this.buildContext(request);
    const citations = this.filterCitations(ragContext);

    const response = await this.chatModel.generate({
      model: getChatModelName(),
      system: ragContext.prompt.system,
      prompt: ragContext.prompt.context,
      stream: false,
    });

    return {
      answer: response.response,
      citations,
      metrics: {
        durationMs: Date.now() - startedAt,
        retrievalDurationMs: ragContext.retrieval.durationMs,
        chunkCount: ragContext.context.chunks.length,
      },
    };
  }

  /**
   * Streaming pipeline. Emits a `context` event first (citations + optionally
   * a rich debug payload when `options.debug` is true), then per-token `token`
   * events, then a final `done` event with the fully-accumulated answer.
   */
  async *streamGenerate(
    request: RAGRequest,
    options: RAGStreamOptions = {}
  ): AsyncGenerator<RAGStreamEvent, void, unknown> {
    const { signal, debug = false } = options;
    try {
      assertProductionLlmConfigured();
    } catch (err) {
      yield {
        type: "error",
        message: err instanceof Error ? err.message : "LLM is not configured",
      };
      return;
    }
    const startedAt = Date.now();
    let ragContext: RAGContext;
    try {
      ragContext = await this.buildContext(request);
    } catch (err) {
      yield {
        type: "error",
        message: err instanceof Error ? err.message : "Retrieval failed",
      };
      return;
    }

    const citations = this.filterCitations(ragContext);
    yield {
      type: "context",
      citations,
      retrievedChunkCount: ragContext.retrieval.chunks.length,
      acceptedChunkCount: ragContext.context.chunks.length,
      retrievalDurationMs: ragContext.retrieval.durationMs,
      ...(debug
        ? { debug: this.buildDebugPayload(ragContext, request) }
        : {}),
    };

    let answer = "";
    try {
      for await (const frame of this.chatModel.generateStream(
        {
          model: getChatModelName(),
          system: ragContext.prompt.system,
          prompt: ragContext.prompt.context,
        },
        signal
      )) {
        if (frame.delta) {
          answer += frame.delta;
          yield { type: "token", delta: frame.delta };
        }
        if (frame.done) break;
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        yield {
          type: "done",
          answer,
          metrics: {
            durationMs: Date.now() - startedAt,
            retrievalDurationMs: ragContext.retrieval.durationMs,
            chunkCount: ragContext.context.chunks.length,
          },
        };
        return;
      }
      yield {
        type: "error",
        message: err instanceof Error ? err.message : "Generation failed",
      };
      return;
    }

    yield {
      type: "done",
      answer,
      metrics: {
        durationMs: Date.now() - startedAt,
        retrievalDurationMs: ragContext.retrieval.durationMs,
        chunkCount: ragContext.context.chunks.length,
      },
    };
  }
}