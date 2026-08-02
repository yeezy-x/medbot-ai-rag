import { z } from "zod";
import { loginSchema } from "./auth.schema";

export const loginFormSchema = loginSchema;
export type LoginFormValues = z.infer<typeof loginFormSchema>;
