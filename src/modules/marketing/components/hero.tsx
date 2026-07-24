import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Cpu,
  Database,
  ShieldCheck,
  Sparkles,
  Quote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Ambient grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid opacity-40 mask-[radial-gradient(ellipse_at_top,black_10%,transparent_60%)]"
      />

      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 pb-16 pt-20 text-center sm:px-6 sm:pt-28">
        {/* Eyebrow chip */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-3 px-3 py-1 text-[0.7rem] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-brand" />
          <span>Grounded in the Gale Encyclopedia of Medicine</span>
        </div>

        <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
          Medical answers you can{" "}
          <span className="relative inline-block">
            <span className="relative z-10 text-foreground">actually cite.</span>
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-1 z-0 h-2 rounded-full bg-brand-muted"
            />
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-balance text-[0.975rem] leading-relaxed text-muted-foreground sm:text-[1.05rem]">
          A retrieval-augmented assistant over medical literature. Every response
          is grounded in indexed sources, with page-level citations and no hallucinated claims.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-10 gap-2 px-4" data-testid="hero-cta-primary">
            <Link href="/register">
              Start free
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-10 gap-2 px-4"
            data-testid="hero-cta-secondary"
          >
            <Link href="/login">
              Sign in
              <span className="ml-1 hidden items-center gap-1 sm:flex">
                <Kbd>⌘</Kbd>
                <Kbd>L</Kbd>
              </span>
            </Link>
          </Button>
        </div>

        {/* Tech chips */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2 text-[0.7rem]">
          <TechChip icon={<Database className="size-3" />} label="Postgres · pgvector" />
          <TechChip icon={<Cpu className="size-3" />} label="Local Ollama" />
          <TechChip icon={<BookOpen className="size-3" />} label="Cited answers" />
          <TechChip icon={<ShieldCheck className="size-3" />} label="Grounded RAG" />
        </div>

        {/* Answer preview card */}
        <AnswerPreview />
      </div>
    </section>
  );
}

function TechChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border-subtle bg-surface-3 px-2.5 py-1 text-muted-foreground">
      {icon}
      {label}
    </span>
  );
}

function AnswerPreview() {
  return (
    <div className="relative mt-16 w-full max-w-3xl">
      <div className="absolute -inset-x-6 -inset-y-4 rounded-3xl bg-linear-to-b from-transparent via-brand-muted to-transparent opacity-40 blur-2xl" />
      <div className="relative rounded-2xl border border-border-subtle bg-surface-3 p-5 text-left shadow-2xl shadow-black/30">
        <div className="flex items-center gap-2 border-b border-border-subtle pb-3 text-[0.75rem] text-muted-foreground">
          <Sparkles className="size-3.5 text-brand" />
          <span className="font-medium text-foreground">MedBot</span>
          <span>·</span>
          <span>Answering: &ldquo;How is hypertension diagnosed?&rdquo;</span>
        </div>
        <div className="pt-4 text-[0.925rem] leading-relaxed text-foreground">
          Hypertension is diagnosed by measuring blood pressure on two or more separate
          occasions. Persistent readings ≥ 130/80 mmHg typically indicate stage 1
          hypertension. Home monitoring and ambulatory readings help rule out
          white-coat effect.
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
