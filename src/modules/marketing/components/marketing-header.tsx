import Link from "next/link";

import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { LogoWordmark } from "@/components/marketing/logo-wordmark";
import { MarketingMobileNav } from "@/modules/marketing/components/marketing-mobile-nav";

const NAV = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#preview", label: "Preview" },
  { href: "#stack", label: "Stack" },
] as const;

export async function MarketingHeader() {
  const { isAuthenticated } = await auth();
  const signedIn = Boolean(isAuthenticated);

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="shrink-0" data-testid="marketing-header-logo">
          <LogoWordmark />
        </Link>

        <nav
          className="hidden items-center justify-center gap-1 md:flex"
          aria-label="Primary"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-1.5 text-[0.8rem] text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {signedIn ? (
            <>
              <Link
                href={siteConfig.links.dashboard}
                className="hidden text-[0.8rem] text-muted-foreground hover:text-foreground sm:inline"
              >
                Dashboard
              </Link>
              <Button asChild size="sm" className="hidden sm:inline-flex" data-testid="marketing-header-chat">
                <Link href={siteConfig.links.chat}>Open chat</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex" data-testid="marketing-header-sign-in">
                <Link href={siteConfig.links.login}>Sign in</Link>
              </Button>
              <Button asChild size="sm" data-testid="marketing-header-start">
                <Link href={siteConfig.links.register}>Start</Link>
              </Button>
            </>
          )}
          <MarketingMobileNav signedIn={signedIn} />
        </div>
      </div>
    </header>
  );
}
