import path from "path";

import { PdfService } from "./pdf.service";
import { NormalizationService } from "./normalization.service";
import { MetadataService } from "./metadata.service";
import { EmbeddingService } from "./embedding.service";
import { ChunkingService } from "./chunking.serivce";
import { VectorService } from "./vector.service";
import { ChecksumService } from "./checksum.service";

import { OllamaEmbeddingProvider } from "../providers/ollama.provider";

import {
  DocumentRepository,
} from "@/modules/knowledge/repositories/document.repository"

import {
  IngestionOptions,
  IngestionResult,
} from "../types/ingestion.types";
import { SourceType } from "../types/metadata.types";

export class IngestionService {
  constructor(
    private readonly pdfService =
      new PdfService(),

    private readonly normalizationService =
      new NormalizationService(),

    private readonly chunkingService =
      new ChunkingService(),

    private readonly metadataService =
      new MetadataService(),

    private readonly embeddingService =
      new EmbeddingService(
        new OllamaEmbeddingProvider()
      ),

    private readonly documentRepository =
      new DocumentRepository(),

    private readonly vectorService =
      new VectorService(),

    private readonly checksumService =
      new ChecksumService()
  ) {}

  async ingest(
    pdfPath: string,
    options?: IngestionOptions
  ): Promise<IngestionResult> {
    const startedAt = Date.now();

    console.log(
      "\n[INGESTION] Starting ingestion pipeline"
    );

    /*
     * STEP 1 — Calculate checksum.
     *
     * This uniquely identifies the exact file contents.
     */
    console.time("[INGESTION] Checksum");

    const checksum =
      await this.checksumService
        .calculateFileChecksum(pdfPath);

    console.timeEnd("[INGESTION] Checksum");

    console.log(
      `[INGESTION] SHA-256: ${checksum}`
    );

    /*
     * STEP 2 — Check whether this exact file
     * has already been ingested.
     */
    const existingDocument =
      await this.documentRepository
        .findByChecksum(checksum);

    if (existingDocument) {
      const chunkCount =
        await this.documentRepository
          .countChunks(existingDocument.id);

      console.log(
        "\n[INGESTION] Document already ingested."
      );

      console.log({
        documentId: existingDocument.id,
        title: existingDocument.title,
        checksum,
        chunkCount,
      });

      return {
        documentId: existingDocument.id,

        status: "SKIPPED",

        reason:
          "DOCUMENT_ALREADY_INGESTED",

        chunkCount,

        // We know the previously verified document
        // has complete embedding coverage, but don't
        // falsely derive this in the general case.
        embeddingCount: chunkCount,

        inserted: 0,
        updated: 0,

        durationMs:
          Date.now() - startedAt,
      };
    }

    /*
     * STEP 3 — Extract page-aware PDF content.
     */
    console.time("[INGESTION] PDF extraction");

    const extractedDocument =
      await this.pdfService.extractPages(
        pdfPath
      );

    console.timeEnd(
      "[INGESTION] PDF extraction"
    );

    console.log(
      `[INGESTION] Extracted ` +
      `${extractedDocument.totalPages} pages`
    );

    /*
     * STEP 4 — Normalize each page independently.
     *
     * This preserves page boundaries for citations.
     */
    console.time("[INGESTION] Normalization");

    const normalizedPages =
      extractedDocument.pages
        .map((page) => ({
          pageNumber:
            page.pageNumber,

          text:
            this.normalizationService
              .normalize(page.text)
              .text,
        }))
        .filter(
          (page) =>
            page.text.trim().length > 0
        );

    console.timeEnd(
      "[INGESTION] Normalization"
    );

    console.log(
      `[INGESTION] ` +
      `${normalizedPages.length} non-empty pages`
    );

    /*
     * STEP 5 — Page-aware chunking.
     */
    console.time("[INGESTION] Chunking");

    const chunks =
      this.chunkingService
        .createChunksFromPages(
          normalizedPages
        );

    console.timeEnd("[INGESTION] Chunking");

    console.log(
      `[INGESTION] Generated ` +
      `${chunks.length} page-aware chunks`
    );

    /*
     * STEP 6 — Create the relational Document.
     *
     * We intentionally do this only after successful
     * extraction, normalization, and chunking.
     */
    const document =
      await this.documentRepository.create({
        title:
          options?.title ??
          path.basename(pdfPath, ".pdf"),

        version:
          options?.version ?? "1.0",

        language:
          options?.language ?? "en",

        sourceType:
          options?.sourceType ?? "PDF",

        fileName:
          path.basename(pdfPath),

        checksum,
      });

    const documentId = document.id;

    console.log(
      `[INGESTION] Created document: ` +
      `${documentId}`
    );

    /*
     * STEP 7 — Attach document and structural
     * metadata to every chunk.
     */
    const knowledgeChunks =
      this.metadataService
        .createKnowledgeChunks(
          chunks,
          {
            id: documentId,
            title: document.title,
            version: document.version,
            language: document.language,
            sourceType: document.sourceType as SourceType,
            fileName: document.fileName,
            checksum: document.checksum ?? undefined,
          }
        );

    /*
     * STEP 8 — Generate embeddings.
     */
    console.time("[INGESTION] Embeddings");

    const embeddedChunks =
      await this.embeddingService
        .embedChunks(knowledgeChunks);

    console.timeEnd("[INGESTION] Embeddings");

    /*
     * STEP 9 — Persist chunks and vectors.
     */
    console.time("[INGESTION] Persistence");

    const vectorResult =
      await this.vectorService.upsert({
        documents: embeddedChunks,
      });

    console.timeEnd("[INGESTION] Persistence");

    /*
     * STEP 10 — Return final metrics.
     */
    return {
      documentId,

      status: "INGESTED",

      chunkCount:
        embeddedChunks.length,

      embeddingCount:
        embeddedChunks.length,

      inserted:
        vectorResult.inserted,

      updated:
        vectorResult.updated,

      durationMs:
        Date.now() - startedAt,
    };
  }
}