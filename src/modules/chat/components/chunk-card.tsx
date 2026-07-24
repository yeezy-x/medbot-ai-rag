"use client";

import { CheckCircle2, XCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DebugChunk } from "@/modules/chat/api/stream";

interface ChunkCardProps {
  chunk: DebugChunk;
  index: number;
}

function scoreClass(score: number): string {
  if (score >= 0.85) return "text-brand";
  if (score >= 0.75) return "text-foreground";
  return "text-muted-foreground";
}

export function ChunkCard({ chunk, index }: ChunkCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-surface-3 p-3 space-y-2",
        chunk.accepted ? "border-brand/30" : "border-border-subtle opacity-70"
      )}
      data-testid={`chunk-card-${chunk.id}`}
    >
      {/* Header row: chunk# + score + accepted/rejected badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[0.65rem] text-muted-foreground">
            #{String(index).padStart(2, "0")}
          </span>
          <div className="flex items-center gap-1">
            <div className={cn("font-mono text-[0.75rem] font-semibold", scoreClass(chunk.score))}>
              {chunk.score.toFixed(3)}
            </div>
            <ScoreBar score={chunk.score} />
          </div>
        </div>
        {chunk.accepted ? (
          <span className="inline-flex items-center gap-1 rounded-md border border-brand/30 bg-brand-muted px-1.5 py-0.5 text-[0.65rem] font-medium text-brand">
            <CheckCircle2 className="size-3" />
            Accepted
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-md border border-border-subtle bg-surface-2 px-1.5 py-0.5 text-[0.65rem] text-muted-foreground">
            <XCircle className="size-3" />
            Rejected
          </span>
        )}
      </div>

      {/* Source line */}
      <div className="flex items-center gap-1.5 text-[0.7rem] text-muted-foreground">
        <FileText className="size-3" />
        <span className="truncate text-foreground">{chunk.sourceTitle}</span>
        <span aria-hidden>·</span>
        <span>Page {chunk.pageNumber ?? "—"}</span>
        {(chunk.chapter || chunk.section) && (
          <>
            <span aria-hidden>·</span>
            <span className="truncate">
              {[chunk.chapter, chunk.section].filter(Boolean).join(" › ")}
            </span>
          </>
        )}
      </div>

      {/* Rejection reason */}
      {!chunk.accepted && chunk.rejectionReason && (
        <div className="rounded-md border border-border-subtle bg-surface-2 px-2 py-1 text-[0.7rem] text-muted-foreground">
          <span className="mr-1 font-medium text-foreground">Reason:</span>
          {chunk.rejectionReason}
        </div>
      )}

      {/* Content preview */}
      <p className="text-[0.75rem] leading-relaxed text-muted-foreground line-clamp-4">
        {chunk.contentPreview}
      </p>

      <div className="pt-1 font-mono text-[0.6rem] uppercase tracking-wide text-muted-foreground">
        chunk_id: <span className="text-foreground">{chunk.id.slice(0, 8)}…</span>
      </div>
    </div>
  );
}

function ScoreBar({ score }: { score: number }) {
  const width = Math.max(2, Math.min(100, Math.round(score * 100)));
  return (
    <div className="ml-1 h-1 w-14 overflow-hidden rounded-full bg-surface-2">
      <div
        className={cn(
          "h-full rounded-full transition-all",
          score >= 0.85
            ? "bg-brand"
            : score >= 0.75
              ? "bg-muted-foreground"
              : "bg-border-strong"
        )}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
