"use client";

import { useState } from "react";
import { Lightbulb } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const SUGGESTIONS: { title: string; prompt: string }[] = [
  {
    title: "Diagnose",
    prompt: "How is hypertension diagnosed and treated?",
  },
  {
    title: "Treatments",
    prompt: "What are the causes and treatment of kidney failure?",
  },
  {
    title: "Compare",
    prompt: "What is the difference between Type 1 and Type 2 diabetes?",
  },
  {
    title: "Emergencies",
    prompt: "What is myocardial infarction and how is it treated?",
  },
];

function dispatchSuggest(prompt: string) {
  window.dispatchEvent(new CustomEvent("medbot:suggest", { detail: prompt }));
  const ta = document.querySelector<HTMLTextAreaElement>(
    "[data-testid='message-input-textarea']"
  );
  if (ta) {
    ta.focus();
  }
}

/** Mobile-only bottom sheet for starter prompts (F12). */
export function SuggestionBottomSheet() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="fixed bottom-24 left-1/2 z-20 h-11 -translate-x-1/2 gap-2 rounded-full border-border-strong bg-surface-3 px-4 shadow-lg md:hidden"
          data-testid="suggestion-bottom-sheet-trigger"
        >
          <Lightbulb className="size-4 text-brand" />
          Suggestions
        </Button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="max-h-[70vh] rounded-t-2xl border-border-subtle bg-surface-3 p-0"
        data-testid="suggestion-bottom-sheet"
      >
        <SheetTitle className="px-4 pt-4 text-[0.95rem] font-semibold">
          Try asking
        </SheetTitle>
        <ul className="space-y-2 overflow-y-auto p-4 pb-8">
          {SUGGESTIONS.map((s) => (
            <li key={s.title}>
              <button
                type="button"
                className={cn(
                  "flex w-full min-h-11 flex-col rounded-xl border border-border-subtle",
                  "bg-surface-2 px-4 py-3 text-left active:bg-muted"
                )}
                onClick={() => {
                  dispatchSuggest(s.prompt);
                  setOpen(false);
                }}
                data-testid={`mobile-suggestion-${s.title.toLowerCase()}`}
              >
                <span className="text-[0.7rem] font-medium uppercase tracking-wide text-muted-foreground">
                  {s.title}
                </span>
                <span className="mt-0.5 text-[0.85rem] text-foreground">
                  {s.prompt}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
