export interface RetrievedChunk {
  id: string;
  content: string;
  pageNumber: number;
  chapter?: string;
  section?: string;
  documentTitle: string;
  score: number;
}

export interface CitationReference {
  id: string;
  pageNumber: number;
  documentTitle: string;
}

export interface RetrievalResult {
  chunks: RetrievedChunk[];
}