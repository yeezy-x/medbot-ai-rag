import { describe, expect, it, vi, beforeEach } from "vitest";
import { EmbeddingService } from "../services/embedding.service";
import { KnowledgeChunk } from "../types/metadata.types";
import { EmbeddingProvider } from "../providers/embedding.provider";

describe("EmbeddingService", () => {
  let mockProvider: vi.Mocked<EmbeddingProvider>;
  let service: EmbeddingService;

  beforeEach(() => {
    mockProvider = {
      provider: "mock-provider",
      model: "mock-model",
      embed: vi.fn(),
      embedBatch: vi.fn(),
    } as any;

    service = new EmbeddingService(mockProvider);
  });

  it("should embed a single chunk via provider.embed()", async () => {
    const mockChunk: KnowledgeChunk = {
      id: "1",
      content: "Sample medical text",
      characterCount: 19,
      estimatedTokens: 4,
      chunkIndex: 0,
      startOffset: 0,
      endOffset: 19,
      source: {} as any,
      structure: {} as any,
    };

    mockProvider.embed.mockResolvedValue({
      embedding: { values: [0.1, 0.2], dimensions: 2, model: "mock-model" },
    });

    const result = await service.embedChunk(mockChunk);

    expect(mockProvider.embed).toHaveBeenCalledWith({ text: "Sample medical text" });
    expect(result.embedding.values).toEqual([0.1, 0.2]);
    expect(result.id).toBe("1"); // Preserved metadata
  });

  it("should return an empty array instantly if chunks are empty", async () => {
    const result = await service.embedChunks([]);
    expect(result).toEqual([]);
    expect(mockProvider.embedBatch).not.toHaveBeenCalled();
  });

  it("should split records and respect MAX_BATCH_SIZE (32) rules", async () => {
    // Generate 35 mock chunks (forcing 2 batches: 32 + 3)
    const dummyChunks: KnowledgeChunk[] = Array.from({ length: 35 }, (_, i) => ({
      id: `id-${i}`,
      content: `content-${i}`,
      characterCount: 10,
      estimatedTokens: 2,
      chunkIndex: i,
      startOffset: 0,
      endOffset: 10,
      source: {} as any,
      structure: {} as any,
    }));

    // Mock first batch response (32 items)
    mockProvider.embedBatch.mockResolvedValueOnce({
      embeddings: Array.from({ length: 32 }, () => ({ values: [1], dimensions: 1, model: "mock-model" })),
    });

    // Mock second batch response (3 items)
    mockProvider.embedBatch.mockResolvedValueOnce({
      embeddings: Array.from({ length: 3 }, () => ({ values: [2], dimensions: 1, model: "mock-model" })),
    });

    const results = await service.embedChunks(dummyChunks);

    expect(mockProvider.embedBatch).toHaveBeenCalledTimes(2);
    expect(results).toHaveLength(35);
    expect(results[0].embedding.values).toEqual([1]);
    expect(results[34].embedding.values).toEqual([2]);
    expect(results[34].id).toBe("id-34"); // Structural integrity check
  });
});