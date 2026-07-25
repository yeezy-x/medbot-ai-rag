"use client";

import { Cpu, BookOpen } from "lucide-react";

import { MobileSidebar } from "./mobile-sidebar";
import { Chat } from "../types/chat.types";

interface ChatHeaderProps {
  chats?: Chat[];
  user?: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

export function ChatHeader({ chats, user }: ChatHeaderProps) {
  return (
    <header
      className="flex h-12 items-center justify-between gap-3 border-b border-border-subtle px-3 sm:px-6"
      data-testid="chat-header"
    >
      <div className="flex min-w-0 items-center gap-2">
        {chats && user ? <MobileSidebar chats={chats} user={user} /> : null}
        <div className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-[0.85rem] font-semibold">MedBot</span>
          <span className="truncate text-[0.65rem] text-muted-foreground">
            Grounded medical assistant
          </span>
        </div>
      </div>

      <div className="hidden items-center gap-2 sm:flex">
        <ModelChip icon={<Cpu className="size-3" />} label="qwen2.5-coder" />
        <SourceChip icon={<BookOpen className="size-3" />} label="Gale Encyclopedia" />
        <div className="flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface-3 px-2 py-1 text-[0.7rem] text-muted-foreground">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
            <span className="relative inline-flex size-1.5 rounded-full bg-brand" />
          </span>
          Online
        </div>
      </div>
    </header>
  );
}

function ModelChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface-3 px-2 py-1 text-[0.7rem] text-muted-foreground">
      {icon}
      <span className="font-mono">{label}</span>
    </div>
  );
}

function SourceChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface-3 px-2 py-1 text-[0.7rem] text-muted-foreground">
      {icon}
      <span>{label}</span>
    </div>
  );
}