import path from "path";
import { describe, expect, it } from "vitest";

import { IngestionService } from "@/modules/knowledge/services/ingestion.service";

describe("IngestionService", () => {
  const ingestion = new IngestionService();

  const pdfPath = path.resolve(
    process.cwd(),
    "knowledge-base",
    "gale-encyclopedia.pdf"
  );

  it(
    "should ingest or skip an already-ingested PDF with chunk metrics",
    async () => {
      const result = await ingestion.ingest(pdfPath);

      expect(result.documentId).toBeTruthy();
      expect(["INGESTED", "SKIPPED"]).toContain(result.status);
      expect(result.chunkCount).toBeGreaterThan(100);
      expect(result.embeddingCount).toBeGreaterThan(100);
      expect(result.durationMs).toBeGreaterThan(0);
    },
    120000
  );

  it(
    "should return idempotent skip for an already-ingested document",
    async () => {
      const result = await ingestion.ingest(pdfPath);

      expect(result.status).toBe("SKIPPED");
      expect(result.reason).toBe("DOCUMENT_ALREADY_INGESTED");
      expect(result.inserted).toBe(0);
      expect(result.updated).toBe(0);
    },
    120000
  );
});
