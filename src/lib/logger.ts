import pino from "pino";

export const logger = pino({
  base:{
    service:"medbot"
  },
  level:
    process.env.NODE_ENV ===
    "production"
      ? "info"
      : "debug",
  transport:
    process.env.NODE_ENV !==
    "production"
      ? {
          target:
            "pino-pretty",
        }
      : undefined,
});