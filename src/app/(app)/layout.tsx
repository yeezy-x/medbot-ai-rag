import { ReactNode } from "react";

import { requireUser } from "@/lib/auth-utils";
import { ChatService } from "@/modules/chat/services";
import { Sidebar } from "@/modules/chat/components/chat-sidebar";
import { ChatHeader } from "@/modules/chat/components/chat-header";

export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireUser();

  const chatService = new ChatService();

  const chats =
    await chatService.getUserChats(
      user.id
    );

  const serializedChats = chats.map((chat) => ({
    ...chat,
    createdAt: chat.createdAt.toISOString(),
    updatedAt: chat.updatedAt.toISOString(),
  }));

  return (
    <div className="flex h-full overflow-hidden">

        <Sidebar initialChats={serializedChats} user={user} />
      
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="shrink-0"><ChatHeader /></header>
        <main className="flex min-h-0 flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}