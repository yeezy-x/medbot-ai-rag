import { Sparkles } from "lucide-react";

export function LogoWordmark() {
  return (
    <div className="inline-flex items-center gap-2" data-testid="logo-wordmark">
      <div className="flex size-8 items-center justify-center rounded-lg border border-brand/30 bg-brand-muted text-brand shadow-sm">
        <Sparkles className="size-4" strokeWidth={2.2} />
      </div>
      <span className="text-[1.05rem] font-semibold tracking-tight">MedBot</span>
    </div>
  );
}
