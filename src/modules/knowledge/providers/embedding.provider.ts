import {
  BatchEmbeddingRequest,
  BatchEmbeddingResponse,
  EmbeddingRequest,
  EmbeddingResponse,
} from "../types/embedding.types";

export interface EmbeddingProvider {
   readonly provider: string;
   readonly model: string;
  embed(
    request: EmbeddingRequest
  ): Promise<EmbeddingResponse>;

  embedBatch(
    request: BatchEmbeddingRequest
  ): Promise<BatchEmbeddingResponse>;
}