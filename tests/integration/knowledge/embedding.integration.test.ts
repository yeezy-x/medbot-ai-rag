import { describe, expect, it, beforeAll } from "vitest";
import path from "path";

import { ChunkingService } from "@/modules/knowledge/services/chunking.serivce";
import { EmbeddingService } from "@/modules/knowledge/services/embedding.service";
import { MetadataService } from "@/modules/knowledge/services/metadata.service";
import { NormalizationService } from "@/modules/knowledge/services/normalization.service";
import { PdfService } from "@/modules/knowledge/services/pdf.service";
import { OllamaEmbeddingProvider } from "@/modules/knowledge/providers/ollama.provider";
import { EmbeddedKnowledgeChunk } from "@/modules/knowledge/types/embedding.types";

describe("Ingestion Embedding Pipeline Integration", () => {
  let embeddedChunks: EmbeddedKnowledgeChunk[];

  const samplePdfPath = path.resolve(
    process.cwd(),
    "knowledge-base",
    "gale-encyclopedia.pdf"
  );

  const documentMetadata = {
    id: "test-document-id",
    title: "Clinical Guidelines Test",
    version: "2.1",
    language: "en",
    sourceType: "PDF" as const,
    fileName: "gale-encyclopedia.pdf",
  };

  beforeAll(async () => {
    const pdfService = new PdfService();
    const normalizationService = new NormalizationService();
    const chunkingService = new ChunkingService();
    const metadataService = new MetadataService();
    const embeddingService = new EmbeddingService(
      new OllamaEmbeddingProvider()
    );

    const extractedDocument =
      await pdfService.extractPages(samplePdfPath);

    const normalizedPages = extractedDocument.pages
      .slice(0, 3)
      .map((page) => ({
        pageNumber: page.pageNumber,
        text: normalizationService.normalize(page.text).text,
      }))
      .filter((page) => page.text.trim().length > 0);

    const chunks = chunkingService.createChunksFromPages(normalizedPages);

    const knowledgeChunks = metadataService.createKnowledgeChunks(
      chunks,
      documentMetadata
    );

    embeddedChunks = await embeddingService.embedChunks(knowledgeChunks);
  }, 120000);

  it("should seamlessly run text through to final vectorized forms", () => {
    expect(embeddedChunks.length).toBeGreaterThan(0);
  });

  it("should ensure every single output chunk contains a valid multidimensional vector", () => {
    embeddedChunks.forEach((chunk) => {
      expect(chunk.embedding).toBeDefined();
      expect(Array.isArray(chunk.embedding.values)).toBe(true);
      expect(chunk.embedding.values.length).toBeGreaterThan(0);
      expect(typeof chunk.embedding.dimensions).toBe("number");
    });
  });

  it("should maintain immutable tracking options and clear source headers", () => {
    const sample = embeddedChunks[0];
    expect(sample.source.title).toBe("Clinical Guidelines Test");
    expect(sample.source.version).toBe("2.1");
    expect(sample.source.fileName).toBe("gale-encyclopedia.pdf");
    expect(sample.structure.pageNumber).toBeGreaterThanOrEqual(1);
  });
});
