"use client";

import { type RefObject, useEffect, useRef } from "react";

/**
 * Scrolls to the bottom when `dependency` changes. Prefer `scrollContainerRef`
 * (the overflow-y-auto element) so flex layouts don't clip the last messages.
 * The returned sentinel ref is a fallback when no container ref is passed.
 */
export function useAutoScroll<T>(
  dependency: T,
  scrollContainerRef?: RefObject<HTMLElement | null>,
  behavior: ScrollBehavior = "auto"
) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerRef?.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior });
      return;
    }
    sentinelRef.current?.scrollIntoView({ behavior, block: "end" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dependency, behavior]);

  return sentinelRef;
}
