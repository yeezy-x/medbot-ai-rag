import path from "path";
import { beforeAll, describe, expect, it } from "vitest";

import { PdfService } from "@/modules/knowledge/services/pdf.service";
import { NormalizationService } from "@/modules/knowledge/services/normalization.service";
import { CHUNKING } from "@/modules/knowledge/constants/chunking.constants";
import { ChunkingService } from "@/modules/knowledge/services/chunking.serivce";
import { Chunk } from "@/modules/knowledge/types/chunk.types";

const SAMPLE_PAGE_COUNT = 20;

describe("Knowledge Ingestion Pipeline", () => {
  const pdfService = new PdfService();
  const normalizationService = new NormalizationService();
  const chunkingService = new ChunkingService();

  const pdfPath = path.resolve(
    process.cwd(),
    "knowledge-base",
    "gale-encyclopedia.pdf"
  );

  let chunks: Chunk[];

  beforeAll(async () => {
    const extracted = await pdfService.extractPages(pdfPath);
    const normalizedPages = extracted.pages
      .slice(0, SAMPLE_PAGE_COUNT)
      .map((page) => ({
        pageNumber: page.pageNumber,
        text: normalizationService.normalize(page.text).text,
      }))
      .filter((page) => page.text.trim().length > 0);

    chunks = chunkingService.createChunksFromPages(normalizedPages);
  }, 120000);

  it("should chunk a representative PDF sample", () => {
    expect(chunks.length).toBeGreaterThan(10);
  });

  it("should never create oversized chunks", () => {
    chunks.forEach((chunk) => {
      expect(chunk.characterCount).toBeLessThanOrEqual(
        CHUNKING.MAX_CHUNK_SIZE
      );
    });
  });

  it("should generate sequential chunk indexes", () => {
    chunks.forEach((chunk, index) => {
      expect(chunk.chunkIndex).toBe(index);
    });
  });

  it("should generate valid offsets", () => {
    for (const chunk of chunks) {
      expect(chunk.startOffset).toBeGreaterThanOrEqual(0);
      expect(chunk.endOffset).toBeGreaterThan(chunk.startOffset);
    }
  });

  it("should estimate tokens for every chunk", () => {
    chunks.forEach((chunk) => {
      expect(chunk.estimatedTokens).toBeGreaterThan(0);
    });
  });
});
