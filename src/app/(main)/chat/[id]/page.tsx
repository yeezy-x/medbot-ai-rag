import { notFound } from "next/navigation";

import { requireUser } from "@/lib/auth-utils";
import { ChatConversation } from "@/modules/chat/components/chat-conversation";
import { ChatService } from "@/modules/chat/services";
import type { Message } from "@/modules/chat/types/chat.types";

interface ChatDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ q?: string | string[] }>;
}

export default async function ChatDetailPage({
  params,
  searchParams,
}: ChatDetailPageProps) {
  const [{ id }, { q }] = await Promise.all([params, searchParams]);
  const user = await requireUser();
  const chatService = new ChatService();

  try {
    await chatService.getChatById(id, user.id);
  } catch {
    notFound();
  }

  const conversation = await chatService.getConversation(id, user.id);
  const initialMessages: Message[] = conversation.map((message) => ({
    id: message.id,
    role: message.role,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
    citations: message.citations.map((citation) => ({
      id: citation.id,
      chunkId: citation.chunkId,
      documentId: citation.chunk.documentId,
      pageNumber: citation.pageNumber,
      sourceTitle: citation.sourceTitle,
    })),
  }));
  const initialMessage = typeof q === "string" && q.trim() ? q : undefined;

  return (
    <ChatConversation
      sessionId={id}
      initialMessages={initialMessages}
      initialMessage={initialMessage}
    />
  );
}

