import { logger }
from "@/lib/logger";

import { AppError }
from "@/lib/errors/app-error";

import { ErrorCode }
from "@/types/error.types";

export function handleError(
  error: unknown
) {
  if (error instanceof AppError) {
    logger.warn({
      code: error.code,
      message: error.message,
      details: error.details,
    });

    return {
      status: error.statusCode,

      body: {
        success: false,

        error: {
          code: error.code,
          message: error.message,
        },
      },
    };
  }

  logger.error(error);

  return {
    status: 500,

    body: {
      success: false,

      error: {
        code:
          ErrorCode.INTERNAL_SERVER_ERROR,

        message:
          "Internal Server Error",
      },
    },
  };
}