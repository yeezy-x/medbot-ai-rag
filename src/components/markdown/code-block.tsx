"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { IconButton } from "@/components/ui/icon-button";

interface CodeBlockProps {
  language: string;
  code: string;
  children: React.ReactNode;
}

/**
 * Terminal-style code block with a header showing the language and a copy
 * affordance. The `children` prop is the already-highlighted (rehype-highlight)
 * <code> node so we preserve syntax colours.
 */
export function CodeBlock({ language, code, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1400);
    return () => clearTimeout(t);
  }, [copied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      /* noop */
    }
  }

  return (
    <div className="my-4 overflow-hidden rounded-lg border border-border-subtle bg-surface-3">
      <div className="flex items-center justify-between border-b border-border-subtle bg-[color-mix(in_oklch,var(--surface-3),black_15%)] px-3 py-1.5">
        <span className="font-mono text-[0.7rem] uppercase tracking-wide text-muted-foreground">
          {language || "text"}
        </span>
        <IconButton
          size="xs"
          label={copied ? "Copied" : "Copy code"}
          onClick={handleCopy}
          className="text-muted-foreground"
        >
          {copied ? <Check /> : <Copy />}
        </IconButton>
      </div>
      <pre className="overflow-x-auto p-4 text-[0.85rem] leading-relaxed">
        {children}
      </pre>
    </div>
  );
}
