import { Cpu, Database, FileText, Layers, Lock, Zap } from "lucide-react";

const STACK = [
  { icon: Database, title: "Postgres + pgvector" },
  { icon: Cpu, title: "Ollama streaming" },
  { icon: FileText, title: "PDF source viewer" },
  { icon: Layers, title: "Next.js 16 App Router" },
  { icon: Zap, title: "SSE token stream" },
  { icon: Lock, title: "NextAuth sessions" },
] as const;

export function TechStackSection() {
  return (
    <section id="stack" className="w-full scroll-mt-20 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-[0.75rem] font-medium uppercase tracking-wide text-muted-foreground">
          Stack
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
          Built for demos and portfolios
        </h2>
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {STACK.map((item) => (
            <li
              key={item.title}
              className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-3 px-3 py-1.5 text-[0.78rem] text-muted-foreground"
            >
              <item.icon className="size-3.5 text-brand" />
              {item.title}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
