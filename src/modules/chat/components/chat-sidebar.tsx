// src/modules/chat/components/chat-sidebar.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChatList } from "./chat-list";
import { createChat } from "@/modules/chat/api/chat.api";

interface Chat {
  id: string;
  title: string;
}

interface SidebarProps {
  initialChats: Chat[];
}

export function Sidebar({ initialChats }: SidebarProps) {
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [isCreating, setIsCreating] = useState(false);

  async function handleNewChat() {
    setIsCreating(true);
    try {
      const result = await createChat("New Conversation");
      const newChat = result.data;
      setChats((prev) => [newChat, ...prev]);
      router.push(`/chat/${newChat.id}`);
    } catch (error) {
      console.error("Failed to create chat:", error);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <aside className="w-64 flex flex-col border-r h-full">
      <div className="p-3 border-b">
        <Button
          className="w-full"
          onClick={handleNewChat}
          disabled={isCreating}
        >
          {isCreating ? "Creating…" : "+ New Chat"}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <ChatList chats={chats} />
      </div>
    </aside>
  );
}