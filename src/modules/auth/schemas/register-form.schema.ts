import { z } from "zod";

export const registerFormSchema =
  z.object({
    name: z.string().min(2),

    email: z.email(),

    password: z.string().min(8),
  });

export type RegisterFormValues =
  z.infer<
    typeof registerFormSchema
  >;