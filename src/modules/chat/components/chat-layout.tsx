import { ReactNode } from "react";

import { requireUser } from "@/lib/auth-utils";
import { ChatService } from "@/modules/chat/services";
import { Sidebar } from "@/modules/chat/components/chat-sidebar";
import { ChatHeader } from "@/modules/chat/components/chat-header";

export default async function ChatLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();
  const chatService = new ChatService();
  const chats = await chatService.getUserChats(user.id);
  const normalizedChats = chats.map((chat) => ({
    ...chat,
    createdAt: chat.createdAt.toISOString(),
    updatedAt: chat.updatedAt.toISOString(),
  }));

  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-background">
      <Sidebar initialChats={normalizedChats} user={user} />

      <div className="flex min-w-0 flex-1 flex-col">
        <ChatHeader chats={normalizedChats} user={user} />
        <main className="flex min-h-0 flex-1 flex-col overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
