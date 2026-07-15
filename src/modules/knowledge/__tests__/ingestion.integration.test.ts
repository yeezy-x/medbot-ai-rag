import path from "path";
import { describe, expect, it } from "vitest";

import { IngestionService } from "@/modules/knowledge/services/ingestion.service";

describe("IngestionService", () => {

  const ingestion =
    new IngestionService();

  const pdfPath = path.resolve(
    process.cwd(),
    "knowledge-base",
    "gale-encyclopedia.pdf"
  );

  it(
    "should ingest the PDF",
    async () => {

      const knowledgeChunks =
        await ingestion.ingest(
          pdfPath
        );

      expect(
        knowledgeChunks.length
      ).toBeGreaterThan(100);

    },
    120000
  );

  it(
    "should create unique chunk ids",
    async () => {

      const chunks =
        await ingestion.ingest(
          pdfPath
        );

      const ids =
        new Set(
          chunks.map(c => c.id)
        );

      expect(ids.size)
        .toBe(chunks.length);

    },
    120000
  );

  it(
    "should attach document metadata",
    async () => {

      const chunks =
        await ingestion.ingest(
          pdfPath
        );

      expect(
        chunks[0].source.title
      ).toBeTruthy();

      expect(
        chunks[0].source.fileName
      ).toContain(".pdf");

    },
    120000
  );

  it(
    "should preserve chunk indexes",
    async () => {

      const chunks =
        await ingestion.ingest(
          pdfPath
        );

      chunks.forEach((chunk, index) => {
        expect(chunk.chunkIndex)
          .toBe(index);
      });

    },
    120000
  );

  it(
    "should preserve offsets",
    async () => {

      const chunks =
        await ingestion.ingest(
          pdfPath
        );

      chunks.forEach(chunk => {

        expect(chunk.startOffset)
          .toBeGreaterThanOrEqual(0);

        expect(chunk.endOffset)
          .toBeGreaterThan(
            chunk.startOffset
          );

      });

    },
    120000
  );

});