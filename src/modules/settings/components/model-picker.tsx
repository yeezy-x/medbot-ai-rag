"use client";

import { Cpu } from "lucide-react";

export function ModelPicker() {
  return (
    <div className="flex items-center justify-between rounded-md border border-border-subtle bg-surface-2 px-3 py-2.5 opacity-60">
      <div className="flex items-center gap-2">
        <Cpu className="size-3.5 text-muted-foreground" aria-hidden />
        <span className="text-[0.82rem]">qwen2.5-coder:3b (Ollama)</span>
      </div>
      <span className="text-[0.7rem] text-muted-foreground">
        Model selection coming soon
      </span>
    </div>
  );
}
