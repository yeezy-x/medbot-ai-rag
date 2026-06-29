import path from "path";
import { randomUUID } from "crypto";

import { PdfService } from "./pdf.service";
import { NormalizationService } from "./normalization.service";
import { MetadataService } from "./metadata.service";
import { EmbeddingService } from "./embedding.service";
import { OllamaEmbeddingProvider } from "../providers/ollama.provider";

// Import the correct return type containing vectors
import { ChunkingService } from "./chunking.serivce";
import { IngestionOptions, IngestionResult } from "../types/ingestion.types";
import { VectorService } from "./vector.service";

export class IngestionService {
  constructor(
    private readonly pdfService = new PdfService(),
    private readonly normalizationService = new NormalizationService(),
    private readonly chunkingService = new ChunkingService(),
    private readonly metadataService = new MetadataService(),
    private readonly embeddingService = new EmbeddingService(new OllamaEmbeddingProvider()),
    private readonly vectorService = new VectorService()
  ) {}

  /**
   * Production Ingestion Pipeline
   * PDF ➔ Extract ➔ Normalize ➔ Chunk ➔ Metadata Enrichment ➔ Batched Vectorization
   */
  async ingest(
    pdfPath: string,
    options?: IngestionOptions
  ): Promise<IngestionResult> { // UPDATED: Returns embedded chunks
    const startedAt=Date.now();
    const documentId=randomUUID()

    // 1. Extract raw text from PDF
    const raw = await this.pdfService.extractText(pdfPath);

    // 2. Normalize whitespace, encodings, etc.
    const normalized = this.normalizationService.normalize(raw);

    // 3. Break text down into manageable chunks
    const chunks = this.chunkingService.createChunks(normalized.text);

    // 4. Construct metadata fallback values
    const defaultTitle = path.basename(pdfPath, ".pdf");
    const defaultFileName = path.basename(pdfPath);

    // 5. Merge provided options with defaults and generate knowledge chunks
    const knowledgeChunks = this.metadataService.createKnowledgeChunks(
      chunks,
      {
        id: randomUUID(),
        title: options?.title ?? defaultTitle,
        version: options?.version ?? "1.0",
        language: options?.language ?? "en",
        sourceType: options?.sourceType ?? "PDF",
        fileName: defaultFileName,
      }
    );

    // 6. Execute safe, batched embedding generation (Production Guardrail)
    const embeddedChunks = await this.embeddingService.embedChunks(knowledgeChunks);
    const vectorResult = await this.vectorService.upsert({documents:embeddedChunks})
    return {
      documentId,
      chunkCount:
        embeddedChunks.length,
      embeddingCount:
        embeddedChunks.length,
      inserted:
        vectorResult.inserted,
      updated:
        vectorResult.updated,
      durationMs:
        Date.now() -
        startedAt,
    };
  }
}