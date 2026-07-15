import { ReactNode } from "react";

import { requireUser } from "@/lib/auth-utils";
import { ChatService } from "@/modules/chat/services";
import { Sidebar } from "@/modules/chat/components/chat-sidebar";
import { ChatHeader } from "@/modules/chat/components/chat-header";
import { ChatInputWrapper } from "@/components/chat-input-wrapper";

export default async function ChatLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user =
    await requireUser();

  const chatService =
    new ChatService();

  const chats =
    await chatService.getUserChats(
      user.id
    );

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar initialChats={chats} user={user}/>
      <div className="border-t p-4">
        <div className="font-medium text-sm">
          {user.name}
        </div>

        <div className="text-xs text-muted-foreground">
          {user.email}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <ChatHeader />
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
        <ChatInputWrapper />
      </div>
    </div>
  );
}