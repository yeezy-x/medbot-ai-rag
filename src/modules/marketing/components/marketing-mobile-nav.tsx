"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useState } from "react";

import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { IconButton } from "@/components/ui/icon-button";

const NAV = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#preview", label: "Preview" },
  { href: "#stack", label: "Stack" },
] as const;

export function MarketingMobileNav({ signedIn }: { signedIn: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <IconButton
          size="md"
          label="Open menu"
          className="md:hidden"
          data-testid="marketing-mobile-menu"
        >
          <Menu />
        </IconButton>
      </SheetTrigger>
      <SheetContent side="right" className="border-border-subtle bg-surface-3">
        <SheetTitle className="text-left text-[1rem] font-semibold">Menu</SheetTitle>
        <nav className="mt-6 flex flex-col gap-1" aria-label="Mobile">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-[0.9rem] text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          <div className="my-3 h-px bg-border-subtle" />
          {signedIn ? (
            <>
              <Link
                href={siteConfig.links.dashboard}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-[0.9rem]"
              >
                Dashboard
              </Link>
              <Button asChild className="mt-2 w-full">
                <Link href={siteConfig.links.chat} onClick={() => setOpen(false)}>
                  Open chat
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="outline" className="w-full">
                <Link href={siteConfig.links.login} onClick={() => setOpen(false)}>
                  Sign in
                </Link>
              </Button>
              <Button asChild className="mt-2 w-full">
                <Link href={siteConfig.links.register} onClick={() => setOpen(false)}>
                  Start
                </Link>
              </Button>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
