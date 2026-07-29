"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "medbot:prompt-history";
const MAX_ITEMS = 20;

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

function write(items: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
}

export function usePromptHistory() {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    setHistory(read());
  }, []);

  const push = useCallback((prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed) return;
    setHistory((prev) => {
      const next = [trimmed, ...prev.filter((p) => p !== trimmed)].slice(
        0,
        MAX_ITEMS
      );
      write(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    write([]);
    setHistory([]);
  }, []);

  return { history, push, clear };
}
