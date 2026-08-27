import { describe, expect, it } from "vitest";

import { roleHasPermission } from "@/modules/auth/constants/permissions";

describe("permissions", () => {
  it("grants admin all key permissions", () => {
    expect(roleHasPermission("ADMIN", "admin:access")).toBe(true);
    expect(roleHasPermission("USER", "admin:access")).toBe(false);
    expect(roleHasPermission("RESEARCHER", "knowledge:ingest")).toBe(true);
    expect(roleHasPermission("DOCTOR", "metrics:view")).toBe(true);
  });
});
