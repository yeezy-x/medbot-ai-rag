import { apiClient } from "@/lib/api-client";

export async function getChats() {
  return apiClient(
    "/api/chats"
  );
}

export async function createChat(
  title: string
) {
  return apiClient(
    "/api/chats",
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",
      },

      body:
        JSON.stringify({
          title,
        }),
    }
  );
}