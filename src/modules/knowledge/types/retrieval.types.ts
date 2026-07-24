// src/modules/knowledge/types/retrieval.types.ts
import { SourceType } from "./metadata.types";

export interface RetrievedChunk {
  id: string;
  documentId: string;
  content: string;
  score: number;
  pageNumber?: number;
  chapter?: string;
  section?: string;
  headings: string[];
  source: {
    title: string;
    version: string;
    language: string;
    sourceType: SourceType;
  };
}

export interface CitationReference {
  chunkId: string;
  documentId: string;
  pageNumber: number;
  sourceTitle: string;
}

export interface RetrievalFilters {
  documentId?: string;

  chapter?: string;

  section?: string;

  pageNumber?: number;

  sourceType?: SourceType;

  language?: string;

  version?: string;
}
export interface RetrievalRequest {
  query: string;
  topK: number;
  candidatePoolSize: number;
  minScore?: number|null;
  filters?: RetrievalFilters;
}

export interface RetrievalResult {
  query: string;
  chunks: RetrievedChunk[];
  citations: CitationReference[];
  durationMs: number;
}