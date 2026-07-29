import http from "k6/http";
import { check } from "k6";

/**
 * NextAuth / Auth.js credentials login using a shared cookie jar.
 */
export function loginSessionCookie(baseUrl, email, password) {
  const jar = new http.CookieJar();

  const csrfRes = http.get(`${baseUrl}/api/auth/csrf`, { jar });
  check(csrfRes, {
    "csrf status 200": (r) => r.status === 200,
  });

  const csrfToken = csrfRes.json("csrfToken");
  const payload = {
    csrfToken,
    email,
    password,
    redirect: "false",
    callbackUrl: `${baseUrl}/dashboard`,
    json: "true",
  };

  const loginRes = http.post(
    `${baseUrl}/api/auth/callback/credentials`,
    payload,
    {
      jar,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  check(loginRes, {
    "login status 2xx": (r) => r.status >= 200 && r.status < 300,
  });

  const cookies = jar.cookiesForURL(baseUrl);
  const names = Object.keys(cookies);
  const sessionName = names.find((n) => n.includes("session-token"));
  if (!sessionName) {
    return "";
  }

  const entry = cookies[sessionName];
  const value = Array.isArray(entry) ? entry[0]?.value : entry?.value;
  if (!value) {
    return "";
  }

  return `${sessionName}=${value}`;
}

export function jsonHeaders(cookie) {
  const headers = { "Content-Type": "application/json" };
  if (cookie) {
    headers.Cookie = cookie;
  }
  return { headers };
}
