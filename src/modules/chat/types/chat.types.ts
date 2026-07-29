import { CitationReference } from "@/modules/knowledge/types/retrieval.types";
import type { CitationDisplay } from "./citation.types";

export interface Chat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export type MessageRole = "USER" | "ASSISTANT" | "SYSTEM";

/** Compact per-message metrics attached after streaming completes. */
export interface MessageMetrics {
  totalDurationMs?: number;
  retrievalDurationMs?: number;
  generationDurationMs?: number;
  retrievedChunkCount?: number;
  acceptedChunkCount?: number;
  contextTokens?: number;
  topScore?: number;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  citations?: CitationDisplay[];
  metrics?: MessageMetrics;
  /** Set when generation was stopped before completion. */
  incomplete?: boolean;
}

export interface ChatRequest {
  sessionId: string;
  question: string;
}

export interface ChatResponse {
  answer: string;
  citations: CitationReference[];
}

export interface SendMessageRequest {
  chatId: string;
  userId: string;
  message: string;
  topK?: number;
  minScore?: number;
}

export interface SendMessageResponse {
  answer: string;
  citations: CitationReference[];
}