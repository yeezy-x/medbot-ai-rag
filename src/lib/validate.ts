import { ZodSchema } from "zod";

import { ValidationError } from "@/lib/errors/validation-error";

export function validate<T>(
  schema: ZodSchema<T>,
  data: unknown
): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => issue.message)
      .join(", ");

    throw new ValidationError(message);
  }

  return result.data;
}