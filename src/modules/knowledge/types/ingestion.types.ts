import { SourceType } from "./metadata.types";

export interface IngestionOptions {
  title?: string;
  version?: string;
  language?: string;
  sourceType?:SourceType;
}

export interface IngestionResult {
  documentId: string;
  chunkCount: number;
  embeddingCount: number;
  inserted: number;
  updated: number;
  durationMs: number;
}