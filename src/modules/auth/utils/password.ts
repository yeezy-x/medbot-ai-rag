import * as argon2 from "argon2";
import bcrypt from "bcrypt";

const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const;

function isBcryptHash(hash: string): boolean {
  return (
    hash.startsWith("$2a$") ||
    hash.startsWith("$2b$") ||
    hash.startsWith("$2y$")
  );
}

function isArgon2Hash(hash: string): boolean {
  return hash.startsWith("$argon2");
}

/** Hash a password with Argon2id (new passwords). */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, ARGON2_OPTIONS);
}

/**
 * Verify password against Argon2id or legacy bcrypt.
 * Returns whether valid, and whether the hash should be upgraded.
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<{ valid: boolean; needsRehash: boolean }> {
  if (isArgon2Hash(hash)) {
    const valid = await argon2.verify(hash, password);
    return { valid, needsRehash: false };
  }

  if (isBcryptHash(hash)) {
    const valid = await bcrypt.compare(password, hash);
    return { valid, needsRehash: valid };
  }

  return { valid: false, needsRehash: false };
}

/** @deprecated Use verifyPassword — kept for call sites during migration. */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  const { valid } = await verifyPassword(password, hash);
  return valid;
}
