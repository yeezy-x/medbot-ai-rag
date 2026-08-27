import { EMBEDDING } from "../constants/embedding.constants";
import type { EmbeddingProvider } from "./embedding.provider";
import type {BatchEmbeddingRequest,BatchEmbeddingResponse,EmbeddingRequest,EmbeddingResponse} from "../types/embedding.types";

function toVector(
  values: number[],
  model: string,
  provider: string
): EmbeddingResponse["embedding"] {
  return {
    values,
    dimensions: values.length,
    model,
    metadata: { provider, createdAt: new Date() },
  };
}

export class OpenAICompatibleEmbeddingProvider implements EmbeddingProvider {
  readonly provider = "openrouter";

  constructor(
    readonly model: string,
    private readonly apiKey: string,
    private readonly baseUrl = "https://openrouter.ai/api/v1",
    private readonly dimensions = EMBEDDING.DIMENSIONS
  ) {}

  async embed(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    const embeddings = await this.request([request.text]);
    return { embedding: toVector(embeddings[0], this.model, this.provider) };
  }

  async embedBatch(
    request: BatchEmbeddingRequest
  ): Promise<BatchEmbeddingResponse> {
    const embeddings = await this.request(request.texts);
    return {
      embeddings: embeddings.map((values) =>
        toVector(values, this.model, this.provider)
      ),
    };
  }

  private async request(input: string[]): Promise<number[][]> {
    const response = await fetch(`${this.baseUrl}/embeddings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://medbot-nu.vercel.app",
        "X-Title": "MedBot",
      },
      body: JSON.stringify({
        model: this.model,
        input,
        dimensions: this.dimensions,
      }),
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `[OpenAICompatibleEmbedding] ${response.status}: ${body.slice(0, 400)}`
      );
    }
    const json = (await response.json()) as {
      data?: Array<{ embedding: number[] }>;
    };
    const rows = (json.data ?? []).map((row) => row.embedding);
    if (rows.length !== input.length) {
      throw new Error(
        `[OpenAICompatibleEmbedding] expected ${input.length} vectors, got ${rows.length}`
      );
    }
    return rows;
  }
}
