"use client";

import { Toaster } from "sonner";
import { useTheme } from "@/hooks/use-theme";

export function ThemedToaster() {
  const [theme] = useTheme();
  return (
    <Toaster
      theme={theme}
      position="bottom-right"
      toastOptions={{
        style: {
          background: "var(--surface-3)",
          border: "1px solid var(--border-subtle)",
          color: "var(--foreground)",
        },
      }}
    />
  );
}