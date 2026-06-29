// src/modules/knowledge/providers/postgres-vector.provider.ts

import { Prisma } from "@/generated/client";
import { prisma } from "@/lib/prisma";

import { VectorProvider } from "./vector.provider";

import {
  DeleteVectorRequest,
  SimilarityMetric,
  UpsertVectorRequest,
  UpsertVectorResult, 
  VectorSearchQuery,
  VectorSearchResult,
} from "../types/vector.types";

/**
 * Interface representing the structured database row returned by pgvector raw queries.
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
  score: number;
}

export class PostgresVectorProvider implements VectorProvider {
  readonly provider = "postgres";
  readonly similarityMetric: SimilarityMetric = "cosine";

  constructor(private readonly db = prisma) {}

  async upsert(
    request: UpsertVectorRequest
  ): Promise<UpsertVectorResult> {
    let inserted = 0;
    let updated = 0;

    for (const chunk of request.documents) {
      // Wrap in a transaction to ensure atomicity between relational upsert and raw vector update
      await this.db.$transaction(async (tx) => {
        const exists = await tx.chunk.findUnique({
          where: {
            id: chunk.id,
          },
          select: {
            id: true,
          },
        });

        // Deduplicate properties used by both update and create blocks
        const chunkData = {
          chunkIndex: chunk.chunkIndex,
          content: chunk.content,
          characterCount: chunk.characterCount,
          estimatedTokens: chunk.estimatedTokens,
          startOffset: chunk.startOffset,
          endOffset: chunk.endOffset,
          pageNumber: chunk.structure.pageNumber,
          chapter: chunk.structure.chapter,
          section: chunk.structure.section,
          headings: chunk.structure.headings,
        };

        await tx.chunk.upsert({
          where: {
            id: chunk.id,
          },
          update: chunkData,
          create: {
            id: chunk.id,
            documentId: chunk.source.documentId,
            ...chunkData,
          },
        });

        // Pass the transactional client to maintain atomic isolation
        await this.updateEmbeddingWithClient(
          tx,
          chunk.id,
          chunk.embedding.values
        );

        if (exists) {
          updated++;
        } else {
          inserted++;
        }
      });
    }

    return {
      inserted,
      updated,
    };
  }

  async search(
    request: VectorSearchQuery
  ): Promise<VectorSearchResult[]> {
    // TODO: Apply VectorSearchFilter in Phase 4 Retrieval.

    const vector = this.vectorToSql(
      request.embedding.values
    );

    const rows = await this.db.$queryRaw<ChunkSearchRow[]>(Prisma.sql`
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
        1 - (c.embedding <=> CAST(${vector} AS vector)) AS score
      FROM "Chunk" c
      ORDER BY c.embedding <=> CAST(${vector} AS vector)
      LIMIT ${request.topK}
    `);

    return rows.map(row => {
      const calculatedScore = Number(row.score);
      
      return {
        score: calculatedScore,
        chunk: {
          id: row.id,
          content: row.content,
          // RetrievedChunk expects a required number, so fallback to 0 if null
          pageNumber: row.pageNumber ?? 0, 
          chapter: row.chapter ?? undefined,
          section: row.section ?? undefined,
          // RetrievedChunk requires documentTitle (we pass empty string for now until joined)
          documentTitle: "", 
          score: calculatedScore,
        },
      };
    });
  }
  
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

  private vectorToSql(values: number[]): string {
    return `[${values.join(",")}]`;
  }

  private async updateEmbeddingWithClient(
    client: Prisma.TransactionClient,
    chunkId: string,
    values: number[]
  ): Promise<void> {
    const vector = this.vectorToSql(values);

    await client.$executeRaw(Prisma.sql`
      UPDATE "Chunk"
      SET embedding = CAST(${vector} AS vector)
      WHERE id = ${chunkId}
    `);
  }
}