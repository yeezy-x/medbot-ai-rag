import { z } from "zod";

export const registerSchema =
  z.object({
    name: z.string()
      .min(2)
      .max(100),

    email: z.email(),

    password: z.string()
      .min(8)
      .max(100),
  });

export const loginSchema = z.object({
  email: z
    .string()
    .email()
    .toLowerCase(),

  password: z
    .string()
    .min(8)
    .max(100),
});

export type RegisterInput=z.infer<typeof registerSchema>;
export type loginSchema=z.infer<typeof loginSchema>