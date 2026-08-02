import http from "k6/http";
import { check, sleep } from "k6";
import { Trend } from "k6/metrics";
import { jsonHeaders, loginSessionCookie } from "./lib/auth.js";

const baseUrl = __ENV.BASE_URL || "http://127.0.0.1:3000";
const email =
  __ENV.LOAD_TEST_EMAIL || "admin@medbot.com";
const password =
  __ENV.LOAD_TEST_PASSWORD || "password123";

const streamTtfb = new Trend("stream_time_to_first_byte_ms", true);

export const options = {
  setupTimeout: "180s",
  vus: Number(__ENV.LOAD_VUS || 2),
  duration: __ENV.LOAD_DURATION || "60s",
  thresholds: {
    http_req_failed: ["rate<0.1"],
    stream_time_to_first_byte_ms: [
      `p(95)<${Number(__ENV.SLO_STREAM_TTFB_MS || 5000)}`,
    ],
  },
};

export function setup() {
  const cookie = loginSessionCookie(baseUrl, email, password);
  if (!cookie) {
    throw new Error("Login failed for stream load test");
  }

  const params = jsonHeaders(cookie);
  const createRes = http.post(
    `${baseUrl}/api/chats`,
    JSON.stringify({ title: "k6 stream load" }),
    params
  );

  check(createRes, {
    "setup create chat": (r) => r.status === 200,
  });

  const chatId = createRes.json("data.id");
  if (!chatId) {
    throw new Error("Could not create chat for stream load");
  }

  return { cookie, chatId };
}

export default function streamLoad(data) {
  const params = {
    ...jsonHeaders(data.cookie),
    timeout: __ENV.STREAM_TIMEOUT || "120s",
    tags: { name: "stream" },
  };

  const body = JSON.stringify({
    sessionId: data.chatId,
    message: "What are common symptoms of diabetes?",
  });

  const res = http.post(
    `${baseUrl}/api/chats/${data.chatId}/messages/stream`,
    body,
    params
  );

  streamTtfb.add(res.timings.waiting);

  check(res, {
    "stream status 200": (r) => r.status === 200,
    "stream has SSE data": (r) =>
      typeof r.body === "string" && r.body.includes("data:"),
  });

  sleep(2);
}
