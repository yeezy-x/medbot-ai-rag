export interface Chunk {
  chunkIndex: number;
  content: string;
  characterCount: number;
  estimatedTokens: number;
  startOffset:number,
  endOffset:number
}

export interface ChunkBuilderState {
  chunks: Chunk[];
  currentParts: string[];
  currentLength: number;
  chunkIndex: number;
  currentStartOffset: number;
  processedCharacters: number;
}