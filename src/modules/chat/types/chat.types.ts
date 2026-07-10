import { CitationReference } from "@/modules/knowledge/types/retrieval.types";
export interface Chat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export type MessageRole = "USER" | "ASSISTANT" | "SYSTEM"

export interface Message {
  id: string;

  role: MessageRole;

  content: string;

  createdAt: string;
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
}

export interface SendMessageResponse {
  answer: string;

  citations: CitationReference[];
}