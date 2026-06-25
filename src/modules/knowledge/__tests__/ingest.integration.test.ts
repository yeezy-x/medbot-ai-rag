import path from "path";
import { describe, expect, it } from "vitest";

import { PdfService } from "@/modules/knowledge/services/pdf.service";
import { NormalizationService } from "@/modules/knowledge/services/normalization.service";
import { CHUNKING } from "@/modules/knowledge/constants/chunking.constants";
import { ChunkingService } from "../services/chunking.serivce";

describe("Knowledge Ingestion Pipeline", () => {
  const pdfService = new PdfService();
  const normalizationService =
    new NormalizationService();
  const chunkingService =
    new ChunkingService();

  const pdfPath = path.resolve(
    process.cwd(),
    "knowledge-base",
    "gale-encyclopedia.pdf"
  );
  it(
    "should ingest the Gale Encyclopedia",
    async () => {
      const raw =
        await pdfService.extractText(pdfPath);

      expect(raw.length)
        .toBeGreaterThan(100000);

      const normalized =
        normalizationService.normalize(raw);

      expect(normalized.text.length)
        .toBeLessThan(raw.length);

      const chunks =
        chunkingService.createChunks(
          normalized.text
        );

      expect(chunks.length)
        .toBeGreaterThan(100);
    },
    120000
  );

  it(
    "should never create oversized chunks",
    async () => {
      const raw =
        await pdfService.extractText(pdfPath);

      const normalized =
        normalizationService.normalize(raw);

      const chunks =
        chunkingService.createChunks(
          normalized.text
        );

      chunks.forEach(chunk => {
        expect(
          chunk.characterCount
        ).toBeLessThanOrEqual(
          CHUNKING.MAX_CHUNK_SIZE
        );
      });
    },
    1000
  );

  it(
    "should generate sequential chunk indexes",
    async () => {
      const raw =
        await pdfService.extractText(pdfPath);

      const normalized =
        normalizationService.normalize(raw);

      const chunks =
        chunkingService.createChunks(
          normalized.text
        );

      chunks.forEach((chunk, index) => {
        expect(chunk.chunkIndex)
          .toBe(index);
      });
    },
    1000
  );

  it(
    "should generate valid offsets",
    async () => {
      const raw =
        await pdfService.extractText(pdfPath);

      const normalized =
        normalizationService.normalize(raw);

      const chunks =
        chunkingService.createChunks(
          normalized.text
        );

      for (let i = 0; i < chunks.length; i++) {
        expect(
          chunks[i].startOffset
        ).toBeGreaterThanOrEqual(0);

        expect(
          chunks[i].endOffset
        ).toBeGreaterThan(
          chunks[i].startOffset
        );

        if (i > 0) {
          expect(
            chunks[i].startOffset
          ).toBeGreaterThanOrEqual(
            chunks[i - 1].startOffset
          );
        }
      }
    },
    1000
  );

  it(
    "should estimate tokens for every chunk",
    async () => {
      const raw =
        await pdfService.extractText(pdfPath);

      const normalized =
        normalizationService.normalize(raw);

      const chunks =
        chunkingService.createChunks(
          normalized.text
        );

      chunks.forEach(chunk => {
        expect(
          chunk.estimatedTokens
        ).toBeGreaterThan(0);
      });
    },
    1000
  );
 });