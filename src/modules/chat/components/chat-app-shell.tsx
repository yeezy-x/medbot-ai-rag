"use client";

import { ReactNode } from "react";

import { ChatHeader } from "@/modules/chat/components/chat-header";
import { CommandPalette } from "@/modules/chat/components/command-palette";
import { Sidebar } from "@/modules/chat/components/chat-sidebar";
import {
  ChatListProvider,
  useChatListContext,
} from "@/modules/chat/context/chat-list-context";
import { useSidebarCollapsed } from "@/hooks/use-sidebar-collapsed";
import { useCommandPalette } from "@/hooks/use-command-palette";
import { useChatShortcuts } from "@/hooks/use-chat-shortcuts";

interface ChatAppShellProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  chats: {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
  }[];
  children: ReactNode;
}

function ChatAppShellInner({
  user,
  children,
}: {
  user: ChatAppShellProps["user"];
  children: ReactNode;
}) {
  const [sidebarCollapsed, toggleSidebar] = useSidebarCollapsed();
  const commandPalette = useCommandPalette();
  useChatShortcuts();
  const chatList = useChatListContext();

  return (
    <div className="flex h-dvh min-h-0 overflow-hidden bg-background">
      <Sidebar
        user={user}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <ChatHeader
          user={user}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={toggleSidebar}
          onOpenCommandPalette={commandPalette.openPalette}
        />
        <main className="flex min-h-0 flex-1 flex-col overflow-x-hidden" id="main-content">
          {children}
        </main>
      </div>

      <CommandPalette
        open={commandPalette.open}
        onOpenChange={commandPalette.setOpen}
        user={user}
      />
    </div>
  );
}

export function ChatAppShell({ user, chats, children }: ChatAppShellProps) {
  return (
    <ChatListProvider initialChats={chats}>
      <ChatAppShellInner user={user}>{children}</ChatAppShellInner>
    </ChatListProvider>
  );
}
