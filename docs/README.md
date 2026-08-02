# MedBot documentation

Start here for product, architecture, performance, and development notes.

## Quick links

| Topic | Location |
| --- | --- |
| **Getting started** | [README.md](../README.md) (repo root) |
| **Code map (how to read the repo)** | [architecture/CODEMAP.md](./architecture/CODEMAP.md) |
| **Product requirements** | [product/PRODUCT_PRD.md](./product/PRODUCT_PRD.md) |
| **Technical audit** | [audit/PROJECT_AUDIT_REPORT.md](./audit/PROJECT_AUDIT_REPORT.md) |
| **Frontend roadmap** | [roadmap/frontend-roadmap.md](./roadmap/frontend-roadmap.md) |
| **Implemented features log** | [memory.md](./memory.md) |
| **Performance overview** | [performance/performance.md](./performance/performance.md) |
| **How to run perf tests** | [performance/performance-testing-guide.md](./performance/performance-testing-guide.md) |
| **Latest perf results** | [performance/performance-test-report.md](./performance/performance-test-report.md) |
| **Backlog** | [todo/todo.md](./todo/todo.md) |

## Phase notes (historical)

| Phase | Focus |
| --- | --- |
| [phases/phase-0/](./phases/phase-0/) | Early ADRs — RAG, Postgres, embeddings |
| [phases/phase-1/](./phases/phase-1/) | Project setup and database flow |
| [phases/phase-3/](./phases/phase-3/) | PDF ingestion pipeline design |

## Repo layout (non-app code)

| Path | Purpose |
| --- | --- |
| `tests/` | Unit, integration, and e2e tests |
| `benchmarks/` | CPU benches, load scripts, k6 scenarios, raw results |
| `scripts/` | Operational CLIs (`ingest`, `evaluate:retrieval`) and `scripts/dev/` debug tools |
| `src/` | Application source (Next.js app + feature modules) — see [architecture/CODEMAP.md](./architecture/CODEMAP.md) |
