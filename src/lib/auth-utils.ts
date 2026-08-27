import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { AuthError } from "./errors/auth-error";
import { ForbiddenError } from "./errors/forbidden-error";
import type { UserRole } from "@/types/auth.types";
import {
  roleHasPermission,
  type Permission,
} from "@/modules/auth/constants/permissions";
import { clerkUserService } from "@/modules/user/services/clerk-user.service";

export type SessionUser = {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  role: UserRole;
  image: string | null;
};

function toSessionUser(user: {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  role: UserRole;
  image?: string | null;
}): SessionUser {
  return {
    id: user.id,
    clerkId: user.clerkId,
    email: user.email,
    name: user.name,
    role: user.role,
    image: user.image ?? null,
  };
}

async function resolveLocalUser() {
  const { isAuthenticated, userId } = await auth();
  if (!isAuthenticated || !userId) {
    return null;
  }
  const user = await clerkUserService.getOrCreateForClerkId(userId);
  return toSessionUser(user);
}

/** Page-level gate: redirects to /sign-in when unauthenticated. */
export async function requireUser(): Promise<SessionUser> {
  const user = await resolveLocalUser();
  if (!user) {
    redirect("/sign-in");
  }
  return user;
}

export async function requirePageUser(): Promise<SessionUser> {
  return requireUser();
}

/** API-level gate: throws AuthError (401) — never redirects. */
export async function requireApiUser(): Promise<SessionUser> {
  const user = await resolveLocalUser();
  if (!user) {
    throw new AuthError("Sign in required.");
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== "ADMIN") {
    throw new ForbiddenError("Requires ADMIN role");
  }
  return user;
}

export async function requireApiAdmin(): Promise<SessionUser> {
  const user = await requireApiUser();
  if (user.role !== "ADMIN") {
    throw new ForbiddenError("Requires ADMIN role");
  }
  return user;
}

export async function requireRole(role: UserRole): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== role && user.role !== "ADMIN") {
    throw new ForbiddenError(`Requires ${role} role`);
  }
  return user;
}

export async function requirePermission(
  permission: Permission
): Promise<SessionUser> {
  const user = await requireUser();
  if (!roleHasPermission(user.role, permission)) {
    throw new ForbiddenError("Insufficient permissions");
  }
  return user;
}

export async function requireApiPermission(
  permission: Permission
): Promise<SessionUser> {
  const user = await requireApiUser();
  if (!roleHasPermission(user.role, permission)) {
    throw new ForbiddenError("Insufficient permissions");
  }
  return user;
}
