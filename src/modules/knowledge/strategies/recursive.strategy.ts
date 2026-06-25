// src/modules/knowledge/strategies/recursive.strategy.ts
import { CHUNKING } from "../constants/chunking.constants";
import { NormalizationService } from "../services/normalization.service";
import { ChunkBuilderState } from "../types/chunking.types";
import { Chunk } from "../types/chunk.types";
import { ChunkingStrategy } from "./chunking.strategy";

export class RecursiveChunkingStrategy
  implements ChunkingStrategy
{
  private readonly normalizationService =
    new NormalizationService();

  chunk(text: string): Chunk[] {
    const normalized =
      this.normalizationService.trim(text);

    if (!normalized) {
      return [];
    }

    const state: ChunkBuilderState = {
      chunks: [],
      currentParts: [],
      currentLength: 0,
      chunkIndex: 0,
      currentStartOffset: 0,
      processedCharacters: 0,
    };

    const paragraphs =
      this.splitIntoParagraphs(normalized);

    for (const paragraph of paragraphs) {
      this.processParagraph(
        paragraph,
        state
      );
    }

    this.flush(state);

    return state.chunks;
  }

   private splitIntoParagraphs(
    text: string
  ): string[] {
    return text
      .replace(/\r\n/g, "\n")
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
  }

    private splitIntoSentences(
    paragraph: string
  ): string[] {
    return paragraph
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

    private splitIntoWords(
    sentence: string
  ): string[] {
    return sentence
      .split(/\s+/)
      .map((w) => w.trim())
      .filter(Boolean);
  }

   private processParagraph(
    paragraph: string,
    state: ChunkBuilderState
  ) {
    if (
      paragraph.length <=
      CHUNKING.MAX_CHUNK_SIZE
    ) {
      this.append(
        paragraph,
        "\n\n",
        state
      );
      return;
    }

    for (const sentence of this.splitIntoSentences(paragraph)) {
      this.processSentence(
        sentence,
        state
      );
    }
  }

   private processSentence(
    sentence: string,
    state: ChunkBuilderState
  ) {
    if (
      sentence.length <=
      CHUNKING.MAX_CHUNK_SIZE
    ) {
      this.append(
        sentence,
        " ",
        state
      );
      return;
    }

    this.processWords(
      this.splitIntoWords(sentence),
      state
    );
  }

    private processWords(
    words: string[],
    state: ChunkBuilderState
  ) {
    for (const word of words) {
      if (
        word.length >
        CHUNKING.MAX_CHUNK_SIZE
      ) {
        this.forceSplit(
          word,
          state
        );
      } else {
        this.append(
          word,
          " ",
          state
        );
      }
    }
  }
    private append(
    text: string,
    separator: string,
    state: ChunkBuilderState
  ) {
    if (!text) {
      return;
    }

    this.ensureCapacity(
      text.length,
      separator.length,
      state
    );

    if (
      state.currentParts.length
    ) {
      state.currentParts.push(
        separator
      );

      state.currentLength +=
        separator.length;
    }

    state.currentParts.push(text);

    state.currentLength +=
      text.length;
  }

    private ensureCapacity(
    incomingLength: number,
    separatorLength: number,
    state: ChunkBuilderState
  ) {
    if (
      state.currentLength +
        separatorLength +
        incomingLength <=
      CHUNKING.MAX_CHUNK_SIZE
    ) {
      return;
    }

    this.flush(state);
  }


   private flush(
    state: ChunkBuilderState
  ) {
    if (
      state.currentParts.length ===
      0
    ) {
      return;
    }

    const content =
      state.currentParts.join("");

    state.chunks.push(
      this.createChunk(
        content,
        state.chunkIndex,
        state.currentStartOffset
      )
    );

    state.chunkIndex++;

    state.processedCharacters +=
      content.length;

    const overlap =
      this.getWordAwareOverlap(
        content
      );

    state.currentParts =
      overlap
        ? [overlap]
        : [];

    state.currentLength =
      overlap.length;

    state.currentStartOffset =
      Math.max(
        0,
        state.processedCharacters -
          overlap.length
      );
  }

    private getWordAwareOverlap(
    content: string
  ) {
    const words =
      content.split(/\s+/);

    const overlap: string[] = [];

    let length = 0;

    for (
      let i =
        words.length - 1;
      i >= 0;
      i--
    ) {
      const word =
        words[i];

      if (
        length +
          word.length >
        CHUNKING.OVERLAP_SIZE
      ) {
        break;
      }

      overlap.unshift(word);

      length +=
        word.length + 1;
    }

    return overlap.join(" ");
  }

    private forceSplit(
    text: string,
    state: ChunkBuilderState
  ) {
    let remaining = text;

    while (
      remaining.length >
      CHUNKING.MAX_CHUNK_SIZE
    ) {
      const piece =
        remaining.slice(
          0,
          CHUNKING.MAX_CHUNK_SIZE
        );

      this.append(
        piece,
        "",
        state
      );

      this.flush(state);

      remaining =
        remaining.slice(
          CHUNKING.MAX_CHUNK_SIZE
        );
    }

    if (remaining) {
      this.append(
        remaining,
        "",
        state
      );
    }
  }

   private createChunk(
    content: string,
    chunkIndex: number,
    startOffset: number
  ): Chunk {
    return {
      chunkIndex,
      content,
      characterCount:
        content.length,
      estimatedTokens:
        this.estimateTokens(
          content
        ),
      startOffset,
      endOffset:
        startOffset +
        content.length,
    };
  }

   private estimateTokens(
    content: string
  ) {
    return Math.ceil(
      content.length /
        CHUNKING.APPROX_CHARS_PER_TOKEN
    );
  }
}