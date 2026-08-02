export const EMBEDDING = {
  PROVIDER: "ollama",

  MODEL: "nomic-embed-text",

  DIMENSIONS: 768,

  MAX_BATCH_SIZE: 32,

  MAX_RETRIES: 3,

  REQUEST_TIMEOUT_MS: 30_000,

  OLLAMA_BASE_URL: "http://localhost:11434",

  KEEP_ALIVE: "10m",
} as const;