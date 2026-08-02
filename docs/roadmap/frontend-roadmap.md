# MedBot — Frontend Roadmap

> **Scope:** Frontend-only overhaul of the existing `medbot-ai-rag` repository.
> **Non-goals:** Backend redesign, DB schema changes, RAG pipeline changes, API contract breaks.
> **Design goal:** A polished, production-grade AI SaaS surface (Linear + Vercel base, Perplexity + NotebookLM accents), dark-first, grayscale + single teal accent, that showcases the existing RAG backend and looks like a real product to a recruiter within the first 5 seconds.

---

## 0. Assessment of the current frontend

The repo is a well-organized **Next.js 16 (App Router) + React 19 + Tailwind v4 + shadcn/ui (`radix-nova` style) + NextAuth v5 + Prisma 7 + pgvector + Ollama** stack. Modules are cleanly separated (`src/modules/{auth,chat,dashboard,knowledge,marketing}`) with services, repositories, DTOs, schemas, and API layers.

**What already works well**
- Route groups are clean: `(marketing)`, `(auth)`, `(app)/{dashboard,chat,chat/[id],settings}`.
- API routes are correct and RESTful (`/api/chats`, `/api/chats/[id]`, `/api/chats/[id]/messages`, streaming variant).
- `ChatService.sendMessage()` returns `{ answer, citations }` and persists citations; conversation load includes citations for the UI.
- Design tokens (`globals.css`) use neutral OKLCH grayscale, brand accent, sidebar tokens, prose styles, and dark-first via root layout.
- Chat shell: collapsible sidebar, shared `ChatListProvider`, header rename/copy-link/delete, ⌘K command palette, mobile drawer.
- Message surface: Markdown + GFM + highlighted code blocks, citation cards, inline `[n]` → scroll-to-citation, copy/regenerate/export/feedback actions, RAG metrics when present.
- Landing: hero + feature strip + answer preview; dashboard: quick actions + recent chat cards.
- Loading states: `chat/[id]/loading`, `settings/loading`; `settings/error` with retry.
- TanStack Query provider, `useAutoScroll` wired in conversation view, UTC-safe date grouping in sidebar.

**Remaining gaps / tech debt (frontend)**
1. **No dedicated `citation-hover-preview.tsx`** — preview UX lives in `citation-card` (optional split per design doc).
2. **Edit-prompt dialog & top-level export menu** — not built; per-message markdown export exists on `MessageActions`.
3. **`chat/[id]/error.tsx`** — relies on parent `chat/error.tsx` unless a thread-specific error UI is needed.
4. **Streaming polish** — SSE route exists; UX may still need abort/regenerate wiring end-to-end.
5. **Two `ChatRepository` classes** (`src/repositories/…` vs `src/modules/chat/repositories/…`) — backend tech debt, not blocking UI.
6. **F6–F8** (retrieval inspector, PDF viewer enhancements, preferences API) — later phases in §2.

**Bottom line:** core product surface (chat chrome, citations, marketing, dashboard, primitives) is in place. Next recruiter-visible wins are streaming polish, source/PDF inspector depth, and retrieval observability (F6–F8).

---

## 1. Design system foundation (integrated, not a separate phase)

Rather than building "Phase F0" in isolation, we grow primitives as F2 / F4 / F5 need them. This keeps every commit shipping visible progress.

**Token additions to `globals.css`**
- Force dark-first (add `.dark` to `<html>` in root layout).
- Introduce a single accent: `--accent-teal` (light + dark variants) used **only** for interactive/focus/citation-active states.
- Add sizing scale: `--content-max` (~44rem prose column), `--sidebar-width` (~260px).
- Semantic surface tokens: `--surface-1` (page), `--surface-2` (sidebar), `--surface-3` (elevated card), `--border-subtle`, `--border-strong`.

**New reusable primitives (grown across F2/F4/F5)**
- `src/components/ui/kbd.tsx` — keyboard-key chip (⌘ K, ↵, ↑↓).
- `src/components/ui/icon-button.tsx` — square 28px icon button (used everywhere).
- `src/components/ui/tooltip.tsx` — Radix tooltip (via `radix-ui`, already installed).
- `src/components/ui/badge.tsx` — for citation counts, model chips.
- `src/components/markdown/markdown.tsx` — hardened markdown renderer.
- `src/components/markdown/code-block.tsx` — with copy button + language pill.
- `src/modules/chat/components/citation-card.tsx`, `citation-list.tsx`, `citation-hover-preview.tsx`.
- `src/modules/chat/components/message-actions.tsx` — copy, regenerate, share row.

---

## 2. Phase-by-phase roadmap (mapped to this repo)

Each phase lists: **files to create · files to modify · components/hooks to build · backend additions required · ships-without-backend? · why it matters for a recruiter**.

---

### F0 — Design System & Foundation *(rolled into every phase; explicit tasks below)*
- **Modify:** `src/app/globals.css`, `src/app/layout.tsx` (add `.dark` + font wiring), `src/components/navbar.tsx` (retire in-app usage; keep for marketing only).
- **Create:** `src/components/ui/{kbd,icon-button,tooltip,badge}.tsx`, `src/lib/format.ts` (relative time, token counts).
- **Backend additions required:** none.
- **Ships without backend:** ✅

---

### F1 — Landing / Auth / Dashboard polish
- **Modify:**
  - `src/modules/marketing/components/hero.tsx` — real hero: headline, sub-copy, dual CTA (Login / Try demo), 3 feature bullets, subtle grid background, model + source badges.
  - `src/app/(marketing)/page.tsx` — add feature strip ("Grounded", "Cited", "Local Ollama"), a mocked answer-with-citation preview card.
  - `src/modules/auth/components/{login-card,register-card,login-form,register-form}.tsx` — inline field labels, `Label` + `Input` proper composition, `sonner` toasts on error, disable state polish.
  - `src/modules/dashboard/components/{dashboard-header,recent-chats,dashboard-empty}.tsx` — 2-column layout: quick actions + recent chats grid with relative timestamps.
  - `src/app/(auth)/{login,register}/loading.tsx` and `error.tsx` — proper skeletons + retry buttons.
- **Create:** `src/components/marketing/{feature-strip,answer-preview,logo-wordmark}.tsx`.
- **Backend additions required:** none.
- **Ships without backend:** ✅

---

### F2 — Modern Chat Experience  *(priority #1 — implementing now)*
- **Modify:**
  - `src/app/(app)/chat/layout.tsx` — **remove the stray user-footer `div`** rendered outside the sidebar; make the layout a 2-column shell (sidebar + main), fix `overflow` so only the message column scrolls.
  - `src/app/(app)/chat/[id]/page.tsx` — sticky bottom input, message column with max-width 44rem, keep server render but pass typed messages including citations (available for F5).
  - `src/app/(app)/chat/page.tsx` — new empty state uses `ChatComposer` inline (no messages yet).
  - `src/modules/chat/components/chat-sidebar.tsx` — logo + brand, `New chat` primary button with `⌘⏎`, search input, chat list with grouped sections (Today / Previous 7 days / Older), user footer with menu (Settings, Logout), collapsible on mobile.
  - `src/modules/chat/components/chat-header.tsx` — chat title (double-click to rename), model chip, source chip, actions menu (rename/delete/share).
  - `src/modules/chat/components/message-list.tsx` — auto-scroll on new message via `useAutoScroll`, `role="log"`, preserve scroll on history load, sentinel `div` at bottom.
  - `src/modules/chat/components/message-item.tsx` — avatar (User initials / MedBot mark), role label, relative timestamp, message actions on hover (copy, regenerate placeholder), consistent max-width column, hover elevation.
  - `src/modules/chat/components/empty-state.tsx` — Linear-style large-mark + greeting + 3–4 curated suggestion cards in a responsive grid.
  - `src/modules/chat/components/suggested-question.tsx` — card with icon + short label, keyboard focusable.
  - `src/components/message-input.tsx` — auto-resizing textarea (min 48px, max 200px), send button with icon, `⏎` sends, `⇧⏎` newline, character/token counter (soft-cap), keyboard-hints row.
  - `src/components/chat-input-wrapper.tsx` — optimistic append of user message; convert to `TanStack Query` mutation (`useMutation`) so we can show pending assistant "thinking" bubble; `router.refresh()` only on success.
- **Create:**
  - `src/modules/chat/components/chat-composer.tsx` — sticky bottom input container with border-top gradient.
  - `src/modules/chat/components/thinking-indicator.tsx` — 3-dot pulse under assistant avatar while awaiting response.
  - `src/modules/chat/components/message-actions.tsx` — copy / regenerate (regen stubbed until F3 backend).
  - `src/modules/chat/components/chat-item-actions.tsx` — dropdown (rename/delete) using `dropdown-menu`.
  - `src/hooks/use-send-message.ts` — TanStack `useMutation` wrapper around `sendMessage()`.
- **Hooks:** `useAutoScroll` (existing, actually wire it up), `useSendMessage` (new).
- **Backend additions required:** none for the visual/UX layer. Rename & regenerate become fully-live in F3.
- **Ships without backend:** ✅ (rename/delete UI can be shipped later; send/receive works with current API).

---

### F3 — Streaming responses
- **Modify:** `src/modules/chat/services/ollama-chat.service.ts` (support `stream: true` iterator), `src/modules/chat/services/chat.service.ts` (yield chunks), `src/app/api/chats/[id]/messages/route.ts` (Server-Sent Events response), `src/hooks/use-send-message.ts` (`ReadableStream` consumer, incremental `content` state).
- **Create:** `src/modules/chat/api/stream.ts`, `src/modules/chat/components/stop-button.tsx`, `src/modules/chat/components/regenerate-button.tsx`.
- **Backend additions required:**
  - New endpoint or same endpoint with `Accept: text/event-stream` — return SSE frames: `token`, `citation`, `done`.
  - Endpoint to cancel a running generation (soft; can be an `AbortController` on the client only initially).
- **Ships without backend:** ❌ (needs SSE support).

**✅ SHIPPED (2026-01-21).** Implemented as an **additive** new route `POST /api/chats/[id]/messages/stream` returning SSE (`context` / `token` / `done` / `error` frames). `OllamaChatService.generateStream` consumes Ollama's NDJSON stream; `RAGService.streamGenerate` and `ChatService.streamMessage` yield events downstream. Client hook `useStreamMessage` reads the ReadableStream, updates a `partial` string per token, exposes `stop()` (fires a client-side `AbortController.abort()`, which propagates via `request.signal` all the way to Ollama). Stop button, regenerate button, blinking teal cursor during streaming, global Escape-to-stop, and abort-safe DB persistence (partial answers are still saved on abort) all wired.

---

### F4 — Markdown rendering  *(priority #2 — implementing now)*
- **Modify:** `src/modules/chat/components/message-item.tsx` — render assistant `content` via `<Markdown/>`.
- **Create:**
  - `src/components/markdown/markdown.tsx` — `react-markdown` + `remark-gfm` + `rehype-highlight`, custom `components`: `p`, `ul`, `ol`, `li`, `blockquote`, `table`, `thead`, `tbody`, `tr`, `th`, `td`, `a` (open in new tab, external icon), `hr`, `img`.
  - `src/components/markdown/code-block.tsx` — `<pre>` with header (language + copy button), rounded, mono, `highlight.js` neutral theme (grayscale + one teal accent).
  - `src/app/globals.css` — additions: `.hljs-*` grayscale palette tuned for our dark surface.
- **Deps:** `react-markdown`, `remark-gfm`, `rehype-highlight`, `highlight.js`.
- **Backend additions required:** none.
- **Ships without backend:** ✅

---

### F5 — Citations  *(priority #3 — implementing now)*
- **Modify:**
  - `src/app/(app)/chat/[id]/page.tsx` — stop dropping citations during serialization; pass `citations` array on each assistant message.
  - `src/modules/chat/types/chat.types.ts` — extend `Message` with `citations: CitationDisplay[]`.
- **Create:**
  - `src/modules/chat/types/citation.types.ts` — `CitationDisplay { id, chunkId, pageNumber, sourceTitle }`.
  - `src/modules/chat/components/citation-list.tsx` — horizontal, scrollable, numbered cards under assistant answer.
  - `src/modules/chat/components/citation-card.tsx` — small card: `[1]` + short source + `p.NN`, hover shows preview tooltip.
  - `src/modules/chat/components/citation-hover-preview.tsx` — Radix `HoverCard` with snippet (from chunk content — needs F5.1 backend).
  - `src/modules/chat/components/citation-inline.tsx` — inline `[1]` superscript link inside markdown that scrolls to the corresponding card (nice-to-have; can render if answer includes `[n]` tokens).
- **Backend additions required:**
  - **F5.0 — none** for basic citation cards (source title + page number are already stored). ✅
  - **F5.1 (optional)** — `GET /api/chunks/:id` → returns `{ content, pageNumber, sourceTitle, documentId }` so the hover preview shows the actual snippet. Small, additive, non-breaking.
- **Ships without backend:** ✅ (F5.0 basic cards). F5.1 preview needs one additive endpoint.

---

### F6 — Chat sidebar (rename / delete / search / skeletons)
- **Modify:** `src/modules/chat/components/{chat-sidebar,chat-list,chat-item}.tsx`.
- **Create:** `src/modules/chat/components/{chat-search,chat-rename-dialog,chat-delete-dialog}.tsx`, `src/hooks/use-chats.ts` (TanStack query for cache + optimistic updates).
- **Backend additions required:**
  - **F6.1** — `PATCH /api/chats/[id]` with `{ title }` for rename. Currently only `GET` and `DELETE` exist. Small addition; service method `updateTitle` already exists in `ChatRepository`.
- **Ships without backend:** partially. Search + skeletons + delete + reorder ship immediately. Rename needs the `PATCH` route.

**✅ SHIPPED (2026-01-21 pm).** `PATCH /api/chats/[id]` accepts `{ title }` (validated, trimmed, capped at 200 chars, owner-checked via `ChatService.renameChat` which reuses the existing `getChatById` guard + `ChatRepository.updateTitle`). Sidebar items now expose a `…` menu (`MoreHorizontal`) revealed on hover / focus with **Rename** (opens a Sheet-based dialog with autofocus, 200-char counter, autosave on Enter) and **Delete** (destructive style). Both are optimistic — rename mutates in place, delete removes the row and navigates away from the active chat if it was the one deleted. On API failure the change is rolled back (rename restores previous title; delete re-inserts the row) and a sonner error toast fires.

---

### F7 — Retrieval Inspector (dev-mode right drawer)
- **Modify:** `src/modules/chat/services/chat.service.ts` — extend `SendMessageResponse` to optionally include `debug: { retrievedChunks, acceptedChunks, rejectedReasons, prompt, metrics }` when a header/flag is set.
- **Create:** `src/modules/chat/components/retrieval-inspector.tsx`, `src/modules/chat/components/chunk-card.tsx`, `src/hooks/use-dev-mode.ts` (localStorage flag).
- **Backend additions required:**
  - **F7.1** — Return retrieval debug payload on `POST /api/chats/[id]/messages` when `x-medbot-debug: 1` is present. RAGService already logs this — just expose it. Additive, non-breaking.
- **Ships without backend:** ❌ (needs debug payload exposure).

**✅ SHIPPED (2026-01-21 pm).** Implemented as an **additive, optional** payload on the existing SSE stream (`POST /api/chats/[id]/messages/stream`). When the client sends header `x-medbot-debug: 1`, the `context` event carries a full `debug` object: query, `top_k`, `min_score`, retrieval duration, and per-chunk records (`{ score, pageNumber, chapter, section, sourceTitle, contentPreview, accepted, rejectionReason }`) — rejection reasons derived from what we know (`"similarity below threshold"` when `score < 0.7`, else `"context window budget exceeded"`). Also emits context stats (`totalCharacters`, `totalEstimatedTokens`, `maxCharacters`) and a truncated prompt preview (`system` / `contextPreview` / `question`). Frontend: `useDevMode` (localStorage + cross-tab sync), a checkbox in the sidebar user menu, keyboard shortcut `⌘.` (or `Ctrl.`) to open, right-side `Sheet` inspector with tabs for **Retrieval** (query row + filter [all/accepted/rejected] + sort by rank/score + chunk cards with score bars) and **Prompt** (system / context / question blocks with per-block copy), plus a top metrics grid (retrieval time, total time, chunk accepted/retrieved ratio, context token budget with progress bar). Non-dev users see zero of it and payload isn't sent — normal responses stay lightweight.

---

### F8 — PDF viewer / Source Explorer (NotebookLM-style split view)
- **Modify:** `src/app/(app)/chat/[id]/page.tsx` — introduce a resizable 2-column layout when a citation is opened.
- **Create:** `src/modules/knowledge/components/pdf-viewer.tsx` (uses `react-pdf`), `src/modules/knowledge/components/source-drawer.tsx`, `src/hooks/use-open-source.ts`.
- **Deps:** `react-pdf`.
- **Backend additions required:**
  - **F8.1** — `GET /api/documents/:id/file` streaming the source PDF (auth-scoped).
  - **F8.2** — `GET /api/documents/:id/pages/:n` optional per-page endpoint (or leave to `react-pdf` client-side).
- **Ships without backend:** ❌.

**✅ SHIPPED (2026-01-21 pm).** New auth-scoped route `GET /api/documents/:id/file` streams the on-disk PDF (`knowledge-base/{fileName}`) with `Content-Type: application/pdf`, `Content-Disposition: inline`, `Cache-Control: private, max-age=3600`, and path-traversal protection (basename-only + `startsWith(knowledgeBase + sep)` check). Frontend: `SourceViewer` component built on `react-pdf` with page nav (`◄` / `►` / editable page number), zoom (`Ctrl+`/`Ctrl-` / `Ctrl 0` reset), keyboard arrows, loading skeleton, error state, and Open-in-new-tab + Download affordances. Lazy-loaded via `next/dynamic` (`ssr: false`) as `LazySourceViewer` so `pdfjs-dist` (~500 KB) is only pulled the first time a citation is clicked. Clicking any citation card opens the viewer at the cited page in a split layout on desktop (`md:basis-1/2 md:min-w-[420px]`) and as a full-screen overlay on mobile. Escape closes the viewer.

---

### F9 — RAG metrics panel
- **Create:** `src/modules/chat/components/rag-metrics.tsx` (latency, embedding time, retrieval time, generation time, retrieved / accepted chunks, tokens, similarity threshold, confidence badge).
- **Backend additions required:** same debug payload as F7.
- **Ships without backend:** ❌ (or ships with mocked values first).

**✅ SHIPPED (2026-01-21 pm).** `<RagMetrics>` renders under every fully-streamed assistant message. Collapsed by default with a one-line header showing a Confidence pill (`High` / `Medium` / `Low`) + total latency; expands into a 2×2 grid (`Latency` / `Retrieval` / `Generation` / `Chunks accepted/retrieved` with accept-rate hint) plus context tokens and top-1 score when dev mode is on. Reuses the metrics already emitted by F3's SSE stream and F7's debug payload — zero extra requests. Confidence is derived from actual retrieval signals: top-1 similarity ≥ 0.85 = High, ≥ 0.75 = Medium, else Low; falls back to accept-rate when scores aren't exposed (non-dev mode).

---

### F10 — AI UX enhancements
- Suggested prompts (already partial), prompt history dropdown (⌘K), copy/share/export/clear/retry/edit prompt, "continue generating".
- **Create:** `src/modules/chat/components/{command-palette,export-menu,edit-prompt-dialog}.tsx`, `src/hooks/use-command-palette.ts`.
- **Backend additions required:** export (server-side markdown/PDF export) is optional; client-side markdown export ships immediately.
- **Ships without backend:** ✅ mostly.

**✅ SHIPPED.** Command palette with chat search + recent prompts; `export-menu` + per-message export/share; `edit-prompt-dialog` + toolbar; `use-prompt-history`; continue-after-stop via `incomplete` messages; global `use-chat-shortcuts` (⌘⏎ new chat, ⌘/ focus composer).

---

### F11 — User settings
- **Create:** `src/app/(app)/settings/page.tsx`, `src/modules/settings/components/{theme-toggle,font-size,dev-mode-toggle,model-picker,topk-slider,similarity-slider}.tsx`.
- **Backend additions required:**
  - **F11.1** — `GET/PUT /api/users/me/preferences` (JSON blob on `User` — or store client-side in `localStorage` first, migrate later).
- **Ships without backend:** ✅ if we start with localStorage.

**✅ SHIPPED.** Settings route with modular `src/modules/settings/components/*` panels (theme, font size, dev mode, retrieval sliders, model placeholder); preferences in localStorage.

---

### F12 — Mobile responsiveness
- Sidebar → `Sheet` (already available in shadcn/ui `sheet.tsx`), bottom-sheet suggestions, touch-friendly hit targets (min 44px), tablet 2-column layout.
- **Backend additions required:** none.
- **Ships without backend:** ✅.

**✅ SHIPPED.** `MobileSidebar` sheet; `SuggestionBottomSheet` on empty chat; 44px composer/actions on `max-md`; dashboard 2-column from `md` breakpoint.

---

### F13 — Polish & accessibility
- Skeletons on every data-fetch route, error boundaries per route group, ARIA labels on message list / composer / sidebar, keyboard nav (⌘K, ⌘⏎, ⌘/), focus rings using accent token, prefers-reduced-motion respect, Lighthouse pass.
- **Backend additions required:** none.
- **Ships without backend:** ✅.

**✅ SHIPPED.** App/chat/settings/dashboard/auth loading + error routes; ARIA on message list, composer, sidebar search, header; global `:focus-visible` brand ring; reduced-motion for animations; keyboard shortcuts documented in UI.

---

## 3. First 3 frontend changes to implement immediately

**These are being implemented in this session.** They pack the highest recruiter-visible value per line of code and require zero backend changes.

### ① Modern Chat Experience (F2)
Fixes the broken `chat/layout.tsx` layout, redesigns the sidebar, header, message list, message bubbles, empty state, and composer. Wires `useAutoScroll`. Replaces emoji/Unicode with Lucide icons. Introduces the design-system primitives (`IconButton`, `Kbd`, tokens) inline.
**Why now:** it's the app's core surface — everything else is decoration on top of this.

### ② Markdown rendering (F4)
Renders assistant answers through `react-markdown` + GFM + syntax-highlighted code blocks with a copy button.
**Why now:** the RAG backend already returns rich prose that currently renders as flat text — the biggest "wow" per hour of work.

### ③ Citation cards (F5.0)
Threads the already-persisted citations end-to-end into the UI as Perplexity-style numbered cards under each assistant answer.
**Why now:** citations are *the* differentiator of a RAG product. Backend already emits them; frontend simply throws them away today.

---

## 4. Backend additions required (consolidated, non-breaking, additive-only)

None of these are required for the first 3 changes. They unlock later phases.

| Phase | Endpoint / change | Type | Notes |
|-------|-------------------|------|-------|
| F3    | `POST /api/chats/[id]/messages` with `Accept: text/event-stream` → SSE frames (`token`, `citation`, `done`) | Additive to existing route | RAGService already builds full context; needs to yield token stream from Ollama (Ollama supports `stream: true`) |
| F5.1  | `GET /api/chunks/:id` → `{ id, content, pageNumber, sourceTitle, documentId }` | New route | For hover previews & inspector |
| F6.1  | `PATCH /api/chats/[id]` with `{ title }` | New method on existing route | `ChatRepository.updateTitle` already exists |
| F7.1  | Debug payload on `POST /api/chats/[id]/messages` when `x-medbot-debug: 1` | Additive field | RAGService already computes these values |
| F8.1  | `GET /api/documents/:id/file` (auth-scoped PDF stream) | New route | Needed for PDF viewer |
| F11.1 | `GET/PUT /api/users/me/preferences` | New route + column on `User` | Can defer via localStorage first |

Each of these is **additive** — no existing contract changes, no schema migrations that break existing data.

---

## 5. Resume impact

After F2 + F4 + F5 ship, you can defensibly claim:

- Built a **production-grade RAG chat interface** on top of a Next.js 16 + React 19 + Postgres/pgvector + Ollama stack.
- Designed a **grayscale-first design system** in Tailwind v4 (`@theme inline`, OKLCH tokens, semantic surfaces, single-accent palette) inspired by Linear and Vercel.
- Implemented **hardened Markdown rendering** with GFM, tables, blockquotes, and syntax-highlighted code blocks with copy affordance.
- Threaded **Perplexity-style citations** end-to-end from pgvector retrieval to the UI, including hover previews.

After F3 + F6 + F7 + F8 ship, you can additionally claim:

- Delivered **token-level streaming** with abort + regenerate over Server-Sent Events.
- Built a **developer-mode Retrieval Inspector** exposing retrieved chunks, similarity scores, accepted/rejected reasons, and prompt preview — a real observability layer for a RAG pipeline.
- Built a **NotebookLM-style split source viewer** with per-citation page navigation over `react-pdf`.

Recruiter one-liner:
> "Full-stack RAG assistant with retrieval observability, streaming responses, and cited answers over medical literature — Next.js 16 / pgvector / Ollama."
