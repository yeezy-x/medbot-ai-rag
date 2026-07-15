// src/modules/chat/api/chat.api.ts
import { apiClient } from "@/lib/api-client";
import type { SuccessResponse } from "@/types/api.types";
import type { ChatSession, Message } from "@/generated/client";

export async function getChats(): Promise<SuccessResponse<ChatSession[]>> {
  return apiClient<SuccessResponse<ChatSession[]>>("/api/chats");
}

export async function createChat(title: string): Promise<SuccessResponse<ChatSession>> {
  return apiClient<SuccessResponse<ChatSession>>("/api/chats", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });
}

export async function sendMessage(
  sessionId: string,
  message: string
): Promise<SuccessResponse<Message>> {
  return apiClient<SuccessResponse<Message>>(`/api/chats/${sessionId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sessionId, message }),
  });
}

export async function deleteChat(chatId: string): Promise<SuccessResponse<{ deleted: boolean }>> {
  return apiClient<SuccessResponse<{ deleted: boolean }>>(`/api/chats/${chatId}`, {
    method: "DELETE",
  });
}