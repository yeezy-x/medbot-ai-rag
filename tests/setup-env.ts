import "dotenv/config";

if (!process.env.AUTH_SECRET) {
  process.env.AUTH_SECRET = "test-auth-secret-for-vitest-only-32chars";
}
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    "postgresql://test:test@localhost:5432/medbot_test";
}
