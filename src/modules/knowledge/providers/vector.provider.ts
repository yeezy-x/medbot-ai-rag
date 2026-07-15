// src/modules/knowledge/providers/vector.provider.ts

import {
  DeleteVectorRequest,
  SimilarityMetric,
  UpsertVectorRequest,
  UpsertVectorResult,
  VectorSearchQuery,
  VectorSearchResult,
} from "../types/vector.types";

export interface VectorProvider {
  readonly provider: string;

  readonly similarityMetric: SimilarityMetric;

  upsert(
    request: UpsertVectorRequest
  ): Promise<UpsertVectorResult>;

  search(
    request: VectorSearchQuery
  ): Promise<VectorSearchResult[]>;

  delete(
    request: DeleteVectorRequest
  ): Promise<void>;
}