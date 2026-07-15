import { auth } from "@/auth";
import { AuthError } from "./errors/auth-error";
import { redirect } from "next/navigation";

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

export async function requirePageUser() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return session?.user;
}