"use client";

import { Download, FileText, Share2 } from "lucide-react";
import { toast } from "sonner";

import { IconButton } from "@/components/ui/icon-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Message } from "@/modules/chat/types/chat.types";
import {
  conversationToMarkdown,
  downloadMarkdown,
} from "@/modules/chat/lib/export-conversation";

interface ExportMenuProps {
  title: string;
  messages: Message[];
  disabled?: boolean;
}

export function ExportMenu({ title, messages, disabled }: ExportMenuProps) {
  const markdown = conversationToMarkdown(title, messages);

  async function copyTranscript() {
    try {
      await navigator.clipboard.writeText(markdown);
      toast.success("Transcript copied");
    } catch {
      toast.error("Couldn't copy transcript");
    }
  }

  function exportFile() {
    try {
      const slug = (title || "chat").replace(/[^\w-]+/g, "-").slice(0, 40);
      downloadMarkdown(`medbot-${slug}.md`, markdown);
      toast.success("Exported markdown");
    } catch {
      toast.error("Couldn't export");
    }
  }

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: title || "MedBot chat",
          text: "Medical Q&A with citations",
          url,
        });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      toast.error("Couldn't share");
    }
  }

  if (messages.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton
          size="sm"
          label="Export conversation"
          disabled={disabled}
          data-testid="export-menu-trigger"
        >
          <Download />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => void copyTranscript()} data-testid="export-copy-transcript">
          <FileText className="size-3.5" />
          Copy transcript
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportFile} data-testid="export-download-md">
          <Download className="size-3.5" />
          Download markdown
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void share()} data-testid="export-share">
          <Share2 className="size-3.5" />
          Share link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
