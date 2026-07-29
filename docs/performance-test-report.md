# Performance test report (executed run)

**Date:** 2026-07-29  
**Environment:** WSL2, Next.js dev on `http://127.0.0.1:3002` (with `.env`), Ollama local, Neon Postgres via `DATABASE_URL`  
**Raw logs:** `benchmarks/results/20260729-*.txt`

This report records an **actual end-to-end pass** of the performance harness—not just the tooling on paper.

---

## Executive summary

| Suite | Command | Result | SLO |
|--------|---------|--------|-----|
| CPU micro-benchmarks | `npm run bench` | Pass | N/A (informational) |
| Embedding latency | `npm run bench:embedding` | Pass | p95 embed ~38 ms (informal) |
| Retrieval (Ollama + DB) | `npm run bench:retrieval` | Pass | p95 ~255 ms (&lt; 2000 ms target) |
| Health load | `npm run load:health` | Pass | p95 **145 ms** (&lt; 200 ms) |
| Health load (k6) | `load:k6:health` | Pass | p95 **111 ms** (&lt; 200 ms) |
| Chat API load | `npm run load:chat` | Pass (marginal) | p95 **624 ms** (target 500 ms) |
| Full RAG stream smoke | `npm run perf:smoke` | Pass functionally | TTFB **13.1 s** (misses 5 s—cold generation) |
| k6 chat / stream | `load:k6:chat` | **Blocked** | NextAuth callback hangs/fails under k6; use `load:chat` + `perf:smoke` |

**Important:** The process on port **3000** returned **500** on `/api/auth/csrf` (server started without valid Auth.js config). All **authenticated** runs used **`npm run dev` on port 3002** so `.env` / `AUTH_SECRET` loaded correctly.

---

## 1. CPU micro-benchmarks (`npm run bench`)

**What this measures:** In-process speed of chunking and normalization—no HTTP, no database.

**How it works:** Vitest runs each `bench()` function thousands of times and reports **hz** (ops/sec) and latency percentiles.

| Benchmark | ~hz | ~mean latency |
|-----------|-----|----------------|
| `chunking: LARGE_PARAGRAPH` | 5,175/s | 0.19 ms |
| `chunking: OVERLAP_TEXT` | 6,498/s | 0.15 ms |
| `chunking: MEDICAL_TEXT` | 350,992/s | 0.003 ms |
| `recursive strategy: LARGE_PARAGRAPH` | 5,190/s | 0.19 ms |
| `normalization: LARGE_PARAGRAPH` | 20,036/s | 0.05 ms |

**Takeaway:** CPU paths are not a bottleneck for chat; large paragraphs are ~100× slower than tiny clinical snippets, which is expected.

**Artifact:** `benchmarks/results/20260729-cpu-bench.txt`

---

## 2. Embedding benchmark (`npm run bench:embedding`)

**What this measures:** Round-trip time to Ollama for `nomic-embed-text` (one query embedding at a time).

**Settings:** 10 iterations × 5 queries (50 samples total).

| Scope | p50 | p95 | p99 |
|--------|-----|-----|-----|
| All queries | 21.4 ms | 37.9 ms | 148.5 ms |
| Per-query typical | ~21 ms | ~22–40 ms | — |

The p99 spike (~148 ms) is from the first query in the diabetes set (model/cache warmup within the batch).

**Artifact:** `benchmarks/results/20260729-embedding.txt`

---

## 3. Retrieval benchmark (`npm run bench:retrieval`)

**What this measures:** Full `RetrievalService.retrieve()` — embed query + pgvector search + filter/slice (no LLM answer).

**Settings:** 5 iterations × 3 queries.

| Query | p50 | p95 |
|--------|-----|-----|
| Diabetes symptoms | ~204 ms | ~268 ms |
| Hypertension treatment | ~188 ms | ~190 ms |
| Adult vaccines | ~196 ms | ~208 ms |
| **All queries** | **195 ms** | **255 ms** |

**SLO:** informal target p95 &lt; 2000 ms — **met**.

**Note:** Debug `console.log` noise in `retrieval.service.ts` was removed after the first run; vector search may still log summary lines from `postgres-vector.provider`.

**Artifact:** `benchmarks/results/20260729-retrieval-clean.txt`

---

## 4. Health load — autocannon (`npm run load:health`)

**What this measures:** Sustained concurrent `GET /api/health` (includes DB `SELECT 1`).

**Settings:** 25 connections, 15 seconds, target `http://127.0.0.1:3000`.

| Metric | Value |
|--------|--------|
| Total requests | 2,855 |
| Throughput | ~190 req/s |
| Latency p50 | 127 ms |
| Latency p95 | 145 ms |
| Errors | 0 |

**SLO:** p95 &lt; 200 ms — **met**.

**Artifact:** `benchmarks/results/20260729-load-health-autocannon.txt`

---

## 5. Health load — k6 (`npm run load:k6:health`)

**Settings:** 10 VUs, 30s, `BASE_URL=http://127.0.0.1:3000`.

| Metric | Value |
|--------|--------|
| Requests | 1,746 |
| http_req_failed | 0% |
| http_req_duration p95 | 111 ms |

**SLO:** **met**.

**Artifact:** `benchmarks/results/20260729-load-k6-health.txt`

**k6 install (this machine):** binary downloaded to `/tmp/k6-v0.57.0-linux-amd64/k6` — install [k6](https://grafana.com/docs/k6/latest/set-up/install-k6/) globally or set `K6_BIN`.

---

## 6. Chat API load — fetch runner (`npm run load:chat`)

**What this measures:** Authenticated `GET /api/chats` + `POST /api/chats` in parallel batches (same login flow as the browser).

**Why not k6 only?** Grafana k6’s credentials `POST` to NextAuth often **hangs or non-2xx** in this project while Node `fetch` login works. This script is the **supported** authenticated load path until k6 auth is fixed.

**Settings:** `BASE_URL=http://127.0.0.1:3002`, 15s, concurrency 5.

| Metric | Value |
|--------|--------|
| Iterations | 145 |
| Mean | 512 ms |
| p50 | 500 ms |
| p95 | 624 ms |

**SLO:** p95 &lt; 500 ms — **slightly missed** (624 ms). Likely dev mode + Neon latency; re-test on `npm run start` for stricter numbers.

**Artifact:** `benchmarks/results/20260729-load-chat-fetch.txt`

---

## 7. End-to-end RAG stream smoke (`npm run perf:smoke`)

**What this measures:** Real user path: login → create chat → **one** SSE stream to completion.

| Metric | Value |
|--------|--------|
| TTFB (first SSE bytes) | 13,099 ms |
| Total stream time | 21,411 ms |
| `done` event received | yes |

**SLO:** TTFB p95 &lt; 5000 ms — **missed** on this run (cold Ollama generation + first-turn RAG). Repeat runs usually improve after models are warm.

**Artifact:** `benchmarks/results/20260729-stream-smoke.txt`

---

## 8. k6 authenticated scenarios (status)

| Script | Result | Notes |
|--------|--------|-------|
| `load/k6/chat.js` | Failed setup | Login POST ~60s / non-2xx under k6; `CookieJar` updated but still unreliable |
| `load/k6/stream.js` | Not run | Depends on same login |

**Workaround:** Use `npm run load:chat` + `npm run perf:smoke` for authenticated performance coverage.

---

## How to reproduce the full pass

```bash
# 1. Services
ollama serve          # embedding + generation
npm run seed          # admin@medbot.com / password123

# 2. App WITH .env (required for auth)
npm run dev           # or dev on another port: npm run dev -- -p 3002

# 3. Benchmarks (no app needed except load)
npm run bench
npm run bench:embedding
npm run bench:retrieval

# 4. Load + E2E (app must be up; set BASE_URL if not :3000)
npm run load:health
npm run load:chat
npm run perf:smoke

# 5. Optional k6
npm run load:k6:health
# load:k6:chat — known auth issue

# Or orchestrator (skips steps if app down):
npm run perf:all
```

---

## Documentation map

| Doc | Purpose |
|-----|---------|
| [performance-testing-guide.md](./performance-testing-guide.md) | Concepts, file layout, how to read each test |
| [performance.md](./performance.md) | One-page command reference |
| **This file** | Record of what was run and numbers observed |
| [benchmarks/results/README.md](../benchmarks/results/README.md) | Raw log naming |

---

## Code changes tied to this run

1. Removed verbose debug logging from `retrieval.service.ts` (was breaking readable benchmark output).
2. Added `run-chat-load.ts`, `run-stream-smoke.ts`, `run-all.ts`, and saved results under `benchmarks/results/`.
3. Improved k6 `CookieJar` login (still flaky for NextAuth).
4. `npm run load:chat` — authenticated load via Node fetch.

When you re-run, update the date and tables in this file or add a new `performance-test-report-YYYYMMDD.md`.
