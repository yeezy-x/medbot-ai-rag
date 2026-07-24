"use client";

import { useEffect, useRef } from "react";

/**
 * Auto-scrolls a container to the bottom whenever the tracked dependency
 * changes (typically the messages array length or the latest message id).
 * The returned ref must be attached to a sentinel element inside a scrollable
 * ancestor.
 */
export function useAutoScroll<T>(dependency: T, behavior: ScrollBehavior = "smooth") {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior, block: "end" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dependency]);

  return ref;
}
