"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteChat, renameChat } from "@/modules/chat/api/chat.api";

export interface ChatListItem {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export function useChatList(initialChats: ChatListItem[]) {
  const router = useRouter();
  const pathname = usePathname();
  const [chats, setChats] = useState<ChatListItem[]>(initialChats);

  useEffect(() => {
    setChats(initialChats);
  }, [initialChats]);

  const activeChatId = (() => {
    const m = pathname.match(/^\/chat\/([^/]+)$/);
    return m?.[1] ?? null;
  })();

  const activeChat = activeChatId
    ? chats.find((c) => c.id === activeChatId)
    : undefined;

  const optimisticRename = useCallback((chatId: string, nextTitle: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, title: nextTitle } : c))
    );
  }, []);

  const revertRename = useCallback((chatId: string, previousTitle: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, title: previousTitle } : c))
    );
  }, []);

  const optimisticDelete = useCallback(
    (chatId: string) => {
      setChats((prev) => prev.filter((c) => c.id !== chatId));
      if (pathname === `/chat/${chatId}`) {
        router.push("/chat");
      }
    },
    [pathname, router]
  );

  const revertDelete = useCallback((chatId: string, chat: ChatListItem) => {
    setChats((prev) => [chat, ...prev]);
  }, []);

  const commitRename = useCallback(
    async (chatId: string, nextTitle: string, previousTitle: string) => {
      optimisticRename(chatId, nextTitle);
      try {
        await renameChat(chatId, nextTitle);
        toast.success("Renamed");
      } catch (err) {
        revertRename(chatId, previousTitle);
        toast.error(err instanceof Error ? err.message : "Rename failed");
      }
    },
    [optimisticRename, revertRename]
  );

  const commitDelete = useCallback(
    async (chatId: string, snapshot: ChatListItem) => {
      optimisticDelete(chatId);
      try {
        await deleteChat(chatId);
        toast.success("Conversation deleted");
      } catch (err) {
        revertDelete(chatId, snapshot);
        toast.error(err instanceof Error ? err.message : "Delete failed");
      }
    },
    [optimisticDelete, revertDelete]
  );

  const prependChat = useCallback((chat: ChatListItem) => {
    setChats((prev) => [chat, ...prev.filter((c) => c.id !== chat.id)]);
  }, []);

  return {
    chats,
    setChats,
    activeChatId,
    activeChat,
    optimisticRename,
    revertRename,
    optimisticDelete,
    revertDelete,
    commitRename,
    commitDelete,
    prependChat,
  };
}
