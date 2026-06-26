import { EmbeddingProvider } from "../providers/embedding.provider";
import { EmbeddedKnowledgeChunk, EmbeddingVector } from "../types/embedding.types"; // Ensure EmbeddingVector is imported
import { KnowledgeChunk } from "../types/metadata.types";

export class EmbeddingService {
  private readonly MAX_BATCH_SIZE = 32; 

  constructor(
    private readonly provider: EmbeddingProvider
  ) {}

  async embedChunk(
    chunk: KnowledgeChunk
  ): Promise<EmbeddedKnowledgeChunk> {
    const response = await this.provider.embed({
      text: chunk.content,
    });

    return this.mergeResults([chunk], [response.embedding])[0];
  }

  async embedChunks(
    chunks: KnowledgeChunk[]
  ): Promise<EmbeddedKnowledgeChunk[]> {
    if (chunks.length === 0) return [];

    const batches = this.splitIntoBatches(chunks, this.MAX_BATCH_SIZE);
    const totalEmbeddedChunks: EmbeddedKnowledgeChunk[] = [];

    for (const batch of batches) {
      try {
        const response = await this.provider.embedBatch({
          texts: batch.map(chunk => chunk.content),
        });

        const embeddedBatch = this.mergeResults(batch, response.embeddings);
        totalEmbeddedChunks.push(...embeddedBatch);
      } catch (error) {
        console.error(`[EmbeddingService] Failed to process batch of size ${batch.length}:`, error);
        throw error;
      }
    }

    return totalEmbeddedChunks;
  }

  private splitIntoBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * FIX: Changed embeddings type from number[][] to EmbeddingVector[]
   */
  private mergeResults(
    chunks: KnowledgeChunk[],
    embeddings: EmbeddingVector[]
  ): EmbeddedKnowledgeChunk[] {
    return chunks.map((chunk, index) => ({
      ...chunk,
      embedding: embeddings[index],
    }));
  }
}