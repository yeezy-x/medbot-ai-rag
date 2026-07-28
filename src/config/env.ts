import { z } from "zod";

//validate environment variables using zod why?
//Validating environment variables using Zod provides several benefits:
/* 1. Type Safety: Zod allows you to define a schema for your environment variables, ensuring that they conform to the expected types and formats. This helps catch errors early in the development process.
2. Validation: Zod provides built-in validation methods, allowing you to enforce constraints on your environment variables (e.g., required fields, string length, URL format). This ensures that your application runs with valid configuration.
3. Default Values: Zod allows you to specify default values for environment variables, making it easier to manage optional configurations.
4. Clear Error Messages: When validation fails, Zod provides clear and descriptive error messages, making it easier to identify and fix issues with your environment variables.
5. Maintainability: Using a schema-based approach makes it easier to maintain and update your environment variable configuration as your application evolves.
Overall, using Zod for environment variable validation enhances the robustness and reliability of your application by ensuring that it runs with valid and expected configurations.*/

const envSchema = z.object({
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
  NEXTAUTH_URL: z.string().url().optional(),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  OLLAMA_BASE_URL: z.string().url().optional(),
  NODE_ENV: z.enum(["development","production","test"]).default("development"),

});

export const env = envSchema.parse({
  AUTH_SECRET: process.env.AUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL,
  NODE_ENV: process.env.NODE_ENV,
});