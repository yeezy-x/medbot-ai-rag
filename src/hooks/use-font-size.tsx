"use client";

import { useCallback, useEffect, useState } from "react";

export type FontSize = "sm" | "md" | "lg";

const STORAGE_KEY = "medbot:font-size";
const EVENT_NAME = "medbot:font-size-change";
const CLASSES: Record<FontSize, string> = {
  sm: "text-scale-sm",
  md: "text-scale-md",
  lg: "text-scale-lg",
};

export function useFontSize(): [FontSize, (next: FontSize) => void] {
  const [size, setSizeState] = useState<FontSize>(() => {
    if (typeof window === "undefined") return "md";
    const root = document.documentElement;
    return (
      (Object.keys(CLASSES) as FontSize[]).find((s) =>
        root.classList.contains(CLASSES[s])
      ) ?? "md"
    );
  });

  useEffect(() => {
    function onChange(e: Event) {
      const detail = (e as CustomEvent<FontSize>).detail;
      if (detail) setSizeState(detail);
    }
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY && e.newValue && e.newValue in CLASSES) {
        applyFontSize(e.newValue as FontSize);
        setSizeState(e.newValue as FontSize);
      }
    }
    window.addEventListener(EVENT_NAME, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(EVENT_NAME, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const setSize = useCallback((next: FontSize) => {
    applyFontSize(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* noop */
    }
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: next }));
    setSizeState(next);
  }, []);

  return [size, setSize];
}

function applyFontSize(size: FontSize) {
  const root = document.documentElement;
  Object.values(CLASSES).forEach((c) => root.classList.remove(c));
  root.classList.add(CLASSES[size]);
}