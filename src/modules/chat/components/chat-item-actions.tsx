"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteChat, renameChat } from "@/modules/chat/api/chat.api";
import { RenameChatDialog } from "./rename-chat-dialog";
import { cn } from "@/lib/utils";

interface ChatItemActionsProps {
  chatId: string;
  currentTitle: string;
  onOptimisticRename: (chatId: string, newTitle: string) => void;
  onOptimisticDelete: (chatId: string) => void;
  onRevertRename: (chatId: string, previousTitle: string) => void;
  onRevertDelete: (chatId: string) => void;
}

/**
 * "…" menu on each sidebar chat item. Rename opens a dialog, delete does an
 * optimistic remove + sonner undo toast. On error we roll back and toast an
 * error.
 */
export function ChatItemActions({
  chatId,
  currentTitle,
  onOptimisticRename,
  onOptimisticDelete,
  onRevertRename,
  onRevertDelete,
}: ChatItemActionsProps) {
  const [renameOpen, setRenameOpen] = useState(false);

  async function handleRename(next: string) {
    const previous = currentTitle;
    onOptimisticRename(chatId, next);
    try {
      await renameChat(chatId, next);
      toast.success("Renamed");
    } catch (err) {
      onRevertRename(chatId, previous);
      toast.error(err instanceof Error ? err.message : "Rename failed");
    }
  }

  async function handleDelete() {
    onOptimisticDelete(chatId);
    try {
      await deleteChat(chatId);
      toast.success("Conversation deleted");
    } catch (err) {
      onRevertDelete(chatId);
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            onClick={(e) => e.preventDefault()}
            aria-label="Chat options"
            data-testid={`sidebar-chat-actions-${chatId}`}
            className={cn(
              "invisible ml-auto flex size-6 shrink-0 items-center justify-center rounded-md",
              "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
              "focus-visible:visible group-hover:visible aria-expanded:visible"
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
            data-testid={`sidebar-chat-rename-${chatId}`}
          >
            <Pencil className="size-3.5" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-destructive focus:text-destructive"
            data-testid={`sidebar-chat-delete-${chatId}`}
          >
            <Trash2 className="size-3.5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RenameChatDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        initialTitle={currentTitle}
        onSubmit={handleRename}
      />
    </>
  );
}
