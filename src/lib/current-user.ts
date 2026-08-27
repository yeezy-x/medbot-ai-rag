import { auth } from "@clerk/nextjs/server";

import { clerkUserService } from "@/modules/user/services/clerk-user.service";

export async function getCurrentUser() {
  const { isAuthenticated, userId } = await auth();
  if (!isAuthenticated || !userId) {
    return null;
  }
  try {
    return clerkUserService.getOrCreateForClerkId(userId);
  } catch {
    return null;
  }
}
