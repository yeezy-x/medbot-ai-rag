/**
 * NextAuth / Auth.js credentials login using a shared cookie jar.
 * Clerk: pass CLERK_SESSION_COOKIE (full Cookie header value) instead.
 */
export function loginSessionCookie(baseUrl, email, password) {
  const fromEnv = __ENV.CLERK_SESSION_COOKIE;
  if (fromEnv) {
    return fromEnv;
  }
  throw new Error(
    "Auth.js login was removed. Set CLERK_SESSION_COOKIE to a signed-in Clerk cookie string."
  );
}

export function jsonHeaders(cookie) {
  const headers = { "Content-Type": "application/json" };
  if (cookie) {
    headers.Cookie = cookie;
  }
  return { headers };
}
