// src/modules/knowledge/providers/postgres-vector.provider.ts

import { Prisma } from "@/generated/client";
import { prisma } from "@/lib/prisma";

import { VectorProvider } from "./vector.provider";

import { SourceType } from "../types/metadata.types";

import {
  DeleteVectorRequest,
  SimilarityMetric,
  UpsertVectorRequest,
  UpsertVectorResult,
  VectorSearchQuery,
  VectorSearchResult,
} from "../types/vector.types";
import { DEFAULT_MIN_SIMILARITY_SCORE } from "../constants/retrieval.constants";

/**
 * Structured database row returned by the pgvector
 * similarity-search query.
 */
interface ChunkSearchRow {
  id: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  characterCount: number;
  estimatedTokens: number;
  startOffset: number;
  endOffset: number;

  pageNumber: number | null;
  chapter: string | null;
  section: string | null;
  headings: string[] | null;

  title: string;
  version: string;
  language: string;
  sourceType: SourceType;

  score: number;
}

/**
 * Result returned after successfully persisting one batch.
 */
interface BatchPersistenceResult {
  inserted: number;
  updated: number;
}

/**
 * PostgreSQL + pgvector implementation of VectorProvider.
 *
 * Responsibilities:
 *
 * 1. Persist chunks and their embeddings.
 * 2. Perform cosine-similarity vector search.
 * 3. Delete chunks by ID.
 *
 * Reliability features:
 *
 * - Batched database persistence.
 * - Atomic transaction per batch.
 * - Retry with exponential backoff.
 * - Retry jitter.
 * - Accurate post-commit counters.
 * - Embedding validation.
 * - Chunk validation.
 * - Detailed progress logging.
 * - Clear permanent-failure diagnostics.
 */
export class PostgresVectorProvider
  implements VectorProvider
{
  readonly provider = "postgres";

  readonly similarityMetric: SimilarityMetric =
    "cosine";

  /**
   * Keep transactions reasonably small.
   *
   * 50 is intentionally conservative for a long-running
   * ingestion process involving pgvector writes.
   */
  private readonly BATCH_SIZE = 50;

  /**
   * Number of retries after the initial attempt.
   *
   * Total possible attempts:
   *
   * 1 initial attempt + 5 retries = 6 attempts.
   */
  private readonly MAX_RETRIES = 5;

  /**
   * Starting retry delay.
   *
   * Approximate progression before jitter:
   *
   * 2s → 4s → 8s → 16s → 30s
   */
  private readonly BASE_RETRY_DELAY_MS = 2_000;

  /**
   * Prevent exponential backoff from growing indefinitely.
   */
  private readonly MAX_RETRY_DELAY_MS = 30_000;

  /**
   * Maximum time Prisma may wait to acquire resources
   * needed for an interactive transaction.
   */
  private readonly TRANSACTION_MAX_WAIT_MS =
    30_000;

  /**
   * Maximum duration allowed for one batch transaction.
   */
  private readonly TRANSACTION_TIMEOUT_MS =
    120_000;

  constructor(
    private readonly db = prisma
  ) {}

  /**
   * Persist embedded knowledge chunks.
   *
   * Each batch is atomic:
   *
   * Chunk relational data
   *        +
   * pgvector embedding
   *
   * either both commit or both roll back.
   */
  async upsert(
    request: UpsertVectorRequest
  ): Promise<UpsertVectorResult> {
    const documents = request.documents;

    if (documents.length === 0) {
      return {
        inserted: 0,
        updated: 0,
      };
    }

    this.validateDocuments(documents);

    const totalChunks = documents.length;

    const totalBatches = Math.ceil(
      totalChunks / this.BATCH_SIZE
    );

    const startedAt = Date.now();

    let inserted = 0;
    let updated = 0;

    console.log(
      "\n=========================================="
    );

    console.log(
      "[PostgresVectorProvider] Starting vector persistence"
    );

    console.log({
      totalChunks,
      batchSize: this.BATCH_SIZE,
      totalBatches,
      maxRetries: this.MAX_RETRIES,
      totalAttemptsPerBatch:
        this.MAX_RETRIES + 1,
    });

    console.log(
      "==========================================\n"
    );

    for (
      let offset = 0;
      offset < totalChunks;
      offset += this.BATCH_SIZE
    ) {
      const batch = documents.slice(
        offset,
        offset + this.BATCH_SIZE
      );

      const batchNumber =
        Math.floor(offset / this.BATCH_SIZE) + 1;

      const batchResult =
        await this.persistBatchWithRetry(
          batch,
          batchNumber,
          totalBatches
        );

      /**
       * These counters are updated only AFTER the transaction
       * has successfully committed.
       *
       * This prevents inaccurate counters if PostgreSQL rolls
       * back a partially processed transaction.
       */
      inserted += batchResult.inserted;
      updated += batchResult.updated;

      this.logProgress({
        batchNumber,
        totalBatches,
        processedChunks: Math.min(
          offset + batch.length,
          totalChunks
        ),
        totalChunks,
        startedAt,
      });
    }

    const durationMs =
      Date.now() - startedAt;

    console.log(
      "\n=========================================="
    );

    console.log(
      "[PostgresVectorProvider] Vector persistence completed"
    );

    console.log({
      totalChunks,
      inserted,
      updated,
      duration:
        this.formatDuration(durationMs / 1000),
    });

    console.log(
      "==========================================\n"
    );

    return {
      inserted,
      updated,
    };
  }

  /**
   * Execute vector similarity search using cosine distance.
   */
  async search(
    request: VectorSearchQuery
  ): Promise<VectorSearchResult[]> {
    if (
      !request.embedding?.values ||
      request.embedding.values.length === 0
    ) {
      throw new Error(
        "[PostgresVectorProvider] Search embedding is empty."
      );
    }

    if (
      !Number.isInteger(request.topK) ||
      request.topK <= 0
    ) {
      throw new Error(
        `[PostgresVectorProvider] Invalid topK: ${request.topK}`
      );
    }

    this.validateEmbeddingValues(
      request.embedding.values,
      "search query"
    );

    const vector = this.vectorToSql(
      request.embedding.values
    );

    const minScore = request.minScore ?? DEFAULT_MIN_SIMILARITY_SCORE

    const rows =
  await this.db.$queryRaw<
    ChunkSearchRow[]
  >(
    Prisma.sql`
      SELECT *
      FROM (
        SELECT
          c.id,
          c."documentId",
          c."chunkIndex",
          c.content,
          c."characterCount",
          c."estimatedTokens",
          c."startOffset",
          c."endOffset",
          c."pageNumber",
          c.chapter,
          c.section,
          c.headings,

          d.title,
          d.version,
          d.language,
          d."sourceType",

          1 - (
            c.embedding <=>
            CAST(${vector} AS vector)
          ) AS score

        FROM "Chunk" c

        JOIN "Document" d
          ON c."documentId" = d.id

        WHERE
          c.embedding IS NOT NULL
      ) AS ranked_chunks

      WHERE score >= ${minScore}

      ORDER BY score DESC

      LIMIT ${request.topK}
    `
  );

    console.log(
      "\n========== VECTOR SEARCH =========="
    );

    console.log({
      requestedTopK: request.topK,
      returnedRows: rows.length,
    });

    return rows.map((row) => {
      const calculatedScore =
        Number(row.score);

      return {
        score: calculatedScore,

        chunk: {
          id: row.id,

          documentId:
            row.documentId,

          content:
            row.content,

          score:
            calculatedScore,

          pageNumber:
            row.pageNumber ?? undefined,

          chapter:
            row.chapter ?? undefined,

          section:
            row.section ?? undefined,

          headings:
            row.headings ?? [],

          source: {
            title:
              row.title,

            version:
              row.version,

            language:
              row.language,

            sourceType:
              row.sourceType,
          },
        },
      };
    });
  }

  /**
   * Delete chunks by their IDs.
   */
  async delete(
    request: DeleteVectorRequest
  ): Promise<void> {
    if (request.ids.length === 0) {
      return;
    }

    await this.db.chunk.deleteMany({
      where: {
        id: {
          in: request.ids,
        },
      },
    });
  }

  /**
   * Persist one batch with retry protection.
   */
  private async persistBatchWithRetry(
    batch: UpsertVectorRequest["documents"],
    batchNumber: number,
    totalBatches: number
  ): Promise<BatchPersistenceResult> {
    const totalAttempts =
      this.MAX_RETRIES + 1;

    let lastError: unknown;

    for (
      let attempt = 1;
      attempt <= totalAttempts;
      attempt++
    ) {
      try {
        const result =
          await this.persistBatch(batch);

        if (attempt > 1) {
          console.log(
            `[PostgresVectorProvider] ` +
              `Batch ${batchNumber}/${totalBatches} ` +
              `recovered successfully on attempt ` +
              `${attempt}/${totalAttempts}.`
          );
        }

        return result;
      } catch (error) {
        lastError = error;

        const isFinalAttempt =
          attempt === totalAttempts;

        console.error(
          `[PostgresVectorProvider] ` +
            `Batch ${batchNumber}/${totalBatches} failed ` +
            `on attempt ${attempt}/${totalAttempts}.`
        );

        console.error(
          this.formatError(error)
        );

        if (isFinalAttempt) {
          break;
        }

        const delayMs =
          this.calculateRetryDelay(attempt);

        console.log(
          `[PostgresVectorProvider] ` +
            `Retrying batch ${batchNumber}/${totalBatches} ` +
            `in ${this.formatDuration(
              delayMs / 1000
            )}...`
        );

        await this.sleep(delayMs);
      }
    }

    throw new Error(
      `[PostgresVectorProvider] ` +
        `Batch ${batchNumber}/${totalBatches} ` +
        `permanently failed after ` +
        `${totalAttempts} attempts. ` +
        `Last error: ${this.formatError(lastError)}`
    );
  }

  /**
   * Persist one batch atomically.
   */
  private async persistBatch(
    batch: UpsertVectorRequest["documents"]
  ): Promise<BatchPersistenceResult> {
    return this.db.$transaction(
      async (tx) => {
        let batchInserted = 0;
        let batchUpdated = 0;

        for (const chunk of batch) {
          const existingChunk =
            await tx.chunk.findUnique({
              where: {
                id: chunk.id,
              },

              select: {
                id: true,
              },
            });

          const chunkData = {
            chunkIndex:
              chunk.chunkIndex,

            content:
              chunk.content,

            characterCount:
              chunk.characterCount,

            estimatedTokens:
              chunk.estimatedTokens,

            startOffset:
              chunk.startOffset,

            endOffset:
              chunk.endOffset,

            pageNumber:
              chunk.structure.pageNumber,

            chapter:
              chunk.structure.chapter,

            section:
              chunk.structure.section,

            headings:
              chunk.structure.headings,
          };

          await tx.chunk.upsert({
            where: {
              id: chunk.id,
            },

            update: chunkData,

            create: {
              id:
                chunk.id,

              documentId:
                chunk.source.documentId,

              ...chunkData,
            },
          });

          await this.updateEmbeddingWithClient(
            tx,
            chunk.id,
            chunk.embedding.values
          );

          if (existingChunk) {
            batchUpdated++;
          } else {
            batchInserted++;
          }
        }

        return {
          inserted: batchInserted,
          updated: batchUpdated,
        };
      },
      {
        maxWait:
          this.TRANSACTION_MAX_WAIT_MS,

        timeout:
          this.TRANSACTION_TIMEOUT_MS,
      }
    );
  }

  /**
   * Update pgvector embedding using the same transactional
   * client as the relational chunk upsert.
   */
  private async updateEmbeddingWithClient(
    client: Prisma.TransactionClient,
    chunkId: string,
    values: number[]
  ): Promise<void> {
    this.validateEmbeddingValues(
      values,
      `chunk ${chunkId}`
    );

    const vector =
      this.vectorToSql(values);

    const affectedRows =
      await client.$executeRaw(
        Prisma.sql`
          UPDATE "Chunk"

          SET embedding =
            CAST(${vector} AS vector)

          WHERE id = ${chunkId}
        `
      );

    if (affectedRows !== 1) {
      throw new Error(
        `[PostgresVectorProvider] ` +
          `Expected to update exactly one embedding ` +
          `for chunk ${chunkId}, but updated ` +
          `${affectedRows}.`
      );
    }
  }

  /**
   * Validate all chunks before starting the expensive
   * database-persistence process.
   *
   * This prevents discovering malformed input after
   * thousands of chunks have already been written.
   */
  private validateDocuments(
    documents: UpsertVectorRequest["documents"]
  ): void {
    const seenIds = new Set<string>();

    let expectedEmbeddingDimension:
      number | undefined;

    for (
      let index = 0;
      index < documents.length;
      index++
    ) {
      const chunk = documents[index];

      if (!chunk.id) {
        throw new Error(
          `[PostgresVectorProvider] ` +
            `Chunk at request index ${index} ` +
            `has no ID.`
        );
      }

      if (seenIds.has(chunk.id)) {
        throw new Error(
          `[PostgresVectorProvider] ` +
            `Duplicate chunk ID detected: ${chunk.id}`
        );
      }

      seenIds.add(chunk.id);

      if (!chunk.source?.documentId) {
        throw new Error(
          `[PostgresVectorProvider] ` +
            `Chunk ${chunk.id} has no documentId.`
        );
      }

      if (
        typeof chunk.content !== "string" ||
        chunk.content.trim().length === 0
      ) {
        throw new Error(
          `[PostgresVectorProvider] ` +
            `Chunk ${chunk.id} has empty content.`
        );
      }

      if (
        !Number.isInteger(chunk.chunkIndex) ||
        chunk.chunkIndex < 0
      ) {
        throw new Error(
          `[PostgresVectorProvider] ` +
            `Chunk ${chunk.id} has invalid chunkIndex: ` +
            `${chunk.chunkIndex}`
        );
      }

      const embeddingValues =
        chunk.embedding?.values;

      if (
        !embeddingValues ||
        embeddingValues.length === 0
      ) {
        throw new Error(
          `[PostgresVectorProvider] ` +
            `Chunk ${chunk.id} has no embedding values.`
        );
      }

      this.validateEmbeddingValues(
        embeddingValues,
        `chunk ${chunk.id}`
      );

      if (
        expectedEmbeddingDimension === undefined
      ) {
        expectedEmbeddingDimension =
          embeddingValues.length;
      } else if (
        embeddingValues.length !==
        expectedEmbeddingDimension
      ) {
        throw new Error(
          `[PostgresVectorProvider] ` +
            `Embedding dimension mismatch for chunk ` +
            `${chunk.id}. Expected ` +
            `${expectedEmbeddingDimension}, received ` +
            `${embeddingValues.length}.`
        );
      }
    }

    console.log(
      `[PostgresVectorProvider] ` +
        `Preflight validation passed for ` +
        `${documents.length} chunks. ` +
        `Embedding dimension: ` +
        `${expectedEmbeddingDimension}.`
    );
  }

  /**
   * Ensure every embedding component is a finite number.
   */
  private validateEmbeddingValues(
    values: number[],
    label: string
  ): void {
    if (values.length === 0) {
      throw new Error(
        `[PostgresVectorProvider] ` +
          `Empty embedding for ${label}.`
      );
    }

    for (
      let index = 0;
      index < values.length;
      index++
    ) {
      const value = values[index];

      if (
        typeof value !== "number" ||
        !Number.isFinite(value)
      ) {
        throw new Error(
          `[PostgresVectorProvider] ` +
            `Invalid embedding value for ${label} ` +
            `at index ${index}: ${String(value)}`
        );
      }
    }
  }

  /**
   * Convert number[] into PostgreSQL vector input syntax.
   */
  private vectorToSql(
    values: number[]
  ): string {
    return `[${values.join(",")}]`;
  }

  /**
   * Calculate exponential retry delay with jitter.
   *
   * Jitter prevents multiple failing workers from all
   * reconnecting at exactly the same moment.
   */
  private calculateRetryDelay(
    failedAttempt: number
  ): number {
    const exponentialDelay =
      this.BASE_RETRY_DELAY_MS *
      Math.pow(2, failedAttempt - 1);

    const cappedDelay = Math.min(
      exponentialDelay,
      this.MAX_RETRY_DELAY_MS
    );

    const jitter =
      Math.floor(Math.random() * 1_000);

    return cappedDelay + jitter;
  }

  /**
   * Print ingestion progress and ETA.
   */
  private logProgress({
    batchNumber,
    totalBatches,
    processedChunks,
    totalChunks,
    startedAt,
  }: {
    batchNumber: number;
    totalBatches: number;
    processedChunks: number;
    totalChunks: number;
    startedAt: number;
  }): void {
    if (
      batchNumber % 10 !== 0 &&
      batchNumber !== totalBatches
    ) {
      return;
    }

    const elapsedSeconds =
      (Date.now() - startedAt) / 1000;

    const averageSecondsPerBatch =
      elapsedSeconds / batchNumber;

    const remainingBatches =
      totalBatches - batchNumber;

    const etaSeconds =
      remainingBatches *
      averageSecondsPerBatch;

    const percentage =
      (
        (processedChunks / totalChunks) *
        100
      ).toFixed(1);

    console.log(
      `[PostgresVectorProvider] ` +
        `${batchNumber}/${totalBatches} batches | ` +
        `${processedChunks}/${totalChunks} chunks | ` +
        `${percentage}% | ` +
        `elapsed: ${this.formatDuration(
          elapsedSeconds
        )} | ` +
        `ETA: ${this.formatDuration(
          etaSeconds
        )}`
    );
  }

  /**
   * Format duration for human-readable logs.
   */
  private formatDuration(
    totalSeconds: number
  ): string {
    const seconds = Math.max(
      0,
      Math.round(totalSeconds)
    );

    const hours =
      Math.floor(seconds / 3600);

    const minutes =
      Math.floor(
        (seconds % 3600) / 60
      );

    const remainingSeconds =
      seconds % 60;

    if (hours > 0) {
      return (
        `${hours}h ` +
        `${minutes}m ` +
        `${remainingSeconds}s`
      );
    }

    if (minutes > 0) {
      return (
        `${minutes}m ` +
        `${remainingSeconds}s`
      );
    }

    return `${remainingSeconds}s`;
  }

  /**
   * Normalize unknown errors for logging.
   */
  private formatError(
    error: unknown
  ): string {
    if (error instanceof Error) {
      return `${error.name}: ${error.message}`;
    }

    return String(error);
  }

  /**
   * Promise-based delay used between retries.
   */
  private sleep(
    milliseconds: number
  ): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, milliseconds);
    });
  }
}