import { MessageRole } from "@/modules/chat/types/chat.types";
import { ContextWindow } from "./context.types";
import { Prompt } from "./prompt.types";
import type { CitationReference, RetrievalResult } from "./retrieval.types";


export interface RAGConversationMessage {
  role: MessageRole;
  content: string;
}

export interface RAGRequest {
  question: string;
  history?: RAGConversationMessage[];
  topK?: number;
}

export interface RAGResponse {
  answer: string;
  citations: CitationReference[];
  metrics: {
    durationMs: number;
    retrievalDurationMs: number;
    chunkCount: number;
  };
}
export interface RAGContext {
  retrieval: RetrievalResult;
  context: ContextWindow;
  prompt: Prompt;
}