import { z } from "zod";

const envSchema = z.object({
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
  AUTH_MFA_ENCRYPTION_KEY: z.string().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  OLLAMA_BASE_URL: z.string().url().optional(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  AUTH_RESEND_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
});

export const env = envSchema.parse({
  AUTH_SECRET: process.env.AUTH_SECRET,
  AUTH_MFA_ENCRYPTION_KEY: process.env.AUTH_MFA_ENCRYPTION_KEY,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
  AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
  AUTH_RESEND_KEY: process.env.AUTH_RESEND_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
});

export const hasGoogleAuth = Boolean(
  env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET
);

export const hasResendAuth = Boolean(env.AUTH_RESEND_KEY && env.EMAIL_FROM);

export function getAppBaseUrl(): string {
  return (
    env.NEXTAUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000"
  ).replace(/\/$/, "");
}
