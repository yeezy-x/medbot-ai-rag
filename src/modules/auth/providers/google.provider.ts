import Google from "next-auth/providers/google";
import { env, hasGoogleAuth } from "@/config/env";

export function createGoogleProvider() {
  if (!hasGoogleAuth) return null;
  return Google({
    clientId: env.AUTH_GOOGLE_ID!,
    clientSecret: env.AUTH_GOOGLE_SECRET!,
    allowDangerousEmailAccountLinking: false,
  });
}
