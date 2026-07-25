"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_TOP_K,
  DEFAULT_MIN_SIMILARITY_SCORE as DEFAULT_MIN_SCORE,
} from "@/modules/knowledge/constants/retrieval.constants";

const TOP_K_KEY = "medbot:retrieval-top-k";
const MIN_SCORE_KEY = "medbot:retrieval-min-score";
const EVENT_NAME = "medbot:retrieval-settings-change";

interface RetrievalSettings {
  topK: number;
  minScore: number;
}

/**
 * Cross-tab, localStorage-backed retrieval overrides (Settings page).
 * Values shown always fall back to the same defaults the backend uses
 * (DEFAULT_TOP_K / DEFAULT_MIN_SIMILARITY_SCORE) so the slider position
 * matches server behavior until the user explicitly changes it — at which
 * point the explicit value is sent with every request.
 */
export function useRetrievalSettings(): [
  RetrievalSettings,
  (next: Partial<RetrievalSettings>) => void,
] {
  const [settings, setSettings] = useState<RetrievalSettings>({
    topK: DEFAULT_TOP_K,
    minScore: DEFAULT_MIN_SCORE,
  });

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const storedTopK = window.localStorage.getItem(TOP_K_KEY);
        const storedMinScore = window.localStorage.getItem(MIN_SCORE_KEY);
        setSettings({
          topK: storedTopK ? Number(storedTopK) : DEFAULT_TOP_K,
          minScore: storedMinScore ? Number(storedMinScore) : DEFAULT_MIN_SCORE,
        });
      } catch {
        /* SSR / private mode */
      }
    });

    function onChange(e: Event) {
      const detail = (e as CustomEvent<RetrievalSettings>).detail;
      if (detail) setSettings(detail);
    }
    function onStorage(e: StorageEvent) {
      if (e.key === TOP_K_KEY || e.key === MIN_SCORE_KEY) {
        try {
          setSettings({
            topK: Number(window.localStorage.getItem(TOP_K_KEY) ?? DEFAULT_TOP_K),
            minScore: Number(
              window.localStorage.getItem(MIN_SCORE_KEY) ?? DEFAULT_MIN_SCORE
            ),
          });
        } catch {
          /* noop */
        }
      }
    }
    window.addEventListener(EVENT_NAME, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(EVENT_NAME, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const update = useCallback((next: Partial<RetrievalSettings>) => {
    setSettings((prev) => {
      const merged = { ...prev, ...next };
      try {
        window.localStorage.setItem(TOP_K_KEY, String(merged.topK));
        window.localStorage.setItem(MIN_SCORE_KEY, String(merged.minScore));
      } catch {
        /* noop */
      }
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: merged }));
      return merged;
    });
  }, []);

  return [settings, update];
}