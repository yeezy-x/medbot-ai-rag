"use client";

import Link from "next/link";
import {
  ActivitySquare,
  HeartPulse,
  Pill,
  Stethoscope,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  userName?: string;
}

const SUGGESTIONS: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  prompt: string;
}[] = [
  {
    icon: HeartPulse,
    title: "Diagnose",
    prompt: "How is hypertension diagnosed and treated?",
  },
  {
    icon: Pill,
    title: "Treatments",
    prompt: "What are the causes and treatment of kidney failure?",
  },
  {
    icon: Stethoscope,
    title: "Compare",
    prompt: "What is the difference between Type 1 and Type 2 diabetes?",
  },
  {
    icon: ActivitySquare,
    title: "Emergencies",
    prompt: "What is myocardial infarction and how is it treated?",
  },
];

export function EmptyState({ userName = "there" }: EmptyStateProps) {
  const firstName = userName.split(" ")[0];

  return (
    <div className="relative flex h-full items-center justify-center px-4 sm:px-6 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid opacity-30 mask-[radial-gradient(ellipse_at_center,black_10%,transparent_60%)]"
      />
      <div className="relative w-full max-w-3xl">
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl border border-brand/30 bg-brand-muted text-brand shadow-sm">
            <Sparkles className="size-5" strokeWidth={2.2} />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Hello {firstName}
          </h1>
          <p className="mt-3 max-w-md text-[0.925rem] text-muted-foreground">
            A retrieval-augmented medical assistant, grounded in the{" "}
            <span className="text-foreground">Gale Encyclopedia of Medicine</span>.
            Every answer is cited.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {SUGGESTIONS.map((s) => (
            <SuggestionCard key={s.title} {...s} />
          ))}
        </div>

        <p className="mt-8 text-center text-[0.7rem] text-muted-foreground">
          <Link
            href="/dashboard"
            className="underline decoration-border-strong underline-offset-2 hover:text-foreground"
          >
            Or browse your dashboard →
          </Link>
        </p>
      </div>
    </div>
  );
}

function SuggestionCard({
  icon: Icon,
  title,
  prompt,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  prompt: string;
}) {
  return (
    <button
      type="button"
      onClick={() => {
        // Prefill via CustomEvent — the composer picks this up.
        window.dispatchEvent(
          new CustomEvent("medbot:suggest", { detail: prompt })
        );
        // Also focus the composer textarea.
        const ta = document.querySelector<HTMLTextAreaElement>(
          "[data-testid='message-input-textarea']"
        );
        if (ta) {
          ta.value = prompt;
          ta.dispatchEvent(new Event("input", { bubbles: true }));
          ta.focus();
        }
      }}
      className={cn(
        "group flex items-start gap-3 rounded-xl border border-border-subtle",
        "bg-surface-3 p-4 text-left",
        "transition-all duration-150",
        "hover:border-border-strong hover:bg-[color-mix(in_oklch,var(--brand),var(--surface-3)_92%)]"
      )}
      data-testid={`empty-state-suggestion-${title.toLowerCase()}`}
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-surface-2 text-muted-foreground transition-colors group-hover:border-brand/40 group-hover:text-brand">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[0.75rem] font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </div>
        <div className="mt-0.5 text-[0.875rem] text-foreground">{prompt}</div>
      </div>
    </button>
  );
}
