import { Quote, Sparkles } from "lucide-react";

export function AnswerPreview() {
  return (
    <div className="w-full text-left" data-testid="marketing-answer-preview">
      <div className="rounded-2xl border border-border-subtle bg-surface-3 p-5 shadow-xl shadow-black/20">
        <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle pb-3 text-[0.75rem] text-muted-foreground">
          <Sparkles className="size-3.5 text-brand" />
          <span className="font-medium text-foreground">MedBot</span>
          <span>·</span>
          <span>Answering: &ldquo;How is hypertension diagnosed?&rdquo;</span>
        </div>
        <div className="pt-4 text-[0.925rem] leading-relaxed text-foreground">
          Hypertension is diagnosed by measuring blood pressure on two or more
          separate occasions. Persistent readings ≥ 130/80 mmHg typically indicate
          stage 1 hypertension. Home monitoring and ambulatory readings help rule
          out white-coat effect.
        </div>
        <div className="mt-4 flex items-center gap-2 text-[0.7rem] uppercase tracking-wide text-muted-foreground">
          <Quote className="size-3" />
          Sources · 3
        </div>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {[
            { title: "Gale Encyclopedia of Medicine", page: 1421 },
            { title: "Gale Encyclopedia of Medicine", page: 1425 },
            { title: "Gale Encyclopedia of Medicine", page: 1430 },
          ].map((c, i) => (
            <div
              key={i}
              className="flex items-start gap-2 rounded-lg border border-border-subtle bg-surface-2 p-2.5"
            >
              <span className="flex size-5 items-center justify-center rounded border border-border-subtle bg-surface-3 font-mono text-[0.65rem] text-muted-foreground">
                {i + 1}
              </span>
              <div className="min-w-0">
                <div className="truncate text-[0.75rem] font-medium">{c.title}</div>
                <div className="text-[0.7rem] text-muted-foreground">
                  Page {c.page}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
