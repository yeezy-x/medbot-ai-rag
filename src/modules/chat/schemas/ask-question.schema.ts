import { z } from "zod";

export const askQuestionSchema =
  z.object({
    sessionId: z.uuid(),

    message: z
      .string()
      .trim()
      .min(1)
      .max(5000),

    // Optional per-request retrieval overrides (Settings page). Omitted →
    // service-layer defaults (DEFAULT_TOP_K / DEFAULT_MIN_SIMILARITY_SCORE).
    topK: z.number().int().min(1).max(20).optional(),
    minScore: z.number().min(0).max(1).optional(),
  });

export type AskQuestionInput =
  z.infer<
    typeof askQuestionSchema
  >;