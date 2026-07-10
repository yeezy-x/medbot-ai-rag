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
  const embeddingResponse =
    await this.embeddingService.embedChunk({
      id:"query-temp-id",
      content: request.query,
    }as unknown as KnowledgeChunk) ;

  // 2. Perform vector similarity search
  const searchResults =
    await this.vectorService.search({
      embedding: embeddingResponse.embedding,
      topK: request.topK,
      filter: request.filters,
    });
    // --- ADD THIS LOG ---
  console.log(`[RAG FLOW] Retrieved ${searchResults.length} chunks for query: "${request.query}"`);
  searchResults.forEach((res, i) => {
    console.log(`  Chunk ${i+1} (Score: ${res.score.toFixed(4)}): ${res.chunk.content.substring(0, 50)}...`);
  });
  // --------------------
  // 3. Convert vector results into retrieval results
  const chunks =
    this.mapRetrievedChunks(
      searchResults
    );
  console.log("Retrieved chunks:");
  console.log(searchResults);
  // 4. Build citations
  const citations = this.buildCitations(chunks);
  return {
    query: request.query,
    chunks,
    citations,
    durationMs:Date.now()-startedAt,
  };
}

  private mapRetrievedChunks(searchResults: Awaited<ReturnType<VectorService["search"]>>): RetrievedChunk[] {
  return searchResults.map(
    ({ chunk, score }) => ({
      id: chunk.id,
      documentId:
        chunk.documentId,
      content:
        chunk.content,
      score,
      pageNumber:
        chunk.pageNumber,
      chapter:
        chunk.chapter,
      section:
        chunk.section,
      headings:
        chunk.headings,
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
    })
  );
}

  private buildCitations(chunks: RetrievedChunk[]): CitationReference[] {
  return chunks.map((chunk) => ({
    chunkId: chunk.id,
    documentId: chunk.documentId,
    pageNumber: chunk.pageNumber,
    sourceTitle: chunk.source.title,
  }));
}
}