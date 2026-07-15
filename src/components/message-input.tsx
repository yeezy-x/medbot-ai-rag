// src/modules/chat/components/message-input.tsx
"use client";

import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  onSend(message: string): Promise<void>;
}

export function MessageInput({ onSend }: Props) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  async function submit() {
    const trimmed = message.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    try {
      await onSend(trimmed);
      setMessage("");
    } finally {
      setIsSending(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
  <div className="border-t bg-background p-4">
    <div
      className="
      mx-auto
      flex
      max-w-4xl
      items-end
      gap-3
      rounded-2xl
      border
      p-3
      shadow-sm
      "
    >
      <Textarea
        value={message}
        onChange={(e) =>
          setMessage(e.target.value)
        }
        onKeyDown={handleKeyDown}
        placeholder="Ask a medical question..."
        disabled={isSending}
        className="
          border-0
          shadow-none
          resize-none
          focus-visible:ring-0
          min-h-12
          max-h-40
        "
        rows={1}
      />

      <Button
        onClick={submit}
        disabled={
          !message.trim() ||
          isSending
        }
        size="icon"
      >
        ↑
      </Button>
    </div>
  </div>
);
}