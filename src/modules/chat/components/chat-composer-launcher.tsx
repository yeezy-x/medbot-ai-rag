"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MessageInput } from "@/components/message-input";
import { createChat } from "@/modules/chat/api/chat.api";

/**
 * Launch composer shown on the /chat empty state. First send creates a chat
 * session, then redirects to /chat/:id where the streaming flow takes over.
 * The initial message is passed through the URL so the destination page can
 * kick off streaming immediately without a full round-trip.
 */
export function ChatComposerLauncher() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [, startTransition] = useTransition();

  async function handleSend(message: string) {
    setIsCreating(true);
    try {
      const title =
        message.length > 60 ? `${message.slice(0, 57)}…` : message;
      const chat = await createChat(title);
      const q = encodeURIComponent(message);
      startTransition(() => {
        router.push(`/chat/${chat.data.id}?q=${q}`);
        router.refresh();
      });
    } catch (err) {
      setIsCreating(false);
      toast.error(
        err instanceof Error ? err.message : "Couldn't start conversation."
      );
    }
  }

  return <MessageInput onSend={handleSend} isStreaming={isCreating} />;
}
