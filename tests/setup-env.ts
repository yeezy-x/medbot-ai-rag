import "dotenv/config";

if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "pk_test_placeholder";
}
if (!process.env.CLERK_SECRET_KEY) {
  process.env.CLERK_SECRET_KEY = "sk_test_placeholder";
}
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    "postgresql://test:test@localhost:5432/medbot_test";
}
