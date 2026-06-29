// src/modules/knowledge/types/vector.types.ts

import {
  EmbeddedKnowledgeChunk,
  EmbeddingVector,
} from "./embedding.types";
import { RetrievedChunk } from "./retrieval.types";

export type SimilarityMetric =
  | "cosine"
  | "euclidean"
  | "inner-product";

export type VectorDocument = EmbeddedKnowledgeChunk;

export interface UpsertVectorRequest {
  documents: VectorDocument[];
}

export interface UpsertVectorResult {
  inserted: number;
  updated: number;
}

export interface DeleteVectorRequest {
  ids: string[];
}

export interface VectorSearchFilter {
  documentId?: string;
  chapter?: string;
  section?: string;
  pageNumber?: number;
}

export interface VectorSearchQuery {
  embedding: EmbeddingVector;
  topK: number;
  filter?: VectorSearchFilter;
}

export interface VectorSearchResult {
  chunk: RetrievedChunk;
  score: number;
}