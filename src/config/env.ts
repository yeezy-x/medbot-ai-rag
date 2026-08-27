import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default("/sign-in"),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default("/sign-up"),
  CLERK_WEBHOOK_SIGNING_SECRET: z.string().optional(),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  OLLAMA_BASE_URL: z.string().url().optional(),
  LLM_PROVIDER: z
    .enum(["auto", "ollama", "openrouter", "gemini"])
    .default("auto"),
  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_CHAT_MODEL: z.string().default("google/gemini-2.0-flash-exp:free"),
  OPENROUTER_EMBED_MODEL: z.string().default("nomic-ai/nomic-embed-text-v1.5"),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_CHAT_MODEL: z.string().default("gemini-2.0-flash"),
  GEMINI_EMBED_MODEL: z.string().default("gemini-embedding-001"),
  CHAT_MODEL: z.string().optional(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
  CLERK_WEBHOOK_SIGNING_SECRET: process.env.CLERK_WEBHOOK_SIGNING_SECRET,
  DATABASE_URL: process.env.DATABASE_URL,
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL,
  LLM_PROVIDER: process.env.LLM_PROVIDER,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  OPENROUTER_CHAT_MODEL: process.env.OPENROUTER_CHAT_MODEL,
  OPENROUTER_EMBED_MODEL: process.env.OPENROUTER_EMBED_MODEL,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY,
  GEMINI_CHAT_MODEL: process.env.GEMINI_CHAT_MODEL,
  GEMINI_EMBED_MODEL: process.env.GEMINI_EMBED_MODEL,
  CHAT_MODEL: process.env.CHAT_MODEL,
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});

export function getAppBaseUrl(): string {
  if (env.NEXT_PUBLIC_APP_URL) {
    return env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  const vercel = process.env.VERCEL_URL;
  if (vercel) {
    return `https://${vercel.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}
