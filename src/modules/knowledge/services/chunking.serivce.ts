// src/modules/knowledge/services/chunking.service.ts

import { Chunk } from "../types/chunk.types";
import { ExtractedPdfPage } from "../types/pdf.types";

import { ChunkingStrategy } from "../strategies/chunking.strategy";
import { RecursiveChunkingStrategy } from "../strategies/recursive.strategy";

export class ChunkingService {
  constructor(
    public readonly strategy: ChunkingStrategy =
      new RecursiveChunkingStrategy()
  ) {}

  createChunks(text: string): Chunk[] {
    return this.strategy.chunk(text);
  }

  createChunksFromPages(
    pages: ExtractedPdfPage[]
  ): Chunk[] {
    let globalChunkIndex = 0;

    return pages.flatMap((page) => {
      const pageChunks =
        this.strategy.chunk(page.text);

      return pageChunks.map((chunk) => ({
        ...chunk,

        chunkIndex:
          globalChunkIndex++,

        pageNumber:
          page.pageNumber,
      }));
    });
  }
}