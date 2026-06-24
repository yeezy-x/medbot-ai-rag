// src/app/chat/[id]/page.tsx
import { ChatService, MessageService } from "@/modules/chat/services";
import { MessageList } from "@/modules/chat/components/message-list";
import { notFound } from "next/navigation";
import { ChatInputWrapper } from "@/components/chat-input-wrapper";
import { requireUser } from "@/lib/auth-utils";

interface ChatDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ChatDetailPage({ params }: ChatDetailPageProps) {
  const { id } = await params;
  const user=await requireUser()

  const chatService = new ChatService();
  const messageService = new MessageService();

  let chat;
  try {
    chat = await chatService.getChatById(id, user.id);
  } catch {
    notFound();
  }

  const messages = await messageService.getConversation(id);
  const msg = messages.map(
    message => ({
      id: message.id,
      role: message.role,
      content: message.content,
      createdAt:
        message.createdAt.toISOString(),
    })
  );

  return (
    <div className="flex flex-col h-full">
      <div className="border-b px-6 py-3">
        <h1 className="font-semibold text-lg">{chat.title}</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <MessageList messages={msg} />
      </div>

      <ChatInputWrapper sessionId={id} />
    </div>
  );
}