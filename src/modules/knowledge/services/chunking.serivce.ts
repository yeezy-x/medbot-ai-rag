import { Chunk } from "../types/chunk.types";

export class ChunkingService {
  createChunks(
    text: string,
    chunkSize = 1000,
    overlap = 200
  ): Chunk[] {
    const chunks: Chunk[] = [];

    let start = 0;
    let index = 0;

    while (start < text.length) {
      const end =
        start + chunkSize;

      chunks.push({
        chunkIndex: index,
        content: text.slice(
          start,
          end
        ),
      });

      start +=
        chunkSize - overlap;

      index++;
    }

    return chunks;
  }
}