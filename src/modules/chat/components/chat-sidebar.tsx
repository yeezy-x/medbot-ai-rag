"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Braces,
  LogOut,
  PanelLeft,
  PanelLeftClose,
  Plus,
  Search,
  Settings,
  Sparkles,
  MessageSquareText,
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createChat } from "@/modules/chat/api/chat.api";
import { groupByDate, initials, relativeTime } from "@/lib/format";
import { useDevMode } from "@/hooks/use-dev-mode";
import { useChatListContext } from "@/modules/chat/context/chat-list-context";
import { ChatItemActions } from "./chat-item-actions";
import { cn } from "@/lib/utils";

interface Chat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface SidebarProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

/**
 * Persistent desktop sidebar. Hidden below `md` — on smaller viewports,
 * `MobileSidebar` renders the same `SidebarContent` inside a Sheet drawer
 * instead. Keep all sidebar logic in `SidebarContent`; this is just the
 * desktop presentation wrapper.
 */
export function Sidebar({
  user,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "hidden md:flex shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground",
        "transition-[width] duration-200 ease-out motion-reduce:transition-none",
        collapsed ? "w-0 border-r-0" : "w-65"
      )}
      data-testid="chat-sidebar"
      data-collapsed={collapsed ? "true" : "false"}
      aria-hidden={collapsed}
    >
      <SidebarContent user={user} onToggleCollapse={onToggleCollapse} />
    </aside>
  );
}

export function SidebarContent({
  user,
  onNavigate,
  onToggleCollapse,
}: SidebarProps & { onNavigate?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    chats,
    prependChat,
    commitRename,
    commitDelete,
  } = useChatListContext();
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  const [creating, setCreating] = useState(false);
  const [devMode, setDevMode] = useDevMode();
  const { signOut } = useClerk();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chats;
    return chats.filter((c) => c.title.toLowerCase().includes(q));
  }, [chats, query]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  async function handleNewChat() {
    setCreating(true);
    try {
      const result = await createChat("New conversation");
      const newChat = result.data;
      const serialized: Chat = {
        id: newChat.id,
        title: newChat.title,
        createdAt: new Date(newChat.createdAt).toISOString(),
        updatedAt: new Date(newChat.updatedAt).toISOString(),
      };
      prependChat(serialized);
      startTransition(() => {
        router.push(`/chat/${newChat.id}`);
        router.refresh();
      });
      onNavigate?.();
    } catch {
      toast.error("Couldn't start a new conversation");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-2 px-4 py-3.5">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-brand text-brand-foreground shadow-sm">
          <Sparkles className="size-4" strokeWidth={2.2} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="text-[0.85rem] font-semibold tracking-tight">MedBot</span>
          <span className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">
            RAG · Gale Encyclopedia
          </span>
        </div>
        {onToggleCollapse ? (
          <IconButton
            size="sm"
            label="Collapse sidebar"
            onClick={onToggleCollapse}
            className="shrink-0 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            data-testid="sidebar-collapse-button"
          >
            <PanelLeftClose />
          </IconButton>
        ) : null}
      </div>

      {/* New chat */}
      <div className="px-3">
        <Button
          onClick={handleNewChat}
          disabled={creating || isPending}
          className="w-full justify-start gap-2 h-9 rounded-lg font-medium"
          data-testid="sidebar-new-chat-button"
        >
          <Plus className="size-4" />
          <span className="flex-1 text-left">New chat</span>
          <Kbd className="border-primary-foreground/20 bg-transparent text-primary-foreground/70">⌘</Kbd>
          <Kbd className="border-primary-foreground/20 bg-transparent text-primary-foreground/70">⏎</Kbd>
        </Button>
      </div>

      {/* Search */}
      <div className="relative px-3 pt-3">
        <Search className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search chats"
          aria-label="Search chats"
          className="h-8 bg-transparent pl-8 text-[0.8rem] border-border-subtle"
          data-testid="sidebar-search-input"
        />
      </div>

      {/* Groups */}
      <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="Recent chats">
        {grouped.length === 0 ? (
          <div className="px-3 py-6 text-center text-[0.8rem] text-muted-foreground">
            {query ? "No matches." : "No conversations yet."}
          </div>
        ) : (
          grouped.map((group) => (
            <div key={group.label} className="mb-3">
              <div className="px-2 pb-1 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </div>
              <ul className="space-y-0.5">
                {group.items.map((chat) => (
                  <ChatSidebarItem
                    key={chat.id}
                    chat={chat}
                    active={pathname === `/chat/${chat.id}`}
                    commitRename={commitRename}
                    commitDelete={commitDelete}
                    onNavigate={onNavigate}
                  />
                ))}
              </ul>
            </div>
          ))
        )}
      </nav>

      {/* User footer */}
      <div className="border-t border-sidebar-border p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5",
                "text-left hover:bg-sidebar-accent transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              )}
              data-testid="sidebar-user-menu-trigger"
            >
              <div
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full",
                  "bg-surface-3 text-[0.7rem] font-semibold text-foreground",
                  "border border-border-subtle"
                )}
              >
                {initials(user.name ?? user.email ?? "?")}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[0.8rem] font-medium">
                  {user.name ?? "User"}
                </div>
                <div className="truncate text-[0.7rem] text-muted-foreground">
                  {user.email}
                </div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-60">
            <DropdownMenuLabel className="text-[0.75rem]">
              Signed in as
              <div className="truncate text-[0.8rem] font-normal text-foreground">
                {user.email}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard">Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild onClick={onNavigate}>
              <Link href="/settings">
                <Settings className="size-3.5" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuCheckboxItem
              checked={devMode}
              onCheckedChange={(v) => {
                setDevMode(Boolean(v));
                toast.success(
                  v ? "Developer mode on" : "Developer mode off"
                );
              }}
              data-testid="sidebar-dev-mode-toggle"
            >
              <Braces className="size-3.5" />
              Developer mode
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => void signOut({ redirectUrl: "/" })}
              className="text-destructive focus:text-destructive"
              data-testid="sidebar-logout-button"
            >
              <LogOut className="size-3.5" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function ChatSidebarItem({
  chat,
  active,
  commitRename,
  commitDelete,
  onNavigate,
}: {
  chat: Chat;
  active: boolean;
  commitRename: (chatId: string, title: string, previous: string) => Promise<void>;
  commitDelete: (chatId: string, snapshot: Chat) => Promise<void>;
  onNavigate?: () => void;
}) {
  return (
    <li className="group flex items-center">
      <Link
        href={`/chat/${chat.id}`}
        title={chat.title}
        data-testid={`sidebar-chat-item-${chat.id}`}
        onClick={onNavigate}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-[0.8rem]",
          "text-sidebar-foreground/85 transition-colors",
          "hover:bg-sidebar-accent hover:text-sidebar-foreground",
          active && "bg-sidebar-accent text-sidebar-foreground font-medium"
        )}
      >
        <MessageSquareText
          className={cn(
            "size-3.5 shrink-0 text-muted-foreground",
            active && "text-brand"
          )}
        />
        <span className="min-w-0 flex-1 truncate">{chat.title || "Untitled"}</span>
        <span className="hidden shrink-0 text-[0.65rem] text-muted-foreground group-hover:hidden">
          {relativeTime(chat.updatedAt)}
        </span>
      </Link>
      <ChatItemActions
        chat={chat}
        commitRename={commitRename}
        commitDelete={commitDelete}
      />
    </li>
  );
}