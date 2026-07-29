import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { AnswerPreview } from "@/components/marketing/answer-preview";

export function Hero() {
  return (
    <section className="w-full px-4 pb-12 pt-14 text-center sm:px-6 sm:pt-20">
      <div className="mx-auto flex max-w-3xl flex-col items-center">
        <div className="mb-6 flex size-12 items-center justify-center rounded-2xl border border-brand/30 bg-brand-muted text-brand shadow-sm">
          <Sparkles className="size-5" strokeWidth={2.2} />
        </div>

        <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          Medical answers you can actually cite
        </h1>

        <p className="mt-4 max-w-md text-balance text-[0.925rem] leading-relaxed text-muted-foreground">
          A retrieval-augmented medical assistant, grounded in the{" "}
          <span className="text-foreground">Gale Encyclopedia of Medicine</span>.
          Every answer is cited.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-10 gap-2 px-5" data-testid="hero-cta-primary">
            <Link href={siteConfig.links.register}>
              Start
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-10 px-5"
            data-testid="hero-cta-secondary"
          >
            <Link href={siteConfig.links.login}>Sign in</Link>
          </Button>
        </div>

        <div id="preview" className="mt-14 w-full scroll-mt-24">
          <AnswerPreview />
        </div>
      </div>
    </section>
  );
}
