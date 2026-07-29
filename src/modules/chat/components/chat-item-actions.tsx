"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RenameChatDialog } from "./rename-chat-dialog";
import { cn } from "@/lib/utils";
import type { ChatListItem } from "@/modules/chat/hooks/use-chat-list";

interface ChatItemActionsProps {
  chat: ChatListItem;
  commitRename: (chatId: string, title: string, previous: string) => Promise<void>;
  commitDelete: (chatId: string, snapshot: ChatListItem) => Promise<void>;
}

export function ChatItemActions({
  chat,
  commitRename,
  commitDelete,
}: ChatItemActionsProps) {
  const [renameOpen, setRenameOpen] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            onClick={(e) => e.preventDefault()}
            aria-label="Chat options"
            data-testid={`sidebar-chat-actions-${chat.id}`}
            className={cn(
              "ml-auto flex size-6 shrink-0 items-center justify-center rounded-md",
              "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
              "max-md:visible md:invisible md:focus-visible:visible md:group-hover:visible md:aria-expanded:visible"
            )}
          >
            <MoreHorizontal className="size-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              setRenameOpen(true);
            }}
            data-testid={`sidebar-chat-rename-${chat.id}`}
          >
            <Pencil className="size-3.5" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => void commitDelete(chat.id, chat)}
            className="text-destructive focus:text-destructive"
            data-testid={`sidebar-chat-delete-${chat.id}`}
          >
            <Trash2 className="size-3.5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RenameChatDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        initialTitle={chat.title}
        onSubmit={(next) => void commitRename(chat.id, next, chat.title)}
      />
    </>
  );
}
