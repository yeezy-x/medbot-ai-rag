"use client";

import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { ArrowUp, Square } from "lucide-react";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

const MIN_HEIGHT = 48;
const MAX_HEIGHT = 200;
const HARD_LIMIT = 5000;

interface MessageInputProps {
  onSend(message: string): void;
  onStop?(): void;
  isStreaming?: boolean;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

export function MessageInput({
  onSend,
  onStop,
  isStreaming,
  disabled,
  placeholder = "Ask a medical question…",
  autoFocus,
}: MessageInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(
      Math.max(el.scrollHeight, MIN_HEIGHT),
      MAX_HEIGHT
    )}px`;
  }, [value]);

  // Empty state suggestion cards fire a custom event to prefill the composer.
  useEffect(() => {
    function onSuggest(e: Event) {
      const detail = (e as CustomEvent<string>).detail;
      if (typeof detail === "string") setValue(detail);
      textareaRef.current?.focus();
    }
    window.addEventListener("medbot:suggest", onSuggest);
    return () => window.removeEventListener("medbot:suggest", onSuggest);
  }, []);

  const trimmed = value.trim();
  const canSend = trimmed.length > 0 && !isStreaming && !disabled;

  function submit() {
    if (isStreaming && onStop) {
      onStop();
      return;
    }
    if (!canSend) return;
    const toSend = trimmed;
    setValue("");
    onSend(toSend);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="border-t border-border-subtle bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/70">
      <div className="mx-auto w-full px-6 sm:px-10 py-4">
        <div
          className={cn(
            "relative rounded-2xl border border-border-strong bg-surface-3",
            "shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset,0_10px_30px_-15px_rgba(0,0,0,0.5)]",
            "transition-colors duration-150",
            "focus-within:border-brand/60"
          )}
          data-testid="message-input-container"
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value.slice(0, HARD_LIMIT))}
            onKeyDown={handleKeyDown}
            placeholder={isStreaming ? "MedBot is answering…" : placeholder}
            disabled={disabled}
            rows={1}
            aria-label="Message"
            data-testid="message-input-textarea"
            className={cn(
              "w-full resize-none bg-transparent",
              "px-4 pt-3.5 pb-11",
              "text-[0.925rem] leading-relaxed text-foreground",
              "placeholder:text-muted-foreground/70",
              "focus:outline-none",
              "min-h-12 max-h-50",
              isStreaming && "opacity-60"
            )}
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between px-3 pb-2">
            <div className="pointer-events-auto flex items-center gap-2 text-[0.7rem] text-muted-foreground">
              {isStreaming ? (
                <span className="flex items-center gap-1 text-brand">
                  <Kbd className="border-brand/30 bg-brand-muted text-brand">
                    Esc
                  </Kbd>
                  <span>to stop</span>
                </span>
              ) : (
                <>
                  <span className="flex items-center gap-1">
                    <Kbd>⏎</Kbd>
                    <span>send</span>
                  </span>
                  <span aria-hidden className="text-border-strong">
                    ·
                  </span>
                  <span className="flex items-center gap-1">
                    <Kbd>⇧</Kbd>
                    <Kbd>⏎</Kbd>
                    <span>new line</span>
                  </span>
                </>
              )}
              <span
                aria-hidden
                className={cn(
                  "ml-2 text-[0.7rem] tabular-nums",
                  trimmed.length > HARD_LIMIT * 0.85 && "text-destructive"
                )}
              >
                {trimmed.length > 0 && `${trimmed.length}/${HARD_LIMIT}`}
              </span>
            </div>

            {isStreaming ? (
              <button
                type="button"
                onClick={onStop}
                aria-label="Stop generating"
                data-testid="message-input-stop-button"
                className={cn(
                  "pointer-events-auto flex size-7 items-center justify-center rounded-md",
                  "border border-brand/40 bg-brand-muted text-brand",
                  "transition-all duration-150 hover:brightness-110 active:scale-95"
                )}
              >
                <Square className="size-3" strokeWidth={2.4} fill="currentColor" />
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={!canSend}
                aria-label="Send message"
                data-testid="message-input-send-button"
                className={cn(
                  "pointer-events-auto flex size-7 items-center justify-center rounded-md",
                  "transition-all duration-150",
                  canSend
                    ? "bg-brand text-brand-foreground hover:brightness-110 active:scale-95"
                    : "bg-muted text-muted-foreground",
                  "disabled:cursor-not-allowed"
                )}
              >
                <ArrowUp className="size-3.5" strokeWidth={2.4} />
              </button>
            )}
          </div>
        </div>
        <p className="mt-2 text-center text-[0.7rem] text-muted-foreground">
          MedBot cites the Gale Encyclopedia. Always verify with a licensed
          clinician.
        </p>
      </div>
    </div>
  );
}