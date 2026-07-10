import path from "path";
import { PdfService } from "./pdf.service";
import { NormalizationService } from "./normalization.service";
import { MetadataService } from "./metadata.service";
import { EmbeddingService } from "./embedding.service";
import { OllamaEmbeddingProvider } from "../providers/ollama.provider";

// Import the correct return type containing vectors
import { ChunkingService } from "./chunking.serivce";
import { IngestionOptions, IngestionResult } from "../types/ingestion.types";
import { VectorService } from "./vector.service";
import { DocumentRepository } from "../repositories";

export class IngestionService {
  constructor(
    private readonly pdfService = new PdfService(),
    private readonly normalizationService = new NormalizationService(),
    private readonly chunkingService = new ChunkingService(),
    private readonly metadataService = new MetadataService(),
    private readonly embeddingService = new EmbeddingService(new OllamaEmbeddingProvider()),
    private readonly documentRepository = new DocumentRepository(),
    private readonly vectorService = new VectorService() ) {}

  /**
   * Production Ingestion Pipeline
   * PDF ➔ Extract ➔ Normalize ➔ Chunk ➔ Metadata Enrichment ➔ Batched Vectorization
   */
  async ingest(
    pdfPath: string,
    options?: IngestionOptions
  ): Promise<IngestionResult> { 
    const startedAt = Date.now();
    // 1. Create the document record
    const document = await this.documentRepository.create({
      title: options?.title ?? path.basename(pdfPath, ".pdf"),
      version: options?.version ?? "1.0",
      language: options?.language ?? "en",
      sourceType: options?.sourceType ?? "PDF",
      fileName: path.basename(pdfPath),
    });
    try {
      // 2. Extract raw text from PDF
      const raw = await this.pdfService.extractText(pdfPath);
      // 3. Normalize whitespace, encodings, etc.
      const normalized = this.normalizationService.normalize(raw);
      // 4. Break text down into manageable chunks
      const chunks = this.chunkingService.createChunks(normalized.text);
      // 5. Construct metadata fallback values
      const defaultTitle = path.basename(pdfPath, ".pdf");
      const defaultFileName = path.basename(pdfPath);
      // 6. Merge provided options with defaults and generate knowledge chunks
      const knowledgeChunks = this.metadataService.createKnowledgeChunks(
        chunks,
        {
          id: document.id,
          title: document?.title ?? defaultTitle,
          version: document?.version ?? "1.0",
          language: document?.language ?? "en",
          sourceType: options?.sourceType ?? "PDF",
          fileName: defaultFileName,
        }
      );

      // 7. Execute safe, batched embedding generation
      const embeddedChunks = await this.embeddingService.embedChunks(knowledgeChunks);

      // 8. Upsert vectors
      const vectorResult = await this.vectorService.upsert({ documents: embeddedChunks });
      
      return {
        documentId: document.id,
        chunkCount: embeddedChunks.length,
        embeddingCount: embeddedChunks.length,
        inserted: vectorResult.inserted,
        updated: vectorResult.updated,
        durationMs: Date.now() - startedAt,
      };

    } catch (error) {
      // ROLLBACK: If anything above fails, remove the orphaned document record
      console.error(`❌ Ingestion failed for document ${document.id}. Rolling back...`);
      // Re-throw the error so your CLI script's .catch() block can handle it and exit(1)
      throw error; 
    }
  }
}