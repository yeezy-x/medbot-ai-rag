import * as React from "react";
import { cn } from "@/lib/utils";

interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export function Kbd({ children, className, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-md",
        "border border-border-subtle bg-surface-3 px-1.5",
        "font-mono text-[0.6875rem] font-medium text-muted-foreground",
        "leading-none",
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}
