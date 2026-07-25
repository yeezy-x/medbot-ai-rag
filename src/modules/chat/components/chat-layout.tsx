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
  // Normalize Date objects to strings to satisfy Chat type expectations
  const normalizedChats = chats.map((c) => ({
    ...c,
    createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : String(c.createdAt),
    updatedAt: c.updatedAt instanceof Date ? c.updatedAt.toISOString() : String(c.updatedAt),
  }));

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar initialChats={normalizedChats} user={user}/>

      <div className="flex-1 flex flex-col">
        <ChatHeader chats={normalizedChats} user={user} />
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}