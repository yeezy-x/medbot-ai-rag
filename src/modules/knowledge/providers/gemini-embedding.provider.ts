import { EMBEDDING } from "../constants/embedding.constants";
import type { EmbeddingProvider } from "./embedding.provider";
import type {
  BatchEmbeddingRequest,
  BatchEmbeddingResponse,
  EmbeddingRequest,
  EmbeddingResponse,
} from "../types/embedding.types";

function toVector(
  values: number[],
  model: string
): EmbeddingResponse["embedding"] {
  return {
    values,
    dimensions: values.length,
    model,
    metadata: { provider: "gemini", createdAt: new Date() },
  };
}

export class GeminiEmbeddingProvider implements EmbeddingProvider {
  readonly provider = "gemini";

  constructor(
    readonly model: string,
    private readonly apiKey: string,
    private readonly dimensions = EMBEDDING.DIMENSIONS
  ) {}

  async embed(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model)}:embedContent?key=${this.apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: { parts: [{ text: request.text }] },
        outputDimensionality: this.dimensions,
      }),
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`[GeminiEmbedding] ${response.status}: ${body.slice(0, 400)}`);
    }
    const json = (await response.json()) as {
      embedding?: { values?: number[] };
    };
    const values = json.embedding?.values ?? [];
    return { embedding: toVector(values, this.model) };
  }

  async embedBatch(
    request: BatchEmbeddingRequest
  ): Promise<BatchEmbeddingResponse> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model)}:batchEmbedContents?key=${this.apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: request.texts.map((text) => ({
          model: `models/${this.model}`,
          content: { parts: [{ text }] },
          outputDimensionality: this.dimensions,
        })),
      }),
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `[GeminiEmbedding] batch ${response.status}: ${body.slice(0, 400)}`
      );
    }
    const json = (await response.json()) as {
      embeddings?: Array<{ values?: number[] }>;
    };
    return {
      embeddings: (json.embeddings ?? []).map((row) =>
        toVector(row.values ?? [], this.model)
      ),
    };
  }
}
