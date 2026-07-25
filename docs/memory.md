# MedBot — Frontend Overhaul PRD

## Original problem statement
Frontend-only redesign of an existing Next.js 16 + React 19 + PostgreSQL/pgvector + Ollama RAG chat app (`yeezy-x/medbot-ai-rag`). Backend, APIs, schema, and RAG pipeline are frozen. Goal: make the app look and feel like a production AI SaaS (Linear + Vercel base, Perplexity + NotebookLM accents), dark-first grayscale with a single teal accent, so a recruiter reads the app as production-grade within 5 seconds.

## Architecture (frontend only, unchanged where possible)
- Next.js 16.2.9 (App Router, Turbopack) — kept
- React 19, TypeScript strict — kept
- Tailwind v4 (`@theme inline`, OKLCH tokens) — extended with brand/surface/border-subtle tokens
- shadcn/ui (`radix-nova` style) — kept, extended with `Kbd`, `IconButton`
- NextAuth v5 credentials — kept
- TanStack Query — kept (provider wired)
- Prisma 7 + pgvector + Ollama — untouched
- New deps (all approved by user): `react-markdown`, `remark-gfm`, `rehype-highlight`, `highlight.js`, `sonner`, `date-fns`

## User personas
- **Recruiter / Hiring manager** — evaluates polish, information hierarchy, and cited-answer differentiator at first glance.
- **Medical researcher / student** — needs cited, scannable, code/table-friendly answers.
- **Developer (self)** — wants observability (RAG inspector, later phases), keyboard-first flow.

## Core (static) requirements
1. Backend frozen — no schema/API contract changes.
2. Preserve existing routes, layouts, hooks, services, API utilities.
3. Grayscale-first, dark-first, single teal accent.
4. Linear/Vercel typography and spacing; no glassmorphism, no gradients-on-white, no AI-slop patterns.
5. Every interactive element carries `data-testid`.
6. Ships incrementally — every commit leaves the app in a working state.

## What's implemented (2026-01-21)
### Roadmap document
- `docs/FRONTEND_ROADMAP.md` — full phase-by-phase plan (F0 → F13) tailored to this repo, with per-phase file lists, backend-additions-required table, and priority ordering.


### Phase F8 — NotebookLM-style Source Viewer (new — 2026-01-21 pm)
- **Backend (additive-only):** `GET /api/documents/[id]/file` — auth-scoped stream of the on-disk PDF (`knowledge-base/{fileName}`) with `Content-Type: application/pdf`, `Content-Disposition: inline`, `Cache-Control: private, max-age=3600`. Path-traversal safe (basename-only + `startsWith(knowledgeBase + sep)`).
- **Frontend:**
  - `SourceViewer` (react-pdf) — page nav (buttons + editable input), zoom (`Ctrl±` / `Ctrl 0`), arrow-key page nav, loading skeleton, error state, Open-in-tab + Download.
  - `LazySourceViewer` (`next/dynamic`, `ssr: false`) — keeps ~500 KB of `pdfjs-dist` out of the initial chat bundle.
  - Split layout on desktop (`md:basis-1/2 md:min-w-[420px]`), full-screen overlay on mobile.
  - Any `CitationCard` click opens the viewer at the cited page. Escape closes.

### Phase F9 — RAG Metrics Panel (new — 2026-01-21 pm)
- Backend: none new — reuses F3 SSE metrics + F7 debug payload.
- Frontend: `<RagMetrics>` compact card under every completed assistant message. Collapsed by default. Header: Confidence pill (High / Medium / Low) + total latency. Expanded: 2×2 grid (Latency / Retrieval / Generation / Chunks accepted-per-retrieved) + Context tokens + Top score when dev mode is on. Confidence derived from real retrieval signals (top-1 similarity) with accept-rate fallback.

### Phase F5.1 — Citation Hover Preview (new — 2026-01-21 pm)
- Backend: `GET /api/chunks/[id]` — auth-scoped, returns `{ id, content, pageNumber, chapter, section, documentId, sourceTitle }`.
- Frontend: `CitationCard` wrapped in Radix `HoverCard`. Hover triggers a lazy fetch with a module-level cache — second hover is instant. Preview shows source, page, chapter, `line-clamp-6` excerpt, and a "Click card to open PDF →" hint that leads into the F8 viewer.

### Phase F6 — Rename / Delete Chats (new — 2026-01-21 pm)
- Backend: `PATCH /api/chats/[id]` — accepts `{ title }` (owner-guarded, trimmed, 200 chars). GET + DELETE unchanged.
- Frontend: Sidebar `…` menu on hover / focus with **Rename** (Sheet dialog, autofocus, char counter) and **Delete** (destructive). Optimistic; rolls back on API failure; navigates away when the deleted chat was active; sonner toasts throughout.

### Phase F7 — Retrieval Inspector (new — 2026-01-21 pm)
- **Backend (additive-only):**
  - `RAGService.streamGenerate({ signal?, debug? })` — when `debug: true`, augments the `context` SSE frame with a full `debug` payload (query, `top_k`, `min_score`, retrieval duration, per-chunk `{ score, pageNumber, chapter, section, documentId, sourceTitle, contentPreview, accepted, rejectionReason }`, context stats, truncated prompt preview).
  - `ChatService.streamMessage({ signal?, debug? })` — forwards the flag.
  - `/api/chats/[id]/messages/stream` route reads `x-medbot-debug: 1` header. Feature is opt-in — the header is missing → response is identical to before, keeping normal traffic lightweight.
  - Non-streaming route `/api/chats/[id]/messages` untouched. No schema changes.
- **Frontend:**
  - `useDevMode` — localStorage + cross-tab sync + CustomEvent broadcast.
  - `useStreamMessage({ debug })` — sends the header, captures the payload into a typed `DebugPayload`, exposes it as `stream.debug`.
  - `<RetrievalInspector>` — right-side `Sheet` drawer with:
    - Top metrics grid: retrieval time, total time, chunks accepted/retrieved with accept-rate, context token count with budget progress bar.
    - **Retrieval tab**: query row (`top_k`, `min_score` pills) + segmented filter (`All` / `Accepted` / `Rejected`) + sort toggle (`Rank` ↔ `Score`) + per-chunk cards with numeric score, score bar, accepted/rejected badge, rejection reason, source/page/chapter/section line, content preview, and truncated chunk id.
    - **Prompt tab**: system / context (truncated 4 KB) / question blocks, each with per-block Copy button and a raw monospace view.
  - `ChatHeaderActions` — a dev-only slim bar above the message list with an `Inspect` button (`⌘.` shortcut) and a "Dev" chip.
  - Sidebar user-menu now has a **Developer mode** checkbox item (persists across reloads and tabs).
  - Debug payload is retained after the stream ends, so the inspector still shows the most-recent turn.

### Phase F3 — Streaming responses (2026-01-21 pm)
- **Backend (additive-only, existing routes untouched):**
  - `OllamaChatService.generateStream()` — consumes Ollama's `/api/generate` NDJSON stream, yields `{delta, done}` frames, respects `AbortSignal` all the way to the model.
  - `RAGService.streamGenerate()` — first emits a `context` event (citations known before token-1), then per-token `token` events, then a final `done` event with accumulated answer + metrics.
  - `ChatService.streamMessage()` — persists user message, accumulates the streamed answer, and **still persists the final assistant + citations even if the stream is aborted mid-flight**.
  - `POST /api/chats/[id]/messages/stream/route.ts` — SSE endpoint. Emits `data: <json>\n\n` frames, sends a `: ping` heartbeat every 15s (nginx-safe), disconnects Ollama when the client aborts. 401 on unauth (not a redirect).
- **Frontend:**
  - `src/modules/chat/api/stream.ts` — `streamMessage()` helper that reads the `ReadableStream`, parses SSE frames, fires typed `StreamEvent`s.
  - `src/hooks/use-stream-message.ts` — full lifecycle hook: `{streaming, partial, citations, metrics, error, send, stop, reset}`.
  - `ChatConversation` uses streaming exclusively: optimistic user bubble, live-updating assistant bubble, thinking indicator until the first token, teal blinking `▍` cursor while tokens flow, promotes to a persisted message on `done`.
  - `MessageInput` swaps the send button for a stop button while streaming, shows `Esc` hint, disables text input.
  - Global `Escape` binding stops generation.
  - `MessageActions.onRegenerate` is now live — drops the last assistant message and re-runs the same user question through the streaming pipeline.
  - `ChatComposerLauncher` (empty-state) creates the chat then redirects to `/chat/:id?q=<message>` where the destination page auto-streams the first answer (URL is scrubbed after bootstrap to prevent re-fire on refresh).

### Phase F2 — Modern chat experience
- Fixed a layout bug in `src/app/(app)/chat/layout.tsx` (misplaced user-footer div rendered outside the sidebar).
- Redesigned `chat-sidebar.tsx`: brand block, primary "New chat" button with ⌘⏎ keyboard hint, live search, chats grouped by "Today / Yesterday / Previous 7 days / Previous 30 days / Older" with `date-fns`, active-state styling, user footer with Radix dropdown (dashboard + sign out).
- Redesigned `chat-header.tsx`: model chip, source chip, live-status dot.
- Rewrote `message-list.tsx` with auto-scroll (via `useAutoScroll` — actually wired), pending user-message optimistic append, thinking indicator during RAG generation.
- Rewrote `message-item.tsx`: user vs assistant avatars (Lucide `User` + brand `Sparkles`), relative timestamps, hover-revealed message actions row.
- Rewrote `message-input.tsx`: auto-resizing textarea (48–200px), keyboard hints (`⏎` / `⇧⏎`), soft character counter (5000), send button in brand color with loading state, safety disclaimer.
- New `chat-conversation.tsx` client component that owns optimistic message state.
- New `chat-composer-launcher.tsx` on `/chat` — first-send auto-creates a chat and navigates to `/chat/:id`.
- Rewrote `empty-state.tsx`: 4 suggestion cards with icons + prompts (Diagnose / Treatments / Compare / Emergencies), grid background, one-click prefill of composer.

### Phase F4 — Markdown rendering
- `src/components/markdown/markdown.tsx` — hardened `react-markdown` renderer with `remark-gfm` + `rehype-highlight`; custom components for `a` (opens in new tab with external-link icon), lists, tables, blockquotes, hr, code.
- `src/components/markdown/code-block.tsx` — terminal-style code block with language chip + copy button + copied-state feedback.
- `globals.css` `prose-medbot` styles: grayscale headings, teal-tinted blockquote & links, subtle tables, inline-code chip.
- `highlight.js/styles/github-dark.css` imported globally.

### Phase F5.0 — Citation cards (backend-additive-free)
- `types/citation.types.ts` — `CitationDisplay` shape.
- `citation-card.tsx` — numbered card with source title + page number, teal-tinted hover state.
- `citation-list.tsx` — dedupes by (source, page), horizontal scroll strip for ≤3, expandable grid for more.
- Threaded citations end-to-end: `getConversation` server-side → serialization now preserves citations → `MessageItem` renders them under assistant answers.
- Fixed `sendMessage()` return type mismatch: client now correctly types `SuccessResponse<SendMessageResponse>` (`{ answer, citations }`).

### Design-system foundation (grown alongside F2/F4/F5)
- Dark-first `<html className="dark">` in root layout.
- Teal brand tokens (`--brand`, `--brand-foreground`, `--brand-muted`) — used only for focus/hover/citation-active/composer-send.
- Semantic surface tokens (`--surface-1`, `--surface-2`, `--surface-3`, `--border-subtle`, `--border-strong`).
- Custom scrollbar (Linear-style), OpenType feature settings (`cv02, cv03, cv04, cv11, ss01`), grain-free selection color.
- `bg-grid` utility for empty-state / hero / auth backgrounds.
- `animate-fade-up`, `streaming-cursor` (staged for F3).

### Marketing + Auth polish (bonus)
- New `hero.tsx` — headline with teal underline, 4 tech chips (Postgres · pgvector / Local Ollama / Cited answers / Grounded RAG), a mocked "answer + 3 citations" preview card.
- New `navbar.tsx` — sticky, blurred, brand + beta chip, contextual auth CTAs.
- New `login-card.tsx` / `register-card.tsx` — matched card composition, ambient grid backgrounds via `(auth)/layout.tsx`.
- Forms: proper `Label` + `Input` composition, error toasts via `sonner`, loading spinners.
- New `dashboard/page.tsx` — 2-line header + primary CTA, list of recent chats with hover reveal, dashed empty-row.
- `sonner` Toaster mounted globally.

### Reusable primitives created
- `src/components/ui/kbd.tsx`
- `src/components/ui/icon-button.tsx`
- `src/lib/format.ts` (`relativeTime`, `groupByDate`, `initials`)
- `src/hooks/use-auto-scroll.ts` (finalized)

### Build / typecheck status
- `npx next build` — ✅ clean, 11 routes generated.
- `npx tsc --noEmit` — ✅ clean for all app code (only pre-existing `__tests__/*.ts` errors, backend concern).
- ESLint — ✅ clean (0 errors, 0 warnings).
- Visual verified via screenshots: `/`, `/login`, `/register`.

## Prioritized backlog (from the roadmap)
### P0 — must-have next
- **F7 Retrieval Inspector** (right drawer with retrieved chunks, scores, accepted/rejected, prompt preview) — biggest technical differentiator; needs `x-medbot-debug: 1` payload extension.
- **F5.1 Citation hover preview** — needs `GET /api/chunks/:id`.

### P1 — high impact
- **F8 NotebookLM-style Source Viewer** (`react-pdf`, page-jump on citation click) — needs `GET /api/documents/:id/file`.
- **F9 RAG metrics panel** — mostly free once F7's debug payload lands.
- **F6 Sidebar rename + delete + skeletons** — needs `PATCH /api/chats/[id]`.

### P2 — polish
- **F9 RAG metrics panel** (latency, tokens, thresholds).
- **F10 Command palette / export / edit prompt / continue generation.**
- **F11 Settings page** (theme, font size, dev-mode toggle, top-K, similarity threshold).
- **F12 Mobile / tablet responsive (`Sheet`-based sidebar, bottom composer).**
- **F13 A11y + Lighthouse pass.**

## Backend additions required (all additive, non-breaking)
| Phase | Endpoint / change |
|-------|-------------------|
| F3    | `POST /api/chats/[id]/messages` w/ `Accept: text/event-stream` → SSE frames (`token`, `citation`, `done`) |
| F5.1  | `GET /api/chunks/:id` |
| F6.1  | `PATCH /api/chats/[id]` (rename) |
| F7.1  | Debug payload on message POST when `x-medbot-debug: 1` |
| F8.1  | `GET /api/documents/:id/file` |
| F11.1 | `GET/PUT /api/users/me/preferences` |

## Next tasks
1. Ship F3 (streaming) — highest UX return per unit of work.
2. Ship F6 rename/delete once `PATCH /api/chats/[id]` lands.
3. Ship F7 retrieval inspector once debug payload lands — huge resume signal.
