import { apiClient }
from "@/lib/api-client";

export async function loginUser(
  data: {
    email: string;
    password: string;
  }
) {
  return apiClient(
    "/api/auth/login",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },

      body:
        JSON.stringify(data),
    }
  );
}