import {
  ActivitySquare,
  HeartPulse,
  Pill,
  Stethoscope,
} from "lucide-react";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: HeartPulse,
    title: "Diagnose",
    detail: "How is hypertension diagnosed and treated?",
  },
  {
    icon: Pill,
    title: "Treatments",
    detail: "What are the causes and treatment of kidney failure?",
  },
  {
    icon: Stethoscope,
    title: "Compare",
    detail: "What is the difference between Type 1 and Type 2 diabetes?",
  },
  {
    icon: ActivitySquare,
    title: "Emergencies",
    detail: "What is myocardial infarction and how is it treated?",
  },
] as const;

export function FeatureStrip() {
  return (
    <section id="features" className="w-full scroll-mt-20 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-[0.75rem] font-medium uppercase tracking-wide text-muted-foreground">
          Try asking
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
          Grounded questions MedBot handles well
        </h2>
      </div>

      <div
        className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-2 sm:grid-cols-2"
        data-testid="marketing-feature-strip"
      >
        {FEATURES.map(({ icon: Icon, title, detail }) => (
          <div
            key={title}
            className={cn(
              "flex items-start gap-3 rounded-xl border border-border-subtle",
              "bg-surface-3 p-4 text-left"
            )}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-surface-2 text-muted-foreground">
              <Icon className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[0.75rem] font-medium uppercase tracking-wide text-muted-foreground">
                {title}
              </div>
              <div className="mt-0.5 text-[0.875rem] text-foreground">{detail}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
