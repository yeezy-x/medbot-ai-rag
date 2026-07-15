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
  user:{
    id:string,
    name?:string | null;
    email?: string |null
  }
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
      router.refresh()
    } catch {
      alert("Failed to create chat.")
    } finally {
      setIsCreating(false);
    }
  }

  return (
  <aside className="w-72 border-r flex flex-col bg-background">
    
    {/* Logo */}
    <div className="p-4 border-b">
      <h1 className="font-bold text-xl">
        MedBot
      </h1>

      <p className="text-xs text-muted-foreground">
        Gale Encyclopedia of Medicine
      </p>
    </div>

    {/* New Chat */}
    <div className="p-4 border-b">
      <Button
        className="w-full"
        onClick={handleNewChat}
        disabled={isCreating}
      >
        {isCreating
          ? "Creating..."
          : "+ New Chat"}
      </Button>
    </div>

    {/* Recent Chats */}
    <div className="px-4 py-3">
      <h2 className="text-xs uppercase tracking-wide text-muted-foreground">
        Recent Chats
      </h2>
    </div>

    <div className="flex-1 overflow-y-auto px-2">
      <ChatList chats={chats} />
    </div>

    {/* Footer */}
    <div className="border-t p-4">
      User Footer Here
    </div>

  </aside>
);
}