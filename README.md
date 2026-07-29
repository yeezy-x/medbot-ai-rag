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
- Email/password auth (NextAuth v5 credentials)
- Dashboard with recent chats
- Chat sidebar with search, date grouping, rename / delete
- Command palette (`⌘K`)
- Markdown + GFM rendering with syntax-highlighted code blocks
- Per-message actions (copy, regenerate, export)
- Settings (theme, retrieval sliders, model display) — preferences stored in the browser
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
| Auth | [NextAuth.js v5](https://authjs.dev/) (credentials) + Prisma adapter |
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
| `User` | Account with bcrypt password hash |
| `ChatSession` | Owned conversation thread |
| `Message` | `USER` / `ASSISTANT` / `SYSTEM` turns |
| `Citation` | Links an assistant message to a chunk (page + source title) |
| `Document` | Ingested PDF metadata + checksum + ingestion status |
| `Chunk` | Text unit + optional page/chapter/section + `vector(768)` embedding |

Auth tables (`Account`, `Session`, `VerificationToken`) support the NextAuth Prisma adapter.

---

## Project structure

```
medbot/
├── knowledge-base/          # Place PDFs here (gitignored); default: gale-encyclopedia.pdf
├── prisma/
│   ├── schema.prisma        # Domain + auth models, pgvector Chunk.embedding
│   └── seed.ts              # Local admin user
├── docs/                    # Architecture notes, frontend roadmap, phase writeups
├── src/
│   ├── app/
│   │   ├── (marketing)/     # Landing page
│   │   ├── (auth)/          # Login / register
│   │   ├── (app)/           # Dashboard, chat, settings (authenticated)
│   │   └── api/             # REST + SSE routes
│   ├── modules/
│   │   ├── auth/            # Forms, schemas, auth services
│   │   ├── chat/            # UI, streaming, chat services
│   │   ├── knowledge/       # Ingest, embed, retrieve, RAG
│   │   ├── marketing/       # Landing sections
│   │   ├── settings/        # Preference UI
│   │   ├── dashboard/
│   │   ├── rag/             # Shared RAG constants
│   │   └── user/
│   ├── components/          # Shared UI + markdown
│   ├── config/              # env (Zod), site metadata
│   └── generated/           # Prisma client output
└── package.json
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
| `AUTH_SECRET` | Yes | Secret for NextAuth session encryption |
| `NEXTAUTH_URL` | Optional | App URL (e.g. `http://localhost:3000`) |
| `OLLAMA_BASE_URL` | Optional | Defaults to `http://localhost:11434` |
| `NODE_ENV` | Optional | `development` \| `production` \| `test` |

Example:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/medbot?sslmode=require"
AUTH_SECRET="generate-a-long-random-string"
NEXTAUTH_URL="http://localhost:3000"
OLLAMA_BASE_URL="http://localhost:11434"
```

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

# 6. Seed a local admin user
npm run seed
# → email: admin@medbot.com
# → password: password123
# Change this immediately in shared environments.

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

See [docs/performance-testing-guide.md](docs/performance-testing-guide.md) for the full guide and [docs/performance-test-report.md](docs/performance-test-report.md) for the latest executed results.

Additional knowledge scripts under `src/modules/knowledge/scripts/` (embedding consistency, citation chain, prompt hardening, vector search, etc.) can be run with `tsx` for debugging the RAG pipeline.

---

## API overview

All authenticated routes expect a valid NextAuth session unless noted.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Health check |
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Credentials login helper |
| `*` | `/api/auth/[...nextAuth]` | NextAuth handlers |
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
| `/login`, `/register` | Auth |
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

More detail lives in `docs/frontend-roadmap.md` and `docs/memory.md`.

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
| `docs/phase-0/` | Early ADRs and design questions (RAG, Postgres, embeddings) |
| `docs/phase-1/` | Project setup & database flow |
| `docs/phase-3/` | PDF ingestion pipeline design |
| `docs/frontend-roadmap.md` | Frontend overhaul phases (streaming, citations, inspector, viewer) |
| `docs/memory.md` | Product PRD + implemented frontend phases |
| `docs/todo/` | Knowledge filter backlog |

---

## License

Private project (`"private": true` in `package.json`). Add a license file if you open-source it.

---

## Links

- Author / socials: see `src/config/site.ts`  
- Stack highlights: Postgres · pgvector · Local Ollama · Cited answers · Grounded RAG  
