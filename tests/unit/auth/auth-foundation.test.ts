import { describe, expect, it } from "vitest";

import {
  hashPassword,
  verifyPassword,
} from "@/modules/auth/utils/password";
import {
  generateRawToken,
  hashToken,
  hashTokenMatches,
  safeEqual,
} from "@/modules/auth/utils/tokens";
import { encryptSecret, decryptSecret } from "@/modules/auth/utils/crypto";
import {
  passwordStrength,
  passwordSchema,
} from "@/modules/auth/schemas/auth.schema";
import {
  roleHasPermission,
} from "@/modules/auth/constants/permissions";
import { parseDeviceLabel } from "@/modules/auth/utils/device";

describe("password hashing", () => {
  it("hashes and verifies with argon2id", async () => {
    const hash = await hashPassword("SecurePass1");
    expect(hash.startsWith("$argon2")).toBe(true);
    const result = await verifyPassword("SecurePass1", hash);
    expect(result.valid).toBe(true);
    expect(result.needsRehash).toBe(false);
  });

  it("rejects wrong password", async () => {
    const hash = await hashPassword("SecurePass1");
    const result = await verifyPassword("WrongPass1", hash);
    expect(result.valid).toBe(false);
  });
});

describe("tokens", () => {
  it("hashes and matches tokens timing-safe", () => {
    const raw = generateRawToken();
    const digest = hashToken(raw);
    expect(hashTokenMatches(raw, digest)).toBe(true);
    expect(hashTokenMatches("nope", digest)).toBe(false);
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
  });
});

describe("crypto", () => {
  it("encrypts and decrypts MFA secrets", () => {
    process.env.AUTH_SECRET =
      process.env.AUTH_SECRET || "test-secret-for-unit-tests-only-32";
    const plain = "JBSWY3DPEHPK3PXP";
    const enc = encryptSecret(plain);
    expect(enc).not.toContain(plain);
    expect(decryptSecret(enc)).toBe(plain);
  });
});

describe("password policy", () => {
  it("scores strength", () => {
    expect(passwordStrength("a").score).toBeLessThan(2);
    expect(passwordStrength("SecurePass1!").score).toBeGreaterThanOrEqual(3);
  });

  it("validates password schema", () => {
    expect(passwordSchema.safeParse("short").success).toBe(false);
    expect(passwordSchema.safeParse("SecurePass1").success).toBe(true);
  });
});

describe("permissions", () => {
  it("grants admin all key permissions", () => {
    expect(roleHasPermission("ADMIN", "admin:access")).toBe(true);
    expect(roleHasPermission("USER", "admin:access")).toBe(false);
    expect(roleHasPermission("RESEARCHER", "knowledge:ingest")).toBe(true);
    expect(roleHasPermission("DOCTOR", "metrics:view")).toBe(true);
  });
});

describe("device label", () => {
  it("parses common user agents", () => {
    expect(
      parseDeviceLabel(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0"
      )
    ).toContain("Chrome");
    expect(parseDeviceLabel(null)).toBe("Unknown device");
  });
});
