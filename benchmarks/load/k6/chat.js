import http from "k6/http";
import { check, sleep } from "k6";
import { jsonHeaders, loginSessionCookie } from "./lib/auth.js";

const baseUrl = __ENV.BASE_URL || "http://127.0.0.1:3000";
const email =
  __ENV.LOAD_TEST_EMAIL || "admin@medbot.com";
const password =
  __ENV.LOAD_TEST_PASSWORD || "password123";

export const options = {
  setupTimeout: "120s",
  vus: Number(__ENV.LOAD_VUS || 5),
  duration: __ENV.LOAD_DURATION || "30s",
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: [
      `p(95)<${Number(__ENV.SLO_API_P95_MS || 500)}`,
    ],
  },
};

export function setup() {
  const cookie = loginSessionCookie(baseUrl, email, password);
  if (!cookie) {
    throw new Error(
      "Login failed — set CLERK_SESSION_COOKIE to a signed-in Clerk cookie string"
    );
  }
  return { cookie };
}

export default function chatLoad(data) {
  const params = jsonHeaders(data.cookie);

  const listRes = http.get(`${baseUrl}/api/chats`, params);
  check(listRes, {
    "list chats 200": (r) => r.status === 200,
  });

  const createRes = http.post(
    `${baseUrl}/api/chats`,
    JSON.stringify({ title: `k6 ${Date.now()}` }),
    params
  );
  check(createRes, {
    "create chat 201 or 200": (r) =>
      r.status === 200 || r.status === 201,
  });

  sleep(0.5);
}
