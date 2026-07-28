"use client";

import { useCallback, useEffect, useState } from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "medbot:theme";
const EVENT_NAME = "medbot:theme-change";

/**
 * Toggles the `.dark` class already wired into globals.css (light-mode
 * tokens exist under `:root`, dark overrides under `.dark` — the app was
 * just never toggling it). A blocking inline script in the root layout
 * applies the stored value before paint to avoid a flash of the wrong theme;
 * this hook keeps subsequent client-side toggles + cross-tab sync in sync
 * with that script.
 */
function readAppliedTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function useTheme(): [Theme, (next: Theme) => void] {
  // Match <html className="dark"> on the server; sync from the inline script on the client.
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    setThemeState(readAppliedTheme());

    function onChange(e: Event) {
      const detail = (e as CustomEvent<Theme>).detail;
      if (detail) setThemeState(detail);
    }
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY && (e.newValue === "dark" || e.newValue === "light")) {
        applyTheme(e.newValue);
        setThemeState(e.newValue);
      }
    }
    window.addEventListener(EVENT_NAME, onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(EVENT_NAME, onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const setTheme = useCallback((next: Theme) => {
    applyTheme(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* noop */
    }
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: next }));
    setThemeState(next);
  }, []);

  return [theme, setTheme];
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}