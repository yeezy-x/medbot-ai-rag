// src/modules/knowledge/services/chunking.service.ts

import { Chunk } from "../types/chunk.types";
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
}