import { describe, expect, it, vi, beforeEach } from "vitest";
import { OllamaEmbeddingProvider } from "../providers/ollama.provider";

describe("OllamaEmbeddingProvider", () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      embed: vi.fn(),
    };
  });

  it("should embed a single text", async () => {
    mockClient.embed.mockResolvedValue({
      embeddings: [[0.1, 0.2, 0.3]],
    });

    const provider = new OllamaEmbeddingProvider(mockClient);
    const result = await provider.embed({ text: "Heart disease" });

    expect(mockClient.embed).toHaveBeenCalledWith(expect.objectContaining({
      model: "nomic-embed-text",
      input: "Heart disease",
    }));
    expect(result.embedding.values).toEqual([0.1, 0.2, 0.3]);
    expect(result.embedding.dimensions).toBe(3);
    expect(result.embedding.model).toBe("nomic-embed-text");
  });

  it("should embed a batch of texts", async () => {
    mockClient.embed.mockResolvedValue({
      embeddings: [
        [0.1, 0.2],
        [0.3, 0.4],
      ],
    });

    const provider = new OllamaEmbeddingProvider(mockClient);
    const result = await provider.embedBatch({ texts: ["Hypertension", "Diabetes"] });

    expect(mockClient.embed).toHaveBeenCalledWith(expect.objectContaining({
      model: "nomic-embed-text",
      input: ["Hypertension", "Diabetes"],
    }));
    expect(result.embeddings).toHaveLength(2);
    expect(result.embeddings[0].values).toEqual([0.1, 0.2]);
    expect(result.embeddings[1].values).toEqual([0.3, 0.4]);
  });

  it("should throw a standardized error if the underlying client fails", async () => {
    mockClient.embed.mockRejectedValue(new Error("Connection refused"));

    const provider = new OllamaEmbeddingProvider(mockClient);
    
    await expect(provider.embed({ text: "Fail" })).rejects.toThrow(
      "Connection refused"
    );
  });
});