"use client";

import { createContext, useContext, type ReactNode } from "react";

import {
  useChatList,
  type ChatListItem,
} from "@/modules/chat/hooks/use-chat-list";

type ChatListContextValue = ReturnType<typeof useChatList>;

const ChatListContext = createContext<ChatListContextValue | null>(null);

export function ChatListProvider({
  initialChats,
  children,
}: {
  initialChats: ChatListItem[];
  children: ReactNode;
}) {
  const value = useChatList(initialChats);
  return (
    <ChatListContext.Provider value={value}>{children}</ChatListContext.Provider>
  );
}

export function useChatListContext(): ChatListContextValue {
  const ctx = useContext(ChatListContext);
  if (!ctx) {
    throw new Error("useChatListContext must be used within ChatListProvider");
  }
  return ctx;
}
