import { z } from "zod";

export const askQuestionSchema = z.object({
  sessionId: z.uuid(),
  message: z
    .string()
    .min(1)
    .max(5000),
});