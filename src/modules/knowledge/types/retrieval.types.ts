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
  pageNumber?: number;
  sourceTitle: string;
}

export interface RetrievalRequest {
  query: string;
  topK: number;
  filters?: {
    documentId?: string;
    chapter?: string;
    section?: string;
  };
}

export interface RetrievalResult {
  query: string;
  chunks: RetrievedChunk[];
  citations: CitationReference[];
  durationMs: number;
}