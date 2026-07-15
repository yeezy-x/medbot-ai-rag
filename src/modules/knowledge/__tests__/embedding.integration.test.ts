import { describe, expect, it, beforeAll } from "vitest";
import path from "path";
import { IngestionService } from "../services/ingestion.service";
import { EmbeddedKnowledgeChunk } from "../types/embedding.types";

describe("Ingestion Embedding Pipeline Integration", () => {
  let ingestionService: IngestionService;
  let embeddedChunks: EmbeddedKnowledgeChunk[];
  
  const samplePdfPath = path.join(__dirname, "fixtures/sample-medical-guide.pdf");

  // Allocate up to 120 seconds to allow local Ollama containers to wake up/pull models if needed
  beforeAll(async () => {
    ingestionService = new IngestionService();
    
    embeddedChunks = await ingestionService.ingest(samplePdfPath, {
      title: "Clinical Guidelines Test",
      version: "2.1",
    });
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
    expect(sample.source.fileName).toBe("sample-medical-guide.pdf");
    expect(sample.structure.pageNumber).toBeGreaterThanOrEqual(1);
  });
});