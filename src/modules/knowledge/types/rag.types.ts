import { ContextWindow } from "./context.types";
import { Prompt } from "./prompt.types";
import { RetrievalResult } from "./retrieval.types";

export interface RAGRequest {
  question: string;
  topK?: number;
}

export interface RAGContext {
  prompt: Prompt;
  retrieval: RetrievalResult;
  context: ContextWindow;
}