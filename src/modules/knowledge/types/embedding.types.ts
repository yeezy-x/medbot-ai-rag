import { KnowledgeChunk } from "./metadata.types";

export interface EmbeddingVector {
  values: number[];

  dimensions: number;

  model: string;
  metadata:EmbeddingMetadata;
}

export interface EmbeddedKnowledgeChunk
  extends KnowledgeChunk {
  embedding: EmbeddingVector;
}

export interface EmbeddingMetadata {
  provider: string;
  createdAt: Date;
}

export interface EmbeddingRequest {
  text: string;
}

export interface BatchEmbeddingRequest {
  texts: string[];
}

export interface EmbeddingResponse {
  embedding: EmbeddingVector;
}

export interface BatchEmbeddingResponse {
  embeddings: EmbeddingVector[];
}