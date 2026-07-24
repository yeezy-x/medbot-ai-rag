import { apiClient } from "@/lib/api-client";
import type { SuccessResponse } from "@/types/api.types";
import type { ChatSession } from "@/generated/client";
import type { SendMessageResponse } from "@/modules/chat/types/chat.types";

export async function getChats(): Promise<SuccessResponse<ChatSession[]>> {
  return apiClient<SuccessResponse<ChatSession[]>>("/api/chats");
}

export async function createChat(
  title: string
): Promise<SuccessResponse<ChatSession>> {
  return apiClient<SuccessResponse<ChatSession>>("/api/chats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
}

export async function renameChat(
  chatId: string,
  title: string
): Promise<SuccessResponse<ChatSession>> {
  return apiClient<SuccessResponse<ChatSession>>(`/api/chats/${chatId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
}

export async function sendMessage(
  sessionId: string,
  message: string
): Promise<SuccessResponse<SendMessageResponse>> {
  return apiClient<SuccessResponse<SendMessageResponse>>(
    `/api/chats/${sessionId}/messages`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, message }),
    }
  );
}

export async function deleteChat(
  chatId: string
): Promise<SuccessResponse<{ deleted: boolean }>> {
  return apiClient<SuccessResponse<{ deleted: boolean }>>(`/api/chats/${chatId}`, {
    method: "DELETE",
  });
}
