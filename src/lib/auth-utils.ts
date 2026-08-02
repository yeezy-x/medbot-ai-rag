import { cookies } from "next/headers";

import { auth } from "@/lib/auth";
import { AuthError } from "./errors/auth-error";
import { ForbiddenError } from "./errors/forbidden-error";
import { redirect } from "next/navigation";
import type { UserRole } from "@/types/auth.types";
import {
  roleHasPermission,
  type Permission,
} from "@/modules/auth/constants/permissions";
import { isStepUpFresh } from "@/modules/auth/services/step-up.service";
import { mfaService } from "@/modules/auth/services/mfa.service";
import { sessionService } from "@/modules/auth/services/session.service";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  mfaVerified: boolean;
  jti?: string;
  tokenVersion?: number;
  authTime?: number;
};

function toSessionUser(user: {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: UserRole;
  mfaVerified?: boolean;
  jti?: string;
  tokenVersion?: number;
  authTime?: number;
}): SessionUser {
  return {
    id: user.id,
    email: user.email ?? "",
    name: user.name ?? "",
    role: user.role ?? "USER",
    mfaVerified: user.mfaVerified ?? true,
    jti: user.jti,
    tokenVersion: user.tokenVersion,
    authTime: user.authTime,
  };
}

async function resolveMfaVerified(
  userId: string,
  mfaVerified: boolean | undefined
): Promise<boolean> {
  if (mfaVerified !== false) return true;
  try {
    const jar = await cookies();
    const trusted = jar.get("medbot.trusted_device")?.value;
    if (!trusted) return false;
    return mfaService.isTrustedDevice(userId, trusted);
  } catch {
    return false;
  }
}

/**
 * Optional session-registry check. Failures must not block login when the
 * JWT is otherwise valid (e.g. transient DB errors). Explicit revoke still
 * works via tokenVersion bump + sessions API.
 */
async function assertSessionNotRevoked(user: SessionUser): Promise<void> {
  if (!user.jti) return;
  try {
    const active = await sessionService.isJtiActive(
      user.jti,
      user.id,
      user.tokenVersion
    );
    if (!active) {
      throw new AuthError("Session expired or revoked");
    }
  } catch (error) {
    if (error instanceof AuthError) throw error;
    // Ignore transient registry errors — JWT remains authoritative.
  }
}

/** Page-level gate: redirects to /login when unauthenticated. */
export async function requireUser(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const mfaOk = await resolveMfaVerified(
    session.user.id,
    session.user.mfaVerified
  );
  if (!mfaOk) {
    redirect("/login/mfa");
  }
  return toSessionUser({ ...session.user, mfaVerified: true });
}

export async function requirePageUser(): Promise<SessionUser> {
  return requireUser();
}

export async function requireSession() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AuthError();
  }
  const mfaOk = await resolveMfaVerified(
    session.user.id,
    session.user.mfaVerified
  );
  if (!mfaOk) {
    throw new AuthError("MFA verification required");
  }
  return session;
}

/** API-level gate: throws AuthError (401) — never redirects. */
export async function requireApiUser(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AuthError("Sign in required.");
  }
  const user = toSessionUser(session.user);
  await assertSessionNotRevoked(user);
  const mfaOk = await resolveMfaVerified(user.id, user.mfaVerified);
  if (!mfaOk) {
    throw new AuthError("MFA verification required");
  }
  return { ...user, mfaVerified: true };
}

/** Page helper that requires ADMIN (redirects if unauthenticated). */
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

export async function requireStepUp(): Promise<SessionUser> {
  const user = await requireApiUser();
  if (!isStepUpFresh(user.authTime)) {
    throw new ForbiddenError("Re-authentication required");
  }
  return user;
}
