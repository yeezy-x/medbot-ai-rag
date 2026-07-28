"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Minus,
  Plus,
  X,
} from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";
import {
  clearCitationHighlights,
  highlightCitationPassage,
  scrollCitationHighlightIntoView,
} from "@/modules/chat/lib/pdf-citation-highlight";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Load the worker that exactly matches the pdf.js API version react-pdf
// bundles internally (`pdfjs.version`). Resolving the worker from a local
// `pdfjs-dist` import can silently pick up a *different* hoisted copy than
// the one react-pdf uses internally, producing:
//   "The API version 'X' does not match the Worker version 'Y'."
// Pinning to `pdfjs.version` via CDN avoids the mismatch regardless of how
// npm resolves/hoists the two copies.
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface SourceViewerProps {
  documentId: string;
  initialPage: number;
  sourceTitle: string;
  highlightChunkId?: string;
  onClose: () => void;
}

interface ChunkHighlight {
  content: string;
  pageNumber: number;
}

const MIN_SCALE = 0.6;
const MAX_SCALE = 2.4;
const SCALE_STEP = 0.15;

export function SourceViewer({
  documentId,
  initialPage,
  sourceTitle,
  highlightChunkId,
  onClose,
}: SourceViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [page, setPage] = useState(initialPage || 1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chunkHighlight, setChunkHighlight] = useState<ChunkHighlight | null>(
    null
  );
  const [highlightApplied, setHighlightApplied] = useState(false);
  const pageInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageWrapRef = useRef<HTMLDivElement>(null);

  const src = useMemo(() => `/api/documents/${documentId}`, [documentId]);

  useEffect(() => {
    if (!highlightChunkId) {
      setChunkHighlight(null);
      setHighlightApplied(false);
      return;
    }
    let cancelled = false;
    setHighlightApplied(false);
    fetch(`/api/chunks/${highlightChunkId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Chunk fetch failed");
        return res.json() as Promise<{
          success: boolean;
          data: { content: string; pageNumber: number | null };
        }>;
      })
      .then((json) => {
        if (cancelled || !json.success) return;
        setChunkHighlight({
          content: json.data.content,
          pageNumber: json.data.pageNumber ?? initialPage,
        });
      })
      .catch(() => {
        if (!cancelled) setChunkHighlight(null);
      });
    return () => {
      cancelled = true;
    };
  }, [highlightChunkId, initialPage]);

  const applyCitationHighlight = useCallback(() => {
    const wrap = pageWrapRef.current;
    if (!wrap || !chunkHighlight) return;
    if (page !== chunkHighlight.pageNumber) {
      clearCitationHighlights(wrap);
      setHighlightApplied(false);
      return;
    }
    const ok = highlightCitationPassage(wrap, chunkHighlight.content);
    setHighlightApplied(ok);
    if (ok) {
      scrollCitationHighlightIntoView(wrap, containerRef.current);
    }
  }, [chunkHighlight, page]);

  // Whenever a new citation is opened, jump to the new page.
  useEffect(() => {
    if (initialPage) queueMicrotask(() => setPage(initialPage));
  }, [initialPage, documentId, highlightChunkId]);

  useEffect(() => {
    applyCitationHighlight();
  }, [applyCitationHighlight, scale, loading]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        setPage((p) => Math.max(1, p - 1));
      } else if (e.key === "ArrowRight") {
        setPage((p) => (numPages ? Math.min(numPages, p + 1) : p));
      } else if ((e.metaKey || e.ctrlKey) && (e.key === "+" || e.key === "=")) {
        e.preventDefault();
        setScale((s) => Math.min(MAX_SCALE, s + SCALE_STEP));
      } else if ((e.metaKey || e.ctrlKey) && e.key === "-") {
        e.preventDefault();
        setScale((s) => Math.max(MIN_SCALE, s - SCALE_STEP));
      } else if ((e.metaKey || e.ctrlKey) && e.key === "0") {
        e.preventDefault();
        setScale(1.0);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [numPages]);

  return (
    <div
      className="flex h-full min-w-0 flex-col bg-surface-2"
      data-testid="source-viewer"
    >
      {/* Header */}
      <header className="flex items-center justify-between gap-3 border-b border-border-subtle px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex size-6 shrink-0 items-center justify-center rounded-md border border-brand/30 bg-brand-muted text-brand">
            <FileText className="size-3.5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0 leading-tight">
            <div className="truncate text-[0.85rem] font-semibold" title={sourceTitle}>
              {sourceTitle}
            </div>
            <div className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">
              PDF · source viewer
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open in new tab"
            title="Open in new tab"
            className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground [&_svg]:size-4"
          >
            <ExternalLink />
          </a>
          <a
            href={src}
            download
            aria-label="Download PDF"
            title="Download PDF"
            className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground [&_svg]:size-4"
          >
            <Download />
          </a>
          <IconButton
            size="sm"
            label="Close viewer"
            onClick={onClose}
            data-testid="source-viewer-close"
          >
            <X />
          </IconButton>
        </div>
      </header>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 border-b border-border-subtle px-4 py-2 text-[0.8rem]">
        <div className="flex items-center gap-1">
          <IconButton
            size="sm"
            label="Previous page"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            data-testid="source-viewer-prev-page"
          >
            <ChevronLeft />
          </IconButton>
          <div className="flex items-center gap-1 text-muted-foreground">
            <input
              ref={pageInputRef}
              type="number"
              min={1}
              max={numPages ?? undefined}
              value={page}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (!Number.isNaN(v)) setPage(Math.max(1, Math.min(numPages ?? v, v)));
              }}
              className={cn(
                "w-12 rounded-md border border-border-subtle bg-surface-3 px-1 py-0.5",
                "text-center font-mono text-[0.75rem] tabular-nums text-foreground",
                "focus:outline-none focus:border-brand/60"
              )}
              aria-label="Current page"
              data-testid="source-viewer-page-input"
            />
            <span className="text-[0.75rem]">/ {numPages ?? "…"}</span>
          </div>
          <IconButton
            size="sm"
            label="Next page"
            onClick={() =>
              setPage((p) => (numPages ? Math.min(numPages, p + 1) : p))
            }
            disabled={numPages ? page >= numPages : true}
            data-testid="source-viewer-next-page"
          >
            <ChevronRight />
          </IconButton>
        </div>

        <div className="flex items-center gap-1">
          <IconButton
            size="sm"
            label="Zoom out"
            onClick={() => setScale((s) => Math.max(MIN_SCALE, s - SCALE_STEP))}
            disabled={scale <= MIN_SCALE}
          >
            <Minus />
          </IconButton>
          <button
            type="button"
            onClick={() => setScale(1.0)}
            className="rounded-md border border-border-subtle bg-surface-3 px-2 py-0.5 font-mono text-[0.7rem] tabular-nums text-muted-foreground hover:text-foreground"
            aria-label="Reset zoom"
          >
            {Math.round(scale * 100)}%
          </button>
          <IconButton
            size="sm"
            label="Zoom in"
            onClick={() => setScale((s) => Math.min(MAX_SCALE, s + SCALE_STEP))}
            disabled={scale >= MAX_SCALE}
          >
            <Plus />
          </IconButton>
        </div>
      </div>

      {chunkHighlight && page === chunkHighlight.pageNumber && (
        <div
          className="border-b border-brand/25 bg-brand-muted/40 px-4 py-2 text-[0.75rem] text-muted-foreground"
          data-testid="citation-highlight-banner"
        >
          <span className="font-medium text-brand">
            {highlightApplied ? "Citation highlighted" : "Locating citation on this page…"}
          </span>
          <span className="mx-2 text-border-strong" aria-hidden>
            ·
          </span>
          <span className="line-clamp-2">{chunkHighlight.content}</span>
        </div>
      )}

      {/* Document */}
      <div
        ref={containerRef}
        className="relative flex-1 overflow-auto bg-[color-mix(in_oklch,var(--surface-2),black_15%)] p-4"
      >
        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            <span className="text-[0.85rem]">Loading document…</span>
          </div>
        )}
        {error && (
          <div className="mx-auto mt-10 max-w-sm rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-center text-[0.85rem] text-destructive">
            {error}
          </div>
        )}
        <Document
          file={src}
          onLoadStart={() => {
            setLoading(true);
            setError(null);
          }}
          onLoadSuccess={({ numPages: total }) => {
            setNumPages(total);
            setLoading(false);
            setError(null);
          }}
          onLoadError={(err) => {
            setLoading(false);
            setError(err?.message || "Couldn't load the PDF.");
          }}
          loading=""
          className="flex justify-center"
        >
          <div ref={pageWrapRef} className="relative">
            <Page
              pageNumber={page}
              scale={scale}
              renderTextLayer
              renderAnnotationLayer={false}
              loading=""
              onRenderTextLayerSuccess={applyCitationHighlight}
              className={cn(
                "shadow-2xl shadow-black/40",
                "[&_.react-pdf__Page__canvas]:rounded-md",
                "[&_.react-pdf__Page__canvas]:ring-1",
                "[&_.react-pdf__Page__canvas]:ring-border-subtle",
                chunkHighlight &&
                  page === chunkHighlight.pageNumber &&
                  highlightApplied &&
                  "[&_.react-pdf__Page__canvas]:ring-2 [&_.react-pdf__Page__canvas]:ring-brand/50"
              )}
            />
          </div>
        </Document>
      </div>
    </div>
  );
}