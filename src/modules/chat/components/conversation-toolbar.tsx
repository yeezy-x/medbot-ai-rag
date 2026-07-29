"use client";

import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ExportMenu } from "@/modules/chat/components/export-menu";
import type { Message } from "@/modules/chat/types/chat.types";

interface ConversationToolbarProps {
  title: string;
  messages: Message[];
  streaming?: boolean;
  onEditLastPrompt?: () => void;
  canEditLastPrompt?: boolean;
}

export function ConversationToolbar({
  title,
  messages,
  streaming,
  onEditLastPrompt,
  canEditLastPrompt,
}: ConversationToolbarProps) {
  if (messages.length === 0 && !canEditLastPrompt) return null;

  return (
    <div
      className="flex items-center justify-end gap-2 border-b border-border-subtle bg-surface-2/40 px-4 py-1.5 sm:px-6"
      data-testid="conversation-toolbar"
    >
      {canEditLastPrompt && onEditLastPrompt ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-[0.78rem]"
          disabled={streaming}
          onClick={onEditLastPrompt}
          data-testid="edit-last-prompt-button"
        >
          <Pencil className="size-3.5" />
          Edit last question
        </Button>
      ) : null}
      <ExportMenu title={title} messages={messages} disabled={streaming} />
    </div>
  );
}
