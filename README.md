This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
# MedBot
## Getting Started
**Grounded medical answers with citations.**
First, run the development server:
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
