import { ZodSchema } from "zod";

import { ValidationError } from "@/lib/errors/validation-error";

export function validate<T>(
  schema: ZodSchema<T>,
  data: unknown
): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ValidationError("Validation Error",result.error.flatten());
  }

  return result.data;
}