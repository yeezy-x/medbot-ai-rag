import { auth } from "@/auth";
import { AuthError } from "./errors/auth-error";

export async function requireUser() {
  const session = await auth();

  if (!session?.user) {
    throw new AuthError();
  }

  return session.user;
}

export async function requireSession() {
  const session = await auth();

  if (!session) {
    throw new AuthError();
  }

  return session;
}