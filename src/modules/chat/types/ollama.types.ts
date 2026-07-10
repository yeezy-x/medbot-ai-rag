export interface OllamaChatRequest {
  model: string;
  system: string;
  prompt: string;
  stream?: boolean;
  options?: OllamaChatOptions;
}

export interface OllamaChatResponse {
  model: string;
  response: string;
  done: boolean;
  totalDuration?: number;
  promptEvalCount?: number;
  evalCount?: number;
}

export interface OllamaChatOptions {
  temperature?: number;
  topP?: number;
  topK?: number;
  numPredict?: number;
  seed?: number;
}