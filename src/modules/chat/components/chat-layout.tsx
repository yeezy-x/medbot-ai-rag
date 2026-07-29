import { ReactNode } from "react";

import { requireUser } from "@/lib/auth-utils";
import { ChatService } from "@/modules/chat/services";
import { ChatAppShell } from "@/modules/chat/components/chat-app-shell";

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
    <ChatAppShell user={user} chats={normalizedChats}>
      {children}
    </ChatAppShell>
  );
}
