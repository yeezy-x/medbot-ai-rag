export interface ContextChunk {
  id: string;

  content: string;

  source: string;

  pageNumber?: number;
}

export interface ContextWindow {
  chunks: ContextChunk[];
  text:string
  totalCharacters: number;
  totalEstimatedTokens: number;
}