"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { SidebarContent } from "./chat-sidebar";

interface MobileSidebarProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

/**
 * Mobile-only entry point into the chat sidebar. Below `md` the persistent
 * `<Sidebar>` is CSS-hidden (`hidden md:flex`) with no other way to reach
 * chat search, history, rename/delete, or the dev-mode toggle — this fills
 * that gap with a left-side drawer, reusing the exact same `SidebarContent`
 * the desktop sidebar renders so the two never drift apart.
 */
export function MobileSidebar({
  user,
}: {
  user: MobileSidebarProps["user"];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open chat menu"
        data-testid="mobile-sidebar-trigger"
        className="flex md:hidden size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-surface-3 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <Menu className="size-4" />
      </button>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="w-72 max-w-[85vw] gap-0 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground sm:max-w-xs"
        data-testid="mobile-sidebar-sheet"
      >
        {/* Visually hidden but required by Radix Dialog for a11y — the
            Sheet itself has no visible header/title in this drawer. */}
        <SheetTitle className="sr-only">Chats</SheetTitle>
        <SidebarContent user={user} onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}