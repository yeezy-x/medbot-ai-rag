import { z } from "zod";

const envSchema = z.object({
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
  NEXTAUTH_URL: z.string().url().optional(),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  OLLAMA_BASE_URL: z.string().url().optional(),
  NODE_ENV: z.enum([
    "development",
    "production",
    "test"
  ]).default("development"),

});

export const env = envSchema.parse({
  AUTH_SECRET: process.env.AUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL,
  NODE_ENV: process.env.NODE_ENV,
});