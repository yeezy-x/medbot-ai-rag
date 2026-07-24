"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type IconButtonSize = "xs" | "sm" | "md";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: IconButtonSize;
  active?: boolean;
  label: string;
}

const sizeMap: Record<IconButtonSize, string> = {
  xs: "h-6 w-6 [&_svg]:size-3.5",
  sm: "h-7 w-7 [&_svg]:size-4",
  md: "h-8 w-8 [&_svg]:size-4",
};

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ size = "sm", active, className, children, label, ...props }, ref) => {
    return (
      <button
        ref={ref}
        aria-label={label}
        title={label}
        className={cn(
          "inline-flex items-center justify-center rounded-md",
          "text-muted-foreground",
          "border border-transparent",
          "transition-colors duration-150",
          "hover:bg-muted hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
          "disabled:pointer-events-none disabled:opacity-40",
          active && "bg-muted text-foreground",
          sizeMap[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
IconButton.displayName = "IconButton";
