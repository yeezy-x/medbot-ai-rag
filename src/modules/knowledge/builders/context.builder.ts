import {
  ContextChunk,
  ContextWindow,
} from "../types/context.types";

import {
  RetrievedChunk,
} from "../types/retrieval.types";

export class ContextBuilder {

  build(chunks: RetrievedChunk[]): ContextWindow {
    const contextChunks =
        chunks.map(chunk =>
            this.mapChunk(chunk)
        );
    const text = this.buildContextText(contextChunks);
    return {
        chunks: contextChunks,
        text,
        totalCharacters:text.length,
        totalEstimatedTokens:this.estimateTokens(text),
    };
    }

  private mapChunk(
  chunk: RetrievedChunk
): ContextChunk {
  return {
    id: chunk.id,
    content: chunk.content,
    source: chunk.source.title,
    pageNumber: chunk.pageNumber,
  };
}

  private buildContextText(
  chunks: ContextChunk[]
): string {
  return chunks
    .map((chunk) => {

      const page =
        chunk.pageNumber !== undefined
          ? `Page: ${chunk.pageNumber}`
          : "Page: Unknown";

      return [
        `Source: ${chunk.source}`,
        page,
        "",
        chunk.content,
      ].join("\n");

    })
    .join("\n\n------------------------------\n\n");
}

  private estimateTokens(
    text: string
  ): number {
    return Math.ceil(
      text.length / 4
    );
  }
}