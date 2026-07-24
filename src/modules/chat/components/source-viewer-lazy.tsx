"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

/**
 * Lazy shell around `SourceViewer`. Keeps `react-pdf` + `pdfjs-dist` out of
 * the initial chat bundle — they're only pulled in the first time a user
 * opens a citation.
 */
export const LazySourceViewer = dynamic(
  () =>
    import("./source-viewer").then((mod) => ({
      default: mod.SourceViewer,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-w-0 flex-1 items-center justify-center bg-surface-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          <span className="text-[0.85rem]">Loading viewer…</span>
        </div>
      </div>
    ),
  }
);
