"use client";

import { useEffect, useState } from "react";
import { BookOpen, Loader2 } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";
import type { CitationDisplay } from "../types/citation.types";

interface CitationCardProps {
  index: number;
  citation: CitationDisplay;
  className?: string;
  onOpen?: (citation: CitationDisplay) => void;
}

interface ChunkPreview {
  id: string;
  content: string;
  pageNumber?: number | null;
  chapter?: string | null;
  section?: string | null;
  documentId: string;
  sourceTitle: string;
}

// Module-level cache keyed by chunkId — hovering the same citation twice
// avoids a re-fetch and makes the preview feel instant.
const previewCache = new Map<string, ChunkPreview>();

async function fetchPreview(chunkId: string): Promise<ChunkPreview> {
  const cached = previewCache.get(chunkId);
  if (cached) return cached;
  const res = await fetch(`/api/chunks/${chunkId}`);
  if (!res.ok) throw new Error(`Failed to load chunk (${res.status})`);
  const json = (await res.json()) as { success: boolean; data: ChunkPreview };
  if (!json.success) throw new Error("Chunk fetch failed");
  previewCache.set(chunkId, json.data);
  return json.data;
}

export function CitationCard({
  index,
  citation,
  className,
  onOpen,
}: CitationCardProps) {
  const [preview, setPreview] = useState<ChunkPreview | null>(
    previewCache.get(citation.chunkId) ?? null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    if (!hovering) return;
    if (preview) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setLoading(true);
      setError(null);
    });
    fetchPreview(citation.chunkId)
      .then((p) => {
        if (!cancelled) setPreview(p);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? "Couldn't load preview");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [hovering, preview, citation.chunkId]);

  return (
    <HoverCard onOpenChange={setHovering}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          onClick={() => onOpen?.(citation)}
          data-testid={`citation-card-${citation.chunkId}`}
          className={cn(
            "group flex w-64 shrink-0 items-start gap-2 rounded-lg",
            "border border-border-subtle bg-surface-3 p-3 text-left",
            "transition-all duration-150",
            "hover:border-brand/40 hover:bg-[color-mix(in_oklch,var(--brand),var(--surface-3)_85%)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50",
            className
          )}
        >
          <span
            className={cn(
              "flex size-5 shrink-0 items-center justify-center rounded",
              "border border-border-subtle bg-surface-2",
              "font-mono text-[0.65rem] font-semibold text-muted-foreground",
              "group-hover:border-brand/50 group-hover:text-brand"
            )}
          >
            {index}
          </span>
          <span className="min-w-0 flex-1 space-y-0.5">
            <span className="block truncate text-[0.8rem] font-medium text-foreground">
              {citation.sourceTitle}
            </span>
            <span className="flex items-center gap-1 text-[0.7rem] text-muted-foreground">
              <BookOpen className="size-3" />
              <span>Page {citation.pageNumber || "—"}</span>
            </span>
          </span>
        </button>
      </HoverCardTrigger>

      <HoverCardContent side="top" align="start" data-testid="citation-preview">
        <div className="mb-2 flex items-center gap-2">
          <span className="flex size-5 items-center justify-center rounded border border-brand/30 bg-brand-muted font-mono text-[0.65rem] font-semibold text-brand">
            {index}
          </span>
          <div className="min-w-0">
            <div className="truncate text-[0.8rem] font-semibold text-foreground">
              {citation.sourceTitle}
            </div>
            <div className="flex items-center gap-1 text-[0.7rem] text-muted-foreground">
              <BookOpen className="size-3" />
              <span>Page {citation.pageNumber || "—"}</span>
              {preview?.chapter && (
                <>
                  <span aria-hidden>·</span>
                  <span className="truncate">{preview.chapter}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {loading && !preview && (
          <div className="flex items-center gap-2 py-2 text-[0.75rem] text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            Loading passage…
          </div>
        )}
        {error && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1.5 text-[0.75rem] text-destructive">
            {error}
          </div>
        )}
        {preview && (
          <p className="line-clamp-6 text-[0.8rem] leading-relaxed text-muted-foreground">
            {preview.content}
          </p>
        )}
        <div className="mt-2 flex items-center justify-between text-[0.65rem] text-muted-foreground">
          <span className="font-mono">
            chunk_id: {citation.chunkId.slice(0, 8)}…
          </span>
          <span className="text-brand">Click card to open PDF →</span>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
