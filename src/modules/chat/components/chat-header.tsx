"use client";

import { Cpu, BookOpen, PanelLeft, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { IconButton } from "@/components/ui/icon-button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useChatListContext } from "@/modules/chat/context/chat-list-context";
import { MobileSidebar } from "./mobile-sidebar";
import { ChatHeaderTitle } from "./chat-header-title";

interface ChatHeaderProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  onOpenCommandPalette?: () => void;
}

export function ChatHeader({
  user,
  sidebarCollapsed,
  onToggleSidebar,
  onOpenCommandPalette,
}: ChatHeaderProps) {
  const { activeChat, commitRename, commitDelete } = useChatListContext();

  return (
    <TooltipProvider delayDuration={300}>
      <header
        className="flex h-12 items-center justify-between gap-3 border-b border-border-subtle px-3 sm:px-6"
        data-testid="chat-header"
        aria-label="Chat header"
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {sidebarCollapsed && onToggleSidebar ? (
            <IconButton
              size="sm"
              label="Open sidebar"
              onClick={onToggleSidebar}
              className="hidden md:inline-flex"
              data-testid="sidebar-expand-button"
            >
              <PanelLeft />
            </IconButton>
          ) : null}
          <MobileSidebar user={user} />

          {activeChat ? (
            <ChatHeaderTitle
              activeChat={activeChat}
              onRename={commitRename}
              onDelete={commitDelete}
            />
          ) : (
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-[0.85rem] font-semibold">MedBot</span>
              <span className="truncate text-[0.65rem] text-muted-foreground">
                Grounded medical assistant
              </span>
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {onOpenCommandPalette ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <IconButton
                  size="sm"
                  label="Command palette"
                  onClick={onOpenCommandPalette}
                  className="hidden sm:inline-flex"
                  data-testid="command-palette-trigger"
                >
                  <Search />
                </IconButton>
              </TooltipTrigger>
              <TooltipContent>Search chats (⌘K)</TooltipContent>
            </Tooltip>
          ) : null}
          <div className="hidden items-center gap-2 sm:flex">
            <ModelChip icon={<Cpu className="size-3" />} label="qwen2.5-coder" />
            <SourceChip icon={<BookOpen className="size-3" />} label="Gale Encyclopedia" />
            <Badge
              variant="outline"
              className="gap-1.5 font-normal"
              data-testid="chat-header-status"
            >
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60 motion-reduce:animate-none" />
                <span className="relative inline-flex size-1.5 rounded-full bg-brand" />
              </span>
              Online
            </Badge>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}

function ModelChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Badge variant="secondary" className="gap-1.5 font-mono font-normal">
      {icon}
      {label}
    </Badge>
  );
}

function SourceChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <Badge variant="secondary" className="gap-1.5 font-normal">
      {icon}
      {label}
    </Badge>
  );
}
