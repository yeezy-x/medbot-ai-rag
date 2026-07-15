export type RetrievalEvaluationCategory =
  | "GROUNDED_MEDICAL"
  | "SPECIFIC_MEDICAL"
  | "UNSUPPORTED_MEDICAL"
  | "NON_MEDICAL";

export interface RetrievalEvaluationQuery {
  id: string;
  category: RetrievalEvaluationCategory;
  query: string;
}

export interface RetrievalEvaluationResult {
  id: string;
  category: RetrievalEvaluationCategory;
  query: string;

  retrievedChunkCount: number;
  acceptedContextChunkCount: number;

  scores: number[];

  topScore: number | null;
  lowestScore: number | null;
  averageScore: number | null;

  topChunkId: string | null;
  topChunkPageNumber: number | null;
  topChunkPreview: string | null;

  retrievalDurationMs: number;
}