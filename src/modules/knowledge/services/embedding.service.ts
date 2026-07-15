import { EmbeddingProvider } from "../providers/embedding.provider";
import { EmbeddedKnowledgeChunk, EmbeddingVector } from "../types/embedding.types"; // Ensure EmbeddingVector is imported
import { KnowledgeChunk } from "../types/metadata.types";

export class EmbeddingService {
  private readonly MAX_BATCH_SIZE = 32; 

  constructor(
    private readonly provider: EmbeddingProvider
  ) {}

  private formatDuration(
  totalSeconds: number
): string {
  const seconds = Math.max(
    0,
    Math.round(totalSeconds)
  );

  const hours = Math.floor(
    seconds / 3600
  );

  const minutes = Math.floor(
    (seconds % 3600) / 60
  );

  const remainingSeconds =
    seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  return `${remainingSeconds}s`;
}

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
  if (chunks.length === 0) {
    return [];
  }

  const batches = this.splitIntoBatches(
    chunks,
    this.MAX_BATCH_SIZE
  );

  const totalEmbeddedChunks:
    EmbeddedKnowledgeChunk[] = [];

  const startedAt = Date.now();

  console.log(
    `\n[EmbeddingService] Starting embedding generation`
  );

  console.log({
    totalChunks: chunks.length,
    batchSize: this.MAX_BATCH_SIZE,
    totalBatches: batches.length,
  });

  for (
    let batchIndex = 0;
    batchIndex < batches.length;
    batchIndex++
  ) {
    const batch = batches[batchIndex];

    try {
      const batchStartedAt = Date.now();

      const response =
        await this.provider.embedBatch({
          texts: batch.map(
            (chunk) => chunk.content
          ),
        });

      const embeddedBatch =
        this.mergeResults(
          batch,
          response.embeddings
        );

      totalEmbeddedChunks.push(
        ...embeddedBatch
      );

      const completed = batchIndex + 1;

      // Log every 10 batches and the final batch
      if (
        completed % 10 === 0 ||
        completed === batches.length
      ) {
        const elapsedSeconds =
          (Date.now() - startedAt) / 1000;

        const averageSecondsPerBatch =
          elapsedSeconds / completed;

        const remainingBatches =
          batches.length - completed;

        const estimatedRemainingSeconds =
          remainingBatches *
          averageSecondsPerBatch;

        console.log(
          `[EmbeddingService] ` +
          `${completed}/${batches.length} batches | ` +
          `${totalEmbeddedChunks.length}/${chunks.length} chunks | ` +
          `elapsed: ${this.formatDuration(elapsedSeconds)} | ` +
          `ETA: ${this.formatDuration(estimatedRemainingSeconds)}`
        );
      }

      void batchStartedAt;

    } catch (error) {
      console.error(
        `[EmbeddingService] Failed at batch ` +
        `${batchIndex + 1}/${batches.length}:`,
        error
      );

      throw error;
    }
  }

  console.log(
    `[EmbeddingService] Completed ${totalEmbeddedChunks.length} embeddings ` +
    `in ${this.formatDuration((Date.now() - startedAt) / 1000)}`
  );

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