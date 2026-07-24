"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Quote } from "lucide-react";
import type { CitationDisplay } from "../types/citation.types";
import { CitationCard } from "./citation-card";
import { cn } from "@/lib/utils";

interface CitationListProps {
  citations: CitationDisplay[];
  onOpen?: (citation: CitationDisplay) => void;
}

export function CitationList({ citations, onOpen }: CitationListProps) {
  const [expanded, setExpanded] = useState(false);

  const deduped = useMemo(() => {
    const seen = new Set<string>();
    const out: CitationDisplay[] = [];
    for (const c of citations) {
      const key = `${c.sourceTitle}::${c.pageNumber}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(c);
    }
    return out;
  }, [citations]);

  if (deduped.length === 0) return null;

  const showToggle = deduped.length > 3;
  const visible = showToggle && !expanded ? deduped.slice(0, 3) : deduped;

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">
        <Quote className="size-3" />
        <span>Sources · {deduped.length}</span>
      </div>
      <div
        className={cn(
          expanded
            ? "grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3"
            : "flex gap-2 overflow-x-auto no-scrollbar snap-x snap-mandatory"
        )}
      >
        {visible.map((citation, idx) => (
          <CitationCard
            key={citation.id}
            index={idx + 1}
            citation={citation}
            onOpen={onOpen}
            className={expanded ? "w-full" : "snap-start"}
          />
        ))}
      </div>
      {showToggle && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-2 py-1",
            "text-[0.75rem] font-medium text-muted-foreground",
            "hover:text-foreground transition-colors"
          )}
        >
          <ChevronDown
            className={cn("size-3.5 transition-transform", expanded && "rotate-180")}
          />
          {expanded ? "Collapse sources" : `Show all ${deduped.length} sources`}
        </button>
      )}
    </div>
  );
}
