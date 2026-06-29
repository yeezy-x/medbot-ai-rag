export interface IngestionOptions {
  title?: string;
  version?: string;
  language?: string;
  sourceType?: "PDF";
}

export interface IngestionResult {
  documentId: string;
  chunkCount: number;
  embeddingCount: number;
  inserted: number;
  updated: number;
  durationMs: number;
}