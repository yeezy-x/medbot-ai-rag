"use client";

import { useState } from "react";
import { ChevronDown, Clock, Layers, ScrollText, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MessageMetrics } from "../types/chat.types";

interface RagMetricsProps {
  metrics: MessageMetrics;
  /** When true, the panel opens expanded by default. */
  defaultOpen?: boolean;
}

/**
 * Compact, collapsible metrics summary rendered under an assistant message.
 * Reuses data already emitted by the streaming pipeline — no extra request
 * required. Hidden entirely if we don't have enough data to be useful.
 */
export function RagMetrics({ metrics, defaultOpen }: RagMetricsProps) {
  const [open, setOpen] = useState(Boolean(defaultOpen));

  const hasAnything =
    metrics.totalDurationMs !== undefined ||
    metrics.retrievalDurationMs !== undefined ||
    metrics.retrievedChunkCount !== undefined ||
    metrics.contextTokens !== undefined;

  if (!hasAnything) return null;

  const gen =
    metrics.generationDurationMs ??
    (metrics.totalDurationMs !== undefined &&
    metrics.retrievalDurationMs !== undefined
      ? Math.max(0, metrics.totalDurationMs - metrics.retrievalDurationMs)
      : undefined);

  const confidence = classifyConfidence(metrics);

  return (
    <div
      className="mt-3 overflow-hidden rounded-lg border border-border-subtle bg-surface-3/60"
      data-testid="rag-metrics"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center gap-2 px-3 py-1.5",
          "text-left text-[0.7rem] uppercase tracking-wider text-muted-foreground",
          "hover:bg-surface-3 transition-colors"
        )}
      >
        <Sparkles className="size-3 text-brand" />
        <span className="font-medium">Response details</span>
        <span className="ml-auto flex items-center gap-2 normal-case tracking-normal">
          <ConfidencePill confidence={confidence} />
          {metrics.totalDurationMs !== undefined && (
            <span className="font-mono text-[0.7rem] tabular-nums text-muted-foreground">
              {formatMs(metrics.totalDurationMs)}
            </span>
          )}
          <ChevronDown
            className={cn(
              "size-3.5 transition-transform",
              open && "rotate-180"
            )}
          />
        </span>
      </button>

      {open && (
        <div className="grid grid-cols-2 gap-2 border-t border-border-subtle bg-surface-3 p-3 text-[0.75rem] sm:grid-cols-4">
          <Metric
            icon={<Clock className="size-3" />}
            label="Latency"
            value={
              metrics.totalDurationMs !== undefined
                ? formatMs(metrics.totalDurationMs)
                : "—"
            }
          />
          <Metric
            icon={<Clock className="size-3" />}
            label="Retrieval"
            value={
              metrics.retrievalDurationMs !== undefined
                ? formatMs(metrics.retrievalDurationMs)
                : "—"
            }
          />
          <Metric
            icon={<Sparkles className="size-3" />}
            label="Generation"
            value={gen !== undefined ? formatMs(gen) : "—"}
          />
          <Metric
            icon={<Layers className="size-3" />}
            label="Chunks"
            value={
              metrics.acceptedChunkCount !== undefined &&
              metrics.retrievedChunkCount !== undefined
                ? `${metrics.acceptedChunkCount} / ${metrics.retrievedChunkCount}`
                : "—"
            }
            hint={
              metrics.acceptedChunkCount !== undefined &&
              metrics.retrievedChunkCount
                ? `${Math.round(
                    (metrics.acceptedChunkCount /
                      Math.max(1, metrics.retrievedChunkCount)) *
                      100
                  )}% accepted`
                : undefined
            }
          />
          {metrics.contextTokens !== undefined && (
            <Metric
              icon={<ScrollText className="size-3" />}
              label="Context"
              value={`${metrics.contextTokens.toLocaleString()} tok`}
            />
          )}
          {metrics.topScore !== undefined && (
            <Metric
              icon={<Sparkles className="size-3" />}
              label="Top score"
              value={metrics.topScore.toFixed(3)}
            />
          )}
        </div>
      )}
    </div>
  );
}

type Confidence = "high" | "medium" | "low" | null;

function classifyConfidence(metrics: MessageMetrics): Confidence {
  const score = metrics.topScore;
  if (score === undefined) {
    // Fall back to accept ratio if score not exposed (non-dev-mode)
    if (
      metrics.acceptedChunkCount !== undefined &&
      metrics.retrievedChunkCount
    ) {
      const rate =
        metrics.acceptedChunkCount / Math.max(1, metrics.retrievedChunkCount);
      if (rate >= 0.6) return "high";
      if (rate >= 0.3) return "medium";
      return "low";
    }
    return null;
  }
  if (score >= 0.85) return "high";
  if (score >= 0.75) return "medium";
  return "low";
}

function ConfidencePill({ confidence }: { confidence: Confidence }) {
  if (!confidence) return null;
  const style =
    confidence === "high"
      ? "border-brand/40 bg-brand-muted text-brand"
      : confidence === "medium"
        ? "border-border-strong bg-surface-2 text-foreground"
        : "border-destructive/30 bg-destructive/10 text-destructive";
  const label =
    confidence === "high" ? "High" : confidence === "medium" ? "Medium" : "Low";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5",
        "text-[0.65rem] font-medium uppercase tracking-wide",
        style
      )}
      title={`${label} confidence`}
    >
      {label}
    </span>
  );
}

function Metric({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 text-[0.65rem] uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-0.5 font-mono text-[0.8rem] tabular-nums text-foreground">
        {value}
      </div>
      {hint && (
        <div className="mt-0.5 text-[0.65rem] text-muted-foreground">
          {hint}
        </div>
      )}
    </div>
  );
}

function formatMs(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}
