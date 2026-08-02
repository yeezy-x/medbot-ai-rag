# Performance testing — quick reference

**Full walkthrough:** [performance-testing-guide.md](./performance-testing-guide.md)  
**Last executed run (with numbers):** [performance-test-report.md](./performance-test-report.md)

## SLOs (local defaults)

| Surface | Metric | Target | Env |
|--------|--------|--------|-----|
| `GET /api/health` | p95 | &lt; 200 ms | `SLO_HEALTH_P95_MS` |
| `/api/chats` | p95 | &lt; 500 ms | `SLO_API_P95_MS` |
| SSE stream | TTFB p95 | &lt; 5000 ms | `SLO_STREAM_TTFB_MS` |

## Commands

```bash
npm run bench              # CPU: chunking + normalization (Vitest)
npm run bench:embedding    # Ollama embed latency
npm run bench:retrieval    # Embed + pgvector (needs DATABASE_URL)
npm run load:health        # autocannon → /api/health
npm run load:chat          # authenticated chat API load (fetch)
npm run perf:smoke         # E2E: login + one SSE RAG stream
npm run perf:all           # orchestrate CPU + embed + retrieval + load smoke
npm run load:k6:health     # k6 health (install k6 separately)
npm run load:k6:chat       # k6 authenticated chat list/create
npm run load:k6:stream     # k6 SSE smoke (low VUs)
```

## Prerequisites

- **bench:** Node only.
- **bench:embedding / retrieval:** Ollama; retrieval also needs `DATABASE_URL` and ideally ingested docs.
- **load:** Running app (`npm run dev` or `start`); k6 chat/stream need seeded user (`npm run seed`).

## Layout

- `benchmarks/` — Vitest bench + `run-*.ts` scripts
- `load/k6/` — k6 scenarios + `lib/auth.js`

## Env (common)

`BENCH_ITERATIONS`, `BASE_URL`, `LOAD_VUS`, `LOAD_DURATION`, `LOAD_DURATION_SEC`, `LOAD_CONNECTIONS`, `LOAD_TEST_EMAIL`, `LOAD_TEST_PASSWORD`
