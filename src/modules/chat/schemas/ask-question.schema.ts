import { z } from "zod";

export const askQuestionSchema =
  z.object({
    sessionId: z.uuid(),

    message: z
      .string()
      .trim()
      .min(1)
      .max(5000),
  });

export type AskQuestionInput =
  z.infer<
    typeof askQuestionSchema
  >;