"use client";

import { passwordStrength } from "@/modules/auth/schemas/auth.schema";
import { cn } from "@/lib/utils";

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  const { score, label } = passwordStrength(password);
  const widths = ["w-1/5", "w-2/5", "w-3/5", "w-4/5", "w-full"] as const;
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-emerald-500",
    "bg-teal-400",
  ] as const;

  return (
    <div className="space-y-1.5" aria-live="polite">
      <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            widths[score],
            colors[score]
          )}
        />
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
