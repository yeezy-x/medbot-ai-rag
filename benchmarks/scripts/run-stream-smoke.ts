/**
 * Single-request smoke: login + list chats + one SSE stream (TTFB).
 * Use when k6 is not installed or for quick authenticated checks.
 */
import "dotenv/config";

const baseUrl = (process.env.BASE_URL ?? "http://127.0.0.1:3000").replace(
  /\/$/,
  ""
);
const email = process.env.LOAD_TEST_EMAIL ?? "admin@medbot.com";
const password = process.env.LOAD_TEST_PASSWORD ?? "password123";

function parseSetCookie(headers: Headers): string[] {
  const raw = headers.getSetCookie?.() ?? [];
  if (raw.length > 0) return raw;
  const single = headers.get("set-cookie");
  return single ? [single] : [];
}

function cookieHeaderFromResponses(responses: Response[]): string {
  const pairs: string[] = [];
  for (const res of responses) {
    for (const line of parseSetCookie(res.headers)) {
      const part = line.split(";")[0]?.trim();
      if (part) pairs.push(part);
    }
  }
  return pairs.join("; ");
}

async function login(): Promise<string> {
  const csrfRes = await fetch(`${baseUrl}/api/auth/csrf`);
  const { csrfToken } = (await csrfRes.json()) as { csrfToken: string };

  const body = new URLSearchParams({
    csrfToken,
    email,
    password,
    redirect: "false",
    callbackUrl: `${baseUrl}/dashboard`,
    json: "true",
  });

  const loginRes = await fetch(
    `${baseUrl}/api/auth/callback/credentials`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: cookieHeaderFromResponses([csrfRes]),
      },
      body,
      redirect: "manual",
    }
  );

  const cookie = cookieHeaderFromResponses([csrfRes, loginRes]);
  if (!cookie.includes("session-token")) {
    throw new Error(
      `Login failed (status ${loginRes.status}). Run npm run seed and ensure AUTH_SECRET is loaded (npm run dev).`
    );
  }
  return cookie;
}

async function main(): Promise<void> {
  console.log("\n========== AUTH + STREAM SMOKE ==========\n");
  console.log({ baseUrl, email });

  const cookie = await login();
  console.log("Login: OK");

  const listRes = await fetch(`${baseUrl}/api/chats`, {
    headers: { Cookie: cookie },
  });
  if (!listRes.ok) {
    throw new Error(`GET /api/chats failed: ${listRes.status}`);
  }
  console.log("GET /api/chats:", listRes.status);

  let chatId: string;
  const createRes = await fetch(`${baseUrl}/api/chats`, {
    method: "POST",
    headers: {
      Cookie: cookie,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title: "stream smoke test" }),
  });
  if (!createRes.ok) {
    throw new Error(`POST /api/chats failed: ${createRes.status}`);
  }
  const created = (await createRes.json()) as { data: { id: string } };
  chatId = created.data.id;
  console.log("Created chat:", chatId);

  const streamStart = performance.now();
  const streamRes = await fetch(
    `${baseUrl}/api/chats/${chatId}/messages/stream`,
    {
      method: "POST",
      headers: {
        Cookie: cookie,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionId: chatId,
        message: "What are common symptoms of diabetes?",
      }),
    }
  );

  if (!streamRes.ok || !streamRes.body) {
    throw new Error(`Stream failed: ${streamRes.status}`);
  }

  const reader = streamRes.body.getReader();
  const decoder = new TextDecoder();
  let firstByteMs: number | null = null;
  let doneEvent = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (firstByteMs === null) {
      firstByteMs = performance.now() - streamStart;
    }
    const text = decoder.decode(value, { stream: true });
    if (text.includes('"type":"done"')) {
      doneEvent = true;
    }
  }

  const totalMs = performance.now() - streamStart;
  console.log("\n--- Stream metrics ---");
  console.table({
    ttfbMs: firstByteMs ? Math.round(firstByteMs) : null,
    totalMs: Math.round(totalMs),
    sawDoneEvent: doneEvent,
  });

  const slo = Number(process.env.SLO_STREAM_TTFB_MS ?? 5000);
  if (firstByteMs !== null && firstByteMs > slo) {
    console.warn(`SLO miss: TTFB ${Math.round(firstByteMs)}ms > ${slo}ms`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
