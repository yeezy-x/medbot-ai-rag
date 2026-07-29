import {
  BookMarked,
  MessageSquareText,
  Search,
  Sparkles,
} from "lucide-react";

const STEPS = [
  {
    icon: MessageSquareText,
    title: "Ask",
    body: "Type a clinical question in plain language.",
  },
  {
    icon: Search,
    title: "Retrieve",
    body: "pgvector finds the closest encyclopedia chunks.",
  },
  {
    icon: BookMarked,
    title: "Cite",
    body: "Answers include numbered sources and page refs.",
  },
  {
    icon: Sparkles,
    title: "Verify",
    body: "Open the PDF or inspect retrieval in dev mode.",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="w-full scroll-mt-20 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-[0.75rem] font-medium uppercase tracking-wide text-muted-foreground">
          How it works
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
          Retrieve first, generate second
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-[0.875rem] leading-relaxed text-muted-foreground">
          A classic RAG loop so responses stay tied to real pages in your knowledge
          base.
        </p>

        <ol className="mt-10 grid gap-3 sm:grid-cols-2">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="rounded-xl border border-border-subtle bg-surface-3 p-4 text-left"
            >
              <span className="text-[0.65rem] font-mono text-brand">
                {String(index + 1).padStart(2, "0")}
              </span>
              <step.icon className="mt-2 size-4 text-brand" />
              <h3 className="mt-2 text-[0.9rem] font-semibold">{step.title}</h3>
              <p className="mt-1 text-[0.8rem] leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
