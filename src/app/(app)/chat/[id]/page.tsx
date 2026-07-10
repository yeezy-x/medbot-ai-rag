// src/app/chat/[id]/page.tsx
import { ChatService } from "@/modules/chat/services"; // Removed unused MessageService
import { MessageList } from "@/modules/chat/components/message-list";
import { notFound } from "next/navigation";
import { ChatInputWrapper } from "@/components/chat-input-wrapper";
import { requireUser } from "@/lib/auth-utils";

interface ChatDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ChatDetailPage({ params }: ChatDetailPageProps) {
  const { id } = await params;
  const user = await requireUser();

  const chatService = new ChatService();

  // 1. Fetch chat metadata to verify existence and ownership
  try {
    await chatService.getChatById(id, user.id);
  } catch {
    notFound();
  }

  // 2. Fetch messages and serialize Dates for Client Components
  const messages = await chatService.getConversation(id, user.id);
  const serializedMessages = messages.map((message) => ({
    id: message.id,
    role: message.role,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
  }));

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <MessageList messages={serializedMessages} />
        <ChatInputWrapper sessionId={id} />
      </div>
    </div>
  );
}