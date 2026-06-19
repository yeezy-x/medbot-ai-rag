export interface RetrievedChunk {
  chunkId: string;
  content: string;
  pageNumber: number;
  chapter?: string;
  section?: string;
  documentTitle: string;
  score: number;
}

export interface CitationReference {
  chunkId: string;
  pageNumber: number;
  sourceTitle: string;
}

export interface RetrievalResult {
  chunks: RetrievedChunk[];
}