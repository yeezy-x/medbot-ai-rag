"use client";

import {
  useEffect,
  useRef,
} from "react";

export function useAutoScroll(
  dependency: unknown
) {
  const ref =
    useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [dependency]);

  return ref;
}