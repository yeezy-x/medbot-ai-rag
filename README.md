# MedBot

**Grounded medical answers with citations.**

MedBot is a retrieval-augmented (RAG) medical assistant built on the [Gale Encyclopedia of Medicine](https://www.gale.com/). Ask a clinical question in plain language — the app retrieves the closest encyclopedia chunks from PostgreSQL + pgvector, generates an answer with a local Ollama model, and returns **page-level citations** you can open in a PDF source viewer.

> **Not a medical device.** MedBot cites encyclopedia text for learning and research. Always verify information with a licensed clinician.

---

## Why it exists

Large language models invent medical facts when they lack grounded context. A 4,000+ page encyclopedia also cannot fit in a model context window. MedBot solves both by using **Retrieval-Augmented Generation**:

1. **Ask** — user question in plain language  
2. **Retrieve** — embed the query and find similar chunks via cosine search in pgvector  
3. **Cite** — keep only accepted chunks (score + context budget) and attach source/page metadata  
4. **Generate** — stream an answer from Ollama, constrained to that medical context  

The result is answers you can audit: every factual claim can be traced back to a page in the knowledge base.

---

## Features

### Chat & RAG
- **Streaming answers** over SSE (token-by-token) with stop / regenerate
- **Numbered citations** with source title and page number
- **Citation hover preview** — lazy-loaded chunk excerpt before opening the PDF
- **NotebookLM-style PDF source viewer** — jump to the cited page, zoom, download
- **RAG metrics** — latency, retrieval vs generation time, chunks accepted / retrieved, confidence
- **Developer mode** — retrieval inspector (scores, accepted/rejected chunks, prompt preview)

### Product surface
- Marketing landing page (hero, how it works, stack)
- Email/password and social auth via **Clerk** (MFA and sessions in the Clerk Dashboard)
- Dashboard with recent chats
- Chat sidebar with search, date grouping, rename / delete
- Command palette (`⌘K`)
- Markdown + GFM rendering with syntax-highlighted code blocks
- Per-message actions (copy, regenerate, export)
- Settings (Clerk account profile, theme, retrieval) — security in Clerk; UI prefs local
- Dark-first UI with a single teal accent

### Knowledge pipeline
- Offline PDF ingestion for the Gale Encyclopedia (or other PDFs)
- Recursive character chunking with overlap and page/section metadata
- Embeddings via Ollama (`nomic-embed-text`, 768 dimensions)
- Idempotent ingest via document checksums
- Retrieval evaluation script for measuring quality

---

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org/) (App Router) + React 19 + TypeScript |
| UI | Tailwind CSS v4, shadcn/ui (Radix), Lucide |
| Auth | [Clerk](https://clerk.com/) + local Prisma `User` (`clerkId`) and RBAC |
| Data | [Prisma 7](https://www.prisma.io/) + PostgreSQL + [pgvector](https://github.com/pgvector/pgvector) |
| LLM / embeddings | [Ollama](https://ollama.com/) — `qwen2.5-coder:3b` (chat), `nomic-embed-text` (embed) |
| Client data | TanStack Query |
| Validation / logging | Zod, Pino |
| Testing | Vitest |
| PDF | `pdf-parse` (ingest), `react-pdf` (viewer) |

Architecture style: **REST API → service layer → repositories**, with Zod validation and a standard response envelope. Business logic stays out of route handlers.

---

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Next.js UI │────▶│  API routes      │────▶│  ChatService    │
│  (SSE chat) │◀────│  /messages/stream│     │       │         │
└─────────────┘     └──────────────────┘     │       ▼         │
                                             │  RAGService     │
                                             │  ├ Retrieval    │──▶ pgvector
                                             │  ├ Context      │
                                             │  └ Prompt       │──▶ Ollama
                                             └─────────────────┘
```

**Ingestion (offline):**

```
PDF (knowledge-base/)
  → extract text (pdf-parse)
  → normalize + chunk (≈1000 chars, 200 overlap)
  → extract page / chapter / section metadata
  → embed (nomic-embed-text @ 768-d)
  → store Document + Chunk rows in Postgres/pgvector
```

**Query path (online):**

```
Question
  → embed query
  → cosine similarity search (top-K, min score ≈ 0.70)
  → context budget filter
  → hardened system prompt + medical context XML
  → stream tokens from qwen2.5-coder:3b
  → persist Message + Citation
```

The system prompt instructs the model to answer medical facts **only** from supplied context, refuse when context is missing, ignore prompt-injection inside retrieved text, and never invent citations.

---

## Data model (high level)

| Model | Role |
| --- | --- |
| `User` | Account mapped to Clerk (`clerkId`), roles, status |
| `ChatSession` | Owned conversation thread |
| `Message` | `USER` / `ASSISTANT` / `SYSTEM` turns |
| `Citation` | Links an assistant message to a chunk (page + source title) |
| `Document` | Ingested PDF metadata + checksum + ingestion status |
| `Chunk` | Text unit + optional page/chapter/section + `vector(768)` embedding |

Auth is Clerk. Local `User` rows are created on first sign-in. See [docs/architecture/auth.md](docs/architecture/auth.md).

---

## Project structure

Full navigation guide (folder roles + request flows): [docs/architecture/CODEMAP.md](docs/architecture/CODEMAP.md).

```
medbot/
├── docs/                    # All documentation (see docs/README.md)
│   └── architecture/
│       └── CODEMAP.md       # How to read src/ and follow request flows
├── tests/
│   ├── unit/                # Isolated logic tests (mocked deps)
│   ├── integration/         # Pipeline tests (PDF, Ollama, DB)
│   ├── e2e/                 # Smoke / future end-to-end tests
│   └── fixtures/            # Shared test data
├── benchmarks/
│   ├── cpu/                 # Vitest CPU benchmarks
│   ├── scripts/             # run-*.ts perf harness
│   ├── load/k6/             # k6 load scenarios
│   ├── lib/                 # Stats helpers
│   └── results/             # Saved benchmark output
├── scripts/
│   ├── ingest-pdf.ts        # npm run ingest
│   ├── evaluate-retrieval.ts
│   └── dev/                 # Manual RAG debug scripts (tsx)
├── knowledge-base/          # Place PDFs here (gitignored)
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── src/
    ├── app/
    │   ├── (marketing)/     # Landing
    │   ├── (clerk)/             # Sign-in / sign-up (Clerk)
    │   ├── (main)/          # Dashboard, chat, settings
    │   ├── api/             # Thin HTTP handlers
    │   └── providers.tsx
    ├── modules/             # Feature modules (auth, chat, knowledge, …)
    ├── components/          # Shared UI (shadcn, markdown, navbar)
    ├── lib/                 # Helpers + auth-utils (Clerk → Prisma user)
    ├── db/                  # Prisma singleton
    ├── core/                # BaseRepository / BaseService
    ├── config/              # env, site
    ├── proxy.ts             # Auth gate (Next.js 16)
    └── generated/           # Prisma client
```

---

## Prerequisites

1. **Node.js** 20+ and npm  
2. **PostgreSQL** with the **pgvector** extension (Neon, local Postgres, or similar)  
3. **[Ollama](https://ollama.com/)** running locally (default `http://localhost:11434`)  
4. Pulled models:

```bash
ollama pull nomic-embed-text
ollama pull qwen2.5-coder:3b
```

5. A copy of the Gale Encyclopedia PDF (or another medical PDF) placed at:

```text
knowledge-base/gale-encyclopedia.pdf
```

PDF binaries are gitignored — you must supply the file yourself.

---

## Environment variables

Create a `.env` in the project root (see `src/config/env.ts`):

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string (with pgvector) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key |
| `CLERK_SECRET_KEY` | Yes | Clerk secret key |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Optional | Defaults to `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Optional | Defaults to `/sign-up` |
| `CLERK_WEBHOOK_SIGNING_SECRET` | Optional | Svix secret for `/api/webhooks/clerk` |
| `OLLAMA_BASE_URL` | Optional | Local Ollama (`http://localhost:11434`) |
| `LLM_PROVIDER` | Optional | `auto` (default), `ollama`, `openrouter`, or `gemini` |
| `OPENROUTER_API_KEY` | Production | Use a [free OpenRouter model](https://openrouter.ai/models?q=free) on Vercel |
| `OPENROUTER_CHAT_MODEL` | Optional | Default `google/gemini-2.0-flash-exp:free` |
| `OPENROUTER_EMBED_MODEL` | Optional | Default `nomic-ai/nomic-embed-text-v1.5` (768-d) |
| `GEMINI_API_KEY` | Optional | Native Gemini if you prefer Google over OpenRouter |
| `GEMINI_CHAT_MODEL` | Optional | Default `gemini-2.0-flash` |
| `GEMINI_EMBED_MODEL` | Optional | Default `gemini-embedding-001` (768-d) |
| `CHAT_MODEL` | Optional | Overrides the chat model id for the active provider |
| `NODE_ENV` | Optional | `development` \| `production` \| `test` |
| `ADMIN_EMAIL` | Optional | Seed promotes this local user to `ADMIN` |

Example:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/medbot?sslmode=require"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
OLLAMA_BASE_URL="http://localhost:11434"
# Production (Vercel): OpenRouter free models — do not rely on local Ollama
# OPENROUTER_API_KEY="sk-or-..."
# LLM_PROVIDER="openrouter"
# Or Gemini:
# GEMINI_API_KEY="..."
# LLM_PROVIDER="gemini"
```

`auto` picks OpenRouter if `OPENROUTER_API_KEY` is set, else Gemini if `GEMINI_API_KEY` is set, else Ollama. Vercel has no Ollama, so set a cloud key there. Query embeddings must stay **768 dimensions** to match pgvector (`nomic-embed-text`). If you switch embed families, re-run `npm run ingest`.

### Auth surface

- **Clerk** — `/sign-in`, `/sign-up` catch-all pages
- **Roles** — `USER` (default) / `ADMIN` (promote with `ADMIN_EMAIL` seed)
- **Edge gate** — [`src/proxy.ts`](src/proxy.ts) protects dashboard/chat/settings
- **Local sync** — first request + webhook upsert `User` by `clerkId`

---

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
# Create a .env in the project root — see table above

# 3. Enable pgvector on your database (Neon: enable extension in console / SQL)
#    CREATE EXTENSION IF NOT EXISTS vector;

# 4. Push / migrate the Prisma schema
npx prisma db push
# or: npx prisma migrate dev

# 5. Generate Prisma client (if needed)
npx prisma generate

# 6. Sign up in the app, then optionally promote an admin
# ADMIN_EMAIL=you@example.com npm run seed

# 7. Place the encyclopedia PDF
#    knowledge-base/gale-encyclopedia.pdf

# 8. Ingest into pgvector (requires Ollama + nomic-embed-text)
npm run ingest
# Optional custom file:
# npm run ingest -- other-document.pdf

# 9. Start the app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Script | Command | Purpose |
| --- | --- | --- |
| Dev server | `npm run dev` | Next.js with Turbopack |
| Production build | `npm run build` | `next build` |
| Start | `npm run start` | Serve production build |
| Lint | `npm run lint` | ESLint |
| Seed | `npm run seed` | Create admin user |
| Ingest | `npm run ingest` | PDF → chunks → embeddings → DB |
| Test | `npm run test` | Vitest (single run) |
| Test watch | `npm run test:watch` | Vitest watch mode |
| Coverage | `npm run test:coverage` | Vitest + coverage |
| Retrieval eval | `npm run evaluate:retrieval` | Offline retrieval quality checks |
| Bench (CPU) | `npm run bench` | Vitest micro-benchmarks |
| Bench embedding | `npm run bench:embedding` | Ollama embed latency |
| Bench retrieval | `npm run bench:retrieval` | Embed + vector search |
| Load health | `npm run load:health` | autocannon on `/api/health` |
| Load chat | `npm run load:chat` | Authenticated chat API load |
| E2E stream smoke | `npm run perf:smoke` | Login + full SSE RAG stream |
| Perf suite | `npm run perf:all` | Run main benchmarks + loads |
| Load (k6) | `npm run load:k6:health` / `load:k6:chat` / `load:k6:stream` | Grafana k6 scenarios |

See [docs/performance/performance-testing-guide.md](docs/performance/performance-testing-guide.md) for the full guide and [docs/performance/performance-test-report.md](docs/performance/performance-test-report.md) for the latest executed results.

Additional RAG debug scripts under `scripts/dev/` (embedding consistency, citation chain, prompt hardening, vector search, etc.) can be run with `tsx` for pipeline debugging.

---

## API overview

All authenticated routes expect a valid Clerk session unless noted.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Health check |
| `GET` | `/api/auth/me` | Local user profile |
| `POST` | `/api/webhooks/clerk` | Clerk user sync (Svix) |
| `GET` / `POST` | `/api/chats` | List / create chat sessions |
| `GET` / `PATCH` / `DELETE` | `/api/chats/[id]` | Get, rename, or delete a chat |
| `POST` | `/api/chats/[id]/messages` | Non-streaming send (legacy / fallback) |
| `POST` | `/api/chats/[id]/messages/stream` | **SSE** streaming RAG answer |
| `GET` | `/api/chunks/[id]` | Chunk detail for citation hover |
| `GET` | `/api/documents/[id]` | Auth-scoped PDF stream for the source viewer |

**Streaming protocol:** `POST .../messages/stream` emits SSE frames (`context` with citations first, then `token` deltas, then `done` with metrics). Send header `x-medbot-debug: 1` in developer mode to attach a full retrieval/debug payload on the `context` event. Heartbeats (`: ping`) are sent every ~15s.

Default retrieval knobs (server-side): `topK = 5`, `minSimilarity ≈ 0.70`, context character budget applied after ranking.

---

## App routes

| Route | Description |
| --- | --- |
| `/` | Marketing landing |
| `/sign-in`, `/sign-up` | Clerk auth |
| `/dashboard` | Recent chats + quick start |
| `/chat` | New chat composer |
| `/chat/[id]` | Conversation thread |
| `/settings` | Local preferences (theme, retrieval UI, etc.) |

---

## Design notes

- **Dark-first** grayscale UI with a single teal brand accent for focus, citations, and primary actions  
- Inspired by Linear / Vercel density with Perplexity / NotebookLM citation UX  
- Interactive elements carry `data-testid` for UI testing  
- Frontend and RAG observability (inspector, metrics, PDF viewer) are first-class — useful for demos and portfolio reviews  

More detail lives in [docs/roadmap/frontend-roadmap.md](docs/roadmap/frontend-roadmap.md) and [docs/memory.md](docs/memory.md).

---

## Medical safety

MedBot is an **educational / research** tool:

- Answers are constrained to retrieved encyclopedia context when medical facts are requested  
- Missing context yields an explicit refusal rather than free-form medical advice  
- Prompt-injection defenses treat retrieved text and user input as untrusted data  
- The UI surfaces a safety disclaimer near the composer  

**Do not use MedBot for diagnosis, treatment decisions, or emergencies.**

---

## Docs in this repo

| Path | Contents |
| --- | --- |
| `docs/architecture/CODEMAP.md` | How to read the repo: folder map + request flows |
| `docs/phases/phase-0/` | Early ADRs and design questions (RAG, Postgres, embeddings) |
| `docs/phases/phase-1/` | Project setup & database flow |
| `docs/phases/phase-3/` | PDF ingestion pipeline design |
| `docs/roadmap/frontend-roadmap.md` | Frontend overhaul phases (streaming, citations, inspector, viewer) |
| `docs/memory.md` | Product PRD + implemented frontend phases |
| `docs/todo/` | Knowledge filter backlog |

---

## License

Private project (`"private": true` in `package.json`). Add a license file if you open-source it.

---

## Links

- Author / socials: see `src/config/site.ts`  
- Stack highlights: Postgres · pgvector · Local Ollama · Cited answers · Grounded RAG  
