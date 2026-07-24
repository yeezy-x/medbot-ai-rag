"use client";

import { useState } from "react";
import {
  ArrowDownAZ,
  ArrowDownWideNarrow,
  BadgeCheck,
  Braces,
  Clock,
  Copy,
  Cpu,
  Filter,
  Info,
  Layers,
  ScrollText,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";
import type { DebugPayload } from "@/modules/chat/api/stream";
import { ChunkCard } from "./chunk-card";

type SortMode = "rank" | "score";
type FilterMode = "all" | "accepted" | "rejected";
type Tab = "retrieval" | "prompt";

interface RetrievalInspectorProps {
  open: boolean;
  onClose: () => void;
  debug: DebugPayload | null;
  streaming?: boolean;
  totalDurationMs?: number;
}

/**
 * Right-side developer drawer showing the RAG pipeline internals for the
 * most recent question: retrieved chunks (with scores + accept/reject),
 * context stats, prompt preview, and metrics.
 */
export function RetrievalInspector({
  open,
  onClose,
  debug,
  streaming,
  totalDurationMs,
}: RetrievalInspectorProps) {
  const [sort, setSort] = useState<SortMode>("rank");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [tab, setTab] = useState<Tab>("retrieval");

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="right"
        className={cn(
          "w-full sm:max-w-md md:max-w-lg",
          "border-l border-border-subtle bg-surface-2 p-0",
          "flex flex-col"
        )}
        data-testid="retrieval-inspector"
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-md border border-brand/30 bg-brand-muted text-brand">
              <Braces className="size-3.5" strokeWidth={2.2} />
            </div>
            <div className="leading-tight">
              <div className="text-[0.85rem] font-semibold">Retrieval Inspector</div>
              <div className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                Developer mode
              </div>
            </div>
          </div>
          <IconButton size="sm" label="Close inspector" onClick={onClose}>
            <X />
          </IconButton>
        </header>

        {!debug ? (
          <EmptyBody streaming={streaming} />
        ) : (
          <div className="flex flex-1 flex-col overflow-hidden">
            <MetricsBar
              debug={debug}
              totalDurationMs={totalDurationMs}
            />
            <TabBar tab={tab} setTab={setTab} />
            {tab === "retrieval" ? (
              <RetrievalBody
                debug={debug}
                sort={sort}
                setSort={setSort}
                filter={filter}
                setFilter={setFilter}
              />
            ) : (
              <PromptBody debug={debug} />
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function EmptyBody({ streaming }: { streaming?: boolean }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-8 text-center">
      <div className="flex size-10 items-center justify-center rounded-xl border border-brand/30 bg-brand-muted text-brand">
        <Sparkles className="size-4" />
      </div>
      <div className="text-[0.9rem] font-semibold">
        {streaming ? "Retrieving…" : "No retrieval yet"}
      </div>
      <p className="max-w-xs text-[0.8rem] text-muted-foreground">
        {streaming
          ? "Waiting for the RAG pipeline to emit the context event."
          : "Send a question to see the retrieved chunks, similarity scores, accepted context window, and the actual prompt sent to Ollama."}
      </p>
    </div>
  );
}

function MetricsBar({
  debug,
  totalDurationMs,
}: {
  debug: DebugPayload;
  totalDurationMs?: number;
}) {
  const accepted = debug.context.acceptedChunkCount;
  const retrieved = debug.retrieval.chunks.length;
  const acceptRate = retrieved ? Math.round((accepted / retrieved) * 100) : 0;
  const budgetPct = Math.min(
    100,
    Math.round(
      (debug.context.totalCharacters / debug.context.maxCharacters) * 100
    )
  );

  return (
    <div className="grid grid-cols-2 gap-2 border-b border-border-subtle px-4 py-3 text-[0.75rem]">
      <Metric
        icon={<Clock className="size-3" />}
        label="Retrieval"
        value={`${debug.retrieval.durationMs} ms`}
      />
      <Metric
        icon={<Cpu className="size-3" />}
        label="Total"
        value={totalDurationMs ? `${totalDurationMs} ms` : "—"}
      />
      <Metric
        icon={<Layers className="size-3" />}
        label="Chunks"
        value={`${accepted} / ${retrieved}`}
        hint={`${acceptRate}% accepted`}
      />
      <Metric
        icon={<ScrollText className="size-3" />}
        label="Context"
        value={`${debug.context.totalEstimatedTokens.toLocaleString()} tok`}
        hint={`${budgetPct}% of budget`}
        progress={budgetPct}
      />
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  hint,
  progress,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  progress?: number;
}) {
  return (
    <div className="rounded-md border border-border-subtle bg-surface-3 px-2.5 py-1.5">
      <div className="flex items-center gap-1 text-[0.65rem] uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-0.5 font-mono text-[0.85rem] tabular-nums text-foreground">
        {value}
      </div>
      {hint && (
        <div className="mt-0.5 text-[0.65rem] text-muted-foreground">
          {hint}
        </div>
      )}
      {typeof progress === "number" && (
        <div className="mt-1 h-0.5 overflow-hidden rounded-full bg-surface-2">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              progress > 80
                ? "bg-destructive"
                : progress > 60
                  ? "bg-brand"
                  : "bg-muted-foreground"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

function TabBar({
  tab,
  setTab,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
}) {
  return (
    <div className="flex gap-1 border-b border-border-subtle px-3 pt-2">
      <TabButton active={tab === "retrieval"} onClick={() => setTab("retrieval")}>
        <Layers className="size-3.5" /> Retrieval
      </TabButton>
      <TabButton active={tab === "prompt"} onClick={() => setTab("prompt")}>
        <ScrollText className="size-3.5" /> Prompt
      </TabButton>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-t-md border-b-2 px-3 py-1.5",
        "text-[0.8rem] font-medium transition-colors",
        active
          ? "border-brand text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function RetrievalBody({
  debug,
  sort,
  setSort,
  filter,
  setFilter,
}: {
  debug: DebugPayload;
  sort: SortMode;
  setSort: (s: SortMode) => void;
  filter: FilterMode;
  setFilter: (f: FilterMode) => void;
}) {
  const chunks = [...debug.retrieval.chunks];
  if (sort === "score") chunks.sort((a, b) => b.score - a.score);
  const visible = chunks.filter((c) =>
    filter === "all"
      ? true
      : filter === "accepted"
        ? c.accepted
        : !c.accepted
  );

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Query row */}
      <div className="border-b border-border-subtle px-4 py-2.5">
        <div className="flex items-center gap-1.5 text-[0.65rem] uppercase tracking-wider text-muted-foreground">
          <Search className="size-3" />
          Query
        </div>
        <div className="mt-1 line-clamp-2 text-[0.85rem] text-foreground">
          {debug.retrieval.query}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[0.7rem] text-muted-foreground">
          <Pill>top_k = {debug.retrieval.topK}</Pill>
          <Pill>min_score = {debug.retrieval.minScore.toFixed(2)}</Pill>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 border-b border-border-subtle px-4 py-2 text-[0.75rem]">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Filter className="size-3.5" />
          Filter
        </div>
        <SegBtn active={filter === "all"} onClick={() => setFilter("all")}>All</SegBtn>
        <SegBtn active={filter === "accepted"} onClick={() => setFilter("accepted")}>
          Accepted
        </SegBtn>
        <SegBtn active={filter === "rejected"} onClick={() => setFilter("rejected")}>
          Rejected
        </SegBtn>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSort(sort === "rank" ? "score" : "rank")}
            className={cn(
              "inline-flex items-center gap-1 rounded-md border border-border-subtle bg-surface-3 px-2 py-1",
              "text-[0.7rem] text-muted-foreground hover:text-foreground"
            )}
          >
            {sort === "rank" ? (
              <ArrowDownAZ className="size-3" />
            ) : (
              <ArrowDownWideNarrow className="size-3" />
            )}
            {sort === "rank" ? "Rank" : "Score"}
          </button>
        </div>
      </div>

      {/* Chunk list */}
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {visible.length === 0 ? (
          <div className="rounded-md border border-dashed border-border-subtle bg-surface-3 px-3 py-6 text-center text-[0.8rem] text-muted-foreground">
            No chunks match this filter.
          </div>
        ) : (
          visible.map((chunk, idx) => (
            <ChunkCard key={chunk.id} chunk={chunk} index={idx + 1} />
          ))
        )}
      </div>
    </div>
  );
}

function PromptBody({ debug }: { debug: DebugPayload }) {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="border-b border-border-subtle px-4 py-2.5">
        <div className="flex items-center gap-1.5 text-[0.65rem] uppercase tracking-wider text-muted-foreground">
          <BadgeCheck className="size-3" />
          Final prompt sent to Ollama
        </div>
        <div className="mt-1 text-[0.7rem] text-muted-foreground">
          System + context + user question. Context is truncated to the first
          4 KB below.
        </div>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        <PromptBlock title="System" body={debug.prompt.system} />
        <PromptBlock title="Context" body={debug.prompt.contextPreview} />
        <PromptBlock title="Question" body={debug.prompt.question} />
      </div>
    </div>
  );
}

function PromptBlock({ title, body }: { title: string; body: string }) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(body);
      toast.success(`${title} copied`);
    } catch {
      toast.error("Couldn't copy");
    }
  }
  return (
    <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface-3">
      <div className="flex items-center justify-between border-b border-border-subtle bg-[color-mix(in_oklch,var(--surface-3),black_10%)] px-3 py-1.5">
        <span className="font-mono text-[0.7rem] uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        <IconButton size="xs" label={`Copy ${title.toLowerCase()}`} onClick={copy}>
          <Copy />
        </IconButton>
      </div>
      <pre className="max-h-72 overflow-auto whitespace-pre-wrap p-3 font-mono text-[0.75rem] leading-relaxed text-foreground">
        {body || <span className="italic text-muted-foreground">empty</span>}
      </pre>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-border-subtle bg-surface-3 px-1.5 py-0.5 font-mono text-[0.65rem] text-muted-foreground">
      {children}
    </span>
  );
}

function SegBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border px-2 py-1 text-[0.7rem] transition-colors",
        active
          ? "border-brand/40 bg-brand-muted text-brand"
          : "border-border-subtle bg-surface-3 text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

// Small info hint icon (used in ChatConversation when dev-mode is on but no debug yet)
export function DevModeInfo() {
  return (
    <Info className="size-3 text-muted-foreground" />
  );
}
