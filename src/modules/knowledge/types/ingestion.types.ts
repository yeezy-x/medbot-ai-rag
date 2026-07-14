import { SourceType } from "./metadata.types";

export interface IngestionOptions {
  title?: string;
  version?: string;
  language?: string;
  sourceType?: SourceType;
}

export interface IngestionResult {
  documentId: string;
  status:"INGESTED" | "SKIPPED";
  reason?:"DOCUMENT_ALREADY_INGESTED";
  chunkCount: number;
  embeddingCount: number;
  inserted: number;
  updated: number;
  durationMs: number;
}