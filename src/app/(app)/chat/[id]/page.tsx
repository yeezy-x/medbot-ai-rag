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
  <div className="flex h-full min-h-0 flex-1 flex-col">

    <div className="flex-1 min-h-0 overflow-y-auto">

      <div className="mx-auto w-full max-w-var(--content-max) px-6 py-6 pb-32">
        <MessageList
          messages={serializedMessages}
        />
      </div>

    </div>

    <div className="shrink-0 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/75 ">

      <div className="mx-auto w-full  max-w-[var(--content-max)]px-6 py-4">
        <ChatInputWrapper sessionId={id} />
      </div>

    </div>

  </div>
);
}