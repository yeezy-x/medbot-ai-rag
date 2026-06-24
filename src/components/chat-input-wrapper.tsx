// src/modules/chat/components/chat-input-wrapper.tsx
"use client";

import { useRouter } from "next/navigation";
import { sendMessage } from "@/modules/chat/api/chat.api";
import { MessageInput } from "./message-input";

interface ChatInputWrapperProps {
  sessionId: string;
}

export function ChatInputWrapper({ sessionId }: ChatInputWrapperProps) {
  const router = useRouter();

  async function handleSend(message: string) {
    await sendMessage(sessionId, message);
    router.refresh(); // Re-fetch messages from server
  }

  return <MessageInput onSend={handleSend} />;
}