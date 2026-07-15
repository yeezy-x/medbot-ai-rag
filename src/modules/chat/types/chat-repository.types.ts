import { MessageRole } from "@/modules/chat/types/chat.types";
import {
  CitationReference,
} from "@/modules/knowledge/types/retrieval.types";

export interface CreateMessageDto {
  sessionId: string;
  role: MessageRole;
  content: string;
}

export interface CreateCitationsDto {
  messageId: string;
  citations: CitationReference[];
}