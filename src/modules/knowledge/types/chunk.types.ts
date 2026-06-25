export interface Chunk {
  chunkIndex: number;
  content: string;
  characterCount: number;
  estimatedTokens: number;
  startOffset:number,
  endOffset:number
}

