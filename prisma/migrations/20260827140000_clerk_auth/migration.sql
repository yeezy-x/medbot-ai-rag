-- Drop Auth.js / custom-auth tables
DROP TABLE IF EXISTS "RecoveryCode" CASCADE;
DROP TABLE IF EXISTS "TrustedDevice" CASCADE;
DROP TABLE IF EXISTS "AuthToken" CASCADE;
DROP TABLE IF EXISTS "AuthSession" CASCADE;
DROP TABLE IF EXISTS "Account" CASCADE;
DROP TABLE IF EXISTS "Session" CASCADE;
DROP TABLE IF EXISTS "VerificationToken" CASCADE;

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "clerkId" TEXT;

UPDATE "User" SET "clerkId" = 'legacy_' || "id" WHERE "clerkId" IS NULL;

ALTER TABLE "User" ALTER COLUMN "clerkId" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "User_clerkId_key" ON "User"("clerkId");

ALTER TABLE "User"
  DROP COLUMN IF EXISTS "passwordHash",
  DROP COLUMN IF EXISTS "passwordChangedAt",
  DROP COLUMN IF EXISTS "mfaEnabled",
  DROP COLUMN IF EXISTS "mfaSecretEnc",
  DROP COLUMN IF EXISTS "failedLoginCount",
  DROP COLUMN IF EXISTS "lockedUntil",
  DROP COLUMN IF EXISTS "tokenVersion";

DROP TYPE IF EXISTS "AuthTokenType";
