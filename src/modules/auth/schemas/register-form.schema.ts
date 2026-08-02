import { z } from "zod";
import { registerSchema } from "./auth.schema";

export const registerFormSchema = registerSchema;
export type RegisterFormValues = z.infer<typeof registerFormSchema>;
