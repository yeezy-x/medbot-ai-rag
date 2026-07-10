import { auth } from "@/auth";
import { AuthError } from "./errors/auth-error";
import { redirect } from "next/navigation";

export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    //safely redirect to login page if user is not authenticated
    redirect("/login");
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