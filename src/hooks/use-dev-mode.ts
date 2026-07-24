"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "medbot:dev-mode";
const EVENT_NAME = "medbot:dev-mode-change";

/**
 * Cross-tab, localStorage-backed developer-mode flag.
 * Also exposed to tests / other components via a CustomEvent bus.
 */
export function useDevMode(): [boolean, (next?: boolean) => void] {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Initial read — deferred to a microtask so the effect body doesn't
    // synchronously call setState.
    queueMicrotask(() => {
      try {
        setEnabled(window.localStorage.getItem(STORAGE_KEY) === "1");
      } catch {
        /* SSR / private mode */
      }
    });
    // React to changes from other components / tabs
    function onChange(e: Event) {
      const detail = (e as CustomEvent<boolean>).detail;
      if (typeof detail === "boolean") setEnabled(detail);
    }
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) setEnabled(e.newValue === "1");
    }
    window.addEventListener(EVENT_NAME, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(EVENT_NAME, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const set = useCallback((next?: boolean) => {
    const value =
      typeof next === "boolean"
        ? next
        : !(window.localStorage.getItem(STORAGE_KEY) === "1");
    try {
      window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
    } catch {
      /* noop */
    }
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: value }));
    setEnabled(value);
  }, []);

  return [enabled, set];
}
