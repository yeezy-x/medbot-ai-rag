import { Chunk } from "../types/chunk.types";

export interface ChunkingStrategy {
  chunk(text: string): Chunk[];
}