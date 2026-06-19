import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string(),
  NODE_ENV: z.string(),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV,
});