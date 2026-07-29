"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquarePlus,
  MessageSquareText,
  Settings,
  History,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { useChatListContext } from "@/modules/chat/context/chat-list-context";
import { usePromptHistory } from "@/hooks/use-prompt-history";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

export function CommandPalette({
  open,
  onOpenChange,
}: CommandPaletteProps) {
  const router = useRouter();
  const { chats } = useChatListContext();
  const { history, clear } = usePromptHistory();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chats.slice(0, 8);
    return chats.filter((c) => c.title.toLowerCase().includes(q)).slice(0, 12);
  }, [chats, query]);

  function go(path: string) {
    onOpenChange(false);
    setQuery("");
    router.push(path);
  }

  function usePrompt(prompt: string) {
    onOpenChange(false);
    setQuery("");
    window.dispatchEvent(new CustomEvent("medbot:suggest", { detail: prompt }));
    window.dispatchEvent(new CustomEvent("medbot:focus-composer"));
  }

  const filteredHistory = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return history.slice(0, 6);
    return history.filter((p) => p.toLowerCase().includes(q)).slice(0, 8);
  }, [history, query]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="top"
        className="mx-auto mt-[12vh] max-h-[70vh] w-full max-w-lg overflow-hidden rounded-xl border border-border-subtle bg-surface-3 p-0"
        data-testid="command-palette"
      >
        <SheetTitle className="sr-only">Command palette</SheetTitle>
        <div className="border-b border-border-subtle p-3">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats or jump to…"
            autoFocus
            className="h-10 border-0 bg-transparent shadow-none focus-visible:ring-0"
            data-testid="command-palette-input"
          />
          <p className="mt-2 flex items-center gap-1 text-[0.65rem] text-muted-foreground">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            navigate · <Kbd>Esc</Kbd> close · <Kbd>⌘</Kbd>
            <Kbd>/</Kbd> focus composer
          </p>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          <p className="px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
            Go to
          </p>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[0.85rem] hover:bg-muted"
            onClick={() => go("/chat")}
            data-testid="command-palette-new-chat"
          >
            <MessageSquarePlus className="size-4 text-brand" />
            New conversation
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[0.85rem] hover:bg-muted"
            onClick={() => go("/dashboard")}
          >
            <LayoutDashboard className="size-4" />
            Dashboard
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[0.85rem] hover:bg-muted"
            onClick={() => go("/settings")}
          >
            <Settings className="size-4" />
            Settings
          </button>
          {filteredHistory.length > 0 && (
            <>
              <div className="mt-2 flex items-center justify-between px-2 py-1">
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                  Recent prompts
                </p>
                <button
                  type="button"
                  className="text-[0.65rem] text-muted-foreground hover:text-foreground"
                  onClick={() => clear()}
                  data-testid="command-palette-clear-history"
                >
                  Clear
                </button>
              </div>
              {filteredHistory.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-[0.85rem] hover:bg-muted"
                  onClick={() => usePrompt(prompt)}
                  data-testid="command-palette-prompt-item"
                >
                  <History className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span className="line-clamp-2">{prompt}</span>
                </button>
              ))}
            </>
          )}
          {filtered.length > 0 && (
            <>
              <p className="mt-2 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                Chats
              </p>
              {filtered.map((chat) => (
                <button
                  key={chat.id}
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[0.85rem] hover:bg-muted"
                  onClick={() => go(`/chat/${chat.id}`)}
                  data-testid={`command-palette-chat-${chat.id}`}
                >
                  <MessageSquareText className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{chat.title || "Untitled"}</span>
                </button>
              ))}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
