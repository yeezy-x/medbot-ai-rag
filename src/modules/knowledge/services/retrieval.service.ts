import { EmbeddingService } from "./embedding.service";
import { VectorService } from "./vector.service";

import { OllamaEmbeddingProvider } from "../providers/ollama.provider";
import {
  CitationReference,
  RetrievalRequest,
  RetrievalResult,
  RetrievedChunk,
} from "../types/retrieval.types";
import { KnowledgeChunk } from "../types/metadata.types";
import { DEFAULT_CANDIDATE_POOL_SIZE, DEFAULT_MIN_SIMILARITY_SCORE } from "../constants/retrieval.constants";

export class RetrievalService {
  constructor(
    private readonly embeddingService =
      new EmbeddingService(
        new OllamaEmbeddingProvider()
      ),
    private readonly vectorService =
      new VectorService()
  ) {}

  async retrieve(request: RetrievalRequest): Promise<RetrievalResult> {
    const startedAt = Date.now();
  // 1. Generate embedding for the user's query
    const embeddingResponse = await this.embeddingService.embedChunk({
      id:"query-temp-id",
      content: request.query,
    }as unknown as KnowledgeChunk) ;


    const candidatePoolSize=request.candidatePoolSize ?? DEFAULT_CANDIDATE_POOL_SIZE;
  // 2. Perform vector similarity search
  const searchResults =
    await this.vectorService.search({
      embedding: embeddingResponse.embedding,
      topK: candidatePoolSize,
      filter: request.filters,
    });

    const minScore = request.minScore === null ? null : request.minScore ?? DEFAULT_MIN_SIMILARITY_SCORE;

    const acceptedResults =
      minScore === null
        ? searchResults
        : searchResults.filter(
            (result) =>
              result.score >= minScore
        );

      const finalResults=acceptedResults.slice(0,request.topK);
  // 3. Convert vector results into retrieval results
  const chunks =
    this.mapRetrievedChunks(
      finalResults
    );
  // 4. Build citations
  const citations = this.buildCitations(chunks);
  return {
    query: request.query,
    chunks,
    citations,
    durationMs:Date.now()-startedAt,
  };
}

 private mapRetrievedChunks(
  searchResults: Awaited<
    ReturnType<VectorService["search"]>
  >
): RetrievedChunk[] {
  return searchResults.map(
    ({ chunk, score }) => {
      if (!chunk.id) {
        throw new Error(
          "Retrieved chunk is missing id."
        );
      }

      if (!chunk.documentId) {
        throw new Error(
          `Retrieved chunk ${chunk.id} is missing documentId.`
        );
      }

      if (!chunk.content.trim()) {
        throw new Error(
          `Retrieved chunk ${chunk.id} has empty content.`
        );
      }

      if (!Number.isFinite(score)) {
        throw new Error(
          `Retrieved chunk ${chunk.id} has invalid score: ${score}`
        );
      }

      if (!chunk.source.title.trim()) {
        throw new Error(
          `Retrieved chunk ${chunk.id} is missing source title.`
        );
      }

      return {
        id: chunk.id,
        documentId: chunk.documentId,
        content: chunk.content,
        score,

        pageNumber:
          chunk.pageNumber,

        chapter:
          chunk.chapter,

        section:
          chunk.section,

        headings:
          chunk.headings ?? [],

        source: {
          title:
            chunk.source.title,

          version:
            chunk.source.version,

          language:
            chunk.source.language,

          sourceType:
            chunk.source.sourceType,
        },
      };
    }
  );
}

  private buildCitations(chunks: RetrievedChunk[]): CitationReference[] {
  return chunks.map((chunk) => {
    if (!chunk.id) {
      throw new Error("Cannot build citation: chunk is missing id.");
    }
    if (!chunk.documentId) {
      throw new Error(
        `Cannot build citation for chunk ${chunk.id}: ` +
        `documentId is missing.`
      );
    }
    if (chunk.pageNumber === undefined) {
      throw new Error(
        `Cannot build citation for chunk ${chunk.id}: ` +
        `pageNumber is missing.`
      );
    }

    if (!chunk.source.title.trim()) {
      throw new Error(
        `Cannot build citation for chunk ${chunk.id}: ` +
        `source title is missing.`
      );
    }

    return {
      chunkId: chunk.id,
      documentId: chunk.documentId,
      pageNumber: chunk.pageNumber,
      sourceTitle: chunk.source.title,
    };
  });
}
}