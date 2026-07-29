"use client";

import { useCallback, useState } from "react";
import {
  MoreHorizontal,
  Pencil,
  Share2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { IconButton } from "@/components/ui/icon-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RenameChatDialog } from "./rename-chat-dialog";
import type { ChatListItem } from "@/modules/chat/hooks/use-chat-list";

interface ChatHeaderTitleProps {
  activeChat: ChatListItem;
  onRename: (chatId: string, title: string, previous: string) => Promise<void>;
  onDelete: (chatId: string, snapshot: ChatListItem) => Promise<void>;
}

export function ChatHeaderTitle({
  activeChat,
  onRename,
  onDelete,
}: ChatHeaderTitleProps) {
  const [renameOpen, setRenameOpen] = useState(false);

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy link");
    }
  }, []);

  return (
    <>
      <div className="flex min-w-0 flex-1 items-center gap-1">
        <button
          type="button"
          className="min-w-0 truncate text-left text-[0.85rem] font-semibold text-foreground hover:text-brand transition-colors"
          title="Double-click to rename"
          onDoubleClick={() => setRenameOpen(true)}
          data-testid="chat-header-title"
        >
          {activeChat.title || "Untitled"}
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <IconButton
              size="sm"
              label="Conversation actions"
              className="shrink-0"
              data-testid="chat-header-actions-trigger"
            >
              <MoreHorizontal />
            </IconButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            <DropdownMenuItem
              onClick={() => setRenameOpen(true)}
              data-testid="chat-header-rename"
            >
              <Pencil className="size-3.5" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleShare} data-testid="chat-header-share">
              <Share2 className="size-3.5" />
              Copy link
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => void onDelete(activeChat.id, activeChat)}
              data-testid="chat-header-delete"
            >
              <Trash2 className="size-3.5" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <RenameChatDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        initialTitle={activeChat.title}
        onSubmit={(next) =>
          void onRename(activeChat.id, next, activeChat.title)
        }
      />
    </>
  );
}
