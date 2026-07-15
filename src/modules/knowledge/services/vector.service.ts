import { VectorProvider } from "../providers/vector.provider";
import { PostgresVectorProvider } from "../providers/postgres-vector.provider";

import {
  DeleteVectorRequest,
  UpsertVectorRequest,
  UpsertVectorResult,
  VectorSearchQuery,
  VectorSearchResult,
} from "../types/vector.types";

export class VectorService {
  constructor(
    private readonly provider: VectorProvider =
      new PostgresVectorProvider()
  ) {}

  async upsert(
    request: UpsertVectorRequest
  ): Promise<UpsertVectorResult> {
    return this.provider.upsert(request);
  }

  async search(
    request: VectorSearchQuery
  ): Promise<VectorSearchResult[]> {
    return this.provider.search(request);
  }

  async delete(
    request: DeleteVectorRequest
  ): Promise<void> {
    return this.provider.delete(request);
  }
}