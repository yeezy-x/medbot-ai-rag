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
    <div className="border-t p-4 flex gap-3 items-end">
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask a medical question… (Enter to send, Shift+Enter for new line)"
        disabled={isSending}
        className="min-h-13 max-h-40 resize-none flex-1"
        rows={1}
      />
      <Button
        onClick={submit}
        disabled={!message.trim() || isSending}
        className="shrink-0"
      >
        {isSending ? "Sending…" : "Send"}
      </Button>
    </div>
  );
}