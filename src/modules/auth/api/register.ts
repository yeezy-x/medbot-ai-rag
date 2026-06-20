import { apiClient }
from "@/lib/api-client";

export async function registerUser(
  data: {
    name: string;
    email: string;
    password: string;
  }
) {
  return apiClient(
    "/api/auth/register",
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