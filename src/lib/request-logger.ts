import { logger }
from "./logger";

export function logRequest(
  requestId: string,
  path: string
) {
  logger.info({
    requestId,
    path,
    event:
      "REQUEST_STARTED",
  });
}