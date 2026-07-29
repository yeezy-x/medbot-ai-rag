import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export function LandingCta() {
  return (
    <section className="w-full px-4 pb-20 pt-8 text-center sm:px-6">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-balance text-xl font-semibold tracking-tight sm:text-2xl">
          Ready to chat with citations?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-[0.875rem] text-muted-foreground">
          Create an account to start, or sign in if you already have one.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="h-10 gap-2 px-5" data-testid="landing-cta-start">
            <Link href={siteConfig.links.register}>
              Start
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-10 px-5" data-testid="landing-cta-sign-in">
            <Link href={siteConfig.links.login}>Sign in</Link>
          </Button>
        </div>
        <p className="mt-10 text-[0.7rem] text-muted-foreground">
          MedBot cites the Gale Encyclopedia. Always verify with a licensed
          clinician.
        </p>
      </div>
    </section>
  );
}
