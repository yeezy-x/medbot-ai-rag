import type { UserRole } from "@/types/auth.types";

export type Permission =
  | "chat:use"
  | "knowledge:ingest"
  | "knowledge:read"
  | "admin:access"
  | "metrics:view"
  | "account:manage"
  | "sessions:manage";

const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  USER: ["chat:use", "knowledge:read", "account:manage", "sessions:manage"],
  DOCTOR: [
    "chat:use",
    "knowledge:read",
    "metrics:view",
    "account:manage",
    "sessions:manage",
  ],
  RESEARCHER: [
    "chat:use",
    "knowledge:read",
    "knowledge:ingest",
    "metrics:view",
    "account:manage",
    "sessions:manage",
  ],
  ADMIN: [
    "chat:use",
    "knowledge:read",
    "knowledge:ingest",
    "admin:access",
    "metrics:view",
    "account:manage",
    "sessions:manage",
  ],
};

export function roleHasPermission(
  role: UserRole,
  permission: Permission
): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function permissionsForRole(role: UserRole): readonly Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
