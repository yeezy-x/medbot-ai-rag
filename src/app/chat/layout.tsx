// src/app/chat/layout.tsx
import { auth } from "@/auth";
import { ChatService } from "@/modules/chat/services";
import { Sidebar } from "@/modules/chat/components/chat-sidebar";

const chatService = new ChatService();

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const chats = await chatService.getUserChats(session!.user.id);

  return (
    <div className="flex h-[calc(100vh-57px)]">
      <Sidebar initialChats={chats} />
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}