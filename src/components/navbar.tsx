import Link from "next/link";
import { Sparkles } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";

export async function Navbar() {
  const { isAuthenticated } = await auth();
  const home = isAuthenticated ? "/dashboard" : "/";

  return (
    <nav className="sticky top-0 z-40 border-b border-border-subtle bg-background/80 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href={home}
          className="group flex items-center gap-2"
          data-testid="navbar-brand"
        >
          <div className="flex size-7 items-center justify-center rounded-md bg-brand text-brand-foreground shadow-sm">
            <Sparkles className="size-4" strokeWidth={2.2} />
          </div>
          <span className="text-[0.9rem] font-semibold tracking-tight">
            MedBot
          </span>
          <span className="ml-1 hidden rounded-sm border border-border-subtle bg-surface-3 px-1.5 py-0.5 font-mono text-[0.65rem] text-muted-foreground sm:inline">
            beta
          </span>
        </Link>

        <div className="flex items-center gap-2 text-[0.85rem]">
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Dashboard
              </Link>
              <Link
                href="/chat"
                className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                Chat
              </Link>
              <UserButton />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                data-testid="navbar-login-link"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="rounded-md bg-primary px-3 py-1.5 font-medium text-primary-foreground transition-colors hover:brightness-95"
                data-testid="navbar-register-link"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
