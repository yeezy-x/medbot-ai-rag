import path from "path";
import { randomUUID } from "crypto";

import { PdfService } from "./pdf.service";
import { NormalizationService } from "./normalization.service";
// FIXED: Fixed typo in file extension (.serivce -> .service)
import { MetadataService } from "./metadata.service";

import { KnowledgeChunk } from "../types/metadata.types";
import { ChunkingService } from "./chunking.serivce";

export interface IngestionOptions {
  title?: string;
  version?: string;
  language?: string;
  sourceType?: "PDF";
}

export class IngestionService {
  constructor(
    private readonly pdfService = new PdfService(),
    private readonly normalizationService = new NormalizationService(),
    private readonly chunkingService = new ChunkingService(),
    private readonly metadataService = new MetadataService()
  ) {}

  async ingest(
    pdfPath: string,
    options?: IngestionOptions
  ): Promise<KnowledgeChunk[]> {
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
    return this.metadataService.createKnowledgeChunks(
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
  }
}