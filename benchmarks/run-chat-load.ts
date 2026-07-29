/**
 * Authenticated API load (list + create chats) using fetch — same auth as perf:smoke.
 * Use when k6 login is flaky; complements autocannon health load.
 */
import "dotenv/config";

const baseUrl = (process.env.BASE_URL ?? "http://127.0.0.1:3000").replace(
  /\/$/,
  ""
);
const email = process.env.LOAD_TEST_EMAIL ?? "admin@medbot.com";
const password = process.env.LOAD_TEST_PASSWORD ?? "password123";
const durationSec = Number(process.env.LOAD_DURATION_SEC ?? 15);
const concurrency = Number(process.env.LOAD_CONNECTIONS ?? 5);

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
    throw new Error(`Login failed (${loginRes.status})`);
  }
  return cookie;
}

async function oneIteration(cookie: string): Promise<number> {
  const start = performance.now();
  const list = await fetch(`${baseUrl}/api/chats`, {
    headers: { Cookie: cookie },
  });
  if (!list.ok) throw new Error(`list ${list.status}`);
  await fetch(`${baseUrl}/api/chats`, {
    method: "POST",
    headers: {
      Cookie: cookie,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title: `load ${Date.now()}` }),
  });
  return performance.now() - start;
}

async function main(): Promise<void> {
  console.log("\n========== CHAT API LOAD (fetch) ==========\n");
  console.log({ baseUrl, durationSec, concurrency });

  const cookie = await login();
  const samples: number[] = [];
  const end = Date.now() + durationSec * 1000;

  while (Date.now() < end) {
    const batch = Array.from({ length: concurrency }, () =>
      oneIteration(cookie).catch((e) => {
        console.error(e);
        return -1;
      })
    );
    const results = await Promise.all(batch);
    for (const ms of results) {
      if (ms >= 0) samples.push(ms);
    }
  }

  samples.sort((a, b) => a - b);
  const p = (pct: number) =>
    samples[Math.min(samples.length - 1, Math.ceil((pct / 100) * samples.length) - 1)] ?? 0;

  console.table({
    iterations: samples.length,
    meanMs: samples.length
      ? Math.round(samples.reduce((a, b) => a + b, 0) / samples.length)
      : 0,
    p50Ms: Math.round(p(50)),
    p95Ms: Math.round(p(95)),
  });
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
